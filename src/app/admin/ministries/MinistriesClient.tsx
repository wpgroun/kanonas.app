'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, CalendarDays, Shield, Plus, Calendar, Save, ListTodo, UserPlus, Phone, Briefcase, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { addMinistry, deleteMinistry, addVolunteer, deleteVolunteer, createShift, updateShiftAssignmentStatus } from '@/actions/ministries';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function MinistriesClient({ initialMinistries, initialVolunteers, initialShifts }: any) {
 const router = useRouter();
 const [activeTab, setActiveTab] = useState<'MINISTRIES' | 'VOLUNTEERS' | 'SHIFTS'>('SHIFTS');
 const [loading, setLoading] = useState(false);

 // New Ministry State
 const [newMinName, setNewMinName] = useState('');
 const [newMinDesc, setNewMinDesc] = useState('');
 // New Volunteer State
 const [newVolFirst, setNewVolFirst] = useState('');
 const [newVolLast, setNewVolLast] = useState('');
 const [newVolPhone, setNewVolPhone] = useState('');
 const [newVolMinistries, setNewVolMinistries] = useState<string[]>([]);
 // New Shift State
 const [newShiftMinId, setNewShiftMinId] = useState('');
 const [newShiftDate, setNewShiftDate] = useState('');
 const [newShiftTime, setNewShiftTime] = useState('');
 const [newShiftVols, setNewShiftVols] = useState<string[]>([]);

 const handleCreateMinistry = async (e: any) => {
 e.preventDefault();
 setLoading(true);
 await addMinistry({ name: newMinName, description: newMinDesc });
 setNewMinName(''); setNewMinDesc('');
 setLoading(false);
 router.refresh();
 };

 const handleCreateVolunteer = async (e: any) => {
 e.preventDefault();
 setLoading(true);
 await addVolunteer({ firstName: newVolFirst, lastName: newVolLast, phone: newVolPhone, ministryIds: newVolMinistries });
 setNewVolFirst(''); setNewVolLast(''); setNewVolPhone(''); setNewVolMinistries([]);
 setLoading(false);
 router.refresh();
 };

 const handleCreateShift = async (e: any) => {
 e.preventDefault();
 if (!newShiftMinId || !newShiftDate) return;
 setLoading(true);
 await createShift({
 ministryId: newShiftMinId,
 date: new Date(newShiftDate),
 startTime: newShiftTime,
 volunteerIds: newShiftVols
 });
 setNewShiftMinId(''); setNewShiftDate(''); setNewShiftTime(''); setNewShiftVols([]);
 setLoading(false);
 router.refresh();
 setActiveTab('SHIFTS');
 };

 return (
 <div className="space-y-6">
 {/* Tabs */}
 <div className="flex bg-muted/30 p-1 rounded-xl w-fit border border-border">
 <Button variant={activeTab === 'SHIFTS' ? 'primary' : 'ghost'} className="rounded-lg gap-2"onClick={() => setActiveTab('SHIFTS')}>
 <CalendarDays className="w-4 h-4"/> Βάρδιες & Πρόγραμμα
 </Button>
 <Button variant={activeTab === 'VOLUNTEERS' ? 'primary' : 'ghost'} className="rounded-lg gap-2"onClick={() => setActiveTab('VOLUNTEERS')}>
 <Users className="w-4 h-4"/> Εθελοντές
 </Button>
 <Button variant={activeTab === 'MINISTRIES' ? 'primary' : 'ghost'} className="rounded-lg gap-2"onClick={() => setActiveTab('MINISTRIES')}>
 <Shield className="w-4 h-4"/> Διακονίες
 </Button>
 </div>

 {/* SHIFTS TAB */}
 {activeTab === 'SHIFTS' && (
 <div className="space-y-6">
 <div className="flex justify-between items-center">
 <h2 className="text-xl font-bold text-foreground">Πρόγραμμα Βαρδιών</h2>
 <Dialog>
 <DialogTrigger asChild>
 <Button variant="primary"className="gap-2"><Plus className="w-4 h-4"/> Νέα Βάρδια</Button>
 </DialogTrigger>
 <DialogContent>
 <DialogHeader><DialogTitle>Οργάνωση Νέας Βάρδιας</DialogTitle></DialogHeader>
 <form onSubmit={handleCreateShift} className="space-y-4">
 <select required className="data-input w-full"value={newShiftMinId} onChange={e => setNewShiftMinId(e.target.value)}>
 <option value="">-- Επιλέξτε Διακονία --</option>
 {initialMinistries.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
 </select>
 <div className="grid grid-cols-2 gap-4">
 <input required type="date"className="data-input w-full"value={newShiftDate} onChange={e => setNewShiftDate(e.target.value)} />
 <input type="time"className="data-input w-full"value={newShiftTime} onChange={e => setNewShiftTime(e.target.value)} />
 </div>
 <div>
 <label className="text-sm font-bold mb-2 block">Διαθέσιμοι Εθελοντές (επιλέξτε)</label>
 <div className="max-h-40 overflow-y-auto space-y-1 bg-muted/20 p-2 rounded-lg border border-border">
 {initialVolunteers.map((v: any) => (
 <label key={v.id} className="flex items-center gap-2 text-sm p-1 hover:bg-muted/50 rounded cursor-pointer">
 <input 
 type="checkbox"
 checked={newShiftVols.includes(v.id)} 
 onChange={(e) => {
 if(e.target.checked) setNewShiftVols([...newShiftVols, v.id]);
 else setNewShiftVols(newShiftVols.filter(id => id !== v.id));
 }} 
 />
 {v.firstName} {v.lastName}
 </label>
))}
 </div>
 </div>
 <Button type="submit"disabled={loading} className="w-full">Αποθήκευση Βάρδιας</Button>
 </form>
 </DialogContent>
 </Dialog>
 </div>
 
 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
 {initialShifts.map((shift: any) => (
 <Card key={shift.id} className="shadow-sm border-border">
 <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
 <div className="flex justify-between items-start">
 <div>
 <CardTitle className="text-base text-foreground">{shift.ministry.name}</CardTitle>
 <div className="text-sm text-primary font-bold mt-1 inline-flex items-center gap-1.5 bg-primary/10 px-2 py-0.5 rounded-full">
 <Calendar className="w-3.5 h-3.5"/> 
 {new Date(shift.date).toLocaleDateString('el-GR')} {shift.startTime && `• ${shift.startTime}`}
 </div>
 </div>
 </div>
 </CardHeader>
 <CardContent className="pt-4 space-y-3">
 <div className="text-sm font-semibold text-muted-foreground flex items-center gap-2 mb-2"><Users className="w-4 h-4"/> Εθελοντές Βάρδιας</div>
 <ul className="space-y-2">
 {shift.assignments.map((asn: any) => (
 <li key={asn.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/50">
 <span className="text-sm font-medium">{asn.volunteer.firstName} {asn.volunteer.lastName}</span>
 <div className="flex gap-1">
 <button 
 onClick={async () => { await updateShiftAssignmentStatus(asn.id, 'COMPLETED'); router.refresh(); }}
 className={`p-1.5 rounded-md ${asn.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'text-slate-400 hover:bg-slate-100'}`}
 title="Παραβρέθηκε"
 ><CheckCircle2 className="w-4 h-4"/></button>
 <button 
 onClick={async () => { await updateShiftAssignmentStatus(asn.id, 'CANCELLED'); router.refresh(); }}
 className={`p-1.5 rounded-md ${asn.status === 'CANCELLED' ? 'bg-rose-100 text-rose-700' : 'text-slate-400 hover:bg-slate-100'}`}
 title="Ακύρωσε"
 ><XCircle className="w-4 h-4"/></button>
 </div>
 </li>
))}
 {shift.assignments.length === 0 && <li className="text-xs text-muted-foreground italic">Δεν έχουν οριστεί εθελοντές.</li>}
 </ul>
 </CardContent>
 </Card>
))}
 {initialShifts.length === 0 && (
 <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed rounded-xl">
 Δεν υπάρχουν προγραμματισμένες βάρδιες.
 </div>
)}
 </div>
 </div>
)}

 {/* VOLUNTEERS TAB */}
 {activeTab === 'VOLUNTEERS' && (
 <div className="space-y-6">
 <div className="flex justify-between items-center mb-4">
 <h2 className="text-xl font-bold text-foreground">Λίστα Εθελοντών</h2>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 <Card className="col-span-1 shadow-sm h-fit">
 <CardHeader className="bg-muted/20 border-b border-border/50"><CardTitle className="text-base flex items-center gap-2"><UserPlus className="w-4 h-4"/> Νέος Εθελοντής</CardTitle></CardHeader>
 <CardContent className="pt-4">
 <form onSubmit={handleCreateVolunteer} className="space-y-3">
 <input required type="text"placeholder="Όνομα"className="data-input w-full"value={newVolFirst} onChange={e=>setNewVolFirst(e.target.value)} />
 <input required type="text"placeholder="Επώνυμο"className="data-input w-full"value={newVolLast} onChange={e=>setNewVolLast(e.target.value)} />
 <input type="text"placeholder="Τηλέφωνο (Προαιρετικό)"className="data-input w-full"value={newVolPhone} onChange={e=>setNewVolPhone(e.target.value)} />
 
 <div>
 <label className="text-xs font-bold mb-1 block text-muted-foreground">Συμμετοχή σε (Διακονίες)</label>
 <div className="max-h-32 overflow-y-auto space-y-1 border border-border p-2 rounded-lg">
 {initialMinistries.map((m: any) => (
 <label key={m.id} className="flex items-center gap-2 text-sm">
 <input type="checkbox"checked={newVolMinistries.includes(m.id)} onChange={(e)=>{
 if(e.target.checked) setNewVolMinistries([...newVolMinistries, m.id]);
 else setNewVolMinistries(newVolMinistries.filter(x => x !== m.id));
 }}/> {m.name}
 </label>
))}
 </div>
 </div>
 <Button type="submit"disabled={loading} className="w-full">Αποθήκευση</Button>
 </form>
 </CardContent>
 </Card>

 <div className="col-span-1 md:col-span-2 space-y-3">
 {initialVolunteers.map((vol: any) => (
 <div key={vol.id} className="flex items-center p-4 bg-card border border-border rounded-xl shadow-sm hover:border-primary/50 transition-colors">
 <div className="bg-primary/10 p-3 rounded-full mr-4 text-primary"><Users className="w-5 h-5"/></div>
 <div className="flex-1">
 <h3 className="font-bold text-foreground">{vol.firstName} {vol.lastName}</h3>
 <div className="flex items-center gap-4 text-xs mt-1 text-muted-foreground">
 {vol.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3"/> {vol.phone}</span>}
 <span className="flex items-center gap-1"><Briefcase className="w-3 h-3"/> {vol.ministries.length} Διακονίες</span>
 </div>
 </div>
 <Button variant="ghost"size="icon"className="text-rose-500 hover:bg-rose-50"onClick={async () => {
 if(confirm('Διαγραφή;')) { await deleteVolunteer(vol.id); router.refresh(); }
 }}><Trash2 className="w-4 h-4"/></Button>
 </div>
))}
 {initialVolunteers.length === 0 && <div className="text-center py-10 text-muted-foreground">Δεν έχουν καταχωρηθεί εθελοντές.</div>}
 </div>
 </div>
 </div>
)}

 {/* MINISTRIES TAB */}
 {activeTab === 'MINISTRIES' && (
 <div className="space-y-6">
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 <Card className="col-span-1 shadow-sm h-fit">
 <CardHeader className="bg-muted/20 border-b border-border/50"><CardTitle className="text-base flex items-center gap-2"><ListTodo className="w-4 h-4"/> Νέα Διακονία</CardTitle></CardHeader>
 <CardContent className="pt-4">
 <form onSubmit={handleCreateMinistry} className="space-y-3">
 <input required type="text"placeholder="Π.χ. Συσσίτιο Τρίτης"className="data-input w-full"value={newMinName} onChange={e=>setNewMinName(e.target.value)} />
 <textarea placeholder="Περιγραφή (Προαιρετικό)"className="data-input w-full resize-none"rows={3} value={newMinDesc} onChange={e=>setNewMinDesc(e.target.value)} />
 <Button type="submit"disabled={loading} className="w-full">Δημιουργία Ομάδας</Button>
 </form>
 </CardContent>
 </Card>

 <div className="col-span-1 md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
 {initialMinistries.map((min: any) => (
 <Card key={min.id} className="shadow-sm border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-lg flex justify-between items-start">
 {min.name}
 <Button variant="ghost"size="icon"className="h-6 w-6 text-rose-500"onClick={async () => {
 if(confirm('Διαγραφή διακονίας;')) { await deleteMinistry(min.id); router.refresh(); }
 }}><Trash2 className="w-3.5 h-3.5"/></Button>
 </CardTitle>
 </CardHeader>
 <CardContent>
 <p className="text-sm text-muted-foreground mb-4 min-h-[40px]">{min.description || 'Χωρίς περιγραφή'}</p>
 <div className="bg-muted/40 p-2 rounded flex items-center justify-between text-sm font-semibold">
 <span>Εγγεγραμμένοι Εθελοντές</span>
 <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded-full text-xs">{min.volunteers.length}</span>
 </div>
 </CardContent>
 </Card>
))}
 </div>
 </div>
 </div>
)}
 </div>
);
}
