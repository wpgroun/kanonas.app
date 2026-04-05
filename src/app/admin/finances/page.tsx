import { getLedgerTransactions, getFinanceStats, getFinancialCategories } from '@/actions/finances'
import TransactionDialog from './TransactionDialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Banknote, Wallet, PieChart, Receipt, ArrowUpRight, ArrowDownRight, BarChart3, Scale } from 'lucide-react';
import FinanceBIClient from './FinanceBIClient'
import QuarterlyWidget from './QuarterlyWidget'

export default async function FinancesPage() {
  const ledger = await getLedgerTransactions();
  const categories = await getFinancialCategories();
  const biStats = await getFinanceStats();

  const currentBalance = biStats.totalIncome - biStats.totalExpense;

  return (
    <div className="container-fluid mt-6 space-y-6 animate-in fade-in duration-500">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Οικονομικά & Ταμείο
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Γενικό Λογιστικό Βιβλίο Εσόδων - Εξόδων.
          </p>
        </div>
        <TransactionDialog categories={categories} />
      </div>

      {/* DASHBOARD STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* ΥΠΟΛΟΙΠΟ */}
        <Card className="shadow-lg border-primary/20 bg-gradient-to-br from-indigo-700 to-blue-900 text-white border-0">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-blue-100 font-medium mb-1">Τρέχον Υπόλοιπο (Ταμείο)</p>
                <h3 className="text-3xl font-bold font-mono">€ {currentBalance.toLocaleString('el-GR', {minimumFractionDigits: 2})}</h3>
              </div>
              <div className="p-3 bg-white/20 rounded-full shadow-inner">
                <Scale className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg border-emerald-500/20 lg:col-span-1 bg-emerald-50 dark:bg-emerald-950/20">
          <CardContent className="p-6 flex flex-col justify-center h-full">
            <div className="text-sm font-bold flex items-center justify-between text-emerald-700 dark:text-emerald-400 mb-1">
               <span className="flex items-center gap-1.5"><ArrowUpRight className="w-4 h-4"/> Συνολικά Έσοδα</span>
               <Banknote className="w-4 h-4" />
            </div>
            <div className="text-2xl font-mono relative font-bold text-emerald-800 dark:text-emerald-300">
               € {biStats.totalIncome.toLocaleString('el-GR', {minimumFractionDigits: 2})}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-rose-500/20 lg:col-span-1 bg-rose-50 dark:bg-rose-950/20">
          <CardContent className="p-6 flex flex-col justify-center h-full">
            <div className="text-sm font-bold flex items-center justify-between text-rose-700 dark:text-rose-400 mb-1">
               <span className="flex items-center gap-1.5"><ArrowDownRight className="w-4 h-4"/> Συνολικά Έξοδα</span>
               <Wallet className="w-4 h-4" />
            </div>
            <div className="text-2xl font-mono relative font-bold text-rose-800 dark:text-rose-300">
               € {biStats.totalExpense.toLocaleString('el-GR', {minimumFractionDigits: 2})}
            </div>
          </CardContent>
        </Card>

      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* RECENT TRANSACTIONS (LEDGER) */}
        <div className="col-span-1 xl:col-span-3 space-y-6">
          <QuarterlyWidget />

          <Card className="shadow-sm border-border/50">
            <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
               <CardTitle className="text-base flex items-center gap-2"><Receipt className="w-4 h-4" /> Γενικό Λογιστικό (Κινήσεις)</CardTitle>
            </CardHeader>
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border sticky top-0 z-10 backdrop-blur-md">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Ημερομηνία</th>
                    <th className="px-6 py-3 font-semibold">Κατηγορια / Fund</th>
                    <th className="px-6 py-3 font-semibold text-center">Τυπος</th>
                    <th className="px-6 py-3 font-semibold text-right">Ποσό</th>
                    <th className="px-6 py-3 font-semibold">Αιτιολογια & Πηγη</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {ledger.length === 0 && (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Δεν υπάρχουν λογιστικές κινήσεις.</td></tr>
                  )}
                  {ledger.map((d: any) => (
                    <tr key={d.id} className="bg-card hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-3 text-muted-foreground whitespace-nowrap">
                        {new Date(d.date).toLocaleDateString('el-GR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-3 font-medium">
                         {d.category?.name || 'Ακατηγοριοποίητο'}
                      </td>
                      <td className="px-6 py-3 text-center">
                         {d.type === 'INCOME' 
                           ? <span className="inline-flex px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold ring-1 ring-inset ring-emerald-600/20">Έσοδο</span> 
                           : <span className="inline-flex px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-xs font-bold ring-1 ring-inset ring-rose-600/20">Έξοδο</span>}
                      </td>
                      <td className={`px-6 py-3 text-right font-bold whitespace-nowrap font-mono ${d.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {d.type === 'INCOME' ? '+' : '-'} {d.amount.toFixed(2)} €
                      </td>
                      <td className="px-6 py-3">
                         <div className="text-xs font-medium text-foreground">{d.donorName || d.vendor || '-'}</div>
                         <div className="text-xs text-muted-foreground">{d.purpose || d.description || ''} {d.receiptNumber && `(Αρ: ${d.receiptNumber})`}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* ΑΝΑΛΥΣΗ ΚΑΤΗΓΟΡΙΩΝ */}
        <div className="col-span-1">
          <Card className="shadow-sm border-border/50 h-full overflow-hidden flex flex-col">
            <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
              <CardTitle className="text-base flex items-center gap-2"><PieChart className="w-4 h-4" /> Ανάλυση Εσόδων</CardTitle>
            </CardHeader>
            <CardContent className="px-0 py-2 flex-grow overflow-y-auto">
              <div className="divide-y divide-border/50">
                {biStats.byCategory.slice(0, 5).map((c: any) => (
                  <div key={c.purpose} className="flex justify-between items-center py-3 px-5 hover:bg-muted/30 transition-colors">
                     <span className="text-sm font-medium">{c.purpose}</span>
                     <strong className="text-sm font-mono text-emerald-600">€ {c.total.toFixed(2)}</strong>
                  </div>
                ))}
                {biStats.byCategory.length === 0 && (
                  <div className="py-6 text-center text-muted-foreground text-sm">Καμία κίνηση.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>

      {/* Separator / BI */}
      <div className="border-t border-border/50 pt-8 hidden sm:block">
        <h2 className="text-xl font-bold tracking-tight flex items-center gap-2 mb-6 text-foreground">
          <BarChart3 className="w-5 h-5 text-primary" />
          Επισκόπηση Business Intelligence
        </h2>
        <FinanceBIClient
          currentYear={biStats.currentYearData}
          prevYear={biStats.prevYearData}
          byCategory={biStats.byCategory}
          totalCurrentYear={biStats.totalCurrentYear}
          totalPrevYear={biStats.totalPrevYear}
          year={biStats.year}
        />
      </div>

    </div>
  )
}
