import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function UsersPage() {
 const session = await getSession();
 if (!session || !session.templeId) redirect('/login');
 const templeId = session.templeId;
 
 // @ts-ignore
 const users = await prisma.userTemple.findMany({
 where: { templeId },
 include: {
 user: true,
 role: true
 }
 });

 // @ts-ignore
 const roles = await prisma.role.findMany({
 where: { templeId }
 });

 return (
 <div className="animate-in">
 <header className="page-header"style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
 <div>
 <h1 className="page-title"style={{ fontSize: '2.2rem', color: 'var(--byz-burgundy)', marginBottom: '0.5rem' }}>Χρήστες & Ρόλοι</h1>
 <p className="text-muted">Διαχείριση πρόσβασης στελεχών (RBAC)</p>
 </div>
 <button className="btn-primary">
 <span>➕</span> Νέος Χρήστης
 </button>
 </header>

 <div className="glass-panel">
 <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
 <thead style={{ borderBottom: '2px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
 <tr>
 <th style={{ padding: '1rem', fontWeight: 600 }}>ΣΤΕΛΕΧΟΣ</th>
 <th style={{ padding: '1rem', fontWeight: 600 }}>ΡΟΛΟΣ</th>
 <th style={{ padding: '1rem', fontWeight: 600 }}>ΠΡΟΣΒΑΣΗ ΣΕ ΟΙΚΟΝΟΜΙΚΑ</th>
 <th style={{ padding: '1rem', fontWeight: 600 }}>ΕΝΑΡΞΗ</th>
 <th style={{ padding: '1rem', fontWeight: 600 }}>ΕΝΕΡΓΕΙΕΣ</th>
 </tr>
 </thead>
 <tbody>
 {users.map((ut: any) => (
 <tr key={ut.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
 <td style={{ padding: '1rem' }}>
 <div style={{ fontWeight: 600 }}>{ut.user.firstName} {ut.user.lastName}</div>
 <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{ut.user.email}</div>
 </td>
 <td style={{ padding: '1rem' }}>
 <span style={{ 
 background: ut.isHeadPriest ? 'var(--byz-burgundy)' : 'rgba(195, 161, 101, 0.2)', 
 color: ut.isHeadPriest ? '#fff' : 'var(--byz-burgundy)', 
 padding: '0.3rem 0.8rem', 
 borderRadius: '20px', 
 fontSize: '0.85rem',
 fontWeight: 600 
 }}>
 {ut.isHeadPriest ? 'Προϊστάμενος' : ut.role?.name || 'Απλό Μέλος'}
 </span>
 </td>
 <td style={{ padding: '1rem', color: (ut.role?.canViewFinances || ut.isHeadPriest) ? '#059669' : '#dc2626' }}>
 {(ut.role?.canViewFinances || ut.isHeadPriest) ? '✓ Επιτρέπεται' : '✕ Κλειδωμένο'}
 </td>
 <td style={{ padding: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
 {new Date(ut.createdAt).toLocaleDateString('el-GR')}
 </td>
 <td style={{ padding: '1rem' }}>
 <button className="btn-secondary"style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>⚙️ Επεξεργασία</button>
 </td>
 </tr>
))}
 </tbody>
 </table>
 </div>

 <div style={{ marginTop: '3rem' }}>
 <h2 style={{ fontSize: '1.4rem', color: 'var(--text-main)', marginBottom: '1.5rem' }}>Διαθέσιμοι Ρόλοι (Επίπεδα Πρόσβασης)</h2>
 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
 {roles.map((r: any) => (
 <div key={r.id} className="glass-panel"style={{ padding: '1.5rem' }}>
 <h3 style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.8rem', marginBottom: '1rem', color: 'var(--byz-burgundy)' }}>
 {r.name}
 </h3>
 <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
 <li>Οικονομικά: {r.canViewFinances ? '🟢 Ναι' : '🔴 Όχι'}</li>
 <li>Μυστήρια: {r.canManageRequests ? '🟢 Ναι' : '🔴 Όχι'}</li>
 <li>Πρωτόκολλο: {r.canManageRegistry ? '🟢 Ναι' : '🔴 Όχι'}</li>
 <li>Περιουσιακά: {r.canManageAssets ? '🟢 Ναι' : '🔴 Όχι'}</li>
 </ul>
 </div>
))}
 </div>
 </div>
 </div>
)
}

