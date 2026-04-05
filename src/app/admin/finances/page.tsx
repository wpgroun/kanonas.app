import { getLedgerTransactions, getFinanceStats, getFinancialCategories } from '@/actions/finances'
import TransactionDialog from './TransactionDialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Banknote, Wallet, PieChart, Receipt, ArrowUpRight, ArrowDownRight, BarChart3, Scale } from 'lucide-react';
import LedgerExportActions from './LedgerExportActions'
import PageHeader from '@/components/PageHeader'
import FinanceBIClient from './FinanceBIClient'
import QuarterlyWidget from './QuarterlyWidget'
import PrintReceiptBtn from './PrintReceiptBtn'

export default async function FinancesPage() {
 const ledger = await getLedgerTransactions();
 const categories = await getFinancialCategories();
 const biStats = await getFinanceStats();

 const currentBalance = biStats.totalIncome - biStats.totalExpense;

 return (
 <div className="container-fluid mt-6 space-y-6 animate-in fade-in duration-500">
 
 <PageHeader 
 title="Οικονομικά & Ταμείο"
 description="Γενικό Λογιστικό Βιβλίο Εσόδων - Εξόδων."
 actions={
      <div className="flex items-center gap-3">
        <LedgerExportActions />
        <TransactionDialog categories={categories} />
      </div>
    }
 />

 {/* DASHBOARD STATS */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 
 {/* ΥΠΟΛΟΙΠΟ */}
 <Card className="shadow-2xl border-0 overflow-hidden relative group">
 <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-blue-700 to-indigo-900 group-hover:scale-105 transition-transform duration-700"></div>
 <CardContent className="p-7 relative z-10">
 <div className="flex justify-between items-start">
 <div>
 <p className="text-blue-100 font-bold tracking-wider text-xs uppercase mb-2">Τρέχον Υπόλοιπο (Ταμείο)</p>
 <h3 className="text-4xl font-black font-mono text-white tracking-tight">€ {currentBalance.toLocaleString('el-GR', {minimumFractionDigits: 2})}</h3>
 </div>
 <div className="p-4 bg-[var(--surface)]/10 backdrop-blur-md rounded-2xl shadow-inner border border-white/20">
 <Scale className="w-8 h-8 text-white"/>
 </div>
 </div>
 {/* Minimal line chart decoration */}
 <div className="mt-6 flex items-end gap-1.5 opacity-40">
 {[40, 70, 45, 90, 65, 100, 80].map((h, i) => (
 <div key={i} className="w-full bg-[var(--surface)] rounded-t-sm"style={{height: `${h/4}px`}}></div>
))}
 </div>
 </CardContent>
 </Card>
 
 {/* ΣΥΝΟΛΙΚΑ ΕΣΟΔΑ */}
 <Card className="shadow-xl border-0 bg-[var(--surface)] overflow-hidden relative group">
 <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700"></div>
 <CardContent className="p-7 flex flex-col justify-center h-full relative z-10 border-l-4 border-emerald-500 rounded-l-md">
 <div className="text-xs uppercase tracking-wider font-extrabold flex items-center justify-between text-[var(--text-muted)] mb-3">
 <span className="flex items-center gap-1.5"><ArrowUpRight className="w-4 h-4 text-emerald-500"/> ΣΥΝΟΛΙΚΑ ΕΣΟΔΑ</span>
 <div className="p-2 bg-[var(--success-light)] rounded-xl text-emerald-500"><Banknote className="w-5 h-5"/></div>
 </div>
 <div className="text-3xl font-mono font-black text-[var(--foreground)] tracking-tight">
 € {biStats.totalIncome.toLocaleString('el-GR', {minimumFractionDigits: 2})}
 </div>
 </CardContent>
 </Card>

 {/* ΣΥΝΟΛΙΚΑ ΕΞΟΔΑ */}
 <Card className="shadow-xl border-0 bg-[var(--surface)] overflow-hidden relative group">
 <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700"></div>
 <CardContent className="p-7 flex flex-col justify-center h-full relative z-10 border-l-4 border-rose-500 rounded-l-md">
 <div className="text-xs uppercase tracking-wider font-extrabold flex items-center justify-between text-[var(--text-muted)] mb-3">
 <span className="flex items-center gap-1.5"><ArrowDownRight className="w-4 h-4 text-[var(--danger)]"/> ΣΥΝΟΛΙΚΑ ΕΞΟΔΑ</span>
 <div className="p-2 bg-[var(--danger-light)] rounded-xl text-[var(--danger)]"><Wallet className="w-5 h-5"/></div>
 </div>
 <div className="text-3xl font-mono font-black text-[var(--foreground)] tracking-tight">
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
 <CardTitle className="text-base flex items-center gap-2"><Receipt className="w-4 h-4"/> Γενικό Λογιστικό (Κινήσεις)</CardTitle>
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
 <th className="px-6 py-3 font-semibold text-center w-16">Ενέργειες</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border/50">
 {ledger.length === 0 && (
 <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">Δεν υπάρχουν λογιστικές κινήσεις.</td></tr>
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
 ? <span className="inline-flex px-2 py-0.5 rounded-full bg-[var(--success-light)] text-[var(--success)] text-xs font-bold ring-1 ring-inset ring-emerald-600/20">Έσοδο</span> 
 : <span className="inline-flex px-2 py-0.5 rounded-full bg-[var(--danger-light)] text-[var(--danger)] text-xs font-bold ring-1 ring-inset ring-rose-600/20">Έξοδο</span>}
 </td>
 <td className={`px-6 py-3 text-right font-bold whitespace-nowrap font-mono ${d.type === 'INCOME' ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
 {d.type === 'INCOME' ? '+' : '-'} {d.amount.toFixed(2)} €
 </td>
 <td className="px-6 py-3">
 <div className="text-xs font-medium text-foreground">{d.donorName || d.vendor || '-'}</div>
 <div className="text-xs text-muted-foreground">{d.purpose || d.description || ''} {d.receiptNumber && `(Αρ: ${d.receiptNumber})`}</div>
 </td>
 <td className="px-6 py-3 text-center">
 <PrintReceiptBtn tx={{ 
 id: d.id, 
 type: d.type, 
 date: d.date, 
 amount: d.amount, 
 category: d.category?.name, 
 purpose: d.purpose || d.description, 
 personName: d.donorName || d.vendor,
 receiptNumber: d.receiptNumber
 }} />
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
 <CardTitle className="text-base flex items-center gap-2"><PieChart className="w-4 h-4"/> Ανάλυση Εσόδων</CardTitle>
 </CardHeader>
 <CardContent className="px-0 py-2 flex-grow overflow-y-auto">
 <div className="divide-y divide-border/50">
 {biStats.byCategory.slice(0, 5).map((c: any) => (
 <div key={c.purpose} className="flex justify-between items-center py-3 px-5 hover:bg-muted/30 transition-colors">
 <span className="text-sm font-medium">{c.purpose}</span>
 <strong className="text-sm font-mono text-[var(--success)]">€ {c.total.toFixed(2)}</strong>
 </div>
))}
 {biStats.byCategory.length === 0 && (
 <div className="py-6 text-center text-muted-foreground text-sm">Καμία κίνηση.</div>
)}
 </div>
 </CardContent>
 </Card>
  {/* Separator / BI */}
  <div className="border-t border-border/50 pt-8 hidden sm:block">
    <h2 className="text-xl font-bold tracking-tight flex items-center gap-2 mb-6 text-foreground">
      <BarChart3 className="w-5 h-5 text-primary"/>
      Επισκόπηση Business Intelligence
    </h2>
    <FinanceBIClient {...biStats} />
  </div>
</div>
</div>
</div>
  );
}
