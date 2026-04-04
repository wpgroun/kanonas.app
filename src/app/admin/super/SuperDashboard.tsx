'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Building2, Users, UserCheck, Plus, ChevronRight,
  Calendar, Shield, BarChart3, Power, PowerOff, Mail, MapPin
} from 'lucide-react'
import { getSuperAdminStats, toggleSubscriptionStatus } from '@/actions/superadmin'

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

  const fetchStats = () => {
    setLoading(true)
    getSuperAdminStats().then((data) => {
      setStats(data)
      setLoading(false)
    })
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const handleToggleStatus = async (templeId: string, currentStatus: string) => {
    const confirmMsg = currentStatus === 'active' 
      ? 'Είστε σίγουροι ότι θέλετε να απενεργοποιήσετε αυτή τη συνδρομή;' 
      : 'Είστε σίγουροι ότι θέλετε να ενεργοποιήσετε αυτή τη συνδρομή;';
    if (!confirm(confirmMsg)) return;

    const res = await toggleSubscriptionStatus(templeId, currentStatus);
    if (res.success) {
      fetchStats();
    } else {
      alert(res.error || 'Σφάλμα κατά την αλλαγή κατάστασης');
    }
  }

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
        <StatCard
          title="Μηνιαία Έσοδα (MRR)"
          value={`€${stats?.totalMRR || 0}`}
          icon={<BarChart3 />}
          color="bg-emerald-100 text-emerald-600"
        />
        <StatCard
          title="Κατανάλωση Cloud"
          value={`${((stats?.totalStorageMB || 0) / 1024).toFixed(1)} GB`}
          icon={<Shield />}
          color="bg-slate-100 text-slate-600"
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
                <th>Στοιχεία Επικοινωνίας</th>
                <th>Ενορίτες / Χρήστες</th>
                <th>Συνδρομή</th>
                <th>Κατάσταση</th>
                <th className="text-right">Ενέργειες</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentTemples?.length > 0 ? (
                stats.recentTemples.map((t: any) => (
                  <tr key={t.id}>
                    <td>
                      <div className="font-semibold text-[var(--foreground)]">{t.name}</div>
                      <div className="text-xs text-[var(--text-muted)] flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3 h-3" /> {t.metropolis}
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col gap-1">
                        {t.email ? (
                          <div className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {t.email}
                          </div>
                        ) : (
                          <span className="text-xs text-[var(--text-muted)] italic">Χωρίς Email</span>
                        )}
                        {t.city && (
                          <div className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {t.city}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <span className="badge badge-brand tooltip" data-tip="Ενορίτες">{t.parishioners}</span>
                        <span className="badge badge-info tooltip" data-tip="Χρήστες Admin">{t.users}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${t.subscriptionPlan === 'premium' ? 'bg-amber-100 text-amber-700' : 'badge-neutral'}`}>
                        {t.subscriptionPlan === 'premium' ? 'PREMIUM' : 'BASIC'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${t.subscriptionStatus === 'active' ? 'badge-success' : 'badge-error'}`}>
                        {t.subscriptionStatus === 'active' ? 'Ενεργή' : 'Ανενεργή'}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleToggleStatus(t.id, t.subscriptionStatus)}
                          className={`btn btn-sm ${t.subscriptionStatus === 'active' ? 'btn-ghost text-red-500 hover:bg-red-50' : 'btn-outline border-[var(--success)] text-[var(--success)] hover:bg-[var(--success)] hover:text-white'}`}
                          title={t.subscriptionStatus === 'active' ? 'Απενεργοποίηση' : 'Ενεργοποίηση'}
                        >
                          {t.subscriptionStatus === 'active' ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                        </button>
                        <button className="btn btn-ghost btn-sm">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
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
