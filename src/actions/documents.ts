'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getCurrentTempleId } from './core'
import { requireAuth } from '@/lib/requireAuth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

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
    revalidatePath('/admin/documents')
    return { success: true }
  } catch (e) {
    console.error(e)
    return { success: false }
  }
}

/**
 * Upload a PDF/DOCX file as a document template.
 * The file is saved to /public/uploads/templates/<templeId>/
 * Variables are stored as a JSON array in the `context` field.
 */
export async function uploadDocTemplate(formData: FormData) {
  await requireAuth()
  const templeId = await getCurrentTempleId()
  
  const file = formData.get('file') as File
  const nameEl = formData.get('nameEl') as string
  const docType = formData.get('docType') as string
  const variables = formData.get('variables') as string // JSON array of variable names

  if (!file || !nameEl || !docType) {
    return { success: false, error: 'Λείπουν υποχρεωτικά πεδία.' }
  }

  try {
    // Create upload directory
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'templates', templeId)
    await mkdir(uploadDir, { recursive: true })

    // Generate unique filename
    const ext = path.extname(file.name)
    const safeName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
    const filePath = path.join(uploadDir, safeName)
    
    // Write file
    const bytes = await file.arrayBuffer()
    await writeFile(filePath, Buffer.from(bytes))

    const fileUrl = `/uploads/templates/${templeId}/${safeName}`

    // Create DB record
    await prisma.docTemplate.create({
      data: {
        templeId,
        docType,
        nameEl,
        fileUrl,
        htmlContent: null,
        context: variables || '[]', // Store detected variables
      }
    })

    revalidatePath('/admin/documents')
    return { success: true, fileUrl }
  } catch (e: any) {
    console.error('[Upload Template]', e)
    return { success: false, error: e.message }
  }
}

/**
 * Update the variables (context) for a template.
 * Used when the user manually edits which variables are present in the uploaded PDF.
 */
export async function updateTemplateVariables(templateId: string, variables: string[]) {
  await requireAuth()
  const templeId = await getCurrentTempleId()

  const existing = await prisma.docTemplate.findFirst({ where: { id: templateId, templeId } })
  if (!existing) return { success: false, error: 'Template not found' }

  await prisma.docTemplate.update({
    where: { id: templateId },
    data: { context: JSON.stringify(variables) }
  })

  revalidatePath('/admin/documents')
  return { success: true }
}

export async function deleteDocTemplate(id: string) {
  await requireAuth()
  const templeId = await getCurrentTempleId()
  
  const existing = await prisma.docTemplate.findFirst({ where: { id, templeId } })
  if (!existing) return { success: false, error: 'Not found' }
  
  await prisma.docTemplate.delete({ where: { id } })
  revalidatePath('/admin/documents')
  return { success: true }
}

