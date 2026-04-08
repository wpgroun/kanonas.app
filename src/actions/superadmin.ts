'use server'

import { prisma } from '@/lib/prisma'
import { requireSuperAdmin } from '@/lib/requireAuth'
import { revalidatePath } from 'next/cache'

// ─── Overview KPIs ─────────────────────────────────────────────────────────────

export async function getSuperAdminStats() {
  await requireSuperAdmin()
  const [
    totalTemples,
    totalUsers,
    totalParishioners,
    recentTemples,
    activeSubscriptions
  ] = await Promise.all([
    prisma.temple.count(),
    prisma.user.count(),
    prisma.parishioner.count(),
    prisma.temple.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        metropolis: { select: { name: true } },
        _count: { select: { parishioners: true, users: true, donations: true, tokens: true } },
        subscriptions: {
          where: { status: 'active' },
          include: { plan: true }
        }
      },
    }),
    prisma.subscription.findMany({
      where: { status: 'active' },
      include: { plan: true }
    })
  ])

  // Calculate Real MRR
  let computedMRR = 0;
  activeSubscriptions.forEach(sub => {
    if (sub.plan && sub.plan.priceMonthly) {
      if (sub.billingCycle === 'yearly' && sub.plan.priceYearly) {
        computedMRR += (sub.plan.priceYearly / 12);
      } else {
        computedMRR += sub.plan.priceMonthly;
      }
    }
  });

  return {
    totalTemples,
    totalUsers,
    totalParishioners,
    totalMRR: Math.round(computedMRR),
    totalStorageMB: totalTemples * 150,
    recentTemples: recentTemples.map((t: any) => {
      const activeSub = t.subscriptions[0];
      return {
        id: t.id,
        name: t.name,
        city: t.city,
        email: t.email,
        phone: t.phoneNumber,
        address: t.address,
        metropolis: t.metropolis?.name || '—',
        subscriptionStatus: activeSub ? activeSub.status : 'inactive',
        subscriptionPlan: activeSub?.plan?.name || 'Free',
        subscriptionPlanId: activeSub?.planId || null,
        subscriptionId: activeSub?.id || null,
        subscriptionStartDate: t.subscriptionStartDate ? t.subscriptionStartDate.toISOString() : (activeSub?.createdAt ? activeSub.createdAt.toISOString() : null),
        subscriptionEndDate: activeSub?.expiresAt ? activeSub.expiresAt.toISOString() : (activeSub?.currentPeriodEnd ? activeSub.currentPeriodEnd.toISOString() : null),
        parishioners: t._count.parishioners,
        users: t._count.users,
        donations: t._count.donations,
        tokens: t._count.tokens,
        createdAt: t.createdAt.toISOString(),
        lat: t.lat,
        lng: t.lng,
      };
    }),
  }
}

// ─── Toggle subscription on/off ───────────────────────────────────────────────

export async function toggleSubscriptionStatus(templeId: string, currentStatus: string) {
  try {
    await requireSuperAdmin()
    const activeSub = await prisma.subscription.findFirst({
      where: { templeId, status: 'active' }
    });
    
    if (activeSub && currentStatus === 'active') {
      await prisma.subscription.update({
        where: { id: activeSub.id },
        data: { status: 'cancelled' }
      });
    } else if (currentStatus !== 'active') {
      const lastSub = await prisma.subscription.findFirst({
        where: { templeId },
        orderBy: { createdAt: 'desc' }
      });
      if (lastSub) {
        await prisma.subscription.update({
          where: { id: lastSub.id },
          data: { status: 'active' }
        });
      }
    }
    revalidatePath('/admin/super')
    return { success: true };
  } catch (error) {
    console.error('Failed to toggle status:', error);
    return { success: false, error: 'Failed to update subscription status' };
  }
}

// ─── Temple Profile (view/edit) ───────────────────────────────────────────────

export async function getTempleProfile(templeId: string) {
  await requireSuperAdmin()
  const temple = await prisma.temple.findUnique({
    where: { id: templeId },
    include: {
      metropolis: { select: { id: true, name: true } },
      subscriptions: { include: { plan: true }, orderBy: { createdAt: 'desc' }, take: 5 },
      _count: { select: { parishioners: true, users: true, donations: true, tokens: true, expenses: true } },
      users: { include: { user: { select: { id: true, email: true, firstName: true, lastName: true } } } }
    }
  })
  if (!temple) return null
  return {
    ...temple,
    createdAt: temple.createdAt.toISOString(),
    updatedAt: temple.updatedAt.toISOString(),
  }
}

export async function updateTempleProfile(templeId: string, data: {
  name?: string; email?: string; phoneNumber?: string; address?: string; city?: string; taxId?: string;
}) {
  await requireSuperAdmin()
  await prisma.temple.update({ where: { id: templeId }, data })
  revalidatePath('/admin/super')
  return { success: true }
}

// ─── Change Subscription Plan (upgrade / downgrade) ───────────────────────────

export async function changeTempleSubscriptionPlan(templeId: string, newPlanId: string) {
  await requireSuperAdmin()
  
  const plan = await prisma.subscriptionPlan.findUnique({ where: { id: newPlanId } })
  if (!plan) return { success: false, error: 'Πλάνο δεν βρέθηκε.' }

  // Cancel existing active subs
  await prisma.subscription.updateMany({
    where: { templeId, status: 'active' },
    data: { status: 'cancelled' }
  })

  // Create new subscription
  const session = await requireSuperAdmin()
  await prisma.subscription.create({
    data: {
      templeId,
      planId: newPlanId,
      status: 'active',
      billingCycle: 'monthly',
      activatedBy: session.userId,
      activatedAt: new Date(),
    }
  })

  // Also update the legacy plan field on temple
  await prisma.temple.update({
    where: { id: templeId },
    data: { subscriptionPlan: plan.slug, subscriptionStatus: 'active' }
  })

  revalidatePath('/admin/super')
  return { success: true }
}

