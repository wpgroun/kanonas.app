'use server'

import { logger } from '@/lib/logger';

import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/requireAuth'
import { getCurrentTempleId } from './core'
import { PDFDocument, rgb } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import fs from 'fs/promises'
import path from 'path'
import { declineFullName, declineGreekName, resolveGenderTokens, mergeSplitRuns, getNormalizedValue } from '@/lib/greekDeclension';


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
  };
  const mergedAnswers: Record<string, string> = { ...sysVars, ...answers }

  let targetGender: 'male' | 'female' = 'male'; // fallback
  for (const [k, v] of Object.entries(mergedAnswers)) {
    const keyL = String(k).toLowerCase();
    const valL = String(v).toLowerCase();
    if (keyL.includes('φύλο') || keyL.includes('gender')) {
      if (valL.includes('θήλυ') || valL.includes('θηλυκό') || valL.includes('female') || valL === 'θ' || valL === 'f') {
        targetGender = 'female';
      }
    }
  }

  // Enrich answers dynamically with role variants, Greek equivalents, and cases
  const enrichedAnswers = enrichAnswers(mergedAnswers, targetGender);

  // ─── HTML Template ───────────────────────────────────────────────────
  if (template.htmlContent) {
    return generateHTMLDoc(template, enrichedAnswers, temple, targetGender)
  }

  // ─── PDF Template ──────────────────────────────────────────────────
  if (template.fileUrl && template.fileUrl.endsWith('.pdf')) {
    return generatePDFDoc(template, enrichedAnswers, temple)
  }

  // ─── DOCX Template ─────────────────────────────────────────────────
  if (template.fileUrl && (template.fileUrl.endsWith('.docx') || template.fileUrl.endsWith('.doc'))) {
    return generateDOCXDoc(template, enrichedAnswers, targetGender)
  }

  return { success: false, error: 'Μη υποστηριζόμενος τύπος αρχείου.' }
}

// ═══════════════════════════════════════════════════════════════════════
// HTML Template Generation (existing — cleaned up)
// ═══════════════════════════════════════════════════════════════════════

