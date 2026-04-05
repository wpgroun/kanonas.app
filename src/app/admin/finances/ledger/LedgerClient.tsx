'use client'

import React, { useState, useTransition } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, ArrowDownRight, Printer, Plus, Save, X } from 'lucide-react';
import { format } from 'date-fns';
import { el } from 'date-fns/locale';
import { addExpense } from '@/actions/finances';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LedgerClient({ templeId, initialDonations, initialExpenses, categories }: { templeId: string, initialDonations: any[], initialExpenses: any[], categories: any[] }) {
 const [filter, setFilter] = useState('ALL');
 const [isPending, startTransition] = useTransition();
 const [showAdd, setShowAdd] = useState(false);
 const [newExp, setNewExp] = useState({ purpose: '', amount: '', date: new Date().toISOString().split('T')[0], categoryId: '', vendor: '', receiptNumber: '' });

 const handleAddExpense = (e: React.FormEvent) => {
 e.preventDefault();
 if (!newExp.amount || isNaN(Number(newExp.amount))) return alert('Εισάγετε έγκυρο ποσό');
 if (!newExp.categoryId) return alert('Επιλέξτε Κατηγορία Εξόδου!');

 startTransition(async () => {
 const res = await addExpense({
 ...newExp,
 amount: Number(newExp.amount),
 date: new Date(newExp.date),
 donorOrVendor: newExp.vendor
 });
 if(res.success) {
 setShowAdd(false);
 setNewExp({ purpose: '', amount: '', date: new Date().toISOString().split('T')[0], categoryId: '', vendor: '', receiptNumber: '' });
 } else {
 alert(res.error || 'Σφάλμα');
 }
 });
 };

 // Parse arrays into Unified Transactions
 const unifiedTransactions = [
 ...initialDonations.map(d => ({
 ...d,
 type: 'INCOME',
 title: d.purpose || 'Δωρεά',
 entity: d.donorName || 'Ανώνυμος',
 categoryName: 'Έσοδο'
 })),
 ...initialExpenses.map(e => ({
 ...e,
 type: 'EXPENSE',
 title: e.purpose || 'Έξοδο',
 entity: e.vendor || 'Μη ορισκευμένο',
 categoryName: e.category?.name || 'Έξοδο'
 }))
 ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

 const filtered = unifiedTransactions.filter(t => filter === 'ALL' || t.type === filter);
 
 const totalIncome = initialDonations.reduce((sum, item) => sum + item.amount, 0);
 const totalExpense = initialExpenses.reduce((sum, item) => sum + item.amount, 0);
 const balance = totalIncome - totalExpense;

 return (
 <div className="container-fluid mt-6 space-y-6">
 
 {showAdd && (
 <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex flex-col items-center justify-center z-[999] p-4 animate-in fade-in duration-300">
 <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 relative">
 <div className="absolute top-0 inset-x-0 h-32 opacity-20 pointer-events-none bg-gradient-to-b from-rose-500 to-transparent"/>
 <div className="relative p-6 px-7 flex justify-between items-center border-b border-border/20 z-10">
 <h2 className="text-2xl font-extrabold flex items-center gap-3 tracking-tight text-rose-700">
 <div className="p-2.5 rounded-xl text-white bg-gradient-to-br from-rose-400 to-rose-600 shadow-rose-500/40 shadow-lg transform rotate-3">
 <ArrowDownRight className="w-6 h-6"/>
 </div>
 Νέο Έξοδο (Ε.Π.)
 </h2>
 <button onClick={() => setShowAdd(false)} className="bg-slate-100 p-2 rounded-full hover:bg-slate-200"><span className="text-xs font-bold px-2">ΚΛΕΙΣΙΜΟ</span></button>
 </div>
 <form onSubmit={handleAddExpense} className="p-7 space-y-6 relative z-10">
 <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
 <Label className="text-muted-foreground font-bold mb-2 block uppercase text-xs">Συνολικό Ποσό</Label>
 <div className="relative flex items-center">
 <span className="absolute left-4 font-black text-3xl text-rose-500">€</span>
 <input type="number"step="0.01"value={newExp.amount} onChange={e => setNewExp({...newExp, amount: e.target.value})} required autoFocus
 className="w-full pl-12 text-4xl block font-mono bg-transparent border-0 ring-0 px-0 shadow-none text-foreground font-black tracking-tight"placeholder="0.00"/>
 </div>
 </div>
 
 <div className="grid grid-cols-2 gap-5">
 <div className="space-y-2">
 <Label className="font-semibold text-slate-700">Ημερομηνία</Label>
 <Input type="date"required value={newExp.date} onChange={e => setNewExp({...newExp, date: e.target.value})} className="h-12 rounded-xl"/>
 </div>
 <div className="space-y-2">
 <Label className="font-semibold text-slate-700">Λογαριασμός (Κατηγορία)</Label>
 <select required value={newExp.categoryId} onChange={e => setNewExp({...newExp, categoryId: e.target.value})} className="w-full flex h-12 rounded-xl border-2 border-slate-200 px-4 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20">
 <option value=""disabled>-- Επιλογή --</option>
 {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
 </select>
 </div>
 </div>

 <div className="space-y-2">
 <Label className="font-semibold text-slate-700">Αιτιολογία & Σημειώσεις</Label>
 <Input value={newExp.purpose} onChange={e => setNewExp({...newExp, purpose: e.target.value})} placeholder="π.χ. Αγορά Γραφικής Ύλης"className="h-12 rounded-xl border-2 border-slate-200"/>
 </div>

 <div className="grid grid-cols-2 gap-5">
 <div className="space-y-2">
 <Label className="font-semibold text-slate-700">Προμηθευτής / Συναλλασσόμενος</Label>
 <Input value={newExp.vendor} onChange={e => setNewExp({...newExp, vendor: e.target.value})} placeholder="π.χ. Πλαίσιο A.E."className="h-12 rounded-xl border-2 border-slate-200"/>
 </div>
 <div className="space-y-2">
 <Label className="font-semibold text-slate-700">Αρ. Παραστατικού</Label>
 <Input value={newExp.receiptNumber} onChange={e => setNewExp({...newExp, receiptNumber: e.target.value})} placeholder="π.χ. ΤΔ-1234"className="h-12 rounded-xl border-2 border-slate-200"/>
 </div>
 </div>

 <div className="pt-6 mt-6 flex justify-end gap-3 border-t border-slate-100">
 <Button type="button"variant="ghost"onClick={() => setShowAdd(false)} className="h-12 px-6 rounded-xl font-semibold">Ακύρωση</Button>
 <Button type="submit"disabled={isPending || !newExp.categoryId} className="h-12 px-8 rounded-xl font-bold text-white bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 shadow-lg shadow-rose-500/30">
 {isPending ? 'Καταχώρηση...' : <><Save className="w-5 h-5 mr-2"/> Οριστική Καταχώρηση</>}
 </Button>
 </div>
 </form>
 </div>
 </div>
)}

 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
 <div>
 <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
 Βιβλίο Εσόδων - Εξόδων (Καθολικό Ταμείου)
 </h1>
 <p className="text-muted-foreground mt-1 text-sm">Πλήρες λογιστικό βιβλίο σύμφωνα με την Εκκλησιαστική Νομοθεσία.</p>
 </div>
 <div className="flex items-center gap-3">
 <Button onClick={() => setShowAdd(true)} className="bg-rose-500 hover:bg-rose-600 text-white font-bold h-10 shadow-sm transition-transform active:scale-95">
 <Plus className="w-4 h-4 mr-1.5"/> Νέο Έξοδο (Ε.Π.)
 </Button>
 <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-700 rounded-md text-sm font-semibold text-white hover:bg-slate-800">
 <Printer className="w-4 h-4"/> Εκτύπωση Βιβλίου
 </button>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 <Card className="border-l-4 border-l-emerald-500 shadow-sm">
 <CardContent className="pt-6">
 <p className="text-muted-foreground text-sm font-semibold">Σύνολο Εσόδων</p>
 <p className="text-3xl font-bold text-emerald-600">€{totalIncome.toLocaleString('el-GR', { minimumFractionDigits: 2 })}</p>
 </CardContent>
 </Card>
 <Card className="border-l-4 border-l-red-500 shadow-sm">
 <CardContent className="pt-6">
 <p className="text-muted-foreground text-sm font-semibold">Σύνολο Εξόδων</p>
 <p className="text-3xl font-bold text-red-600">€{totalExpense.toLocaleString('el-GR', { minimumFractionDigits: 2 })}</p>
 </CardContent>
 </Card>
 <Card className="border-l-4 border-l-primary shadow-sm bg-primary/5">
 <CardContent className="pt-6">
 <p className="text-muted-foreground text-sm font-semibold">Τρέχον Υπόλοιπο (Ταμείο)</p>
 <p className="text-3xl font-bold text-primary">€{balance.toLocaleString('el-GR', { minimumFractionDigits: 2 })}</p>
 </CardContent>
 </Card>
 </div>

 <Card className="shadow-sm">
 <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/40 pb-4">
 <CardTitle className="text-lg">Αναλυτικά Παραστατικά</CardTitle>
 <select 
 value={filter} 
 onChange={e => setFilter(e.target.value)}
 className="text-sm p-2 border rounded-md"
 >
 <option value="ALL">Όλα τα Παραστατικά</option>
 <option value="INCOME">Μόνο Έσοδα (Γραμμάτια Είσπραξης)</option>
 <option value="EXPENSE">Μόνο Έξοδα (Εντάλματα Πληρωμής)</option>
 </select>
 </CardHeader>
 <CardContent className="p-0">
 <div className="overflow-x-auto">
 <table className="w-full text-sm text-left">
 <thead className="bg-muted text-muted-foreground uppercase text-xs">
 <tr>
 <th className="px-6 py-3 font-semibold">Ημερομηνία</th>
 <th className="px-6 py-3 font-semibold">Είδος</th>
 <th className="px-6 py-3 font-semibold">Αριθμός [Γ.Ε. / Ε.Π.]</th>
 <th className="px-6 py-3 font-semibold">Κατηγορία</th>
 <th className="px-6 py-3 font-semibold">Συναλλασσόμενος</th>
 <th className="px-6 py-3 font-semibold text-right">Ποσό</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border">
 {filtered.map((t, idx) => (
 <tr key={idx} className="hover:bg-muted/50">
 <td className="px-6 py-4">{format(new Date(t.date), 'dd/MM/yyyy', { locale: el })}</td>
 <td className="px-6 py-4">
 {t.type === 'INCOME' ? (
 <Badge variant="outline"className="text-emerald-700 bg-emerald-50 border-emerald-200 tracking-tight">
 <ArrowDownRight className="w-3 h-3 mr-1"/> Έσοδο 
 </Badge>
) : (
 <Badge variant="outline"className="text-red-700 bg-red-50 border-red-200 tracking-tight">
 <ArrowUpRight className="w-3 h-3 mr-1"/> Έξοδο
 </Badge>
)}
 </td>
 <td className="px-6 py-4 text-muted-foreground font-mono">{t.receiptNumber || '-'}</td>
 <td className="px-6 py-4 font-medium">{t.categoryName} <div className="text-xs text-muted-foreground">{t.title}</div></td>
 <td className="px-6 py-4 text-muted-foreground font-semibold">{t.entity}</td>
 <td className={`px-6 py-4 text-right font-bold ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-red-600'}`}>
 {t.type === 'INCOME' ? '+' : '-'}€{t.amount.toLocaleString('el-GR', { minimumFractionDigits: 2 })}
 </td>
 </tr>
))}
 {filtered.length === 0 && (
 <tr>
 <td colSpan={6} className="text-center py-10 text-muted-foreground">Δεν υπάρχουν καταγεγραμμένες κινήσεις.</td>
 </tr>
)}
 </tbody>
 </table>
 </div>
 </CardContent>
 </Card>
 </div>
)
}

