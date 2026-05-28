'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getCurrentTempleId } from './core'
import { requireAuth } from '@/lib/requireAuth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { mergeSplitRuns } from '@/lib/greekDeclension'

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

export async function saveDocTemplate(id: string | null, docType: string, nameEl: string, htmlContent: string, conditionRules: string | null = null, visibility: string = 'internal') {
  await requireAuth()
  const templeId = await getCurrentTempleId()
  try {
    if (id) {
      const existing = await prisma.docTemplate.findFirst({ where: { id, templeId } });
      if (!existing) return { success: false, error: 'Unauthorized' };
      await prisma.docTemplate.update({ where: { id }, data: { docType, nameEl, htmlContent, conditionRules, visibility } })
    } else {
      await prisma.docTemplate.create({
        data: { templeId, docType, nameEl, htmlContent, conditionRules, visibility }
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
  const visibility = formData.get('visibility') as string || 'internal'

  if (!file || !nameEl || !docType) {
    return { success: false, error: 'Λείπουν υποχρεωτικά πεδία.' }
  }

  try {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'templates', templeId)
    await mkdir(uploadDir, { recursive: true })

    const ext = path.extname(file.name).toLowerCase()
    const safeName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
    const filePath = path.join(uploadDir, safeName)
    const fileUrl = `/uploads/templates/${templeId}/${safeName}`
    
    const bytes = await file.arrayBuffer()
    let buffer: any = Buffer.from(bytes)

    let detectedVars: string[] = []
    let detectedFormat = 'mustache'

    if (ext === '.docx' || ext === '.doc') {
      const PizZip = (await import('pizzip')).default
      const zip = new PizZip(buffer)
      
      let mainXml = ''
      for (const fileName of Object.keys(zip.files)) {
        if (fileName.startsWith('word/') && fileName.endsWith('.xml')) {
          const xmlFile = zip.file(fileName)
          if (xmlFile) {
            let xml = xmlFile.asText()
            xml = mergeSplitRuns(xml)
            zip.file(fileName, xml)
            if (fileName === 'word/document.xml') {
              mainXml = xml
            }
          }
        }
      }
      
      buffer = zip.generate({ type: 'nodebuffer', compression: 'DEFLATE' })
      const plainText = mainXml.replace(/<[^>]+>/g, ' ')

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

    await writeFile(filePath, buffer)
    const fileBase64 = buffer.toString('base64')

    const contextPayload = JSON.stringify({
      format: detectedFormat,
      vars: detectedVars
    })

    const tpl = await prisma.docTemplate.create({
      data: {
        templeId,
        docType,
        nameEl,
        visibility,
        fileUrl,
        fileData: fileBase64,
        htmlContent: null,
        context: contextPayload,
        ...(detectedVars.length > 0 ? { needsMapping: true } : {}),
      } as any
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

/**
 * Save the user-defined variable→data-key mapping for a template.
 * variableMap: { "Πατρώνυμο": "fatherName", "Όνομα": "childName", ... }
 * needsMapping=false once saved.
 */
export async function saveVariableMap(templateId: string, variableMap: Record<string, string>) {
  await requireAuth()
  const templeId = await getCurrentTempleId()

  const existing = await prisma.docTemplate.findFirst({ where: { id: templateId, templeId } })
  if (!existing) return { success: false, error: 'Template not found' }

  await prisma.docTemplate.update({
    where: { id: templateId },
    data: { variableMap: variableMap as any, needsMapping: false } as any
  })

  revalidatePath('/admin/documents')
  return { success: true }
}

/**
 * Get a single template by ID (for the mapping page).
 */
export async function getTemplateById(templateId: string) {
  const templeId = await getCurrentTempleId()
  return prisma.docTemplate.findFirst({ where: { id: templateId, templeId } })
}

