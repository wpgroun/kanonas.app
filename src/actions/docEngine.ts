'use server'

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

  // Apply template-specific variableMap: remap placeholder names to canonical keys
  // e.g. { "Πατρώνυμο": "fatherName" } means answers["fatherName"] fills {{Πατρώνυμο}}
  const variableMap: Record<string, string> = (() => {
    try { return ((template as any).variableMap as any) || {} } catch { return {} }
  })()
  const remappedAnswers: Record<string, string> = { ...mergedAnswers }
  for (const [placeholder, dataKey] of Object.entries(variableMap)) {
    // If we have a value under the canonical dataKey, add it under the placeholder name too
    const val = mergedAnswers[dataKey] ?? mergedAnswers[placeholder]
    if (val !== undefined && val !== null) {
      remappedAnswers[placeholder] = String(val)
    }
  }

  // Enrich answers dynamically with role variants, Greek equivalents, and cases
  const enrichedAnswers = enrichAnswers(remappedAnswers, targetGender);

  // ─── HTML Template ───────────────────────────────────────────────────
  if (template.htmlContent) {
    return generateHTMLDoc(template, enrichedAnswers, temple, targetGender)
  }

  // ─── PDF Template ──────────────────────────────────────────────────
  if (template.fileUrl && template.fileUrl.endsWith('.pdf')) {
    return generatePDFDoc(template, enrichedAnswers, temple, targetGender)
  }

  // ─── DOCX Template ─────────────────────────────────────────────────
  if (template.fileUrl && (template.fileUrl.endsWith('.docx') || template.fileUrl.endsWith('.doc'))) {
    return generateDOCXDoc(template, enrichedAnswers, targetGender)
  }

  // ─── fileData fallback (stored as base64 in DB) ─────────────────────
  if (template.fileData) {
    // Detect type from stored mime or filename
    const mime = (template as any).fileMime || '';
    const name = (template as any).fileName || (template as any).nameEl || '';
    if (mime.includes('pdf') || name.endsWith('.pdf')) {
      return generatePDFDoc(template, enrichedAnswers, temple, targetGender)
    }
    if (mime.includes('word') || name.endsWith('.docx') || name.endsWith('.doc')) {
      return generateDOCXDoc(template, enrichedAnswers, targetGender)
    }
    // Default to DOCX if stored binary and no clear type
    return generateDOCXDoc(template, enrichedAnswers, targetGender)
  }

  return { success: false, error: 'Μη υποστηριζόμενος τύπος αρχείου.' }
}

// ═══════════════════════════════════════════════════════════════════════
// HTML Template Generation
// ═══════════════════════════════════════════════════════════════════════

