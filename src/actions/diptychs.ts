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

export async function submitPrayerRequest(data: {
  templeSlug: string
  submitterName?: string
  submitterEmail?: string
  type: string
  livingNames?: string
  fallenNames?: string
}) {
  try {
    const temple = await prisma.temple.findUnique({ where: { slug: data.templeSlug } })
    if (!temple) return { success: false, error: 'Ναός δεν βρέθηκε.' }

    await prisma.prayerRequest.create({
      data: {
        templeId: temple.id,
        submitterName: data.submitterName,
        submitterEmail: data.submitterEmail,
        type: data.type,
        livingNames: data.livingNames,
        fallenNames: data.fallenNames,
        status: 'pending'
      }
    })
    return { success: true }
  } catch(e) {
    console.error(e)
    return { success: false, error: 'Σφάλμα κατά την υποβολή.' }
  }
}

export async function getPendingPrayerRequests() {
  await requireAuth()
  const templeId = await getCurrentTempleId()
  try {
    return await prisma.prayerRequest.findMany({
      where: { templeId, status: 'pending' },
      orderBy: { createdAt: 'desc' }
    })
  } catch (e) {
    return []
  }
}

export async function approvePrayerRequest(requestId: string) {
  await requireAuth()
  const templeId = await getCurrentTempleId()
  try {
    const pr = await prisma.prayerRequest.findUnique({ where: { id: requestId } })
    if (!pr || pr.templeId !== templeId) return { success: false }

    const performInsertion = async (rawString: string, reqType: string) => {
      const names = rawString.split(/[\n,]+/).map(s => s.trim()).filter(s => s.length >= 2)
      if (names.length) {
        await prisma.diptych.createMany({
          data: names.map(name => ({ templeId, type: reqType, name, isActive: true, submittedBy: pr.submitterName || 'Ηλεκτρονική Αποστολή' }))
        })
      }
    }

    if (pr.livingNames) await performInsertion(pr.livingNames, 'ygeias')
    if (pr.fallenNames) await performInsertion(pr.fallenNames, 'anapauseos')

    await prisma.prayerRequest.update({
      where: { id: requestId },
      data: { status: 'read_at_altar' }
    })

    revalidatePath('/admin/diptychs')
    return { success: true }
  } catch (e) {
    console.error(e)
    return { success: false }
  }
}
