import { requireAuth } from '@/lib/requireAuth';
import { getTempleRequests } from '@/actions/connect';
import ConnectClient from './ConnectClient';

export const metadata = {
  title: 'Kanonas Connect (e-Gov) | Kanonas',
};

export default async function AdminConnectPage() {
   // Validate session ensures they are inside Kanonas Admin
   await requireAuth();

   // Fetch data via Server Action pattern
   const requests = await getTempleRequests();

   return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
         <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Kanonas Connect (e-Gov & Συμμετοχές)</h1>
            <p className="text-slate-500 text-sm">Διαχειριστείτε τις αιτήσεις πιστοποιητικών και τις συμμετοχές στις δράσεις της Ενορίας που υποβλήθηκαν μέσω της Ψηφιακής Θυρίδας (Mini-Site).</p>
         </div>

         <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <ConnectClient initialRequests={requests} />
         </div>
      </div>
   );
}
