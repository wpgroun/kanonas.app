import { prisma } from '@/lib/prisma';
import { Calendar, Clock, MapPin } from 'lucide-react';

// NextJS 15 params API change
export default async function CalendarWidgetPage({ params }: { params: Promise<{ slug: string }> }) {
 const { slug } = await params;
 
 if (!slug) return <div className="p-4 text-center text-sm">Δεν δόθηκε αναγνωριστικό.</div>;

 const temple = await prisma.temple.findUnique({
 where: { slug },
 include: {
 schedules: {
 where: { date: { gte: new Date(new Date().setHours(0,0,0,0)) } },
 orderBy: [{ date: 'asc' }],
 take: 8
 }
 }
 });

 if (!temple) return <div className="p-4 text-center text-sm text-red-500">Σφάλμα: Ο Ναός / Το Πρόγραμμα δεν βρέθηκε.</div>;

 const getDayName = (date: Date) => {
 const days = ['Κυριακή', 'Δευτέρα', 'Τρίτη', 'Τετάρτη', 'Πέμπτη', 'Παρασκευή', 'Σάββατο'];
 return days[date.getDay()];
 };

 return (
 <div className="w-full bg-white border border-border sm:rounded-xl overflow-hidden font-sans">
 {/* Widget Header */}
 <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 text-white">
 <h3 className="font-bold text-lg flex items-center gap-2">
 <Calendar className="w-5 h-5"/> Πρόγραμμα Ακολουθιών
 </h3>
 <p className="text-blue-100 text-sm mt-1 flex items-center gap-1 opacity-80"><MapPin className="w-3 h-3"/> I.N. {temple.name}</p>
 </div>

 {/* Schedule List */}
 <div className="divide-y divide-border">
 {temple.schedules.length === 0 ? (
 <div className="p-6 text-center text-gray-500 text-sm">Δεν υπάρχουν προσεχείς ακολουθίες.</div>
) : (
 temple.schedules.map((schedule: any) => {
 const isSunday = schedule.date.getDay() === 0;
 return (
 <div key={schedule.id} className="p-4 hover:bg-slate-50 transition-colors flex flex-col gap-2">
 <div className="flex items-center justify-between">
 <div className={`text-sm font-bold ${isSunday ? 'text-red-600' : 'text-blue-600'}`}>
 {getDayName(schedule.date)}, {schedule.date.toLocaleDateString("el-GR")}
 </div>
 <div className="flex items-center gap-1 text-sm bg-slate-100 px-2 py-1 rounded-md text-gray-700 font-mono">
 <Clock className="w-3.5 h-3.5"/> {schedule.date.toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' })}
 </div>
 </div>
 <div className="font-semibold text-gray-900 leading-tight">
 {schedule.title}
 </div>
 </div>
);
 })
)}
 </div>

 {/*"Powered by"Footer */}
 <div className="bg-slate-50 p-2 text-center text-[10px] text-gray-400 uppercase tracking-widest border-t border-border">
 Powered by Kanonas CRM
 </div>
 </div>
)
}
