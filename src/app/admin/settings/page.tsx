import { getTempleSettings } from '@/actions/settings';
import SettingsClient from './SettingsClient';

export const metadata = {
 title: 'Κεντρικές Ρυθμίσεις Ναού | Kanonas SaaS',
};

export default async function SettingsPage() {
 const data = await getTempleSettings();

 return (
 <div className="max-w-5xl mx-auto space-y-6">
 <div>
 <h1 className="text-2xl font-bold text-[var(--foreground)] flex items-center gap-2">⚙️ Κεντρικές Ρυθμίσεις & Εξωτερικά API</h1>
 <p className="text-sm text-[var(--text-muted)]">Διαμορφώστε το προφίλ της Ενορίας, τις παραμέτρους Web και τα κλειδιά αποστολής μηνυμάτων (SMS/Viber/Email).</p>
 </div>

 <SettingsClient initialData={data} />
 </div>
);
}
