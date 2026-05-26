'use client'

import {
 AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
 ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'
import Link from 'next/link'
import {
 Users, FileText, Banknote, AlertCircle, ArrowUpRight,
 ArrowDownRight, TrendingUp, HeartHandshake, Plus,
 ClipboardList, UserPlus, Clock, CheckCircle2,
 ChevronRight, LayoutDashboard, Gift, Megaphone, Info, AlertTriangle, Wrench, Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const CHART_COLORS = ['#7C3AED', '#4F46E5', '#3B82F6', '#10B981', '#F59E0B', '#EF4444']

const serviceTypeLabel: Record<string, string> = {
 GAMOS: 'Γάμος',
 VAPTISI: 'Βάπτιση',
 KIDEIA: 'Κηδεία',
 MNIMOSINO: 'Μνημόσυνο',
}

const statusStyles: Record<string, { label: string; cls: string }> = {
 pending: { label: 'Εκκρεμεί', cls: 'badge-warning' },
 docs_generated: { label: 'Έγγραφα', cls: 'badge-info' },
 completed: { label: 'Ολοκλ.', cls: 'badge-success' },
}

function StatCard({
 title, value, icon, trend, trendLabel, color
}: {
 title: string
 value: string | number
 icon: React.ReactNode
 trend?: number
 trendLabel?: string
 color: string
}) {
 const isPositive = (trend ?? 0) >= 0
 return (
 <div className="card p-5 group">
 <div className="flex justify-between items-start mb-3">
 <div>
 <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">{title}</p>
 <h3 className="text-2xl font-extrabold text-[var(--foreground)]">{value}</h3>
 </div>
 <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
 <div className="[&>svg]:w-[18px] [&>svg]:h-[18px]">{icon}</div>
 </div>
 </div>
 {trend !== undefined && (
 <div className={`flex items-center gap-1 text-xs font-semibold ${isPositive ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
 {isPositive ? <ArrowUpRight className="w-3.5 h-3.5"/> : <ArrowDownRight className="w-3.5 h-3.5"/>}
 {Math.abs(trend)}% {trendLabel}
 </div>
)}
 {!trend && trendLabel && (
 <p className="text-xs text-[var(--text-muted)]">{trendLabel}</p>
)}
 </div>
)
}

const ChartTooltip = ({ active, payload, label }: any) => {
 if (active && payload?.length) {
 return (
 <div className="card px-3 py-2 !shadow-lg text-sm">
 <p className="font-semibold text-[var(--foreground)] mb-0.5">{label}</p>
 {payload.map((p: any) => (
 <p key={p.name} className="text-[var(--brand)] font-bold text-xs">
 €{p.value?.toLocaleString('el-GR')}
 </p>
))}
 </div>
)
 }
 return null
}

// ── Ποιμαντική: list of today + upcoming namedays ─────────────────────────────

function NamedayList({ namedays }: { namedays: any[] }) {
  const todayEntry = namedays.find((nd: any) => nd.isToday)
  const upcomingEntries = namedays.filter((nd: any) => !nd.isToday).slice(0, 4)

  return (
    <div className="space-y-4">
      {/* Today's Section */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-1.5">🎉 Σήμερα Γιορτάζουν</p>
        {todayEntry ? (
          <div className="space-y-2">
            {/* General Celebrating Names */}
            <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/80 text-amber-900">
              <p className="text-xs font-semibold text-amber-800 mb-0.5">Εορτολόγιο:</p>
              <p className="text-sm font-bold tracking-wide">
                {todayEntry.names.join(', ')}
              </p>
            </div>

            {/* Matching Parishioners */}
            {todayEntry.parishioners.length > 0 ? (
              <div className="space-y-1.5 mt-2">
                <p className="text-[10px] font-black uppercase tracking-wider text-amber-800/80">Εορτάζοντες Ενορίτες ({todayEntry.parishioners.length})</p>
                {todayEntry.parishioners.map((p: any) => (
                  <div key={`parishioner-${p.id}`} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-amber-200 shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-black text-white">{p.firstName[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{p.fullName}</p>
                      {p.phone && <p className="text-xs text-slate-500">{p.phone}</p>}
                    </div>
                    <span className="text-lg">🎂</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-amber-800/60 italic pl-1">Κανείς ενορίτης δεν γιορτάζει σήμερα.</p>
            )}
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic pl-1">Δεν υπάρχει κάποια καταγεγραμμένη εορτή.</p>
        )}
      </div>

      {/* Upcoming Days Section */}
      {upcomingEntries.length > 0 && (
        <div className="border-t border-[var(--border)] pt-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2.5">Επόμενες Ημέρες</p>
          <div className="space-y-3">
            {upcomingEntries.map((nd: any, i: number) => (
              <div key={`upcoming-${nd.date}-${i}`} className="p-2.5 rounded-xl hover:bg-[var(--surface-hover)] border border-transparent hover:border-[var(--border)] transition-all">
                <div className="flex justify-between items-start mb-1">
                  <p className="text-xs font-bold text-[var(--brand)]">
                    {new Date(nd.date).toLocaleDateString('el-GR', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </p>
                  {nd.parishioners.length > 0 && (
                    <span className="badge badge-warning text-[10px] py-0.5 px-1.5">
                      {nd.parishioners.length} ενορίτ{nd.parishioners.length === 1 ? 'ης' : 'ες'}
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold text-[var(--foreground)] leading-snug">
                  {nd.names.join(', ')}
                </p>
                {nd.parishioners.length > 0 && (
                  <div className="mt-1.5 pl-2 border-l-2 border-amber-300 space-y-0.5">
                    {nd.parishioners.map((p: any) => (
                      <p key={`up-p-${p.id}`} className="text-[11px] text-[var(--text-secondary)] font-medium">
                        • {p.fullName}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────

export default function DashboardClient({ stats }: { stats: any }) {
 return (
 <div className="space-y-6 pb-8">

 {/* Header */}
 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
 <div>
 <h1 className="text-xl font-bold text-[var(--foreground)] flex items-center gap-2">
 <LayoutDashboard className="w-5 h-5 text-[var(--brand)]"/>
 Επισκόπηση
 </h1>
 <p className="text-sm text-[var(--text-muted)] mt-0.5">
 Στατιστικά και δραστηριότητα σε πραγματικό χρόνο
 </p>
 </div>
 <div className="flex gap-2">
 <Link href="/admin/requests">
 <button className="btn btn-primary btn-sm">
 <Plus className="w-3.5 h-3.5"/> Νέο Αίτημα
 </button>
 </Link>
 <Link href="/admin/parishioners">
 <button className="btn btn-secondary btn-sm">
 <UserPlus className="w-3.5 h-3.5"/> Νέος Ενορίτης
 </button>
 </Link>
 </div>
 </div>

 {/* System Announcements */}
 {stats.announcements?.length > 0 && (
 <div className="space-y-2 mb-4">
 {stats.announcements.map((ann: any) => {
 const typeStyles: Record<string, { bg: string; border: string; icon: any }> = {
 info: { bg: 'bg-blue-50', border: 'border-blue-200', icon: Info },
 warning: { bg: 'bg-amber-50', border: 'border-amber-200', icon: AlertTriangle },
 update: { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: Sparkles },
 maintenance: { bg: 'bg-red-50', border: 'border-red-200', icon: Wrench },
 }
 const style = typeStyles[ann.type] || typeStyles.info
 const AnnIcon = style.icon
 return (
 <div key={ann.id} className={`flex items-start gap-3 p-4 rounded-xl border ${style.bg} ${style.border} animate-in fade-in duration-300`}>
 <AnnIcon className="w-5 h-5 mt-0.5 flex-shrink-0 opacity-70"/>
 <div className="flex-1 min-w-0">
 <p className="text-sm font-bold text-[var(--foreground)]">{ann.title}</p>
 <p className="text-xs text-[var(--text-muted)] mt-0.5 line-clamp-2">{ann.body}</p>
 </div>
 <Megaphone className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0 opacity-40"/>
 </div>
 )
 })}
 </div>
 )}

 {/* Smart Action Center */}
 <div className="card p-5 border border-indigo-100 bg-gradient-to-r from-indigo-50/50 to-blue-50/50 mb-6">
 <h2 className="text-sm font-bold text-[var(--brand-darker)] flex items-center gap-2 mb-4">
 <span className="relative flex h-3 w-3">
 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
 <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
 </span>
 Έξυπνος Βοηθός (Action Center)
 </h2>

 <div className="space-y-3">
 {stats.pendingRequests > 0 ? (
 <div className="flex items-center justify-between p-3 bg-[var(--surface)] rounded-lg border border-warning/20 shadow-sm transition-all hover:shadow-md">
 <div className="flex items-center gap-3">
 <div className="p-2 bg-warning/10 rounded-md text-warning"><AlertCircle className="w-5 h-5"/></div>
 <div>
 <p className="text-sm font-bold text-foreground">Εκκρεμούν {stats.pendingRequests} αιτήσεις</p>
 <p className="text-xs text-muted-foreground">Απαιτείται έγκριση δικαιολογητικών.</p>
 </div>
 </div>
 <Link href="/admin/requests"><Button size="sm" variant="outline" className="h-8">Διαχείριση</Button></Link>
 </div>
) : (
 <div className="flex items-center gap-3 p-3 bg-[var(--surface)] rounded-lg border shadow-sm">
 <div className="p-2 bg-[var(--success-light)] rounded-md text-[var(--success)]"><CheckCircle2 className="w-5 h-5"/></div>
 <div><p className="text-sm font-bold text-foreground">Δεν υπάρχουν εκκρεμή αιτήματα.</p></div>
 </div>
)}

  {(() => {
    const todayCount = stats.upcomingNamedays?.find((nd: any) => nd.isToday)?.parishioners?.length || 0
    const upcomingCount = stats.upcomingNamedays?.filter((nd: any) => !nd.isToday)
      .reduce((acc: number, nd: any) => acc + (nd.parishioners?.length || 0), 0) || 0

    if (todayCount === 0 && upcomingCount === 0) return null

    return (
      <div className="flex items-center justify-between p-3 bg-[var(--surface)] rounded-lg border border-blue-200 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-md text-blue-600"><Gift className="w-5 h-5"/></div>
          <div>
            {todayCount > 0 && <p className="text-sm font-bold text-foreground">🎉 {todayCount} {todayCount === 1 ? 'ενορίτης εορτάζει' : 'ενορίτες εορτάζουν'} σήμερα!</p>}
            {upcomingCount > 0 && <p className="text-xs text-muted-foreground">{upcomingCount} ακόμα εορτές ενοριτών τις επόμενες μέρες</p>}
            {todayCount === 0 && upcomingCount > 0 && <p className="text-sm font-bold text-foreground">Πλησιάζουν {upcomingCount} Εορτές Ενοριτών</p>}
          </div>
        </div>
        <Link href="/admin/mailing"><Button size="sm" variant="outline" className="h-8 text-blue-600 border-blue-200">Ευχές</Button></Link>
      </div>
    )
  })()}

 <div className="flex items-center justify-between p-3 bg-[var(--surface)] rounded-lg border border-purple-200 shadow-sm transition-all hover:shadow-md">
 <div className="flex items-center gap-3">
 <div className="p-2 bg-purple-50 rounded-md text-purple-600"><HeartHandshake className="w-5 h-5"/></div>
 <div>
 <p className="text-sm font-bold text-foreground">Έλεγχος Πλάνου Διακονιών</p>
 <p className="text-xs text-muted-foreground">Μην ξεχάσετε να οργανώσετε τις βάρδιες εθελοντών.</p>
 </div>
 </div>
 <Link href="/admin/ministries"><Button size="sm" variant="outline" className="h-8 text-purple-600 border-purple-200">Βάρδιες</Button></Link>
 </div>
 </div>
 </div>

 {/* KPI Cards */}
 <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
 <StatCard
 title="Ενορίτες"
 value={stats.totalParishioners}
 icon={<Users />}
 trendLabel="Εγγεγραμμένοι στο Μητρώο"
 color="bg-[var(--brand-light)] text-[var(--brand)]"
 />
 <StatCard
 title="Έσοδα Μήνα"
 value={`€${Number(stats.totalMonthlyDonations).toLocaleString('el-GR')}`}
 icon={<Banknote />}
 trend={stats.monthlyGrowth}
 trendLabel="vs προηγ. μήνα"
 color="bg-[var(--success-light)] text-[var(--success)]"
 />
 <StatCard
 title="Εκκρεμή"
 value={stats.pendingRequests}
 icon={stats.pendingRequests > 0 ? <AlertCircle /> : <FileText />}
 trendLabel={stats.pendingRequests > 0 ? 'Απαιτούν ενέργεια' : 'Κανένα εκκρεμές'}
 color={stats.pendingRequests > 0 ? 'bg-[var(--warning-light)] text-[var(--warning)]' : 'bg-[var(--brand-light)] text-[var(--brand)]'}
 />
 <StatCard
 title="Φιλόπτωχο"
 value={stats.activeBeneficiaries || 0}
 icon={<HeartHandshake />}
 trendLabel="Ενεργοί ωφελούμενοι"
 color="bg-[var(--info-light)] text-[var(--info)]"
 />
 </div>

 {/* Charts */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
 {/* Revenue Chart */}
 <div className="lg:col-span-2 card p-5">
 <div className="flex justify-between items-center mb-5">
 <div>
 <h2 className="text-sm font-bold text-[var(--foreground)]">Τάση Εσόδων</h2>
 <p className="text-xs text-[var(--text-muted)]">Τελευταίοι 6 μήνες</p>
 </div>
 <Link href="/admin/finances" className="text-xs font-semibold text-[var(--brand)] hover:underline flex items-center gap-1">
 Αναλυτικά <ChevronRight className="w-3 h-3"/>
 </Link>
 </div>
 <div className="w-full h-[220px]">
 <ResponsiveContainer width="100%" height="100%">
 <AreaChart data={stats.revenueTrend} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
 <defs>
 <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
 <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.15} />
 <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
 </linearGradient>
 </defs>
 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)"/>
 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12, fontWeight: 500 }} dy={8} />
 <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} dx={-5} tickFormatter={(v) => `€${v}`} />
 <Tooltip content={<ChartTooltip />} />
 <Area type="monotone" dataKey="Έσοδα" stroke="#7C3AED" strokeWidth={2} fill="url(#revenueGrad)" dot={{ r: 3.5, fill: '#7C3AED', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 5, fill: '#4F46E5' }} />
 </AreaChart>
 </ResponsiveContainer>
 </div>
 </div>

 {/* Sacraments Donut */}
 <div className="card p-5">
 <div className="mb-4">
 <h2 className="text-sm font-bold text-[var(--foreground)]">Μυστήρια</h2>
 <p className="text-xs text-[var(--text-muted)]">Κατανομή τρέχοντος έτους</p>
 </div>
 {stats.sacramentsData?.length > 0 ? (
 <>
 <div className="w-full h-[160px]">
 <ResponsiveContainer width="100%" height="100%">
 <PieChart>
 <Pie data={stats.sacramentsData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={3} dataKey="value" stroke="none">
 {stats.sacramentsData?.map((_: any, index: number) => (
 <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
))}
 </Pie>
 <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', fontSize: '12px' }} />
 </PieChart>
 </ResponsiveContainer>
 </div>
 <div className="mt-3 space-y-2">
 {stats.sacramentsData?.slice(0, 4).map((entry: any, index: number) => (
 <div key={entry.name} className="flex items-center justify-between text-xs">
 <div className="flex items-center gap-2">
 <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
 <span className="text-[var(--text-secondary)] font-medium">{entry.name}</span>
 </div>
 <span className="font-bold text-[var(--foreground)]">{entry.value}</span>
 </div>
 ))}
 </div>
 </>
) : (
 <div className="empty-state py-8">
 <TrendingUp className="empty-state-icon"/>
 <p className="empty-state-title">Δεν υπάρχουν δεδομένα</p>
 <p className="empty-state-desc">Τα μυστήρια θα εμφανιστούν εδώ</p>
 </div>
)}
 </div>
 </div>

 {/* Bottom Row: Requests | Parishioners | Ποιμαντική */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

 {/* Recent Requests */}
 <div className="card p-5">
 <div className="flex justify-between items-center mb-4">
 <h2 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-2">
 <ClipboardList className="w-4 h-4 text-[var(--brand)]"/>
 Πρόσφατα Αιτήματα
 </h2>
 <Link href="/admin/requests" className="text-xs font-semibold text-[var(--brand)] hover:underline flex items-center gap-1">
 Όλα <ChevronRight className="w-3 h-3"/>
 </Link>
 </div>
 {stats.recentTokens?.length > 0 ? (
 <div className="space-y-1">
 {stats.recentTokens.map((token: any) => {
 const st = statusStyles[token.status] || { label: token.status, cls: 'badge-info' }
 return (
 <Link key={token.id} href={`/admin/requests/${token.id}`}>
 <div className="flex items-center justify-between p-2.5 rounded-lg hover:bg-[var(--surface-hover)] transition-colors group cursor-pointer">
 <div className="flex items-center gap-3 min-w-0">
 <div className="w-8 h-8 rounded-md bg-[var(--brand-light)] flex items-center justify-center flex-shrink-0">
 <FileText className="w-3.5 h-3.5 text-[var(--brand)]"/>
 </div>
 <div className="min-w-0">
 <p className="text-sm font-semibold text-[var(--foreground)] truncate">{token.customerName || '—'}</p>
 <p className="text-xs text-[var(--text-muted)]">{serviceTypeLabel[token.serviceType] || token.serviceType}</p>
 </div>
 </div>
 <span className={`badge ${st.cls} flex-shrink-0`}>{st.label}</span>
 </div>
 </Link>
 )
 })}
 </div>
) : (
 <div className="empty-state py-6">
 <FileText className="empty-state-icon"/>
 <p className="empty-state-title">Κανένα αίτημα</p>
 <p className="empty-state-desc">Τα αιτήματα θα εμφανιστούν εδώ</p>
 </div>
)}
 </div>

 {/* Recent Parishioners */}
 <div className="card p-5">
 <div className="flex justify-between items-center mb-4">
 <h2 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-2">
 <Users className="w-4 h-4 text-[var(--brand)]"/>
 Νέες Εγγραφές
 </h2>
 <Link href="/admin/parishioners" className="text-xs font-semibold text-[var(--brand)] hover:underline flex items-center gap-1">
 Μητρώο <ChevronRight className="w-3 h-3"/>
 </Link>
 </div>
 {stats.recentParishioners?.length > 0 ? (
 <div className="space-y-1">
 {stats.recentParishioners.map((p: any) => (
 <Link key={p.id} href={`/admin/parishioners/${p.id}`}>
 <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[var(--surface-hover)] transition-colors group cursor-pointer">
 <div className="w-8 h-8 rounded-full bg-[var(--brand-light)] flex items-center justify-center flex-shrink-0">
 <span className="text-xs font-bold text-[var(--brand)]">{p.firstName[0]}{p.lastName[0]}</span>
 </div>
 <div className="flex-1 min-w-0">
 <p className="text-sm font-semibold text-[var(--foreground)]">{p.firstName} {p.lastName}</p>
 <p className="text-xs text-[var(--text-muted)] flex items-center gap-1">
 <Clock className="w-3 h-3"/>
 {new Date(p.createdAt).toLocaleDateString('el-GR')}
 </p>
 </div>
 </div>
 </Link>
 ))}
 </div>
) : (
 <div className="empty-state py-6">
 <Users className="empty-state-icon"/>
 <p className="empty-state-title">Κανένας ενορίτης</p>
 <p className="empty-state-desc">Οι εγγραφές θα εμφανιστούν εδώ</p>
 </div>
)}

 <div className="border-t border-[var(--border)] pt-3 mt-3 grid grid-cols-2 gap-4">
 <div className="text-center">
 <p className="text-xl font-extrabold text-[var(--foreground)]">{stats.completedRequests || 0}</p>
 <p className="text-xs text-[var(--text-muted)] flex items-center justify-center gap-1">
 <CheckCircle2 className="w-3 h-3 text-[var(--success)]"/> Ολοκληρωμένα
 </p>
 </div>
 <div className="text-center border-l border-[var(--border)]">
 <p className="text-xl font-extrabold text-[var(--brand)]">{stats.sacramentsData?.reduce((a: number, s: any) => a + s.value, 0) || 0}</p>
 <p className="text-xs text-[var(--text-muted)]">Σύνολο Μυστηρίων</p>
 </div>
 </div>
 </div>

 {/* Ποιμαντική — Εορτάζοντες */}
 <div className="card p-5">
 <div className="flex justify-between items-center mb-4">
 <h2 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-2">
 <Gift className="w-4 h-4 text-[var(--brand)]"/>
 Ποιμαντική
 </h2>
 <Link href="/admin/parishioners" className="text-xs font-semibold text-[var(--brand)] hover:underline flex items-center gap-1">
 Μητρώο <ChevronRight className="w-3 h-3"/>
 </Link>
 </div>
 {stats.upcomingNamedays?.length > 0 ? (
 <NamedayList namedays={stats.upcomingNamedays} />
) : (
 <div className="empty-state py-6">
 <Gift className="empty-state-icon"/>
 <p className="empty-state-title">Κανείς εορτάζων</p>
 <p className="empty-state-desc">Δεν υπάρχουν εορτές τις επόμενες 7 ημέρες</p>
 </div>
)}
 </div>

 </div>
 </div>
)
}
