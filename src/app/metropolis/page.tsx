import { getHawkEyeData } from '@/actions/metropolis';
import HawkClient from './HawkClient';
import { ShieldCheck, Eye } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Metropolis Hawk\'s Eye | Kanonas SaaS',
};

export default async function MetropolisDashboard() {
  let data;
  try {
     data = await getHawkEyeData();
  } catch (e: any) {
     return (
        <div className="h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
           <ShieldCheck className="w-16 h-16 text-red-500 mb-4"/>
           <h1 className="text-2xl font-bold">Πρόσβαση Απορρίφθηκε</h1>
           <p className="text-slate-400 mt-2">{e.message}</p>
           <Link href="/admin" className="mt-6 px-6 py-2 bg-blue-600 rounded-full hover:bg-blue-500 transition">Επιστροφή στο Τοπικό Admin</Link>
        </div>
     );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans">
       {/* Super Admin Topbar */}
       <header className="bg-slate-950 border-b border-slate-800 px-6 py-4 flex items-center justify-between shadow-2xl">
          <div className="flex items-center gap-3">
             <div className="bg-red-600 p-2 rounded-xl"><Eye className="w-5 h-5 text-white"/></div>
             <div>
                <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">Metropolis Super-Admin</p>
                <h1 className="text-xl font-black text-white">Hawk's Eye Dashboard</h1>
             </div>
          </div>
          <Link href="/admin" className="text-sm font-semibold text-slate-400 hover:text-white transition">Αποσύνδεση Κονσόλας / Έξοδος</Link>
       </header>

       <main className="max-w-7xl mx-auto p-6 mt-6">
          <div className="mb-8 border-b border-slate-800 pb-4">
             <h2 className="text-3xl font-extrabold text-blue-400">{data.metropolisName}</h2>
             <p className="text-slate-400 mt-1">Συγκεντρωτική Εποπτεία {data.aggregateStats.totalTemples} Ιερών Ναών</p>
          </div>

          <HawkClient data={data} />
       </main>
    </div>
  );
}