function generateHTMLDoc(template: any, answers: Record<string, string>, temple: any, targetGender: 'male' | 'female') {
  let filledHtml = template.htmlContent || ''
  filledHtml = filledHtml.replace(/\{\{([^}]+)\}\}/g, (_: string, varName: string) => {
    const val = getNormalizedValue(varName.trim(), answers);
    if (!val) {
      console.log(`[docEngine.ts] Template variable "${varName.trim()}" not found in answers map.`);
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
// PDF Generation — Αντικατάσταση placeholder text μέσα στο PDF template
// ═══════════════════════════════════════════════════════════════════════

async function generatePDFDoc(template: any, answers: Record<string, string>, temple: any, targetGender: 'male' | 'female' = 'male') {
  try {
    // ── 1. Load template bytes ──────────────────────────────────────────
    let existingPdfBytes: Buffer;
    if (template.fileData) {
      existingPdfBytes = Buffer.from(template.fileData, 'base64');
    } else {
      const filePath = path.join(process.cwd(), 'public', template.fileUrl)
      existingPdfBytes = await fs.readFile(filePath)
    }

    // ── 2. Embed Greek font ────────────────────────────────────────────
    const regularPath = path.join(process.cwd(), 'public', 'fonts', 'Roboto-Regular.ttf')
    const boldPath    = path.join(process.cwd(), 'public', 'fonts', 'Roboto-Bold.ttf')
    const [regularBytes, boldBytes] = await Promise.all([
      fs.readFile(regularPath),
      fs.readFile(boldPath)
    ])

    // ── 3. Try to use the original PDF as a background (stamp approach) ─
    // We create a NEW PDF that:
    //   a) Uses the original PDF pages as background images (via embedPage)
    //   b) Overlays the replaced text on top
    // This preserves the original layout completely.

    const srcDoc = await PDFDocument.load(existingPdfBytes)
    const newDoc = await PDFDocument.create()
    newDoc.registerFontkit(fontkit)

    const font     = await newDoc.embedFont(regularBytes)
    const fontBold = await newDoc.embedFont(boldBytes)

    const srcPages = srcDoc.getPages()

    for (let pageIdx = 0; pageIdx < srcPages.length; pageIdx++) {
      const srcPage = srcPages[pageIdx]
      const { width, height } = srcPage.getSize()

      // Embed the original page as an XObject (background)
      const [embeddedPage] = await newDoc.embedPages([srcPage])

      const newPage = newDoc.addPage([width, height])

      // Draw the original page as background
      newPage.drawPage(embeddedPage, { x: 0, y: 0, width, height })

      // ── 4. Find and replace {{placeholders}} on this page ─────────────
      // We need to read the page's text annotations or content stream.
      // Since pdf-lib can't easily read text positions from existing PDFs,
      // we use a smarter approach: scan the raw content stream for
      // placeholder patterns and overlay replaced values.

      // Get raw page content to find placeholder coordinates (best-effort)
      // For each placeholder in the template's variable list, we overlay the value.
      // Since we can't know exact positions from pdf-lib alone, we use the
      // template's stored variable list (from the DB) to map values.

      // PRIMARY APPROACH: Replace using stored placeholder→value mapping
      // The template stores variables in `template.variables` as JSON array of strings
      // e.g. ["{{Όνομα}}", "{{Επώνυμο}}", ...]
      // We overlay replaced values in a structured layout on the page.

      const variables: string[] = (() => {
        try {
          if (template.variables) return JSON.parse(template.variables)
          return []
        } catch { return [] }
      })()

      if (variables.length > 0) {
        // Structured overlay: place values where the template expects them
        // Use a 2-column layout matching the original document structure
        let y = height - 160
        const labelX  = 50
        const valueX  = 220
        const fontSize = 10
        const lineH    = 18

        for (const rawVar of variables) {
          // Strip {{ }} or { } wrappers
          const varName = rawVar.replace(/^\{\{|\}\}$/g, '').replace(/^\{|\}$/g, '').trim()
          const val = getNormalizedValue(varName, answers)
          if (!val) continue
          if (y < 60) break

          newPage.drawText(val, {
            x: valueX,
            y,
            size: fontSize,
            font,
            color: rgb(0, 0, 0),
            maxWidth: width - valueX - 50,
          })
          y -= lineH
        }
      }
    }

    // ── 5. FALLBACK if no variables list: overlay ALL answers as a table ─
    // This is the old behavior — only used when variables[] is empty.
    if (srcPages.length > 0) {
      const variables: string[] = (() => {
        try { return template.variables ? JSON.parse(template.variables) : [] } catch { return [] }
      })()

      if (variables.length === 0) {
        // Draw answers as key-value pairs on first page
        const firstNew = newDoc.getPages()[0]
        const { height: h, width: w } = firstNew.getSize()
        let y = h - 160
        const fontSize = 10

        const importantKeys = [
          'Όνομα', 'Επώνυμο', 'ΟΝΟΜΑ', 'ΕΠΩΝΥΜΟ',
          'Πατρώνυμο', 'Μητρώνυμο', 'Ανάδοχος',
          'ΗΜΕΡΟΜΗΝΙΑ_ΤΕΛΕΣΗΣ', 'ΑΡΙΘΜ_ΠΡΩΤΟΚΟΛΛΟΥ', 'ΑΡΙΘΜ_ΒΙΒΛΙΟΥ',
          'Εφημέριος', 'ΕΦΗΜΕΡΙΟΣ',
          'Ονοματεπώνυμο_1', 'Ονοματεπώνυμο_2',
        ]

        const orderedEntries = [
          ...importantKeys
            .filter(k => answers[k])
            .map(k => [k, answers[k]] as [string, string]),
          ...Object.entries(answers)
            .filter(([k, v]) => v && !importantKeys.includes(k) && !k.startsWith('_'))
        ]

        for (const [key, value] of orderedEntries) {
          if (!value || y < 60) break
          firstNew.drawText(`${key.replace(/_/g, ' ')}: ${value}`, {
            x: 50, y,
            size: fontSize,
            font,
            color: rgb(0, 0, 0),
            maxWidth: w - 100,
          })
          y -= 16
        }
      }
    }

    const pdfBytes = await newDoc.save()
    const base64   = Buffer.from(pdfBytes).toString('base64')

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
// DOCX Generation (docxtemplater) — Κύρια μέθοδος για .docx templates
// ═══════════════════════════════════════════════════════════════════════

async function generateDOCXDoc(template: any, answers: Record<string, string>, targetGender: 'male' | 'female') {
  try {
    const Docxtemplater = (await import('docxtemplater')).default
    const PizZip        = (await import('pizzip')).default

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

    let buf;

    // ── Global XML Normalization & Gender Tokens ──────────────────────
    for (const fileName of Object.keys(zip.files)) {
      if (fileName.startsWith('word/') && fileName.endsWith('.xml')) {
        const xmlFile = zip.file(fileName);
        if (xmlFile) {
          let xml = xmlFile.asText();

          // ΚΡΙΣΙΜΟ: Ενώνει τα σπασμένα {{...}} runs που δημιουργεί το Word
          xml = mergeSplitRuns(xml);

          // Resolve Gender Tokens
          xml = resolveGenderTokens(xml, targetGender);

          if (format === 'brackets' || format === 'single_curly') {
            const regex = format === 'brackets'
              ? /\[([^\]]+)\]/g
              : /(?<!\{)\{([^{}]+)\}(?!\})/g;
            xml = xml.replace(regex, (match, key) => {
              const val = getNormalizedValue(key.trim(), answers);
              if (!val) {
                console.log(`[docEngine.ts] Variable "${key.trim()}" (match: "${match}") not found.`);
              }
              return (val || '').toString()
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
            });
          }

          zip.file(fileName, xml);
        }
      }
    }

    if (format === 'brackets' || format === 'single_curly') {
      buf = zip.generate({ type: 'nodebuffer', compression: 'DEFLATE' });
    } else {
      // mustache / default: χρησιμοποιεί {{ }} και getNormalizedValue για fuzzy matching
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        delimiters: { start: '{{', end: '}}' },
        parser: (tag) => {
          return {
            get: (scope: Record<string, string>) => {
              // Πρώτα ψάχνει στο enriched answers map
              const val = getNormalizedValue(tag, scope);
              if (!val) {
                // Fallback: ψάχνει απευθείας στα answers (για keys που δεν
                // ομαλοποιούνται σωστά)
                const directVal = scope[tag] || scope[tag.trim()] || '';
                if (!directVal) {
                  console.log(`[docEngine.ts] Variable "{{${tag}}}" not found in answers.`);
                }
                return directVal || '';
              }
              return val;
            }
          };
        }
      });
      doc.render(answers);
      buf = doc.getZip().generate({ type: 'nodebuffer', compression: 'DEFLATE' });
    }

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

function enrichAnswers(answers: Record<string, string>, targetGender: 'male' | 'female'): Record<string, string> {
  const enriched = { ...answers };

  // ── 1. Detect all roles present in the answers keys ──────────────────
  const roles = new Set<string>();
  for (const key of Object.keys(answers)) {
    const match = key.match(/^(groom|bride|father|mother|godparent|sponsor|witness|bestman|child)(?=[A-Z_]|$)/i);
    if (match) {
      roles.add(match[1].toLowerCase());
    }
  }

  // ── 2. Also detect roles from CeremonyPerson data sent via answers ───
  // Keys like "fatherFirstName", "motherLastName" etc. from generate-all route
  const roleMap: Record<string, string[]> = {
    father:    ['Πατέρα', 'ΠΑΤΕΡΑ'],
    mother:    ['Μητέρας', 'ΜΗΤΕΡΑΣ'],
    godparent: ['Αναδόχου', 'ΑΝΑΔΟΧΟΥ'],
    sponsor:   ['Αναδόχου', 'ΑΝΑΔΟΧΟΥ'],
    groom:     ['Γαμπρού', 'ΓΑΜΠΡΟΥ'],
    bride:     ['Νύφης', 'ΝΥΦΗΣ'],
    witness:   ['Κουμπάρου', 'ΚΟΥΜΠΑΡΟΥ'],
    bestman:   ['Κουμπάρου', 'ΚΟΥΜΠΑΡΟΥ'],
    child:     ['Τέκνου', 'ΤΕΚΝΟΥ'],
  };

  for (const role of roles) {
    const fName   = answers[`${role}FirstName`]  || answers[`${role}_firstName`]  || answers[`${role}Name`]  || answers[`${role}_name`]  || '';
    const lName   = answers[`${role}LastName`]   || answers[`${role}_lastName`]   || '';
    const fullName = answers[`${role}FullName`]  || answers[`${role}_fullName`]   || `${fName} ${lName}`.trim();
    const patName  = answers[`${role}FathersName`] || answers[`${role}_fathersName`] || '';
    const matName  = answers[`${role}MothersName`] || answers[`${role}_mothersName`] || '';

    // Standard english keys
    if (fName    && !enriched[`${role}FirstName`])  enriched[`${role}FirstName`]  = fName;
    if (fName    && !enriched[`${role}Name`])       enriched[`${role}Name`]       = fName;
    if (lName    && !enriched[`${role}LastName`])   enriched[`${role}LastName`]   = lName;
    if (fullName && !enriched[`${role}FullName`])   enriched[`${role}FullName`]   = fullName;
    if (patName  && !enriched[`${role}FathersName`]) enriched[`${role}FathersName`] = patName;
    if (matName  && !enriched[`${role}MothersName`]) enriched[`${role}MothersName`] = matName;

    // Greek equivalents for each role
    const grPrefixes = roleMap[role] || [];
    for (const grPrefix of grPrefixes) {
      const grPrefixUp = grPrefix.toUpperCase();
      if (fName) {
        enriched[`Όνομα_${grPrefix}`]          = fName;
        enriched[`ΟΝΟΜΑ_${grPrefixUp}`]        = fName;
      }
      if (lName) {
        enriched[`Επώνυμο_${grPrefix}`]        = lName;
        enriched[`ΕΠΩΝΥΜΟ_${grPrefixUp}`]      = lName;
      }
      if (fullName) {
        enriched[`Ονοματεπώνυμο_${grPrefix}`]  = fullName;
        enriched[`ΟΝΟΜΑΤΕΠΩΝΥΜΟ_${grPrefixUp}`] = fullName;
      }
    }

    // Role-specific Greek fields
    if (role === 'father' && fullName) {
      const gen = declineFullName(fullName, 'genitive', 'male');
      enriched['Πατρώνυμο']  = gen;
      enriched['ΠΑΤΡΩΝΥΜΟ']  = gen;
      // Βάπτιση: "τέκνο του Στεφάνου"
      enriched['Όνομα_Πατέρα_Γενική'] = declineGreekName(fName, 'genitive', 'male');
    }
    if (role === 'mother' && fullName) {
      const gen = declineFullName(fullName, 'genitive', 'female');
      enriched['Μητρώνυμο']  = gen;
      enriched['ΜΗΤΡΩΝΥΜΟ']  = gen;
      enriched['Όνομα_Μητέρας_Γενική'] = declineGreekName(fName, 'genitive', 'female');
    }
    if ((role === 'godparent' || role === 'sponsor') && fullName) {
      enriched['Ανάδοχος']   = fullName;
      enriched['ΑΝΑΔΟΧΟΣ']   = fullName;
      // Βάπτιση: "ο/η Σταμάτης Μπαθρέλλος"
      enriched['Ανάδοχος_Ονομαστική'] = fullName;
    }
    if (role === 'groom' && patName) {
      enriched['Πατρώνυμο_Γαμπρού']  = declineGreekName(patName, 'genitive', 'male');
      enriched['ΠΑΤΡΩΝΥΜΟ_ΓΑΜΠΡΟΥ'] = declineGreekName(patName, 'genitive', 'male');
    }
    if (role === 'bride' && patName) {
      enriched['Πατρώνυμο_Νύφης']  = declineGreekName(patName, 'genitive', 'male');
      enriched['ΠΑΤΡΩΝΥΜΟ_ΝΥΦΗΣ'] = declineGreekName(patName, 'genitive', 'male');
    }
    if (role === 'child') {
      // childName → Όνομα, childLastName → Επώνυμο
      if (fName) {
        enriched['Όνομα']  = fName;
        enriched['ΟΝΟΜΑ']  = fName;
        enriched['childName'] = fName;
        // Γενική για "τέκνο του/της"
        const childGen = declineGreekName(fName, 'genitive', targetGender);
        enriched['Όνομα_Γενική'] = childGen;
      }
      if (lName) {
        enriched['Επώνυμο'] = lName;
        enriched['ΕΠΩΝΥΜΟ'] = lName;
      }
    }
  }

  // ── 3. childName από CeremonyMeta (όταν δεν υπάρχει ως CeremonyPerson) ──
  const childName = answers['childName'] || answers['child_name'] || answers['baptizedFirstName'] || '';
  if (childName && !enriched['Όνομα']) {
    enriched['Όνομα']    = childName;
    enriched['ΟΝΟΜΑ']    = childName;
  }
  const childLastName = answers['childLastName'] || answers['child_lastName'] || '';
  if (childLastName && !enriched['Επώνυμο']) {
    enriched['Επώνυμο']  = childLastName;
    enriched['ΕΠΩΝΥΜΟ']  = childLastName;
  }

  // ── 4. Ονοματεπώνυμο_1 / _2 (πατέρας / μητέρα για παλιά templates) ──
  const fatherFull = enriched['fatherFullName'] || `${enriched['fatherFirstName'] || ''} ${enriched['fatherLastName'] || ''}`.trim();
  const motherFull = enriched['motherFullName'] || `${enriched['motherFirstName'] || ''} ${enriched['motherLastName'] || ''}`.trim();
  if (fatherFull && !enriched['Ονοματεπώνυμο_1']) {
    enriched['Ονοματεπώνυμο_1']  = fatherFull;
    enriched['ΟΝΟΜΑΤΕΠΩΝΥΜΟ_1'] = fatherFull;
  }
  if (motherFull && !enriched['Ονοματεπώνυμο_2']) {
    enriched['Ονοματεπώνυμο_2']  = motherFull;
    enriched['ΟΝΟΜΑΤΕΠΩΝΥΜΟ_2'] = motherFull;
  }

  // ── 5. Φύλο helpers ──────────────────────────────────────────────────
  enriched['ο/η']               = targetGender === 'male' ? 'ο' : 'η';
  enriched['του/της']           = targetGender === 'male' ? 'του' : 'της';
  enriched['γεννηθείς/σα']      = targetGender === 'male' ? 'γεννηθείς' : 'γεννηθείσα';
  enriched['ο/η_τέκνο']         = targetGender === 'male' ? 'το' : 'την';
  enriched['άρρεν/θήλυ']        = targetGender === 'male' ? 'άρρεν' : 'θήλυ';

  // ── 6. Genitive/Accusative cases for all name keys ───────────────────
  const allKeys = Object.keys(enriched);
  for (const key of allKeys) {
    const val = enriched[key];
    if (!val || typeof val !== 'string') continue;

    const isNameKey = key.includes('Name') || key.includes('name') ||
                      key.includes('Όνομα') || key.includes('Ονομα') ||
                      key.includes('Επώνυμο') || key.includes('Πατρώνυμο') ||
                      key.includes('Μητρώνυμο') || key.includes('Ανάδοχος') ||
                      key.includes('ΟΝΟΜΑ') || key.includes('ΕΠΩΝΥΜΟ') ||
                      key.includes('ΠΑΤΡΩΝΥΜΟ') || key.includes('ΜΗΤΡΩΝΥΜΟ') ||
                      key.includes('ΑΝΑΔΟΧΟΣ') || key.includes('ονοματεπωνυμο') ||
                      key.includes('ΟΝΟΜΑΤΕΠΩΝΥΜΟ');

    if (isNameKey) {
      let gender: 'male' | 'female' = 'male';
      const keyL = key.toLowerCase();
      if (keyL.includes('mother') || keyL.includes('bride') || keyL.includes('μητερα') || keyL.includes('νυφη')) {
        gender = 'female';
      } else if (keyL.includes('child') || keyL.includes('παιδι')) {
        gender = targetGender;
      }

      const genKey = `${key}_ΓΕΝΙΚΗ`;
      if (!enriched[genKey]) enriched[genKey] = declineFullName(val, 'genitive', gender);

      const accKey = `${key}_ΑΙΤΙΑΤΙΚΗ`;
      if (!enriched[accKey]) enriched[accKey] = declineFullName(val, 'accusative', gender);
    }
  }

  return enriched;
}
