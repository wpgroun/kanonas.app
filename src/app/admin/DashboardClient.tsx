'use client'

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'
import Link from 'next/link'
import { motion } from 'motion/react'
import {
  Users, FileText, Banknote, Cross, AlertCircle, ArrowUpRight,
  ArrowDownRight, TrendingUp, HeartHandshake, Plus, ClipboardList,
  UserPlus, Clock, CheckCircle2, ChevronRight
} from 'lucide-react'

// Byzantine design palette
const SACRAMENT_COLORS = ['#59161a', '#c3a165', '#2b6cb0', '#276749', '#744210', '#553c9a']

const serviceTypeLabel: Record<string, string> = {
  GAMOS: '💍 Γάμος',
  VAPTISI: '✝️ Βάπτιση',
  KIDEIA: '🕯️ Κηδεία',
  MNIMOSINO: '🙏 Μνημόσυνο',
}

const statusLabel: Record<string, { label: string; className: string }> = {
  pending:        { label: 'Εκκρεμεί',     className: 'bg-amber-100 text-amber-700' },
  docs_generated: { label: 'Εγγρ. Εγγρ.', className: 'bg-blue-100 text-blue-700' },
  completed:      { label: 'Ολοκλ.',       className: 'bg-green-100 text-green-700' },
}

function StatCard({
  title, value, icon, trend, trendLabel, accent, delay = 0
}: {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: number
  trendLabel?: string
  accent: string
  delay?: number
}) {
  const isPositive = (trend ?? 0) >= 0
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      className="bg-white rounded-2xl border border-[#e5dfd9] p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group"
    >
      {/* Accent stripe */}
      <div className={`absolute top-0 left-0 w-1 h-full rounded-l-2xl ${accent}`} />

      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#736760] mb-1">{title}</p>
          <h3 className="text-3xl font-black text-[#2b1f1a] font-heading">{value}</h3>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${accent.replace('bg-', 'bg-').replace('[#', '[#').replace(']', ']')} bg-opacity-10`}
          style={{ background: 'rgba(195,161,101,0.1)' }}>
          <div className="text-[#c3a165] [&>svg]:w-5 [&>svg]:h-5">{icon}</div>
        </div>
      </div>

      {trend !== undefined && (
        <div className={`flex items-center gap-1 text-xs font-bold ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
          {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
          {Math.abs(trend)}% {trendLabel}
        </div>
      )}
      {!trend && trendLabel && (
        <p className="text-xs text-[#736760] font-medium">{trendLabel}</p>
      )}
    </motion.div>
  )
}

