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

 const handleAdd = async (e: any) => {
 e.preventDefault();
 setLoading(true);
 await addCentralEvent({
 title, description, startDate, endDate: endDate || startDate,
 category, color: categoryColors[category] || categoryColors['ΑΛΛΟ']
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
 <Card className="shadow-inner border-dashed border-2 bg-slate-50 text-center py-16">
 <CalendarDays className="w-12 h-12 mx-auto text-slate-300 mb-4"/>
 <p className="text-slate-500 font-medium">Το ημερολόγιο είναι κενό.</p>
 </Card>
)}
 <div className="grid grid-cols-1 gap-4">
 {initialEvents.map(ev => {
 const sd = new Date(ev.startDate);
 return (
 <Card key={ev.id} className="shadow-lg border-0 overflow-hidden relative transition-transform hover:-translate-y-1 hover:shadow-xl">
 <div className="absolute left-0 top-0 bottom-0 w-3"style={{backgroundColor: ev.color || '#3b82f6'}} />
 <CardContent className="p-5 pl-8 flex justify-between items-center bg-white">
 <div>
 <div className="flex items-center gap-2 mb-1">
 <span className="text-[10px] font-black tracking-widest text-white px-2 py-0.5 rounded-full"style={{backgroundColor: ev.color || '#3b82f6' }}>
 {ev.category || 'EVENT'}
 </span>
 {ev.metropolisId === null && ev.templeId === null ? (
 <span className="text-[10px] font-black tracking-widest bg-slate-800 text-white px-2 py-0.5 rounded-full">GLOBAL</span>
) : ev.templeId ? (
 <span className="text-[10px] font-black tracking-widest bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">ΕΝΟΡΙΑ</span>
) : (
 <span className="text-[10px] font-black tracking-widest bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">ΜΗΤΡΟΠΟΛΗ</span>
)}
 </div>
 <h3 className="text-xl font-bold text-slate-800 capitalize">{ev.title}</h3>
 <div className="text-sm font-semibold text-slate-500 mt-1 flex items-center gap-2">
 <CalendarDays className="w-4 h-4"/>
 {sd.toLocaleDateString('el-GR', {day: '2-digit', month: 'short', year:'numeric'})}
 </div>
 {ev.description && <p className="text-slate-400 mt-2 text-sm">{ev.description}</p>}
 </div>
 <Button variant="ghost"className="text-rose-500 hover:bg-rose-50"onClick={async () => {
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
 <Card className="shadow-2xl border-0 bg-white sticky top-6 rounded-2xl overflow-hidden">
 <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white">
 <h3 className="font-extrabold text-lg flex items-center gap-2"><MapPin className="w-5 h-5"/> Νέο Γεγονός</h3>
 <p className="text-blue-100 text-sm mt-1">Προσθήκη στο κεντρικό ημερολόγιο</p>
 </div>
 <form onSubmit={handleAdd} className="p-6 space-y-4">
 <div className="space-y-2">
 <Label className="font-bold">Τίτλος</Label>
 <Input required value={title} onChange={e=>setTitle(e.target.value)} className="h-11 rounded-xl bg-slate-50"placeholder="Τίτλος..."/>
 </div>
 
 <div className="space-y-2">
 <Label className="font-bold">Κατηγορία Χρώματος</Label>
 <select required value={category} onChange={e=>setCategory(e.target.value)} className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50">
 <option value="ΛΕΙΤΟΥΡΓΙΑ">Λειτουργία (Κόκκινο)</option>
 <option value="ΣΥΝΕΔΡΙΟ">Συνέδριο/Ομιλία (Μωβ)</option>
 <option value="ΚΑΤΑΣΚΗΝΩΣΗ">Κατασκήνωση (Πράσινο)</option>
 <option value="ΜΗΤΡΟΠΟΛΗ">Μητρόπολη/Συνάντηση (Κίτρινο)</option>
 <option value="ΑΛΛΟ">Άλλο (Μπλε)</option>
 </select>
 </div>

 <div className="grid grid-cols-2 gap-3">
 <div className="space-y-2">
 <Label className="font-bold">Έναρξη</Label>
 <Input type="date"required value={startDate} onChange={e=>setStartDate(e.target.value)} className="h-11 rounded-xl bg-slate-50"/>
 </div>
 <div className="space-y-2">
 <Label className="font-bold">Λήξη</Label>
 <Input type="date"value={endDate} onChange={e=>setEndDate(e.target.value)} className="h-11 rounded-xl bg-slate-50"/>
 </div>
 </div>

 <div className="space-y-2">
 <Label className="font-bold">Περιγραφή</Label>
 <Input value={description} onChange={e=>setDescription(e.target.value)} className="h-11 rounded-xl bg-slate-50"placeholder="..."/>
 </div>

 <Button type="submit"disabled={loading} className="w-full h-12 mt-4 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/30 shadow-lg transition-transform active:scale-95 text-md text-white">
 <Save className="w-5 h-5 mr-2"/> Αποθήκευση
 </Button>
 </form>
 </Card>
 </div>

 </div>
)
}
