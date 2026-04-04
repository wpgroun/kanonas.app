import { getInventory } from '@/actions/inventory';
import InventoryClient from './InventoryClient';

export const metadata = {
  title: 'Αποθήκη & Logistics | Kanonas',
};

export default async function InventoryPage() {
  const { data: items } = await getInventory();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Αποθήκη Φιλοπτώχου</h1>
        <p className="text-sm text-gray-500">Logistics Διαχείρισης Αγαθών & Συνταγολογίου</p>
      </div>

      <InventoryClient initialData={items || []} />
    </div>
  );
}
