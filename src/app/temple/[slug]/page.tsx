import { prisma } from '@/lib/prisma';
import { MapPin, Phone, Mail, Clock, Calendar, ShieldCheck, Heart } from 'lucide-react';
import Link from 'next/link';

export default async function TemplePublicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  if (!slug) return <div className="p-10 text-center font-bold text-red-500">Μη έγκυρη διεύθυνση Ναού.</div>;

  const temple = await prisma.temple.findUnique({
    where: { slug },
    include: {
      metropolis: true,
      schedules: {
        where: { date: { gte: new Date(new Date().setHours(0,0,0,0)) } },
        orderBy: [{ date: 'asc' }],
        take: 12
      }
    }
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kanonas.app';

  if (!temple) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col gap-4">
       <span className="text-4xl">⛪</span>
       <h1 className="text-2xl font-bold text-gray-800">Ο Ναός δεν βρέθηκε</h1>
       <p className="text-gray-500 text-sm">Ελέγξτε ξανά τον σύνδεσμο. Ενδέχεται ο Ναός να μην έχει ενεργοποιήσει τη δημόσια σελίδα του.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
       
       <div className="bg-white border-b border-border p-4 flex items-center justify-between max-w-5xl mx-auto rounded-b-3xl shadow-sm">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white"><ShieldCheck className="w-4 h-4"/></div>
             <div>
                <div className="text-xs font-bold text-blue-600 uppercase tracking-widest leading-3 mt-1">ΕΠΙΣΗΜΗ ΣΕΛΙΔΑ</div>
                <div className="text-xs text-gray-400 font-medium">Verified by Kanonas</div>
             </div>
          </div>
          <div>
            <Link href="/" className="text-xs font-semibold text-gray-500 hover:text-black">Kanonas SaaS</Link>
          </div>
       </div>

       {/* HERO SECTION */}
       <header className="py-16 px-6 text-center max-w-4xl mx-auto mt-6">
           <h2 className="text-sm md:text-base font-semibold text-blue-600 tracking-wider uppercase mb-2">
              {temple.metropolis?.name || 'Ιερά Μητρόπολη'}
           </h2>
           <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
              I.N. {temple.name}
           </h1>
           <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600 font-medium max-w-2xl mx-auto">
               {temple.address && (
                  <div className="flex items-center gap-1.5 bg-white border border-border px-4 py-2 rounded-full shadow-sm"><MapPin className="w-4 h-4 text-blue-500"/> {temple.address}, {temple.city}</div>
               )}
               {temple.phoneNumber && (
                  <div className="flex items-center gap-1.5 bg-white border border-border px-4 py-2 rounded-full shadow-sm"><Phone className="w-4 h-4 text-blue-500"/> {temple.phoneNumber}</div>
               )}
               {temple.email && (
                  <div className="flex items-center gap-1.5 bg-white border border-border px-4 py-2 rounded-full shadow-sm"><Mail className="w-4 h-4 text-blue-500"/> {temple.email}</div>
               )}
           </div>
       </header>

       {/* CONTENT GRID */}
       <main className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
           
           {/* Schedule Board */}
           <div className="md:col-span-2 space-y-6">
               <h3 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
                  <Calendar className="text-blue-600 w-7 h-7"/> Πρόγραμμα Ακολουθιών
               </h3>
               
               <div className="bg-white border text-left border-border rounded-2xl shadow-sm overflow-hidden">
                   <div className="divide-y divide-gray-100">
                     {temple.schedules.length === 0 ? (
                        <div className="p-10 text-center text-gray-500">Το πρόγραμμα δεν έχει ανακοινωθεί ακόμη.</div>
                     ) : (
                        temple.schedules.map((schedule: any) => (
                           <div key={schedule.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                               <div>
                                  <div className="text-sm font-bold text-gray-500 mb-1">{schedule.date.toLocaleDateString('el-GR', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
                                  <div className="font-extrabold text-lg text-gray-800">{schedule.title}</div>
                               </div>
                               <div className="bg-blue-50 text-blue-700 font-mono font-bold px-4 py-2 rounded-xl flex items-center gap-2 w-fit">
                                  <Clock className="w-4 h-4"/> {schedule.date.toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' })}
                               </div>
                           </div>
                        ))
                     )}
                  </div>
               </div>
           </div>

           {/* Sidebar Links / Widgets */}
           <div className="space-y-6">
               <div className="bg-gradient-to-br from-indigo-900 to-blue-900 rounded-2xl p-6 text-white shadow-xl">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">Ψηφιακές Δράσεις</h3>
                  <div className="space-y-3">
                     <Link href={`/temple/${slug}/connect`} className="w-full bg-white/10 hover:bg-white/20 border border-white/20 transition-colors rounded-xl p-3 text-sm font-medium text-left flex items-center justify-between mt-2">
                        <span>Ψηφιακό Γραφείο (e-Connect)</span> <ShieldCheck className="w-4 h-4"/>
                     </Link>
                     <a href={`webcal://${appUrl.replace(/https?:\/\//, '')}/api/schedule/ical/${slug}`} className="w-full bg-white/10 hover:bg-white/20 border border-white/20 transition-colors rounded-xl p-3 text-sm font-medium text-left flex items-center justify-between mt-2">
                        <span>Προσθήκη στο Ημερολόγιο</span> <Calendar className="w-4 h-4 text-blue-200"/>
                     </a>
                  </div>
               </div>
           </div>

       </main>
    </div>
  );
}
