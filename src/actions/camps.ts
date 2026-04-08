'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/requireAuth';
import { getCurrentTempleId } from '@/actions/core';
import { revalidatePath } from 'next/cache';

const CAMP_PATH = '/admin/youth';

// ─── CAMP SESSION CRUD ──────────────────────────────────────────

export async function getCamps() {
  const templeId = await getCurrentTempleId();
  return prisma.campSession.findMany({
    where: { templeId },
    include: {
      _count: { select: { campers: true } },
      campers: { select: { payments: true } }
    },
    orderBy: { startDate: 'desc' }
  });
}

export async function createCamp(data: {
  name: string; startDate: string; endDate: string;
  maxCapacity?: number; pricePerSlot?: number;
}) {
  await requireAuth();
  const templeId = await getCurrentTempleId();
  const camp = await prisma.campSession.create({
    data: {
      templeId, name: data.name,
      startDate: new Date(data.startDate), endDate: new Date(data.endDate),
      maxCapacity: data.maxCapacity || 100,
      pricePerSlot: data.pricePerSlot || 0,
    }
  });
  revalidatePath(CAMP_PATH);
  return { success: true, data: camp };
}

export async function deleteCamp(id: string) {
  await requireAuth();
  const templeId = await getCurrentTempleId();
  const camp = await prisma.campSession.findFirst({ where: { id, templeId } });
  if (!camp) return { success: false, error: 'Not found' };
  await prisma.campSession.delete({ where: { id } });
  revalidatePath(CAMP_PATH);
  return { success: true };
}

export async function getCampDetail(sessionId: string) {
  const templeId = await getCurrentTempleId();
  return prisma.campSession.findFirst({
    where: { id: sessionId, templeId },
    include: {
      campers: {
        include: {
          payments: true,
          attendances: true,
          group: { select: { name: true } },
          medicalInfo: true,
          consent: true,
        },
        orderBy: { lastName: 'asc' }
      },
      groups: { include: { campers: { select: { id: true } } } },
      staff: true,
    }
  });
}

// ─── GROUPS ─────────────────────────────────────────────────────

export async function createGroup(sessionId: string, name: string, color?: string) {
  await requireAuth();
  await prisma.campGroup.create({ data: { sessionId, name, color: color || null } });
  revalidatePath(CAMP_PATH);
  return { success: true };
}

export async function deleteGroup(id: string) {
  await requireAuth();
  await prisma.campGroup.delete({ where: { id } });
  revalidatePath(CAMP_PATH);
  return { success: true };
}

// ─── REGISTRATION & CAMPERS ─────────────────────────────────────

export async function registerCamper(sessionId: string, data: {
  firstName: string; lastName: string; dateOfBirth: string; gender: string;
  fatherName?: string; motherName?: string;
  phone?: string; email?: string; address?: string; city?: string;
  tshirtSize?: string; tshirtColor?: string;
  groupId?: string; depositAmount?: number;
}) {
  await requireAuth();
  const templeId = await getCurrentTempleId();

  const camper = await prisma.campCamper.create({
    data: {
      templeId, sessionId,
      firstName: data.firstName, lastName: data.lastName,
      fatherName: data.fatherName || null, motherName: data.motherName || null,
      dateOfBirth: new Date(data.dateOfBirth), gender: data.gender,
      phone: data.phone || null, email: data.email || null,
      address: data.address || null, city: data.city || null,
      tshirtSize: data.tshirtSize || null, tshirtColor: data.tshirtColor || null,
      groupId: data.groupId || null,
    }
  });

  if (data.depositAmount && data.depositAmount > 0) {
    await prisma.campPayment.create({
      data: {
        camperId: camper.id,
        amount: data.depositAmount,
        type: 'prokatavoli',
        method: 'cash'
      }
    });
  }

  revalidatePath(CAMP_PATH);
  return { success: true, data: camper };
}

export async function updateCamperMedical(camperId: string, data: {
  allergies?: string; medications?: string; conditions?: string;
  notes?: string; doctorName?: string; doctorPhone?: string;
}) {
  await requireAuth();
  await prisma.campMedical.upsert({
    where: { camperId },
    update: {
      allergies: data.allergies || null, medications: data.medications || null,
      conditions: data.conditions || null, notes: data.notes || null,
      doctorName: data.doctorName || null, doctorPhone: data.doctorPhone || null,
    },
    create: {
      camperId,
      allergies: data.allergies || null, medications: data.medications || null,
      conditions: data.conditions || null, notes: data.notes || null,
      doctorName: data.doctorName || null, doctorPhone: data.doctorPhone || null,
    }
  });
  revalidatePath(CAMP_PATH);
  return { success: true };
}

