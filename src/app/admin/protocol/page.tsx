import { getProtocols } from '@/actions/protocol';
import ProtocolClient from './ProtocolClient';

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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">Γενικό Πρωτόκολλο & Ψηφιακό Αρχείο</h1>
          <p className="text-muted-foreground mt-1 text-sm">Βιβλία Εισερχομένων-Εξερχομένων με αυτόματη αρίθμηση και σάρωση (Scanner)</p>
        </div>
        {/* Actions inside client component */}
      </div>

      <ProtocolClient 
         initialRecords={protocols || []} 
         currentOwner={currentOwner} 
         totalPages={pages || 1} 
         currentPage={page} 
      />
    </div>
  );
}
