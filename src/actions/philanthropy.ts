'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { seedDummyTemple, TEMP_TEMPLE_ID } from './core'

export async function getBeneficiaries() {
  await seedDummyTemple()
  try {
    return await prisma.beneficiary.findMany({
      where: { templeId: TEMP_TEMPLE_ID },
      orderBy: { createdAt: 'desc' },
      include: { parishioner: { select: { firstName: true, lastName: true } } }
    })
  } catch (e) {
    return []
  }
}

export async function createBeneficiary(data: {
  firstName: string
  lastName: string
  address?: string
  phone?: string
  portions: number
  parishionerId?: string
}) {
  await seedDummyTemple()
  try {
    await prisma.beneficiary.create({
      data: {
        templeId: TEMP_TEMPLE_ID,
        firstName: data.firstName,
        lastName: data.lastName,
        address: data.address || null,
        phone: data.phone || null,
        portions: data.portions || 1,
        parishionerId: data.parishionerId || null
      }
    })
    revalidatePath('/admin/philanthropy')
    if (data.parishionerId) revalidatePath(`/admin/parishioners/${data.parishionerId}`)
    return { success: true }
  } catch (e) {
    console.error(e)
    return { success: false, error: "Σφάλμα δημιουργίας" }
  }
}

export async function getParishionerBeneficiary(parishionerId: string) {
  try {
    return await prisma.beneficiary.findUnique({
      where: { parishionerId },
      include: { assistances: { orderBy: { dateGiven: 'desc' }, take: 20 } }
    })
  } catch (e) {
    return null
  }
}

export async function getPhilanthropyStats() {
  await seedDummyTemple()
  try {
    const total = await prisma.beneficiary.count({ where: { templeId: TEMP_TEMPLE_ID, status: 'active' } })
    const beneficiaries = await prisma.beneficiary.findMany({
      where: { templeId: TEMP_TEMPLE_ID, status: 'active' },
      select: { portions: true }
    })
    const portionsPerDay = beneficiaries.reduce((sum: number, b: any) => sum + b.portions, 0)
    const portions30Days = portionsPerDay * 30
    const cost30Days = portions30Days * 2.50
    return { activeBeneficiaries: total, portions30Days, cost30Days, monthGrowth: '+5%' }
  } catch (e) {
    return { activeBeneficiaries: 0, portions30Days: 0, cost30Days: 0, monthGrowth: '0%' }
  }
}

export async function getInventoryItems() {
  await seedDummyTemple()
  try {
    return await prisma.inventoryItem.findMany({
      where: { templeId: TEMP_TEMPLE_ID },
      orderBy: { name: 'asc' }
    })
  } catch (e) {
    return []
  }
}

