import { getBeneficiaries } from '@/actions/philanthropy';
import BeneficiariesClient from './BeneficiariesClient';

export const metadata = {
  title: 'Μητρώο Ωφελουμένων | Kanonas',
};

export default async function BeneficiariesPage() {
  const { data: beneficiaries } = await getBeneficiaries();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Κανονισμός Συσσιτίου & Μητρώο Ωφελουμένων</h1>
        <p className="text-sm text-gray-500">Διαχείριση απόρων, αξιολόγηση και Εγκρίσεις Παροχών</p>
      </div>

      <BeneficiariesClient initialData={beneficiaries || []} />
    </div>
  );
}
