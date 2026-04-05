'use client';

import { useState } from 'react';
import { updateRequestStatus } from '@/actions/connect';
import { Mail, CheckCircle2, XCircle, Clock, FileText } from 'lucide-react';

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
};

export default function ConnectClient({ initialRequests, appUrl, slug }: { initialRequests: RequestData[], appUrl: string, slug: string }) {
 const [requests, setRequests] = useState<RequestData[]>(initialRequests);
 const [filter, setFilter] = useState('ALL');
 const [selectedReq, setSelectedReq] = useState<RequestData | null>(null);

 const connectUrl = `${appUrl}/temple/${slug}/connect`;

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
 <div className="w-1/3 border-r border-[var(--border)] bg-[var(--background)]/50 flex flex-col">
 <div className="p-4 border-b border-[var(--border)] flex gap-2">
 <select 
 value={filter} 
 onChange={(e) => setFilter(e.target.value)}
 className="w-full bg-[var(--surface)] border border-slate-300 text-slate-700 text-sm rounded-lg p-2 font-semibold outline-none"
 >
 <option value="ALL">Όλα τα Εισερχόμενα</option>
 <option value="PENDING">Μόνο Εκκρεμή (Νέα)</option>
 <option value="APPROVED">Εγκεκριμένα</option>
 </select>
 </div>
 {slug && (
 <div className="p-4 bg-[var(--surface)] m-3 rounded-2xl shadow-sm border border-[var(--border)] text-center flex flex-col items-center">
 <span className="text-xs font-bold text-[var(--text-muted)] mb-2 uppercase">QR Code (Για πόρτα Ναού)</span>
 <div className="bg-[var(--surface)] p-2 border border-[var(--border)] rounded-xl mb-2">
 <QRCodeSVG value={connectUrl} size={100} level="H"includeMargin={true} />
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
 {req.status === 'PENDING' ? <Clock className="w-3.5 h-3.5 text-amber-500"/> : req.status === 'APPROVED' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500"/> : <XCircle className="w-3.5 h-3.5 text-[var(--danger)]"/>}
 {req.type}
 </span>
 <span className="text-[10px] text-[var(--text-muted)]">{new Date(req.createdAt).toLocaleDateString('el-GR')}</span>
 </div>
 <h4 className="font-bold text-[var(--foreground)]">{req.applicantName}</h4>
 <p className="text-xs text-[var(--text-muted)] truncate mt-1">{req.payload?.notes || '-'}</p>
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
 <span className={`px-3 py-1 text-xs font-bold rounded-lg ${selectedReq.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : selectedReq.status === 'APPROVED' ? 'bg-[var(--success-light)] text-[var(--success)]' : 'bg-[var(--danger-light)] text-[var(--danger)]'}`}>
 {selectedReq.status}
 </span>
 </div>

 <div className="bg-[var(--background)] border border-[var(--border)] rounded-2xl p-6 mb-8">
 <h4 className="text-sm font-bold text-[var(--foreground)] mb-4 flex items-center gap-2 border-b border-[var(--border)] pb-2"><FileText className="w-4 h-4 text-blue-500"/> Περιεχόμενο Αίτησης ({selectedReq.type})</h4>
 <div className="space-y-3">
 {(Object.entries(selectedReq.payload || {}) as [string, any][]).map(([key, val]) => (
 val && (
 <div key={key}>
 <span className="text-xs font-bold text-[var(--text-muted)] uppercase block mb-1">{key}</span>
 <p className="text-[var(--foreground)] font-medium bg-[var(--surface)] p-3 rounded-xl border border-[var(--border)] shadow-sm">{String(val)}</p>
 </div>
)
))}
 </div>
 </div>

 {selectedReq.status === 'PENDING' && (
 <div className="flex gap-4 pt-6 border-t border-[var(--border)]">
 <button onClick={() => handleAction('APPROVED')} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-200">
 <CheckCircle2 className="w-5 h-5"/> Έγκριση & Προώθηση
 </button>
 <button onClick={() => handleAction('REJECTED')} className="px-6 bg-[var(--surface)] hover:bg-[var(--danger-light)] text-[var(--danger)] border border-[var(--danger)]/20 rounded-xl font-bold transition-colors">
 Απόρριψη
 </button>
 </div>
)}

 {selectedReq.status === 'APPROVED' && (
 <div className="bg-[var(--success-light)] border border-[var(--success)]/20 text-[var(--success)] p-4 rounded-xl flex items-center gap-3">
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
