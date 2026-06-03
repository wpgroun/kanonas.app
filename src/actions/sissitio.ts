'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/requireAuth';
import { getCurrentTempleId } from '@/actions/core';
import { revalidatePath } from 'next/cache';

const PATH = '/admin/philanthropy';

// ─── RECIPIENTS (ΔΙΚΑΙΟΥΧΟΙ) ────────────────────────────────────

export async function getSissitioRecipients(filters?: { category?: string; active?: boolean }) {
  const templeId = await getCurrentTempleId();
  const where: any = { templeId };
  if (filters?.category) where.category = filters.category;
  if (filters?.active !== undefined) where.isActive = filters.active;

  return (prisma as any).sissitioRecipient.findMany({
    where,
    include: { medicalProfile: true, documents: true },
    orderBy: { lastName: 'asc' }
  });
}

export async function addSissitioRecipient(data: {
  firstName: string; lastName: string; fatherName?: string;
  dateOfBirth?: string; gender?: string; afm?: string;
  address?: string; city?: string; phone?: string; email?: string;
  category?: string; familyMembers?: number; notes?: string;
  allergies?: string; dietaryNeeds?: string; conditions?: string; medications?: string;
}) {
  const session = await requireAuth();
  const templeId = await getCurrentTempleId();

  // AFM duplicate check
  if (data.afm) {
    const existing = await (prisma as any).sissitioRecipient.findFirst({ where: { afm: data.afm } });
    if (existing) {
      if (existing.templeId === templeId) return { success: false, error: 'Το ΑΦΜ υπάρχει ήδη στο δικό σας μητρώο!' };
      return { success: false, error: `GDPR: Το ΑΦΜ ${data.afm} σιτίζεται ήδη σε άλλη ενορία!` };
    }
  }

  const recipient = await (prisma as any).sissitioRecipient.create({
    data: {
      templeId,
      firstName: data.firstName, lastName: data.lastName,
      fatherName: data.fatherName || null,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
      gender: data.gender || null, afm: data.afm || null,
      address: data.address || null, city: data.city || null,
      phone: data.phone || null, email: data.email || null,
      category: data.category || 'taktikos',
      familyMembers: data.familyMembers || 1,
      notes: data.notes || null,
      ...(data.allergies || data.dietaryNeeds || data.conditions || data.medications ? {
        medicalProfile: {
          create: {
            allergies: data.allergies || null,
            dietaryNeeds: data.dietaryNeeds || null,
            conditions: data.conditions || null,
            medications: data.medications || null,
          }
        }
      } : {})
    }
  });

  await (prisma as any).auditLog.create({
    data: { templeId, userId: session.userId, userEmail: session.userEmail,
      action: 'SISSITIO_NEW_RECIPIENT', detail: `${data.firstName} ${data.lastName} (${data.category || 'taktikos'})` }
  });

  revalidatePath(PATH);
  return { success: true, data: recipient };
}

export async function updateRecipientStatus(id: string, isActive: boolean) {
  await requireAuth();
  const templeId = await getCurrentTempleId();
  await (prisma as any).sissitioRecipient.update({
    where: { id }, data: { isActive }
  });
  revalidatePath(PATH);
  return { success: true };
}

// ─── ATTENDANCE (ΠΑΡΟΥΣΙΟΛΟΓΙΟ) ─────────────────────────────────

export async function getSissitioAttendance(dateStr: string) {
  const templeId = await getCurrentTempleId();
  const date = new Date(dateStr); date.setHours(0,0,0,0);
  const nextDay = new Date(date); nextDay.setDate(nextDay.getDate() + 1);

  const recipients = await (prisma as any).sissitioRecipient.findMany({
    where: { templeId, isActive: true },
    select: { id: true, firstName: true, lastName: true, category: true, familyMembers: true,
      attendances: { where: { date: { gte: date, lt: nextDay } } },
      medicalProfile: { select: { dietaryNeeds: true } }
    },
    orderBy: { lastName: 'asc' }
  });

  return recipients.map((r: any) => ({
    id: r.id, name: `${r.lastName} ${r.firstName}`,
    category: r.category, familyMembers: r.familyMembers,
    dietary: r.medicalProfile?.dietaryNeeds || null,
    status: r.attendances.length > 0 ? (r.attendances[0].present ? 'present' : 'absent') : null,
    absenceType: r.attendances[0]?.absenceType || null,
  }));
}

