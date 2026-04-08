'use client';

import { useState } from 'react';
import { updateRequestStatus, confirmRequest, rejectRequest, assignPriest } from '@/actions/connect';
import { Mail, CheckCircle2, XCircle, Clock, FileText, UserPlus } from 'lucide-react';

import { QRCodeSVG } from 'qrcode.react';

type RequestData = {
 id: string;
 type: string;
 status: string;
 applicantName: string;
 applicantEmail: string | null;
 applicantPhone: string | null;
 payload: any;
 createdAt: Date;
 assignedPriestId?: string | null;
};

export default function ConnectClient({ initialRequests, appUrl, slug, priests }: { initialRequests: RequestData[], appUrl: string, slug: string, priests: {id:string, name:string}[] }) {
 const [requests, setRequests] = useState<RequestData[]>(initialRequests);
 const [filter, setFilter] = useState('ALL');
 const [selectedReq, setSelectedReq] = useState<RequestData | null>(null);

 const connectUrl = `${appUrl}/temple/${slug}/connect`;

 const filtered = requests.filter(r => filter === 'ALL' || r.status === filter);

 const statusColors: any = {
  INTERESTED: 'bg-blue-100 text-blue-700',
  CONFIRMED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  PENDING: 'bg-amber-100 text-amber-700',
  DOCS_GENERATED: 'bg-purple-100 text-purple-700',
  COMPLETED: 'bg-slate-100 text-slate-700'
 };

 const statusLabels: any = {
  INTERESTED: 'Εκδήλωση Ενδιαφέροντος',
  CONFIRMED: 'Εγκρίθηκε',
  REJECTED: 'Απορρίφθηκε',
  PENDING: 'Αναμονή Στοιχείων',
  DOCS_GENERATED: 'Έγγραφα Έτοιμα',
  COMPLETED: 'Ολοκληρώθηκε'
 };

 async function handleAction(status: 'APPROVED' | 'REJECTED') {
  if (!selectedReq) return;
  try {
   await updateRequestStatus(selectedReq.id, status);
   setRequests(prev => prev.map(r => r.id === selectedReq.id ? { ...r, status } : r));
   setSelectedReq(prev => prev ? { ...prev, status } : null);
  } catch (e) {
   console.error(e);
   alert("Σφάλμα συστήματος.");
  }
 }

 async function handleConfirm() {
  if (!selectedReq) return;
  try {
   await confirmRequest(selectedReq.id);
   setRequests(prev => prev.map(r => r.id === selectedReq.id ? { ...r, status: 'CONFIRMED' } : r));
   setSelectedReq(prev => prev ? { ...prev, status: 'CONFIRMED' } : null);
  } catch (e) { alert("Σφάλμα συστήματος."); }
 }

 async function handleReject() {
  if (!selectedReq) return;
  try {
   await rejectRequest(selectedReq.id);
   setRequests(prev => prev.map(r => r.id === selectedReq.id ? { ...r, status: 'REJECTED' } : r));
   setSelectedReq(prev => prev ? { ...prev, status: 'REJECTED' } : null);
  } catch (e) { alert("Σφάλμα συστήματος."); }
 }

 async function handleAssignPriest(e: React.ChangeEvent<HTMLSelectElement>) {
  if (!selectedReq) return;
  const priestId = e.target.value;
  try {
   await assignPriest(selectedReq.id, priestId);
   setRequests(prev => prev.map(r => r.id === selectedReq.id ? { ...r, assignedPriestId: priestId } : r));
   setSelectedReq(prev => prev ? { ...prev, assignedPriestId: priestId } : null);
  } catch (err) { alert("Σφάλμα ανάθεσης."); }
 }

 return (
 <div className="flex h-[750px]">
 {/* Sidebar List */}
 <div className="w-1/3 border-r border-[var(--border)] bg-[var(--background)]/50 flex flex-col">
 <div className="p-4 border-b border-[var(--border)] flex gap-2">
 <select 
 value={filter} 
 onChange={(e) => setFilter(e.target.value)}
 className="w-full bg-[var(--surface)] border border-slate-300 text-slate-700 text-sm rounded-lg p-2 font-semibold outline-none"
 >
 <option value="ALL">Όλα τα Εισερχόμενα</option>
 <option value="INTERESTED">Εκδήλωση Ενδιαφέροντος</option>
 <option value="PENDING">Αναμονή Στοιχείων (Legacy)</option>
 <option value="CONFIRMED">Εγκεκριμένα</option>
 <option value="REJECTED">Απορριφθέντα</option>
 <option value="DOCS_GENERATED">Έτοιμα</option>
 <option value="COMPLETED">Ολοκληρωμένα</option>
 </select>
 </div>
 {slug && (
 <div className="p-4 bg-[var(--surface)] m-3 rounded-2xl shadow-sm border border-[var(--border)] text-center flex flex-col items-center">
 <span className="text-xs font-bold text-[var(--text-muted)] mb-2 uppercase">QR Code (Για πόρτα Ναού)</span>
 <div className="bg-[var(--surface)] p-2 border border-[var(--border)] rounded-xl mb-2">
 <QRCodeSVG value={connectUrl} size={100} level="H" includeMargin={true} />
 </div>
 <p className="text-[10px] text-[var(--text-muted)] break-all">{connectUrl}</p>
 </div>
 )}
 <div className="flex-1 overflow-y-auto p-3 space-y-2 pt-0">
 {filtered.length === 0 && <p className="text-center text-[var(--text-muted)] mt-10 text-sm">Κανένα αίτημα.</p>}
 {filtered.map(req => (
 <div 
 key={req.id} 
 onClick={() => setSelectedReq(req)}
 className={`p-4 rounded-2xl cursor-pointer transition-all ${selectedReq?.id === req.id ? 'bg-blue-100 border-blue-300 shadow-inner' : 'bg-[var(--surface)] border-[var(--border)] hover:border-blue-300 shadow-sm'} border`}
 >
 <div className="flex justify-between items-start mb-2">
 <span className="text-xs font-bold text-[var(--text-muted)] uppercase flex items-center justify-center gap-1">
 {req.type}
 </span>
 <span className="text-[10px] text-[var(--text-muted)]">{new Date(req.createdAt).toLocaleDateString('el-GR')}</span>
 </div>
 <h4 className="font-bold text-[var(--foreground)]">{req.applicantName}</h4>
 <div className="mt-2 flex">
  <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${statusColors[req.status] || 'bg-slate-100 text-slate-700'}`}>
    {statusLabels[req.status] || req.status}
  </span>
 </div>
 </div>
 ))}
 </div>
 </div>

 {/* Detail View */}
 <div className="flex-1 bg-[var(--surface)] p-8 overflow-y-auto">
 {!selectedReq ? (
 <div className="h-full flex flex-col items-center justify-center text-[var(--text-muted)]">
 <Mail className="w-16 h-16 mb-4 text-slate-200"/>
 <p>Επιλέξτε μια αίτηση από τα Εισερχόμενα για προβολή.</p>
 </div>
 ) : (
 <div className="max-w-2xl animate-in zoom-in-95 duration-200">
 <div className="flex justify-between items-start mb-8">
 <div>
 <h2 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-2">Στοιχεία Αιτούντος Πολίτη</h2>
 <h3 className="text-3xl font-black text-[var(--foreground)]">{selectedReq.applicantName}</h3>
 <div className="flex gap-4 mt-3 text-sm font-medium text-[var(--text-muted)]">
 {selectedReq.applicantEmail && <span>📧 {selectedReq.applicantEmail}</span>}
 {selectedReq.applicantPhone && <span>📞 {selectedReq.applicantPhone}</span>}
 </div>
 </div>
 <span className={`px-3 py-1 text-xs font-bold rounded-lg ${statusColors[selectedReq.status] || 'bg-slate-100 text-slate-700'}`}>
 {statusLabels[selectedReq.status] || selectedReq.status}
 </span>
 </div>

 <div className="bg-[var(--background)] border border-[var(--border)] rounded-2xl p-6 mb-8">
 <h4 className="text-sm font-bold text-[var(--foreground)] mb-4 flex items-center gap-2 border-b border-[var(--border)] pb-2"><FileText className="w-4 h-4 text-blue-500"/> Περιεχόμενο Αίτησης ({selectedReq.type})</h4>
 <div className="space-y-3">
 {(Object.entries(selectedReq.payload || {}) as [string, any][]).map(([key, val]) => {
   if (!val) return null;
   if (key === 'booking' || key === 'bookingRequest') return null;
   return (
     <div key={key}>
       <span className="text-xs font-bold text-[var(--text-muted)] uppercase block mb-1">{key}</span>
       <p className="text-[var(--foreground)] font-medium bg-[var(--surface)] p-3 rounded-xl border border-[var(--border)] shadow-sm">{String(val)}</p>
     </div>
   );
 })}
 </div>
 </div>

 {selectedReq.status === 'INTERESTED' && (
 <div className="flex gap-4 pt-6 border-t border-[var(--border)]">
 <button onClick={handleConfirm} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-200">
 <CheckCircle2 className="w-5 h-5"/> Έγκριση (CONFIRM)
 </button>
 <button onClick={handleReject} className="px-6 bg-[var(--surface)] hover:bg-[var(--danger-light)] text-[var(--danger)] border border-[var(--danger)]/20 rounded-xl font-bold transition-colors">
 Απόρριψη
 </button>
 </div>
 )}

 {selectedReq.status === 'CONFIRMED' && (
 <div className="p-6 bg-emerald-50 border border-emerald-100 text-emerald-900 rounded-xl">
  <div className="flex items-center gap-3 mb-4">
    <CheckCircle2 className="w-6 h-6 text-emerald-600"/>
    <h3 className="font-bold text-lg">Το αίτημα έχει εγκριθεί</h3>
  </div>
  <p className="text-sm mb-4">Μπορείτε να ορίσετε ιερέα για αυτό το αίτημα (προαιρετικά), και να προχωρήσετε στην πλήρη άντληση στοιχείων και παραγωγή εγγράφων.</p>
  
  <div className="flex items-center gap-4">
    <label className="text-sm font-bold flex items-center gap-2">
      <UserPlus className="w-4 h-4" />
      Ορισμός Ιερέα:
    </label>
    <select 
      value={selectedReq.assignedPriestId || ''} 
      onChange={handleAssignPriest}
      className="border border-emerald-200 rounded-lg p-2 font-semibold text-sm outline-none bg-white text-emerald-900 flex-1 max-w-sm"
    >
      <option value="">Επιλέξτε Ιερέα...</option>
      {priests.map(p => (
        <option key={p.id} value={p.id}>{p.name}</option>
      ))}
    </select>
  </div>
  
  <div className="mt-6 flex">
    <button disabled={!selectedReq.assignedPriestId} className="px-6 py-2 bg-purple-600 disabled:opacity-50 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors">
      Παραγωγή Εγγράφων
    </button>
  </div>
 </div>
 )}

 {selectedReq.status === 'PENDING' && (
 <div className="flex gap-4 pt-6 border-t border-[var(--border)]">
 <button onClick={() => handleAction('APPROVED')} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-200">
 <CheckCircle2 className="w-5 h-5"/> Έγκριση & Προώθηση (Legacy)
 </button>
 <button onClick={() => handleAction('REJECTED')} className="px-6 bg-[var(--surface)] hover:bg-[var(--danger-light)] text-[var(--danger)] border border-[var(--danger)]/20 rounded-xl font-bold transition-colors">
 Απόρριψη (Legacy)
 </button>
 </div>
 )}

 {selectedReq.status === 'APPROVED' && (
 <div className="bg-[var(--success-light)] border border-[var(--success)]/20 text-[var(--success)] p-4 rounded-xl flex items-center gap-3">
 <CheckCircle2 className="w-6 h-6"/>
 <p className="text-sm font-medium">Το αίτημα εγκρίθηκε (Legacy). Το Πιστοποιητικό μπορεί να εκδοθεί μέσω του Ληξιαρχείου.</p>
 </div>
 )}

 </div>
 )}
 </div>
 </div>
 );
}
