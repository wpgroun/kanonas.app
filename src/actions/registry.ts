'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

/**
 * Returns the "Member in Good Standing" Electoral Roll.
 * A member is considered eligible to vote if they have made at least one financial contribution
 * during the specified year.
 */
export async function getElectoralRoll(year: number) {
  const session = await getSession()
  const templeId = session?.templeId

  if (!templeId) {
    return []
  }

  const startDate = new Date(year, 0, 1) // Jan 1st of year
  const endDate = new Date(year, 11, 31, 23, 59, 59) // Dec 31st of year

  // Get active parishioners who have donations within the year
  const eligibleParishioners = await prisma.parishioner.findMany({
    where: {
      templeId,
      status: 'active',
      donations: {
        some: {
          date: {
            gte: startDate,
            lte: endDate
          }
        }
      }
    },
    include: {
      donations: {
        where: {
          date: {
            gte: startDate,
            lte: endDate
          }
        },
        select: {
          amount: true
        }
      }
    },
    orderBy: [
      { lastName: 'asc' },
      { firstName: 'asc' }
    ]
  })

  // Format the response for the UI
  return eligibleParishioners.map(p => {
    const totalContributed = p.donations.reduce((sum, d) => sum + d.amount, 0)
    
    return {
      id: p.id,
      firstName: p.firstName,
      lastName: p.lastName,
      phone: p.mobile || p.phone || '—',
      profession: p.profession || '—',
      registeredAt: p.createdAt,
      totalContributedThisYear: totalContributed
    }
  })
}
