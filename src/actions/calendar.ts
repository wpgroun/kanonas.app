'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/requireAuth';
import { getCurrentTempleId } from '@/actions/core';
import { revalidatePath } from 'next/cache';
import { startOfDay, endOfDay } from 'date-fns';

export async function getCentralEvents() {
 const session = await requireAuth();
 const templeId = await getCurrentTempleId();
 
 // We fetch Metropolis ID from temple if possible, or just the temple's events
 const temple = await prisma.temple.findUnique({ where: {id: templeId}, select: { metropolisId: true } });

 try {
 const events = await prisma.centralEvent.findMany({
 where: {
 OR: [
 { templeId: templeId }, // Parish level events
 { metropolisId: temple?.metropolisId }, // Metropolis level events
 { metropolisId: null, templeId: null } // Super global events
 ]
 },
 orderBy: { startDate: 'asc' }
 });

 return { success: true, data: events };
 } catch(e) {
 return { success: false, error: 'Σφάλμα ανάκτησης ημερολογίου.' };
 }
}

export async function addCentralEvent(data: any) {
 const session = await requireAuth();
 const templeId = await getCurrentTempleId();

 try {
 const created = await prisma.centralEvent.create({
 data: {
 templeId: session.isSuperAdmin ? null : templeId, // Super admin creates global, priest creates parish
 title: data.title,
 description: data.description,
 startDate: new Date(data.startDate),
 endDate: new Date(data.endDate),
 category: data.category,
 color: data.color || '#3b82f6', // Default blue
 }
 });

 revalidatePath('/admin/calendar');
 return { success: true, data: created };
 } catch(e) {
 return { success: false, error: 'Αποτυχία δημιουργίας συμβάντος.' };
 }
}

export async function deleteCentralEvent(id: string) {
 const session = await requireAuth();
 const templeId = await getCurrentTempleId();

 try {
 const event = await prisma.centralEvent.findUnique({where: {id}});
 if (!event) return {success:false};
 // Basic ownership check
 if (!session.isSuperAdmin && event.templeId !== templeId) {
 return {success:false, error:'Δεν έχετε δικαίωμα διαγραφής'};
 }

 await prisma.centralEvent.delete({ where: { id } });
 revalidatePath('/admin/calendar');
 return { success: true };
 } catch(e) {
 return { success: false, error: 'Σφάλμα διαγραφής συμβάντος.' };
 }
}
