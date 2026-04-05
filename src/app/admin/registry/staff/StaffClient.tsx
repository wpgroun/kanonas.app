'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { User, Shield, Briefcase, Calendar } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function StaffClient({ initialStaff, initialBoard }: any) {
 const [activeTab, setActiveTab] = useState('clergy');

 // Filter staff based on isHeadPriest or roles
 const clergy = initialStaff.filter((s:any) => s.role?.name === 'Εφημέριος' || s.isHeadPriest);
 const laymen = initialStaff.filter((s:any) => s.role?.name !== 'Εφημέριος' && !s.isHeadPriest);

 return (
 <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
 <TabsList className="bg-[var(--surface)] border border-border">
 <TabsTrigger value="clergy">Ιερείς</TabsTrigger>
 <TabsTrigger value="laymen">Προσωπικό (Λαϊκοί)</TabsTrigger>
 <TabsTrigger value="philoptochos">Επιτροπή Φιλοπτώχου</TabsTrigger>
 </TabsList>

 <TabsContent value="clergy"className="space-y-4">
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 {clergy.map((s: any) => (
 <Card key={s.id} className="p-4 flex flex-col gap-3 border border-border">
 <div className="flex items-center gap-3">
 <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-[var(--text-muted)]">
 <Shield className="w-6 h-6"/>
 </div>
 <div>
 <h3 className="font-bold text-lg">{s.user.firstName} {s.user.lastName}</h3>
 <p className="text-sm font-semibold text-primary">{s.isHeadPriest ? 'Προϊστάμενος' : 'Εφημέριος'}</p>
 </div>
 </div>
 <div className="bg-[var(--background)] rounded-md p-3 text-sm space-y-2 mt-2">
 <div className="flex justify-between">
 <span className="text-[var(--text-muted)]">Ημ. Εις Διάκονον:</span>
 <span className="font-mono">{s.ordinationDiaconate ? new Date(s.ordinationDiaconate).toLocaleDateString("el-GR") : '-'}</span>
 </div>
 <div className="flex justify-between">
 <span className="text-[var(--text-muted)]">Ημ. Εις Πρεσβύτερον:</span>
 <span className="font-mono">{s.ordinationPriesthood ? new Date(s.ordinationPriesthood).toLocaleDateString("el-GR") : '-'}</span>
 </div>
 <div className="flex justify-between">
 <span className="text-[var(--text-muted)]">Οφφίκια:</span>
 <span>{s.offikia || '-'}</span>
 </div>
 </div>
 </Card>
))}
 </div>
 </TabsContent>

 <TabsContent value="laymen"className="space-y-4">
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 {laymen.length === 0 ? (
 <div className="col-span-full py-12 text-center text-[var(--text-muted)] border border-dashed rounded-xl">Δεν υπάρχει καταχωρημένο λαϊκό προσωπικό.</div>
) : laymen.map((s: any) => (
 <Card key={s.id} className="p-4 flex flex-col gap-3 border border-border">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
 <Briefcase className="w-5 h-5"/>
 </div>
 <div>
 <h3 className="font-bold">{s.user.firstName} {s.user.lastName}</h3>
 <p className="text-sm text-[var(--text-muted)]">{s.role?.name || 'Απλό Προσωπικό'}</p>
 </div>
 </div>
 <div className="flex justify-between text-sm text-[var(--text-muted)] mt-2">
 <span>Πρόσληψη/Διορισμός:</span>
 <span>{s.hireDate ? new Date(s.hireDate).toLocaleDateString("el-GR") : '-'}</span>
 </div>
 </Card>
))}
 </div>
 </TabsContent>

 <TabsContent value="philoptochos"className="space-y-4">
 <Card className="rounded-xl border border-border overflow-hidden">
 <table className="w-full text-sm text-left">
 <thead className="bg-[var(--background)] text-[var(--text-secondary)]">
 <tr>
 <th className="p-4 font-semibold">Ονοματεπώνυμο</th>
 <th className="p-4 font-semibold">Θέση / Αξίωμα</th>
 <th className="p-4 font-semibold text-center">Διάρκεια Θητείας</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border">
 {initialBoard.length === 0 ? (
 <tr><td colSpan={3} className="p-8 text-center text-[var(--text-muted)]">Η Επιτροπή δεν έχει συγκροτηθεί.</td></tr>
) : initialBoard.map((m: any) => (
 <tr key={m.id} className="hover:bg-[var(--background)]/50 :bg-gray-800/50">
 <td className="p-4 font-medium">{m.firstName} {m.lastName}</td>
 <td className="p-4">
 <span className={`px-2 py-1 rounded text-xs font-semibold ${m.role==='Πρόεδρος'?'bg-[var(--success-light)] text-emerald-800':m.role==='Ταμίας'?'bg-amber-100 text-[var(--warning)]':'bg-blue-100 text-blue-800'}`}>
 {m.role}
 </span>
 </td>
 <td className="p-4 text-center text-[var(--text-secondary)]">
 <div className="flex items-center justify-center gap-2">
 <Calendar className="w-4 h-4"/> 
 {new Date(m.startDate).getFullYear()} - {m.endDate ? new Date(m.endDate).getFullYear() : 'Σήμερα'}
 </div>
 </td>
 </tr>
))}
 </tbody>
 </table>
 </Card>
 </TabsContent>
 </Tabs>
);
}
