'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { getCelebratingNamesForDate, normalizeGreekName, isNameday } from '@/lib/namedays'

export async function getUpcomingNamedays(daysAhead: number = 7) {
  const session = await getSession()
  const templeId = session?.templeId
  if (!templeId) return []

  // Fetch all active parishioners once
  const parishioners = await prisma.parishioner.findMany({
    where: { templeId, status: 'active' },
    select: { id: true, firstName: true, lastName: true, phone: true, mobile: true }
  })

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const results: {
    parishionerId: string
    fullName: string
    firstName: string
    phone: string | null
    celebrationDate: Date
    feastNames: string[]
    isToday: boolean
    daysUntil: number
  }[] = []

  // For each upcoming day, check each parishioner
  for (let i = 0; i < daysAhead; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() + i)

    const celebratingNames = getCelebratingNamesForDate(d)
    if (celebratingNames.length === 0) continue

    for (const p of parishioners) {
      const normName = normalizeGreekName(p.firstName)
      if (isNameday(p.firstName, d)) {
        // Avoid duplicates (same person, same date)
        const alreadyAdded = results.some(r => r.parishionerId === p.id && r.celebrationDate.getTime() === d.getTime())
        if (!alreadyAdded) {
          results.push({
            parishionerId: p.id,
            fullName: `${p.firstName} ${p.lastName}`,
            firstName: p.firstName,
            phone: p.mobile || p.phone || null,
            celebrationDate: d,
            feastNames: celebratingNames,
            isToday: i === 0,
            daysUntil: i,
          })
        }
      }
    }
  }

  results.sort((a, b) => a.celebrationDate.getTime() - b.celebrationDate.getTime())
  return results
}

// Legacy export for backward compat
export async function getNamedaysByDate(date: Date) {
  const names = getCelebratingNamesForDate(date)
  return names
}
