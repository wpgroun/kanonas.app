'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, CartesianGrid, LineChart, Line } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { TrendingUp, TrendingDown, Minus, Download, BarChart3, PieChart as PieIcon, Wallet, Banknote } from 'lucide-react'

const COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#14b8a6','#f97316','#3b82f6']
const MONTH_NAMES_SHORT = ['Ιαν','Φεβ','Μαρ','Απρ','Μαΐ','Ιουν','Ιουλ','Αυγ','Σεπ','Οκτ','Νοε','Δεκ']

interface MonthlyData {
 month: number;
 monthName: string;
 incomeTotal: number;
 expenseTotal: number;
}

interface CategoryData {
 purpose: string;
 total: number;
}

interface FinanceBIProps {
 currentYearData: MonthlyData[];
 prevYearData: MonthlyData[];
 byCategory: CategoryData[];
 byExpenseCategory: CategoryData[];
 totalCurrentYear: number;
 totalPrevYear: number;
 totalExpenseCurrentYear: number;
 totalExpensePrevYear: number;
 year: number;
}

const EuroTooltipFormatter = (value: any) =>
 [`€${Number(value).toLocaleString('el-GR', { minimumFractionDigits: 2 })}`, 'Ποσό'];

export default function FinanceBIClient({ currentYearData, prevYearData, byCategory, byExpenseCategory, totalCurrentYear, totalPrevYear, totalExpenseCurrentYear, totalExpensePrevYear, year }: FinanceBIProps) {
 const [tab, setTab] = useState<'INCOMES'|'EXPENSES'>('INCOMES');

 // KPI Calcs
 const isIncome = tab === 'INCOMES';
 const currentTotal = isIncome ? totalCurrentYear : totalExpenseCurrentYear;
 const prevTotal = isIncome ? totalPrevYear : totalExpensePrevYear;
 
 const diff = currentTotal - prevTotal;
 const pct = prevTotal > 0 ? ((diff / prevTotal) * 100).toFixed(1) : '—';
 
 // Diff semantic: For income, up is good. For expense, up is bad (visually). We'll keep it simple: just show + or -
 const isPositiveTrend = diff > 0;

 // Comparison Data array
 const comparisonData = MONTH_NAMES_SHORT.map((name, i) => {
 const currMonth = currentYearData.find(m => m.month === i + 1);
 const prevMonth = prevYearData.find(m => m.month === i + 1);
 return {
 name,
 [year]: isIncome ? (currMonth?.incomeTotal || 0) : (currMonth?.expenseTotal || 0),
 [year - 1]: isIncome ? (prevMonth?.incomeTotal || 0) : (prevMonth?.expenseTotal || 0),
 };
 });

 const catRaw = isIncome ? byCategory : byExpenseCategory;
 const categoryData = catRaw
 .filter(c => c.total > 0)
 .sort((a, b) => b.total - a.total)
 .slice(0, 8);

 const activeColor = isIncome ? '#10b981' : '#ef4444'; // Emerald for Income, Red for Expense

 return (
 <div className="space-y-6 animate-in fade-in duration-500">
 
 {/* Scope Toggles */}
 <div className="flex bg-slate-100 p-1.5 rounded-xl w-max">
 <button onClick={() => setTab('INCOMES')} className={`px-5 py-2.5 rounded-lg text-sm font-black tracking-wider uppercase transition-all ${tab === 'INCOMES' ? 'bg-[var(--surface)] shadow-sm text-[var(--success)]' : 'text-[var(--text-muted)] hover:text-slate-700'}`}>
 <Banknote className="w-4 h-4 inline-block mr-2"/> Έσοδα
 </button>
 <button onClick={() => setTab('EXPENSES')} className={`px-5 py-2.5 rounded-lg text-sm font-black tracking-wider uppercase transition-all ${tab === 'EXPENSES' ? 'bg-[var(--surface)] shadow-sm text-[var(--danger)]' : 'text-[var(--text-muted)] hover:text-slate-700'}`}>
 <Wallet className="w-4 h-4 inline-block mr-2"/> Έξοδα (Δαπάνες)
 </button>
 </div>

 {/* KPI Row */}
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 <Card className="shadow-sm border-border/50">
 <CardContent className="p-5">
 <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Σύνολο {year}</p>
 <p className="text-3xl font-black text-foreground mt-1 tracking-tight">
 €{currentTotal.toLocaleString('el-GR', { minimumFractionDigits: 2 })}
 </p>
 <div className={`flex items-center gap-1 mt-2 text-xs font-bold uppercase tracking-wider ${isPositiveTrend ? (isIncome?'text-[var(--success)]':'text-[var(--danger)]') : (!isPositiveTrend && diff !== 0 ? (isIncome?'text-[var(--danger)]':'text-[var(--success)]') : 'text-muted-foreground')}`}>
 {isPositiveTrend ? <TrendingUp className="w-4 h-4"/> : diff < 0 ? <TrendingDown className="w-4 h-4"/> : <Minus className="w-4 h-4"/>}
 {pct !== '—' ? `${pct}% από ${year - 1}` : 'Μη διαθέσιμο'}
 </div>
 </CardContent>
 </Card>
 <Card className="shadow-sm border-border/50">
 <CardContent className="p-5">
 <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Σύνολο {year - 1}</p>
 <p className="text-3xl font-black text-muted-foreground mt-1 tracking-tight">
 €{prevTotal.toLocaleString('el-GR', { minimumFractionDigits: 2 })}
 </p>
 </CardContent>
 </Card>
 <Card className="shadow-sm border-border/50">
 <CardContent className="p-5">
 <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Μέσος Όρος / Μήνα ({year})</p>
 <p className="text-3xl font-black text-foreground mt-1 tracking-tight">
 €{currentTotal > 0 ? (currentTotal / Math.max(currentYearData.filter((m:any) => isIncome ? m.incomeTotal > 0 : m.expenseTotal > 0).length, 1)).toLocaleString('el-GR', { minimumFractionDigits: 2 }) : '0,00'}
 </p>
 </CardContent>
 </Card>
 </div>

 {/* Line chart: monthly comparison Trend */}
 <Card className="shadow-sm border-border/50">
 <CardHeader className="border-b border-border/40 pb-4 flex-row items-center justify-between">
 <div>
 <CardTitle className="flex items-center gap-2 text-base">
 <BarChart3 className="w-4 h-4 text-primary"/>
 Trend {isIncome ? 'Εσόδων' : 'Δαπανών'} (Σύγκριση Ετών)
 </CardTitle>
 <CardDescription className="text-xs mt-1">Ανάπτυξη {year - 1} vs {year}</CardDescription>
 </div>
 <Button variant="outline"size="sm"className="gap-1 text-xs">
 <Download className="w-3 h-3"/> Report
 </Button>
 </CardHeader>
 <CardContent className="pt-6 pb-2">
 <ResponsiveContainer width="100%"height={280}>
 <LineChart data={comparisonData} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
 <CartesianGrid strokeDasharray="3 3"stroke="rgba(0,0,0,0.06)"/>
 <XAxis dataKey="name"tick={{ fontSize: 11 }} />
 <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `€${(v/1000).toFixed(0)}k`} />
 <Tooltip formatter={EuroTooltipFormatter} />
 <Legend />
 <Line type="monotone"dataKey={year - 1} stroke="#94a3b8"strokeWidth={3} strokeDasharray="5 5"name={`Προηγ. Έτος (${year - 1})`} dot={false} />
 <Line type="monotone"dataKey={year} stroke={activeColor} strokeWidth={4} name={`Τρέχον Έτος (${year})`} />
 </LineChart>
 </ResponsiveContainer>
 </CardContent>
 </Card>

 {/* Pie chart: by category */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
 <Card className="shadow-sm border-border/50">
 <CardHeader className="border-b border-border/40 pb-4">
 <CardTitle className="flex items-center gap-2 text-base">
 <PieIcon className="w-4 h-4 text-primary"/>
 Κατανομή ανά Κατηγορία ({year})
 </CardTitle>
 </CardHeader>
 <CardContent className="pt-6">
 {categoryData.length > 0 ? (
 <ResponsiveContainer width="100%"height={260}>
 <PieChart>
 <Pie
 data={categoryData}
 dataKey="total"
 nameKey="purpose"
 cx="50%"
 cy="50%"
 outerRadius={95}
 innerRadius={50}
 label={(props: any) => `${String(props.name || 'Άλλο').slice(0, 15)}`}
 labelLine={true}
 paddingAngle={3}
 >
 {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
 </Pie>
 <Tooltip formatter={(v: any) => `€${Number(v).toLocaleString('el-GR', { minimumFractionDigits: 2 })}`} />
 </PieChart>
 </ResponsiveContainer>
) : (
 <div className="h-[260px] flex items-center justify-center text-muted-foreground text-sm">
 Δεν υπάρχουν δεδομένα για το επιλεγμένο έτος
 </div>
)}
 </CardContent>
 </Card>

 {/* Top categories table */}
 <Card className="shadow-sm border-border/50">
 <CardHeader className="border-b border-border/40 pb-4">
 <CardTitle className="text-base">Top 8 Πηγές {isIncome?'Εσόδων':'Εξόδων'} ({year})</CardTitle>
 </CardHeader>
 <CardContent className="pt-4">
 <div className="space-y-4">
 {categoryData.length === 0 && (
 <p className="text-muted-foreground text-sm text-center py-8">Αδυναμία εξαγωγής στατιστικών</p>
)}
 {categoryData.map((c, i) => {
 const pct = currentTotal > 0 ? ((c.total / currentTotal) * 100) : 0;
 return (
 <div key={i} className="space-y-1.5">
 <div className="flex justify-between text-sm">
 <span className="font-bold text-slate-700">{c.purpose || 'Αδιευκρίνιστο'} <span className="font-mono text-xs text-[var(--text-muted)] ml-1">({pct.toFixed(0)}%)</span></span>
 <span className="text-muted-foreground font-black">€{c.total.toLocaleString('el-GR', { minimumFractionDigits: 2 })}</span>
 </div>
 <div className="w-full bg-slate-100 rounded-full h-2">
 <div
 className="h-2 rounded-full transition-all"
 style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }}
 />
 </div>
 </div>
);
 })}
 </div>
 </CardContent>
 </Card>
 </div>
 </div>
);
}

