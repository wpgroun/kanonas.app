'use client';

import { useState } from 'react';
import { calculateQuarterTaxes, payQuarterTaxes } from '@/actions/finances';
import { Calculator, CheckCircle2, AlertCircle } from 'lucide-react';

export default function QuarterlyWidget() {
 const [year, setYear] = useState(new Date().getFullYear());
 const [quarter, setQuarter] = useState(Math.ceil((new Date().getMonth() + 1) / 3));
 const [taxes, setTaxes] = useState<any>(null);
 const [status, setStatus] = useState<'IDLE' | 'CALCULATING' | 'READY' | 'PAYING' | 'DONE'>('IDLE');

 async function handleCalculate() {
 setStatus('CALCULATING');
 const res = await calculateQuarterTaxes(year, quarter);
 if (res.success) {
 setTaxes(res);
 setStatus('READY');
 } else {
 alert("Υπήρξε σφάλμα στον υπολογισμό.");
 setStatus('IDLE');
 }
 }

 async function handlePay() {
 if(!confirm("Είστε σίγουροι; Θα δημιουργηθούν άμεσα Εντάλματα Πληρωμής.")) return;
 
 setStatus('PAYING');
 const res = await payQuarterTaxes(year, quarter);
 if (res.success) {
 setStatus('DONE');
 } else {
 alert("Αποτυχία πληρωμής.");
 setStatus('READY');
 }
 }

 return (
 <div className="bg-gradient-to-br from-indigo-50 to-white rounded-3xl p-6 border border-indigo-100 shadow-sm relative overflow-hidden">
 <div className="absolute top-0 right-0 p-6 opacity-10">
 <Calculator className="w-24 h-24 text-indigo-500"/>
 </div>
 
 <div className="relative z-10">
 <h3 className="text-sm font-black text-indigo-600 uppercase tracking-wider mb-1">Πληρωμή & Εκκαθάριση</h3>
 <h2 className="text-xl font-bold text-slate-800 mb-4">Εργασίες Τριμήνου</h2>
 
 {status === 'DONE' ? (
 <div className="flex items-center gap-3 text-emerald-600 bg-emerald-50 p-4 rounded-xl border border-emerald-200">
 <CheckCircle2 className="w-6 h-6"/>
 <p className="text-sm font-bold">Τα εντάλματα πληρωμής δημιουργήθηκαν επιτυχώς. Η Τριμηνία έκλεισε.</p>
 </div>
) : (
 <div className="space-y-4">
 <div className="flex flex-col sm:flex-row gap-4">
 <select value={year} onChange={e => setYear(Number(e.target.value))} className="bg-white border border-slate-200 rounded-xl p-2 text-sm font-bold outline-none flex-1">
 <option value={2026}>Έτος 2026</option>
 <option value={2025}>Έτος 2025</option>
 </select>
 <select value={quarter} onChange={e => setQuarter(Number(e.target.value))} className="bg-white border border-slate-200 rounded-xl p-2 text-sm font-bold outline-none flex-1">
 <option value={1}>Α' Τρίμηνο</option>
 <option value={2}>Β' Τρίμηνο</option>
 <option value={3}>Γ' Τρίμηνο</option>
 <option value={4}>Δ' Τρίμηνο</option>
 </select>
 </div>

 {status === 'IDLE' && (
 <button onClick={handleCalculate} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-indigo-200 transition-colors flex justify-center items-center gap-2">
 <Calculator className="w-4 h-4"/> Υπολογισμός Κρατήσεων
 </button>
)}

 {status === 'CALCULATING' && <p className="text-sm text-indigo-500 font-bold animate-pulse text-center">Υπολογισμός...</p>}

 {status === 'READY' && taxes && (
 <div className="bg-white border border-indigo-100 rounded-xl p-4 shadow-sm mt-4 animate-in fade-in zoom-in-95">
 <p className="text-xs font-bold text-slate-500 mb-2 border-b border-slate-100 pb-2">
 Θεωρηθέντα Έσοδα: <span className="text-slate-800">{taxes.totalIncome.toFixed(2)} €</span>
 </p>
 
 <div className="space-y-2 mb-4">
 {taxes.taxes.map((t: any, idx: number) => (
 <div key={idx} className="flex justify-between items-center text-sm">
 <span className="text-slate-600 font-medium">{t.name}</span>
 <span className="font-bold text-rose-600">{(t.amount).toFixed(2)} €</span>
 </div>
))}
 </div>
 
 <button onClick={handlePay} className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-rose-200 transition-colors flex justify-center items-center gap-2">
 <AlertCircle className="w-4 h-4"/> Έκδοση Ενταλμάτων & Πληρωμή
 </button>
 </div>
)}
 </div>
)}
 </div>
 </div>
);
}
