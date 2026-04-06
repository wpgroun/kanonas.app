'use server'

import { prisma } from '@/lib/prisma'
import { requireSuperAdmin } from '@/lib/requireAuth'

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
        _count: { select: { parishioners: true, users: true } },
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
      // rough MRR calculation (annually divides by 12)
      if (sub.billingCycle === 'yearly' && sub.plan.priceYearly) {
        computedMRR += (sub.plan.priceYearly / 12);
      } else {
        computedMRR += sub.plan.priceMonthly;
      }
    }
  });

  const computedStorageMB = totalTemples * 150;

  return {
    totalTemples,
    totalUsers,
    totalParishioners,
    totalMRR: Math.round(computedMRR),
    totalStorageMB: computedStorageMB,
    recentTemples: recentTemples.map((t: any) => {
      const activeSub = t.subscriptions[0]; // Active subscription if any
      return {
        id: t.id,
        name: t.name,
        city: t.city,
        email: t.email,
        metropolis: t.metropolis?.name || '—',
        subscriptionStatus: activeSub ? activeSub.status : 'inactive',
        subscriptionPlan: activeSub?.plan?.name || 'Free',
        subscriptionStartDate: t.subscriptionStartDate ? t.subscriptionStartDate.toISOString() : (activeSub?.createdAt ? activeSub.createdAt.toISOString() : null),
        subscriptionEndDate: activeSub?.expiresAt ? activeSub.expiresAt.toISOString() : (activeSub?.currentPeriodEnd ? activeSub.currentPeriodEnd.toISOString() : null),
        parishioners: t._count.parishioners,
        users: t._count.users,
        createdAt: t.createdAt.toISOString(),
        lat: t.lat,
        lng: t.lng,
      };
    }),
  }
}

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
      // Failsafe reactivate the latest
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
    return { success: true };
  } catch (error) {
    console.error('Failed to toggle status:', error);
    return { success: false, error: 'Failed to update subscription status' };
  }
}

export async function changeSubscriptionPlan(templeId: string, newPlanId: string) {
  // We'll hook this up properly with the modal, right now returning failure if not supported
  return { success: false, error: 'Please use the unified portal' };
}
