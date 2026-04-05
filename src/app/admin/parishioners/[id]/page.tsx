import { getParishionerDetails } from '@/actions/parishioners'
import { getParishionerBeneficiary } from '@/actions/philanthropy'
import ParishionerProfileClient from './ParishionerProfileClient'
import { getParishionerRelationships } from '@/actions/relationships'

export default async function ParishionerProfile({ params }: { params: { id: string } }) {
  // Wait to resolve params dynamically in app router
  const { id } = await params;
  
  const p = await getParishionerDetails(id);
  
  if (!p) {
    return <div style={{ padding: '2rem' }}>Ο Ενορίτης δεν βρέθηκε.</div>
  }

  // Fetch the related Beneficiary info for Sissitio Tab
  const beneficiary = await getParishionerBeneficiary(id);
  const relationships = await getParishionerRelationships(id);

  const { prisma } = await import('@/lib/prisma');
  const auditLogs = await prisma.auditLog.findMany({
    where: { entityType: 'Parishioner', entityId: id },
    orderBy: { createdAt: 'desc' }
  });

  return <ParishionerProfileClient p={p} beneficiary={beneficiary} relationships={relationships} auditLogs={auditLogs} />;
}