// Custom Tooltip for charts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-[#e5dfd9] rounded-xl shadow-lg px-4 py-3 text-sm">
        <p className="font-bold text-[#2b1f1a] mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} className="text-[#59161a] font-semibold">
            {p.name}: <span className="font-black">€{p.value?.toLocaleString('el-GR')}</span>
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function DashboardClient({ stats }: { stats: any }) {
  return (
    <div className="space-y-8 pb-12">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#2b1f1a] font-heading flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-[#c3a165]" />
            Επισκόπηση Ενορίας
          </h1>
          <p className="text-[#736760] mt-1 text-sm font-medium">
            KPIs & Στατιστικά σε πραγματικό χρόνο
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/requests/new">
            <button className="flex items-center gap-1.5 px-4 py-2 bg-[#59161a] text-white rounded-xl text-sm font-bold shadow hover:bg-[#7b2126] transition-colors">
              <Plus className="w-4 h-4" /> Νέο Αίτημα
            </button>
          </Link>
          <Link href="/admin/parishioners/new">
            <button className="flex items-center gap-1.5 px-4 py-2 border border-[#c3a165]/40 bg-[#c3a165]/10 text-[#59161a] rounded-xl text-sm font-bold hover:bg-[#c3a165]/20 transition-colors">
              <UserPlus className="w-4 h-4" /> Νέος Ενορίτης
            </button>
          </Link>
        </div>
      </div>

      {/* Pending Alert Banner */}
      {stats.pendingRequests > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center justify-between gap-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="font-bold text-amber-800 text-sm">
                {stats.pendingRequests} εκκρεμή αιτήματα χρειάζονται προσοχή
              </p>
              <p className="text-xs text-amber-600">Ελέγξτε και επεξεργαστείτε τα αιτήματα Γάμων / Βαπτίσεων</p>
            </div>
          </div>
          <Link href="/admin/requests">
            <button className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-bold hover:bg-amber-600 transition-colors shrink-0">
              Προβολή <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </Link>
        </motion.div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Ενορίτες"
          value={stats.totalParishioners}
          icon={<Users />}
          trendLabel="Εγγεγραμμένοι στο Μητρώο"
          accent="bg-[#59161a]"
          delay={0}
        />
        <StatCard
          title="Έσοδα Μήνα"
          value={`€${Number(stats.totalMonthlyDonations).toLocaleString('el-GR')}`}
          icon={<Banknote />}
          trend={stats.monthlyGrowth}
          trendLabel="vs προηγ. μήνα"
          accent="bg-emerald-500"
          delay={0.1}
        />
        <StatCard
          title="Αιτήματα"
          value={stats.pendingRequests}
          icon={stats.pendingRequests > 0 ? <AlertCircle /> : <FileText />}
          trendLabel={stats.pendingRequests > 0 ? '⚠️ Απαιτούν επεξεργασία' : '✓ Κανένα εκκρεμές'}
          accent={stats.pendingRequests > 0 ? "bg-amber-500" : "bg-[#c3a165]"}
          delay={0.2}
        />
        <StatCard
          title="Φιλόπτωχο"
          value={stats.activeBeneficiaries || 0}
          icon={<HeartHandshake />}
          trendLabel="Ενεργοί ωφελούμενοι"
          accent="bg-blue-500"
          delay={0.3}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Revenue Area Chart — spans 2 cols */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="lg:col-span-2 bg-white rounded-2xl border border-[#e5dfd9] shadow-sm p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-base font-bold text-[#2b1f1a] font-heading">Τάση Εσόδων</h2>
              <p className="text-xs text-[#736760] font-medium">Τελευταίοι 6 μήνες</p>
            </div>
            <Link href="/admin/finances" className="text-xs font-bold text-[#59161a] hover:underline flex items-center gap-1">
              Αναλυτικά <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="w-full h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.revenueTrend} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#59161a" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#59161a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#736760', fontSize: 12, fontWeight: 600 }}
                  dy={8}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#736760', fontSize: 11 }}
                  dx={-5}
                  tickFormatter={(v) => `€${v}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="Έσοδα"
                  stroke="#59161a"
                  strokeWidth={2.5}
                  fill="url(#revenueGrad)"
                  dot={{ r: 4, fill: '#59161a', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, fill: '#c3a165' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Sacraments Donut */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="bg-white rounded-2xl border border-[#e5dfd9] shadow-sm p-6"
        >
          <div className="mb-4">
            <h2 className="text-base font-bold text-[#2b1f1a] font-heading">Μυστήρια</h2>
            <p className="text-xs text-[#736760] font-medium">Κατανομή τρέχοντος έτους</p>
          </div>
          <div className="w-full h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.sacramentsData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {stats.sacramentsData?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={SACRAMENT_COLORS[index % SACRAMENT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5dfd9', backgroundColor: '#fff', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 space-y-2">
            {stats.sacramentsData?.slice(0, 4).map((entry: any, index: number) => (
              <div key={entry.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: SACRAMENT_COLORS[index % SACRAMENT_COLORS.length] }} />
                  <span className="text-[#736760] font-medium truncate">{entry.name}</span>
                </div>
                <span className="font-bold text-[#2b1f1a]">{entry.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Row: Recent Activity + Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Requests */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="bg-white rounded-2xl border border-[#e5dfd9] shadow-sm p-6"
        >
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-base font-bold text-[#2b1f1a] font-heading flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-[#c3a165]" /> Πρόσφατα Αιτήματα
            </h2>
            <Link href="/admin/requests" className="text-xs font-bold text-[#59161a] hover:underline flex items-center gap-1">
              Όλα <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {stats.recentTokens?.length > 0 ? (
            <div className="space-y-3">
              {stats.recentTokens.map((token: any) => {
                const st = statusLabel[token.status] || { label: token.status, className: 'bg-gray-100 text-gray-600' }
                return (
                  <Link key={token.id} href={`/admin/requests/${token.id}`}>
                    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-[#fdfaf7] border border-transparent hover:border-[#e5dfd9] transition-all group cursor-pointer">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-[#59161a]/10 flex items-center justify-center flex-shrink-0">
                          <Cross className="w-4 h-4 text-[#59161a]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-[#2b1f1a] truncate">{token.customerName || '—'}</p>
                          <p className="text-xs text-[#736760]">{serviceTypeLabel[token.serviceType] || token.serviceType}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${st.className}`}>{st.label}</span>
                        <ChevronRight className="w-4 h-4 text-[#c3a165] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-[#736760] text-sm">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
              Δεν υπάρχουν αιτήματα ακόμα
            </div>
          )}
        </motion.div>

        {/* New Parishioners + Sacrament Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.5 }}
          className="bg-white rounded-2xl border border-[#e5dfd9] shadow-sm p-6"
        >
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-base font-bold text-[#2b1f1a] font-heading flex items-center gap-2">
              <Users className="w-4 h-4 text-[#c3a165]" /> Νέες Εγγραφές
            </h2>
            <Link href="/admin/parishioners" className="text-xs font-bold text-[#59161a] hover:underline flex items-center gap-1">
              Μητρώο <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {stats.recentParishioners?.length > 0 ? (
            <div className="space-y-3 mb-6">
              {stats.recentParishioners.map((p: any) => (
                <Link key={p.id} href={`/admin/parishioners/${p.id}`}>
                  <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#fdfaf7] border border-transparent hover:border-[#e5dfd9] transition-all group cursor-pointer">
                    <div className="w-9 h-9 rounded-full bg-[#c3a165]/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-black text-[#59161a]">{p.firstName[0]}{p.lastName[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#2b1f1a]">{p.firstName} {p.lastName}</p>
                      <p className="text-xs text-[#736760] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(p.createdAt).toLocaleDateString('el-GR')}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#c3a165] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-[#736760] text-sm mb-6">
              <Users className="w-6 h-6 mx-auto mb-2 opacity-30" />
              Δεν υπάρχουν εγγραφές ακόμα
            </div>
          )}

          {/* Mini summary stats */}
          <div className="border-t border-[#e5dfd9] pt-4 grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-2xl font-black text-[#59161a] font-heading">{stats.completedRequests || 0}</p>
              <p className="text-xs text-[#736760] font-medium flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Ολοκληρωμένα
              </p>
            </div>
            <div className="text-center border-l border-[#e5dfd9]">
              <p className="text-2xl font-black text-[#c3a165] font-heading">{stats.sacramentsData?.reduce((a: number, s: any) => a + s.value, 0) || 0}</p>
              <p className="text-xs text-[#736760] font-medium">Σύνολο Μυστηρίων</p>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  )
}

