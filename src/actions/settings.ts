'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { seedDummyTemple, TEMP_TEMPLE_ID } from './core'

export async function getTempleSettings() {
  await seedDummyTemple()
  try {
    const temple = await prisma.temple.findUnique({ where: { id: TEMP_TEMPLE_ID } })
    if (!temple || !temple.settings) return {}
    return JSON.parse(temple.settings)
  } catch (e) {
    return {}
  }
}

export async function saveTempleSettings(settingsObj: any) {
  try {
    await prisma.temple.update({
      where: { id: TEMP_TEMPLE_ID },
      data: { settings: JSON.stringify(settingsObj) }
    })
    revalidatePath('/admin/settings')
    revalidatePath('/admin/requests/[id]/print')
    return { success: true }
  } catch (e) {
    return { success: false }
  }
}

