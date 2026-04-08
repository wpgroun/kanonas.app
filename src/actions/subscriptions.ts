'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { requireAuth, requireSuperAdmin } from '@/lib/requireAuth'
import { getCurrentTempleId } from './core'

// ─── Subscription Expiry Warning ───────────────────────────────────────────────

export type ExpiryWarning = {
 daysLeft: number
 level: 'warning' | 'danger'
} | null

import { getSession } from '@/lib/auth'

/**
 * Returns subscription expiry warning for the current temple.
 * Used in the admin layout to show a banner before the subscription lapses.
 */
export async function getSubscriptionExpiryWarning(templeId: string): Promise<ExpiryWarning> {
 const session = await getSession()
 if (session?.isSuperAdmin) return null
 if (!templeId) return null
 try {
 const temple = await prisma.temple.findUnique({
  where: { id: templeId },
  select: { subscriptionStatus: true, subscriptionEndDate: true }
 })
 
 if (temple?.subscriptionStatus === 'trial' && temple.subscriptionEndDate) {
   const daysLeft = Math.ceil((temple.subscriptionEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
   if (daysLeft <= 0) return null // Already expired
   if (daysLeft <= 3) return { daysLeft, level: 'danger' }
   if (daysLeft <= 7) return { daysLeft, level: 'warning' }
   return null
 }

 const sub = await prisma.subscription.findFirst({
 where: { templeId, status: 'active' },
 select: { expiresAt: true, vivaOrderCode: true }
 })
 // No subscription
 if (!sub || !sub.expiresAt) return null

 const daysLeft = Math.ceil((sub.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
 if (daysLeft <= 0) return null // Already expired — handled by feature gate
 if (daysLeft <= 7) return { daysLeft, level: 'danger' }
 if (daysLeft <= 30) return { daysLeft, level: 'warning' }
 return null
 } catch {
 return null
 }
}

// ─── PUBLIC — Plan listing ─────────────────────────────────────────────────────

/** Get all active subscription plans (for the pricing page and onboarding) */
export async function getSubscriptionPlans() {
 return prisma.subscriptionPlan.findMany({
 where: { isActive: true },
 orderBy: { sortOrder: 'asc' },
 })
}

// ─── TEMPLE — Self-serve checkout ─────────────────────────────────────────────

/** Get the active subscription for the current temple */
export async function getMySubscription() {
 await requireAuth()
 const templeId = await getCurrentTempleId()

 return prisma.subscription.findFirst({
 where: { templeId, status: 'active' },
 include: { plan: true },
 })
}

/**
 * Creates a Viva Wallet Checkout Session for a temple to subscribe.
 * Returns the Smart Checkout URL.
 */
export async function createCheckoutSession(planId: string, billingCycle: 'monthly' | 'yearly') {
  const session = await requireAuth()
  const templeId = await getCurrentTempleId()

  const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } })
  if (!plan) return { success: false, error: 'Το πακέτο δεν βρέθηκε.' }
  if (plan.isMetropolis) return { success: false, error: 'Το πακέτο Μητρόπολης ενεργοποιείται μόνο χειροκίνητα.' }

  const platformSettings = await prisma.platformSettings.findUnique({ where: { id: "singleton" } })
  const vivaClientId = platformSettings?.vivaClientId || process.env.VIVA_CLIENT_ID
  const vivaClientSecret = platformSettings?.vivaClientSecret || process.env.VIVA_CLIENT_SECRET
  const vivaSourceCode = platformSettings?.vivaSourceCode || process.env.VIVA_SOURCE_CODE
  const isDemo = platformSettings?.vivaDemo ?? true

  if (!vivaClientId || !vivaClientSecret || !vivaSourceCode) {
    return { success: false, error: 'Το σύστημα πληρωμών Viva δεν έχει ρυθμιστεί.' }
  }

  const priceAmount = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly
  const amountInCents = Math.round(priceAmount * 100)

  try {
    // 1. Get OAuth2 Token
    const authString = btoa(`${vivaClientId}:${vivaClientSecret}`)
    const tokenRes = await fetch('https://accounts.vivapayments.com/connect/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${authString}`
      },
      body: 'grant_type=client_credentials'
    })

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error('[Viva] Token Error:', errText);
      throw new Error('Viva API authentication failed');
    }

    const { access_token } = await tokenRes.json()

    // 2. Create Payment Order
    const orderRes = await fetch(`${isDemo ? 'https://demo.api.vivapayments.com' : 'https://api.vivapayments.com'}/checkout/v2/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`
      },
      body: JSON.stringify({
        amount: amountInCents,
        customerTrns: `Κανόνας - ${plan.name}`,
        merchantTrns: `${templeId}-${planId}-${billingCycle}`,
        paymentTimeout: 300,
        preauth: false,
        allowRecurring: false,
        maxInstallments: 0,
        sourceCode: vivaSourceCode,
        tags: [templeId, planId, billingCycle]
      })
    })

    if (!orderRes.ok) {
      const errText = await orderRes.text();
      console.error('[Viva] Order Error:', errText);
      throw new Error('Failed to create Viva payment order');
    }

    const { orderCode } = await orderRes.json()
    const checkoutUrl = isDemo 
      ? `https://demo.vivapayments.com/web/checkout?ref=${orderCode}`
      : `https://www.vivapayments.com/web/checkout?ref=${orderCode}`

    return { success: true, url: checkoutUrl }
  } catch (e: any) {
    console.error('[Viva Wallet] Checkout error:', e)
    return { success: false, error: e.message }
  }
}

