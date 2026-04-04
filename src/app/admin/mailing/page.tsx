import { getMailingLists } from '@/actions/mailing';
import MailingClient from './MailingClient';

export const metadata = {
  title: 'Μαζική Αλληλογραφία & Ετικέτες | Kanonas',
};

export default async function MailingPage() {
  const contacts = await getMailingLists();
  
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">✉️ Λίστες Αλληλογραφίας (Ταχυδρομείο)</h1>
        <p className="text-sm text-gray-500">Μαζική εξαγωγή διευθύνσεων σε Αυτοκόλλητες Ετικέτες A4 (Avery Templates).</p>
      </div>

      <MailingClient contacts={contacts} />
    </div>
  );
}