// ─── Pause / Reactivate Subscription ──────────────────────────────────────────

export async function pauseTempleSubscription(templeId: string) {
  await requireSuperAdmin()
  
  await prisma.subscription.updateMany({
    where: { templeId, status: 'active' },
    data: { status: 'cancelled' }
  })
  
  await prisma.temple.update({
    where: { id: templeId },
    data: { subscriptionStatus: 'inactive' }
  })

  revalidatePath('/admin/super')
  return { success: true }
}

export async function reactivateTempleSubscription(templeId: string) {
  await requireSuperAdmin()

  const lastSub = await prisma.subscription.findFirst({
    where: { templeId },
    orderBy: { createdAt: 'desc' }
  })

  if (lastSub) {
    await prisma.subscription.update({
      where: { id: lastSub.id },
      data: { status: 'active' }
    })
  }

  await prisma.temple.update({
    where: { id: templeId },
    data: { subscriptionStatus: 'active' }
  })

  revalidatePath('/admin/super')
  return { success: true }
}

// ─── SuperAdmin Password Reset ────────────────────────────────────────────────

export async function superAdminResetPassword(userId: string, newPassword: string) {
  await requireSuperAdmin()
  
  const bcrypt = await import('bcryptjs')
  const hash = await bcrypt.hash(newPassword, 12)
  
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: hash }
  })

  return { success: true }
}

// ─── Cross-Temple Financial Overview ──────────────────────────────────────────

export async function getSuperAdminFinancials() {
  await requireSuperAdmin()

  const now = new Date()
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const firstOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
  const firstOfYear = new Date(now.getFullYear(), 0, 1)

  const [
    totalDonationsMonth,
    totalDonationsLastMonth,
    totalDonationsYear,
    totalExpensesMonth,
    totalExpensesYear,
    topTemples,
    recentDonations,
    subscriptionCount,
    monthlyBreakdown
  ] = await Promise.all([
    prisma.donation.aggregate({ _sum: { amount: true }, where: { date: { gte: firstOfMonth } } }),
    prisma.donation.aggregate({ _sum: { amount: true }, where: { date: { gte: firstOfLastMonth, lte: lastOfLastMonth } } }),
    prisma.donation.aggregate({ _sum: { amount: true }, where: { date: { gte: firstOfYear } } }),
    prisma.expense.aggregate({ _sum: { amount: true }, where: { date: { gte: firstOfMonth } } }),
    prisma.expense.aggregate({ _sum: { amount: true }, where: { date: { gte: firstOfYear } } }),
    // Top 10 temples by donations this year
    prisma.donation.groupBy({
      by: ['templeId'],
      _sum: { amount: true },
      where: { date: { gte: firstOfYear } },
      orderBy: { _sum: { amount: 'desc' } },
      take: 10
    }),
    // Recent large donations
    prisma.donation.findMany({
      orderBy: { date: 'desc' },
      take: 15,
      include: { temple: { select: { name: true } } }
    }),
    prisma.subscription.count({ where: { status: 'active' } }),
    // Monthly revenue breakdown (last 6 months)
    prisma.donation.findMany({
      where: { date: { gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) } },
      select: { amount: true, date: true, templeId: true }
    })
  ])

  // Resolve temple names for top temples
  const templeIds = topTemples.map(t => t.templeId)
  const temples = await prisma.temple.findMany({
    where: { id: { in: templeIds } },
    select: { id: true, name: true, city: true }
  })
  const templeMap = Object.fromEntries(temples.map(t => [t.id, t]))

  // Build 6-month trend
  const monthRanges = Array.from({ length: 6 }, (_, i) => {
    const start = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    const end = new Date(now.getFullYear(), now.getMonth() - (5 - i) + 1, 0, 23, 59, 59)
    return { start, end, label: start.toLocaleString('el-GR', { month: 'short' }) }
  })

  const revenueTrend = monthRanges.map(({ start, end, label }) => ({
    name: label,
    total: monthlyBreakdown
      .filter(d => new Date(d.date) >= start && new Date(d.date) <= end)
      .reduce((sum, d) => sum + d.amount, 0)
  }))

  return {
    donationsMonth: totalDonationsMonth._sum.amount || 0,
    donationsLastMonth: totalDonationsLastMonth._sum.amount || 0,
    donationsYear: totalDonationsYear._sum.amount || 0,
    expensesMonth: totalExpensesMonth._sum.amount || 0,
    expensesYear: totalExpensesYear._sum.amount || 0,
    activeSubscriptions: subscriptionCount,
    topTemples: topTemples.map(t => ({
      templeId: t.templeId,
      name: templeMap[t.templeId]?.name || 'Άγνωστος',
      city: templeMap[t.templeId]?.city || '',
      total: t._sum.amount || 0,
    })),
    recentDonations: recentDonations.map(d => ({
      id: d.id,
      amount: d.amount,
      date: d.date.toISOString(),
      type: d.purpose || '',
      note: d.donorName || '',
      temple: d.temple?.name || '—'
    })),
    revenueTrend,
  }
}

// ─── All Metropoleis ──────────────────────────────────────────────────────────

export async function getAllMetropoleis() {
  await requireSuperAdmin()
  return prisma.metropolis.findMany({
    include: {
      _count: { select: { temples: true, users: true } }
    },
    orderBy: { name: 'asc' }
  })
}

// ─── List all users (super admin) ─────────────────────────────────────────────

export async function getAllUsers() {
  await requireSuperAdmin()
  return prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      temples: { include: { temple: { select: { name: true } } } }
    },
    take: 100
  })
}

