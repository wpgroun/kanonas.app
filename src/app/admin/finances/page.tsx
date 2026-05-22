import { getLedgerTransactions, getFinanceStats, getFinancialCategories } from '@/actions/finances'
import TransactionDialog from './TransactionDialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Banknote, Wallet, PieChart, Receipt, ArrowUpRight, ArrowDownRight, BarChart3, Scale } from 'lucide-react';
import LedgerExportActions from './LedgerExportActions'
import PageHeader from '@/components/PageHeader'
import FinanceBIClient from './FinanceBIClient'
import QuarterlyWidget from './QuarterlyWidget'
import PrintReceiptBtn from './PrintReceiptBtn'
import DeleteTransactionBtn from './DeleteTransactionBtn'

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
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 
 {/* ΥΠΟΛΟΙΠΟ */}
 <Card className="shadow-xl border-0 bg-[var(--surface)] overflow-hidden relative group">
 <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--brand)]/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700"></div>
 <CardContent className="p-7 flex flex-col justify-center h-full relative z-10 border-l-4 border-[var(--brand)] rounded-l-md">
 <div className="text-xs uppercase tracking-wider font-extrabold flex items-center justify-between text-[var(--text-muted)] mb-3">
 <span className="flex items-center gap-1.5"><Scale className="w-4 h-4 text-[var(--brand)]"/> Τρεχον Υπολοιπο (Ταμειο)</span>
 <div className="p-2 bg-[var(--brand-light)] rounded-xl text-[var(--brand)]"><Scale className="w-5 h-5"/></div>
  </div>
  <div className="text-xl sm:text-2xl lg:text-3xl font-mono font-black text-[var(--foreground)] tracking-tight">
  € {currentBalance.toLocaleString('el-GR', {minimumFractionDigits: 2})}
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
  <div className="text-xl sm:text-2xl lg:text-3xl font-mono font-black text-[var(--foreground)] tracking-tight">
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
  <div className="text-xl sm:text-2xl lg:text-3xl font-mono font-black text-[var(--foreground)] tracking-tight">
  € {biStats.totalExpense.toLocaleString('el-GR', {minimumFractionDigits: 2})}
  </div>
 </CardContent>
 </Card>

 </div>

 <div className="space-y-6">
 
 {/* RECENT TRANSACTIONS (LEDGER) */}
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
 ? <span className="inline-flex px-2 py-0.5 rounded-full badge badge-success text-xs font-bold ring-1 ring-inset ring-emerald-600/20">Έσοδο</span> 
 : <span className="inline-flex px-2 py-0.5 rounded-full badge badge-danger text-xs font-bold ring-1 ring-inset ring-rose-600/20">Έξοδο</span>}
 </td>
 <td className={`px-6 py-3 text-right font-bold whitespace-nowrap font-mono ${d.type === 'INCOME' ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
 {d.type === 'INCOME' ? '+' : '-'} {d.amount.toFixed(2)} €
 </td>
 <td className="px-6 py-3">
 <div className="text-xs font-medium text-foreground">{d.donorName || d.vendor || '-'}</div>
 <div className="text-xs text-muted-foreground">{d.purpose || d.description || ''} {d.receiptNumber && `(Αρ: ${d.receiptNumber})`}</div>
 </td>
 <td className="px-6 py-3 text-center">
 <div className="flex items-center justify-center gap-1">
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
 <DeleteTransactionBtn id={d.id} type={d.type} />
 </div>
 </td>
 </tr>
))}
 </tbody>
 </table>
 </div>
 </Card>

 {/* ΑΝΑΛΥΣΗ ΚΑΤΗΓΟΡΙΩΝ (HORIZONTAL) */}
 <Card className="shadow-sm border-border/50">
 <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
 <CardTitle className="text-base flex items-center gap-2"><PieChart className="w-4 h-4"/> Ανάλυση Εσόδων ανά Κατηγορία</CardTitle>
 </CardHeader>
 <CardContent className="p-6">
 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
 {biStats.byCategory.slice(0, 5).map((c: any) => (
 <div key={c.purpose} className="bg-muted/30 hover:bg-muted/50 transition-colors p-4 rounded-xl border border-border/50 flex flex-col justify-between">
 <div className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-2">{c.purpose}</div>
 <div className="text-lg font-black font-mono text-[var(--success)]">€ {c.total.toFixed(2)}</div>
 </div>
))}
 {biStats.byCategory.length === 0 && (
 <div className="col-span-full py-6 text-center text-muted-foreground text-sm">Καμία κίνηση.</div>
)}
 </div>
 </CardContent>
 </Card>

 {/* BUSINESS INTELLIGENCE SECTION */}
 <div className="border-t border-border/50 pt-8 hidden sm:block">
 <h2 className="text-xl font-bold tracking-tight flex items-center gap-2 mb-6 text-foreground">
 <BarChart3 className="w-5 h-5 text-[var(--brand)]"/>
 Επισκόπηση Business Intelligence
 </h2>
 <FinanceBIClient {...biStats} />
 </div>
</div>
</div>
 );
}
