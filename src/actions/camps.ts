'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/requireAuth';
import { getCurrentTempleId } from '@/actions/core';
import { revalidatePath } from 'next/cache';

const CAMP_PATH = '/admin/youth';

// ─── CAMP CRUD ──────────────────────────────────────────────────

export async function getCamps() {
  const templeId = await getCurrentTempleId();
  return prisma.parishCamp.findMany({
    where: { templeId },
    include: {
      registrations: { select: { id: true, paymentStatus: true, amountPaid: true, amountDue: true } },
      groups: { include: { registrations: { select: { id: true } } } },
      staff: true,
      _count: { select: { registrations: true } }
    },
    orderBy: { year: 'desc' }
  });
}

export async function createCamp(data: {
  name: string; year: number; startDate: string; endDate: string;
  location?: string; capacity?: number; pricePerSlot?: number;
}) {
  await requireAuth();
  const templeId = await getCurrentTempleId();
  const camp = await prisma.parishCamp.create({
    data: {
      templeId, name: data.name, year: data.year,
      startDate: new Date(data.startDate), endDate: new Date(data.endDate),
      location: data.location || null,
      capacity: data.capacity || 100,
      pricePerSlot: data.pricePerSlot || 0,
    }
  });
  revalidatePath(CAMP_PATH);
  return { success: true, data: camp };
}

export async function deleteCamp(id: string) {
  await requireAuth();
  const templeId = await getCurrentTempleId();
  const camp = await prisma.parishCamp.findFirst({ where: { id, templeId } });
  if (!camp) return { success: false, error: 'Not found' };
  await prisma.parishCamp.delete({ where: { id } });
  revalidatePath(CAMP_PATH);
  return { success: true };
}

// ─── CAMP DETAIL ────────────────────────────────────────────────

export async function getCampDetail(campId: string) {
  const templeId = await getCurrentTempleId();
  return prisma.parishCamp.findFirst({
    where: { id: campId, templeId },
    include: {
      registrations: {
        include: {
          payments: true,
          attendances: true,
          parishCampGroup: { select: { name: true } },
        },
        orderBy: { childLastName: 'asc' }
      },
      groups: { include: { registrations: { select: { id: true } } } },
      staff: true,
    }
  });
}

// ─── GROUPS ─────────────────────────────────────────────────────

export async function createGroup(campId: string, name: string, leaderName?: string) {
  await requireAuth();
  await prisma.parishCampGroup.create({ data: { campId, name, leaderName: leaderName || null } });
  revalidatePath(CAMP_PATH);
  return { success: true };
}

export async function deleteGroup(id: string) {
  await requireAuth();
  await prisma.parishCampGroup.delete({ where: { id } });
  revalidatePath(CAMP_PATH);
  return { success: true };
}

// ─── REGISTRATION ───────────────────────────────────────────────

export async function registerCamper(campId: string, data: {
  childFirstName: string; childLastName: string; childBirthDate?: string; gender?: string;
  parentName?: string; parentPhone?: string; parentEmail?: string;
  medicalNotes?: string; allergies?: string; medications?: string;
  tshirtColor?: string; tshirtSize?: string;
  groupId?: string; depositAmount?: number;
}) {
  const session = await requireAuth();
  const templeId = await getCurrentTempleId();

  const camp = await prisma.parishCamp.findFirst({ where: { id: campId, templeId } });
  if (!camp) return { success: false, error: 'Κατασκήνωση δεν βρέθηκε' };

  const count = await prisma.campRegistration.count({ where: { campId } });
  if (count >= camp.capacity) return { success: false, error: 'Η κατασκήνωση είναι πλήρης!' };

  const deposit = data.depositAmount || 0;
  const amountDue = camp.pricePerSlot;
  const paymentStatus = deposit >= amountDue ? 'PAID' : deposit > 0 ? 'DEPOSIT' : 'NONE';

  // Auto receipt number
  const year = camp.year;
  const nextNum = count + 1;
  const receiptNumber = `CAMP-${year}-${String(nextNum).padStart(3, '0')}`;

  const reg = await prisma.campRegistration.create({
    data: {
      campId,
      childFirstName: data.childFirstName,
      childLastName: data.childLastName,
      childBirthDate: data.childBirthDate ? new Date(data.childBirthDate) : null,
      gender: data.gender || null,
      parentName: data.parentName || null,
      parentPhone: data.parentPhone || null,
      parentEmail: data.parentEmail || null,
      medicalNotes: data.medicalNotes || null,
      allergies: data.allergies || null,
      medications: data.medications || null,
      tshirtColor: data.tshirtColor || null,
      tshirtSize: data.tshirtSize || null,
      parishCampGroupId: data.groupId || null,
      amountDue,
      amountPaid: deposit,
      depositPaid: deposit,
      receiptNumber,
      paymentStatus,
    }
  });

  if (deposit > 0) {
    await prisma.campPayment.create({
      data: { registrationId: reg.id, amount: deposit, method: 'CASH', receiptNumber, notes: 'Προκαταβολή' }
    });
  }

  await prisma.auditLog.create({
    data: {
      templeId, userId: session.userId, userEmail: session.userEmail,
      action: 'CAMP_REGISTER', detail: `${data.childFirstName} ${data.childLastName} → ${camp.name}`
    }
  });

  revalidatePath(CAMP_PATH);
  return { success: true, data: reg };
}

