'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Calendar, MapPin, Download, Book, FileText } from 'lucide-react';
import { registerDeceased, scheduleMemorial } from '@/actions/funerals';
import { toast } from 'sonner';

export default function FuneralsClient({ initialData, parishioners }: any) {
 const [search, setSearch] = useState('');
 const [isRegisterModal, setIsRegisterModal] = useState(false);
 const [activeDeceasedId, setActiveDeceasedId] = useState<string | null>(initialData[0]?.id || null);
 const [isMemorialModalOpen, setIsMemorialModalOpen] = useState(false);

 const filteredDeceased = initialData.filter((d: any) => 
 d.lastName.toLowerCase().includes(search.toLowerCase()) || 
 d.firstName.toLowerCase().includes(search.toLowerCase())
);
 const activeRecord = initialData.find((d:any) => d.id === activeDeceasedId);

 const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
 e.preventDefault();
 const fd = new FormData(e.currentTarget);
 const payload = {
 parishionerId: fd.get('parishionerId'),
 firstName: fd.get('firstName'),
 lastName: fd.get('lastName'),
 fathersName: fd.get('fathersName'),
 dateOfDeath: fd.get('dateOfDeath'),
 dateOfFuneral: fd.get('dateOfFuneral'),
 placeOfFuneral: fd.get('placeOfFuneral'),
 graveDetails: fd.get('graveDetails'),
 nextOfKinName: fd.get('nextOfKinName'),
 nextOfKinPhone: fd.get('nextOfKinPhone'),
 causeOfDeath: fd.get('causeOfDeath'),
 bookNumber: fd.get('bookNumber'),
 };
 
 toast.promise(registerDeceased(payload), {
 loading: 'Καταχώρηση...',
 success: (res) => {
 if(!res.success) throw new Error(res.error);
 setIsRegisterModal(false);
 return 'Επιτυχής εγγραφή πράξης!';
 },
 error: 'Σφάλμα εγγραφής'
 });
 };

 const handleCreateMemorial = async (e: React.FormEvent<HTMLFormElement>) => {
 e.preventDefault();
 if (!activeDeceasedId) return;
 const fd = new FormData(e.currentTarget);
 const payload = {
 type: fd.get('type'),
 date: fd.get('date'),
 time: fd.get('time'),
 officiantPriest: fd.get('officiantPriest'),
 notes: fd.get('notes'),
 };
 
 toast.promise(scheduleMemorial(activeDeceasedId, payload), {
 loading: 'Προγραμματισμός...',
 success: (res) => {
 if(!res.success) throw new Error(res.error);
 setIsMemorialModalOpen(false);
 return 'Το Μνημόσυνο προγραμματίστηκε!';
 },
 error: 'Σφάλμα'
 });
 };

 return (
 <div className="flex flex-col lg:flex-row gap-6">
 
 {/* Sidebar: Deceased List */}
 <div className="w-full lg:w-80 flex flex-col space-y-4">
 <Button onClick={() => setIsRegisterModal(true)} className="w-full bg-slate-800 hover:bg-slate-900 text-white gap-2">
 <Plus className="w-5 h-5"/> Nέα Ληξιαρχική Πράξη
 </Button>

 <div className="relative">
 <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"/>
 <Input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Αναζήτηση ονόματος..."className="pl-9"/>
 </div>

 <div className="space-y-3 overflow-y-auto max-h-[600px] pb-4">
 {filteredDeceased.length === 0 && <div className="text-[var(--text-muted)] text-sm text-center py-8 border border-dashed rounded-lg">Κανένα αποτέλεσμα.</div>}
 {filteredDeceased.map((dec: any) => (
 <div 
 key={dec.id} 
 onClick={() => setActiveDeceasedId(dec.id)}
 className={`p-3 rounded-lg cursor-pointer border transition-all ${activeDeceasedId === dec.id ? 'bg-[var(--background)] border-slate-400 shadow-sm' : 'bg-[var(--surface)] border-border hover:shadow-sm'}`}
 >
 <h3 className="font-bold text-[var(--foreground)] truncate"title={`${dec.lastName} ${dec.firstName}`}>{dec.lastName} {dec.firstName}</h3>
 <p className="text-xs text-[var(--text-muted)] mt-1 flex items-center gap-1">✝️ {new Date(dec.dateOfDeath).toLocaleDateString("el-GR")}</p>
 {dec.bookNumber && <p className="text-[10px] text-[var(--text-muted)] mt-1 flex items-center gap-1"><Book className="w-3 h-3"/> Πράξη: {dec.bookNumber}</p>}
 </div>
))}
 </div>
 </div>

 {/* Main Content: Record Details */}
 <div className="flex-1">
 {!activeRecord ? (
 <div className="bg-[var(--background)] border-2 border-dashed border-border rounded-xl h-96 flex flex-col items-center justify-center text-[var(--text-muted)]">
 <p>Επιλέξτε μια εγγραφή από τα αριστερά για προβολή Λεπτομερειών.</p>
 </div>
) : (
 <div className="space-y-6">
 {/* ID CARD */}
 <Card className="rounded-xl border-border shadow-sm overflow-hidden flex flex-col">
 <div className="bg-slate-800 text-white p-6 relative overflow-hidden">
 <span className="absolute right-[-40px] top-[-40px] text-slate-700 opacity-20 text-[150px]">🕊️</span>
 <h2 className="text-2xl font-bold flex items-center gap-2 relative z-10">{activeRecord.lastName} {activeRecord.firstName} {activeRecord.fathersName && <span className="text-[var(--text-muted)] font-normal text-lg">του {activeRecord.fathersName}</span>}</h2>
 <div className="flex flex-wrap gap-4 mt-3 text-sm opacity-90 relative z-10">
 <p className="flex items-center gap-1"><Calendar className="w-4 h-4"/> Ημ. Εκδημίας: {new Date(activeRecord.dateOfDeath).toLocaleDateString("el-GR")}</p>
 <p className="flex items-center gap-1"><MapPin className="w-4 h-4"/> {activeRecord.placeOfFuneral || '–'}</p>
 </div>
 </div>
 
 <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
 <div className="space-y-4 text-sm">
 <div><span className="text-[var(--text-muted)] block">Ληξιαρχικός Αριθμός (Βιβλίο):</span><span className="font-semibold">{activeRecord.bookNumber || '-'}</span></div>
 <div><span className="text-[var(--text-muted)] block">Στοιχεία Τάφου (Οστεοφυλάκιο):</span><span className="font-semibold">{activeRecord.graveDetails || '-'}</span></div>
 <div><span className="text-[var(--text-muted)] block">Πλησιέστερος Συγγενής:</span><span className="font-semibold">{activeRecord.nextOfKinName || '-'} ({activeRecord.nextOfKinPhone || '-'})</span></div>
 <div><span className="text-[var(--text-muted)] block">Ημερομηνία & Ώρα Ταφής:</span><span className="font-semibold">{activeRecord.dateOfFuneral ? new Date(activeRecord.dateOfFuneral).toLocaleString("el-GR") : '-'}</span></div>
 </div>
 <div className="space-y-3 bg-[var(--background)] p-4 rounded-xl border border-border/50">
 <h4 className="font-bold flex items-center gap-1"><Download className="w-4 h-4"/> Ψηφιακές Εκτυπώσεις Ναού</h4>
 <Button variant="outline"className="w-full justify-start text-left gap-2"><FileText className="w-4 h-4 text-blue-600"/> Πιστοποιητικό Εκδημίας</Button>
 <Button variant="outline"className="w-full justify-start text-left gap-2"><FileText className="w-4 h-4 text-purple-600"/> Βεβαίωση Επιμέλειας Τάφου (Δήμο)</Button>
 </div>
 </div>
 </Card>

 {/* MEMORIALS */}
 <Card className="rounded-xl border-border shadow-sm overflow-hidden p-6">
 <div className="flex justify-between items-center mb-6">
 <h3 className="font-bold text-lg flex items-center gap-2">🕯️ Προγραμματισμός Μνημοσύνων</h3>
 <Button onClick={()=>setIsMemorialModalOpen(true)} variant="secondary"className="gap-2 bg-slate-100 text-[var(--foreground)] hover:bg-slate-200">
 <Plus className="w-4 h-4"/> Νέο Μνημόσυνο
 </Button>
 </div>
 {activeRecord.memorials.length === 0 ? (
 <p className="text-sm text-[var(--text-muted)]">Δεν υπάρχουν προγραμματισμένα μνημόσυνα στο σύστημα.</p>
) : (
 <div className="space-y-3">
 {activeRecord.memorials.map((m: any) => (
 <div key={m.id} className="flex justify-between items-center p-3 border border-border rounded-lg bg-orange-50/50 hover:bg-orange-50">
 <div>
 <p className="font-bold text-[var(--foreground)]">
 {m.type === '40MH' ? 'Τεσσαρακονθήμερο' : m.type === '1YEAR' ? 'Ετήσιο' : m.type === '3YEARS' ? 'Τριετές' : 'Μνημόσυνο'} 
 <span className="text-[var(--text-muted)] font-normal ml-2">({new Date(m.date).toLocaleDateString("el-GR")} - Ώρα: {m.time || '-'})</span>
 </p>
 <p className="text-xs text-[var(--text-muted)] mt-1">Εφημέριος: {m.officiantPriest || '-'}</p>
 </div>
 <Button size="sm"variant="outline"className="gap-1 border-orange-200 text-orange-700 hover:bg-orange-100"><FileText className="w-3 h-3"/> Άδεια Ναού</Button>
 </div>
))}
 </div>
)}
 </Card>
 </div>
)}
 </div>

 {/* MODAL: Register Deceased */}
 {isRegisterModal && (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
 <div className="bg-[var(--surface)] rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
 <div className="sticky top-0 bg-[var(--surface)] border-b border-border p-5 z-10 flex justify-between items-center">
 <h2 className="text-xl font-bold flex items-center gap-2">🕊️ Νέα Ληξιαρχική Πράξη Κεκοιμημένου</h2>
 <Button variant="ghost"onClick={()=>setIsRegisterModal(false)}>Χ</Button>
 </div>
 <form onSubmit={handleRegister} className="p-6 space-y-6">
 <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-800 border border-blue-200">
 Εάν ο κεκοιμημένος ήταν Ενορίτης (CRM) μπορείτε να τον επιλέξετε από τη λίστα για ταχύτερη σύνδεση.
 </div>
 
 <div className="space-y-1">
 <label className="text-sm font-semibold text-[var(--text-muted)]">Σύνδεση με Καρτέλα Ενορίτη (Προαιρετικό)</label>
 <select name="parishionerId"className="w-full border border-border p-2 rounded-md bg-transparent">
 <option value="">-- Νέα Εγγραφή Εκτός Μητρώου --</option>
 {parishioners.map((p:any) => <option key={p.id} value={p.id}>{p.lastName} {p.firstName} (ΑΔΤ: {p.idNumber || '-'})</option>)}
 </select>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <div className="space-y-1"><label className="text-sm font-semibold text-red-600">Όνομα *</label><Input name="firstName"required /></div>
 <div className="space-y-1"><label className="text-sm font-semibold text-red-600">Επώνυμο *</label><Input name="lastName"required /></div>
 <div className="space-y-1"><label className="text-sm font-semibold">Πατρώνυμο</label><Input name="fathersName"/></div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="space-y-1"><label className="text-sm font-semibold text-red-600">Ημερομηνία Εκδημίας *</label><Input type="date"name="dateOfDeath"required /></div>
 <div className="space-y-1"><label className="text-sm font-semibold">Ληξιαρχικός Αριθμός (Βιβλίο Ναού)</label><Input name="bookNumber"placeholder="π.χ. 45/2026"/></div>
 </div>

 <hr className="border-border"/>
 
 <h3 className="font-bold text-gray-700">Στοιχεία Ταφής & Συγγενών</h3>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <div className="space-y-1"><label className="text-sm font-semibold">Ημερομηνία Ταφής</label><Input type="datetime-local"name="dateOfFuneral"/></div>
 <div className="space-y-1"><label className="text-sm font-semibold">Νεκροταφείο</label><Input name="placeOfFuneral"placeholder="π.χ. Γ' Κοιμητήριο"/></div>
 <div className="space-y-1"><label className="text-sm font-semibold">Θέση Τάφου (Συντεταγμένες)</label><Input name="graveDetails"placeholder="Τομέας... Τάφος..."/></div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="space-y-1"><label className="text-sm font-semibold">Ονοματεπώνυμο Συγγενούς</label><Input name="nextOfKinName"/></div>
 <div className="space-y-1"><label className="text-sm font-semibold">Τηλέφωνο Επικοινωνίας</label><Input name="nextOfKinPhone"/></div>
 </div>

 <div className="flex gap-3 pt-6 border-t border-border">
 <Button type="button"onClick={()=>setIsRegisterModal(false)} variant="outline"className="flex-1">Ακύρωση</Button>
 <Button type="submit"className="flex-1 bg-slate-800 hover:bg-slate-900 text-white">Καταχώρηση Στοιχείων</Button>
 </div>
 </form>
 </div>
 </div>
)}

 {/* MODAL: Memorial Schedule */}
 {isMemorialModalOpen && (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
 <div className="bg-[var(--surface)] rounded-2xl shadow-xl w-full max-w-sm p-6">
 <h2 className="text-lg font-bold mb-4">Προγραμματισμός Μνημοσύνου</h2>
 <form onSubmit={handleCreateMemorial} className="space-y-4">
 <div className="space-y-1">
 <label className="text-sm font-semibold">Είδος Μνημοσύνου</label>
 <Select name="type"defaultValue="40MH"required>
 <SelectTrigger><SelectValue/></SelectTrigger>
 <SelectContent>
 <SelectItem value="40MH">Τεσσαρακονθήμερο (40 Μέρες)</SelectItem>
 <SelectItem value="1YEAR">Ετήσιο (1 Έτος)</SelectItem>
 <SelectItem value="3YEARS">Τριετές (3 Έτη)</SelectItem>
 <SelectItem value="OTHER">Άλλο / Επίκαιρο</SelectItem>
 </SelectContent>
 </Select>
 </div>
 <div className="grid grid-cols-2 gap-4">
 <div className="space-y-1"><label className="text-sm font-semibold">Ημερομηνία</label><Input type="date"name="date"required /></div>
 <div className="space-y-1"><label className="text-sm font-semibold">Ώρα</label><Input type="time"name="time"defaultValue="10:00"/></div>
 </div>
 <div className="space-y-1"><label className="text-sm font-semibold">Εφημέριος / Ιερατείο</label><Input name="officiantPriest"placeholder="π.χ. π. Ιωάννης"/></div>
 
 <div className="flex gap-3 pt-4">
 <Button type="button"onClick={()=>setIsMemorialModalOpen(false)} variant="outline"className="flex-1">Ακύρωση</Button>
 <Button type="submit"className="flex-1 bg-orange-600 hover:bg-orange-700 text-white">Αποθήκευση</Button>
 </div>
 </form>
 </div>
 </div>
)}
 </div>
);
}
