import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateAllGamosDocs, generateAllBaptisiDocs, TokenData } from '@/lib/pdfEngine';
import { getSession } from '@/lib/auth';
import { declineGreekName } from '@/lib/greekDeclension';
import fs from 'fs';
import path from 'path';

function cleanGreekString(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove Greek accents/diacritics
    .replace(/[^a-z0-9α-ω]/g, '') // keep only alphanumeric
    .trim();
}

function fuzzyMatch(nameEl: string, docKey: string): boolean {
  const cleanName = cleanGreekString(nameEl);
  const cleanKey = cleanGreekString(docKey);
  if (!cleanName || !cleanKey) return false;

  // 1. Direct contains check
  if (cleanName.includes(cleanKey) || cleanKey.includes(cleanName)) return true;

  // 2. Break docKey into parts and check contains
  const keyParts = docKey.toLowerCase().split(/[^a-z0-9]/).filter(p => p.length >= 3);
  for (const part of keyParts) {
    const cleanPart = cleanGreekString(part);
    if (cleanPart && cleanName.includes(cleanPart)) return true;
  }

  // 3. Break nameEl into parts and check if contains docKey
  const nameParts = nameEl.toLowerCase().split(/[^a-z0-9]/).filter(p => p.length >= 3);
  for (const part of nameParts) {
    const cleanPart = cleanGreekString(part);
    if (cleanPart && cleanKey.includes(cleanPart)) return true;
  }

  return false;
}

