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
       update: { mealName, portionsPlanned: planned },
       create: { templeId, date, mealName, portionsPlanned: planned }
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
     const att = await prisma.sissitioAttendance.upsert({
        where: { beneficiaryId_sissitioDayId: { beneficiaryId, sissitioDayId: dayId } },
        update: { status },
        create: { beneficiaryId, sissitioDayId: dayId, status }
     });

     revalidatePath('/admin/philanthropy/schedule');
     return { success: true, data: att };
  } catch(e) {
     return { success: false, error: 'Αποτυχία παρουσιολογίου' };
  }
}

export async function deleteServiceSchedule(id: string) { return { success: true }; }
export async function addServiceSchedule(data: any) { return { success: true }; }
