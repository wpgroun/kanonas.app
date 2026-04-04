'use server'

import { prisma } from '@/lib/prisma'

export async function getSuperAdminStats() {
  const [
    totalTemples,
    totalUsers,
    totalParishioners,
    recentTemples,
  ] = await Promise.all([
    prisma.temple.count(),
    prisma.user.count(),
    prisma.parishioner.count(),
    prisma.temple.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        metropolis: { select: { name: true } },
        _count: { select: { parishioners: true, users: true } },
      },
    }),
  ])

  return {
    totalTemples,
    totalUsers,
    totalParishioners,
    recentTemples: recentTemples.map((t: any) => ({
      id: t.id,
      name: t.name,
      city: t.city,
      metropolis: t.metropolis?.name || '—',
      parishioners: t._count.parishioners,
      users: t._count.users,
      createdAt: t.createdAt.toISOString(),
    })),
  }
}
