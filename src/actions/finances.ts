'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { seedDummyTemple, TEMP_TEMPLE_ID } from './core'

export async function createDonation(data: {
  amount: number
  purpose: string
  receiptNumber?: string
  parishionerId?: string
}) {
  await seedDummyTemple()
  try {
    const donation = await prisma.donation.create({
      data: {
        templeId: TEMP_TEMPLE_ID,
        amount: data.amount,
        purpose: data.purpose,
        receiptNumber: data.receiptNumber,
        parishionerId: data.parishionerId || null,
        donorName: data.parishionerId ? undefined : 'Ανώνυμο / Γενικό Έσοδο',
      }
    })
    revalidatePath('/admin/finances')
    if (data.parishionerId) revalidatePath(`/admin/parishioners/${data.parishionerId}`)
    return { success: true, donation }
  } catch (error) {
    console.error("Σφάλμα δημιουργίας εσόδου:", error)
    return { success: false, error: "Αποτυχία καταχώρησης εσόδου." }
  }
}

export async function getDonations() {
  await seedDummyTemple()
  try {
    return await prisma.donation.findMany({
      where: { templeId: TEMP_TEMPLE_ID },
      orderBy: { date: 'desc' },
      include: {
        parishioner: { select: { firstName: true, lastName: true } }
      }
    })
  } catch (error) {
    return []
  }
}

export async function getDonationStats(year?: number) {
  await seedDummyTemple()
  const currentYear = year || new Date().getFullYear()
  const prevYear = currentYear - 1

  const currentStart = new Date(`${currentYear}-01-01T00:00:00`)
  const currentEnd = new Date(`${currentYear}-12-31T23:59:59`)
  const prevStart = new Date(`${prevYear}-01-01T00:00:00`)
  const prevEnd = new Date(`${prevYear}-12-31T23:59:59`)

  const [currentDons, prevDons] = await Promise.all([
    prisma.donation.findMany({ where: { templeId: TEMP_TEMPLE_ID, date: { gte: currentStart, lte: currentEnd } } }),
    prisma.donation.findMany({ where: { templeId: TEMP_TEMPLE_ID, date: { gte: prevStart, lte: prevEnd } } }),
  ])

  const groupByMonth = (dons: any[]) => {
    const months: Record<number, { total: number; count: number }> = {}
    dons.forEach(d => {
      const m = new Date(d.date).getMonth() + 1
      if (!months[m]) months[m] = { total: 0, count: 0 }
      months[m].total += d.amount
      months[m].count++
    })
    const monthNames = ['','Ιαν','Φεβ','Μαρ','Απρ','Μαΐ','Ιουν','Ιουλ','Αυγ','Σεπ','Οκτ','Νοε','Δεκ']
    return Object.entries(months).map(([m, v]) => ({
      month: parseInt(m),
      monthName: monthNames[parseInt(m)],
      ...v
    })).sort((a, b) => a.month - b.month)
  }

  const catMap: Record<string, number> = {}
  currentDons.forEach(d => {
    const key = d.purpose || 'Αδιευκρίνιστη'
    catMap[key] = (catMap[key] || 0) + d.amount
  })
  const byCategory = Object.entries(catMap).map(([purpose, total]) => ({ purpose, total }))

  return {
    currentYear: groupByMonth(currentDons),
    prevYear: groupByMonth(prevDons),
    byCategory,
    totalCurrentYear: currentDons.reduce((s, d) => s + d.amount, 0),
    totalPrevYear: prevDons.reduce((s, d) => s + d.amount, 0),
    year: currentYear,
  }
}

// addExpense is used in LedgerClient
export async function addExpense(data: {
  purpose: string
  amount: number
  category?: string
  vendor?: string
  receiptNumber?: string
  date?: string
}) {
  await seedDummyTemple()
  try {
    await prisma.expense.create({
      data: {
        templeId: TEMP_TEMPLE_ID,
        purpose: data.purpose,
        amount: data.amount,
        category: data.category || null,
        vendor: data.vendor || null,
        receiptNumber: data.receiptNumber || null,
        date: data.date ? new Date(data.date) : new Date(),
      }
    })
    revalidatePath('/admin/finances')
    revalidatePath('/admin/finances/ledger')
    return { success: true }
  } catch (e) {
    console.error(e)
    return { success: false }
  }
}