export async function markSissitioAttendance(recipientId: string, dateStr: string, present: boolean, absenceType?: string, reason?: string) {
  await requireAuth();
  const date = new Date(dateStr); date.setHours(0,0,0,0);

  await (prisma as any).sissitioRecipientAttendance.upsert({
    where: { recipientId_date: { recipientId, date } },
    update: { present, absenceType: absenceType || null, absenceReason: reason || null },
    create: { recipientId, date, present, absenceType: absenceType || null, absenceReason: reason || null }
  });

  revalidatePath(PATH);
  return { success: true };
}

// ─── PAYMENTS (ΣΥΝΕΙΣΦΟΡΕΣ) ─────────────────────────────────────

export async function addSissitioPayment(recipientId: string, data: { amount: number; month: number; year: number; method?: string; notes?: string }) {
  await requireAuth();
  const templeId = await getCurrentTempleId();

  // Auto receipt number
  const count = await (prisma as any).sissitioPayment.count({ where: { recipientId, year: data.year } });
  const receiptNo = `SIS-${data.year}-${String(count + 1).padStart(3, '0')}`;

  const payment = await (prisma as any).sissitioPayment.create({
    data: {
      recipientId, amount: data.amount, month: data.month, year: data.year,
      method: data.method || 'cash', receiptNo, notes: data.notes || null
    }
  });

  revalidatePath(PATH);
  return { success: true, data: payment };
}

export async function getRecipientPayments(recipientId: string) {
  return (prisma as any).sissitioPayment.findMany({
    where: { recipientId },
    orderBy: [{ year: 'desc' }, { month: 'desc' }]
  });
}

// ─── MENU (ΕΒΔΟΜΑΔΙΑΙΟ ΜΕΝΟΥ) ──────────────────────────────────

export async function getWeeklyMenu(weekStartStr: string) {
  const templeId = await getCurrentTempleId();
  const weekStart = new Date(weekStartStr); weekStart.setHours(0,0,0,0);

  return (prisma as any).sissitioMenu.findFirst({
    where: { templeId, weekStart },
    include: { days: { include: { recipes: { include: { recipe: true } } }, orderBy: { dayOfWeek: 'asc' } } }
  });
}

export async function saveWeeklyMenu(weekStartStr: string, days: any[]) {
  await requireAuth();
  const templeId = await getCurrentTempleId();
  const weekStart = new Date(weekStartStr); weekStart.setHours(0,0,0,0);

  // Upsert menu
  const existing = await (prisma as any).sissitioMenu.findFirst({ where: { templeId, weekStart } });

  if (existing) {
    // Delete old days and recreate
    await (prisma as any).sissitioMenuDay.deleteMany({ where: { menuId: existing.id } });
    for (const day of days) {
      await (prisma as any).sissitioMenuDay.create({
        data: { menuId: existing.id, dayOfWeek: day.dayOfWeek, date: new Date(day.date),
          firstCourse: day.firstCourse || null, mainCourse: day.mainCourse || null,
          salad: day.salad || null, dessert: day.dessert || null,
          bread: day.bread ?? true, isNistisimo: day.isNistisimo || false, notes: day.notes || null }
      });
    }
  } else {
    await (prisma as any).sissitioMenu.create({
      data: {
        templeId, weekStart,
        days: {
          create: days.map(d => ({
            dayOfWeek: d.dayOfWeek, date: new Date(d.date),
            firstCourse: d.firstCourse || null, mainCourse: d.mainCourse || null,
            salad: d.salad || null, dessert: d.dessert || null,
            bread: d.bread ?? true, isNistisimo: d.isNistisimo || false, notes: d.notes || null
          }))
        }
      }
    });
  }

  revalidatePath(PATH);
  return { success: true };
}

// ─── RECIPES (ΣΥΝΤΑΓΟΛΟΓΙΟ) ─────────────────────────────────────

export async function getRecipes(filters?: { category?: string; nistisimo?: boolean }) {
  const templeId = await getCurrentTempleId();
  const where: any = { templeId };
  if (filters?.category) where.category = filters.category;
  if (filters?.nistisimo !== undefined) where.isNistisimo = filters.nistisimo;

  return (prisma as any).sissitioRecipe.findMany({ where, orderBy: { name: 'asc' } });
}

export async function addRecipe(data: { name: string; category: string; servings?: number; isNistisimo?: boolean; ingredients?: any[]; instructions?: string }) {
  await requireAuth();
  const templeId = await getCurrentTempleId();
  const recipe = await (prisma as any).sissitioRecipe.create({
    data: {
      templeId, name: data.name, category: data.category,
      servings: data.servings || 10, isNistisimo: data.isNistisimo || false,
      ingredients: JSON.stringify(data.ingredients || []),
      instructions: data.instructions || null,
    }
  });
  revalidatePath(PATH);
  return { success: true, data: recipe };
}

