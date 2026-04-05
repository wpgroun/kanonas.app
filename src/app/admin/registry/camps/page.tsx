import { getCamps } from '@/actions/camps';
import { getParishioners } from '@/actions/parishioners';
import CampsClient from './CampsClient';

export const metadata = {
 title: 'Ενοριακή Κατασκήνωση | Kanonas',
};

export default async function CampsPage() {
 const camps = await getCamps();
 // Fetch parishioners to allow easy selection of existing children for registration
 const allParishioners = await getParishioners();
 
 return (
 <div className="max-w-7xl mx-auto space-y-6">
 <div>
 <h1 className="text-2xl font-bold text-[var(--foreground)] flex items-center gap-2">🏕️ Ενοριακές Κατασκηνώσεις - Νεανικό Έργο</h1>
 <p className="text-sm text-[var(--text-muted)]">Οργάνωση θερινών κατασκηνώσεων, δήλωση συμμετοχών και ιατρικών δελτίων ενοριτών.</p>
 </div>

 <CampsClient initialCamps={camps} parishioners={allParishioners} />
 </div>
);
}
