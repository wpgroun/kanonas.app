'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getCurrentTempleId } from './core'
import { requireAuth, requireSuperAdmin } from '@/lib/requireAuth'

export async function getAllTemples() {
  await requireSuperAdmin()
  return prisma.temple.findMany({
    include: {
      _count: { select: { parishioners: true, tokens: true } },
      donations: { select: { amount: true } }
    },
    orderBy: { name: 'asc' }
  })
}

export async function createRole(name: string, permissions: {
  canViewFinances?: boolean
  canEditFinances?: boolean
  canManageRequests?: boolean
  canManageRegistry?: boolean
  canManageSchedule?: boolean
  canManageAssets?: boolean
}) {
  await requireAuth()
  const templeId = await getCurrentTempleId()
  try {
    const role = await prisma.role.create({
      data: { templeId, name, ...permissions }
    })
    revalidatePath('/admin/settings/users')
    return { success: true, role }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

export async function updateRolePermissions(roleId: string, permissions: {
  canViewFinances?: boolean
  canEditFinances?: boolean
  canManageRequests?: boolean
  canManageRegistry?: boolean
  canManageSchedule?: boolean
  canManageAssets?: boolean
}) {
  await requireAuth()
  try {
    await prisma.role.update({ where: { id: roleId }, data: permissions })
    revalidatePath('/admin/settings/users')
    return { success: true }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}
