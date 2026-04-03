import { prisma } from '@/lib/prisma';
import BudgetClient from './BudgetClient';
import { notFound } from 'next/navigation';

export default async function BudgetPage() {
  const templeId = "cm0testtempleid0000000001";
  const currentYear = new Date().getFullYear();

  const budgets = await prisma.budget.findMany({
    where: { templeId, year: currentYear },
    orderBy: { category: 'asc' }
  });

  return <BudgetClient templeId={templeId} year={currentYear} initialBudgets={budgets} />;
}
