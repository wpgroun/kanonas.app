'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { TEMP_TEMPLE_ID } from './core'

export async function getAllTemples() {
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
  try {
    // @ts-ignore
    const role = await prisma.role.create({
      data: { templeId: TEMP_TEMPLE_ID, name, ...permissions }
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
  try {
    // @ts-ignore
    await prisma.role.update({ where: { id: roleId }, data: permissions })
    revalidatePath('/admin/settings/users')
    return { success: true }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