export async function deleteRecipe(id: string) {
  await requireAuth();
  await (prisma as any).sissitioRecipe.delete({ where: { id } });
  revalidatePath(PATH);
  return { success: true };
}

// ─── PORTIONS (ΜΕΡΙΔΟΛΟΓΙΟ) ─────────────────────────────────────

export async function logPortions(dateStr: string, data: { totalPortions: number; servedPortions: number; leftover?: number; notes?: string }) {
  await requireAuth();
  const templeId = await getCurrentTempleId();
  const date = new Date(dateStr); date.setHours(0,0,0,0);

  const log = await (prisma as any).sissitioPortionLog.create({
    data: { templeId, date, totalPortions: data.totalPortions, servedPortions: data.servedPortions,
      leftover: data.leftover || null, notes: data.notes || null }
  });
  revalidatePath(PATH);
  return { success: true, data: log };
}

export async function getPortionLogs(month: number, year: number) {
  const templeId = await getCurrentTempleId();
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);

  return (prisma as any).sissitioPortionLog.findMany({
    where: { templeId, date: { gte: start, lt: end } },
    orderBy: { date: 'asc' }
  });
}

// ─── INVENTORY (ΑΠΟΘΗΚΗ) ────────────────────────────────────────

export async function getSissitioInventory() {
  const templeId = await getCurrentTempleId();
  return (prisma as any).sissitioInventoryItem.findMany({
    where: { templeId },
    include: { movements: { orderBy: { date: 'desc' }, take: 5 } },
    orderBy: { name: 'asc' }
  });
}

export async function addSissitioInventoryItem(data: { name: string; category: string; unit: string; quantity?: number; minQuantity?: number }) {
  await requireAuth();
  const templeId = await getCurrentTempleId();
  const item = await (prisma as any).sissitioInventoryItem.create({
    data: { templeId, name: data.name, category: data.category, unit: data.unit,
      quantity: data.quantity || 0, minQuantity: data.minQuantity || null }
  });
  revalidatePath(PATH);
  return { success: true, data: item };
}

export async function addInventoryMovement(itemId: string, moveType: string, quantity: number, notes?: string) {
  await requireAuth();
  const item = await (prisma as any).sissitioInventoryItem.findUnique({ where: { id: itemId } });
  if (!item) return { success: false, error: 'Είδος δεν βρέθηκε' };

  let newQty = item.quantity;
  if (moveType === 'eisagogi') newQty += quantity;
  else if (moveType === 'eksagogi') newQty -= quantity;
  else newQty = quantity; // diorthosi

  if (newQty < 0) return { success: false, error: 'Ανεπαρκές απόθεμα' };

  await (prisma as any).sissitioInventoryMovement.create({
    data: { itemId, moveType, quantity, notes: notes || null }
  });
  await (prisma as any).sissitioInventoryItem.update({
    where: { id: itemId }, data: { quantity: newQty }
  });

  revalidatePath(PATH);
  return { success: true, newQuantity: newQty };
}

// ─── DASHBOARD STATS ────────────────────────────────────────────

export async function getSissitioDashboard() {
  const templeId = await getCurrentTempleId();
  const today = new Date(); today.setHours(0,0,0,0);
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  const [totalActive, todayAttendance, lowStock, recipients] = await Promise.all([
    (prisma as any).sissitioRecipient.count({ where: { templeId, isActive: true } }),
    (prisma as any).sissitioRecipientAttendance.count({ where: { date: { gte: today, lt: tomorrow }, present: true,
      recipient: { templeId } } }),
    (prisma as any).sissitioInventoryItem.findMany({
      where: { templeId, minQuantity: { not: null } },
      select: { id: true, name: true, quantity: true, minQuantity: true }
    }),
    (prisma as any).sissitioRecipient.groupBy({
      by: ['category'], where: { templeId, isActive: true }, _count: true
    })
  ]);

  const alerts = lowStock.filter((i: any) => i.minQuantity && i.quantity <= i.minQuantity);
  const categoryDistribution = recipients.map((r: any) => ({
    category: r.category === 'taktikos' ? 'Τακτικός' : r.category === 'ektaktos' ? 'Έκτακτος' : 'Επισκέπτης',
    count: typeof r._count === 'object' ? (r._count._all || r._count.category || 0) : (r._count || 0)
  }));

  return {
    totalActive, todayPresent: todayAttendance, stockAlerts: alerts.length,
    alertItems: alerts, categoryDistribution
  };
}
