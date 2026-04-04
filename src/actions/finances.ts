'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { requireAuth } from '@/lib/requireAuth'
import { getCurrentTempleId } from './core'

// -- Categories -- //

export async function getFinancialCategories() {
  await requireAuth();
  const templeId = await getCurrentTempleId();
  try {
    return await prisma.financialCategory.findMany({
      where: { templeId },
      orderBy: [ { type: 'asc' }, { name: 'asc' } ]
    });
  } catch (e) {
    return [];
  }
}

export async function addFinancialCategory(data: { name: string, type: string }) {
  const session = await requireAuth();
  if(!session.canEditFinances) return { success: false, error: 'Μη Εξουσιοδοτημένη ενέργεια' };
  
  const templeId = await getCurrentTempleId();
  try {
    const entry = await prisma.financialCategory.create({
      data: { templeId, name: data.name, type: data.type }
    });
    revalidatePath('/admin/finances/categories');
    return { success: true, entry };
  } catch(e) {
    return { success: false, error: 'Σφάλμα δημιουργίας' };
  }
}

export async function deleteFinancialCategory(id: string) {
  const session = await requireAuth();
  if(!session.canEditFinances) return { success: false, error: 'Μη Εξουσιοδοτημένη ενέργεια' };

  try {
    // Check if it's used in budgets/expenses/incomes
    const incomeCount = await prisma.income.count({ where: { categoryId: id } });
    const expenseCount = await prisma.expense.count({ where: { categoryId: id } });
    if(incomeCount > 0 || expenseCount > 0) {
       return { success: false, error: 'Δεν μπορεί να διαγραφεί (υπάρχουν έσοδα/έξοδα). Διαβάψτε τα πρώτα ή μεταφέρετέ τα.'}
    }
    await prisma.financialCategory.delete({ where: { id } });
    revalidatePath('/admin/finances/categories');
    return { success: true };
  } catch(e) {
    return { success: false, error: 'Oops! Σφάλμα διαγραφής.' };
  }
}

// -- Budgets & Restructuring -- //

export async function getBudgets(year: number) {
  await requireAuth();
  const templeId = await getCurrentTempleId();
  try {
    return await prisma.budget.findMany({
      where: { templeId, year },
      include: { category: true },
      orderBy: { category: { name: 'asc' } }
    });
  } catch (e) {
    return [];
  }
}

export async function saveBudget(categoryId: string, year: number, estimatedAmt: number, oldAmt: number = 0) {
  const session = await requireAuth();
  if(!session.canEditFinances) return { success: false, error: 'Μη Εξουσιοδοτημένη' };
  
  const templeId = await getCurrentTempleId();

  // Check if year is sealed
  const fy = await prisma.financialYear.findUnique({ where: { templeId_year: { templeId, year } } });
  if (fy?.isSealed) {
    return { success: false, error: 'Το Οικονομικό Έτος είναι σφραγισμένο. Καμία αλλαγή δε μπορεί να γίνει.' };
  }

  try {
    const budget = await prisma.budget.upsert({
      where: { templeId_year_categoryId: { templeId, year, categoryId } },
      update: { estimatedAmt },
      create: { templeId, year, categoryId, estimatedAmt, actualAmt: 0 }
    });

    // If it's an update and value changed, log it (Restructuring)
    if (oldAmt !== estimatedAmt && oldAmt > 0) {
       await prisma.auditLog.create({
         data: {
           templeId,
           userId: session.userId,
           userEmail: 'User', // Will be ignored safely or handled
           action: `ΑΝΑΔΙΑΜΟΡΦΩΣΗ ΠΡΟΫΠΟΛΟΓΙΣΜΟΥ (${year})`,
           detail: `Κατηγορία [${categoryId}] από €${oldAmt} σε €${estimatedAmt}.`,
         }
       }).catch(() => {}); // catch harmlessly if context missing
    }

    revalidatePath('/admin/finances/budget');
    return { success: true, budget };
  } catch(e) {
    return { success: false, error: 'Σφάλμα αποθήκευσης προϋπολογισμού' };
  }
}

// -- Income / Expense & Actuals -- //

