'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth, getCurrentTempleId } from '@/lib/session';
import { revalidatePath } from 'next/cache';

export async function getBloodDonors() {
  const templeId = await getCurrentTempleId();
  try {
     return await prisma.bloodDonor.findMany({
        where: { templeId },
        include: {
           parishioner: true,
           donations: { orderBy: { date: 'desc' } }
        },
        orderBy: { lastName: 'asc' }
     });
  } catch (e) {
     return [];
  }
}

export async function addBloodDonor(formData: any) {
  const session = await requireAuth();
  const templeId = await getCurrentTempleId();
  try {
     await prisma.bloodDonor.create({
        data: {
           templeId,
           firstName: formData.firstName,
           lastName: formData.lastName,
           phone: formData.phone || null,
           bloodType: formData.bloodType,
           parishionerId: formData.parishionerId || null
        }
     });

     await prisma.auditLog.create({
        data: {
           templeId, userId: session.userId, userEmail: session.userId,
           action: 'ΑΙΜΟΔΟΣΙΑ_ΕΓΓΡΑΦΗ',
           details: `Νέος εθελοντής αιμοδότης: ${formData.lastName} (${formData.bloodType}).`
        }
     });

     revalidatePath('/admin/registry/bloodbank');
     return { success: true };
  } catch (e) {
     return { success: false, error: 'Σφάλμα καταχώρησης!' };
  }
}

export async function recordDonation(donorId: string, payload: any) {
  const session = await requireAuth();
  try {
     const dateObj = new Date(payload.date);
     
     await prisma.bloodDonation.create({
        data: {
           donorId,
           date: dateObj,
           hospital: payload.hospital || null,
           notes: payload.notes || null,
        }
     });

     // Update last donation date
     await prisma.bloodDonor.update({
        where: { id: donorId },
        data: { lastDonation: dateObj }
     });

     revalidatePath('/admin/registry/bloodbank');
     return { success: true };
  } catch (e) {
     return { success: false, error: 'Αποτυχία Καταγραφής Αιμοδοσίας.' };
  }
}
