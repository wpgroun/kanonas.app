import { getSuperAdminStats } from '@/actions/superadmin';
import MapClient from './MapClient';
import PageHeader from '@/components/PageHeader';
import { requireSuperAdmin } from '@/lib/requireAuth';

export default async function SuperMapPage() {
  await requireSuperAdmin();
  const stats = await getSuperAdminStats();
  
  return (
    <div className="container-fluid mt-6 space-y-6">
      <PageHeader 
        title="Χάρτης Δικτύου Ναών"
        description="Γεωγραφική απεικόνιση όλων των εγγεγραμμένων Ναών και Μητροπόλεων στο Kanonas."
      />
      <MapClient temples={stats.recentTemples} />
    </div>
  );
}
