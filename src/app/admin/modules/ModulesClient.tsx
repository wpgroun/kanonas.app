'use client';

import { useState } from 'react';
import { CheckCircle2, ShieldCheck, XCircle, Loader2 } from 'lucide-react';
import { toggleModule } from '@/actions/modules';
import { useRouter } from 'next/navigation';

export default function ModulesClient({ modulesData, disabledModules }: { modulesData: any[], disabledModules: string[] }) {
 const router = useRouter();
 const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

 const handleToggle = async (moduleLabel: string, currentlyEnabled: boolean) => {
 setLoadingMap(prev => ({ ...prev, [moduleLabel]: true }));
 const res = await toggleModule(moduleLabel, !currentlyEnabled);
 if (!res.success) {
 alert(res.error);
 }
 setLoadingMap(prev => ({ ...prev, [moduleLabel]: false }));
 router.refresh();
 };

 return (
 <div className="space-y-8 pb-10">
 {modulesData.map((mod, i) => (
 <div key={i} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
 <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-3">
 <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100">{mod.icon}</div>
 <h2 className="text-lg font-bold text-slate-800">{mod.category}</h2>
 </div>
 <div className="overflow-x-auto">
 <table className="w-full text-left text-sm">
 <thead className="bg-slate-100/50 text-slate-500 font-semibold border-b border-slate-200">
 <tr>
 <th className="px-6 py-3 w-1/4">Module / Submodule</th>
 <th className="px-6 py-3 w-2/3">Συνοπτική Περιγραφή</th>
 <th className="px-6 py-3 w-auto min-w-[120px]">Κατάσταση</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100">
 {mod.items.map((item: any, j: number) => {
 const isCore = item.isCore;
 const isDisabled = disabledModules.includes(item.name);
 const isEnabled = !isDisabled;
 const isLoading = loadingMap[item.name];

 return (
 <tr key={j} className="hover:bg-slate-50/50 transition-colors group">
 <td className="px-6 py-4">
 <span className={`font-bold px-3 py-1.5 rounded-lg border inline-block transition-colors ${isEnabled ? 'text-slate-700 bg-slate-100 border-slate-200 group-hover:border-blue-200' : 'text-slate-400 bg-slate-50 border-slate-100'}`}>
 {item.name}
 </span>
 </td>
 <td className={`px-6 py-4 leading-relaxed ${isEnabled ? 'text-slate-600' : 'text-slate-400'}`}>
 {item.desc}
 </td>
 <td className="px-6 py-4">
 {isCore ? (
 <span className="inline-flex items-center gap-1 auto px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-slate-800 text-slate-100 border border-slate-600 cursor-not-allowed opacity-80"title="Βασικό υποσύστημα (Core), δεν μπορεί να απενεργοποιηθεί">
 <ShieldCheck className="w-3.5 h-3.5"/> Core
 </span>
) : (
 <button 
 onClick={() => handleToggle(item.name, isEnabled)}
 disabled={isLoading}
 className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all border ${
 isLoading ? 'opacity-50 cursor-wait bg-slate-100 text-slate-500' :
 isEnabled 
 ? 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200 hover:scale-105' 
 : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200 hover:scale-105 hover:text-slate-800'
 }`}
 >
 {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> :
 isEnabled ? <><CheckCircle2 className="w-3.5 h-3.5"/> Ενεργό</> : <><XCircle className="w-3.5 h-3.5"/> Ανενεργό</>}
 </button>
)}
 </td>
 </tr>
)})}
 </tbody>
 </table>
 </div>
 </div>
))}
 </div>
);
}
