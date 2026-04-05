'use client';

import { useState } from 'react';
import { createPhiloptochosMember, deletePhiloptochosMember } from '@/actions/philanthropyBoard';
import { Shield, Trash2, Plus, Users, Calendar } from 'lucide-react';

export default function BoardClient({ initialMembers }: { initialMembers: any[] }) {
 const [members, setMembers] = useState(initialMembers);
 const [openForm, setOpenForm] = useState(false);
 const [formData, setFormData] = useState({ firstName: '', lastName: '', role: 'Μέλος', startDate: '', endDate: '' });
 const [loading, setLoading] = useState(false);

 const roles = ['Πρόεδρος', 'Αντιπρόεδρος', 'Ταμίας', 'Γραμματέας', 'Μέλος'];

 async function handleSubmit(e: React.FormEvent) {
 e.preventDefault();
 setLoading(true);
 try {
 const newMember = await createPhiloptochosMember(formData);
 setMembers([newMember, ...members]);
 setOpenForm(false);
 setFormData({ firstName: '', lastName: '', role: 'Μέλος', startDate: '', endDate: '' });
 } catch (err) {
 alert('Σφάλμα: ' + err);
 } finally {
 setLoading(false);
 }
 }

 async function handleDelete(id: string) {
 if(!confirm('Σίγουρα θέλετε να διαγράψετε το μέλος;')) return;
 try {
 await deletePhiloptochosMember(id);
 setMembers(members.filter(m => m.id !== id));
 } catch(err) {
 alert('Δεν ήταν δυνατή η διαγραφή.');
 }
 }

 return (
 <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
 <div className="flex justify-between items-center mb-6">
 <h2 className="font-bold text-slate-800 text-lg">Μέλη Δ.Σ. Ε.Φ.Τ.</h2>
 <button onClick={() => setOpenForm(!openForm)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
 <Plus className="w-4 h-4"/> Προσθήκη Μέλους
 </button>
 </div>

 {openForm && (
 <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-6 animate-in slide-in-from-top-4">
 <h3 className="text-sm font-bold text-slate-600 uppercase mb-4 tracking-wider">Στοιχεία Νέου Μέλους</h3>
 <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <label className="block text-xs font-bold text-slate-500 mb-1">Όνομα</label>
 <input required value={formData.firstName} onChange={e=>setFormData({...formData, firstName: e.target.value})} className="data-input w-full"placeholder="π.χ. Μαρία"/>
 </div>
 <div>
 <label className="block text-xs font-bold text-slate-500 mb-1">Επίθετο</label>
 <input required value={formData.lastName} onChange={e=>setFormData({...formData, lastName: e.target.value})} className="data-input w-full"placeholder="π.χ. Παπαδοπούλου"/>
 </div>
 <div>
 <label className="block text-xs font-bold text-slate-500 mb-1">Ρόλος / Αξίωμα</label>
 <select value={formData.role} onChange={e=>setFormData({...formData, role: e.target.value})} className="data-input w-full bg-white">
 {roles.map(r => <option key={r} value={r}>{r}</option>)}
 </select>
 </div>
 <div>
 <label className="block text-xs font-bold text-slate-500 mb-1">Έναρξη Θητείας</label>
 <input type="date"required value={formData.startDate} onChange={e=>setFormData({...formData, startDate: e.target.value})} className="data-input w-full"/>
 </div>
 <div>
 <label className="block text-xs font-bold text-slate-500 mb-1">Λήξη Θητείας (Προαιρετικό)</label>
 <input type="date"value={formData.endDate} onChange={e=>setFormData({...formData, endDate: e.target.value})} className="data-input w-full"/>
 </div>
 <div className="col-span-full pt-4">
 <button disabled={loading} type="submit"className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl disabled:opacity-50">
 {loading ? 'Αποθήκευση...' : 'Προσθήκη στο Δ.Σ.'}
 </button>
 </div>
 </form>
 </div>
)}

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {members.length === 0 && (
 <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-400">
 <Shield className="w-12 h-12 mb-3 text-slate-200"/>
 <p>Δεν υπάρχουν καταχωρημένα μέλη στο Διοικητικό Συμβούλιο.</p>
 </div>
)}
 {members.map(member => (
 <div key={member.id} className="border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-shadow relative bg-gradient-to-b from-white to-slate-50/50">
 <button onClick={() => handleDelete(member.id)} className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 transition-colors">
 <Trash2 className="w-4 h-4"/>
 </button>
 <div className="flex items-center gap-3 mb-4">
 <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
 {member.firstName[0]}{member.lastName[0]}
 </div>
 <div>
 <h4 className="font-bold text-slate-900">{member.firstName} {member.lastName}</h4>
 <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest">{member.role}</p>
 </div>
 </div>
 <div className="flex items-center gap-2 text-xs text-slate-500 bg-white p-2 rounded-lg border border-slate-100">
 <Calendar className="w-4 h-4 text-slate-400"/> 
 <span>Από: {new Date(member.startDate).toLocaleDateString('el-GR')}</span>
 </div>
 </div>
))}
 </div>
 </div>
);
}
