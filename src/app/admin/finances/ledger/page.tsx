import { prisma } from '@/lib/prisma';
import LedgerClient from './LedgerClient';
import { notFound } from 'next/navigation';

export default async function LedgerPage() {
  const templeId = "cm0testtempleid0000000001"; 
  
  // Φέρε Έσοδα (Donations)
  const donations = await prisma.donation.findMany({
    where: { templeId },
    orderBy: { date: 'desc' }
  });

  // Φέρε Έξοδα (Expenses)
  const expenses = await prisma.expense.findMany({
    where: { templeId },
    orderBy: { date: 'desc' }
  });

  return <LedgerClient templeId={templeId} initialDonations={donations} initialExpenses={expenses} />;
}

