'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/requireAuth';
import { getCurrentTempleId } from '@/actions/core';
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
 templeId, userId: session.userId, userEmail: session.userEmail,
 action: 'ΑΙΜΟΔΟΣΙΑ_ΕΓΓΡΑΦΗ',
 detail: `Νέος εθελοντής αιμοδότης: ${formData.lastName} (${formData.bloodType}).`
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
 const templeId = await getCurrentTempleId();
 try {
 // [SECURITY] Tenant isolation — verify donor belongs to this temple
 const donor = await prisma.bloodDonor.findFirst({ where: { id: donorId, templeId } });
 if (!donor) return { success: false, error: 'Ο αιμοδότης δεν βρέθηκε στο Ναό σας.' };

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

// --- Blood Drive Campaigns ---

export async function getBloodDrives() {
  const templeId = await getCurrentTempleId();
  return await prisma.bloodDrive.findMany({
    where: { templeId },
    include: { donations: true },
    orderBy: { date: 'desc' }
  });
}

export async function createBloodDrive(data: { name: string; date: string; location?: string; target?: number }) {
  const session = await requireAuth();
  const templeId = await getCurrentTempleId();
  try {
    await prisma.bloodDrive.create({
      data: { templeId, name: data.name, date: new Date(data.date), location: data.location || null, target: data.target || null }
    });
    await prisma.auditLog.create({
      data: { templeId, userId: session.userId, userEmail: session.userEmail, action: 'BLOOD_DRIVE_CREATE', detail: data.name }
    });
    revalidatePath('/admin/registry/bloodbank');
    return { success: true };
  } catch (e) {
    return { success: false, error: 'Error creating blood drive.' };
  }
}

export async function deleteBloodDrive(id: string) {
  await requireAuth();
  const templeId = await getCurrentTempleId();
  try {
    const drive = await prisma.bloodDrive.findFirst({ where: { id, templeId } });
    if (!drive) return { success: false, error: 'Not found' };
    await prisma.bloodDrive.delete({ where: { id } });
    revalidatePath('/admin/registry/bloodbank');
    return { success: true };
  } catch (e) {
    return { success: false, error: 'Delete failed.' };
  }
}

export async function getBloodBankStats() {
  const templeId = await getCurrentTempleId();
  const [totalDonors, totalDonations, activeDrives] = await Promise.all([
    prisma.bloodDonor.count({ where: { templeId } }),
    prisma.bloodDonation.count({ where: { donor: { templeId } } }),
    prisma.bloodDrive.count({ where: { templeId, date: { gte: new Date() } } })
  ]);
  const byType = await prisma.bloodDonor.groupBy({ by: ['bloodType'], where: { templeId }, _count: true });
  return { totalDonors, totalDonations, activeDrives, byType };
}
