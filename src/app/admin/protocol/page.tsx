import { getProtocols } from '@/actions/protocol';
import ProtocolClient from './ProtocolClient';
import PageHeader from '@/components/PageHeader';

export const metadata = {
 title: 'Γενικό Πρωτόκολλο | Kanonas',
};

export default async function ProtocolPage({ searchParams }: { searchParams: { owner?: string, q?: string, page?: string } }) {
 const currentOwner = searchParams.owner || 'TEMPLE';
 const query = searchParams.q || '';
 const page = parseInt(searchParams.page || '1');

 const { data: protocols, total, pages } = await getProtocols(currentOwner, page, query);

 return (
 <div className="max-w-7xl mx-auto space-y-6">
 <PageHeader 
 title="Γενικό Πρωτόκολλο & Ψηφιακό Αρχείο"
 description="Βιβλία Εισερχομένων-Εξερχομένων με αυτόματη αρίθμηση και σάρωση (Scanner)"
 />

 <ProtocolClient 
 initialRecords={protocols || []} 
 currentOwner={currentOwner} 
 totalPages={pages || 1} 
 currentPage={page} 
 />
 </div>
);
}
