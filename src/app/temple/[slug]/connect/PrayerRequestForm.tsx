'use client';

import { useState } from 'react';
import { submitPrayerRequest } from '@/actions/diptychs';
import { CheckCircle2, Cross, Leaf, Send, User, Mail } from 'lucide-react';

export default function PrayerRequestForm({ slug }: { slug: string }) {
 const [type, setType] = useState('Θεία Λειτουργία');
 const [status, setStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS'>('IDLE');

 async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
 e.preventDefault();
 setStatus('LOADING');
 
 const formData = new FormData(e.currentTarget);
 const data = {
 templeSlug: slug,
 type,
 submitterName: formData.get('submitterName') as string,
 submitterEmail: formData.get('submitterEmail') as string,
 livingNames: formData.get('livingNames') as string,
 fallenNames: formData.get('fallenNames') as string,
 };

 try {
 const res = await submitPrayerRequest(data);
 if (res?.success) setStatus('SUCCESS');
 else throw new Error('Error');
 } catch (err) {
 console.error(err);
 setStatus('IDLE');
 alert('Υπήρξε ένα πρόβλημα. Επικοινωνήστε με τον Ναό.');
 }
 }

 if (status === 'SUCCESS') {
 return (
 <div className="text-center py-10 animate-in zoom-in-95 fade-in duration-500">
 <div className="mx-auto bg-emerald-100 w-20 h-20 rounded-full flex items-center justify-center mb-6">
 <CheckCircle2 className="w-10 h-10 text-emerald-600"/>
 </div>
 <h3 className="text-2xl font-bold text-slate-800 mb-2">Τα Ονόματα Εστάλησαν!</h3>
 <p className="text-slate-500 max-w-md mx-auto">
 Θα μνημονευτούν κατά τη διάρκεια της Ακολουθίας. Ο Θεός να σας ευλογεί.
 </p>
 </div>
);
 }

 return (
 <form onSubmit={handleSubmit} className="space-y-6">
 <div>
 <label className="block text-sm font-bold text-slate-700 mb-2">Για Ποια Ακολουθία;</label>
 <select 
 value={type} 
 onChange={(e) => setType(e.target.value)}
 className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-3"
 >
 <option value="Θεία Λειτουργία">Θεία Λειτουργία</option>
 <option value="Παράκληση">Ιερά Παράκληση</option>
 <option value="Αρτοκλασία">Αρτοκλασία</option>
 <option value="Μνημόσυνο">Μνημόσυνο (Υπέρ Αναπαύσεως)</option>
 <option value="Σαρανταλείτουργο">Ιερό Σαρανταλείτουργο</option>
 </select>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div>
 <label className="block text-sm font-bold text-slate-700 mb-2"><Leaf className="inline w-4 h-4 mr-1 text-green-600"/> Υπέρ Υγείας</label>
 <textarea name="livingNames"rows={5} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-y"placeholder="π.χ.&#10;Γεωργίου&#10;Άννης&#10;Μαρίας&#10;(ένα όνομα ανά γραμμή)"></textarea>
 </div>
 <div>
 <label className="block text-sm font-bold text-slate-700 mb-2"><Cross className="inline w-4 h-4 mr-1 text-red-600"/> Υπέρ Αναπαύσεως</label>
 <textarea name="fallenNames"rows={5} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-y"placeholder="π.χ.&#10;Νικολάου&#10;Ελένης&#10;Κωνσταντίνου&#10;(ένα όνομα ανά γραμμή)"></textarea>
 </div>
 </div>

 <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
 <div>
 <label className="block text-sm font-bold text-slate-700 mb-2"><User className="inline w-4 h-4 mr-1"/> Το Όνομά σας (Προαιρετικό)</label>
 <input name="submitterName"type="text"className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"placeholder="π.χ. Οικογένεια Παπαδοπούλου"/>
 </div>
 <div>
 <label className="block text-sm font-bold text-slate-700 mb-2"><Mail className="inline w-4 h-4 mr-1"/> Email (Προαιρετικό)</label>
 <input name="submitterEmail"type="email"className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"placeholder="email@example.com"/>
 </div>
 </div>

 <button 
 type="submit"
 disabled={status === 'LOADING'}
 className="w-full md:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-200 disabled:opacity-50"
 >
 {status === 'LOADING' ? 'Αποστολή...' : <> <Send className="w-5 h-5"/> Αποστολή Ονομάτων </>}
 </button>
 </form>
);
}
