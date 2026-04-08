'use server'

import { prisma } from '@/lib/prisma'
import { requireAuth, requireSuperAdmin } from '@/lib/requireAuth'
import { getCurrentTempleId } from './core'

// ─── CSV Export: Parishioners ──────────────────────────────────────────────────

export async function exportParishionersCSV() {
  await requireAuth()
  const templeId = await getCurrentTempleId()

  const parishioners = await prisma.parishioner.findMany({
    where: { templeId },
    orderBy: { lastName: 'asc' },
    select: {
      firstName: true, lastName: true, fathersName: true, email: true,
      phone: true, mobile: true, address: true, city: true,
      birthDate: true, afm: true, idNumber: true, profession: true,
      familyStatus: true, status: true
    }
  })

  const headers = ['Επώνυμο', 'Όνομα', 'Πατρώνυμο', 'Email', 'Τηλέφωνο', 'Κινητό', 'Διεύθυνση', 'Πόλη', 'Ημ.Γέννησης', 'ΑΦΜ', 'ΑΔΤ', 'Επάγγελμα', 'Οικ.Κατάσταση', 'Κατάσταση']
  const rows = parishioners.map(p => [
    p.lastName, p.firstName, p.fathersName || '', p.email || '',
    p.phone || '', p.mobile || '', p.address || '', p.city || '',
    p.birthDate ? new Date(p.birthDate).toLocaleDateString('el-GR') : '',
    p.afm || '', p.idNumber || '', p.profession || '',
    p.familyStatus || '', p.status
  ])

  return buildCSV(headers, rows)
}

// ─── CSV Export: Donations/Income ──────────────────────────────────────────────

export async function exportDonationsCSV(year?: number) {
  await requireAuth()
  const templeId = await getCurrentTempleId()

  const currentYear = year || new Date().getFullYear()
  const start = new Date(currentYear, 0, 1)
  const end = new Date(currentYear, 11, 31, 23, 59, 59)

  const donations = await prisma.donation.findMany({
    where: { templeId, date: { gte: start, lte: end } },
    orderBy: { date: 'desc' },
    include: { parishioner: { select: { firstName: true, lastName: true } } }
  })

  const headers = ['Ημερομηνία', 'Σκοπός', 'Ποσό (€)', 'Ονοματεπώνυμο', 'Αρ. Απόδειξης']
  const rows = donations.map(d => [
    new Date(d.date).toLocaleDateString('el-GR'),
    d.purpose || '', d.amount.toString(),
    d.parishioner ? `${d.parishioner.lastName} ${d.parishioner.firstName}` : (d.donorName || ''),
    d.receiptNumber || ''
  ])

  return buildCSV(headers, rows)
}

// ─── CSV Export: Expenses ─────────────────────────────────────────────────────

export async function exportExpensesCSV(year?: number) {
  await requireAuth()
  const templeId = await getCurrentTempleId()

  const currentYear = year || new Date().getFullYear()
  const start = new Date(currentYear, 0, 1)
  const end = new Date(currentYear, 11, 31, 23, 59, 59)

  const expenses = await prisma.expense.findMany({
    where: { templeId, date: { gte: start, lte: end } },
    orderBy: { date: 'desc' }
  })

  const headers = ['Ημερομηνία', 'Κατηγορία', 'Ποσό (€)', 'Σκοπός', 'Προμηθευτής']
  const rows = expenses.map(e => [
    new Date(e.date).toLocaleDateString('el-GR'),
    e.categoryId || '', e.amount.toString(),
    e.purpose || '', e.vendor || ''
  ])

  return buildCSV(headers, rows)
}

// ─── CSV Export: Sacraments ───────────────────────────────────────────────────

export async function exportSacramentsCSV() {
  await requireAuth()
  const templeId = await getCurrentTempleId()

  const sacraments = await prisma.sacrament.findMany({
    where: { templeId },
    orderBy: { sacramentDate: 'desc' },
    include: { parishioner: { select: { firstName: true, lastName: true } } }
  })

  const headers = ['Ημερομηνία', 'Τύπος', 'Ονοματεπώνυμο', 'Σημειώσεις']
  const rows = sacraments.map(s => [
    s.sacramentDate ? new Date(s.sacramentDate).toLocaleDateString('el-GR') : '',
    s.sacramentType, 
    s.parishioner ? `${s.parishioner.lastName} ${s.parishioner.firstName}` : '',
    s.notes || ''
  ])

  return buildCSV(headers, rows)
}

// ─── SUPER ADMIN: Export all temples ──────────────────────────────────────────

export async function exportAllTemplesCSV() {
  await requireSuperAdmin()

  const temples = await prisma.temple.findMany({
    include: {
      metropolis: { select: { name: true } },
      _count: { select: { parishioners: true, users: true } },
      subscriptions: { where: { status: 'active' }, include: { plan: true } }
    },
    orderBy: { name: 'asc' }
  })

  const headers = ['Ναός', 'Μητρόπολη', 'Πόλη', 'Email', 'Τηλέφωνο', 'ΑΦΜ', 'Πλάνο', 'Κατάσταση', 'Ενορίτες', 'Χρήστες', 'Εγγραφή']
  const rows = temples.map(t => {
    const sub = t.subscriptions[0]
    return [
      t.name, t.metropolis?.name || '', t.city || '', t.email || '',
      t.phoneNumber || '', t.taxId || '',
      sub?.plan?.name || 'Free', sub ? sub.status : 'inactive',
      t._count.parishioners.toString(), t._count.users.toString(),
      new Date(t.createdAt).toLocaleDateString('el-GR')
    ]
  })

  return buildCSV(headers, rows)
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function buildCSV(headers: string[], rows: string[][]): string {
  const BOM = '\uFEFF' // UTF-8 BOM for Excel Greek support
  const escape = (s: string) => `"${s.replace(/"/g, '""')}"`
  const headerLine = headers.map(escape).join(';')
  const dataLines = rows.map(row => row.map(escape).join(';'))
  return BOM + [headerLine, ...dataLines].join('\n')
}
