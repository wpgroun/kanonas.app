'use client';

import { useState } from 'react';
import { submitCitizenRequest } from '@/actions/connect';
import { CheckCircle2, FileText, Send, User, Phone, Mail } from 'lucide-react';

export default function ConnectForm({ slug }: { slug: string }) {
 const [type, setType] = useState('CERT_AGAMIAS');
 const [status, setStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS'>('IDLE');
 const [trackingId, setTrackingId] = useState<string>('');

 async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
 e.preventDefault();
 setStatus('LOADING');
 
 const formData = new FormData(e.currentTarget);
 const data = {
 templeSlug: slug,
 type,
 applicantName: formData.get('applicantName') as string,
 applicantEmail: formData.get('applicantEmail') as string,
 applicantPhone: formData.get('applicantPhone') as string,
 // the payload collects any extra generic fields
 payload: {
 notes: formData.get('notes') as string,
 dateRequested: formData.get('dateRequested') as string
 }
 };

 try {
 const id = await submitCitizenRequest(data);
 setTrackingId(id);
 setStatus('SUCCESS');
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
 <h3 className="text-2xl font-bold text-slate-800 mb-2">Το Αίτημά σας Υποβλήθηκε!</h3>
 <p className="text-slate-500 max-w-md mx-auto mb-6">
 Το αίτημα καταχωρήθηκε επιτυχώς στη γραμματεία του Ναού. Μπορείτε να παρακολουθήσετε την εξέλιξή του ανά πάσα στιγμή με τον παρακάτω Αριθμό Αναζήτησης:
 </p>
 <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 inline-block font-mono text-lg font-bold text-slate-800 shadow-inner">
 {trackingId}
 </div>
 <div className="mt-8">
 <a href={`/temple/${slug}/connect/track?id=${trackingId}`} className="text-blue-600 font-bold hover:underline text-sm">
 Μετάβαση στην Αναζήτηση Πορείας
 </a>
 </div>
 </div>
);
 }

 return (
 <form onSubmit={handleSubmit} className="space-y-6">
 <div>
 <label className="block text-sm font-bold text-slate-700 mb-2">Τύπος Αιτήματος / Συμμετοχής</label>
 <select 
 value={type} 
 onChange={(e) => setType(e.target.value)}
 className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-3"
 >
 <optgroup label="Πιστοποιητικά & Μυστήρια">
 <option value="CERT_AGAMIAS">Πιστοποιητικό Αγαμίας</option>
 <option value="REQ_MARRIAGE">Αίτηση Τέλεσης Γάμου</option>
 <option value="REQ_BAPTISM">Αίτηση Τέλεσης Βάπτισης</option>
 </optgroup>
 <optgroup label="Ενοριακές Δράσεις (Συμμετοχές)">
 <option value="SUNDAY_SCHOOL">Εγγραφή στο Κατηχητικό Σχολείο</option>
 <option value="EXCURSION">Δήλωση Συμμετοχής σε Προσκυνηματική Εκδρομή</option>
 <option value="OTHER_ACTION">Συμμετοχή σε Άλλη Δράση</option>
 </optgroup>
 </select>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div>
 <label className="block text-sm font-bold text-slate-700 mb-2"><User className="inline w-4 h-4 mr-1"/> Ονοματεπώνυμο Αιτούντος</label>
 <input required name="applicantName"type="text"className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"placeholder="π.χ. Γεώργιος Παπαδόπουλος"/>
 </div>
 <div>
 <label className="block text-sm font-bold text-slate-700 mb-2"><Phone className="inline w-4 h-4 mr-1"/> Τηλέφωνο Επικοινωνίας</label>
 <input required name="applicantPhone"type="tel"className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"placeholder="π.χ. 6900000000"/>
 </div>
 </div>

 <div>
 <label className="block text-sm font-bold text-slate-700 mb-2"><Mail className="inline w-4 h-4 mr-1"/> Email (Προαιρετικό)</label>
 <input name="applicantEmail"type="email"className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"placeholder="π.χ. email@example.com"/>
 </div>

 <div className="pt-4 border-t border-slate-100">
 <label className="block text-sm font-bold text-slate-700 mb-2">
 {type === 'SUNDAY_SCHOOL' ? 'Ονοματεπώνυμο & Ηλικία Παιδιού' : type === 'EXCURSION' ? 'Αριθμός Θέσεων για Κράτηση' : 'Επιπρόσθετες Πληροφορίες / Παρατηρήσεις'}
 </label>
 <textarea name="notes"rows={4} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"placeholder="Γράψτε εδώ τυχόν διευκρινίσεις..."></textarea>
 </div>

 <button 
 type="submit"
 disabled={status === 'LOADING'}
 className="w-full md:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-200 disabled:opacity-50"
 >
 {status === 'LOADING' ? 'Αποστολή...' : <> <Send className="w-5 h-5"/> Υποβολή Αιτήματος </>}
 </button>
 </form>
);
}