/** Cancel the active Viva Wallet subscription */
export async function cancelMySubscription() {
  const session = await requireAuth()
  const templeId = await getCurrentTempleId()

  try {
    const sub = await prisma.subscription.findFirst({
      where: { templeId, status: 'active' },
    })
    if (!sub) return { success: false, error: 'Δεν βρέθηκε ενεργή συνδρομή.' }
    
    // Viva Checkout orders don't auto-renew from our side using Smart Checkout
    // But we mark it cancelled in DB
    await prisma.subscription.update({
      where: { id: sub.id },
      data: { status: 'cancelled' },
    })

    revalidatePath('/admin/subscription')
    return { success: true }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

/** Fetch Invoices (Viva doesn't return invoices this way easily, returning empty for now) */
export async function getStripeInvoices() {
  return [];
}

/** User requests manual bank transfer for a plan */
export async function requestBankTransfer(planName: string, billingCycle: 'monthly' | 'yearly') {
  await requireAuth()
  const templeId = await getCurrentTempleId()

  try {
    const temple = await prisma.temple.findUnique({ where: { id: templeId } })
    const plan = await prisma.subscriptionPlan.findUnique({ where: { name: planName } })

    if (!plan) return { success: false, error: 'Το πακέτο δεν βρέθηκε.' }

    // Clear any existing pending_manual for this temple
    await prisma.subscription.deleteMany({
      where: { templeId, status: 'pending_manual' }
    })

    // Create the pending manual subscription
    await prisma.subscription.create({
      data: {
        templeId,
        planId: plan.id,
        status: 'pending_manual',
        billingCycle
      }
    })

    // Send email to billing@kanonas.app
    const { sendEmail } = await import('@/actions/notifications')
    await sendEmail({
      to: 'billing@kanonas.app',
      subject: `Νέο Αίτημα Τραπεζικής Κατάθεσης - ${temple?.name || templeId}`,
      title: 'Νέο αίτημα τραπεζικής κατάθεσης',
      body: `
        <strong>Ναός:</strong> ${temple?.name}<br/>
        <strong>URL Slug / ID:</strong> ${temple?.slug || templeId}<br/>
        <strong>Email Επικοινωνίας:</strong> ${temple?.email || '-'}<br/>
        <strong>Πακέτο:</strong> ${planName}<br/>
        <strong>Κύκλος Χρέωσης:</strong> ${billingCycle === 'yearly' ? 'Ετήσιος' : 'Μηνιαίος'}<br/><br/>
        Αναμένεται κατάθεση με αιτιολογία: ΚΑΝΟΝΑΣ-${templeId ? templeId.substring(templeId.length - 6).toUpperCase() : '000000'}-${planName.substring(0,3).toUpperCase()}
      `
    })

    return { success: true }
  } catch (e: any) {
    console.error('[Bank Transfer]', e)
    return { success: false, error: e.message }
  }
}


// ─── SUPER ADMIN — Manual plan management ─────────────────────────────────────

/** Super admin: get all subscriptions across all temples */
export async function getAllSubscriptions() {
 await requireSuperAdmin()
 return prisma.subscription.findMany({
 include: {
 temple: { select: { id: true, name: true, city: true } },
 plan: { select: { name: true, slug: true } },
 },
 orderBy: { createdAt: 'desc' },
 })
}

/** Super admin: manually activate a subscription (used for Metropolis plans) */
export async function manuallyActivateSubscription(templeId: string, planId: string, expiresAt?: Date) {
 const session = await requireSuperAdmin()

 const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } })
 if (!plan) return { success: false, error: 'Πακέτο δεν βρέθηκε.' }

 try {
 // Deactivate any existing active subscription for this temple
 await prisma.subscription.updateMany({
 where: { templeId, status: 'active' },
 data: { status: 'cancelled' },
 })

 await prisma.subscription.create({
 data: {
 templeId,
 planId,
 status: 'active',
 billingCycle: 'monthly',
 activatedBy: session.userId,
 activatedAt: new Date(),
 expiresAt: expiresAt ?? null,
 },
 })

 revalidatePath('/admin/super')
 revalidatePath('/admin/metropolis')
 return { success: true }
 } catch (e: any) {
 return { success: false, error: e.message }
 }
}

/** Super admin: create or update a subscription plan */
export async function upsertSubscriptionPlan(data: {
 id?: string
 name: string
 slug: string
 priceMonthly: number
 priceYearly: number
 isMetropolis: boolean
 features: string[]
 stripePriceMonthlyId?: string
 stripePriceYearlyId?: string
 isActive: boolean
 sortOrder: number
}) {
 await requireSuperAdmin()

 const payload = {
 name: data.name,
 slug: data.slug,
 priceMonthly: data.priceMonthly,
 priceYearly: data.priceYearly,
 isMetropolis: data.isMetropolis,
 features: JSON.stringify(data.features),
 stripePriceMonthlyId: data.stripePriceMonthlyId ?? null,
 stripePriceYearlyId: data.stripePriceYearlyId ?? null,
 isActive: data.isActive,
 sortOrder: data.sortOrder,
 }

 try {
 if (data.id) {
 await prisma.subscriptionPlan.update({ where: { id: data.id }, data: payload })
 } else {
 await prisma.subscriptionPlan.create({ data: payload })
 }
 revalidatePath('/admin/super/plans')
 return { success: true }
 } catch (e: any) {
 return { success: false, error: e.message }
 }
}
