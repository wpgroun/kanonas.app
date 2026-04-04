import { getAssets } from '@/actions/assets';
import AssetsClient from './AssetsClient';

export const metadata = {
  title: 'Περιουσιολόγιο | Kanonas',
};

export default async function AssetsPage({ searchParams }: { searchParams: { owner?: string, type?: string } }) {
  const currentOwner = searchParams.owner || 'ALL';
  const currentType = searchParams.type || 'ALL';

  const assets = await getAssets(currentOwner, currentType);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Περιουσιολόγιο Ναού & Φιλοπτώχου</h1>
        <p className="text-sm text-gray-500">Διαχείριση Ακίνητης και Κινητής Περιουσίας (Λείψανα, Σκεύη, Οικόπεδα)</p>
      </div>

      <AssetsClient initialAssets={assets} currentOwner={currentOwner} currentType={currentType} />
    </div>
  );
}
