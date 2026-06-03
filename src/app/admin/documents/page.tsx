import { requireAuth } from '@/lib/requireAuth';
import { getDocTemplates } from '@/actions/documents';
import DocumentsClient from './DocumentsClient';

export default async function DocumentsPage() {
  await requireAuth();
  
  // Φέρνουμε όλα τα templates από τη βάση δεδομένων
  const templates = await getDocTemplates();

  return <DocumentsClient initialTemplates={templates} />;
}
