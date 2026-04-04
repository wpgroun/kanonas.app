import { getBloodDonors } from '@/actions/bloodbank';
import BloodBankClient from './BloodBankClient';

export const metadata = {
  title: 'Τράπεζα Αίματος | Kanonas',
};

export default async function BloodBankPage() {
  const donors = await getBloodDonors();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">🩸 Ενοριακή Τράπεζα Αίματος</h1>
        <p className="text-sm text-gray-500">Καταγραφή εθελοντών αιμοδοτών και ιστορικό προσφοράς για περιπτώσεις έκτακτης ανάγκης.</p>
      </div>

      <BloodBankClient initialDonors={donors} />
    </div>
  );
}
