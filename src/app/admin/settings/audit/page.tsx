import { getAuditLogs } from '@/lib/audit'

export const metadata = {
 title: 'Ιστορικό Ενεργειών — Κανόνας',
}

const actionLabels: Record<string, string> = {
 CREATE_PARISHIONER: 'Δημιουργία Ενορίτη',
 UPDATE_PARISHIONER: 'Ενημέρωση Ενορίτη',
 DELETE_PARISHIONER: 'Διαγραφή Ενορίτη',
 CREATE_TOKEN: 'Νέο Αίτημα Μυστηρίου',
 GENERATE_DOCS: 'Παραγωγή Εγγράφων',
 CREATE_DONATION: 'Καταχώρηση Δωρεάς',
 ADD_EXPENSE: 'Καταχώρηση Εξόδου',
 ADD_PROTOCOL: 'Νέο Πρωτόκολλο',
 IMPORT_PARISHIONERS: 'Εισαγωγή Ενοριτών (CSV)',
 LOGIN: 'Σύνδεση',
 LOGOUT: 'Αποσύνδεση',
 UPDATE_SETTINGS: 'Αλλαγή Ρυθμίσεων',
}

const actionColors: Record<string, string> = {
 CREATE_PARISHIONER: 'badge-success',
 UPDATE_PARISHIONER: 'badge-info',
 DELETE_PARISHIONER: 'badge-danger',
 CREATE_TOKEN: 'badge-warning',
 GENERATE_DOCS: 'badge-info',
 CREATE_DONATION: 'badge-success',
 ADD_EXPENSE: 'badge-warning',
 LOGIN: 'badge-success',
 LOGOUT: 'badge-info',
}

export default async function AuditLogPage() {
 const logs = await getAuditLogs(1, 100)

 return (
 <div className="space-y-6">
 <div>
 <h1 className="text-xl font-bold text-[var(--foreground)]">Ιστορικό Ενεργειών</h1>
 <p className="text-sm text-[var(--text-muted)] mt-1">
 Πλήρες αρχείο όλων των ενεργειών που πραγματοποιήθηκαν στο σύστημα.
 </p>
 </div>

 <div className="card overflow-hidden">
 {logs.length === 0 ? (
 <div className="p-12 text-center text-[var(--text-muted)]">
 <p className="text-sm">Δεν υπάρχουν εγγραφές ακόμα.</p>
 </div>
) : (
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-[var(--border)] bg-[var(--surface-hover)]">
 <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-muted)]">Ημερομηνία</th>
 <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-muted)]">Χρήστης</th>
 <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-muted)]">Ενέργεια</th>
 <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-muted)]">Αντικείμενο</th>
 <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-muted)]">Λεπτομέρεια</th>
 </tr>
 </thead>
 <tbody>
 {logs.map((log) => (
 <tr key={log.id} className="border-b border-[var(--border)] hover:bg-[var(--surface-hover)]">
 <td className="px-4 py-3 text-[var(--text-muted)] whitespace-nowrap font-mono text-xs">
 {new Date(log.createdAt).toLocaleString('el-GR')}
 </td>
 <td className="px-4 py-3 text-[var(--text-secondary)]">
 {log.userEmail || log.userId || '—'}
 </td>
 <td className="px-4 py-3">
 <span className={`badge ${actionColors[log.action] || 'badge-info'}`}>
 {actionLabels[log.action] || log.action}
 </span>
 </td>
 <td className="px-4 py-3 text-[var(--text-muted)] text-xs">
 {log.entityType ? `${log.entityType}` : '—'}
 {log.entityId ? ` #${log.entityId.slice(0, 8)}` : ''}
 </td>
 <td className="px-4 py-3 text-[var(--text-secondary)] max-w-xs truncate">
 {log.detail || '—'}
 </td>
 </tr>
))}
 </tbody>
 </table>
 </div>
)}
 </div>
 </div>
)
}