function findCustomTemplate(customTemplates: any[], docKey: string, serviceType: string) {
  const serviceTypeLower = serviceType.toLowerCase();
  
  // 1. Direct match on docType (if saved as the specific document key or ID)
  let found = customTemplates.find(t => t.id === docKey || t.docType.toLowerCase() === docKey.toLowerCase());
  if (found) return found;

  // 2. Filter templates that belong to the current service category (e.g. 'vaptisi' or 'gamos')
  const catTemplates = customTemplates.filter(t => {
    const tType = t.docType.toLowerCase();
    return tType === serviceTypeLower || (serviceTypeLower === 'vaptisi' && tType === 'vaptisi') || (serviceTypeLower === 'gamos' && tType === 'gamos');
  });

  if (catTemplates.length > 0) {
    const keyClean = docKey.toLowerCase();
    
    // 3. Match based on keywords in nameEl (supporting both Greek and English/Latin)
    if (keyClean === 'bebaiosi') {
      const match = catTemplates.find(t => {
        const cleanName = cleanGreekString(t.nameEl);
        const nameL = t.nameEl.toLowerCase();
        return cleanName.includes('βεβαιωση') || nameL.includes('bebaiosi') || nameL.includes('certificate') || nameL.includes('cert');
      });
      if (match) return match;
    }
    if (keyClean === 'baptistiko') {
      const match = catTemplates.find(t => {
        const cleanName = cleanGreekString(t.nameEl);
        const nameL = t.nameEl.toLowerCase();
        return (cleanName.includes('πιστοποιητικο') || cleanName.includes('βαπτιστικο') || cleanName.includes('βαπτιση') || nameL.includes('baptistiko') || nameL.includes('baptism') || nameL.includes('sacrament')) 
          && !cleanName.includes('βεβαιωση') && !nameL.includes('bebaiosi') && !nameL.includes('certificate')
          && !cleanName.includes('δηλωση') && !nameL.includes('dilosi')
          && !cleanName.includes('απαντητικ') && !nameL.includes('apantitik');
      });
      if (match) return match;
    }
    if (keyClean === 'dilosi_anadoxou') {
      const match = catTemplates.find(t => {
        const cleanName = cleanGreekString(t.nameEl);
        const nameL = t.nameEl.toLowerCase();
        return cleanName.includes('δηλωση') || cleanName.includes('αναδοχ') || nameL.includes('dilosi') || nameL.includes('anadoxou') || nameL.includes('godparent') || nameL.includes('sponsor');
      });
      if (match) return match;
    }
    if (keyClean === 'apantitikon') {
      const match = catTemplates.find(t => {
        const cleanName = cleanGreekString(t.nameEl);
        const nameL = t.nameEl.toLowerCase();
        return cleanName.includes('απαντητικ') || cleanName.includes('απαντησ') || nameL.includes('apantitikon') || nameL.includes('answer') || nameL.includes('reply');
      });
      if (match) return match;
    }
    if (keyClean === 'aitisi') {
      const match = catTemplates.find(t => {
        const cleanName = cleanGreekString(t.nameEl);
        const nameL = t.nameEl.toLowerCase();
        return cleanName.includes('αιτηση') || nameL.includes('aitisi') || nameL.includes('application') || nameL.includes('request');
      });
      if (match) return match;
    }
    if (keyClean === 'pinakas_synthikon') {
      const match = catTemplates.find(t => {
        const cleanName = cleanGreekString(t.nameEl);
        const nameL = t.nameEl.toLowerCase();
        return cleanName.includes('πινακας') || cleanName.includes('συνθηκ') || nameL.includes('pinakas') || nameL.includes('synthikon') || nameL.includes('conditions') || nameL.includes('table');
      });
      if (match) return match;
    }
    if (keyClean === 'gamilion') {
      const match = catTemplates.find(t => {
        const cleanName = cleanGreekString(t.nameEl);
        const nameL = t.nameEl.toLowerCase();
        return cleanName.includes('γαμηλιο') || cleanName.includes('γραμμα') || cleanName.includes('επιστολη') || nameL.includes('gamilion') || nameL.includes('gramma') || nameL.includes('letter');
      });
      if (match) return match;
    }
    if (keyClean === 'dilosi_gampr') {
      const match = catTemplates.find(t => {
        const cleanName = cleanGreekString(t.nameEl);
        const nameL = t.nameEl.toLowerCase();
        const hasDilosi = cleanName.includes('δηλωση') || nameL.includes('dilosi');
        const hasGroom = cleanName.includes('γαμπρ') || cleanName.includes('νυμφιο') || nameL.includes('gampr') || nameL.includes('groom') || nameL.includes('nymphio');
        return hasDilosi && hasGroom;
      });
      if (match) return match;
    }
    if (keyClean === 'dilosi_nyfis') {
      const match = catTemplates.find(t => {
        const cleanName = cleanGreekString(t.nameEl);
        const nameL = t.nameEl.toLowerCase();
        const hasDilosi = cleanName.includes('δηλωση') || nameL.includes('dilosi');
        const hasBride = cleanName.includes('νυφη') || cleanName.includes('νυμφη') || nameL.includes('nyfis') || nameL.includes('bride') || nameL.includes('nymfi');
        return hasDilosi && hasBride;
      });
      if (match) return match;
    }

    // 4. Fallback fuzzy match inside the category
    const fuzzyCatMatch = catTemplates.find(t => fuzzyMatch(t.nameEl, docKey));
    if (fuzzyCatMatch) return fuzzyCatMatch;

    // 5. Fallback: if there is only 1 template in the category, use it
    if (catTemplates.length === 1) return catTemplates[0];
  }

  // 6. Global fallback search across all templates (ignoring serviceType category restriction)
  const globalFuzzyMatch = customTemplates.find(t => fuzzyMatch(t.nameEl, docKey));
  if (globalFuzzyMatch) return globalFuzzyMatch;

  return null;
}

