'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getCurrentTempleId } from './core'
import { requireAuth } from '@/lib/requireAuth'

export async function getParishioners(page = 1, pageSize = 100) {
  const templeId = await getCurrentTempleId()
  try {
    return await prisma.parishioner.findMany({
      where: { templeId },
      orderBy: { lastName: 'asc' },
      take: pageSize,
      skip: (page - 1) * pageSize,
    })
  } catch (e) {
    return []
  }
}

export async function createParishioner(formData: {
  firstName: string
  lastName: string
  email?: string
  phone?: string
  fathersName?: string
  address?: string
  city?: string
  afm?: string
}) {
  await requireAuth()
  const templeId = await getCurrentTempleId()
  try {
    const p = await prisma.parishioner.create({
      data: {
        templeId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email || null,
        phone: formData.phone || null,
        fathersName: formData.fathersName || null,
        address: formData.address || null,
        city: formData.city || null,
        afm: formData.afm || null,
        status: "active"
      }
    })
    revalidatePath('/admin/parishioners')
    return { success: true, id: p.id }
  } catch (error) {
    console.error("Σφάλμα δημιουργίας ενορίτη:", error)
    return { success: false, error: "Αποτυχία ολοκλήρωσης" }
  }
}

export async function getParishionerDetails(id: string) {
  try {
    return await prisma.parishioner.findUnique({
      where: { id },
      include: {
        donations: { orderBy: { date: 'desc' } },
        ceremonyPersons: { include: { token: true } }
      }
    })
  } catch (e) {
    return null
  }
}

export async function updateParishionerDetails(id: string, data: {
  firstName: string
  lastName: string
  email?: string
  phone?: string
  address?: string
  city?: string
  afm?: string
  idNumber?: string
}) {
  await requireAuth()
  try {
    await prisma.parishioner.update({
      where: { id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
        city: data.city || null,
        afm: data.afm || null,
        idNumber: data.idNumber || null,
      }
    })
    revalidatePath(`/admin/parishioners/${id}`)
    revalidatePath('/admin/parishioners')
    return { success: true }
  } catch (error) {
    console.error("Σφάλμα ενημέρωσης ενορίτη:", error)
    return { success: false, error: "Αποτυχία ενημέρωσης" }
  }
}

export async function updateParishionerRoles(id: string, newRolesStr: string) {
  await requireAuth()
  try {
    await prisma.parishioner.update({
      where: { id },
      data: { roles: newRolesStr }
    })
    revalidatePath(`/admin/parishioners/${id}`)
    return { success: true }
  } catch (error) {
    console.error("Σφάλμα ενημέρωσης ρόλων:", error)
    return { success: false, error: "Αποτυχία ενημέρωσης" }
  }
}
