import { requireAuth } from '@/lib/requireAuth';
import { getTempleRequests } from '@/actions/connect';
import ConnectClient from './ConnectClient';

import { prisma } from '@/lib/prisma';

export const metadata = {
 title: 'Kanonas Connect (e-Gov) | Kanonas',
};

export default async function AdminConnectPage() {
 // Validate session ensures they are inside Kanonas Admin
 const session = await requireAuth();

 // Fetch data via Server Action pattern
 const requests = await getTempleRequests();
 const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kanonas.app';
 
 const temple = await prisma.temple.findUnique({
 where: { id: session.templeId },
 select: { slug: true }
 });

 return (
 <div className="container-fluid mt-6 space-y-6 animate-in fade-in slide-in-from-bottom-4">
 
 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
 <div>
 <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
 Kanonas Connect (e-Gov & Συμμετοχές)
 </h1>
 <p className="text-muted-foreground mt-1 text-sm">
 Διαχειριστείτε τις αιτήσεις πιστοποιητικών και τις συμμετοχές στις δράσεις της Ενορίας που υποβλήθηκαν μέσω της Ψηφιακής Θυρίδας (Mini-Site).
 </p>
 </div>
 </div>

 <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
 <ConnectClient initialRequests={requests} appUrl={appUrl} slug={temple?.slug || ''} />
 </div>
 </div>
);
}
