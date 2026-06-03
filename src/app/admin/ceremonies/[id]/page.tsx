import { requireAuth } from '@/lib/requireAuth';
import { getCurrentTempleId } from '@/actions/core';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import PageHeader from '@/components/PageHeader';
import CeremonyDetailsClient from './CeremonyDetailsClient';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: 'Στοιχεία & Δικαιολογητικά Τελετής | Kanonas',
};

export default async function CeremonyDetailsPage({ params }: PageProps) {
  await requireAuth();
  const templeId = await getCurrentTempleId();
  const { id } = await params;

  // Fetch the ceremony, ensuring tenant isolation
  const ceremony = await prisma.ceremony.findFirst({
    where: {
      id,
      templeId,
    },
    include: {
      documents: {
        orderBy: { name: 'asc' },
      },
    },
  });

  if (!ceremony) {
    notFound();
  }

  // Fetch priests in the parish for the priest re-assignment option
  const templeUsers = await prisma.userTemple.findMany({
    where: { templeId },
    include: { user: true }
  });
  
  const priests = templeUsers.map(tu => ({
    id: tu.userId,
    name: `${tu.user.firstName || ''} ${tu.user.lastName || ''}`.trim() || tu.user.email
  }));

  return (
    <div className="container-fluid mt-6 space-y-6">
      <PageHeader 
        title="Λεπτομέρειες & Δικαιολογητικά"
        description="Ελέγξτε τα στοιχεία της τελετής και ενημερώστε την κατάσταση παραλαβής των δικαιολογητικών."
      />
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-sm">
        <CeremonyDetailsClient 
          initialCeremony={JSON.parse(JSON.stringify(ceremony))} 
          priests={priests} 
        />
      </div>
    </div>
  );
}
