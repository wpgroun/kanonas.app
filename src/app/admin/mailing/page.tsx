import { getMailingLists } from '@/actions/mailing';
import MailingClient from './MailingClient';

export const metadata = {
 title: 'Αλληλογραφία & Email | Kanonas',
};

export default async function MailingPage() {
 const contacts = await getMailingLists();

 // Check SMTP configuration server-side (env vars available here)
 const smtpConfigured = !!(
 process.env.SMTP_HOST &&
 process.env.SMTP_USER &&
 process.env.SMTP_PASS
);

 return (
 <div className="max-w-7xl mx-auto space-y-6">
 <div>
 <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
 ✉️ Αλληλογραφία & Email
 </h1>
 <p className="text-sm text-gray-500">
 Εκτύπωση ετικετών ταχυδρομείου ή αποστολή μαζικού email στους ενορίτες σας.
 </p>
 </div>

 <MailingClient contacts={contacts} smtpConfigured={smtpConfigured} />
 </div>
);
}
