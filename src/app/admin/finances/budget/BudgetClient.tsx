'use client'

import { useState } from 'react'
import { saveBudget } from '@/actions/finances'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChevronLeft, ChevronRight, Save, ReceiptText, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function BudgetClient({ year, initialBudgets, categories }: { year: number, initialBudgets: any[], categories: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  // Local state map for input values (CategoryId -> Amount)
  const [values, setValues] = useState<Record<string, string>>(() => {
     const init: Record<string, string> = {};
     categories.forEach(c => {
       const existing = initialBudgets.find(b => b.categoryId === c.id);
       init[c.id] = existing ? String(existing.estimatedAmt) : '';
     });
     return init;
  });

  const handleSaveRow = async (category: any) => {
    const valObj = values[category.id];
    if (valObj === '' || valObj === undefined) return;
    const estimatedAmt = parseFloat(valObj);
    if (isNaN(estimatedAmt)) return;

    setLoading(category.id);
    const existing = initialBudgets.find(b => b.categoryId === category.id);
    const oldAmt = existing ? existing.estimatedAmt : 0;

    const res = await saveBudget(category.id, year, estimatedAmt, oldAmt);
    if (!res.success) {
      alert(res.error);
    } else {
      router.refresh();
    }
    setLoading(null);
  };

  const changeYear = (delta: number) => {
    router.push(`/admin/finances/budget?year=${year + delta}`);
  };

  // Grouping
  const incomes = categories.filter(c => c.type === 'INCOME');
  const expenses = categories.filter(c => c.type === 'EXPENSE');

  const calcTotalEstimated = (type: string) => {
    return categories.filter(c => c.type === type).reduce((acc, c) => {
      const b = initialBudgets.find(x => x.categoryId === c.id);
      return acc + (b ? b.estimatedAmt : 0);
    }, 0);
  };

  const calcTotalActual = (type: string) => {
    return categories.filter(c => c.type === type).reduce((acc, c) => {
      const b = initialBudgets.find(x => x.categoryId === c.id);
      return acc + (b ? b.actualAmt : 0);
    }, 0);
  };

  const renderTable = (catList: any[], type: string) => (
     <div className="overflow-x-auto rounded-lg border border-border mt-3">
        <table className="w-full text-sm text-left">
           <thead className={`text-xs uppercase ${type === 'INCOME' ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-400'}`}>
              <tr>
                 <th className="px-4 py-3 font-bold w-1/3">Κατηγορια ({type === 'INCOME' ? 'Εσοδα' : 'Εξοδα'})</th>
                 <th className="px-4 py-3 font-bold w-1/4">Στοχος (Προϋπολογισθέντα)</th>
                 <th className="px-4 py-3 font-bold w-1/4">Πραγματοποιηθέντα</th>
                 <th className="px-4 py-3 font-bold text-center">Κατασταση</th>
              </tr>
           </thead>
           <tbody className="divide-y divide-border bg-background">
              {catList.map(c => {
                 const currentBudget = initialBudgets.find(b => b.categoryId === c.id);
                 const hasChanged = Number(values[c.id] || 0) !== (currentBudget?.estimatedAmt || 0);

                 return (
                   <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium">{c.name}</td>
                      <td className="px-4 py-3">
                         <div className="flex items-center gap-2">
                           <span className="text-muted-foreground">€</span>
                           <Input 
                             type="number" 
                             className={`h-8 w-28 text-right font-mono ${hasChanged ? 'border-primary ring-1 ring-primary' : ''}`}
                             value={values[c.id]} 
                             onChange={(e) => setValues({...values, [c.id]: e.target.value})}
                           />
                           {hasChanged && (
                             <Button size="sm" variant="default" className="h-8 shadow-sm" onClick={() => handleSaveRow(c)} disabled={loading === c.id}>
                               {loading === c.id ? '...' : <Save className="w-3.5 h-3.5"/>}
                             </Button>
                           )}
                         </div>
                      </td>
                      <td className="px-4 py-3 font-mono font-medium">
                         € {(currentBudget?.actualAmt || 0).toLocaleString('el-GR', {minimumFractionDigits: 2})}
                      </td>
                      <td className="px-4 py-3 text-center">
                         {currentBudget && currentBudget.estimatedAmt > 0 ? (
                           <div className="w-full bg-muted rounded-full h-1.5 mt-1.5 overflow-hidden">
                              <div 
                                className={`h-1.5 rounded-full ${type === 'INCOME' ? 'bg-emerald-500' : 'bg-rose-500'}`} 
                                style={{ width: `${Math.min((currentBudget.actualAmt / currentBudget.estimatedAmt) * 100, 100)}%` }}
                              ></div>
                           </div>
                         ) : <span className="text-xs text-muted-foreground">Μη διαθέσιμο</span>}
                      </td>
                   </tr>
                 )
              })}
              {catList.length === 0 && (
                 <tr><td colSpan={4} className="text-center py-4 text-muted-foreground">Δεν υπάρχουν κατηγορίες.</td></tr>
              )}
           </tbody>
           <tfoot className="bg-muted/50 font-bold border-t border-border">
              <tr>
                 <td className="px-4 py-3">ΣΥΝΟΛΟ</td>
                 <td className="px-4 py-3 font-mono">€ {calcTotalEstimated(type).toLocaleString('el-GR', {minimumFractionDigits: 2})}</td>
                 <td className="px-4 py-3 font-mono text-primary">€ {calcTotalActual(type).toLocaleString('el-GR', {minimumFractionDigits: 2})}</td>
                 <td></td>
              </tr>
           </tfoot>
        </table>
     </div>
  )

  return (
    <div className="space-y-6 mt-4">
       
       {/* Toolbar */}
       <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 bg-background border border-border rounded-lg p-1 shadow-sm">
             <Button variant="ghost" size="icon" onClick={() => changeYear(-1)}><ChevronLeft className="w-4 h-4"/></Button>
             <span className="font-bold w-16 text-center">{year}</span>
             <Button variant="ghost" size="icon" onClick={() => changeYear(1)}><ChevronRight className="w-4 h-4"/></Button>
          </div>
          <Button 
            variant="outline" 
            className="gap-2 text-primary border-primary/50 hover:bg-primary/10"
            onClick={async () => {
              if(!confirm(`Είστε σίγουροι ότι θέλετε να ΣΦΡΑΓΙΣΕΤΕ το οικονομικό έτος ${year}; Αυτό το βήμα είναι μη - αναστρέψιμο!`)) return;
              const { sealFinancialYear } = await import('@/actions/finances');
              const res = await sealFinancialYear(year);
              if (res.success) alert(`Το ${year} σφραγίστηκε με επιτυχία!`);
              else alert(res.error);
            }}
          >
             <ReceiptText className="w-4 h-4" /> Σφράγισμα Έτους
          </Button>
       </div>

       {/* INCOMES */}
       <div className="space-y-2">
         <h2 className="text-lg font-bold flex items-center gap-2 mt-6">
            <ArrowUpRight className="w-5 h-5 text-emerald-500" /> Προϋπολογισμός Εσόδων
         </h2>
         {renderTable(incomes, 'INCOME')}
       </div>

       {/* EXPENSES */}
       <div className="space-y-2">
         <h2 className="text-lg font-bold flex items-center gap-2 mt-8">
            <ArrowDownRight className="w-5 h-5 text-rose-500" /> Προϋπολογισμός Εξόδων
         </h2>
         {renderTable(expenses, 'EXPENSE')}
       </div>

    </div>
  )
}
