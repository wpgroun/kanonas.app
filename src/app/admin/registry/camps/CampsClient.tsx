'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tent, Users, MapPin, Calendar, Plus, ShieldAlert } from 'lucide-react';
import { addCamp, registerToCamp } from '@/actions/camps';
import { toast } from 'sonner';

export default function CampsClient({ initialCamps, parishioners }: any) {
 const [activeCampId, setActiveCampId] = useState(initialCamps[0]?.id || null);
 const [isNewCampModal, setIsNewCampModal] = useState(false);
 const [isRegisterModal, setIsRegisterModal] = useState(false);

 const activeCamp = initialCamps.find((c:any) => c.id === activeCampId);
 const childrenFilter = parishioners.filter((p:any) => p.roles?.includes('child') || p.birthDate); // Simplification for finding children

 const handleCreateCamp = async (e: React.FormEvent<HTMLFormElement>) => {
 e.preventDefault();
 const fd = new FormData(e.currentTarget);
 const payload = {
 name: fd.get('name'), year: fd.get('year'), 
 startDate: fd.get('startDate'), endDate: fd.get('endDate'),
 location: fd.get('location')
 };
 
 toast.promise(addCamp(payload), {
 loading: 'Δημιουργία Κατασκηνωτικής Περιόδου...',
 success: (res) => {
 if(!res.success) throw new Error(res.error);
 setIsNewCampModal(false);
 return 'Η περίοδος δημιουργήθηκε!';
 },
 error: 'Αποτυχία δημιουργίας'
 });
 };

 const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
 e.preventDefault();
 if (!activeCampId) return;
 const fd = new FormData(e.currentTarget);
 const payload = {
 parishionerId: fd.get('parishionerId'),
 firstName: fd.get('firstName'),
 lastName: fd.get('lastName'),
 emergencyPhone: fd.get('emergencyPhone'),
 medicalNotes: fd.get('medicalNotes')
 };
 
 toast.promise(registerToCamp(activeCampId, payload), {
 loading: 'Εγγραφή παιδιού...',
 success: (res) => {
 if(!res.success) throw new Error(res.error);
 setIsRegisterModal(false);
 return 'Το παιδί εγγράφηκε επιτυχώς!';
 },
 error: 'Αποτυχία εγγραφής'
 });
 };

 return (
 <div className="flex flex-col lg:flex-row gap-6">
 
 {/* Sidebar: Camp Periods */}
 <div className="w-full lg:w-72 space-y-4">
 <Button onClick={() => setIsNewCampModal(true)} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
 <Plus className="w-5 h-5"/> Νέα Περίοδος
 </Button>

 <div className="space-y-3">
 {initialCamps.length === 0 && <div className="text-gray-400 text-sm text-center py-4 border border-dashed rounded-lg">Καμία περίοδος κατασκήνωσης.</div>}
 {initialCamps.map((camp: any) => (
 <div 
 key={camp.id} 
 onClick={() => setActiveCampId(camp.id)}
 className={`p-4 rounded-xl cursor-pointer border transition-all ${activeCampId === camp.id ? 'bg-emerald-50 border-emerald-300 shadow-sm' : 'bg-white border-border hover:shadow-md'}`}
 >
 <h3 className="font-bold text-gray-900 flex items-center gap-2">
 <Tent className={activeCampId === camp.id ? 'text-emerald-500 w-5 h-5' : 'text-gray-400 w-5 h-5'} /> 
 {camp.name}
 </h3>
 <div className="text-xs text-gray-500 mt-2 space-y-1">
 <p className="flex items-center gap-1"><Calendar className="w-3 h-3"/> {new Date(camp.startDate).toLocaleDateString("el-GR")} - {new Date(camp.endDate).toLocaleDateString("el-GR")}</p>
 <p className="flex items-center gap-1 font-semibold text-emerald-600"><Users className="w-3 h-3"/> {camp.registrations?.length || 0} Συμμετοχές</p>
 </div>
 </div>
))}
 </div>
 </div>

 {/* Main Content: Camp Details & Registrations */}
 <div className="flex-1">
 {!activeCamp ? (
 <div className="bg-slate-50 border-2 border-dashed border-border rounded-xl h-96 flex flex-col items-center justify-center text-gray-400">
 <Tent className="w-16 h-16 opacity-30 mb-4"/>
 <p>Επιλέξτε μια κατασκηνωτική περίοδο από τα αριστερά.</p>
 </div>
) : (
 <Card className="rounded-xl border-border shadow-sm overflow-hidden flex flex-col min-h-[500px]">
 <div className="bg-emerald-600 text-white p-6">
 <h2 className="text-2xl font-bold flex items-center gap-2"><Tent className="w-6 h-6"/> {activeCamp.name} ({activeCamp.year})</h2>
 <p className="flex items-center gap-2 opacity-80 mt-1 text-sm"><MapPin className="w-4 h-4"/> {activeCamp.location || 'Άγνωστη Τοποθεσία'}</p>
 </div>
 
 <div className="p-4 border-b border-border bg-slate-50 flex justify-between items-center">
 <h3 className="font-bold text-gray-700">Λίστα Παιδιών ({activeCamp.registrations.length})</h3>
 <Button onClick={()=>setIsRegisterModal(true)} variant="outline"className="gap-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50">
 <Plus className="w-4 h-4"/> Δήλωση Συμμετοχής
 </Button>
 </div>

 <div className="p-0 overflow-auto">
 <table className="w-full text-sm text-left">
 <thead className="bg-white text-gray-600 border-b border-border">
 <tr>
 <th className="p-4 font-semibold">Ονοματεπώνυμο Παιδιού</th>
 <th className="p-4 font-semibold">Τηλέφωνο Επικοινωνίας (Γονέων)</th>
 <th className="p-4 font-semibold text-red-600 flex items-center gap-1"><ShieldAlert className="w-4 h-4"/> Ιατρικό Ιστορικό</th>
 <th className="p-4 font-semibold text-center">Ημ. Εγγραφής</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border">
 {activeCamp.registrations.length === 0 ? (
 <tr><td colSpan={4} className="p-12 text-center text-gray-500">Δεν υπάρχουν συμμετοχές.</td></tr>
) : activeCamp.registrations.map((reg: any) => (
 <tr key={reg.id} className="hover:bg-slate-50 :bg-slate-800">
 <td className="p-4 font-bold text-gray-900">
 {reg.parishioner.lastName} {reg.parishioner.firstName}
 </td>
 <td className="p-4">{reg.parishioner.phone || reg.parishioner.mobile || '-'}</td>
 <td className="p-4">
 {reg.medicalNotes ? (
 <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded font-semibold line-clamp-1">{reg.medicalNotes}</span>
) : (
 <span className="text-gray-400">Κανένα/ΟΚ</span>
)}
 </td>
 <td className="p-4 text-center tabular-nums text-gray-500">{new Date(reg.createdAt).toLocaleDateString("el-GR")}</td>
 </tr>
))}
 </tbody>
 </table>
 </div>
 </Card>
)}
 </div>

 {/* MODALS */}
 {isNewCampModal && (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
 <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
 <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Tent/> Νέα Κατασκηνωτική Περίοδος</h2>
 <form onSubmit={handleCreateCamp} className="space-y-4">
 <div className="space-y-1"><label className="text-sm font-semibold">Ονομασία (π.χ. Α' Περίοδος Αγοριών)</label><Input name="name"required /></div>
 <div className="grid grid-cols-2 gap-4">
 <div className="space-y-1"><label className="text-sm font-semibold">Έτος</label><Input name="year"type="number"defaultValue={new Date().getFullYear()} required /></div>
 <div className="space-y-1"><label className="text-sm font-semibold">Τοποθεσία</label><Input name="location"placeholder="Παιανία..."/></div>
 </div>
 <div className="grid grid-cols-2 gap-4">
 <div className="space-y-1"><label className="text-sm font-semibold">Έναρξη</label><Input name="startDate"type="date"required /></div>
 <div className="space-y-1"><label className="text-sm font-semibold">Λήξη</label><Input name="endDate"type="date"required /></div>
 </div>
 <div className="flex gap-3 pt-4">
 <Button type="button"onClick={()=>setIsNewCampModal(false)} variant="outline"className="flex-1">Ακύρωση</Button>
 <Button type="submit"className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white">Δημιουργία</Button>
 </div>
 </form>
 </div>
 </div>
)}

 {isRegisterModal && (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
 <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
 <h2 className="text-lg font-bold mb-4">Εγγραφή Κατασκηνωτή</h2>
 <form onSubmit={handleRegister} className="space-y-4">
 <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-800 border border-blue-200">
 Αν το παιδί δεν υπάρχει στη λίστα, τα στοιχεία θα δημιουργήσουν αυτόματα νέα καρτέλα στο Γενικό Μητρώο.
 </div>
 
 <div className="space-y-1">
 <label className="text-sm font-semibold text-gray-500">Επιλογή από Μητρώο (Προαιρετικό)</label>
 <select name="parishionerId"className="w-full border border-border p-2 rounded-md bg-transparent">
 <option value="">-- Νέο Παιδί (Χειροκίνητα) --</option>
 {childrenFilter.map((c:any) => <option key={c.id} value={c.id}>{c.lastName} {c.firstName} (Οικ: {c.phone || c.mobile})</option>)}
 </select>
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div className="space-y-1"><label className="text-sm font-semibold">Όνομα *</label><Input name="firstName"required /></div>
 <div className="space-y-1"><label className="text-sm font-semibold">Επώνυμο *</label><Input name="lastName"required /></div>
 </div>
 <div className="space-y-1"><label className="text-sm font-semibold">Τηλέφωνο Ανάγκης (Γονέα) *</label><Input name="emergencyPhone"required /></div>
 <div className="space-y-1">
 <label className="text-sm font-semibold text-red-500 flex items-center gap-1"><ShieldAlert className="w-4 h-4"/> Ιατρικό Ιστορικό / Αλλεργίες</label>
 <Input name="medicalNotes"placeholder="π.χ. Αλλεργία στους ξηρούς καρπούς"className="border-red-200 focus-visible:ring-red-500"/>
 </div>

 <div className="flex gap-3 pt-4">
 <Button type="button"onClick={()=>setIsRegisterModal(false)} variant="outline"className="flex-1">Ακύρωση</Button>
 <Button type="submit"className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white">Εγγραφή Παιδιού</Button>
 </div>
 </form>
 </div>
 </div>
)}
 </div>
);
}
