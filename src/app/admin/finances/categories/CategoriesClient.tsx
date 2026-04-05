'use client'

import { useState } from 'react'
import { addFinancialCategory, deleteFinancialCategory } from '@/actions/finances'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash2, ArrowUpRight, ArrowDownRight, FolderTree } from 'lucide-react'

export default function CategoriesClient({ initialCategories }: { initialCategories: any[] }) {
 const [loading, setLoading] = useState(false);
 
 // New Category State
 const [name, setName] = useState('');
 const [type, setType] = useState('INCOME'); // INCOME or EXPENSE

 const incomes = initialCategories.filter(c => c.type === 'INCOME');
 const expenses = initialCategories.filter(c => c.type === 'EXPENSE');

 const handleCreate = async (e: any) => {
 e.preventDefault();
 setLoading(true);
 const res = await addFinancialCategory({ name, type });
 setLoading(false);
 if(res.success) {
 window.location.reload();
 } else {
 alert(res.error ||"Σφάλμα δημιουργίας.");
 }
 };

 const handleDelete = async (id: string, name: string) => {
 if(!confirm(`Μόνιμη διαγραφή της Κατηγορίας"${name}"; Αν υπάρχουν εγγραφές, δεν θα επιτραπεί.`)) return;
 setLoading(true);
 const res = await deleteFinancialCategory(id);
 setLoading(false);
 if(res.success) window.location.reload();
 else alert(res.error ||"Σφάλμα");
 };

 return (
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">
 
 {/* FORM */}
 <div className="col-span-1 lg:col-span-4">
 <Card className="shadow-lg border-primary/20 sticky top-6">
 <CardHeader className="bg-muted/30 pb-4 border-b border-border/50">
 <CardTitle className="text-lg flex items-center gap-2">
 <FolderTree className="w-5 h-5 text-primary"/> Νέα Κατηγορία
 </CardTitle>
 </CardHeader>
 <CardContent className="pt-5 space-y-4">
 <form onSubmit={handleCreate} className="space-y-4">
 <div className="space-y-2">
 <Label>Ονομασία (Αιτιολογία)</Label>
 <Input required value={name} onChange={e=>setName(e.target.value)} placeholder="π.χ. ΔΕΚΟ, Παγκάρι, Δωρεές"/>
 </div>
 
 <div className="space-y-2">
 <Label>Τύπος Λογαριασμού</Label>
 <div className="flex bg-muted p-1 rounded-lg">
 <button 
 type="button"
 onClick={() => setType('INCOME')} 
 className={`flex-1 py-2 text-sm font-bold flex items-center justify-center gap-1.5 transition-all rounded-md ${type === 'INCOME' ? 'bg-emerald-100 text-emerald-700 shadow-sm border border-emerald-200' : 'text-muted-foreground'}`}
 >
 <ArrowUpRight className="w-4 h-4"/> ΕΣΟΔΟ
 </button>
 <button 
 type="button"
 onClick={() => setType('EXPENSE')} 
 className={`flex-1 py-2 text-sm font-bold flex items-center justify-center gap-1.5 transition-all rounded-md ${type === 'EXPENSE' ? 'bg-rose-100 text-rose-700 shadow-sm border border-rose-200' : 'text-muted-foreground'}`}
 >
 <ArrowDownRight className="w-4 h-4"/> ΕΞΟΔΟ
 </button>
 </div>
 </div>

 <Button type="submit"disabled={loading} className="w-full mt-2">
 <Plus className="w-4 h-4 mr-2"/> Αποθήκευση
 </Button>
 </form>
 </CardContent>
 </Card>
 </div>

 {/* LISTS */}
 <div className="col-span-1 lg:col-span-8 flex flex-col gap-6">
 
 <div className="bg-emerald-50 rounded-xl border border-emerald-100 overflow-hidden">
 <h3 className="flex items-center gap-2 p-3 px-4 bg-emerald-100/50 text-emerald-800 font-bold border-b border-emerald-100">
 <ArrowUpRight className="w-5 h-5"/> Κατηγορίες Εσόδων ({incomes.length})
 </h3>
 <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
 {incomes.map(c => (
 <div key={c.id} className="flex items-center justify-between bg-background p-3 rounded-md border border-border shadow-sm">
 <span className="font-medium text-sm">{c.name}</span>
 <Button variant="ghost"size="icon"onClick={()=>handleDelete(c.id, c.name)} className="h-8 w-8 text-destructive hover:bg-destructive/10"><Trash2 className="w-4 h-4"/></Button>
 </div>
))}
 {incomes.length === 0 && <div className="text-sm text-muted-foreground col-span-2">Δεν υπάρχουν κατηγορίες.</div>}
 </div>
 </div>

 <div className="bg-rose-50 rounded-xl border border-rose-100 overflow-hidden">
 <h3 className="flex items-center gap-2 p-3 px-4 bg-rose-100/50 text-rose-800 font-bold border-b border-rose-100">
 <ArrowDownRight className="w-5 h-5"/> Κατηγορίες Εξόδων ({expenses.length})
 </h3>
 <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
 {expenses.map(c => (
 <div key={c.id} className="flex items-center justify-between bg-background p-3 rounded-md border border-border shadow-sm">
 <span className="font-medium text-sm">{c.name}</span>
 <Button variant="ghost"size="icon"onClick={()=>handleDelete(c.id, c.name)} className="h-8 w-8 text-destructive hover:bg-destructive/10"><Trash2 className="w-4 h-4"/></Button>
 </div>
))}
 {expenses.length === 0 && <div className="text-sm text-muted-foreground col-span-2">Δεν υπάρχουν κατηγορίες.</div>}
 </div>
 </div>

 </div>

 </div>
)
}
