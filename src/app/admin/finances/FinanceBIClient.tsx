'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, CartesianGrid } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState } from 'react'
import { TrendingUp, TrendingDown, Minus, Download, BarChart3, PieChart as PieIcon } from 'lucide-react'

const COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#14b8a6','#f97316','#3b82f6']
const MONTH_NAMES_SHORT = ['Ιαν','Φεβ','Μαρ','Απρ','Μαΐ','Ιουν','Ιουλ','Αυγ','Σεπ','Οκτ','Νοε','Δεκ']

interface MonthlyData {
  month: number;
  monthName: string;
  total: number;
  count: number;
}

interface CategoryData {
  purpose: string;
  total: number;
}

interface FinanceBIProps {
  currentYear: MonthlyData[];
  prevYear: MonthlyData[];
  byCategory: CategoryData[];
  totalCurrentYear: number;
  totalPrevYear: number;
  year: number;
}

const EuroTooltipFormatter = (value: any) =>
  [`€${Number(value).toLocaleString('el-GR', { minimumFractionDigits: 2 })}`, 'Έσοδα'];

export default function FinanceBIClient({ currentYear, prevYear, byCategory, totalCurrentYear, totalPrevYear, year }: FinanceBIProps) {
  const [selectedYear, setSelectedYear] = useState(year.toString());

  const diff = totalCurrentYear - totalPrevYear;
  const pct = totalPrevYear > 0 ? ((diff / totalPrevYear) * 100).toFixed(1) : '—';

  // Merge current + prev year for comparison chart
  const comparisonData = MONTH_NAMES_SHORT.map((name, i) => ({
    name,
    [year]: currentYear.find(m => m.month === i + 1)?.total || 0,
    [year - 1]: prevYear.find(m => m.month === i + 1)?.total || 0,
  }));

  const categoryData = byCategory
    .filter(c => c.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="shadow-sm border-border/50">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Σύνολο {year}</p>
            <p className="text-3xl font-bold text-foreground mt-1">
              €{totalCurrentYear.toLocaleString('el-GR', { minimumFractionDigits: 2 })}
            </p>
            <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${diff > 0 ? 'text-emerald-600' : diff < 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
              {diff > 0 ? <TrendingUp className="w-4 h-4" /> : diff < 0 ? <TrendingDown className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
              {pct !== '—' ? `${pct}% από ${year - 1}` : 'Δεν υπάρχουν δεδομένα προηγ.'}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border/50">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Σύνολο {year - 1}</p>
            <p className="text-3xl font-bold text-muted-foreground mt-1">
              €{totalPrevYear.toLocaleString('el-GR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border/50">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Μέσος Όρος / Μήνα ({year})</p>
            <p className="text-3xl font-bold text-foreground mt-1">
              €{currentYear.length > 0 ? (totalCurrentYear / Math.max(currentYear.filter(m => m.total > 0).length, 1)).toLocaleString('el-GR', { minimumFractionDigits: 2 }) : '0,00'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bar chart: monthly comparison */}
      <Card className="shadow-sm border-border/50">
        <CardHeader className="border-b border-border/40 pb-4 flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="w-4 h-4 text-primary" />
              Μηνιαία Έσοδα — Σύγκριση Ετών
            </CardTitle>
            <CardDescription className="text-xs mt-1">{year - 1} vs {year}</CardDescription>
          </div>
          <Button variant="outline" size="sm" className="gap-1 text-xs">
            <Download className="w-3 h-3" />
            Εξαγωγή
          </Button>
        </CardHeader>
        <CardContent className="pt-6 pb-2">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={comparisonData} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `€${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={EuroTooltipFormatter} />
              <Legend />
              <Bar dataKey={year - 1} fill="#94a3b8" name={`${year - 1}`} radius={[3, 3, 0, 0]} />
              <Bar dataKey={year} fill="#6366f1" name={`${year}`} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Pie chart: by category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="shadow-sm border-border/50">
          <CardHeader className="border-b border-border/40 pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <PieIcon className="w-4 h-4 text-primary" />
              Κατανομή ανά Αιτιολογία
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="total"
                    nameKey="purpose"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={(props: any) => `${String(props.name || 'Άλλο').slice(0, 12)} ${((props.percent || 0) * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Legend />
                  <Tooltip formatter={(v: any) => `€${Number(v).toLocaleString('el-GR', { minimumFractionDigits: 2 })}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[240px] flex items-center justify-center text-muted-foreground text-sm">
                Δεν υπάρχουν δεδομένα
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top categories table */}
        <Card className="shadow-sm border-border/50">
          <CardHeader className="border-b border-border/40 pb-4">
            <CardTitle className="text-base">Αναλυτικός Πίνακας {year}</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-2">
              {categoryData.length === 0 && (
                <p className="text-muted-foreground text-sm text-center py-8">Δεν υπάρχουν δεδομένα</p>
              )}
              {categoryData.map((c, i) => {
                const pct = totalCurrentYear > 0 ? ((c.total / totalCurrentYear) * 100) : 0;
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-foreground">{c.purpose || 'Αδιευκρίνιστη'}</span>
                      <span className="text-muted-foreground">€{c.total.toLocaleString('el-GR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full transition-all"
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

