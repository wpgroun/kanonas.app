import { requireAuth } from '@/lib/requireAuth';
import { getCurrentTempleId } from '@/actions/core';
import { prisma } from '@/lib/prisma';
import PageHeader from '@/components/PageHeader';
import CeremonyCreateClient from './CeremonyCreateClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Καταγραφή Τελετής | Kanonas',
};

export default async function CeremonyCreatePage() {
  await requireAuth();
  const templeId = await getCurrentTempleId();

  // Fetch priests in the parish
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
        title="Καταγραφή Νέας Τελετής"
        description="Επιλέξτε τον τύπο της τελετής και συμπληρώστε τα στοιχεία για την αυτόματη δημιουργία της λίστας ελέγχου εγγράφων."
      />
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-sm">
        <CeremonyCreateClient priests={priests} />
      </div>
    </div>
  );
}