export async function updateCamperConsent(camperId: string, data: {
  parentName: string; photoConsent: boolean; medicalConsent: boolean; signedAt?: string;
}) {
  await requireAuth();
  await prisma.campConsent.upsert({
    where: { camperId },
    update: {
      parentName: data.parentName,
      photoConsent: data.photoConsent, medicalConsent: data.medicalConsent,
      signedAt: data.signedAt ? new Date(data.signedAt) : new Date(),
    },
    create: {
      camperId, parentName: data.parentName,
      photoConsent: data.photoConsent, medicalConsent: data.medicalConsent,
      signedAt: data.signedAt ? new Date(data.signedAt) : new Date(),
    }
  });
  revalidatePath(CAMP_PATH);
  return { success: true };
}

export async function updateCamperGroup(camperId: string, groupId?: string | null) {
  await requireAuth();
  await prisma.campCamper.update({
    where: { id: camperId },
    data: { groupId: groupId || null }
  });
  revalidatePath(CAMP_PATH);
  return { success: true };
}

export async function deleteCamper(id: string) {
  await requireAuth();
  await prisma.campCamper.delete({ where: { id } });
  revalidatePath(CAMP_PATH);
  return { success: true };
}

// ─── PAYMENTS ───────────────────────────────────────────────────

export async function addCampPayment(camperId: string, amount: number, type: string, method?: string) {
  await requireAuth();
  await prisma.campPayment.create({
    data: { camperId, amount, type, method: method || 'cash' }
  });
  revalidatePath(CAMP_PATH);
  return { success: true };
}

// ─── ATTENDANCE ─────────────────────────────────────────────────

export async function markCampAttendance(camperId: string, dateStr: string, present: boolean, notes?: string) {
  await requireAuth();
  const date = new Date(dateStr);
  date.setHours(0,0,0,0);
  
  await prisma.campAttendance.upsert({
    where: { camperId_date: { camperId, date } },
    update: { present, notes: notes || null },
    create: { camperId, date, present, notes: notes || null }
  });
  revalidatePath(CAMP_PATH);
  return { success: true };
}

export async function bulkMarkCampAttendance(camperIds: string[], dateStr: string, present: boolean) {
  await requireAuth();
  const date = new Date(dateStr);
  date.setHours(0,0,0,0);

  // Prisma doesn't have bulk upsert simply, so we loop (it's internal admin level)
  for (const camperId of camperIds) {
    await prisma.campAttendance.upsert({
      where: { camperId_date: { camperId, date } },
      update: { present },
      create: { camperId, date, present }
    });
  }
  revalidatePath(CAMP_PATH);
  return { success: true };
}

// ─── STAFF ──────────────────────────────────────────────────────

export async function addCampStaff(sessionId: string, data: {
  firstName: string; lastName: string; role: string; phone?: string; email?: string;
}) {
  await requireAuth();
  await prisma.campStaff.create({
    data: {
      sessionId, firstName: data.firstName, lastName: data.lastName,
      role: data.role, phone: data.phone || null, email: data.email || null,
    }
  });
  revalidatePath(CAMP_PATH);
  return { success: true };
}

export async function removeCampStaff(id: string) {
  await requireAuth();
  await prisma.campStaff.delete({ where: { id } });
  revalidatePath(CAMP_PATH);
  return { success: true };
}

// ─── CANCEL REGISTRATION ────────────────────────────────────────

export async function cancelRegistration(camperId: string) {
  await requireAuth();
  await prisma.campCamper.delete({ where: { id: camperId } });
  revalidatePath(CAMP_PATH);
  return { success: true };
}

// ─── ASSIGN GROUP ───────────────────────────────────────────────

export async function assignGroup(camperId: string, groupId: string | null) {
  await requireAuth();
  await prisma.campCamper.update({
    where: { id: camperId },
    data: { groupId: groupId || null }
  });
  revalidatePath(CAMP_PATH);
  return { success: true };
}

// ─── STATS DASHBOARD ────────────────────────────────────────────

export async function getCampStats(sessionId: string) {
  const templeId = await getCurrentTempleId();
  const camp = await prisma.campSession.findFirst({
    where: { id: sessionId, templeId },
    include: {
      campers: { include: { payments: true } },
      groups: { include: { _count: { select: { campers: true } } } }
    }
  });
  
  if (!camp) return null;

  const totalCampers = camp.campers.length;
  const capacity = camp.maxCapacity || 1;
  const fillRate = Math.round((totalCampers / capacity) * 100);

  let totalCollected = 0;
  let expectedRevenue = totalCampers * camp.pricePerSlot;

  camp.campers.forEach(c => {
    totalCollected += c.payments.reduce((acc, p) => acc + p.amount, 0);
  });

  const groupDistribution = camp.groups.map(g => ({
    name: g.name,
    count: g._count.campers
  }));

  // Not assigned to a group
  const unassigned = camp.campers.filter(c => !c.groupId).length;
  if (unassigned > 0) {
    groupDistribution.push({ name: 'Χωρίς Ομάδα', count: unassigned });
  }

  return {
    totalCampers,
    capacity,
    fillRate: Math.min(fillRate, 100),
    totalCollected,
    expectedRevenue,
    groupDistribution
  };
}
