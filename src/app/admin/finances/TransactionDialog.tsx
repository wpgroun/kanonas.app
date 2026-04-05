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
      alert((res as any).error || "Εμφανίστηκε σφάλμα");
    }
  }

  if (!isOpen) return (
    <div className="flex gap-2">
      <Button onClick={() => { setType('INCOME'); setIsOpen(true); }} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-bold shadow-md shadow-emerald-600/20">
         <ArrowUpRight className="w-4 h-4" /> Νέο Έσοδο
      </Button>
      <Button onClick={() => { setType('EXPENSE'); setIsOpen(true); }} className="bg-rose-600 hover:bg-rose-700 text-white gap-2 font-bold shadow-md shadow-rose-600/20">
         <ArrowDownRight className="w-4 h-4" /> Νέο Έξοδο
      </Button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[999] p-4 animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-md rounded-xl shadow-2xl border border-border overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        
        {/* Header */}
        <div className={`p-4 flex justify-between items-center border-b border-border text-white ${type === 'INCOME' ? 'bg-emerald-600' : 'bg-rose-600'}`}>
          <h2 className="font-bold flex items-center gap-2">
            {type === 'INCOME' ? <ArrowUpRight className="w-5 h-5"/> : <ArrowDownRight className="w-5 h-5"/>}
            Καταχώρηση {type === 'INCOME' ? 'Εσόδου' : 'Εξόδου'}
          </h2>
          <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors">
            <X className="w-5 h-5"/>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          <div className="space-y-2">
             <Label className="text-primary font-bold">Ποσό (€)</Label>
             <div className="relative">
               <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">€</span>
               <Input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required className="pl-8 text-lg font-mono font-bold" placeholder="0.00" autoFocus />
             </div>
          </div>

          <div className="space-y-2">
             <Label>Λογαριασμός (Κατηγορία)</Label>
             {categories.length === 0 ? (
                <div className="text-sm text-destructive font-semibold">Δεν έχετε δημιουργήσει κατηγορίες στο Λογιστικό Σχέδιο!</div>
             ) : (
                <select 
                  required value={categoryId} onChange={e => setCategoryId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="" disabled>-- Επιλέξτε Λογαριασμό --</option>
                  {availableCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
             )}
          </div>

          <div className="space-y-2">
             <Label>Αιτιολογία (Προαιρετικό)</Label>
             <Input value={purpose} onChange={e => setPurpose(e.target.value)} placeholder=" π.χ. Αγορά Γραφικής Ύλης" />
          </div>

          <div className="grid grid-cols-2 gap-3">
             <div className="space-y-2">
                <Label>{type === 'INCOME' ? 'Δωρητής/Ενορίτης' : 'Προμηθευτής'}</Label>
                <Input value={donorOrVendor} onChange={e => setDonorOrVendor(e.target.value)} placeholder={type === 'INCOME' ? "Ανώνυμος Δημότης" : "Πλαίσιο A.E."} />
             </div>
             <div className="space-y-2">
                <Label>Αρ. Παραστατικού</Label>
                <Input value={receiptNumber} onChange={e => setReceiptNumber(e.target.value)} placeholder="π.χ. ΤΔ-1234" />
             </div>
          </div>

          <div className="pt-4 flex gap-3 border-t border-border mt-6">
             <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} className="flex-1">Ακύρωση</Button>
             <Button type="submit" disabled={loading || !categoryId} className={`flex-2 font-bold shadow-sm text-white ${type === 'INCOME' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}`}>
                {loading ? 'Καταχώρηση...' : <><Save className="w-4 h-4 mr-2"/> Καταχώρηση</>}
             </Button>
          </div>

        </form>

      </div>
    </div>
  )
}
