'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

function toCSV(data: any[]): string {
  if (data.length === 0) return ''
  const keys = Object.keys(data[0])
  
  const csvRows = []
  // Header
  csvRows.push(keys.join(','))
  
  // Rows
  for (const row of data) {
    const values = keys.map(key => {
      let val = row[key]
      if (val === null || val === undefined) val = ''
      const escapeVal = String(val).replace(/"/g, '""')
      return `"${escapeVal}"`
    })
    csvRows.push(values.join(','))
  }
  
  // Add BOM for Greek Support in Excel
  return '\uFEFF' + csvRows.join('\n')
}

export async function exportParishionersCSV() {
  const session = await getSession()
  if (!session?.templeId) return { success: false, error: 'Μη έγκυρη συνεδρία' }

  const parishioners = await prisma.parishioner.findMany({
    where: { templeId: session.templeId },
    select: {
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      birthDate: true,
      address: true,
      familyStatus: true
    },
    orderBy: { lastName: 'asc' }
  })

  // Format data
  const formatted = parishioners.map(p => ({
    'Επώνυμο': p.lastName,
    'Όνομα': p.firstName,
    'Τηλέφωνο': p.phone,
    'Email': p.email,
    'Διεύθυνση': p.address,
    'Οικογενειακή Κατάσταση': p.familyStatus,
    'Ημ. Γέννησης': p.birthDate ? new Date(p.birthDate).toLocaleDateString('el-GR') : ''
  }))

  return { success: true, csv: toCSV(formatted), filename: `Parishioners_${new Date().toISOString().split('T')[0]}.csv` }
}

export async function exportFinancesCSV(type: 'donations' | 'expenses') {
  const session = await getSession()
  if (!session?.templeId || !session?.canViewFinances) {
    return { success: false, error: 'Δεν έχετε δικαίωμα προβολής οικονομικών' }
  }

  if (type === 'donations') {
    const records = await prisma.donation.findMany({
      where: { templeId: session.templeId },
      include: { parishioner: true },
      orderBy: { date: 'desc' }
    })
    
    const formatted = records.map(r => ({
      'Ημερομηνία': new Date(r.date).toLocaleDateString('el-GR'),
      'Ποσό': r.amount.toString(),
      'Αιτιολογία': r.purpose || '-',
      'Αριθμός Απόδειξης': r.receiptNumber || '-',
      'Ενορίτης / Δωρητής': r.parishioner ? `${r.parishioner.lastName} ${r.parishioner.firstName}` : 
                  (r.donorName || '-')
    }))

    return { success: true, csv: toCSV(formatted), filename: `Donations_${new Date().toISOString().split('T')[0]}.csv` }
  } else {
    const records = await prisma.expense.findMany({
      where: { templeId: session.templeId },
      include: { category: true },
      orderBy: { date: 'desc' }
    })
    
    const formatted = records.map(r => ({
      'Ημερομηνία': new Date(r.date).toLocaleDateString('el-GR'),
      'Ποσό': r.amount.toString(),
      'Αιτιολογία': r.purpose,
      'Κατηγορία': r.category ? r.category.name : '-',
      'Προμηθευτής': r.vendor || '-',
      'Αριθμός Απόδειξης': r.receiptNumber || '-'
    }))

    return { success: true, csv: toCSV(formatted), filename: `Expenses_${new Date().toISOString().split('T')[0]}.csv` }
  }
}

export async function exportAuditLogsCSV() {
  const session = await getSession()
  if (!session?.templeId) {
    return { success: false, error: 'Μη έγκυρη συνεδρία' }
  }

  const logs = await prisma.auditLog.findMany({
    where: { templeId: session.templeId },
    orderBy: { createdAt: 'desc' }
  })
  
  const formatted = logs.map((r: any) => ({
    'Ημερομηνία/Ώρα': new Date(r.createdAt).toLocaleString('el-GR'),
    'Email Χρήστη': r.userEmail || '-',
    'Ενέργεια': r.action,
    'Σύστημα': r.entityType || '-',
    'ID Δεδομένου': r.entityId || '-',
    'Περιγραφή': r.detail || '-',
    'IP Address': r.ipAddress || '-'
  }))

  return { success: true, csv: toCSV(formatted), filename: `Audit_Security_Logs_${new Date().toISOString().split('T')[0]}.csv` }
}
