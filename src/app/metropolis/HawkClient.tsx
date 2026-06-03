'use client';

import { Activity, Landmark, FileText, Users, LogIn, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function HawkClient({ data }: { data: any }) {
 const stats = data.aggregateStats;
 const temples = data.temples;

 const impersonateTemple = (templeId: string, templeName: string) => {
 // In a deeper real implementation, this would trigger an auth switch action
 // and redirect to /admin. We simulate it with a powerful UI response here:
 toast(`🔄 Εκκίνηση ασφαλούς σύνδεσης στον Ναό: ${templeName}`);
 setTimeout(() => {
 window.location.href = '/admin';
 }, 1500);
 };

 return (
 <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6">
 
 {/* AGGREGATE KPI CARDS (Dark Theme) */}
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
 <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl relative overflow-hidden group">
 <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition"><Landmark className="w-20 h-20"/></div>
 <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Συνολικα Εσοδα</p>
 <h3 className="text-4xl font-extrabold text-emerald-400 mt-2 flex items-baseline gap-1">
 {stats.totalIncome.toLocaleString('el-GR')} <span className="text-xl">€</span>
 </h3>
 <span className="text-xs text-emerald-500 mt-2 inline-flex items-center gap-1 font-bold"><TrendingUp className="w-3 h-3"/> Παν-επαρχιακά</span>
 </div>

 <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl relative overflow-hidden group">
 <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition"><FileText className="w-20 h-20"/></div>
 <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Μυστηρια</p>
 <h3 className="text-4xl font-extrabold text-white mt-2">{stats.totalSacraments}</h3>
 <span className="text-xs text-blue-400 mt-2 block">Γάμοι, Βαπτίσεις κλπ.</span>
 </div>

 <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl relative overflow-hidden group">
 <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition"><Activity className="w-20 h-20"/></div>
 <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Εκκρεμεις Εργασιες</p>
 <h3 className="text-4xl font-extrabold text-orange-400 mt-2">{stats.globalTasksPending}</h3>
 <span className="text-xs text-orange-400/80 mt-2 block">Στα Kanban Boards των Ναών</span>
 </div>

 <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl relative overflow-hidden group">
 <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition"><Users className="w-20 h-20"/></div>
 <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Ενεργο Προσωπικο</p>
 <h3 className="text-4xl font-extrabold text-purple-400 mt-2">{stats.activePriests}</h3>
 <span className="text-xs text-purple-400/80 mt-2 block">Ιερείς & Διαχειριστές</span>
 </div>
 </div>

 {/* TEMPLES LIST FOR IMPERSONATION */}
 <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
 <div className="p-6 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
 <h3 className="text-xl font-bold text-white flex items-center gap-2">
 <Landmark className="text-blue-500 w-6 h-6"/> Ιεροί Ναοί Μητροπόλεως 
 <span className="bg-blue-600/20 text-blue-400 text-xs px-2 py-1 rounded-full">{temples.length}</span>
 </h3>
 <div className="text-sm text-slate-400">Ταξινομημένα βάσει Εσόδων</div>
 </div>
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="bg-slate-900 border-b border-slate-800 text-xs uppercase tracking-widest text-slate-500">
 <th className="p-4 font-bold">Ονομασια Ναου</th>
 <th className="p-4 font-bold">Προσωπικο</th>
 <th className="p-4 font-bold">Μυστηρια</th>
 <th className="p-4 font-bold">Εσοδα</th>
 <th className="p-4 font-bold">Alerts</th>
 <th className="p-4 font-bold text-right">Ενεργειες</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-800">
 {temples.map((temple: any) => (
 <tr key={temple.id} className="hover:bg-slate-800/50 transition duration-150">
 <td className="p-4 w-1/3">
 <span className="font-extrabold text-slate-100 flex items-center gap-2">
 <div className="w-2 h-2 rounded-full bg-emerald-500"></div> {/* Status indicator online */}
 {temple.name}
 </span>
 <span className="text-xs text-slate-500 block mt-1 ml-4 font-mono">{temple.id.substring(0,8)}</span>
 </td>
 <td className="p-4 text-slate-300 font-semibold">{temple.usersCount}</td>
 <td className="p-4 text-slate-300 font-semibold">{temple.sacramentCount}</td>
 <td className="p-4 font-black text-emerald-400">{temple.revenue.toLocaleString('el-GR')} €</td>
 <td className="p-4">
 {temple.pendingTasks > 0 ? (
 <span className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded border border-orange-500/30 text-[10px] font-bold">
 {temple.pendingTasks} TASKS
 </span>
) : (
 <span className="text-slate-600 text-[10px] tracking-widest uppercase">Καθαρο</span>
)}
 </td>
 <td className="p-4 text-right">
 <button 
 onClick={() => impersonateTemple(temple.id, temple.name)}
 className="inline-flex items-center gap-1.5 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 text-blue-400 px-4 py-2 rounded-xl text-xs font-bold transition">
 <LogIn className="w-3.5 h-3.5"/> Dive In (Σύνδεση)
 </button>
 </td>
 </tr>
))}
 </tbody>
 </table>
 {temples.length === 0 && (
 <div className="p-12 text-center text-slate-500">
 Δεν υπάρχουν εγγεγραμμένοι Ναοί σε αυτή τη Μητρόπολη.
 </div>
)}
 </div>
 </div>
 </div>
);
}
