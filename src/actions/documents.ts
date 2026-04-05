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

export async function saveDocTemplate(id: string | null, docType: string, nameEl: string, htmlContent: string, conditionRules: string | null = null) {
  await requireAuth()
  const templeId = await getCurrentTempleId()
  try {
    if (id) {
      const existing = await prisma.docTemplate.findFirst({ where: { id, templeId } });
      if (!existing) return { success: false, error: 'Unauthorized' };
      await prisma.docTemplate.update({ where: { id }, data: { docType, nameEl, htmlContent, conditionRules } })
    } else {
      await prisma.docTemplate.create({
        data: { templeId, docType, nameEl, htmlContent, conditionRules }
      })
    }
    revalidatePath('/admin/settings/templates')
    return { success: true }
  } catch (e) {
    console.error(e)
    return { success: false }
  }
}
