import { requireAuth } from '@/lib/requireAuth';
import { getCurrentTempleId } from '@/actions/core';
import { prisma } from '@/lib/prisma';
import PageHeader from '@/components/PageHeader';
import CeremoniesClient from './CeremoniesClient';

export default async function CeremoniesPage() {
  await requireAuth();
  const templeId = await getCurrentTempleId();

  // Fetch initial list of ceremonies with documents
  const ceremonies = await prisma.ceremony.findMany({
    where: { templeId },
    include: { documents: true },
    orderBy: { date: 'desc' }
  });

  return (
    <div className="container-fluid mt-6 space-y-6">
      <PageHeader 
        title="Διαχείριση Τελετών"
        description="Ολοκληρωμένο σύστημα καταγραφής Γάμων, Βαπτίσεων και Κηδειών με αυτοματοποιημένο έλεγχο δικαιολογητικών."
      />
      <CeremoniesClient initialCeremonies={JSON.parse(JSON.stringify(ceremonies))} />
    </div>
  );
}
