'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getCurrentTempleId } from './core'
import { requireAuth } from '@/lib/requireAuth'

export async function getDocTemplates(docType?: string) {
  const templeId = await getCurrentTempleId()
  try {
    return await prisma.docTemplate.findMany({
      where: {
        templeId,
        ...(docType ? { docType } : {})
      },
      orderBy: { createdAt: 'desc' }
    })
  } catch (e) {
    return []
  }
}

export async function saveDocTemplate(id: string | null, docType: string, nameEl: string, htmlContent: string) {
  await requireAuth()
  const templeId = await getCurrentTempleId()
  try {
    if (id) {
      await prisma.docTemplate.update({ where: { id }, data: { docType, nameEl, htmlContent } })
    } else {
      await prisma.docTemplate.create({
        data: { templeId, docType, nameEl, htmlContent }
      })
    }
    revalidatePath('/admin/settings/templates')
    return { success: true }
  } catch (e) {
    console.error(e)
    return { success: false }
  }
}
