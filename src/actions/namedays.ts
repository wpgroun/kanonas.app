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
    date: string
    names: string[]
    isToday: boolean
    daysUntil: number
    parishioners: {
      id: string
      fullName: string
      firstName: string
      phone: string | null
    }[]
  }[] = []

  for (let i = 0; i < daysAhead; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() + i)

    const celebratingNames = getCelebratingNamesForDate(d)
    if (celebratingNames.length === 0) continue

    const matchingParishioners: {
      id: string
      fullName: string
      firstName: string
      phone: string | null
    }[] = []

    for (const p of parishioners) {
      if (isNameday(p.firstName, d)) {
        matchingParishioners.push({
          id: p.id,
          fullName: `${p.firstName} ${p.lastName}`,
          firstName: p.firstName,
          phone: p.mobile || p.phone || null,
        })
      }
    }

    results.push({
      date: d.toISOString(),
      names: celebratingNames,
      isToday: i === 0,
      daysUntil: i,
      parishioners: matchingParishioners,
    })
  }

  return results
}

// Legacy export for backward compat
export async function getNamedaysByDate(date: Date) {
  const names = getCelebratingNamesForDate(date)
  return names
}
