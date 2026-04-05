'use server'

import { prisma } from '@/lib/prisma'
import { getCurrentTempleId } from './core'
import { requireAuth } from '@/lib/requireAuth'

/**
 * Generate a filled document from a template + answers.
 * Returns the final HTML string with all {{VARIABLES}} replaced.
 */
export async function generateFilledDocument(templateId: string, answers: Record<string, string>) {
  await requireAuth()
  const templeId = await getCurrentTempleId()

  const template = await prisma.docTemplate.findFirst({
    where: { id: templateId, templeId }
  })

  if (!template || !template.htmlContent) {
    return { success: false, error: 'Δε βρέθηκε το πρότυπο.' }
  }

  // Get temple info for header
  const temple = await prisma.temple.findUnique({
    where: { id: templeId },
    include: { metropolis: { select: { name: true } } }
  })

  // Replace all {{VARIABLE}} placeholders
  let filledHtml = template.htmlContent
  const regex = /\{\{([^}]+)\}\}/g
  filledHtml = filledHtml.replace(regex, (match, varName) => {
    const key = varName.trim()
    return answers[key] || `[${key}]`
  })

  // Wrap in a professional A4 print layout
  const todayGr = new Date().toLocaleDateString('el-GR', { day: 'numeric', month: 'long', year: 'numeric' })
  
  const fullHtml = `
<!DOCTYPE html>
<html lang="el">
<head>
  <meta charset="UTF-8">
  <title>${template.nameEl} — Kanonas</title>
  <style>
    @page { size: A4 portrait; margin: 2cm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Palatino Linotype', 'Book Antiqua', Georgia, serif;
      font-size: 12pt;
      color: #1a1008;
      line-height: 1.7;
      background: #f0f2f5;
      display: flex;
      justify-content: center;
      padding: 2cm 0;
    }
    @media print {
      body { background: #fff; padding: 0; }
      .doc-page { box-shadow: none !important; margin: 0 !important; border: none !important; }
      .no-print { display: none !important; }
    }
    .doc-page {
      width: 21cm;
      min-height: 29.7cm;
      background: #fff;
      padding: 2cm;
      border: 1px solid #d4c9a8;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
      position: relative;
    }
    .doc-watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      opacity: 0.025;
      font-size: 280pt;
      z-index: 0;
      pointer-events: none;
    }
    .doc-header {
      text-align: center;
      border-bottom: 2px solid #bba070;
      padding-bottom: 0.8cm;
      margin-bottom: 0.8cm;
      position: relative;
      z-index: 1;
    }
    .doc-header .metropolis { font-size: 11pt; color: #666; margin-bottom: 2pt; }
    .doc-header .temple { font-size: 16pt; font-weight: bold; color: #1a1008; }
    .doc-header .date { font-size: 10pt; color: #888; margin-top: 4pt; }
    .doc-title {
      text-align: center;
      font-size: 18pt;
      font-weight: bold;
      color: #8b2e20;
      margin: 0.8cm 0;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      position: relative;
      z-index: 1;
    }
    .doc-body {
      text-align: justify;
      position: relative;
      z-index: 1;
    }
    .doc-body p { margin-bottom: 0.4cm; }
    .doc-body strong { color: #1a1008; }
    .doc-footer {
      margin-top: 2cm;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      position: relative;
      z-index: 1;
    }
    .doc-signature {
      text-align: center;
      min-width: 200px;
    }
    .doc-signature-line {
      border-top: 1px solid #333;
      margin-top: 3cm;
      padding-top: 4pt;
      font-size: 10pt;
    }
    .doc-stamp {
      text-align: center;
      font-size: 9pt;
      color: #999;
      border: 1px dashed #ccc;
      padding: 0.5cm;
      border-radius: 4px;
    }
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

    <div class="doc-body">
      ${filledHtml}
    </div>

    <div class="doc-footer">
      <div class="doc-stamp">
        Ψηφιακό Έγγραφο Kanonas<br/>
        ID: ${templateId.slice(-8).toUpperCase()}
      </div>
      <div class="doc-signature">
        <div class="doc-signature-line">Ο Εφημέριος</div>
      </div>
    </div>
  </div>
</body>
</html>`

  return { success: true, html: fullHtml, title: template.nameEl }
}

/**
 * Generate multiple documents at once from a booking session answers.
 * Evaluates condition rules and generates only matching templates.
 */
export async function generateDocumentsForBooking(serviceType: string, answers: Record<string, string>) {
  await requireAuth()
  const templeId = await getCurrentTempleId()

  const mappedDocType = serviceType === 'GAMOS' ? 'gamos' : serviceType === 'BAPTISM' ? 'vaptisi' : 'other'

  const templates = await prisma.docTemplate.findMany({
    where: { templeId, docType: mappedDocType }
  })

  const results: { id: string; name: string; html: string }[] = []

  for (const t of templates) {
    // Check condition rules (field may exist from migration)
    const condRules = (t as any).conditionRules as string | null;
    if (condRules) {
      const condMatch = condRules.match(/\{\{([^}]+)\}\}\s*==\s*['"]([^'"]+)['"]/)
      if (condMatch) {
        const condVar = condMatch[1].trim()
        const condVal = condMatch[2].trim()
        if (answers[condVar] !== condVal) continue // Skip — condition not met
      }
    }

    // Generate the document
    const result = await generateFilledDocument(t.id, answers)
    if (result.success && result.html) {
      results.push({ id: t.id, name: result.title!, html: result.html })
    }
  }

  return results
}
