'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/requireAuth';
import { getCurrentTempleId } from '@/actions/core';
import { revalidatePath } from 'next/cache';
import { startOfDay, endOfDay } from 'date-fns';
import { generateMoveableFeastsSchedule, generateFixedFeastsSchedule, orthodoxEaster } from '@/lib/orthodoxCalendar';

// ─── Orthodox Calendar Auto-Import ─────────────────────────────────────────────

/**
 * Bulk-insert all moveable + fixed Orthodox feasts for a given year.
 * Skips entries where the same date + title already exists (idempotent).
 */
export async function bulkImportOrthodoxCalendar(year: number): Promise<{ inserted: number; skipped: number }> {
 await requireAuth();
 const templeId = await getCurrentTempleId();

 const allEntries = [
 ...generateMoveableFeastsSchedule(year),
 ...generateFixedFeastsSchedule(year),
 ];

 let inserted = 0;
 let skipped = 0;

 for (const entry of allEntries) {
 const exists = await prisma.serviceSchedule.findFirst({
 where: { templeId, title: entry.title, date: { gte: startOfDay(entry.date), lte: endOfDay(entry.date) } }
 });
 if (exists) { skipped++; continue; }

 await prisma.serviceSchedule.create({
 data: { templeId, date: entry.date, title: entry.title, isMajor: entry.isMajor, description: entry.description }
 });
 inserted++;
 }

 revalidatePath('/admin/schedule');
 return { inserted, skipped };
}

/** Return the Easter date for a given year (for display in UI) */
export async function getOrthodoxEasterDate(year: number): Promise<string> {
 const easter = orthodoxEaster(year);
 return easter.toLocaleDateString('el-GR', { day: 'numeric', month: 'long', year: 'numeric' });
}


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
 const existing = await prisma.serviceSchedule.findFirst({ where: { id, templeId } });
 if (!existing) return { success: false, error: 'Unauthorized' };
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