function generateHTMLDoc(template: any, answers: Record<string, string>, temple: any, targetGender: 'male' | 'female') {
  let filledHtml = template.htmlContent || ''
  filledHtml = filledHtml.replace(/\{\{([^}]+)\}\}/g, (_: string, varName: string) => {
    const val = getNormalizedValue(varName.trim(), answers);
    if (!val) {
      logger.info(`[docEngine.ts] Template variable "${varName.trim()}" not found in answers map.`);
    }
    return val !== undefined && val !== null ? val : '';
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

  const finalHtml = resolveGenderTokens(fullHtml, targetGender);

  return { success: true, type: 'html', html: finalHtml, title: template.nameEl }
}

// ═══════════════════════════════════════════════════════════════════════
// PDF Generation (pdf-lib) — overlay answers onto each page
// ═══════════════════════════════════════════════════════════════════════

async function generatePDFDoc(template: any, answers: Record<string, string>, temple: any) {
  try {
    let existingPdfBytes: Buffer;
    if (template.fileData) {
      existingPdfBytes = Buffer.from(template.fileData, 'base64');
    } else {
      const filePath = path.join(process.cwd(), 'public', template.fileUrl)
      existingPdfBytes = await fs.readFile(filePath)
    }
    const pdfDoc = await PDFDocument.load(existingPdfBytes)

    // Embed a font that supports Greek
    const regularPath = path.join(process.cwd(), 'public', 'fonts', 'Roboto-Regular.ttf')
    const boldPath = path.join(process.cwd(), 'public', 'fonts', 'Roboto-Bold.ttf')
    const [regularBytes, boldBytes] = await Promise.all([
      fs.readFile(regularPath),
      fs.readFile(boldPath)
    ])

    pdfDoc.registerFontkit(fontkit)
    const helvetica = await pdfDoc.embedFont(regularBytes)
    const helveticaBold = await pdfDoc.embedFont(boldBytes)

    const pages = pdfDoc.getPages()
    const firstPage = pages[0]
    const { width, height } = firstPage.getSize()

    let y = height - 150
    const fontSize = 11
    const lineHeight = 20

    // For each variable in answers (system + user), draw it on the first page
    for (const [key, value] of Object.entries(answers)) {
      if (!value) continue
      if (y < 60) break // Safety margin for bottom of page

      // Label (Bold)
      firstPage.drawText(`${key.replace(/_/g, ' ')}:`, {
        x: 50, y, size: fontSize, font: helveticaBold, color: rgb(0.2, 0.2, 0.2)
      })

      // Value (Regular)
      firstPage.drawText(value, {
        x: 230, y, size: fontSize, font: helvetica, color: rgb(0.1, 0.1, 0.1)
      })

      y -= lineHeight
    }

    // Footer
    firstPage.drawText(`Δημιουργήθηκε αυτόματα από το Kanonas — ${new Date().toLocaleDateString('el-GR')}`, {
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
    logger.error('[PDF Generation]', e)
    return { success: false, error: `Σφάλμα PDF: ${e.message}` }
  }
}

// ═══════════════════════════════════════════════════════════════════════
// DOCX Generation (docxtemplater)
// ═══════════════════════════════════════════════════════════════════════

async function generateDOCXDoc(template: any, answers: Record<string, string>, targetGender: 'male' | 'female') {
  try {
    const PizZip = (await import('pizzip')).default

    let content: Buffer;
    if (template.fileData) {
      content = Buffer.from(template.fileData, 'base64');
    } else {
      const filePath = path.join(process.cwd(), 'public', template.fileUrl)
      content = await fs.readFile(filePath)
    }
    const zip = new PizZip(content)

    let format = 'mustache';
    try {
      if (template.context?.startsWith('{')) {
        const parsed = JSON.parse(template.context);
        if (parsed.format) format = parsed.format;
      }
    } catch(e) {}

    // Load the per-template variable map (if any)
    const variableMap = template.variableMap as Record<string, string> | null;

    // Helper: XML-safe escaping
    function escXml(str: string): string {
      return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    // Core lookup: variableMap → direct key → synonym groups
    // Returns: string  → replace with this value (may be empty string to clear the placeholder)
    //          null    → mustache section marker, keep original
    //          undefined → genuinely not found, keep placeholder visible
    function lookupKey(trimmedKey: string, isMustache: boolean): string | null | undefined {
      // Skip Mustache section / comment markers: {{#name}}, {{/name}}, {{^name}}, {{!...}}, {{>partial}}
      if (isMustache && /^[#^/!>]/.test(trimmedKey)) return null;

      // Remove GUID-shaped placeholders (Word internal IDs) — return '' to erase them
      if (/^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i.test(trimmedKey)) return '';

      // 1. Check per-template variableMap first
      if (variableMap) {
        const mappedField = variableMap[trimmedKey];
        if (mappedField === '__ignore__') {
          const autoVal = getNormalizedValue(trimmedKey, answers);
          return autoVal !== '' ? autoVal : '';
        }
        if (mappedField && mappedField !== '__unknown__') {
          const mapped = getNormalizedValue(mappedField, answers) || answers[mappedField] || '';
          if (mapped !== '') return mapped;
          // Mapped field didn't resolve — fall through to try the original placeholder key
        }
      }

      // 2. Direct hasOwnProperty check
      if (Object.prototype.hasOwnProperty.call(answers, trimmedKey)) {
        return answers[trimmedKey] ?? '';
      }

      // 3. Synonym-group / normalized key lookup
      const val = getNormalizedValue(trimmedKey, answers);
      if (val !== '') return val;

      return undefined;
    }

    // Apply replacement for a single regex pattern
    function replaceWithPattern(xml: string, regex: RegExp, isMustache: boolean): string {
      return xml.replace(regex, (match, key) => {
        const trimmedKey = key.trim();
        const result = lookupKey(trimmedKey, isMustache);
        if (result === null) return match;           // explicit keep (mustache section marker)
        if (result !== undefined) return escXml(result); // found a value
        // Not found — keep original placeholder so it stays visible
        logger.info(`[docEngine.ts] Template variable "${trimmedKey}" not found in answers map.`);
        return match;
      });
    }

    // Always run ALL three formats in sequence so mixed templates work correctly.
    // Many Greek church DOCX files use {{...}} for names AND [...] for date/registry fields.
    function replacePlaceholders(xml: string): string {
      // 1. Mustache {{...}} — names, gender tokens, etc.
      xml = replaceWithPattern(xml, /\{\{([^}]+)\}\}/g, true);
      // 2. Square brackets [...] — civil registry fields, date fields, sequential numbers
      xml = replaceWithPattern(xml, /\[([^\]]+)\]/g, false);
      // 3. Single curly {…} — some legacy templates
      xml = replaceWithPattern(xml, /(?<!\{)\{([^{}]+)\}(?!\})/g, false);
      return xml;
    }

    for (const fileName of Object.keys(zip.files)) {
      const normalizedName = fileName.replace(/\\/g, '/');
      if (normalizedName.startsWith('word/') && normalizedName.endsWith('.xml')) {
        const xmlFile = zip.file(fileName);
        if (xmlFile) {
          let xml = xmlFile.asText();
          xml = mergeSplitRuns(xml);
          xml = resolveGenderTokens(xml, targetGender);
          xml = replacePlaceholders(xml);
          zip.file(fileName, xml);
        }
      }
    }

    const buf = zip.generate({ type: 'nodebuffer', compression: 'DEFLATE' });

    const base64 = buf.toString('base64')

    return {
      success: true,
      type: 'docx',
      base64,
      filename: `${template.nameEl.replace(/\s+/g, '_')}_${Date.now()}.docx`,
      title: template.nameEl
    }
  } catch (e: any) {
    logger.error('[DOCX Generation]', e)
    return { success: false, error: `Σφάλμα DOCX: ${e.message}` }
  }
}

function enrichAnswers(answers: Record<string, string>, targetGender: 'male' | 'female'): Record<string, string> {
  const enriched = { ...answers };
  
  // 1. Detect all roles present in the answers keys.
  const roles = new Set<string>();
  for (const key of Object.keys(answers)) {
    const match = key.match(/^(groom|bride|father|mother|godparent|sponsor|witness|bestman|child)(?=[A-Z_]|$)/i);
    if (match) {
      roles.add(match[1].toLowerCase());
    }
  }

  // 2. For each detected role, ensure all variants are populated in english and greek
  for (const role of roles) {
    const fName = answers[`${role}FirstName`] || answers[`${role}_firstName`] || answers[`${role}Name`] || answers[`${role}_name`] || '';
    const lName = answers[`${role}LastName`] || answers[`${role}_lastName`] || '';
    const fullName = answers[`${role}FullName`] || answers[`${role}_fullName`] || `${fName} ${lName}`.trim();
    const patName = answers[`${role}FathersName`] || answers[`${role}_fathersName`] || '';
    const matName = answers[`${role}MothersName`] || answers[`${role}_mothersName`] || '';

    // Set standard english keys if not present
    if (fName && !enriched[`${role}FirstName`]) enriched[`${role}FirstName`] = fName;
    if (fName && !enriched[`${role}Name`]) enriched[`${role}Name`] = fName;
    if (lName && !enriched[`${role}LastName`]) enriched[`${role}LastName`] = lName;
    if (fullName && !enriched[`${role}FullName`]) enriched[`${role}FullName`] = fullName;
    if (patName && !enriched[`${role}FathersName`]) enriched[`${role}FathersName`] = patName;
    if (matName && !enriched[`${role}MothersName`]) enriched[`${role}MothersName`] = matName;

    // Generate Greek equivalents based on the role
    let grPrefix = '';
    if (role === 'father') grPrefix = 'Πατέρα';
    else if (role === 'mother') grPrefix = 'Μητέρας';
    else if (role === 'godparent' || role === 'sponsor') grPrefix = 'Αναδόχου';
    else if (role === 'groom') grPrefix = 'Γαμπρού';
    else if (role === 'bride') grPrefix = 'Νύφης';
    else if (role === 'witness' || role === 'bestman') grPrefix = 'Κουμπάρου';

    if (grPrefix) {
      if (fName) {
        enriched[`Όνομα_${grPrefix}`] = fName;
        enriched[`ΟΝΟΜΑ_${grPrefix.toUpperCase()}`] = fName;
      }
      if (lName) {
        enriched[`Επώνυμο_${grPrefix}`] = lName;
        enriched[`ΕΠΩΝΥΜΟ_${grPrefix.toUpperCase()}`] = lName;
      }
      if (fullName) {
        enriched[`Ονοματεπώνυμο_${grPrefix}`] = fullName;
        enriched[`ΟΝΟΜΑΤΕΠΩΝΥΜΟ_${grPrefix.toUpperCase()}`] = fullName;
      }
    }

    // Role-specific Greek fields
    if (role === 'father' && fullName) {
      enriched['Πατρώνυμο'] = declineFullName(fullName, 'genitive', 'male');
      enriched['ΠΑΤΡΩΝΥΜΟ'] = declineFullName(fullName, 'genitive', 'male');
    }
    if (role === 'mother' && fullName) {
      enriched['Μητρώνυμο'] = declineFullName(fullName, 'genitive', 'female');
      enriched['ΜΗΤΡΩΝΥΜΟ'] = declineFullName(fullName, 'genitive', 'female');
    }
    if ((role === 'godparent' || role === 'sponsor') && fullName) {
      enriched['Ανάδοχος'] = fullName;
      enriched['ΑΝΑΔΟΧΟΣ'] = fullName;
    }
    if (role === 'groom' && patName) {
      enriched['Πατρώνυμο_Γαμπρού'] = declineGreekName(patName, 'genitive', 'male');
      enriched['ΠΑΤΡΩΝΥΜΟ_ΓΑΜΠΡΟΥ'] = declineGreekName(patName, 'genitive', 'male');
    }
    if (role === 'bride' && patName) {
      enriched['Πατρώνυμο_Νύφης'] = declineGreekName(patName, 'genitive', 'male');
      enriched['ΠΑΤΡΩΝΥΜΟ_ΝΥΦΗΣ'] = declineGreekName(patName, 'genitive', 'male');
    }
  }

  // 3. For any name/fullname key, automatically generate genitive and accusative cases
  const allKeys = Object.keys(enriched);
  for (const key of allKeys) {
    const val = enriched[key];
    if (!val || typeof val !== 'string') continue;

    const isNameKey = key.includes('Name') || key.includes('name') ||
                      key.includes('Όνομα') || key.includes('Όνομα') ||
                      key.includes('Ονομα') || key.includes('Επώνυμο') || key.includes('Πατρώνυμο') || key.includes('Μητρώνυμο') || key.includes('Ανάδοχος') ||
                      key.includes('ΟΝΟΜΑ') || key.includes('ΕΠΩΝΥΜΟ') || key.includes('ΠΑΤΡΩΝΥΜΟ') || key.includes('ΜΗΤΡΩΝΥΜΟ') || key.includes('ΑΝΑΔΟΧΟΣ') ||
                      key.includes('ονοματεπωνυμο') || key.includes('ΟΝΟΜΑΤΕΠΩΝΥΜΟ');

    if (isNameKey) {
      let gender: 'male' | 'female' = 'male';
      const keyL = key.toLowerCase();
      if (keyL.includes('mother') || keyL.includes('bride') || keyL.includes('μητερα') || keyL.includes('νυφη') || keyL.includes('γυναίκα')) {
        gender = 'female';
      } else if (keyL.includes('child') || keyL.includes('παιδι')) {
        gender = targetGender;
      }

      const genKey = `${key}_ΓΕΝΙΚΗ`;
      if (!enriched[genKey]) {
        enriched[genKey] = declineFullName(val, 'genitive', gender);
      }
      const accKey = `${key}_ΑΙΤΙΑΤΙΚΗ`;
      if (!enriched[accKey]) {
        enriched[accKey] = declineFullName(val, 'accusative', gender);
      }
    }
  }

  // 4. Custom placeholders requested by the user:
  // fatherFullName -> Ονοματεπώνυμο_1
  // motherFullName -> Ονοματεπώνυμο_2
  if (enriched['fatherFullName'] && !enriched['Ονοματεπώνυμο_1']) {
    enriched['Ονοματεπώνυμο_1'] = enriched['fatherFullName'];
    enriched['ΟΝΟΜΑΤΕΠΩΝΥΜΟ_1'] = enriched['fatherFullName'];
  }
  if (enriched['motherFullName'] && !enriched['Ονοματεπώνυμο_2']) {
    enriched['Ονοματεπώνυμο_2'] = enriched['motherFullName'];
    enriched['ΟΝΟΜΑΤΕΠΩΝΥΜΟ_2'] = enriched['motherFullName'];
  }

  return enriched;
}
