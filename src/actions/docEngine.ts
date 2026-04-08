'use server'

import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/requireAuth'
import { getCurrentTempleId } from './core'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import fs from 'fs/promises'
import path from 'path'

/**
 * Generate a filled PDF document from a template + user answers.
 * For HTML templates: uses the existing docEngine flow (returns HTML).
 * For uploaded PDF templates: generates a new PDF with text overlay on each page.
 * For uploaded DOCX templates: uses docxtemplater to replace placeholders.
 */
export async function generateFromTemplate(templateId: string, answers: Record<string, string>) {
  await requireAuth()
  const templeId = await getCurrentTempleId()

  const template = await prisma.docTemplate.findFirst({
    where: { id: templateId, templeId }
  })
  if (!template) return { success: false, error: 'Δεν βρέθηκε το πρότυπο.' }

  // Get temple info for header fields
  const temple = await prisma.temple.findUnique({
    where: { id: templeId },
    include: { metropolis: { select: { name: true } } }
  })

  // Auto-fill system variables
  const sysVars: Record<string, string> = {
    'ΝΑΟΣ_ΟΝΟΜΑ': temple?.name || '',
    'ΝΑΟΣ_ΔΙΕΥΘΥΝΣΗ': temple?.address || '',
    'ΜΗΤΡΟΠΟΛΗ': temple?.metropolis?.name || '',
    'ΗΜΕΡΟΜΗΝΙΑ': new Date().toLocaleDateString('el-GR', { day: 'numeric', month: 'long', year: 'numeric' }),
  }
  const mergedAnswers = { ...sysVars, ...answers }

  // ─── HTML Template ───────────────────────────────────────────────────
  if (template.htmlContent) {
    return generateHTMLDoc(template, mergedAnswers, temple)
  }

  // ─── PDF Template ──────────────────────────────────────────────────
  if (template.fileUrl && template.fileUrl.endsWith('.pdf')) {
    return generatePDFDoc(template, mergedAnswers, temple)
  }

  // ─── DOCX Template ─────────────────────────────────────────────────
  if (template.fileUrl && (template.fileUrl.endsWith('.docx') || template.fileUrl.endsWith('.doc'))) {
    return generateDOCXDoc(template, mergedAnswers)
  }

  return { success: false, error: 'Μη υποστηριζόμενος τύπος αρχείου.' }
}

// ═══════════════════════════════════════════════════════════════════════
// HTML Template Generation (existing — cleaned up)
// ═══════════════════════════════════════════════════════════════════════

function generateHTMLDoc(template: any, answers: Record<string, string>, temple: any) {
  let filledHtml = template.htmlContent || ''
  filledHtml = filledHtml.replace(/\{\{([^}]+)\}\}/g, (_: string, varName: string) => {
    return answers[varName.trim()] || `[${varName.trim()}]`
  })

  const todayGr = new Date().toLocaleDateString('el-GR', { day: 'numeric', month: 'long', year: 'numeric' })

  const fullHtml = `<!DOCTYPE html>
<html lang="el">
<head>
  <meta charset="UTF-8">
  <title>${template.nameEl} — Κανόνας</title>
  <style>
    @page { size: A4 portrait; margin: 2cm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Palatino Linotype', Georgia, serif; font-size: 12pt; color: #1a1008; line-height: 1.7; background: #f0f2f5; display: flex; justify-content: center; padding: 2cm 0; }
    @media print { body { background: #fff; padding: 0; } .doc-page { box-shadow: none !important; margin: 0 !important; border: none !important; } }
    .doc-page { width: 21cm; min-height: 29.7cm; background: #fff; padding: 2cm; border: 1px solid #d4c9a8; box-shadow: 0 4px 24px rgba(0,0,0,0.08); position: relative; }
    .doc-watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.025; font-size: 280pt; z-index: 0; pointer-events: none; }
    .doc-header { text-align: center; border-bottom: 2px solid #bba070; padding-bottom: 0.8cm; margin-bottom: 0.8cm; position: relative; z-index: 1; }
    .doc-header .metropolis { font-size: 11pt; color: #666; margin-bottom: 2pt; }
    .doc-header .temple { font-size: 16pt; font-weight: bold; color: #1a1008; }
    .doc-header .date { font-size: 10pt; color: #888; margin-top: 4pt; }
    .doc-title { text-align: center; font-size: 18pt; font-weight: bold; color: #8b2e20; margin: 0.8cm 0; letter-spacing: 0.05em; text-transform: uppercase; position: relative; z-index: 1; }
    .doc-body { text-align: justify; position: relative; z-index: 1; }
    .doc-body p { margin-bottom: 0.4cm; }
    .doc-footer { margin-top: 2cm; display: flex; justify-content: space-between; align-items: flex-end; position: relative; z-index: 1; }
    .doc-signature { text-align: center; min-width: 200px; }
    .doc-signature-line { border-top: 1px solid #333; margin-top: 3cm; padding-top: 4pt; font-size: 10pt; }
    .doc-stamp { text-align: center; font-size: 9pt; color: #999; border: 1px dashed #ccc; padding: 0.5cm; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="doc-page">
    <div class="doc-watermark">☦</div>
    <div class="doc-header">
      <div class="metropolis">${temple?.metropolis?.name || 'Ιερά Μητρόπολις'}</div>
      <div class="temple">${temple?.name || 'Ιερός Ναός'}</div>
      <div class="date">Ημερομηνία: ${todayGr}</div>
    </div>
    <div class="doc-title">${template.nameEl}</div>
    <div class="doc-body">${filledHtml}</div>
    <div class="doc-footer">
      <div class="doc-stamp">Ψηφιακό Έγγραφο Kanonas<br/>ID: ${template.id.slice(-8).toUpperCase()}</div>
      <div class="doc-signature"><div class="doc-signature-line">Ο Εφημέριος</div></div>
    </div>
  </div>
</body>
</html>`

  return { success: true, type: 'html', html: fullHtml, title: template.nameEl }
}

