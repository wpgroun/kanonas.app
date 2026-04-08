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
 const sub = await prisma.subscription.findFirst({
 where: { templeId, status: 'active' },
 select: { expiresAt: true, stripeSubscriptionId: true }
 })
 // No subscription or Stripe-managed auto-renewing → no warning needed
 if (!sub || !sub.expiresAt || sub.stripeSubscriptionId) return null

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
 * Creates a Stripe Checkout Session for a temple to subscribe.
 * Returns the Stripe checkout URL.
 * Only works for non-Metropolis plans.
 */
export async function createCheckoutSession(planId: string, billingCycle: 'monthly' | 'yearly') {
 const session = await requireAuth()
 const templeId = await getCurrentTempleId()

 const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } })
 if (!plan) return { success: false, error: 'Το πακέτο δεν βρέθηκε.' }
 if (plan.isMetropolis) return { success: false, error: 'Το πακέτο Μητρόπολης ενεργοποιείται μόνο χειροκίνητα από Super Admin.' }

 const stripePriceId = billingCycle === 'yearly' ? plan.stripePriceYearlyId : plan.stripePriceMonthlyId
 if (!stripePriceId) return { success: false, error: 'Δεν έχει οριστεί Stripe Price για αυτό το πακέτο.' }

 try {
 const stripe = (await import('stripe')).default
 const stripeClient = new stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-03-31.basil' })

 const temple = await prisma.temple.findUnique({ where: { id: templeId } })
 const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://kanonas.app'

 const checkoutSession = await stripeClient.checkout.sessions.create({
 mode: 'subscription',
 line_items: [{ price: stripePriceId, quantity: 1 }],
 customer_email: temple?.email ?? undefined,
 metadata: { templeId, planId, billingCycle },
 success_url: `${baseUrl}/admin/subscription?success=1`,
 cancel_url: `${baseUrl}/admin/subscription?cancelled=1`,
 locale: 'el',
 allow_promotion_codes: true,
 })

 return { success: true, url: checkoutSession.url }
 } catch (e: any) {
 console.error('[Stripe] Checkout error:', e)
 return { success: false, error: e.message }
 }
}

/** Cancel the active Stripe subscription */
export async function cancelMySubscription() {
 const session = await requireAuth()
 const templeId = await getCurrentTempleId()

 try {
 const sub = await prisma.subscription.findFirst({
 where: { templeId, status: 'active' },
 })
 if (!sub) return { success: false, error: 'Δεν βρέθηκε ενεργή συνδρομή.' }
 if (!sub.stripeSubscriptionId) return { success: false, error: 'Η συνδρομή δεν είναι Stripe-managed.' }

 const stripe = (await import('stripe')).default
 const stripeClient = new stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-03-31.basil' })

 // Cancel at period end (grace period)
 await stripeClient.subscriptions.update(sub.stripeSubscriptionId, {
 cancel_at_period_end: true,
 })

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


/** Fetch Stripe Invoices for the active tenant */
export async function getStripeInvoices() {
  await requireAuth()
  const templeId = await getCurrentTempleId()

  try {
    const sub = await prisma.subscription.findFirst({
      where: { templeId },
      orderBy: { createdAt: 'desc' }
    });
    
    if (!sub || !sub.stripeSubscriptionId) return [];

    const stripe = (await import('stripe')).default;
    const stripeClient = new stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-03-31.basil' });

    const stripeSub = await stripeClient.subscriptions.retrieve(sub.stripeSubscriptionId);
    if (!stripeSub || !stripeSub.customer) return [];

    const invoices = await stripeClient.invoices.list({
      customer: typeof stripeSub.customer === 'string' ? stripeSub.customer : stripeSub.customer.id,
      limit: 10,
    });

    return invoices.data.map(inv => ({
      id: inv.id,
      number: inv.number,
      amountPaid: inv.amount_paid / 100,
      status: inv.status,
      date: new Date(inv.created * 1000),
      pdfUrl: inv.invoice_pdf
    }));
  } catch (e) {
    console.error('[Stripe Invoices] Error:', e);
    return [];
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
