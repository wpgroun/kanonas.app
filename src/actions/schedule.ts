'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { TEMP_TEMPLE_ID } from '@/lib/constants'
import { seedDummyTemple } from './core'

export async function getServiceSchedules() {
  await seedDummyTemple()
  try {
    return await prisma.serviceSchedule.findMany({
      where: { templeId: TEMP_TEMPLE_ID },
      orderBy: { date: 'asc' }
    })
  } catch (e) {
    return []
  }
}

export async function addServiceSchedule(data: {
  date: string
  title: string
  description?: string
  isMajor?: boolean
}) {
  await seedDummyTemple()
  try {
    await prisma.serviceSchedule.create({
      data: {
        templeId: TEMP_TEMPLE_ID,
        date: new Date(data.date),
        title: data.title,
        description: data.description || null,
        isMajor: data.isMajor || false
      }
    })
    revalidatePath('/admin/schedule')
    revalidatePath('/schedule')
    return { success: true }
  } catch (e) {
    return { success: false }
  }
}

export async function deleteServiceSchedule(id: string) {
  try {
    await prisma.serviceSchedule.delete({ where: { id } })
    revalidatePath('/admin/schedule')
    revalidatePath('/schedule')
    return { success: true }
  } catch (e) {
    return { success: false }
  }
}

