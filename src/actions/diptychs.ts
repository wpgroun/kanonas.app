'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getCurrentTempleId } from './core'
import { requireAuth } from '@/lib/requireAuth'

export async function getDiptychs() {
  const templeId = await getCurrentTempleId()
  try {
    return await prisma.diptych.findMany({
      where: { templeId, isActive: true },
      orderBy: { createdAt: 'asc' }
    })
  } catch (e) {
    return []
  }
}

export async function addDiptychNames(type: string, namesStr: string) {
  await requireAuth()
  const templeId = await getCurrentTempleId()
  try {
    const rawNames = namesStr.split(/[\n,]+/).map(s => s.trim()).filter(s => s.length >= 2)
    if (!rawNames.length) return { success: false, error: 'Δεν βρέθηκαν έγκυρα ονόματα' }
    await prisma.diptych.createMany({
      data: rawNames.map(name => ({ templeId, type, name, isActive: true, submittedBy: 'Admin' }))
    })
    revalidatePath('/admin/diptychs')
    return { success: true, count: rawNames.length }
  } catch (e) {
    console.error(e)
    return { success: false, error: 'Αποτυχία προσθήκης ονομάτων' }
  }
}

export async function toggleDiptychActive(id: string, newStatus: boolean) {
  await requireAuth()
  try {
    await prisma.diptych.update({ where: { id }, data: { isActive: newStatus } })
    revalidatePath('/admin/diptychs')
    return { success: true }
  } catch (e) {
    return { success: false }
  }
}

export async function editDiptychName(id: string, newName: string) {
  await requireAuth()
  try {
    await prisma.diptych.update({ where: { id }, data: { name: newName } })
    revalidatePath('/admin/diptychs')
    return { success: true }
  } catch (e) {
    return { success: false }
  }
}

export async function deleteDiptychName(id: string) {
  await requireAuth()
  try {
    await prisma.diptych.delete({ where: { id } })
    revalidatePath('/admin/diptychs')
    return { success: true }
  } catch (e) {
    return { success: false }
  }
}

export async function clearDiptychs(type: string) {
  await requireAuth()
  const templeId = await getCurrentTempleId()
  try {
    await prisma.diptych.updateMany({
      where: { templeId, type, isActive: true },
      data: { isActive: false }
    })
    revalidatePath('/admin/diptychs')
    return { success: true }
  } catch (e) {
    return { success: false }
  }
}
