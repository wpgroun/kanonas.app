'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { seedDummyTemple, TEMP_TEMPLE_ID } from './core'

export async function getDiptychs() {
  await seedDummyTemple()
  try {
    return await prisma.diptych.findMany({
      where: { templeId: TEMP_TEMPLE_ID, isActive: true },
      orderBy: { createdAt: 'asc' }
    })
  } catch (e) {
    return []
  }
}

export async function addDiptychNames(type: string, namesStr: string) {
  await seedDummyTemple()
  try {
    const rawNames = namesStr.split(/[\n,]+/).map(s => s.trim()).filter(s => s.length >= 2)
    if (!rawNames.length) return { success: false, error: 'Δεν βρέθηκαν έγκυρα ονόματα' }
    await prisma.diptych.createMany({
      data: rawNames.map(name => ({ templeId: TEMP_TEMPLE_ID, type, name, isActive: true, submittedBy: 'Admin' }))
    })
    revalidatePath('/admin/diptychs')
    return { success: true, count: rawNames.length }
  } catch (e) {
    console.error(e)
    return { success: false, error: 'Αποτυχία προσθήκης ονομάτων' }
  }
}

export async function toggleDiptychActive(id: string, newStatus: boolean) {
  try {
    await prisma.diptych.update({ where: { id }, data: { isActive: newStatus } })
    revalidatePath('/admin/diptychs')
    return { success: true }
  } catch (e) {
    return { success: false }
  }
}

export async function editDiptychName(id: string, newName: string) {
  try {
    await prisma.diptych.update({ where: { id }, data: { name: newName } })
    revalidatePath('/admin/diptychs')
    return { success: true }
  } catch (e) {
    return { success: false }
  }
}

export async function deleteDiptychName(id: string) {
  try {
    await prisma.diptych.delete({ where: { id } })
    revalidatePath('/admin/diptychs')
    return { success: true }
  } catch (e) {
    return { success: false }
  }
}

export async function clearDiptychs(type: string) {
  try {
    await prisma.diptych.updateMany({
      where: { templeId: TEMP_TEMPLE_ID, type, isActive: true },
      data: { isActive: false }
    })
    revalidatePath('/admin/diptychs')
    return { success: true }
  } catch (e) {
    return { success: false }
  }
}
