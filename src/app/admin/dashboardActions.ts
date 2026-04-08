'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { getUpcomingNamedays } from '@/actions/namedays'
import { getActiveAnnouncements } from '@/actions/announcements'

export async function getDashboardStats() {
 const session = await getSession()
 const templeId = session?.templeId || 'cm0testtempleid0000000001'
 const now = new Date()
 const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
 const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
 const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

 // Build 6-month date ranges upfront (avoid N+1 in loop)
 const monthRanges = Array.from({ length: 6 }, (_, i) => {
 const start = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
 const end = new Date(now.getFullYear(), now.getMonth() - (5 - i) + 1, 0, 23, 59, 59)
 return { start, end, label: start.toLocaleString('el-GR', { month: 'short' }) }
 })

 // Run ALL queries in parallel with Promise.all (was N+1 before!)
 const [
 totalParishioners,
 pendingRequests,
 completedRequests,
 monthlyDonationsAgg,
 lastMonthDonationsAgg,
 sacramentsRaw,
 recentTokens,
 recentParishioners,
 activeBeneficiaries,
 allMonthlyRevenue,
 ] = await Promise.all([
 prisma.parishioner.count({ where: { templeId } }),
 prisma.token.count({ where: { templeId, status: 'pending' } }),
 prisma.token.count({ where: { templeId, status: 'docs_generated' } }),
 prisma.donation.aggregate({
 _sum: { amount: true },
 where: { templeId, date: { gte: firstDayOfMonth } }
 }),
 prisma.donation.aggregate({
 _sum: { amount: true },
 where: { templeId, date: { gte: firstDayOfLastMonth, lte: lastDayOfLastMonth } }
 }),
 prisma.sacrament.groupBy({
 by: ['sacramentType'],
 _count: { id: true },
 where: { templeId }
 }),
 prisma.token.findMany({
 where: { templeId },
 orderBy: { createdAt: 'desc' },
 take: 5,
 select: { id: true, customerName: true, serviceType: true, status: true, createdAt: true }
 }),
 prisma.parishioner.findMany({
 where: { templeId },
 orderBy: { createdAt: 'desc' },
 take: 3,
 select: { id: true, firstName: true, lastName: true, createdAt: true }
 }),
 prisma.beneficiary.count({ where: { templeId, status: 'active' } }),
 // Fetch all donations for the 6-month range in ONE query
 prisma.donation.findMany({
 where: {
 templeId,
 date: { gte: monthRanges[0].start, lte: monthRanges[5].end }
 },
 select: { amount: true, date: true }
 }),
 ])

 // Group revenue by month client-side (avoids 6 separate DB queries)
 const revenueTrend = monthRanges.map(({ start, end, label }) => {
 const monthTotal = allMonthlyRevenue
 .filter(d => new Date(d.date) >= start && new Date(d.date) <= end)
 .reduce((sum, d) => sum + d.amount, 0)
 return {
 name: label,
 'Έσοδα': monthTotal
 }
 })

 const totalMonthlyDonations = monthlyDonationsAgg._sum.amount || 0
 const lastMonthDonations = lastMonthDonationsAgg._sum.amount || 0
 const monthlyGrowth = lastMonthDonations > 0
 ? Math.round(((totalMonthlyDonations - lastMonthDonations) / lastMonthDonations) * 100)
 : 0

 const defaultSacramentsData: { name: string; value: number }[] = []

 const upcomingNamedays = await getUpcomingNamedays(7)
 const announcements = await getActiveAnnouncements()

 return {
 totalParishioners,
 totalMonthlyDonations,
 lastMonthDonations,
 monthlyGrowth,
 pendingRequests,
 completedRequests,
 activeBeneficiaries,
 sacramentsData: sacramentsRaw.length > 0
 ? sacramentsRaw.map(s => ({ name: s.sacramentType, value: s._count.id }))
 : defaultSacramentsData,
 revenueTrend,
 recentTokens,
 recentParishioners,
 upcomingNamedays,
 announcements: announcements.map(a => ({ id: a.id, title: a.title, body: a.body, type: a.type, priority: a.priority }))
 }
}
