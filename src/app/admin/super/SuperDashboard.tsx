'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Building2, Users, UserCheck, Plus, ChevronRight,
  Calendar, Shield, BarChart3
} from 'lucide-react'
import { getSuperAdminStats } from '@/actions/superadmin'

function StatCard({ title, value, icon, color }: {
  title: string; value: number | string; icon: React.ReactNode; color: string
}) {
  return (
    <div className="card p-5">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">{title}</p>
          <h3 className="text-2xl font-extrabold text-[var(--foreground)]">{value}</h3>
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <div className="[&>svg]:w-[18px] [&>svg]:h-[18px]">{icon}</div>
        </div>
      </div>
    </div>
  )
}

export default function SuperDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSuperAdminStats().then((data) => {
      setStats(data)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-[var(--brand)] border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-[var(--foreground)] flex items-center gap-2">
            <Shield className="w-5 h-5 text-[var(--brand)]" />
            Super Admin
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            Διαχείριση πλατφόρμας & συνδρομών
          </p>
        </div>
        <Link href="/admin/onboarding">
          <button className="btn btn-primary btn-sm">
            <Plus className="w-3.5 h-3.5" /> Νέος Ναός
          </button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Ναοί"
          value={stats?.totalTemples || 0}
          icon={<Building2 />}
          color="bg-[var(--brand-light)] text-[var(--brand)]"
        />
        <StatCard
          title="Χρήστες"
          value={stats?.totalUsers || 0}
          icon={<UserCheck />}
          color="bg-[var(--success-light)] text-[var(--success)]"
        />
        <StatCard
          title="Ενορίτες"
          value={stats?.totalParishioners || 0}
          icon={<Users />}
          color="bg-[var(--info-light)] text-[var(--info)]"
        />
      </div>

      {/* Temples Table */}
      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--border)] flex justify-between items-center">
          <h2 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[var(--brand)]" />
            Εγγεγραμμένοι Ναοί
          </h2>
          <span className="badge badge-brand">{stats?.totalTemples || 0} σύνολο</span>
        </div>
        <div className="table-wrapper border-0 rounded-none">
          <table>
            <thead>
              <tr>
                <th>Ναός</th>
                <th>Μητρόπολη</th>
                <th>Πόλη</th>
                <th>Ενορίτες</th>
                <th>Χρήστες</th>
                <th>Εγγραφή</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentTemples?.length > 0 ? (
                stats.recentTemples.map((t: any) => (
                  <tr key={t.id}>
                    <td className="font-semibold">{t.name}</td>
                    <td className="text-[var(--text-muted)]">{t.metropolis}</td>
                    <td className="text-[var(--text-muted)]">{t.city || '—'}</td>
                    <td>
                      <span className="badge badge-brand">{t.parishioners}</span>
                    </td>
                    <td>
                      <span className="badge badge-info">{t.users}</span>
                    </td>
                    <td className="text-[var(--text-muted)] text-xs">
                      {new Date(t.createdAt).toLocaleDateString('el-GR')}
                    </td>
                    <td>
                      <button className="btn btn-ghost btn-sm">
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-[var(--text-muted)]">
                    Κανένας Ναός δεν έχει εγγραφεί ακόμα
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
