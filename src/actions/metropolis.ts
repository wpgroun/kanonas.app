'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/requireAuth';
import { getCurrentTempleId } from '@/actions/core';

export async function getHawkEyeData() {
 const session = await requireAuth();

 // Verify SuperAdmin or MetropolisUser
 const user = await prisma.user.findUnique({
 where: { id: session.userId },
 include: {
 metropolisUsers: { include: { metropolis: true } }
 }
 });

 if (!user) throw new Error("Δεν βρέθηκε χρήστης");

 // For safety/demo we'll assume the user is somewhat authorized, or isSuperAdmin.
 // Get the first metropolis this user has access to.
 const metUser = user.metropolisUsers[0];
 let metropolisId = metUser?.metropolisId;

 // Fallback for development if isSuperAdmin but has no direct metropolis mapping
 if (!metropolisId && user.isSuperAdmin) {
 const fallbackMetropolis = await prisma.metropolis.findFirst();
 if (fallbackMetropolis) metropolisId = fallbackMetropolis.id;
 }

 if (!metropolisId) throw new Error("Ο χρήστης δεν ανήκει σε καμία Μητρόπολη, η πρόσβαση απορρίφθηκε.");

 const metropolis = await prisma.metropolis.findUnique({
 where: { id: metropolisId },
 include: {
 temples: {
 include: {
 sacraments: true,
 incomes: true,
 users: { include: { user: true } },
 kanbanTasks: { where: { status: { not: 'DONE' } } }
 }
 }
 }
 });

 if (!metropolis) throw new Error("Η Μητρόπολη δεν βρέθηκε.");

 // Aggregate math across ALL temples
 let totalTemples = metropolis.temples.length;
 let totalSacraments = 0;
 let totalIncome = 0;
 let globalTasksPending = 0;
 const activePriests = new Set(); // ensure unique priests across temples if needed

 metropolis.temples.forEach(temple => {
 totalSacraments += temple.sacraments.length;
 totalIncome += temple.incomes.reduce((acc, inc) => acc + inc.amount, 0);
 globalTasksPending += temple.kanbanTasks.length;
 
 temple.users.forEach(ut => {
 activePriests.add(ut.userId); // counting unique users attached to temples
 });
 });

 // Mapping specific temple stats for the grid list
 const mappedTemples = metropolis.temples.map(t => ({
 id: t.id,
 name: t.name,
 sacramentCount: t.sacraments.length,
 revenue: t.incomes.reduce((acc, inc) => acc + inc.amount, 0),
 pendingTasks: t.kanbanTasks.length,
 usersCount: t.users.length
 }));

 // Sort temples by highest revenue
 mappedTemples.sort((a,b) => b.revenue - a.revenue);

 return {
 metropolisName: metropolis.name,
 aggregateStats: {
 totalTemples,
 totalSacraments,
 totalIncome,
 globalTasksPending,
 activePriests: activePriests.size
 },
 temples: mappedTemples
 };
}
