'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { seedDummyTemple, TEMP_TEMPLE_ID } from './core'

export async function getParishioners() {
  try {
    return await prisma.parishioner.findMany({
      where: { templeId: TEMP_TEMPLE_ID },
      orderBy: { createdAt: 'desc' }
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
  await seedDummyTemple()
  try {
    const p = await prisma.parishioner.create({
      data: {
        templeId: TEMP_TEMPLE_ID,
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
