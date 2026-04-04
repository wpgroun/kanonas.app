'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/requireAuth';
import { getCurrentTempleId } from '@/actions/core';
import { revalidatePath } from 'next/cache';

export async function getDeceasedRegistry() {
  const templeId = await getCurrentTempleId();
  try {
     return await prisma.deceasedPerson.findMany({
        where: { templeId },
        include: {
           memorials: { orderBy: { date: 'asc' } },
           parishioner: true
        },
        orderBy: { dateOfDeath: 'desc' }
     });
  } catch (e) {
     return [];
  }
}

export async function registerDeceased(payload: any) {
  const session = await requireAuth();
  const templeId = await getCurrentTempleId();
  try {
     await prisma.deceasedPerson.create({
        data: {
           templeId,
           firstName: payload.firstName,
           lastName: payload.lastName,
           fathersName: payload.fathersName || null,
           dateOfDeath: new Date(payload.dateOfDeath),
           dateOfFuneral: payload.dateOfFuneral ? new Date(payload.dateOfFuneral) : null,
           placeOfFuneral: payload.placeOfFuneral || null,
           graveDetails: payload.graveDetails || null,
           nextOfKinName: payload.nextOfKinName || null,
           nextOfKinPhone: payload.nextOfKinPhone || null,
           causeOfDeath: payload.causeOfDeath || null,
           bookNumber: payload.bookNumber || null,
           parishionerId: payload.parishionerId || null
        }
     });

     await prisma.auditLog.create({
        data: {
           templeId, userId: session.userId, userEmail: session.userId,
           action: 'ΛΗΞΙΑΡΧΕΙΟ_ΘΑΝΑΤΩΝ',
           detail: `Νέα εγγραφή κεκοιμημένου: ${payload.lastName} ${payload.firstName}`
        }
     });

     revalidatePath('/admin/registry/funerals');
     return { success: true };
  } catch (e) {
     return { success: false, error: 'Σφάλμα κατά την εγγραφή ληξιαρχικής πράξης.' };
  }
}

export async function scheduleMemorial(deceasedId: string, payload: any) {
  const session = await requireAuth();
  try {
     await prisma.memorialService.create({
        data: {
           deceasedPersonId: deceasedId,
           type: payload.type, // 40MH, 1YEAR, etc
           date: new Date(payload.date),
           time: payload.time || null,
           officiantPriest: payload.officiantPriest || null,
           notes: payload.notes || null,
        }
     });

     revalidatePath('/admin/registry/funerals');
     return { success: true };
  } catch (e) {
     return { success: false, error: 'Σφάλμα κατά τον προγραμματισμό του Μνημοσύνου.' };
  }
}
