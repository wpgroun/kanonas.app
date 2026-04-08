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

  if (!file || !nameEl || !docType) {
    return { success: false, error: 'Λείπουν υποχρεωτικά πεδία.' }
  }

  try {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'templates', templeId)
    await mkdir(uploadDir, { recursive: true })

    const ext = path.extname(file.name).toLowerCase()
    const safeName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
    const filePath = path.join(uploadDir, safeName)
    
    const bytes = await file.arrayBuffer()
    await writeFile(filePath, Buffer.from(bytes))

    const fileUrl = `/uploads/templates/${templeId}/${safeName}`

    let detectedVars: string[] = []
    let detectedFormat = 'mustache'

    if (ext === '.docx' || ext === '.doc') {
      const PizZip = (await import('pizzip')).default
      const fs = await import('fs/promises')
      const content = await fs.readFile(filePath)
      const zip = new PizZip(content)
      const xml = zip.file('word/document.xml')?.asText() || ''
      const plainText = xml.replace(/<[^>]+>/g, ' ')

      const mustacheMatches = Array.from(plainText.matchAll(/\{\{([^}]+)\}\}/g)).map(m => m[1].trim())
      const singleCurlyMatches = Array.from(plainText.matchAll(/(?<!\{)\{([^}]+)\}(?!\})/g)).map(m => m[1].trim())
      const bracketMatches = Array.from(plainText.matchAll(/\[([^\]]+)\]/g)).map(m => m[1].trim())

      const counts = [
        { format: 'mustache', count: mustacheMatches.length, vars: mustacheMatches },
        { format: 'single_curly', count: singleCurlyMatches.length, vars: singleCurlyMatches },
        { format: 'brackets', count: bracketMatches.length, vars: bracketMatches }
      ].sort((a, b) => b.count - a.count)

      if (counts[0].count > 0) {
        detectedFormat = counts[0].format
        detectedVars = Array.from(new Set(counts[0].vars))
      }
    } else {
      const rawVars = formData.get('variables') as string
      if (rawVars) {
        try { detectedVars = JSON.parse(rawVars) } catch (e) {}
      }
    }

    const contextPayload = JSON.stringify({
      format: detectedFormat,
      vars: detectedVars
    })

    const tpl = await prisma.docTemplate.create({
      data: {
        templeId,
        docType,
        nameEl,
        fileUrl,
        htmlContent: null,
        context: contextPayload,
      }
    })

    revalidatePath('/admin/documents')
    return { success: true, fileUrl, templateId: tpl.id, variables: detectedVars, varFormat: detectedFormat }
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

