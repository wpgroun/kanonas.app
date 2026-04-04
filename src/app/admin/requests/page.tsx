import { requireAuth } from '@/lib/requireAuth';
import { getTempleRequests } from '@/actions/connect';
import AdminRequestsClient from './AdminRequestsClient';

export const metadata = {
  title: 'Εισερχόμενα Αιτήματα / Συμμετοχές | Kanonas',
};

export default async function AdminRequestsPage() {
   // Validate session ensures they are inside Kanonas Admin
   await requireAuth();

   // Fetch data via Server Action pattern
   const requests = await getTempleRequests();

   return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
         <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Kanonas Connect (e-Gov & Συμμετοχές)</h1>
            <p className="text-slate-500 text-sm">Διαχειριστείτε τις αιτήσεις πιστοποιητικών και τις συμμετοχές στις δράσεις της Ενορίας που υποβλήθηκαν ηλεκτρονικά.</p>
         </div>

         <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <AdminRequestsClient initialRequests={requests} />
         </div>
      </div>
   );
}
