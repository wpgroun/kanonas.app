import { prisma } from '@/lib/prisma';
import TrackClient from './TrackClient';
import { Church } from 'lucide-react';

export const metadata = { title: 'Αναζήτηση Αιτήματος - Kanonas' }

export default async function TrackPage({ params }: { params: { slug: string } }) {
 const temple = await prisma.temple.findUnique({ where: { slug: params.slug } });

 if (!temple) return (
 <div className="min-h-screen bg-slate-50 flex items-center justify-center">
 <h1 className="text-xl font-bold">Ο Ναός δεν βρέθηκε</h1>
 </div>
);

 return (
 <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col items-center pt-16 px-4">
 <div className="mx-auto bg-white p-4 rounded-full mb-6 shadow-md border border-slate-100">
 <Church className="w-8 h-8 text-blue-600"/>
 </div>
 <h1 className="text-2xl md:text-3xl font-black tracking-tight mb-2 text-slate-800">Αναζήτηση Πορείας</h1>
 <h2 className="text-sm font-medium text-slate-500 mb-8">{temple.name}</h2>
 
 <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-slate-200 p-6 md:p-8 relative z-10">
 <TrackClient slug={temple.slug as string} />
 </div>

 {/* Decoration */}
 <div className="fixed inset-x-0 bottom-0 h-64 bg-gradient-to-t from-blue-900/10 to-transparent pointer-events-none"></div>
 </div>
);
}
