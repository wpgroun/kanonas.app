import { getParishionerDetails, getParishionerBeneficiary } from '../../../actions'
import ParishionerProfileClient from './ParishionerProfileClient'

export default async function ParishionerProfile({ params }: { params: { id: string } }) {
  // Wait to resolve params dynamically in app router
  const { id } = await params;
  
  const p = await getParishionerDetails(id);
  
  if (!p) {
    return <div style={{ padding: '2rem' }}>Ο Ενορίτης δεν βρέθηκε.</div>
  }

  // Fetch the related Beneficiary info for Sissitio Tab
  const beneficiary = await getParishionerBeneficiary(id);

  return <ParishionerProfileClient p={p} beneficiary={beneficiary} />;
}
