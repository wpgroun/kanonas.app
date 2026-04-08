'use client'

import { useState } from 'react'
import { addCentralEvent, deleteCentralEvent } from '@/actions/calendar'
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalendarDays, Save, Trash2, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CalendarClient({ initialEvents }: { initialEvents: any[] }) {
 const router = useRouter();
 const [loading, setLoading] = useState(false);
 const [title, setTitle] = useState('');
 const [description, setDescription] = useState('');
 const [startDate, setStartDate] = useState('');
 const [endDate, setEndDate] = useState('');
 const [category, setCategory] = useState('ΣΥΝΕΔΡΙΟ');
 
 const categoryColors: Record<string, string> = {
 'ΛΕΙΤΟΥΡΓΙΑ': '#f43f5e', // rose-500
 'ΣΥΝΕΔΡΙΟ': '#8b5cf6', // violet-500
 'ΚΑΤΑΣΚΗΝΩΣΗ': '#10b981', // emerald-500
 'ΜΗΤΡΟΠΟΛΗ': '#f59e0b', // amber-500
 'ΑΛΛΟ': '#3b82f6' // blue-500
 };

 const [color, setColor] = useState(categoryColors['ΣΥΝΕΔΡΙΟ']);

 const handleCategoryChange = (e: any) => {
   const val = e.target.value;
   setCategory(val);
   setColor(categoryColors[val] || '#3b82f6');
 };

 const handleAdd = async (e: any) => {
 e.preventDefault();
 setLoading(true);
 await addCentralEvent({
 title, description, startDate, endDate: endDate || startDate,
 category, color
 });
 setLoading(false);
 setTitle(''); setDescription('');
 router.refresh();
 };

 return (
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
 
 {/* List Container */}
 <div className="col-span-1 lg:col-span-2 space-y-4">
 {initialEvents.length === 0 && (
 <Card className="shadow-inner border-dashed border-2 bg-[var(--background)] text-center py-16">
 <CalendarDays className="w-12 h-12 mx-auto text-slate-300 mb-4"/>
 <p className="text-[var(--text-muted)] font-medium">Το ημερολόγιο είναι κενό.</p>
 </Card>
)}
 <div className="grid grid-cols-1 gap-4">
 {initialEvents.map(ev => {
 const sd = new Date(ev.startDate);
 return (
 <Card key={ev.id} className="shadow-sm border border-[var(--border)] relative transition-transform hover:-translate-y-1 hover:shadow-md" style={{ backgroundColor: `${ev.color || '#3b82f6'}15`, borderColor: `${ev.color || '#3b82f6'}30` }}>
 <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{backgroundColor: ev.color || '#3b82f6'}} />
 <CardContent className="p-5 pl-7 flex justify-between items-center bg-[var(--surface)]">
 <div>
 <div className="flex items-center gap-2 mb-1">
 <span className="text-[10px] font-black tracking-widest text-white px-2 py-0.5 rounded-full"style={{backgroundColor: ev.color || '#3b82f6' }}>
 {ev.category || 'EVENT'}
 </span>
 {ev.metropolisId === null && ev.templeId === null ? (
 <span className="text-[10px] font-black tracking-widest bg-slate-800 text-white px-2 py-0.5 rounded-full">GLOBAL</span>
) : ev.templeId ? (
 <span className="text-[10px] font-black tracking-widest bg-slate-100 text-[var(--text-secondary)] px-2 py-0.5 rounded-full border border-[var(--border)]">ΕΝΟΡΙΑ</span>
) : (
 <span className="text-[10px] font-black tracking-widest bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">ΜΗΤΡΟΠΟΛΗ</span>
)}
 </div>
 <h3 className="text-xl font-bold text-[var(--foreground)] capitalize">{ev.title}</h3>
 <div className="text-sm font-semibold text-[var(--text-muted)] mt-1 flex items-center gap-2">
 <CalendarDays className="w-4 h-4"/>
 {sd.toLocaleDateString('el-GR', {day: '2-digit', month: 'short', year:'numeric'})}
 </div>
 {ev.description && <p className="text-[var(--text-muted)] mt-2 text-sm">{ev.description}</p>}
 </div>
 <Button variant="ghost"className="text-[var(--danger)] hover:bg-[var(--danger-light)]"onClick={async () => {
 if(confirm('Διαγραφή;')) {
 await deleteCentralEvent(ev.id);
 router.refresh();
 }
 }}>
 <Trash2 className="w-5 h-5"/>
 </Button>
 </CardContent>
 </Card>
)
 })}
 </div>
 </div>

 {/* Form Container */}
 <div className="col-span-1">
 <Card className="shadow-2xl border-0 bg-[var(--surface)] sticky top-6 rounded-2xl overflow-hidden">
 <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white">
 <h3 className="font-extrabold text-lg flex items-center gap-2"><MapPin className="w-5 h-5"/> Νέο Γεγονός</h3>
 <p className="text-blue-100 text-sm mt-1">Προσθήκη στο Ημερολόγιο</p>
 </div>
 <form onSubmit={handleAdd} className="p-6 space-y-4">
 <div className="space-y-2">
 <Label className="font-bold">Τίτλος</Label>
 <Input required value={title} onChange={e=>setTitle(e.target.value)} className="h-11 rounded-xl bg-[var(--background)] border border-[var(--border)]"placeholder="Τίτλος..."/>
 </div>
 
 <div className="grid grid-cols-2 gap-3">
  <div className="space-y-2">
  <Label className="font-bold">Κατηγορία</Label>
  <select required value={category} onChange={handleCategoryChange} className="w-full h-11 px-3 rounded-xl border border-[var(--border)] bg-[var(--background)] cursor-pointer focus:ring-2 focus:ring-[var(--brand)]">
  <option value="ΛΕΙΤΟΥΡΓΙΑ">Λειτουργία</option>
  <option value="ΣΥΝΕΔΡΙΟ">Συνέδριο/Ομιλία</option>
  <option value="ΚΑΤΑΣΚΗΝΩΣΗ">Κατασκήνωση</option>
  <option value="ΜΗΤΡΟΠΟΛΗ">Μητρόπολη/Συνάντηση</option>
  <option value="ΑΛΛΟ">Άλλο</option>
  </select>
  </div>
  <div className="space-y-2">
  <Label className="font-bold">Χρώμα</Label>
  <div className="flex items-center gap-2 border border-[var(--border)] rounded-xl bg-[var(--background)] px-2 h-11 focus-within:ring-2 focus-within:ring-[var(--brand)]">
  <input type="color" value={color} onChange={e=>setColor(e.target.value)} className="w-8 h-8 rounded shrink-0 cursor-pointer outline-none border-none bg-[var(--surface)]" title="Επιλογή Χρώματος" />
  <span className="text-xs text-[var(--text-muted)] font-medium uppercase font-mono">{color}</span>
  </div>
  </div>
 </div>

 <div className="grid grid-cols-2 gap-3">
 <div className="space-y-2">
 <Label className="font-bold">Έναρξη</Label>
 <Input type="date"required value={startDate} onChange={e=>setStartDate(e.target.value)} className="h-11 rounded-xl bg-[var(--background)]"/>
 </div>
 <div className="space-y-2">
 <Label className="font-bold">Λήξη</Label>
 <Input type="date"value={endDate} onChange={e=>setEndDate(e.target.value)} className="h-11 rounded-xl bg-[var(--background)]"/>
 </div>
 </div>

 <div className="space-y-2">
 <Label className="font-bold">Περιγραφή</Label>
 <Input value={description} onChange={e=>setDescription(e.target.value)} className="h-11 rounded-xl bg-[var(--background)]"placeholder="..."/>
 </div>

 <Button type="submit"disabled={loading} className="w-full h-12 mt-4 rounded-xl font-bold bg-[var(--brand)] hover:bg-[var(--brand-dark)] shadow-indigo-600/30 shadow-lg transition-transform active:scale-95 text-md text-white">
 <Save className="w-5 h-5 mr-2"/> Αποθήκευση
 </Button>
 </form>
 </Card>
 </div>

 </div>
)
}
