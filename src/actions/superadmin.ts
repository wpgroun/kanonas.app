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
 premiumSubs
 ] = await Promise.all([
 prisma.temple.count(),
 prisma.user.count(),
 prisma.parishioner.count(),
 prisma.temple.findMany({
 orderBy: { createdAt: 'desc' },
 take: 20,
 include: {
 metropolis: { select: { name: true } },
 _count: { select: { parishioners: true, users: true } },
 },
 }),
 prisma.temple.count({
 where: { subscriptionPlan: 'premium', subscriptionStatus: 'active' } // or whatever logical calculation applies to MRR
 })
 ])

 // Dummy MRR calculation: e.g. 50 EUR per active premium subscription
 const computedMRR = premiumSubs * 50;
 
 // Dummy Storage: Each Temple takes roughly 150MB of simulated pdfs/assets
 const computedStorageMB = totalTemples * 150;

 return {
 totalTemples,
 totalUsers,
 totalParishioners,
 totalMRR: computedMRR,
 totalStorageMB: computedStorageMB,
 recentTemples: recentTemples.map((t: any) => ({
 id: t.id,
 name: t.name,
 city: t.city,
 email: t.email,
 metropolis: t.metropolis?.name || '—',
 subscriptionStatus: t.subscriptionStatus,
 subscriptionPlan: t.subscriptionPlan,
 subscriptionEndDate: t.subscriptionEndDate ? t.subscriptionEndDate.toISOString() : null,
 parishioners: t._count.parishioners,
 users: t._count.users,
 createdAt: t.createdAt.toISOString(),
 })),
 }
}

export async function toggleSubscriptionStatus(templeId: string, currentStatus: string) {
 try {
 await requireSuperAdmin()
 const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
 await prisma.temple.update({
 where: { id: templeId },
 data: { subscriptionStatus: newStatus }
 });
 return { success: true };
 } catch (error) {
 console.error('Failed to toggle status:', error);
 return { success: false, error: 'Failed to update subscription status' };
 }
}

export async function changeSubscriptionPlan(templeId: string, newPlan: string) {
 try {
 await requireSuperAdmin();
 await prisma.temple.update({
 where: { id: templeId },
 data: { subscriptionPlan: newPlan }
 });
 return { success: true };
 } catch (error) {
 return { success: false, error: 'Failed to update plan' };
 }
}
