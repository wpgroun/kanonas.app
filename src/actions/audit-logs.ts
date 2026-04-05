'use server'

import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/requireAuth'
import { getCurrentTempleId } from '@/actions/core'

export interface AuditLogFilters {
  action?: string
  userEmail?: string
  from?: string   // ISO date string
  to?: string     // ISO date string
}

export interface AuditLogResult {
  data: Array<{
    id: string
    action: string
    detail: string | null
    userEmail: string | null
    userId: string | null
    entityType: string | null
    entityId: string | null
    createdAt: Date
  }>
  total: number
  pages: number
  page: number
}

const PAGE_SIZE = 50

/**
 * Fetch paginated audit logs for the current temple.
 * Requires head priest or super admin access.
 */
export async function getAuditLogs(
  page: number = 1,
  filters: AuditLogFilters = {}
): Promise<AuditLogResult> {
  const session = await requireAuth()
  if (!session.isHeadPriest && !session.isSuperAdmin) {
    throw new Error('Δεν έχετε δικαίωμα πρόσβασης στο Ιστορικό Ενεργειών.')
  }

  const templeId = await getCurrentTempleId()
  const skip = (page - 1) * PAGE_SIZE

  const where = {
    templeId,
    ...(filters.action ? { action: { contains: filters.action, mode: 'insensitive' as const } } : {}),
    ...(filters.userEmail ? { userEmail: { contains: filters.userEmail, mode: 'insensitive' as const } } : {}),
    ...(filters.from || filters.to ? {
      createdAt: {
        ...(filters.from ? { gte: new Date(filters.from) } : {}),
        ...(filters.to ? { lte: new Date(filters.to + 'T23:59:59') } : {}),
      }
    } : {})
  }

  const [data, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: PAGE_SIZE,
      select: {
        id: true,
        action: true,
        detail: true,
        userEmail: true,
        userId: true,
        entityType: true,
        entityId: true,
        createdAt: true,
      }
    }),
    prisma.auditLog.count({ where })
  ])

  return {
    data,
    total,
    pages: Math.ceil(total / PAGE_SIZE),
    page,
  }
}

/** Get distinct action types for the filter dropdown */
export async function getAuditLogActionTypes(): Promise<string[]> {
  const session = await requireAuth()
  if (!session.isHeadPriest && !session.isSuperAdmin) return []

  const templeId = await getCurrentTempleId()
  const results = await prisma.auditLog.findMany({
    where: { templeId },
    select: { action: true },
    distinct: ['action'],
    orderBy: { action: 'asc' },
  })
  return results.map(r => r.action)
}
