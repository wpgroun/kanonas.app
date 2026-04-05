import { getStaff, getPhiloptochosBoard } from '@/actions/administration';
import StaffClient from './StaffClient';

export const metadata = {
 title: 'Προσωπικό & Διοίκηση | Kanonas',
};

export default async function StaffPage() {
 const { data: staff } = await getStaff();
 const { data: board } = await getPhiloptochosBoard();

 return (
 <div className="max-w-7xl mx-auto space-y-6">
 <div>
 <h1 className="text-2xl font-bold text-[var(--foreground)]">Αρχείο Ιερέων, Προσωπικού & Συμβουλίων</h1>
 <p className="text-sm text-[var(--text-muted)]">Διαχείριση Κληρικών, Λαϊκού Προσωπικού και Εκκλησιαστικών / Φιλόπτωχων Επιτροπών</p>
 </div>

 <StaffClient initialStaff={staff || []} initialBoard={board || []} />
 </div>
);
}
