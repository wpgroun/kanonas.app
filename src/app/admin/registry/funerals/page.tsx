import { getDeceasedRegistry } from '@/actions/funerals';
import { getParishioners } from '@/actions/parishioners';
import FuneralsClient from './FuneralsClient';

export const metadata = {
  title: 'Μητρώο Κεκοιμημένων & Μνημόσυνα | Kanonas',
};

export default async function FuneralsPage() {
  const deceasedData = await getDeceasedRegistry();
  const allParishioners = await getParishioners(); // To link deceased with existing core CRM
  
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">🕊️ Ληξιαρχείο - Μητρώο Κεκοιμημένων</h1>
        <p className="text-sm text-gray-500">Καταγραφή εκδημιών, διαχείριση τάφων και προγραμματισμός Ιερών Μνημοσύνων ενοριτών.</p>
      </div>

      <FuneralsClient initialData={deceasedData} parishioners={allParishioners} />
    </div>
  );
}
