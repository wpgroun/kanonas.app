'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/requireAuth';
import { getCurrentTempleId } from '@/actions/core';
import { revalidatePath } from 'next/cache';
import { startOfDay, endOfDay } from 'date-fns';

export async function getSchedule(dateStr: string) {
  const templeId = await getCurrentTempleId();
  const date = new Date(dateStr);
  const start = startOfDay(date);
  const end = endOfDay(date);

  try {
     const schedule = await prisma.sissitioDay.findFirst({
        where: { templeId, date: { gte: start, lte: end } },
        include: {
           attendances: {
             include: { beneficiary: true }
           }
        }
     });

     const activeBeneficiaries = await prisma.beneficiary.findMany({
       where: { templeId, status: 'APPROVED' }
     });

     return { success: true, schedule, activeBeneficiaries };
  } catch(e) {
     return { success: false, error: 'Σφάλμα ανάκτησης ημερησίου προγράμματος.' };
  }
}

export async function createOrUpdateSchedule(dateStr: string, mealName: string, planned: number) {
  const session = await requireAuth();
  const templeId = await getCurrentTempleId();
  const date = startOfDay(new Date(dateStr));

  try {
      const day = await prisma.sissitioDay.upsert({
       where: { templeId_date: { templeId, date } },
       update: { menu: mealName, totalPortions: planned },
       create: { templeId, date, menu: mealName, totalPortions: planned }
     });
     
     revalidatePath('/admin/philanthropy/schedule');
     return { success: true, day };
  } catch(e) {
     return { success: false, error: 'Αποτυχία ενημέρωσης μενού' };
  }
}

export async function markAttendance(beneficiaryId: string, dayId: string, status: string) {
  const session = await requireAuth();
  try {
     const isAbsent = status === 'ABSENT';
     const att = await prisma.sissitioAttendance.upsert({
        where: { sissitioDayId_beneficiaryId: { beneficiaryId, sissitioDayId: dayId } },
        update: { wasAbsent: isAbsent },
        create: { beneficiaryId, sissitioDayId: dayId, wasAbsent: isAbsent }
     });

     revalidatePath('/admin/philanthropy/schedule');
     return { success: true, data: att };
  } catch(e) {
     return { success: false, error: 'Αποτυχία παρουσιολογίου' };
  }
}

export async function getServiceSchedules() {
  const templeId = await getCurrentTempleId();
  try {
    return await prisma.serviceSchedule.findMany({
      where: { templeId },
      orderBy: { date: 'asc' }
    });
  } catch (e) {
    return [];
  }
}

export async function deleteServiceSchedule(id: string) { 
  const templeId = await getCurrentTempleId();
  try {
    await prisma.serviceSchedule.delete({ where: { id } });
    revalidatePath('/admin/schedule');
    return { success: true };
  } catch(e) {
    return { success: false };
  }
}

export async function addServiceSchedule(data: any) { 
  const templeId = await getCurrentTempleId();
  try {
    await prisma.serviceSchedule.create({
      data: {
        templeId,
        date: new Date(data.date),
        title: data.title,
        description: data.description,
        isMajor: data.isMajor || false
      }
    });
    revalidatePath('/admin/schedule');
    return { success: true };
  } catch(e) {
    return { success: false, error: 'Failed to add' };
  }
}