export async function addTransaction(data: { type: 'INCOME'|'EXPENSE', categoryId: string, amount: number, date: Date, purpose?: string, donorOrVendor?: string, receiptNumber?: string }) {
  const session = await requireAuth();
  if(!session.canEditFinances) return { success: false, error: 'Μη Εξουσιοδοτημένη' };

  const templeId = await getCurrentTempleId();
  const year = new Date(data.date).getFullYear();

  // Seal Check
  const fy = await prisma.financialYear.findUnique({ where: { templeId_year: { templeId, year } } });
  if (fy?.isSealed) return { success: false, error: `Το ${year} είναι Σφραγισμένο.` };

  try {
     // Transaction
     return await prisma.$transaction(async (tx) => {
        if(data.type === 'INCOME') {
           await tx.income.create({ data: {
             templeId, categoryId: data.categoryId, amount: data.amount, date: data.date,
             description: data.purpose, donorName: data.donorOrVendor, receiptNumber: data.receiptNumber
           } });
        } else {
           await tx.expense.create({ data: {
             templeId, categoryId: data.categoryId, amount: data.amount, date: data.date,
             purpose: data.purpose || 'Γενικό Έξοδο', vendor: data.donorOrVendor, receiptNumber: data.receiptNumber
           } });
        }

        // Update Actuals in Budget
        await tx.budget.upsert({
           where: { templeId_year_categoryId: { templeId, year, categoryId: data.categoryId } },
           update: { actualAmt: { increment: data.amount } },
           create: { templeId, year, categoryId: data.categoryId, estimatedAmt: 0, actualAmt: data.amount }
        });

        // Add an audit log automatically
        await tx.auditLog.create({
          data: {
             templeId, userId: session.userId, userEmail: session.userId, 
             action: `NEA ЕГГРАФΗ ${data.type}`, 
             detail: `Kαταχώρηση €${data.amount} στο [${data.categoryId}]`
          }
        }).catch(()=>{});

        return { success: true };
     });
  } catch(e) {
     return { success: false, error: 'Τεχνικό Σφάλμα κατά την αποθήκευση.' };
  }
}

export async function getLedgerTransactions() {
  await requireAuth();
  const templeId = await getCurrentTempleId();
  try {
    const incs = await prisma.income.findMany({ where: { templeId }, include: { category: true }});
    const exps = await prisma.expense.findMany({ where: { templeId }, include: { category: true }});
    
    // Unify them for the timeline
    const all = [
      ...incs.map(i => ({ ...i, type: 'INCOME' as 'INCOME'|'EXPENSE'})),
      ...exps.map(e => ({ ...e, type: 'EXPENSE' as 'INCOME'|'EXPENSE'}))
    ];

    // Sort by date descending
    all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return all;
  } catch (e) {
    return [];
  }
}

export async function getFinanceStats() {
  await requireAuth();
  const templeId = await getCurrentTempleId();
  try {
    const year = new Date().getFullYear();
    const prevYear = year - 1;

    const incomes = await prisma.income.findMany({ where: { templeId }, include: { category: true }});
    const expenses = await prisma.expense.findMany({ where: { templeId }, include: { category: true }});

    const totalIncome = incomes.reduce((s: number, i: any) => s + i.amount, 0);
    const totalExpense = expenses.reduce((s: number, e: any) => s + e.amount, 0);

    const totalCurrentYear = incomes.filter((i: any) => new Date(i.date).getFullYear() === year).reduce((s: number,i: any) => s + i.amount, 0);
    const totalPrevYear = incomes.filter((i: any) => new Date(i.date).getFullYear() === prevYear).reduce((s: number,i: any) => s + i.amount, 0);

    const byCategory = incomes.reduce((acc: any, i: any) => {
       const catName = i.category?.name || 'Ακατηγοριοποίητα';
       acc[catName] = (acc[catName] || 0) + i.amount;
       return acc;
    }, {} as Record<string, number>);

    return { totalIncome, totalExpense, totalCurrentYear, totalPrevYear, byCategory, currentYear: year, prevYear, year };
  } catch(e) {
    return { totalIncome: 0, totalExpense: 0, totalCurrentYear: 0, totalPrevYear: 0, byCategory: {}, currentYear: 2026, prevYear: 2025, year: 2026 };
  }
}

export async function sealFinancialYear(year: number) {
  const session = await requireAuth();
  if(!session.isSuperAdmin && !session.isHeadPriest) {
     return { success: false, error: 'Μόνο ο Προϊστάμενος του Ναού μπορεί να σφραγίσει τη χρονιά.' };
  }
  
  const templeId = await getCurrentTempleId();
  try {
     await prisma.$transaction(async (tx) => {
        await tx.financialYear.upsert({
           where: { templeId_year: { templeId, year } },
           update: { isSealed: true, sealedAt: new Date(), sealedBy: session.userId },
           create: { templeId, year, isSealed: true, sealedAt: new Date(), sealedBy: session.userId }
        });

        await tx.auditLog.create({
          data: {
             templeId, userId: session.userId, userEmail: session.userId, 
             action: 'ΣΦΡΑΓΙΣΜΑ ΑΠΟΛΟΓΙΣΜΟΥ', 
             detail: `Οικονομικό Έτος ${year} Κλείδωσε μόνιμα.`
          }
        });
     });

     revalidatePath('/admin/finances');
     revalidatePath('/admin/finances/budget');
     return { success: true };
  } catch(e) {
     return { success: false, error: 'Τεχνικό Σφάλμα Σφραγίσματος.' };
  }
}
