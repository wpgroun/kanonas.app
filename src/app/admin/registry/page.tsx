import { requireAuth } from '@/lib/requireAuth';
import { getCurrentTempleId } from '@/actions/core';
import { prisma } from '@/lib/prisma';
import PageHeader from '@/components/PageHeader';
import RegistryClient from './RegistryClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Μητρώα Τελετών | Kanonas',
};

export default async function RegistryPage() {
  await requireAuth();
  const templeId = await getCurrentTempleId();

  // Fetch all ceremonies to populate the booklet (sorted by sequenceNumber)
  const ceremonies = await prisma.ceremony.findMany({
    where: { templeId },
    orderBy: { sequenceNumber: 'asc' }
  });

  return (
    <div className="container-fluid mt-6 space-y-6">
      <PageHeader 
        title="Μητρώο & Βιβλία Τελετών"
        description="Αναζητήστε και εξάγετε σε επίσημα έγγραφα PDF τα βιβλία Γάμων, Βαπτίσεων και Κηδειών της Ενορίας."
      />
      <RegistryClient initialCeremonies={JSON.parse(JSON.stringify(ceremonies))} />
    </div>
  );
}
