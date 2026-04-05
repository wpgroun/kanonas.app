'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/requireAuth';
import { getCurrentTempleId } from './core';
import { revalidatePath } from 'next/cache';

// -- YOUTH PROGRAMS -- //

export async function getYouthPrograms() {
  await requireAuth();
  const templeId = await getCurrentTempleId();
  try {
    return await prisma.youthProgram.findMany({
       where: { templeId },
       include: { enrollments: true },
       orderBy: { createdAt: 'desc' }
    });
  } catch(e) { return []; }
}

export async function createYouthProgram(data: { name: string, description?: string, startDate?: Date, endDate?: Date }) {
  await requireAuth();
  const templeId = await getCurrentTempleId();
  try {
    await prisma.youthProgram.create({
       data: {
          templeId,
          name: data.name,
          description: data.description,
          startDate: data.startDate,
          endDate: data.endDate
       }
    });
    revalidatePath('/admin/youth');
    return { success: true };
  } catch(e) { return { success: false, error: 'Σφάλμα δημιουργίας' }; }
}

export async function deleteYouthProgram(id: string) {
  await requireAuth();
  try {
    await prisma.youthProgram.delete({ where: { id } });
    revalidatePath('/admin/youth');
    return { success: true };
  } catch(e) { return { success: false, error: 'Σφάλμα διαγραφής' }; }
}

// -- PARTICIPANTS (CHILDREN) -- //

export async function getParticipants() {
  await requireAuth();
  const templeId = await getCurrentTempleId();
  try {
    return await prisma.youthParticipant.findMany({
       where: { templeId },
       include: { enrollments: { include: { program: true } } },
       orderBy: { lastName: 'asc' }
    });
  } catch(e) { return []; }
}

export async function createParticipant(data: { firstName: string, lastName: string, birthDate?: Date, parentName?: string, parentPhone?: string, parentEmail?: string, medicalNotes?: string, schoolGrade?: string, hasConsent?: boolean }) {
  await requireAuth();
  const templeId = await getCurrentTempleId();
  try {
    await prisma.youthParticipant.create({
       data: {
          templeId,
          firstName: data.firstName,
          lastName: data.lastName,
          birthDate: data.birthDate,
          parentName: data.parentName,
          parentPhone: data.parentPhone,
          parentEmail: data.parentEmail,
          medicalNotes: data.medicalNotes,
          schoolGrade: data.schoolGrade,
          parentConsentDate: data.hasConsent ? new Date() : null
       }
    });
    revalidatePath('/admin/youth');
    return { success: true };
  } catch(e) { return { success: false, error: 'Σφάλμα δημιουργίας' }; }
}

export async function deleteParticipant(id: string) {
  await requireAuth();
  try {
    await prisma.youthParticipant.delete({ where: { id } });
    revalidatePath('/admin/youth');
    return { success: true };
  } catch (e) { return { success: false, error: 'Σφάλμα' }; }
}

export async function updateConsent(id: string, hasConsent: boolean) {
   await requireAuth();
   try {
     await prisma.youthParticipant.update({
        where: { id },
        data: { parentConsentDate: hasConsent ? new Date() : null }
     });
     revalidatePath('/admin/youth');
     return { success: true };
   } catch(e) { return { success: false, error: 'Σφάλμα' }; }
}

// -- ENROLLMENTS -- //

export async function enrollParticipant(programId: string, participantId: string) {
   await requireAuth();
   try {
     await prisma.programEnrollment.create({
        data: { programId, participantId }
     });
     revalidatePath('/admin/youth');
     return { success: true };
   } catch(e) { return { success: false, error: 'Ήδη εγγεγραμμένος' }; }
}

export async function unenrollParticipant(programId: string, participantId: string) {
   await requireAuth();
   try {
     await prisma.programEnrollment.deleteMany({
        where: { programId, participantId }
     });
     revalidatePath('/admin/youth');
     return { success: true };
   } catch(e) { return { success: false, error: 'Σφάλμα' }; }
}
