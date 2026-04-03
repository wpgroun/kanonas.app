'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { seedDummyTemple, TEMP_TEMPLE_ID } from './core'

export async function getDocTemplates(docType?: string) {
  try {
    return await prisma.docTemplate.findMany({
      where: {
        templeId: TEMP_TEMPLE_ID,
        ...(docType ? { docType } : {})
      },
      orderBy: { createdAt: 'desc' }
    })
  } catch (e) {
    return []
  }
}

export async function saveDocTemplate(id: string | null, docType: string, nameEl: string, htmlContent: string) {
  await seedDummyTemple()
  try {
    if (id) {
      await prisma.docTemplate.update({ where: { id }, data: { docType, nameEl, htmlContent } })
    } else {
      await prisma.docTemplate.create({
        data: { templeId: TEMP_TEMPLE_ID, docType, nameEl, htmlContent }
      })
    }
    revalidatePath('/admin/settings/templates')
    return { success: true }
  } catch (e) {
    console.error(e)
    return { success: false }
  }
}
