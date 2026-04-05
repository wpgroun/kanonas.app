'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { requireAuth } from '@/lib/requireAuth'
import { getCurrentTempleId } from './core'

export async function getTempleRoles() {
 await requireAuth();
 const templeId = await getCurrentTempleId();
 try {
 return await prisma.role.findMany({
 where: { templeId },
 orderBy: { name: 'asc' },
 include: {
 _count: { select: { users: true } }
 }
 });
 } catch(e) {
 console.error(e)
 return [];
 }
}

export async function createTempleRole(data: { name: string; permissions: Record<string, boolean> }) {
 const session = await requireAuth();
 if(!session.isHeadPriest && !session.isSuperAdmin) {
 return { success: false, error: 'Μόνο ο Προϊστάμενος του Ναού μπορεί να δημιουργήσει ή να τροποποιήσει Ρόλους.' };
 }
 
 const templeId = await getCurrentTempleId();
 try {
 await prisma.role.create({
 data: {
 templeId,
 name: data.name,
 // Map dynamic boolean permissions
 ...data.permissions
 }
 });
 revalidatePath('/admin/users');
 revalidatePath('/admin/users/roles');
 return { success: true };
 } catch(e) {
 console.error(e);
 return { success: false, error: 'Αποτυχία δημιουργίας ρόλου (ίσως υπάρχει ήδη το όνομα;)' };
 }
}

export async function updateTempleRole(id: string, data: { name: string; permissions: Record<string, boolean> }) {
 const session = await requireAuth();
 if(!session.isHeadPriest && !session.isSuperAdmin) return { success: false, error: 'Μη Εξουσιοδοτημένη ενέργεια' };
 const templeId = await getCurrentTempleId();
 try {
 const existing = await prisma.role.findFirst({ where: { id, templeId } });
 if (!existing) return { success: false, error: 'Unauthorized' };
 await prisma.role.update({
 where: { id },
 data: {
 name: data.name,
 ...data.permissions
 }
 });
 revalidatePath('/admin/users');
 revalidatePath('/admin/users/roles');
 return { success: true };
 } catch(e) {
 return { success: false, error: 'Σφάλμα ενημέρωσης.' };
 }
}

export async function deleteTempleRole(id: string) {
 const session = await requireAuth();
 if(!session.isHeadPriest && !session.isSuperAdmin) return { success: false, error: 'Μη Εξουσιοδοτημένη ενέργεια' };
 
 const templeId = await getCurrentTempleId();
 try {
 const existing = await prisma.role.findFirst({ where: { id, templeId } });
 if (!existing) return { success: false, error: 'Unauthorized' };

 // Check if users exist for this role
 const usersCount = await prisma.userTemple.count({ where: { roleId: id } });
 if (usersCount > 0) {
 return { success: false, error: `Δεν μπορείτε να διαγράψετε τον Ρόλο, διότι έχει ανατεθεί σε ${usersCount} χρήστες. Ή αλλάξτε όνομα στο Ρόλο, ή αλλάξτε ρόλο στους χρήστες πρώτα.`}
 }
 await prisma.role.delete({ where: { id } });
 revalidatePath('/admin/users');
 revalidatePath('/admin/users/roles');
 return { success: true };
 } catch(e) {
 return { success: false, error: 'Σφάλμα διαγραφής.' };
 }
}
