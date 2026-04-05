'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/requireAuth';
import { getCurrentTempleId } from '@/actions/core';
import { revalidatePath } from 'next/cache';

const PATH = '/admin/bloodbank';
const ELIGIBILITY_DAYS = 56; // 8 weeks for whole blood

// ─── BLOOD TYPE COMPATIBILITY ───────────────────────────────────
const COMPATIBILITY: Record<string, string[]> = {
  'O-':  ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
  'O+':  ['O+', 'A+', 'B+', 'AB+'],
  'A-':  ['A-', 'A+', 'AB-', 'AB+'],
  'A+':  ['A+', 'AB+'],
  'B-':  ['B-', 'B+', 'AB-', 'AB+'],
  'B+':  ['B+', 'AB+'],
  'AB-': ['AB-', 'AB+'],
  'AB+': ['AB+'],
};

export function getCompatibleRecipients(donorType: string): string[] {
  return COMPATIBILITY[donorType] || [];
}

export function getCompatibleDonors(recipientType: string): string[] {
  return Object.entries(COMPATIBILITY)
    .filter(([, recipients]) => recipients.includes(recipientType))
    .map(([donor]) => donor);
}

// ─── ELIGIBILITY ────────────────────────────────────────────────
function calculateEligibility(lastDonation: Date | null, gender?: string | null, hemoglobin?: number | null) {
  const now = new Date();
  if (!lastDonation) return { status: 'eligible' as const, daysUntil: 0 };
  
  const nextDate = new Date(lastDonation);
  nextDate.setDate(nextDate.getDate() + ELIGIBILITY_DAYS);
  const daysUntil = Math.ceil((nextDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
  
  if (daysUntil <= 0) return { status: 'eligible' as const, daysUntil: 0, nextDate };
  if (daysUntil <= 14) return { status: 'soon' as const, daysUntil, nextDate };
  return { status: 'ineligible' as const, daysUntil, nextDate };
}

// ─── DONORS (ΔΟΤΕΣ) ────────────────────────────────────────────

export async function getBloodDonors(filters?: { bloodType?: string; eligibility?: string }) {
  const templeId = await getCurrentTempleId();
  const where: any = { templeId, isActive: true };
  if (filters?.bloodType) where.bloodType = filters.bloodType;

  const donors = await prisma.bloodDonor.findMany({
    where,
    include: { donations: { orderBy: { date: 'desc' }, take: 1 } },
    orderBy: { lastName: 'asc' }
  });

  const enriched = donors.map((d: any) => {
    const elig = calculateEligibility(d.lastDonation, d.gender, d.hemoglobin);
    return { ...d, eligibility: elig };
  });

  if (filters?.eligibility) {
    return enriched.filter((d: any) => d.eligibility.status === filters.eligibility);
  }
  return enriched;
}

export async function addBloodDonor(data: {
  firstName: string; lastName: string; phone?: string; email?: string;
  address?: string; bloodType: string; dateOfBirth?: string; gender?: string;
  hemoglobin?: number; notes?: string; parishionerId?: string;
}) {
  const session = await requireAuth();
  const templeId = await getCurrentTempleId();

  const donor = await prisma.bloodDonor.create({
    data: {
      templeId,
      firstName: data.firstName, lastName: data.lastName,
      phone: data.phone || null, email: data.email || null,
      address: data.address || null, bloodType: data.bloodType,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
      gender: data.gender || null,
      hemoglobin: data.hemoglobin || null,
      notes: data.notes || null,
      parishionerId: data.parishionerId || null,
    } as any
  });

  await prisma.auditLog.create({
    data: { templeId, userId: session.userId, userEmail: session.userEmail,
      action: 'BLOOD_NEW_DONOR', detail: `${data.firstName} ${data.lastName} (${data.bloodType})` }
  });

  revalidatePath(PATH);
  return { success: true, data: donor };
}

export async function deactivateDonor(id: string) {
  await requireAuth();
  await prisma.bloodDonor.update({ where: { id }, data: { isActive: false } as any });
  revalidatePath(PATH);
  return { success: true };
}

// ─── DONATIONS (ΔΩΡΕΕΣ) ────────────────────────────────────────

export async function recordDonation(donorId: string, data: {
  date: string; hospital?: string; hemoglobinLevel?: number;
  units?: number; notes?: string; driveId?: string;
}) {
  const session = await requireAuth();
  const templeId = await getCurrentTempleId();

  // Check eligibility
  const donor = await prisma.bloodDonor.findUnique({ where: { id: donorId } });
  if (!donor) return { success: false, error: 'Δότης δεν βρέθηκε' };

  const elig = calculateEligibility(donor.lastDonation, (donor as any).gender, (donor as any).hemoglobin);
  if (elig.status === 'ineligible') {
    return { success: false, error: `Ο δότης δεν είναι επιλέξιμος. Επόμενη ημερομηνία: ${elig.nextDate?.toLocaleDateString('el-GR')}` };
  }

  // Auto certificate number
  const year = new Date(data.date).getFullYear();
  const count = await prisma.bloodDonation.count({ where: { donor: { templeId } } });
  const certificateNo = `AIM-${year}-${String(count + 1).padStart(3, '0')}`;

  const donDate = new Date(data.date);
  const nextEligible = new Date(donDate);
  nextEligible.setDate(nextEligible.getDate() + ELIGIBILITY_DAYS);

  const donation = await prisma.bloodDonation.create({
    data: {
      donorId, date: donDate,
      hospital: data.hospital || null,
      certificateNo,
      hemoglobinLevel: data.hemoglobinLevel || null,
      units: data.units || 1,
      notes: data.notes || null,
      bloodDriveId: data.driveId || null,
    } as any
  });

  // Update donor
  await prisma.bloodDonor.update({
    where: { id: donorId },
    data: {
      lastDonation: donDate,
      nextEligibleDate: nextEligible,
      totalDonations: { increment: 1 },
      hemoglobin: data.hemoglobinLevel || undefined,
    } as any
  });

  // Update drive participant if applicable
  if (data.driveId) {
    await (prisma as any).bloodDriveParticipant.updateMany({
      where: { driveId: data.driveId, donorId },
      data: { donated: true }
    }).catch(() => {});
  }

  revalidatePath(PATH);
  return { success: true, data: donation, certificateNo };
}

// ─── DRIVES (ΕΚΣΤΡΑΤΕΙΕΣ) ──────────────────────────────────────

export async function getBloodDrives() {
  const templeId = await getCurrentTempleId();
  return prisma.bloodDrive.findMany({
    where: { templeId },
    include: {
      donations: { select: { id: true, units: true } },
      participants: { include: { donor: { select: { firstName: true, lastName: true, bloodType: true } } } },
    } as any,
    orderBy: { date: 'desc' }
  });
}

export async function createBloodDrive(data: {
  name: string; date: string; endDate?: string; location?: string; target?: number;
  hospitalName?: string; hospitalContact?: string; hospitalPhone?: string;
  timeStart?: string; timeEnd?: string; notes?: string;
}) {
  await requireAuth();
  const templeId = await getCurrentTempleId();
  const drive = await prisma.bloodDrive.create({
    data: {
      templeId, name: data.name, date: new Date(data.date),
      endDate: data.endDate ? new Date(data.endDate) : null,
      location: data.location || null, target: data.target || null,
      hospitalName: data.hospitalName || null,
      hospitalContact: data.hospitalContact || null,
      hospitalPhone: data.hospitalPhone || null,
      timeStart: data.timeStart || null, timeEnd: data.timeEnd || null,
      notes: data.notes || null,
    } as any
  });
  revalidatePath(PATH);
  return { success: true, data: drive };
}

export async function updateDriveStatus(id: string, status: string) {
  await requireAuth();
  await prisma.bloodDrive.update({ where: { id }, data: { status } as any });
  revalidatePath(PATH);
  return { success: true };
}

export async function signUpForDrive(driveId: string, donorId: string) {
  await requireAuth();
  await (prisma as any).bloodDriveParticipant.create({
    data: { driveId, donorId }
  });
  revalidatePath(PATH);
  return { success: true };
}

// ─── EMERGENCY FILTER ───────────────────────────────────────────

export async function findEligibleDonorsForType(bloodType: string) {
  const templeId = await getCurrentTempleId();
  const compatibleTypes = getCompatibleDonors(bloodType);

  const donors = await prisma.bloodDonor.findMany({
    where: { templeId, isActive: true, bloodType: { in: compatibleTypes } },
    orderBy: { lastName: 'asc' }
  });

  return donors
    .map((d: any) => ({ ...d, eligibility: calculateEligibility(d.lastDonation, d.gender, d.hemoglobin) }))
    .filter((d: any) => d.eligibility.status === 'eligible');
}

// ─── DASHBOARD STATS ────────────────────────────────────────────

export async function getBloodBankDashboard() {
  const templeId = await getCurrentTempleId();
  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const prevYearStart = new Date(now.getFullYear() - 1, 0, 1);
  const prevYearEnd = new Date(now.getFullYear(), 0, 1);
  const next30Days = new Date(now); next30Days.setDate(next30Days.getDate() + 30);
  const next14Days = new Date(now); next14Days.setDate(next14Days.getDate() + 14);

  const [activeDonors, thisYearDonations, prevYearDonations, upcomingDrives] = await Promise.all([
    prisma.bloodDonor.findMany({
      where: { templeId, isActive: true },
      select: { id: true, bloodType: true, lastDonation: true, firstName: true, lastName: true, gender: true }
    }) as unknown as any[],
    prisma.bloodDonation.count({ where: { donor: { templeId }, date: { gte: yearStart } } }),
    prisma.bloodDonation.count({ where: { donor: { templeId }, date: { gte: prevYearStart, lt: prevYearEnd } } }),
    prisma.bloodDrive.findMany({
      where: { templeId, date: { gte: now, lte: next30Days } },
      orderBy: { date: 'asc' }
    }),
  ]);

  // Group by blood type
  const bloodTypeGroups: Record<string, number> = {};
  let eligibleNow = 0;
  let soonEligible = 0;

  for (const d of activeDonors) {
    bloodTypeGroups[d.bloodType] = (bloodTypeGroups[d.bloodType] || 0) + 1;
    const elig = calculateEligibility(d.lastDonation, (d as any).gender, null);
    if (elig.status === 'eligible') eligibleNow++;
    if (elig.status === 'soon') soonEligible++;
  }

  return {
    totalActive: activeDonors.length,
    eligibleNow, soonEligible,
    thisYearDonations, prevYearDonations,
    bloodTypeDistribution: Object.entries(bloodTypeGroups).map(([type, count]) => ({ type, count })),
    upcomingDrives,
  };
}

// ─── TOP DONORS ─────────────────────────────────────────────────

export async function getTopDonors(limit: number = 10) {
  const templeId = await getCurrentTempleId();
  return prisma.bloodDonor.findMany({
    where: { templeId, isActive: true },
    orderBy: { totalDonations: 'desc' } as any,
    take: limit,
    select: { id: true, firstName: true, lastName: true, bloodType: true, totalDonations: true, lastDonation: true } as any,
  });
}
