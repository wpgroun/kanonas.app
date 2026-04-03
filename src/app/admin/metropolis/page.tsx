import { prisma } from '@/lib/prisma';
import DashboardClient from './DashboardClient';
import { notFound } from 'next/navigation';

export default async function MetropolisPage() {
  
  // Φέρνουμε όλους τους ναούς για τον super-admin
  const temples = await prisma.temple.findMany({
    include: {
      tokens: { select: { id: true, status: true, serviceType: true } },
      sacraments: { select: { id: true } },
      donations: { select: { amount: true } }
    }
  });

  return (
    <div className="container-fluid mt-6 max-w-7xl">
      <div className="mb-6">
         <h1 className="text-3xl font-bold tracking-tight">Κεντρικό Dashboard Μητροπόλεως</h1>
         <p className="text-muted-foreground mt-1">Εποπτεία Ναών, Στατιστικά Μυστηρίων & Έγκριση Αιτημάτων.</p>
      </div>
      <DashboardClient initialTemples={temples} />
    </div>
  );
}

