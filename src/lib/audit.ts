'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

/**
 * Log an admin action to the AuditLog table.
 * Call this inside any mutating server action you want tracked.
 * Silently ignores errors — the audit log should never break the main flow.
 */
export async function logAction(opts: {
  action: string
  entityType?: string
  entityId?: string
  detail?: string
}) {
  try {
    const session = await getSession()
    if (!session) return

    await prisma.auditLog.create({
      data: {
        templeId: session.templeId as string,
        userId: session.userId as string,
        userEmail: (session as any).email ?? null,
        action: opts.action,
        entityType: opts.entityType ?? null,
        entityId: opts.entityId ?? null,
        detail: opts.detail ?? null,
      }
    })
  } catch {
    // Audit logging failures are always silent — never crash the main request
  }
}

/**
 * Retrieve audit logs for the current temple.
 * Paginated — returns the most recent entries first.
 */
export async function getAuditLogs(page = 1, pageSize = 50) {
  try {
    const session = await getSession()
    if (!session) return []

    return await prisma.auditLog.findMany({
      where: { templeId: session.templeId as string },
      orderBy: { createdAt: 'desc' },
      take: pageSize,
      skip: (page - 1) * pageSize,
    })
  } catch {
    return []
  }
}
