import { getAuditLogs, getAuditLogActionTypes } from '@/actions/audit-logs'
import { Download, ShieldCheck, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import AuditExportButton from './AuditExportButton'

export const metadata = { title: 'Ιστορικό Ενεργειών — Κανόνας' }

// ─── Color coding by action prefix ──────────────────────────────────────────────
function getActionStyle(action: string) {
  const a = action.toUpperCase()
  if (a.includes('LOGIN') || a.includes('LOGOUT')) return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-400' }
  if (a.includes('DELETE') || a.includes('ΔΙΑΓΡΑΦ')) return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-400' }
  if (a.includes('CREATE') || a.includes('ΠΡΟΣΘΗΚ') || a.includes('ΕΓΓΡΑΦ')) return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', dot: 'bg-green-400' }
  if (a.includes('UPDATE') || a.includes('ΕΝΗΜΕΡ') || a.includes('ΚΑΤΑΣΤΑΣΗ') || a.includes('SETTINGS')) return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-400' }
  if (a.includes('EXPORT') || a.includes('ΕΚΤΥΠ') || a.includes('ΑΡΧΕΙ')) return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-400' }
  if (a.includes('ΠΡΩΤΟΚ')) return { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', dot: 'bg-indigo-400' }
  return { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', dot: 'bg-slate-400' }
}

function formatDate(d: Date) {
  return new Intl.DateTimeFormat('el-GR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).format(new Date(d))
}

interface Props {
  searchParams: { page?: string; action?: string; email?: string; from?: string; to?: string }
}

export default async function AuditLogsPage({ searchParams }: Props) {
  const page = Math.max(1, Number(searchParams.page) || 1)
  const filters = {
    action: searchParams.action || undefined,
    userEmail: searchParams.email || undefined,
    from: searchParams.from || undefined,
    to: searchParams.to || undefined,
  }

  const [logs, actionTypes] = await Promise.all([
    getAuditLogs(page, filters),
    getAuditLogActionTypes(),
  ])

  // Build URL helper for pagination
  const buildUrl = (p: number) => {
    const params = new URLSearchParams()
    if (p > 1) params.set('page', String(p))
    if (filters.action) params.set('action', filters.action)
    if (filters.userEmail) params.set('email', filters.userEmail)
    if (filters.from) params.set('from', filters.from)
    if (filters.to) params.set('to', filters.to)
    return `/admin/audit?${params.toString()}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-[var(--foreground)] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[var(--brand)]" />
            Ιστορικό Ενεργειών
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            {logs.total.toLocaleString('el-GR')} συνολικές καταγεγραμμένες ενέργειες
          </p>
        </div>
        <AuditExportButton />
      </div>

      {/* Filters */}
      <form method="GET" className="card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Filter className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <select
              name="action"
              defaultValue={filters.action || ''}
              className="w-full pl-8 pr-3 py-2 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:ring-2 focus:ring-[var(--brand)]/30 focus:border-[var(--brand)] outline-none"
            >
              <option value="">Όλες οι ενέργειες</option>
              {actionTypes.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              name="email"
              type="text"
              defaultValue={filters.userEmail || ''}
              placeholder="Email χρήστη..."
              className="w-full pl-8 pr-3 py-2 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--text-muted)] focus:ring-2 focus:ring-[var(--brand)]/30 focus:border-[var(--brand)] outline-none"
            />
          </div>

          <input
            name="from"
            type="date"
            defaultValue={filters.from || ''}
            className="px-3 py-2 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:ring-2 focus:ring-[var(--brand)]/30 focus:border-[var(--brand)] outline-none"
          />

          <input
            name="to"
            type="date"
            defaultValue={filters.to || ''}
            className="px-3 py-2 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:ring-2 focus:ring-[var(--brand)]/30 focus:border-[var(--brand)] outline-none"
          />
        </div>
        <div className="flex gap-2 mt-3">
          <button type="submit" className="btn btn-primary text-sm px-4 py-1.5">
            Εφαρμογή Φίλτρων
          </button>
          <Link href="/admin/audit" className="btn btn-secondary text-sm px-4 py-1.5">
            Καθαρισμός
          </Link>
        </div>
      </form>

      {/* Table */}
      <div className="card overflow-hidden">
        {logs.data.length === 0 ? (
          <div className="p-16 text-center">
            <ShieldCheck className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3 opacity-40" />
            <p className="text-[var(--text-muted)] text-sm">Δεν βρέθηκαν καταχωρήσεις για τα επιλεγμένα φίλτρα.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface-hover)]">
                  <th className="text-left px-4 py-3 font-semibold text-[var(--text-secondary)] text-xs uppercase tracking-wider">Ημ/νία</th>
                  <th className="text-left px-4 py-3 font-semibold text-[var(--text-secondary)] text-xs uppercase tracking-wider">Ενέργεια</th>
                  <th className="text-left px-4 py-3 font-semibold text-[var(--text-secondary)] text-xs uppercase tracking-wider">Χρήστης</th>
                  <th className="text-left px-4 py-3 font-semibold text-[var(--text-secondary)] text-xs uppercase tracking-wider">Λεπτομέρεια</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {logs.data.map((log) => {
                  const style = getActionStyle(log.action)
                  return (
                    <tr key={log.id} className="hover:bg-[var(--surface-hover)] transition-colors group">
                      <td className="px-4 py-3 whitespace-nowrap text-[var(--text-muted)] font-mono text-xs">
                        {formatDate(log.createdAt)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${style.bg} ${style.text} ${style.border}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${style.dot} flex-shrink-0`} />
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-[var(--foreground)] font-medium text-xs">
                          {log.userEmail || log.userId?.slice(0, 8) + '...' || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[var(--text-secondary)] max-w-sm truncate text-xs" title={log.detail || undefined}>
                        {log.detail || <span className="text-[var(--text-muted)] italic">—</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {logs.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-[var(--text-muted)]">
            Σελίδα {logs.page} από {logs.pages} ({logs.total} εγγραφές)
          </p>
          <div className="flex items-center gap-1">
            {page > 1 && (
              <Link href={buildUrl(page - 1)} className="p-2 rounded-lg hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </Link>
            )}
            {Array.from({ length: Math.min(logs.pages, 7) }, (_, i) => {
              const p = i + 1
              return (
                <Link
                  key={p}
                  href={buildUrl(p)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                    p === page
                      ? 'bg-[var(--brand)] text-white'
                      : 'hover:bg-[var(--surface-hover)] text-[var(--text-secondary)]'
                  }`}
                >
                  {p}
                </Link>
              )
            })}
            {page < logs.pages && (
              <Link href={buildUrl(page + 1)} className="p-2 rounded-lg hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] transition-colors">
                <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
