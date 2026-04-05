'use client';

import { useState } from 'react';
import { updateRequestStatus } from '@/actions/connect';
import { Mail, CheckCircle2, XCircle, Clock, FileText } from 'lucide-react';

type RequestData = {
   id: string;
   type: string;
   status: string;
   applicantName: string;
   applicantEmail: string | null;
   applicantPhone: string | null;
   payload: any;
   createdAt: Date;
};

export default function ConnectClient({ initialRequests }: { initialRequests: RequestData[] }) {
   const [requests, setRequests] = useState<RequestData[]>(initialRequests);
   const [filter, setFilter] = useState('ALL');
   const [selectedReq, setSelectedReq] = useState<RequestData | null>(null);

   const filtered = requests.filter(r => filter === 'ALL' || r.status === filter);

   async function handleAction(status: 'APPROVED' | 'REJECTED') {
      if (!selectedReq) return;
      try {
         await updateRequestStatus(selectedReq.id, status);
         setRequests(prev => prev.map(r => r.id === selectedReq.id ? { ...r, status } : r));
         setSelectedReq(null);
      } catch (e) {
         console.error(e);
         alert("Σφάλμα συστήματος.");
      }
   }

   return (
      <div className="flex h-[750px]">
         {/* Sidebar List */}
         <div className="w-1/3 border-r border-slate-200 bg-slate-50/50 flex flex-col">
            <div className="p-4 border-b border-slate-200 flex gap-2">
               <select 
                  value={filter} 
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-700 text-sm rounded-lg p-2 font-semibold outline-none"
               >
                  <option value="ALL">Όλα τα Εισερχόμενα</option>
                  <option value="PENDING">Μόνο Εκκρεμή (Νέα)</option>
                  <option value="APPROVED">Εγκεκριμένα</option>
               </select>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
               {filtered.length === 0 && <p className="text-center text-slate-400 mt-10 text-sm">Κανένα αίτημα.</p>}
               {filtered.map(req => (
                  <div 
                     key={req.id} 
                     onClick={() => setSelectedReq(req)}
                     className={`p-4 rounded-2xl cursor-pointer transition-all ${selectedReq?.id === req.id ? 'bg-blue-100 border-blue-300 shadow-inner' : 'bg-white border-slate-200 hover:border-blue-300 shadow-sm'} border`}
                  >
                     <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-slate-500 uppercase flex items-center justify-center gap-1">
                           {req.status === 'PENDING' ? <Clock className="w-3.5 h-3.5 text-amber-500"/> : req.status === 'APPROVED' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500"/> : <XCircle className="w-3.5 h-3.5 text-rose-500"/>}
                           {req.type}
                        </span>
                        <span className="text-[10px] text-slate-400">{new Date(req.createdAt).toLocaleDateString('el-GR')}</span>
                     </div>
                     <h4 className="font-bold text-slate-800">{req.applicantName}</h4>
                     <p className="text-xs text-slate-500 truncate mt-1">{req.payload?.notes || '-'}</p>
                  </div>
               ))}
            </div>
         </div>

         {/* Detail View */}
         <div className="flex-1 bg-white p-8 overflow-y-auto">
            {!selectedReq ? (
               <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <Mail className="w-16 h-16 mb-4 text-slate-200" />
                  <p>Επιλέξτε μια αίτηση από τα Εισερχόμενα για προβολή.</p>
               </div>
            ) : (
               <div className="max-w-2xl animate-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-start mb-8">
                     <div>
                        <h2 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-2">Στοιχεία Αιτούντος Πολίτη</h2>
                        <h3 className="text-3xl font-black text-slate-900">{selectedReq.applicantName}</h3>
                        <div className="flex gap-4 mt-3 text-sm font-medium text-slate-500">
                           {selectedReq.applicantEmail && <span>📧 {selectedReq.applicantEmail}</span>}
                           {selectedReq.applicantPhone && <span>📞 {selectedReq.applicantPhone}</span>}
                        </div>
                     </div>
                     <span className={`px-3 py-1 text-xs font-bold rounded-lg ${selectedReq.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : selectedReq.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {selectedReq.status}
                     </span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-8">
                     <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-200 pb-2"><FileText className="w-4 h-4 text-blue-500"/> Περιεχόμενο Αίτησης ({selectedReq.type})</h4>
                     <div className="space-y-3">
                        {(Object.entries(selectedReq.payload || {}) as [string, any][]).map(([key, val]) => (
                           val && (
                           <div key={key}>
                              <span className="text-xs font-bold text-slate-400 uppercase block mb-1">{key}</span>
                              <p className="text-slate-800 font-medium bg-white p-3 rounded-xl border border-slate-200 shadow-sm">{String(val)}</p>
                           </div>
                           )
                        ))}
                     </div>
                  </div>

                  {selectedReq.status === 'PENDING' && (
                     <div className="flex gap-4 pt-6 border-t border-slate-100">
                        <button onClick={() => handleAction('APPROVED')} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-200">
                           <CheckCircle2 className="w-5 h-5"/> Έγκριση & Προώθηση
                        </button>
                        <button onClick={() => handleAction('REJECTED')} className="px-6 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-xl font-bold transition-colors">
                           Απόρριψη
                        </button>
                     </div>
                  )}

                  {selectedReq.status === 'APPROVED' && (
                     <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl flex items-center gap-3">
                        <CheckCircle2 className="w-6 h-6"/>
                        <p className="text-sm font-medium">Το αίτημα εγκρίθηκε επιτυχώς. Το Πιστοποιητικό μπορεί να εκδοθεί μέσω του Ληξιαρχείου χρησιμοποιώντας τα στοιχεία αυτού του φακέλου.</p>
                     </div>
                  )}
               </div>
            )}
         </div>
      </div>
   );
}
