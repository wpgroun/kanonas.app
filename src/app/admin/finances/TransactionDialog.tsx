'use client'

import { useState } from 'react'
import { addTransaction } from '@/actions/finances'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowUpRight, ArrowDownRight, Save, X, Calendar as CalIcon } from 'lucide-react'

export default function TransactionDialog({ categories }: { categories: any[] }) {
 const router = useRouter();
 const [isOpen, setIsOpen] = useState(false);
 
 const [type, setType] = useState<'INCOME'|'EXPENSE'>('INCOME');
 const [amount, setAmount] = useState('');
 const [categoryId, setCategoryId] = useState('');
 const [purpose, setPurpose] = useState('');
 const [donorOrVendor, setDonorOrVendor] = useState('');
 const [receiptNumber, setReceiptNumber] = useState('');
 
 const [loading, setLoading] = useState(false);

 const availableCategories = categories.filter(c => c.type === type);

 async function handleSubmit(e: React.FormEvent) {
 e.preventDefault();
 if (!amount || isNaN(Number(amount))) return alert('Εισάγετε έγκυρο ποσό.');
 if (!categoryId) return alert('Επιλέξτε Κατηγορία Λογαριασμού!');
 
 setLoading(true);
 const res = await addTransaction({
 type,
 categoryId,
 amount: Number(amount),
 date: new Date(),
 purpose,
 donorOrVendor,
 receiptNumber
 });
 setLoading(false);

 if (res.success) {
 setIsOpen(false);
 setAmount('');
 setPurpose('');
 setReceiptNumber('');
 setDonorOrVendor('');
 router.refresh();
 // Also maybe push to dashboard to see changes
 } else {
 alert((res as any).error ||"Εμφανίστηκε σφάλμα");
 }
 }

 if (!isOpen) return (
 <div className="flex gap-3">
 <Button onClick={() => { setType('INCOME'); setIsOpen(true); }} className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white gap-2 font-bold shadow-lg shadow-emerald-500/30 transition-transform active:scale-95">
 <ArrowUpRight className="w-4 h-4"/> Νέο Έσοδο
 </Button>
 <Button onClick={() => { setType('EXPENSE'); setIsOpen(true); }} className="bg-gradient-to-r from-rose-500 to-orange-600 hover:from-rose-600 hover:to-orange-700 text-white gap-2 font-bold shadow-lg shadow-rose-500/30 transition-transform active:scale-95">
 <ArrowDownRight className="w-4 h-4"/> Νέο Έξοδο
 </Button>
 </div>
);

 return (
 <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex flex-col items-center justify-center z-[999] p-4 animate-in fade-in duration-300">
 <div className="bg-[var(--surface)] w-full max-w-xl rounded-2xl shadow-2xl border border-border/50 overflow-hidden animate-in zoom-in-95 duration-300 relative">
 
 {/* Decorative Gradient Background */}
 <div className={`absolute top-0 inset-x-0 h-32 opacity-20 pointer-events-none ${type === 'INCOME' ? 'bg-gradient-to-b from-emerald-500 to-transparent' : 'bg-gradient-to-b from-rose-500 to-transparent'}`} />

 {/* Header */}
 <div className="relative p-6 px-7 flex justify-between items-center border-b border-border/20 z-10">
 <h2 className={`text-2xl font-extrabold flex items-center gap-3 tracking-tight ${type === 'INCOME' ? 'text-[var(--success)] ' : 'text-[var(--danger)] '}`}>
 <div className={`p-2.5 rounded-xl text-white ${type === 'INCOME' ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-500/40' : 'bg-gradient-to-br from-rose-400 to-rose-600 shadow-rose-500/40'} shadow-lg transform rotate-3`}>
 {type === 'INCOME' ? <ArrowUpRight className="w-6 h-6"/> : <ArrowDownRight className="w-6 h-6"/>}
 </div>
 Καταχώρηση {type === 'INCOME' ? 'Εσόδου' : 'Εξόδου'}
 </h2>
 <button onClick={() => setIsOpen(false)} className="text-[var(--text-muted)] hover:text-slate-700 :text-slate-200 transition-colors bg-slate-100 p-2 rounded-full shadow-sm">
 <span className="text-xs font-bold px-2">ΚΛΕΙΣΙΜΟ</span>
 </button>
 </div>

 {/* Body */}
 <form onSubmit={handleSubmit} className="p-7 space-y-6 relative z-10">
 
 <div className="bg-[var(--background)] p-5 rounded-2xl border border-[var(--border)] shadow-inner">
 <Label className="text-muted-foreground font-bold mb-2 block uppercase tracking-wider text-xs">Συνολικό Ποσό</Label>
 <div className="relative flex items-center">
 <span className={`absolute left-4 font-black text-3xl ${type === 'INCOME' ? 'text-emerald-500' : 'text-[var(--danger)]'}`}>€</span>
 <input 
 type="number"
 step="0.01"
 value={amount} 
 onChange={e => setAmount(e.target.value)} 
 required 
 className="w-full pl-12 text-4xl block font-mono bg-transparent border-0 ring-0 focus:ring-0 px-0 rounded-none shadow-none text-foreground font-black tracking-tight"
 placeholder="0.00"
 autoFocus 
 />
 </div>
 </div>

 <div className="space-y-2">
 <Label className="font-semibold text-slate-700">Λογαριασμός (Κατηγορία)</Label>
 {categories.length === 0 ? (
 <div className="text-sm text-destructive font-semibold p-3 bg-red-50 rounded-xl">Δεν έχετε δημιουργήσει κατηγορίες στο Λογιστικό Σχέδιο!</div>
) : (
 <select 
 required value={categoryId} onChange={e => setCategoryId(e.target.value)}
 className="w-full flex h-12 items-center justify-between rounded-xl border-2 border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm text-[var(--foreground)] shadow-sm transition-colors focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-[var(--brand)]/20"
 >
 <option value=""disabled>-- Επιλέξτε Λογαριασμό --</option>
 {availableCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
 </select>
)}
 </div>

 <div className="space-y-2">
 <Label className="font-semibold text-slate-700">Αιτιολογία & Σημειώσεις (Προαιρετικό)</Label>
 <Input value={purpose} onChange={e => setPurpose(e.target.value)} placeholder="π.χ. Αγορά Γραφικής Ύλης, Δωρεά Φιλοπτώχου"className="h-12 rounded-xl border-[var(--border)] border-2 focus-visible:ring-[var(--brand)]/20"/>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
 <div className="space-y-2">
 <Label className="font-semibold text-slate-700">{type === 'INCOME' ? 'Δωρητής / Ενορίτης' : 'Προμηθευτής / Εταιρεία'}</Label>
 <Input value={donorOrVendor} onChange={e => setDonorOrVendor(e.target.value)} placeholder={type === 'INCOME' ?"Ανώνυμος...":"Πλαίσιο A.E."} className="h-12 rounded-xl border-[var(--border)] border-2"/>
 </div>
 <div className="space-y-2">
 <Label className="font-semibold text-slate-700">Αρ. Παραστατικού</Label>
 <Input value={receiptNumber} onChange={e => setReceiptNumber(e.target.value)} placeholder="π.χ. ΤΔ-1234"className="h-12 rounded-xl border-[var(--border)] border-2"/>
 </div>
 </div>

 <div className="pt-6 mt-6 flex justify-end gap-3 border-t border-[var(--border)]">
 <Button type="button"variant="ghost"onClick={() => setIsOpen(false)} className="h-12 px-6 rounded-xl font-semibold text-[var(--text-muted)] hover:text-[var(--foreground)]">Ακύρωση</Button>
 <Button type="submit"disabled={loading || !categoryId} className={`h-12 px-8 rounded-xl font-bold shadow-lg text-white transition-all transform active:scale-95 ${type === 'INCOME' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-emerald-500/30' : 'bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 shadow-rose-500/30'}`}>
 {loading ? 'Καταχώρηση...' : <><Save className="w-5 h-5 mr-2"/> Οριστική Καταχώρηση</>}
 </Button>
 </div>

 </form>

 </div>
 </div>
)
}
