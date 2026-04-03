'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth';

const TEMP_TEMPLE_ID = "cm0testtempleid0000000001";

async function getCurrentTempleId() {
  const session = await getSession();
  return session?.templeId || TEMP_TEMPLE_ID;
}

export async function addExpense(data: { purpose: string, amount: number, date: string, category: string, vendor: string, receiptNumber: string }) {
  try {
    const templeId = await getCurrentTempleId();
    await prisma.expense.create({
      data: {
        templeId,
        purpose: data.purpose,
        amount: data.amount,
        date: new Date(data.date),
        category: data.category,
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
    const templeId = await getCurrentTempleId();
    
    // Check if exists
    const existing = await prisma.budget.findFirst({
      where: { templeId, year: data.year, category: data.category }
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
          category: data.category,
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

