'use client';

import { useState, useEffect } from 'react';
import { trackCitizenRequest } from '@/actions/connect';
import { Search, Loader2, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export default function TrackClient({ slug }: { slug: string }) {
   const searchParams = useSearchParams();
   const [id, setId] = useState(searchParams.get('id') || '');
   const [status, setStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'>('IDLE');
   const [result, setResult] = useState<any>(null);

   useEffect(() => {
      const paramId = searchParams.get('id');
      if (paramId) {
         handleSearch(paramId);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   async function handleSearch(searchId?: string) {
      const q = searchId || id;
      if (!q) return;
      
      setStatus('LOADING');
      try {
         const res = await trackCitizenRequest(q);
         if (res) {
            setResult(res);
            setStatus('SUCCESS');
         } else {
            setStatus('ERROR');
         }
      } catch (e) {
         setStatus('ERROR');
      }
   }

   return (
      <div className="space-y-6">
         <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Αριθμός Αναζήτησης (Tracking ID)</label>
            <div className="flex gap-2">
               <input 
                  type="text" 
                  value={id}
                  onChange={e => setId(e.target.value)}
                  className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 font-mono outline-none" 
                  placeholder="π.χ. cly123..." 
               />
               <button 
                  onClick={() => handleSearch()}
                  disabled={status === 'LOADING' || !id}
                  className="px-6 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-md"
               >
                  {status === 'LOADING' ? <Loader2 className="w-5 h-5 animate-spin"/> : <Search className="w-5 h-5"/>}
                  <span className="hidden sm:inline">Εύρεση</span>
               </button>
            </div>
         </div>

         {status === 'ERROR' && (
            <div className="p-4 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-sm font-medium animate-in fade-in">
               Δεν βρέθηκε αίτημα με αυτόν τον κωδικό. Ελέγξτε αν τον πληκτρολογήσατε σωστά.
            </div>
         )}

         {status === 'SUCCESS' && result && (
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-5 animate-in slide-in-from-bottom-4 fade-in duration-500 shadow-inner">
               <h3 className="font-bold text-slate-800 border-b border-slate-200 pb-2">Στοιχεία Αιτήματος</h3>
               
               <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                     <span className="block text-slate-500 text-xs font-semibold mb-1 uppercase tracking-wider">Ονοματεπώνυμο</span>
                     <span className="font-medium text-slate-800">{result.applicantName}</span>
                  </div>
                  <div>
                     <span className="block text-slate-500 text-xs font-semibold mb-1 uppercase tracking-wider">Ημ/νία Υποβολής</span>
                     <span className="font-medium text-slate-800">{new Date(result.createdAt).toLocaleDateString('el-GR')}</span>
                  </div>
               </div>

               <div>
                  <span className="block text-slate-500 text-xs font-semibold mb-2 uppercase tracking-wider">Κατάσταση</span>
                  {result.status === 'PENDING' && (
                     <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-3 py-1.5 rounded-lg font-bold text-sm shadow-sm border border-amber-200">
                        <Clock className="w-4 h-4"/> Σε αναμονή / Επεξεργάζεται
                     </div>
                  )}
                  {result.status === 'APPROVED' && (
                     <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-lg font-bold text-sm shadow-sm border border-emerald-200">
                        <CheckCircle2 className="w-4 h-4"/> Ολοκληρώθηκε / Εγκρίθηκε
                     </div>
                  )}
                  {result.status === 'REJECTED' && (
                     <div className="inline-flex items-center gap-2 bg-rose-100 text-rose-800 px-3 py-1.5 rounded-lg font-bold text-sm shadow-sm border border-rose-200">
                        <XCircle className="w-4 h-4"/> Απορρίφθηκε / Ακυρώθηκε
                     </div>
                  )}
               </div>
               
               {result.status === 'APPROVED' && (
                  <div className="text-xs text-blue-700 bg-blue-50 p-3 rounded-lg border border-blue-100 mt-2 flex items-start gap-2">
                     <span className="font-bold">ℹ️</span>
                     <span>Το αίτημά σας έχει εγκριθεί. Μεταβείτε στη Γραμματεία του Ναού για την παραλαβή του εγγράφου ή αναμείνατε ηλεκτρονική αποστολή εφόσον ζητήθηκε.</span>
                  </div>
               )}
            </div>
         )}
      </div>
   );
}
