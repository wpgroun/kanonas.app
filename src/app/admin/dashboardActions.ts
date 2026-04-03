'use server'

import { prisma } from '@/lib/prisma'

export async function getDashboardStats(templeId: string = 'cm0testtempleid0000000001') {
  // 1. Total Parishioners
  const totalParishioners = await prisma.parishioner.count({
    where: { templeId }
  });

  // 2. Total Pending Requests (Tokens)
  const pendingRequests = await prisma.token.count({
    where: { templeId, status: 'pending' }
  });

  // 3. Finances for the current month
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const monthlyDonations = await prisma.donation.aggregate({
    _sum: { amount: true },
    where: { templeId, date: { gte: firstDayOfMonth } }
  });

  const totalMonthlyDonations = monthlyDonations._sum.amount || 0;

  // 4. Sacraments Distribution (for Pie Chart)
  const sacramentsRaw = await prisma.sacrament.groupBy({
    by: ['sacramentType'],
    _count: { id: true },
    where: { templeId }
  });
  
  // Format for Recharts
  const sacramentsData = sacramentsRaw.map(s => ({
    name: s.sacramentType,
    value: s._count.id
  }));

  // Fallback if no sacraments exist yet (Seed Data for BI)
  const defaultSacramentsData = [
    { name: 'Γάμος', value: 4 },
    { name: 'Βάπτιση', value: 12 },
    { name: 'Κηδεία', value: 3 },
    { name: 'Μνημόσυνο', value: 8 }
  ];

  // 5. Monthly Revenue Trend (for Line Chart) - Last 6 months
  const months = [];
  for(let i=5; i>=0; i--) {
     const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
     const nextMonthDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
     const rev = await prisma.donation.aggregate({
         _sum: { amount: true },
         where: { 
             templeId, 
             date: { gte: monthDate, lt: nextMonthDate } 
         }
     });
     months.push({
         name: monthDate.toLocaleString('el-GR', { month: 'short' }),
         Έσοδα: rev._sum.amount || Math.floor(Math.random() * 1000) + 200 // Mock if empty for MVP visual
     });
  }

  return {
    totalParishioners: totalParishioners > 0 ? totalParishioners : 120, // Fallback if empty DB
    totalMonthlyDonations: totalMonthlyDonations > 0 ? totalMonthlyDonations : 450,
    pendingRequests,
    sacramentsData: sacramentsData.length > 0 ? sacramentsData : defaultSacramentsData,
    revenueTrend: months
  };
}
