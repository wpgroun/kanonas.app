import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateAllGamosDocs, generateAllBaptisiDocs, TokenData } from '@/lib/pdfEngine';
import { getSession } from '@/lib/auth';
import { declineGreekName } from '@/lib/greekDeclension';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

function cleanGreekString(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove Greek accents/diacritics
    .replace(/[^a-z0-9Ξ±-Ο‰]/g, '') // keep only alphanumeric
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
        return cleanName.includes('Ξ²ΞµΞ²Ξ±ΞΉΟ‰ΟƒΞ·') || nameL.includes('bebaiosi') || nameL.includes('certificate') || nameL.includes('cert');
      });
      if (match) return match;
    }
    if (keyClean === 'baptistiko') {
      const match = catTemplates.find(t => {
        const cleanName = cleanGreekString(t.nameEl);
        const nameL = t.nameEl.toLowerCase();
        return (cleanName.includes('Ο€ΞΉΟƒΟ„ΞΏΟ€ΞΏΞΉΞ·Ο„ΞΉΞΊΞΏ') || cleanName.includes('Ξ²Ξ±Ο€Ο„ΞΉΟƒΟ„ΞΉΞΊΞΏ') || cleanName.includes('Ξ²Ξ±Ο€Ο„ΞΉΟƒΞ·') || nameL.includes('baptistiko') || nameL.includes('baptism') || nameL.includes('sacrament')) 
          && !cleanName.includes('Ξ²ΞµΞ²Ξ±ΞΉΟ‰ΟƒΞ·') && !nameL.includes('bebaiosi') && !nameL.includes('certificate')
          && !cleanName.includes('Ξ΄Ξ·Ξ»Ο‰ΟƒΞ·') && !nameL.includes('dilosi')
          && !cleanName.includes('Ξ±Ο€Ξ±Ξ½Ο„Ξ·Ο„ΞΉΞΊ') && !nameL.includes('apantitik');
      });
      if (match) return match;
    }
    if (keyClean === 'dilosi_anadoxou') {
      const match = catTemplates.find(t => {
        const cleanName = cleanGreekString(t.nameEl);
        const nameL = t.nameEl.toLowerCase();
        return cleanName.includes('Ξ΄Ξ·Ξ»Ο‰ΟƒΞ·') || cleanName.includes('Ξ±Ξ½Ξ±Ξ΄ΞΏΟ‡') || nameL.includes('dilosi') || nameL.includes('anadoxou') || nameL.includes('godparent') || nameL.includes('sponsor');
      });
      if (match) return match;
    }
    if (keyClean === 'apantitikon') {
      const match = catTemplates.find(t => {
        const cleanName = cleanGreekString(t.nameEl);
        const nameL = t.nameEl.toLowerCase();
        return cleanName.includes('Ξ±Ο€Ξ±Ξ½Ο„Ξ·Ο„ΞΉΞΊ') || cleanName.includes('Ξ±Ο€Ξ±Ξ½Ο„Ξ·Οƒ') || nameL.includes('apantitikon') || nameL.includes('answer') || nameL.includes('reply');
      });
      if (match) return match;
    }
    if (keyClean === 'aitisi') {
      const match = catTemplates.find(t => {
        const cleanName = cleanGreekString(t.nameEl);
        const nameL = t.nameEl.toLowerCase();
        return cleanName.includes('Ξ±ΞΉΟ„Ξ·ΟƒΞ·') || nameL.includes('aitisi') || nameL.includes('application') || nameL.includes('request');
      });
      if (match) return match;
    }
    if (keyClean === 'pinakas_synthikon') {
      const match = catTemplates.find(t => {
        const cleanName = cleanGreekString(t.nameEl);
        const nameL = t.nameEl.toLowerCase();
        return cleanName.includes('Ο€ΞΉΞ½Ξ±ΞΊΞ±Ο‚') || cleanName.includes('ΟƒΟ…Ξ½ΞΈΞ·ΞΊ') || nameL.includes('pinakas') || nameL.includes('synthikon') || nameL.includes('conditions') || nameL.includes('table');
      });
      if (match) return match;
    }
    if (keyClean === 'gamilion') {
      const match = catTemplates.find(t => {
        const cleanName = cleanGreekString(t.nameEl);
        const nameL = t.nameEl.toLowerCase();
        return cleanName.includes('Ξ³Ξ±ΞΌΞ·Ξ»ΞΉΞΏ') || cleanName.includes('Ξ³ΟΞ±ΞΌΞΌΞ±') || cleanName.includes('ΞµΟ€ΞΉΟƒΟ„ΞΏΞ»Ξ·') || nameL.includes('gamilion') || nameL.includes('gramma') || nameL.includes('letter');
      });
      if (match) return match;
    }
    if (keyClean === 'dilosi_gampr') {
      const match = catTemplates.find(t => {
        const cleanName = cleanGreekString(t.nameEl);
        const nameL = t.nameEl.toLowerCase();
        const hasDilosi = cleanName.includes('Ξ΄Ξ·Ξ»Ο‰ΟƒΞ·') || nameL.includes('dilosi');
        const hasGroom = cleanName.includes('Ξ³Ξ±ΞΌΟ€Ο') || cleanName.includes('Ξ½Ο…ΞΌΟ†ΞΉΞΏ') || nameL.includes('gampr') || nameL.includes('groom') || nameL.includes('nymphio');
        return hasDilosi && hasGroom;
      });
      if (match) return match;
    }
    if (keyClean === 'dilosi_nyfis') {
      const match = catTemplates.find(t => {
        const cleanName = cleanGreekString(t.nameEl);
        const nameL = t.nameEl.toLowerCase();
        const hasDilosi = cleanName.includes('Ξ΄Ξ·Ξ»Ο‰ΟƒΞ·') || nameL.includes('dilosi');
        const hasBride = cleanName.includes('Ξ½Ο…Ο†Ξ·') || cleanName.includes('Ξ½Ο…ΞΌΟ†Ξ·') || nameL.includes('nyfis') || nameL.includes('bride') || nameL.includes('nymfi');
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

 // [SECURITY] Tenant isolation β€” token must belong to the authenticated user's temple
 if (token.templeId !== (session.templeId as string)) {
 return NextResponse.json({ error: 'Forbidden: Access denied.' }, { status: 403 });
 }

  const customTemplates = await prisma.docTemplate.findMany({
    where: { templeId: token.templeId }
  });

  // β”€β”€β”€ Build Rich Answers Map for Custom Templates β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€
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
    if (childNameLower.endsWith('Ξ±') || childNameLower.endsWith('Ξ·') || childNameLower.endsWith('Ο‰') || childNameLower.endsWith('ΞΏΟ…') || childNameLower.endsWith('Ξ·')) {
      childGender = 'female';
    }
    
    // Explicit gender setting from answers if present
    const genderVal = answers['gender'] || answers['childGender'] || answers['Ο†ΟΞ»ΞΏ'] || answers['Ο†Ο…Ξ»ΞΏ'] || answers['Ξ³Ξ­Ξ½ΞΏΟ‚'] || '';
    const gValLower = String(genderVal).toLowerCase();
    if (gValLower.includes('ΞΈΞ·Ξ»') || gValLower.includes('female') || gValLower === 'ΞΈ' || gValLower === 'f') {
      childGender = 'female';
    }

    answers['ΞΞ½ΞΏΞΌΞ±'] = childName;
    answers['Ξ•Ο€ΟΞ½Ο…ΞΌΞΏ'] = childLastName;
    answers['ΞΞΞΞΞ‘'] = childName;
    answers['Ξ•Ξ Ξ©ΞΞ¥ΞΞ'] = childLastName;
    
    // gender helpers
    answers['Ξ³ΞµΞ½Ξ½Ξ·ΞΈΞµΞ―Ο‚/ΟƒΞ±'] = childGender === 'male' ? 'Ξ³ΞµΞ½Ξ½Ξ·ΞΈΞµΞ―Ο‚' : 'Ξ³ΞµΞ½Ξ½Ξ·ΞΈΞµΞ―ΟƒΞ±';
    answers['Ξ³ΞµΞ½Ξ½Ξ·ΞΈΞµΞΉΟ‚/ΟƒΞ±'] = childGender === 'male' ? 'Ξ³ΞµΞ½Ξ½Ξ·ΞΈΞµΞ―Ο‚' : 'Ξ³ΞµΞ½Ξ½Ξ·ΞΈΞµΞ―ΟƒΞ±';
    answers['ΞΏ/Ξ·'] = childGender === 'male' ? 'ΞΏ' : 'Ξ·';
    answers['Ο„ΞΏΟ…/Ο„Ξ·Ο‚'] = childGender === 'male' ? 'Ο„ΞΏΟ…' : 'Ο„Ξ·Ο‚';

    if (father) {
      // In narrative templates, "Ξ Ξ±Ο„ΟΟΞ½Ο…ΞΌΞΏ" is typically the father's first name in genitive case (e.g. "Ο„ΞΏΟ… [Ξ Ξ±Ο„ΟΟΞ½Ο…ΞΌΞΏ]" -> "Ο„ΞΏΟ… Ξ£Ο„ΞµΟ†Ξ¬Ξ½ΞΏΟ…")
      const fatherFirstGenitive = declineGreekName(father.firstName || '', 'genitive', 'male');
      answers['Ξ Ξ±Ο„ΟΟΞ½Ο…ΞΌΞΏ'] = fatherFirstGenitive;
      answers['ΞΞ½ΞΏΞΌΞ±_Ξ Ξ±Ο„Ξ­ΟΞ±'] = father.firstName || '';
      answers['ΞΞ½ΞΏΞΌΞ±_Ξ Ξ±Ο„Ξ­ΟΞ±_Ξ“ΞµΞ½ΞΉΞΊΞ®'] = fatherFirstGenitive;
      answers['Ξ•Ο€ΟΞ½Ο…ΞΌΞΏ_Ξ Ξ±Ο„Ξ­ΟΞ±'] = father.lastName || '';
      answers['Ξ•Ο€ΟΞ½Ο…ΞΌΞΏ_Ξ Ξ±Ο„Ξ­ΟΞ±_Ξ“ΞµΞ½ΞΉΞΊΞ®'] = declineGreekName(father.lastName || '', 'genitive', 'male');
      
      answers['Ξ Ξ‘Ξ¤Ξ΅Ξ©ΞΞ¥ΞΞ'] = fatherFirstGenitive;
      answers['ΞΞΞΞΞ‘_Ξ Ξ‘Ξ¤Ξ•Ξ΅Ξ‘'] = father.firstName || '';
      answers['Ξ•Ξ Ξ©ΞΞ¥ΞΞ_Ξ Ξ‘Ξ¤Ξ•Ξ΅Ξ‘'] = father.lastName || '';
    }
    if (mother) {
      // Mother's name in genitive case
      const motherFirstGenitive = declineGreekName(mother.firstName || '', 'genitive', 'female');
      answers['ΞΞ·Ο„ΟΟΞ½Ο…ΞΌΞΏ'] = motherFirstGenitive;
      answers['ΞΞ½ΞΏΞΌΞ±_ΞΞ·Ο„Ξ­ΟΞ±Ο‚'] = mother.firstName || '';
      answers['ΞΞ½ΞΏΞΌΞ±_ΞΞ·Ο„Ξ­ΟΞ±Ο‚_Ξ“ΞµΞ½ΞΉΞΊΞ®'] = motherFirstGenitive;
      answers['Ξ•Ο€ΟΞ½Ο…ΞΌΞΏ_ΞΞ·Ο„Ξ­ΟΞ±Ο‚'] = mother.lastName || '';
      answers['Ξ•Ο€ΟΞ½Ο…ΞΌΞΏ_ΞΞ·Ο„Ξ­ΟΞ±Ο‚_Ξ“ΞµΞ½ΞΉΞΊΞ®'] = declineGreekName(mother.lastName || '', 'genitive', 'female');
      
      answers['ΞΞ—Ξ¤Ξ΅Ξ©ΞΞ¥ΞΞ'] = motherFirstGenitive;
      answers['ΞΞΞΞΞ‘_ΞΞ—Ξ¤Ξ•Ξ΅Ξ‘Ξ£'] = mother.firstName || '';
      answers['Ξ•Ξ Ξ©ΞΞ¥ΞΞ_ΞΞ—Ξ¤Ξ•Ξ΅Ξ‘Ξ£'] = mother.lastName || '';
    }
    if (godparent) {
      const godparentFullName = `${godparent.firstName || ''} ${godparent.lastName || ''}`.trim();
      answers['Ξ‘Ξ½Ξ¬Ξ΄ΞΏΟ‡ΞΏΟ‚'] = godparentFullName;
      answers['ΞΞ½ΞΏΞΌΞ±_Ξ‘Ξ½Ξ±Ξ΄ΟΟ‡ΞΏΟ…'] = godparent.firstName || '';
      answers['Ξ•Ο€ΟΞ½Ο…ΞΌΞΏ_Ξ‘Ξ½Ξ±Ξ΄ΟΟ‡ΞΏΟ…'] = godparent.lastName || '';
      
      answers['Ξ‘ΞΞ‘Ξ”ΞΞ§ΞΞ£'] = godparentFullName;
      answers['ΞΞΞΞΞ‘_Ξ‘ΞΞ‘Ξ”ΞΞ§ΞΞ¥'] = godparent.firstName || '';
      answers['Ξ•Ξ Ξ©ΞΞ¥ΞΞ_Ξ‘ΞΞ‘Ξ”ΞΞ§ΞΞ¥'] = godparent.lastName || '';
    }

      // Ξ ΟΞ»Ξ· Ξ±Ξ½Ξ±Ξ΄ΟΟ‡ΞΏΟ… β†’ [Ξ ΟΞ»ΞµΟ‰Ο‚]
      if (answers['godparentCity']) {
        answers['Ξ ΟΞ»ΞµΟ‰Ο‚'] = answers['godparentCity'];
        answers['Ξ ΟΞ»Ξ·Ξ‘Ξ½Ξ±Ξ΄ΟΟ‡ΞΏΟ…'] = answers['godparentCity'];
      }

      // Conditional second-godparent block: [ΞΊΞ±ΞΉ Ξ‘Ξ½Ξ¬Ξ΄ΞΏΟ‡ΞΏΟ‚ 2 ΞΊΞ¬Ο„ΞΏΞΉΞΊΞΏΟ‚ Ξ ΟΞ»ΞµΟ‰Ο‚]
      const gp2Full = answers['Ξ‘Ξ½Ξ¬Ξ΄ΞΏΟ‡ΞΏΟ‚_2'] || '';
      if (gp2Full) {
        const gp2City = answers['godparentCity2'] || answers['godparentCity'] || '';
        answers['ΞΊΞ±ΞΉ Ξ‘Ξ½Ξ¬Ξ΄ΞΏΟ‡ΞΏΟ‚ 2 ΞΊΞ¬Ο„ΞΏΞΉΞΊΞΏΟ‚ Ξ ΟΞ»ΞµΟ‰Ο‚'] = `ΞΊΞ±ΞΉ ${gp2Full} ΞΊΞ¬Ο„ΞΏΞΉΞΊΞΏΟ‚ ${gp2City}`.trim();
      } else {
        answers['ΞΊΞ±ΞΉ Ξ‘Ξ½Ξ¬Ξ΄ΞΏΟ‡ΞΏΟ‚ 2 ΞΊΞ¬Ο„ΞΏΞΉΞΊΞΏΟ‚ Ξ ΟΞ»ΞµΟ‰Ο‚'] = '';
      }

      // β”€β”€ Civil registry field mapping β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€
      if (answers['birthCity']) {
        answers['Ξ ΟΞ»Ξ·'] = answers['birthCity'];
        answers['Ξ ΟΞ»Ξ·Ξ“Ξ­Ξ½Ξ½Ξ·ΟƒΞ·Ο‚'] = answers['birthCity'];
      }
      if (answers['civilRegistry']) {
        answers['civilRegistryName']    = answers['civilRegistry'];
        answers['Ξ»Ξ·ΞΎΞΉΞ±ΟΟ‡ΞµΞ―ΞΏ']           = answers['civilRegistry'];
        answers['Ξ›Ξ·ΞΎΞΉΞ±ΟΟ‡ΞµΞ―ΞΏ']           = answers['civilRegistry'];
      }
      if (answers['civilRegistryNumber']) {
        answers['Ξ‘ΟΞΉΞΈΞΌΟΟ‚Ξ›Ξ·ΞΎΞΉΞ±ΟΟ‡ΞΉΞΊΞ®Ο‚'] = answers['civilRegistryNumber'];
        answers['Ξ‘ΟΞΉΞΈΞΌΟΟ‚Ξ ΟΞ¬ΞΎΞ·Ο‚'] = answers['civilRegistryNumber'];
      }
      if (answers['civilRegistryTome']) {
        answers['Ξ¤ΟΞΌΞΏΟ‚Ξ›Ξ·ΞΎΞΉΞ±ΟΟ‡ΞµΞ―ΞΏΟ…'] = answers['civilRegistryTome'];
        answers['Ξ¤ΟΞΌΞΏΟ‚'] = answers['civilRegistryTome'];
      }
      if (answers['civilRegistryYear']) {
        answers['ΞΟ„ΞΏΟ‚Ξ›Ξ·ΞΎΞΉΞ±ΟΟ‡ΞΉΞΊΞ®Ο‚'] = answers['civilRegistryYear'];
      }
      if (answers['godparentCity']) {
        answers['Ξ ΟΞ»ΞµΟ‰Ο‚'] = answers['godparentCity'];
        answers['Ξ ΟΞ»Ξ·Ξ‘Ξ½Ξ±Ξ΄ΟΟ‡ΞΏΟ…'] = answers['godparentCity'];
      }
      if (answers['birthDate']) {
        const bd = new Date(answers['birthDate']);
        const dayNum = bd.getDate();
        const monthNames = ['Ξ™Ξ±Ξ½ΞΏΟ…Ξ±ΟΞ―ΞΏΟ…','Ξ¦ΞµΞ²ΟΞΏΟ…Ξ±ΟΞ―ΞΏΟ…','ΞΞ±ΟΟ„Ξ―ΞΏΟ…','Ξ‘Ο€ΟΞΉΞ»Ξ―ΞΏΟ…','ΞΞ±ΞΞΏΟ…','Ξ™ΞΏΟ…Ξ½Ξ―ΞΏΟ…','Ξ™ΞΏΟ…Ξ»Ξ―ΞΏΟ…','Ξ‘Ο…Ξ³ΞΏΟΟƒΟ„ΞΏΟ…','Ξ£ΞµΟ€Ο„ΞµΞΌΞ²ΟΞ―ΞΏΟ…','ΞΞΊΟ„Ο‰Ξ²ΟΞ―ΞΏΟ…','ΞΞΏΞµΞΌΞ²ΟΞ―ΞΏΟ…','Ξ”ΞµΞΊΞµΞΌΞ²ΟΞ―ΞΏΟ…'];
        const monthName = monthNames[bd.getMonth()];
        const yearNum = bd.getFullYear();
        const dayPadded = String(dayNum).padStart(2, '0');
        answers['Ξ—ΞΌΞµΟΞΏΞΌΞ·Ξ½Ξ―Ξ±Ξ“Ξ­Ξ½Ξ½Ξ·ΟƒΞ·Ο‚'] = bd.toLocaleDateString('el-GR');
        answers['birthDateFormatted'] = bd.toLocaleDateString('el-GR');
        answers['00αΏ‡ ΞΞ®Ξ½ΞΏΟ‚ 0000'] = `${dayPadded}αΏ‡ ${monthName} ${yearNum}`;
        answers['00 ΞΞ®Ξ½Ξ±Ο‚ 0000'] = `${dayPadded} ${monthName} ${yearNum}`;
        answers['00Ξ·Ξ½ ΞΞ·Ξ½ΟΟ‚'] = `${dayPadded}Ξ·Ξ½ ${monthName}`;
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

      answers['ΞΞ½ΞΏΞΌΞ±_Ξ“Ξ±ΞΌΟ€ΟΞΏΟ']          = groom.firstName || '';
      answers['Ξ•Ο€ΟΞ½Ο…ΞΌΞΏ_Ξ“Ξ±ΞΌΟ€ΟΞΏΟ']        = groom.lastName || '';
      answers['Ξ Ξ±Ο„ΟΟΞ½Ο…ΞΌΞΏ_Ξ“Ξ±ΞΌΟ€ΟΞΏΟ']      = groom.fathersName ? declineGreekName(groom.fathersName, 'genitive', 'male') : '';
      answers['ΞΞΞΞΞ‘_Ξ“Ξ‘ΞΞ Ξ΅ΞΞ¥']          = groom.firstName || '';
      answers['Ξ•Ξ Ξ©ΞΞ¥ΞΞ_Ξ“Ξ‘ΞΞ Ξ΅ΞΞ¥']        = groom.lastName || '';
      answers['Ξ Ξ‘Ξ¤Ξ΅Ξ©ΞΞ¥ΞΞ_Ξ“Ξ‘ΞΞ Ξ΅ΞΞ¥']      = answers['Ξ Ξ±Ο„ΟΟΞ½Ο…ΞΌΞΏ_Ξ“Ξ±ΞΌΟ€ΟΞΏΟ'];
    }
    if (bride) {
      const brideFull = `${bride.firstName || ''} ${bride.lastName || ''}`.trim();
      answers['brideName']              = bride.firstName || '';
      answers['brideLastName']          = bride.lastName || '';
      answers['brideFullName']          = brideFull;
      answers['brideFatherName']        = bride.fathersName || '';
      answers['brideMotherName']        = bride.mothersName || '';
      answers['brideMotherMaiden']      = answers['brideMotherMaiden'] || answers['bridesmothermaidenname'] || '';

      answers['ΞΞ½ΞΏΞΌΞ±_ΞΟΟ†Ξ·Ο‚']            = bride.firstName || '';
      answers['Ξ•Ο€ΟΞ½Ο…ΞΌΞΏ_ΞΟΟ†Ξ·Ο‚']          = bride.lastName || '';
      answers['Ξ Ξ±Ο„ΟΟΞ½Ο…ΞΌΞΏ_ΞΟΟ†Ξ·Ο‚']        = bride.fathersName ? declineGreekName(bride.fathersName, 'genitive', 'male') : '';
      answers['ΞΞΞΞΞ‘_ΞΞ¥Ξ¦Ξ—Ξ£']            = bride.firstName || '';
      answers['Ξ•Ξ Ξ©ΞΞ¥ΞΞ_ΞΞ¥Ξ¦Ξ—Ξ£']          = bride.lastName || '';
      answers['Ξ Ξ‘Ξ¤Ξ΅Ξ©ΞΞ¥ΞΞ_ΞΞ¥Ξ¦Ξ—Ξ£']        = answers['Ξ Ξ±Ο„ΟΟΞ½Ο…ΞΌΞΏ_ΞΟΟ†Ξ·Ο‚'];
    }
    if (koumparos) {
      const koumparosFull = `${koumparos.firstName || ''} ${koumparos.lastName || ''}`.trim();
      answers['koumparosName']          = koumparos.firstName || '';
      answers['koumparosFullName']      = koumparosFull;
      answers['ΞΞΏΟ…ΞΌΟ€Ξ¬ΟΞΏΟ‚']              = koumparosFull;
      answers['ΞΞΞ¥ΞΞ Ξ‘Ξ΅ΞΞ£']              = koumparosFull;
    }
  }

  const grDate = token.ceremonyDate ? new Date(token.ceremonyDate).toLocaleDateString('el-GR', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
  answers['Ξ‘Ξ΅Ξ™ΞΞ_Ξ Ξ΅Ξ©Ξ¤ΞΞΞΞ›Ξ›ΞΞ¥'] = token.protocolNumber || '';
  answers['protocolNumber'] = token.protocolNumber || '';
  answers['Ξ‘Ξ΅Ξ™ΞΞ_Ξ’Ξ™Ξ’Ξ›Ξ™ΞΞ¥'] = token.bookNumber || '';
  answers['bookNumber'] = token.bookNumber || '';
  answers['000'] = token.bookNumber || '';
  answers['Ξ—ΞΞ•Ξ΅ΞΞΞ—ΞΞ™Ξ‘_Ξ¤Ξ•Ξ›Ξ•Ξ£Ξ—Ξ£'] = grDate;
  answers['ceremonyDate'] = grDate;

  if (token.ceremonyDate) {
    const d = new Date(token.ceremonyDate);
    const months = ['Ξ™Ξ±Ξ½ΞΏΟ…Ξ±ΟΞ―ΞΏΟ…','Ξ¦ΞµΞ²ΟΞΏΟ…Ξ±ΟΞ―ΞΏΟ…','ΞΞ±ΟΟ„Ξ―ΞΏΟ…','Ξ‘Ο€ΟΞΉΞ»Ξ―ΞΏΟ…','ΞΞ±ΞΞΏΟ…','Ξ™ΞΏΟ…Ξ½Ξ―ΞΏΟ…','Ξ™ΞΏΟ…Ξ»Ξ―ΞΏΟ…','Ξ‘Ο…Ξ³ΞΏΟΟƒΟ„ΞΏΟ…','Ξ£ΞµΟ€Ο„ΞµΞΌΞ²ΟΞ―ΞΏΟ…','ΞΞΊΟ„Ο‰Ξ²ΟΞ―ΞΏΟ…','ΞΞΏΞµΞΌΞ²ΟΞ―ΞΏΟ…','Ξ”ΞµΞΊΞµΞΌΞ²ΟΞ―ΞΏΟ…'];
    answers['Ξ—ΞΌΞ­ΟΞ±_Ξ¤Ξ­Ξ»ΞµΟƒΞ·Ο‚'] = String(d.getDate());
    answers['ΞΞ®Ξ½Ξ±Ο‚_Ξ¤Ξ­Ξ»ΞµΟƒΞ·Ο‚'] = months[d.getMonth()];
    answers['ΞΟ„ΞΏΟ‚_Ξ¤Ξ­Ξ»ΞµΟƒΞ·Ο‚'] = String(d.getFullYear());
    answers['day'] = String(d.getDate());
    answers['month'] = months[d.getMonth()];
    answers['year'] = String(d.getFullYear());
    answers['00Ξ·Ξ½ ΞΞ·Ξ½ΟΟ‚'] = `${d.getDate()}Ξ· ${months[d.getMonth()]}`;
    answers['00 ΞΞ®Ξ½Ξ±Ο‚ 0000'] = `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    answers['0000'] = String(d.getFullYear());
    answers['00'] = String(d.getDate()).padStart(2, '0');
    // Standard semantic keys for ceremony day/year (used by synonym groups and
    // as fallback targets in the example-value pattern matcher)
    answers['ceremonyDay']   = String(d.getDate());
    answers['ceremonyMonth'] = months[d.getMonth()];
    answers['ceremonyYear']  = String(d.getFullYear());
  }
  
  answers['Ξ•Ο†Ξ·ΞΌΞ­ΟΞΉΞΏΟ‚'] = token.assignedPriest || '';
  answers['Ξ•Ξ¦Ξ—ΞΞ•Ξ΅Ξ™ΞΞ£'] = token.assignedPriest || '';
  answers['assignedPriest'] = token.assignedPriest || '';

  // Priest title/rank from temple settings β†’ [Ξ‘ΟΟ‡ΞΉΞΌΞ±Ξ½Ξ΄ΟΞ―Ο„Ξ·Ο‚ Ο„ΞΏΟ… ΞΞΉΞΊΞΏΟ…ΞΌΞµΞ½ΞΉΞΊΞΏΟ ΞΈΟΟΞ½ΞΏΟ…]
  let templeSettingsObj: any = {};
  try { if (token.temple.settings) templeSettingsObj = JSON.parse(token.temple.settings); } catch(e) {}
  const priestTitle = templeSettingsObj.priestTitle || '';
  answers['Ξ‘ΟΟ‡ΞΉΞΌΞ±Ξ½Ξ΄ΟΞ―Ο„Ξ·Ο‚ Ο„ΞΏΟ… ΞΞΉΞΊΞΏΟ…ΞΌΞµΞ½ΞΉΞΊΞΏΟ ΞΈΟΟΞ½ΞΏΟ…'] = priestTitle;
  answers['priestTitle'] = priestTitle;
  answers['Ξ¤Ξ―Ο„Ξ»ΞΏΟ‚Ξ™ΞµΟΞ­Ξ±'] = priestTitle;
  answers['Ξ¤Ξ―Ο„Ξ»ΞΏΟ‚ Ξ™ΞµΟΞ­Ξ±'] = priestTitle;

  answers['ΞΞ‘ΞΞ£_ΞΞΞΞΞ‘'] = token.temple.name || '';
  answers['templeName'] = token.temple.name || '';
  answers['ΞΞ‘ΞΞ£_Ξ”Ξ™Ξ•Ξ¥ΞΞ¥ΞΞ£Ξ—'] = token.temple.address || '';
  answers['ΞΞ—Ξ¤Ξ΅ΞΞ ΞΞ›Ξ—'] = token.temple.metropolis?.name || '';
  answers['metropolisName'] = token.temple.metropolis?.name || '';

  // Ξ ΟΞ»Ξ· ΞΞ±ΞΏΟ β€” from temple.city field or temple settings JSON
  const templeCity: string = (token.temple as any).city
    || templeSettingsObj.city
    || templeSettingsObj.templeCity
    || '';
  answers['templeCity']    = templeCity;
  answers['Ξ ΟΞ»Ξ·ΞΞ±ΞΏΟ']      = templeCity;
  answers['Ξ ΞΞ›Ξ—_ΞΞ‘ΞΞ¥']     = templeCity;
  answers['Ξ¤ΟΟ€ΞΏΟ‚Ξ¤ΞµΞ»ΞµΟ„Ξ®Ο‚']  = templeCity;

  answers['Ξ—ΞΞ•Ξ΅ΞΞΞ—ΞΞ™Ξ‘'] = new Date().toLocaleDateString('el-GR', { day: 'numeric', month: 'long', year: 'numeric' });
  // β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€

  const tokenData: TokenData = {
    id: token.id,
    serviceType: token.serviceType,
    customerName: token.customerName || 'ΞΞΉΞΊΞΏΞ³Ξ­Ξ½ΞµΞΉΞ±',
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

  // Any uploaded file templates (DOCX/PDF) for this temple β€” regardless of docType.
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
    // Temple has uploaded files but with wrong/missing docType β†’ use ALL uploaded templates.
    // Admin should fix categories via the π·οΈ button on /admin/documents.
    console.warn(`[generate-all] No templates for docType="${serviceTypeLower}" β€” using ALL uploaded templates as fallback (fix template categories in /admin/documents)`);
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