// ═══════════════════════════════════════════════════════════════════════
// PDF Generation (pdf-lib) — overlay answers onto each page
// ═══════════════════════════════════════════════════════════════════════

async function generatePDFDoc(template: any, answers: Record<string, string>, temple: any) {
  try {
    const filePath = path.join(process.cwd(), 'public', template.fileUrl)
    const existingPdfBytes = await fs.readFile(filePath)
    const pdfDoc = await PDFDocument.load(existingPdfBytes)

    // Embed a font that supports Greek
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    const pages = pdfDoc.getPages()
    const firstPage = pages[0]
    const { width, height } = firstPage.getSize()

    // Get variables from template context
    let variables: string[] = []
    try { variables = JSON.parse(template.context || '[]') } catch {}

    // Build the filled text block
    const lines: string[] = []
    lines.push(`── ${template.nameEl} ──`)
    lines.push(`Ναός: ${answers['ΝΑΟΣ_ΟΝΟΜΑ'] || temple?.name || ''}`)
    lines.push(`Ημερομηνία: ${answers['ΗΜΕΡΟΜΗΝΙΑ'] || ''}`)
    lines.push('')

    for (const v of variables) {
      if (['ΝΑΟΣ_ΟΝΟΜΑ', 'ΝΑΟΣ_ΔΙΕΥΘΥΝΣΗ', 'ΜΗΤΡΟΠΟΛΗ', 'ΗΜΕΡΟΜΗΝΙΑ'].includes(v)) continue
      const value = answers[v] || ''
      if (value) {
        lines.push(`${v.replace(/_/g, ' ')}: ${value}`)
      }
    }

    // Add a data overlay page at the end with all filled fields
    const newPage = pdfDoc.addPage([width, height])
    const fontSize = 11
    const lineHeight = fontSize * 1.6
    let y = height - 60

    // Header
    newPage.drawText('ΣΤΟΙΧΕΙΑ ΕΓΓΡΑΦΟΥ', {
      x: 50, y, size: 16, font: helveticaBold, color: rgb(0.1, 0.1, 0.1)
    })
    y -= 8

    // Divider line
    newPage.drawRectangle({
      x: 50, y, width: width - 100, height: 1,
      color: rgb(0.7, 0.6, 0.4)
    })
    y -= 24

    for (const line of lines) {
      if (y < 60) break // stop if near bottom
      const isHeader = line.startsWith('──')
      newPage.drawText(line, {
        x: 50, y,
        size: isHeader ? 14 : fontSize,
        font: isHeader ? helveticaBold : helvetica,
        color: isHeader ? rgb(0.55, 0.18, 0.13) : rgb(0.1, 0.1, 0.1)
      })
      y -= lineHeight
    }

    // Footer
    newPage.drawText(`Δημιουργήθηκε αυτόματα από Κανόνας — ${new Date().toLocaleDateString('el-GR')}`, {
      x: 50, y: 30, size: 8, font: helvetica, color: rgb(0.6, 0.6, 0.6)
    })

    const pdfBytes = await pdfDoc.save()
    const base64 = Buffer.from(pdfBytes).toString('base64')

    return {
      success: true,
      type: 'pdf',
      base64,
      filename: `${template.nameEl.replace(/\s+/g, '_')}_${Date.now()}.pdf`,
      title: template.nameEl
    }
  } catch (e: any) {
    console.error('[PDF Generation]', e)
    return { success: false, error: `Σφάλμα PDF: ${e.message}` }
  }
}

// ═══════════════════════════════════════════════════════════════════════
// DOCX Generation (docxtemplater)
// ═══════════════════════════════════════════════════════════════════════

async function generateDOCXDoc(template: any, answers: Record<string, string>) {
  try {
    const Docxtemplater = (await import('docxtemplater')).default
    const PizZip = (await import('pizzip')).default

    const filePath = path.join(process.cwd(), 'public', template.fileUrl)
    const content = await fs.readFile(filePath)
    const zip = new PizZip(content)

    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      delimiters: { start: '{{', end: '}}' }
    })

    // Replace all {{VARIABLE}} placeholders
    doc.render(answers)

    const buf = doc.getZip().generate({ type: 'nodebuffer', compression: 'DEFLATE' })
    const base64 = buf.toString('base64')

    return {
      success: true,
      type: 'docx',
      base64,
      filename: `${template.nameEl.replace(/\s+/g, '_')}_${Date.now()}.docx`,
      title: template.nameEl
    }
  } catch (e: any) {
    console.error('[DOCX Generation]', e)
    return { success: false, error: `Σφάλμα DOCX: ${e.message}` }
  }
}