export async function cancelRegistration(regId: string) {
  await requireAuth();
  await prisma.campRegistration.update({ where: { id: regId }, data: { status: 'CANCELLED' } });
  revalidatePath(CAMP_PATH);
  return { success: true };
}

export async function assignGroup(regId: string, groupId: string | null) {
  await requireAuth();
  await prisma.campRegistration.update({ where: { id: regId }, data: { parishCampGroupId: groupId } });
  revalidatePath(CAMP_PATH);
  return { success: true };
}

// ─── PAYMENTS ───────────────────────────────────────────────────

export async function addCampPayment(regId: string, amount: number, method: string, notes?: string) {
  await requireAuth();
  const reg = await prisma.campRegistration.findUnique({ where: { id: regId } });
  if (!reg) return { success: false, error: 'Not found' };

  const newTotal = reg.amountPaid + amount;
  const paymentStatus = newTotal >= reg.amountDue ? 'PAID' : 'DEPOSIT';

  const count = await prisma.campPayment.count({ where: { registrationId: regId } });
  const receiptNumber = `${reg.receiptNumber}-P${count + 1}`;

  await prisma.campPayment.create({
    data: { registrationId: regId, amount, method, receiptNumber, notes: notes || null }
  });

  await prisma.campRegistration.update({
    where: { id: regId },
    data: { amountPaid: newTotal, paymentStatus }
  });

  revalidatePath(CAMP_PATH);
  return { success: true };
}

// ─── ATTENDANCE ─────────────────────────────────────────────────

export async function markCampAttendance(regId: string, dateStr: string, isPresent: boolean) {
  await requireAuth();
  const date = new Date(dateStr);
  date.setHours(0, 0, 0, 0);

  await (prisma.campAttendance as any).upsert({
    where: { registrationId_date: { registrationId: regId, date } },
    update: { isPresent },
    create: { registrationId: regId, date, isPresent }
  });

  revalidatePath(CAMP_PATH);
  return { success: true };
}

export async function getAttendanceForDate(campId: string, dateStr: string) {
  const date = new Date(dateStr);
  date.setHours(0, 0, 0, 0);
  const endDate = new Date(date);
  endDate.setDate(endDate.getDate() + 1);

  const regs = await prisma.campRegistration.findMany({
    where: { campId, status: 'REGISTERED' },
    select: {
      id: true, childFirstName: true, childLastName: true,
      parishCampGroup: { select: { name: true } },
      attendances: { where: { date: { gte: date, lt: endDate } } }
    }
  });

  return regs.map(r => ({
    regId: r.id,
    name: `${r.childLastName} ${r.childFirstName}`,
    group: r.parishCampGroup?.name || 'Χωρίς ομάδα',
    isPresent: r.attendances.length > 0 ? r.attendances[0].isPresent : null
  }));
}

// ─── CONSENT ────────────────────────────────────────────────────

export async function updateCamperConsent(regId: string, data: {
  consentPhotos: boolean; consentMedical: boolean; signedBy: string;
}) {
  await requireAuth();
  await prisma.campRegistration.update({
    where: { id: regId },
    data: {
      consentDate: new Date(),
      consentPhotos: data.consentPhotos,
      consentMedical: data.consentMedical,
      consentSignedBy: data.signedBy,
    }
  });
  revalidatePath(CAMP_PATH);
  return { success: true };
}

// ─── STAFF ──────────────────────────────────────────────────────

export async function addCampStaff(campId: string, data: { name: string; role: string; phone?: string; email?: string; groupId?: string }) {
  await requireAuth();
  await (prisma.campStaff as any).create({
    data: { campId, name: data.name, role: data.role, phone: data.phone || null, email: data.email || null, groupId: data.groupId || null }
  });
  revalidatePath(CAMP_PATH);
  return { success: true };
}

export async function removeCampStaff(id: string) {
  await requireAuth();
  await (prisma.campStaff as any).delete({ where: { id } });
  revalidatePath(CAMP_PATH);
  return { success: true };
}

// ─── STATS ──────────────────────────────────────────────────────

export async function getCampStats(campId: string) {
  const camp = await prisma.parishCamp.findUnique({
    where: { id: campId },
    include: {
      registrations: { where: { status: 'REGISTERED' } },
      groups: { include: { registrations: { where: { status: 'REGISTERED' }, select: { id: true } } } }
    }
  });
  if (!camp) return null;

  const regs = camp.registrations;
  const totalRegistered = regs.length;
  const totalRevenue = regs.reduce((s, r) => s + r.amountPaid, 0);
  const expectedRevenue = totalRegistered * camp.pricePerSlot;
  const pendingPayments = regs.filter(r => r.paymentStatus !== 'PAID').length;

  const groupDistribution = camp.groups.map(g => ({
    name: g.name,
    count: g.registrations.length
  }));
  const noGroup = totalRegistered - groupDistribution.reduce((s, g) => s + g.count, 0);
  if (noGroup > 0) groupDistribution.push({ name: 'Χωρίς ομάδα', count: noGroup });

  return {
    totalRegistered, capacity: camp.capacity,
    totalRevenue, expectedRevenue, pendingPayments,
    groupDistribution, pricePerSlot: camp.pricePerSlot
  };
}
