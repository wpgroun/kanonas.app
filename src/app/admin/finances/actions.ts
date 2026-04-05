'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth';
import { getCurrentTempleId } from '@/actions/core';
import { requireAuth } from '@/lib/requireAuth';

export async function addExpense(data: { purpose: string, amount: number, date: string, category: string, vendor: string, receiptNumber: string }) {
  try {
    await requireAuth();
    const templeId = await getCurrentTempleId();
    await prisma.expense.create({
      data: {
        templeId,
        purpose: data.purpose,
        amount: data.amount,
        date: new Date(data.date),
        categoryId: data.category,
        vendor: data.vendor,
        receiptNumber: data.receiptNumber
      }
    });
    revalidatePath('/admin/finances/ledger');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function upsertBudget(data: { year: number, category: string, estimatedAmt: number, actualAmt: number }) {
  try {
    await requireAuth();
    const templeId = await getCurrentTempleId();
    
    const existing = await prisma.budget.findFirst({
      where: { templeId, year: data.year, categoryId: data.category }
    });

    if (existing) {
      await prisma.budget.update({
        where: { id: existing.id },
        data: { estimatedAmt: data.estimatedAmt, actualAmt: data.actualAmt }
      });
    } else {
      await prisma.budget.create({
        data: {
          templeId,
          year: data.year,
          categoryId: data.category,
          estimatedAmt: data.estimatedAmt,
          actualAmt: data.actualAmt
        }
      });
    }
    
    revalidatePath('/admin/finances/budget');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Get financial summary for the dashboard — Net result (Income - Expenses)
 */
export async function getFinancialSummary(year: number) {
  await requireAuth();
  const templeId = await getCurrentTempleId();

  const startDate = new Date(`${year}-01-01`);
  const endDate = new Date(`${year}-12-31`);

  const [incomeAgg, expenseAgg, donationAgg] = await Promise.all([
    prisma.income.aggregate({
      where: { templeId, date: { gte: startDate, lte: endDate } },
      _sum: { amount: true },
      _count: true
    }),
    prisma.expense.aggregate({
      where: { templeId, date: { gte: startDate, lte: endDate } },
      _sum: { amount: true },
      _count: true
    }),
    prisma.donation.aggregate({
      where: { templeId, date: { gte: startDate, lte: endDate } },
      _sum: { amount: true },
      _count: true
    })
  ]);

  const totalIncome = (incomeAgg._sum.amount || 0) + (donationAgg._sum.amount || 0);
  const totalExpenses = expenseAgg._sum.amount || 0;
  const netResult = totalIncome - totalExpenses;

  // Monthly cash flow
  const months = [];
  for (let m = 1; m <= 12; m++) {
    const mStart = new Date(`${year}-${String(m).padStart(2, '0')}-01`);
    const mEnd = new Date(m === 12 ? `${year + 1}-01-01` : `${year}-${String(m + 1).padStart(2, '0')}-01`);
    
    const [mIncome, mExpense, mDonation] = await Promise.all([
      prisma.income.aggregate({
        where: { templeId, date: { gte: mStart, lt: mEnd } },
        _sum: { amount: true }
      }),
      prisma.expense.aggregate({
        where: { templeId, date: { gte: mStart, lt: mEnd } },
        _sum: { amount: true }
      }),
      prisma.donation.aggregate({
        where: { templeId, date: { gte: mStart, lt: mEnd } },
        _sum: { amount: true }
      })
    ]);

    const inc = (mIncome._sum.amount || 0) + (mDonation._sum.amount || 0);
    const exp = mExpense._sum.amount || 0;
    months.push({ month: m, income: inc, expense: exp, net: inc - exp });
  }

  return {
    totalIncome,
    totalExpenses,
    totalDonations: donationAgg._sum.amount || 0,
    netResult,
    incomeCount: (incomeAgg._count || 0) + (donationAgg._count || 0),
    expenseCount: expenseAgg._count || 0,
    cashFlow: months
  };
}
