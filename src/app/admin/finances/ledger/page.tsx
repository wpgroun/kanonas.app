import { prisma } from '@/lib/prisma';
import LedgerClient from './LedgerClient';
import { requireAuth } from '@/lib/requireAuth';

export default async function LedgerPage() {
 const session = await requireAuth();
 const templeId = (session as any).templeId;
 
 // Φέρε Έσοδα (Donations)
 const donations = await prisma.donation.findMany({
 where: { templeId },
 orderBy: { date: 'desc' }
 });

 // Φέρε Έξοδα (Expenses)
 const expenses = await prisma.expense.findMany({
 where: { templeId },
 orderBy: { date: 'desc' },
 include: { category: true }
 });

 const categories = await prisma.financialCategory.findMany({
 where: { templeId, type: 'EXPENSE' },
 orderBy: { name: 'asc' }
 });

 return <LedgerClient templeId={templeId} initialDonations={donations} initialExpenses={expenses} categories={categories} />;
}