export async function POST(req: NextRequest) {
 try {
 // [SECURITY] Require authenticated session
 const session = await getSession();
 if (!session?.templeId) {
 return NextResponse.json({ error: 'Unauthorized. Login required.' }, { status: 401 });
 }

 const { tokenId } = await req.json();
 if (!tokenId) return NextResponse.json({ error: 'tokenId required' }, { status: 400 });

  const token = await prisma.token.findUnique({
    where: { id: tokenId },
    include: {
      temple: {
        include: { metropolis: true }
      },
      ceremonyMeta: true,
      persons: true
    }
  });

 if (!token) return NextResponse.json({ error: 'Token not found' }, { status: 404 });

 // [SECURITY] Tenant isolation — token must belong to the authenticated user's temple
 if (token.templeId !== (session.templeId as string)) {
 return NextResponse.json({ error: 'Forbidden: Access denied.' }, { status: 403 });
 }

  const customTemplates = await prisma.docTemplate.findMany({
    where: { templeId: token.templeId }
  });

  // ─── Build Rich Answers Map for Custom Templates ───────────────────────
  const answers: Record<string, string> = {};
  
  if (token.ceremonyMeta?.dataJson) {
    try {
      const meta = JSON.parse(token.ceremonyMeta.dataJson);
      for (const [k, v] of Object.entries(meta)) {
        if (v !== null && v !== undefined) {
          answers[k] = String(v);
        }
      }
    } catch(e) {}
  }

  for (const p of token.persons) {
    const role = p.role;
    answers[`${role}FirstName`] = p.firstName || '';
    answers[`${role}LastName`] = p.lastName || '';
    answers[`${role}FullName`] = `${p.firstName || ''} ${p.lastName || ''}`.trim();
    answers[`${role}FathersName`] = p.fathersName || '';
    answers[`${role}_firstName`] = p.firstName || '';
    answers[`${role}_lastName`] = p.lastName || '';
    answers[`${role}_fullName`] = `${p.firstName || ''} ${p.lastName || ''}`.trim();
    answers[`${role}_fathersName`] = p.fathersName || '';
  }

  const serviceTypeLower = token.serviceType.toLowerCase();
  let childGender: 'male' | 'female' = 'male'; // fallback

  if (serviceTypeLower === 'vaptisi') {
    const father = token.persons.find(p => p.role === 'father');
    const mother = token.persons.find(p => p.role === 'mother');
    const godparent = token.persons.find(p => p.role === 'godparent');

    const childName = answers['childName'] || answers['name'] || '';
    const childLastName = answers['childLastName'] || answers['lastName'] || father?.lastName || '';

    // Simple gender heuristic based on child's name
    const childNameLower = childName.toLowerCase();
    if (childNameLower.endsWith('α') || childNameLower.endsWith('η') || childNameLower.endsWith('ω') || childNameLower.endsWith('ου') || childNameLower.endsWith('η')) {
      childGender = 'female';
    }
    
    // Explicit gender setting from answers if present
    const genderVal = answers['gender'] || answers['childGender'] || answers['φύλο'] || answers['φυλο'] || answers['γένος'] || '';
    const gValLower = String(genderVal).toLowerCase();
    if (gValLower.includes('θηλ') || gValLower.includes('female') || gValLower === 'θ' || gValLower === 'f') {
      childGender = 'female';
    }

    answers['Όνομα'] = childName;
    answers['Επώνυμο'] = childLastName;
    answers['ΟΝΟΜΑ'] = childName;
    answers['ΕΠΩΝΥΜΟ'] = childLastName;
    
    // gender helpers
    answers['γεννηθείς/σα'] = childGender === 'male' ? 'γεννηθείς' : 'γεννηθείσα';
    answers['γεννηθεις/σα'] = childGender === 'male' ? 'γεννηθείς' : 'γεννηθείσα';
    answers['ο/η'] = childGender === 'male' ? 'ο' : 'η';
    answers['του/της'] = childGender === 'male' ? 'του' : 'της';

    if (father) {
      // In narrative templates, "Πατρώνυμο" is typically the father's first name in genitive case (e.g. "του [Πατρώνυμο]" -> "του Στεφάνου")
      const fatherFirstGenitive = declineGreekName(father.firstName || '', 'genitive', 'male');
      answers['Πατρώνυμο'] = fatherFirstGenitive;
      answers['Όνομα_Πατέρα'] = father.firstName || '';
      answers['Όνομα_Πατέρα_Γενική'] = fatherFirstGenitive;
      answers['Επώνυμο_Πατέρα'] = father.lastName || '';
      answers['Επώνυμο_Πατέρα_Γενική'] = declineGreekName(father.lastName || '', 'genitive', 'male');
      
      answers['ΠΑΤΡΩΝΥΜΟ'] = fatherFirstGenitive;
      answers['ΟΝΟΜΑ_ΠΑΤΕΡΑ'] = father.firstName || '';
      answers['ΕΠΩΝΥΜΟ_ΠΑΤΕΡΑ'] = father.lastName || '';
    }
    if (mother) {
      // Mother's name in genitive case
      const motherFirstGenitive = declineGreekName(mother.firstName || '', 'genitive', 'female');
      answers['Μητρώνυμο'] = motherFirstGenitive;
      answers['Όνομα_Μητέρας'] = mother.firstName || '';
      answers['Όνομα_Μητέρας_Γενική'] = motherFirstGenitive;
      answers['Επώνυμο_Μητέρας'] = mother.lastName || '';
      answers['Επώνυμο_Μητέρας_Γενική'] = declineGreekName(mother.lastName || '', 'genitive', 'female');
      
      answers['ΜΗΤΡΩΝΥΜΟ'] = motherFirstGenitive;
      answers['ΟΝΟΜΑ_ΜΗΤΕΡΑΣ'] = mother.firstName || '';
      answers['ΕΠΩΝΥΜΟ_ΜΗΤΕΡΑΣ'] = mother.lastName || '';
    }
    if (godparent) {
      const godparentFullName = `${godparent.firstName || ''} ${godparent.lastName || ''}`.trim();
      answers['Ανάδοχος'] = godparentFullName;
      answers['Όνομα_Αναδόχου'] = godparent.firstName || '';
      answers['Επώνυμο_Αναδόχου'] = godparent.lastName || '';
      
      answers['ΑΝΑΔΟΧΟΣ'] = godparentFullName;
      answers['ΟΝΟΜΑ_ΑΝΑΔΟΧΟΥ'] = godparent.firstName || '';
      answers['ΕΠΩΝΥΜΟ_ΑΝΑΔΟΧΟΥ'] = godparent.lastName || '';
    }

      // Πόλη αναδόχου → [Πόλεως]
      if (answers['godparentCity']) {
        answers['Πόλεως'] = answers['godparentCity'];
        answers['ΠόληΑναδόχου'] = answers['godparentCity'];
      }

      // Conditional second-godparent block: [και Ανάδοχος 2 κάτοικος Πόλεως]
      const gp2Full = answers['Ανάδοχος_2'] || '';
      if (gp2Full) {
        const gp2City = answers['godparentCity2'] || answers['godparentCity'] || '';
        answers['και Ανάδοχος 2 κάτοικος Πόλεως'] = `και ${gp2Full} κάτοικος ${gp2City}`.trim();
      } else {
        answers['και Ανάδοχος 2 κάτοικος Πόλεως'] = '';
      }

      // ── Civil registry field mapping ────────────────────────────────
      if (answers['birthCity']) {
        answers['Πόλη'] = answers['birthCity'];
        answers['ΠόληΓέννησης'] = answers['birthCity'];
      }
      if (answers['civilRegistry']) {
        answers['civilRegistryName']    = answers['civilRegistry'];
        answers['ληξιαρχείο']           = answers['civilRegistry'];
        answers['Ληξιαρχείο']           = answers['civilRegistry'];
      }
      if (answers['civilRegistryNumber']) {
        answers['ΑριθμόςΛηξιαρχικής'] = answers['civilRegistryNumber'];
        answers['ΑριθμόςΠράξης'] = answers['civilRegistryNumber'];
      }
      if (answers['civilRegistryTome']) {
        answers['ΤόμοςΛηξιαρχείου'] = answers['civilRegistryTome'];
        answers['Τόμος'] = answers['civilRegistryTome'];
      }
      if (answers['civilRegistryYear']) {
        answers['ΈτοςΛηξιαρχικής'] = answers['civilRegistryYear'];
      }
      if (answers['godparentCity']) {
        answers['Πόλεως'] = answers['godparentCity'];
        answers['ΠόληΑναδόχου'] = answers['godparentCity'];
      }
      if (answers['birthDate']) {
        const bd = new Date(answers['birthDate']);
        const dayNum = bd.getDate();
        const monthNames = ['Ιανουαρίου','Φεβρουαρίου','Μαρτίου','Απριλίου','Μαΐου','Ιουνίου','Ιουλίου','Αυγούστου','Σεπτεμβρίου','Οκτωβρίου','Νοεμβρίου','Δεκεμβρίου'];
        const monthName = monthNames[bd.getMonth()];
        const yearNum = bd.getFullYear();
        const dayPadded = String(dayNum).padStart(2, '0');
        answers['ΗμερομηνίαΓέννησης'] = bd.toLocaleDateString('el-GR');
        answers['birthDateFormatted'] = bd.toLocaleDateString('el-GR');
        answers['00ῇ Μήνος 0000'] = `${dayPadded}ῇ ${monthName} ${yearNum}`;
        answers['00 Μήνας 0000'] = `${dayPadded} ${monthName} ${yearNum}`;
        answers['00ην Μηνός'] = `${dayPadded}ην ${monthName}`;
      }
  } else if (serviceTypeLower === 'gamos') {
    const groom = token.persons.find(p => p.role === 'groom');
    const bride = token.persons.find(p => p.role === 'bride');
    const koumparos = token.persons.find(p => p.role === 'koumbaros' || p.role === 'koumparos');

    if (groom) {
      const groomFull = `${groom.firstName || ''} ${groom.lastName || ''}`.trim();
      answers['groomName']              = groom.firstName || '';
      answers['groomLastName']          = groom.lastName || '';
      answers['groomFullName']          = groomFull;
      answers['groomFatherName']        = groom.fathersName || '';
      answers['groomMotherName']        = groom.mothersName || '';
      answers['groomMotherMaiden']      = answers['groomMotherMaiden'] || answers['groomsmothermaidenname'] || '';

      answers['Όνομα_Γαμπρού']          = groom.firstName || '';
      answers['Επώνυμο_Γαμπρού']        = groom.lastName || '';
      answers['Πατρώνυμο_Γαμπρού']      = groom.fathersName ? declineGreekName(groom.fathersName, 'genitive', 'male') : '';
      answers['ΟΝΟΜΑ_ΓΑΜΠΡΟΥ']          = groom.firstName || '';
      answers['ΕΠΩΝΥΜΟ_ΓΑΜΠΡΟΥ']        = groom.lastName || '';
      answers['ΠΑΤΡΩΝΥΜΟ_ΓΑΜΠΡΟΥ']      = answers['Πατρώνυμο_Γαμπρού'];
    }
    if (bride) {
      const brideFull = `${bride.firstName || ''} ${bride.lastName || ''}`.trim();
      answers['brideName']              = bride.firstName || '';
      answers['brideLastName']          = bride.lastName || '';
      answers['brideFullName']          = brideFull;
      answers['brideFatherName']        = bride.fathersName || '';
      answers['brideMotherName']        = bride.mothersName || '';
      answers['brideMotherMaiden']      = answers['brideMotherMaiden'] || answers['bridesmothermaidenname'] || '';

      answers['Όνομα_Νύφης']            = bride.firstName || '';
      answers['Επώνυμο_Νύφης']          = bride.lastName || '';
      answers['Πατρώνυμο_Νύφης']        = bride.fathersName ? declineGreekName(bride.fathersName, 'genitive', 'male') : '';
      answers['ΟΝΟΜΑ_ΝΥΦΗΣ']            = bride.firstName || '';
      answers['ΕΠΩΝΥΜΟ_ΝΥΦΗΣ']          = bride.lastName || '';
      answers['ΠΑΤΡΩΝΥΜΟ_ΝΥΦΗΣ']        = answers['Πατρώνυμο_Νύφης'];
    }
    if (koumparos) {
      const koumparosFull = `${koumparos.firstName || ''} ${koumparos.lastName || ''}`.trim();
      answers['koumparosName']          = koumparos.firstName || '';
      answers['koumparosFullName']      = koumparosFull;
      answers['Κουμπάρος']              = koumparosFull;
      answers['ΚΟΥΜΠΑΡΟΣ']              = koumparosFull;
    }
  }

  const grDate = token.ceremonyDate ? new Date(token.ceremonyDate).toLocaleDateString('el-GR', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
  answers['ΑΡΙΘΜ_ΠΡΩΤΟΚΟΛΛΟΥ'] = token.protocolNumber || '';
  answers['protocolNumber'] = token.protocolNumber || '';
  answers['ΑΡΙΘΜ_ΒΙΒΛΙΟΥ'] = token.bookNumber || '';
  answers['bookNumber'] = token.bookNumber || '';
  answers['000'] = token.bookNumber || '';
  answers['ΗΜΕΡΟΜΗΝΙΑ_ΤΕΛΕΣΗΣ'] = grDate;
  answers['ceremonyDate'] = grDate;

  if (token.ceremonyDate) {
    const d = new Date(token.ceremonyDate);
    const months = ['Ιανουαρίου','Φεβρουαρίου','Μαρτίου','Απριλίου','Μαΐου','Ιουνίου','Ιουλίου','Αυγούστου','Σεπτεμβρίου','Οκτωβρίου','Νοεμβρίου','Δεκεμβρίου'];
    answers['Ημέρα_Τέλεσης'] = String(d.getDate());
    answers['Μήνας_Τέλεσης'] = months[d.getMonth()];
    answers['Έτος_Τέλεσης'] = String(d.getFullYear());
    answers['day'] = String(d.getDate());
    answers['month'] = months[d.getMonth()];
    answers['year'] = String(d.getFullYear());
    answers['00ην Μηνός'] = `${d.getDate()}η ${months[d.getMonth()]}`;
    answers['00 Μήνας 0000'] = `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    answers['0000'] = String(d.getFullYear());
    answers['00'] = String(d.getDate()).padStart(2, '0');
    // Standard semantic keys for ceremony day/year (used by synonym groups and
    // as fallback targets in the example-value pattern matcher)
    answers['ceremonyDay']   = String(d.getDate());
    answers['ceremonyMonth'] = months[d.getMonth()];
    answers['ceremonyYear']  = String(d.getFullYear());
  }
  
  answers['Εφημέριος'] = token.assignedPriest || '';
  answers['ΕΦΗΜΕΡΙΟΣ'] = token.assignedPriest || '';
  answers['assignedPriest'] = token.assignedPriest || '';

  // Priest title/rank from temple settings → [Αρχιμανδρίτης του Οικουμενικού θρόνου]
  let templeSettingsObj: any = {};
  try { if (token.temple.settings) templeSettingsObj = JSON.parse(token.temple.settings); } catch(e) {}
  const priestTitle = templeSettingsObj.priestTitle || '';
  answers['Αρχιμανδρίτης του Οικουμενικού θρόνου'] = priestTitle;
  answers['priestTitle'] = priestTitle;
  answers['ΤίτλοςΙερέα'] = priestTitle;
  answers['Τίτλος Ιερέα'] = priestTitle;

  answers['ΝΑΟΣ_ΟΝΟΜΑ'] = token.temple.name || '';
  answers['templeName'] = token.temple.name || '';
  answers['ΝΑΟΣ_ΔΙΕΥΘΥΝΣΗ'] = token.temple.address || '';
  answers['ΜΗΤΡΟΠΟΛΗ'] = token.temple.metropolis?.name || '';
  answers['metropolisName'] = token.temple.metropolis?.name || '';

  // Πόλη Ναού — from temple.city field or temple settings JSON
  const templeCity: string = (token.temple as any).city
    || templeSettingsObj.city
    || templeSettingsObj.templeCity
    || '';
  answers['templeCity']    = templeCity;
  answers['ΠόληΝαού']      = templeCity;
  answers['ΠΟΛΗ_ΝΑΟΥ']     = templeCity;
  answers['ΤόποςΤελετής']  = templeCity;

  answers['ΗΜΕΡΟΜΗΝΙΑ'] = new Date().toLocaleDateString('el-GR', { day: 'numeric', month: 'long', year: 'numeric' });
  // ───────────────────────────────────────────────────────────────────────

  const tokenData: TokenData = {
    id: token.id,
    serviceType: token.serviceType,
    customerName: token.customerName || 'Οικογένεια',
    ceremonyDate: token.ceremonyDate,
    assignedPriest: token.assignedPriest,
    assignedPsaltis: token.assignedPsaltis,
    protocolNumber: token.protocolNumber,
    bookNumber: token.bookNumber,
    temple: { name: token.temple.name, address: token.temple.address, settings: token.temple.settings },
    ceremonyMeta: token.ceremonyMeta ? { dataJson: token.ceremonyMeta.dataJson } : null,
    persons: token.persons.map(p => ({ role: p.role, firstName: p.firstName, lastName: p.lastName, fathersName: p.fathersName })),
    customTemplates: customTemplates.map(t => ({ docType: t.docType, nameEl: t.nameEl, htmlContent: t.htmlContent })),
  };

  let docs: { key: string; label: string; buffer: Buffer; filename: string }[] = [];

  // Any uploaded file templates (DOCX/PDF) for this temple — regardless of docType.
  // If the temple has uploaded their own files, never fall back to generic hardcoded PDFs.
  const hasAnyUploadedFiles = customTemplates.some(t => t.fileUrl || t.fileData);

  // Helper to turn a template record into a doc entry
  const tplToEntry = (tpl: any) => {
    let ext = '.pdf';
    if (tpl.fileUrl) {
      if (tpl.fileUrl.endsWith('.docx') || tpl.fileUrl.endsWith('.doc')) ext = '.docx';
      else if (tpl.fileUrl.endsWith('.html')) ext = '.html';
    } else if (tpl.htmlContent) {
      ext = '.html';
    }
    return {
      key: tpl.id,
      label: tpl.nameEl,
      buffer: Buffer.alloc(0),
      filename: `${tpl.nameEl.replace(/\s+/g, '_')}${ext}`,
    };
  };

  // Templates matching the ceremony type exactly
  const templatesForType = customTemplates.filter(t => t.docType.toLowerCase() === serviceTypeLower);

  if (templatesForType.length > 0) {
    // Best case: templates with correct ceremony type
    docs = templatesForType.map(tplToEntry);
  } else if (hasAnyUploadedFiles) {
    // Temple has uploaded files but with wrong/missing docType → use ALL uploaded templates.
    // Admin should fix categories via the 🏷️ button on /admin/documents.
    console.warn(`[generate-all] No templates for docType="${serviceTypeLower}" — using ALL uploaded templates as fallback (fix template categories in /admin/documents)`);
    docs = customTemplates.filter(t => t.fileUrl || t.fileData || t.htmlContent).map(tplToEntry);
  } else if (serviceTypeLower === 'gamos') {
    docs = await generateAllGamosDocs(tokenData);
  } else if (serviceTypeLower === 'vaptisi') {
    docs = await generateAllBaptisiDocs(tokenData);
  } else {
    // Dynamic handling for other serviceTypes with no uploaded templates
    const relatedTemplates = customTemplates.filter(t => t.docType.toLowerCase() === serviceTypeLower);
    docs = relatedTemplates.map(tplToEntry);
  }


  const { generateFromTemplate } = await import('@/actions/docEngine');

  const result = [];
  for (const doc of docs) {
    const customTpl = findCustomTemplate(customTemplates, doc.key, token.serviceType);

    let fileBuffer: Buffer = doc.buffer;
    let filename: string = doc.filename;

    if (customTpl) {
      console.log(`[generate-all] Generating custom template for ${doc.key} (ID: ${customTpl.id})`);
      const genRes: any = await generateFromTemplate(customTpl.id, answers);
      if (genRes.success) {
        if (genRes.type === 'pdf' || genRes.type === 'docx') {
          fileBuffer = Buffer.from(genRes.base64, 'base64');
          filename = genRes.filename;
        } else if (genRes.type === 'html') {
          fileBuffer = Buffer.from(genRes.html, 'utf-8');
          filename = `${doc.label.replace(/\s+/g, '_')}_${Date.now()}.html`;
        }
      } else {
        console.error(`[generate-all] Failed to generate custom template for ${doc.key}:`, genRes.error);
      }
    }

    // Persist to File System
    const baseDir = path.join(process.cwd(), 'public', 'docs', token.templeId);
    if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true });
    
    const safeFilename = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.\-]/g, '_')}`;
    const filePath = path.join(baseDir, safeFilename);
    fs.writeFileSync(filePath, fileBuffer);
    
    const storagePath = `/docs/${token.templeId}/${safeFilename}`;

    // Persist to Database Object
    await prisma.document.create({
      data: {
        templeId: token.templeId,
        tokenId: token.id,
        docType: doc.key,
        fileName: doc.label,
        storagePath: storagePath
      }
    });

    result.push({
      key: doc.key,
      label: doc.label,
      filename: filename,
      base64: fileBuffer.toString('base64'),
      storagePath
    });
  }

 return NextResponse.json({ success: true, docs: result, count: result.length });

 } catch (error: any) {
 console.error('[generate-all] Error:', error);
 return NextResponse.json({ error: error.message }, { status: 500 });
 }
}
