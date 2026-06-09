import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateAllGamosDocs, generateAllBaptisiDocs, TokenData } from '@/lib/pdfEngine';
import { getSession } from '@/lib/auth';
import { declineGreekName, declineFullName } from '@/lib/greekDeclension';
import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.templeId) {
      return NextResponse.json({ error: 'Unauthorized. Login required.' }, { status: 401 });
    }

    const { tokenId } = await req.json();
    if (!tokenId) return NextResponse.json({ error: 'tokenId required' }, { status: 400 });

    const token = await prisma.token.findUnique({
      where: { id: tokenId },
      include: {
        temple: { include: { metropolis: true } },
        ceremonyMeta: true,
        persons: true,
      },
    });

    if (!token) return NextResponse.json({ error: 'Token not found' }, { status: 404 });

    if (token.templeId !== (session.templeId as string)) {
      return NextResponse.json({ error: 'Forbidden: Access denied.' }, { status: 403 });
    }

    const customTemplates = await prisma.docTemplate.findMany({
      where: { templeId: token.templeId },
    });

    // ─── Build Rich Answers Map ───────────────────────────────────────────────
    const answers: Record<string, string> = {};

    if (token.ceremonyMeta?.dataJson) {
      try {
        const meta = JSON.parse(token.ceremonyMeta.dataJson);
        for (const [k, v] of Object.entries(meta)) {
          if (v !== null && v !== undefined) answers[k] = String(v);
        }
      } catch (e) {}
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
    let childGender: 'male' | 'female' = 'male';

    if (serviceTypeLower === 'vaptisi') {
      const father = token.persons.find(p => p.role === 'father');
      const mother = token.persons.find(p => p.role === 'mother');
      const godparent = token.persons.find(p => p.role === 'godparent');

      const childName = answers['childName'] || answers['name'] || '';
      const childLastName = answers['childLastName'] || answers['lastName'] || father?.lastName || '';

      const childNameLower = childName.toLowerCase();
      if (
        childNameLower.endsWith('α') ||
        childNameLower.endsWith('η') ||
        childNameLower.endsWith('ω') ||
        childNameLower.endsWith('ου')
      ) {
        childGender = 'female';
      }

      const genderVal =
        answers['gender'] || answers['childGender'] || answers['φύλο'] || answers['φυλο'] || answers['γένος'] || '';
      const gValLower = String(genderVal).toLowerCase();
      if (gValLower.includes('θηλ') || gValLower.includes('female') || gValLower === 'θ' || gValLower === 'f') {
        childGender = 'female';
      }

      answers['Όνομα'] = childName;
      answers['Όνομα τέκνου'] = childName;   // [Όνομα τέκνου] in DilosiBaptiseos
      answers['Επώνυμο'] = childLastName;
      answers['ΟΝΟΜΑ'] = childName;
      answers['ΕΠΩΝΥΜΟ'] = childLastName;
      answers['γεννηθείς/σα'] = childGender === 'male' ? 'γεννηθείς' : 'γεννηθείσα';
      answers['γεννηθεις/σα'] = childGender === 'male' ? 'γεννηθείς' : 'γεννηθείσα';
      answers['ο/η'] = childGender === 'male' ? 'ο' : 'η';
      answers['του/της'] = childGender === 'male' ? 'του' : 'της';
      // Greek grammatical agreement variables (gender/number inflections for baptism certificates)
      answers['ον/ην'] = childGender === 'male' ? 'ον' : 'ην';   // Στον/Στην νεοφώτιστο/η
      answers['ού/ής'] = childGender === 'male' ? 'ού' : 'ής';   // αυτού/αυτής

      if (father) {
        const fatherFirstGenitive = declineGreekName(father.firstName || '', 'genitive', 'male');
        answers['Πατρώνυμο'] = fatherFirstGenitive;
        // fatherName = genitive (patronymic context always needs genitive in Greek)
        // enrichAnswers sees it pre-set and won't overwrite with nominative
        answers['fatherName']      = fatherFirstGenitive;
        answers['Όνομα_Πατέρα']    = father.firstName || '';  // nominative — for signature lines
        answers['Όνομα_Πατέρα_Γενική'] = fatherFirstGenitive;
        answers['Επώνυμο_Πατέρα'] = father.lastName || '';
        answers['Επώνυμο_Πατέρα_Γενική'] = declineGreekName(father.lastName || '', 'genitive', 'male');
        answers['ΠΑΤΡΩΝΥΜΟ'] = fatherFirstGenitive;
        answers['ΟΝΟΜΑ_ΠΑΤΕΡΑ'] = father.firstName || '';
        answers['ΕΠΩΝΥΜΟ_ΠΑΤΕΡΑ'] = father.lastName || '';
      }
      if (mother) {
        const motherFirstGenitive = declineGreekName(mother.firstName || '', 'genitive', 'female');
        answers['Μητρώνυμο'] = motherFirstGenitive;
        // motherName = genitive (matronymic context)
        answers['motherName']      = motherFirstGenitive;
        answers['Όνομα_Μητέρας']   = mother.firstName || '';  // nominative
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
        answers['Ανάδοχος_1'] = godparentFullName;   // [Ανάδοχος 1] variant
        answers['Ανάδοχος1'] = godparentFullName;     // [Ανάδοχος1] variant
        answers['Όνομα_Αναδόχου'] = godparent.firstName || '';
        answers['Επώνυμο_Αναδόχου'] = godparent.lastName || '';
        answers['ΑΝΑΔΟΧΟΣ'] = godparentFullName;
        answers['ΟΝΟΜΑ_ΑΝΑΔΟΧΟΥ'] = godparent.firstName || '';
        answers['ΕΠΩΝΥΜΟ_ΑΝΑΔΟΧΟΥ'] = godparent.lastName || '';
      }

      // Second godparent if present (role: godparent2)
      const godparent2 = token.persons.find(p => p.role === 'godparent2');
      if (godparent2) {
        const gp2Full = `${godparent2.firstName || ''} ${godparent2.lastName || ''}`.trim();
        answers['Ανάδοχος_2'] = gp2Full;
        answers['Ανάδοχος2'] = gp2Full;
        // Second godparent signature line — includes underscores so the line vanishes when empty
        answers['ΥπογραφήΒ'] = `_________________________  ${gp2Full}`;
        // Detect godparent2 gender from first name ending
        const gp2NameLower = (godparent2.firstName || '').toLowerCase();
        const gp2Article = (gp2NameLower.endsWith('α') || gp2NameLower.endsWith('η') || gp2NameLower.endsWith('ω')) ? 'η' : 'ο';
        const gp2City = (godparent2 as any).city || answers['godparent2City'] || '';
        answers['και ο/η Ανάδοχος2 κάτοικος Πόλεως'] = `και ${gp2Article} ${gp2Full} κάτοικος ${gp2City}`.trim();
        answers['ος/οι'] = 'οι'; // two godparents
      } else {
        answers['Ανάδοχος_2'] = '';
        answers['Ανάδοχος2'] = '';
        answers['ΥπογραφήΒ'] = ''; // no 2nd godparent → empty line (no underscores)
        answers['και ο/η Ανάδοχος2 κάτοικος Πόλεως'] = '';
        answers['ος/οι'] = 'ος'; // one godparent
      }

      // Gender indicator as used in Greek documents: άρρεν / θήλυ
      const genderGr = childGender === 'male' ? 'άρρεν' : 'θήλυ';
      answers['φύλο'] = genderGr;
      answers['φύλο τέκνου'] = genderGr;  // [φύλο τέκνου] variant
      answers['childGender'] = genderGr; // Greek display value (άρρεν/θήλυ)

      // Father full name — both cases available for different template contexts
      if (father) {
        const fFull = `${father.firstName || ''} ${father.lastName || ''}`.trim();
        const fFullGen = declineFullName(fFull, 'genitive', 'male');
        // Genitive keys (τέκνο του X, Πατρός = genitive)
        answers['Ονοματεπώνυμο_Πατρός'] = fFullGen;
        answers['fatherFullNameGen']     = fFullGen;
        // Nominative keys (signature lines, labels)
        answers['Ονοματεπώνυμο_Πατέρα'] = fFull;
        answers['fatherFullName']        = fFull;
      }
      // Mother full name — both cases available for different template contexts
      if (mother) {
        const mFull = `${mother.firstName || ''} ${mother.lastName || ''}`.trim();
        const mFullGen = declineFullName(mFull, 'genitive', 'female');
        // Genitive keys (και της X, Μητρός = genitive)
        answers['Ονοματεπώνυμο_Μητρός'] = mFullGen;
        answers['motherFullNameGen']     = mFullGen;
        // Nominative keys (signature lines, labels)
        answers['Ονοματεπώνυμο_Μητέρας'] = mFull;
        answers['motherFullName']         = mFull;
      }

      // ── Νέα πεδία από το ερωτηματολόγιο ──────────────────────────────────

      // Πόλη γέννησης → [Πόλη]
      if (answers['birthCity']) {
        answers['Πόλη'] = answers['birthCity'];
        answers['ΠόληΓέννησης'] = answers['birthCity'];
      }

      // Ληξιαρχείο → [ληξιαρχείο]
      if (answers['civilRegistry']) {
        answers['ληξιαρχείο'] = answers['civilRegistry'];
        answers['Ληξιαρχείο'] = answers['civilRegistry'];
      }

      // Στοιχεία ληξιαρχικής πράξης — ονομαστικά keys για χρήση σε templates
      // (τα [000]/[00]/[0000] είναι ασαφή, ο ναός πρέπει να τα μετονομάσει στο template)
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

      // Ημερομηνία γέννησης → [00ῇ Μήνος 0000]
      // cleanKey('00ῇ Μήνος 0000') = '00ημηνοσ0000' (ῇ→η μετά NFD+accent strip)
      if (answers['birthDate']) {
        const bd = new Date(answers['birthDate']);
        if (!isNaN(bd.getTime())) {
          const bdMonths = [
            'Ιανουαρίου','Φεβρουαρίου','Μαρτίου','Απριλίου','Μαΐου','Ιουνίου',
            'Ιουλίου','Αυγούστου','Σεπτεμβρίου','Οκτωβρίου','Νοεμβρίου','Δεκεμβρίου',
          ];
          const bdFormatted = `${bd.getDate()} ${bdMonths[bd.getMonth()]} ${bd.getFullYear()}`;
          answers['ΗμερομηνίαΓέννησης'] = bdFormatted;
          answers['birthDateFormatted'] = bdFormatted;
          answers['birthDate']          = bdFormatted; // overwrite raw ISO so synonym lookup returns formatted
          // Literal key for template placeholder [00ῇ Μήνος 0000]
          answers['00ῇ Μήνος 0000'] = bdFormatted;
          // Birth date breakdown for Baptistiko-style templates ([17ην] [Σεπτεμβρίου] [2020])
          answers['birthDay']        = `${bd.getDate()}ην`;
          answers['birthMonth']      = bdMonths[bd.getMonth()];
          answers['birthYear']       = String(bd.getFullYear());
          answers['ΕΤΟΣ_ΓΕΝΝΗΣΗΣ']  = String(bd.getFullYear());
          // [00ην Μηνός 0000] — birth date with ordinal day (DilosiBaptiseos)
          answers['00ην Μηνός 0000'] = `${bd.getDate()}ην ${bdMonths[bd.getMonth()]} ${bd.getFullYear()}`;
          // [00 Μηνός 0000] — plain form
          answers['00 Μηνός 0000']   = `${bd.getDate()} ${bdMonths[bd.getMonth()]} ${bd.getFullYear()}`;
        }
      }

      // Αιτιατική ονόματος/επωνύμου τέκνου (για Απαντητικόν: [Αλέξανδρον], [Συνοδινόν])
      const cFirst = answers['childName'] || '';
      const cLast  = answers['childLastName'] || (father ? father.lastName || '' : '');
      if (cFirst) {
        answers['childNameAcc'] = declineGreekName(cFirst, 'accusative', childGender);
      }
      if (cLast) {
        answers['childLastNameAcc'] = declineGreekName(cLast, 'accusative', childGender);
      }

      // Πόλη κατοικίας πατέρα — γενική για "[Πόλης]"
      if (answers['fatherCity']) {
        const fcOrig = answers['fatherCity'];
        const fcGen  = declineGreekName(fcOrig, 'genitive', 'unknown');
        answers['fatherCity'] = fcGen;
        answers['Πόλης']      = fcGen;    // direct lookup [Πόλης]
        answers['ΠόληΓονέα']  = fcOrig;   // ονομαστική για άλλα templates
      }

      // Οδός & αριθμός πατέρα — alias για templates με συγκεκριμένα ονόματα
      if (answers['fatherAddress']) {
        answers['Οδός Πατέρα'] = answers['fatherAddress'];
      }
      if (answers['fatherAddressNumber']) {
        answers['Αριθμός Πατέρα'] = answers['fatherAddressNumber'];
      }

      // Οδός & αριθμός αναδόχου
      if (answers['godparentAddress']) {
        answers['Οδός Αναδόχου'] = answers['godparentAddress'];
      }
      if (answers['godparentAddressNumber']) {
        answers['Αριθμός Αναδόχου'] = answers['godparentAddressNumber'];
      }

      // Επισκοπική εντολή (Απαντητικόν — admin-only fields)
      if (answers['orderNumber']) {
        answers['ΑριθμόςΕντολής'] = answers['orderNumber'];
      }
      if (answers['orderDate']) {
        answers['ΗμερομηνίαΕντολής'] = answers['orderDate'];
      }

      // Θρήσκευμα πριν βάπτιση
      if (answers['previousReligion']) {
        answers['Θρήσκευμα'] = answers['previousReligion'];
      }

      // Διεύθυνση/πόλη διαμονής βαπτιζόμενου
      if (answers['residenceAddress']) {
        answers['ΔιεύθυνσηΔιαμονής'] = answers['residenceAddress'];
      }
      if (answers['residenceCity']) {
        answers['ΠόληΔιαμονής'] = answers['residenceCity'];
      }

      // Πόλη αναδόχου — γενική για "κάτοικος Θεσσαλονίκης", ονομαστική διαθέσιμη αν χρειαστεί
      if (answers['godparentCity']) {
        const gpCityOrig = answers['godparentCity'];
        const gpCityGen  = declineGreekName(gpCityOrig, 'genitive', 'unknown');
        answers['godparentCity'] = gpCityGen;    // γενική — variableMap [Πόλεως]→godparentCity δουλεύει
        answers['Πόλεως']        = gpCityGen;    // γενική — για direct lookup
        answers['ΠόληΑναδόχου']  = gpCityOrig;   // ονομαστική — αν κάποιο template τη χρειαστεί
      }

      // Conditional second-godparent block: [και Ανάδοχος 2 κάτοικος Πόλεως]
      // If a second godparent exists → fill in; otherwise → empty string (removes the phrase)
      const gp2Full = answers['Ανάδοχος_2'] || '';
      if (gp2Full) {
        const gp2City = answers['godparentCity2'] || answers['godparentCity'] || answers['Πόλεως'] || '';
        answers['και Ανάδοχος 2 κάτοικος Πόλεως']    = `και ${gp2Full} κάτοικος ${gp2City}`.trim();
        // Baptistiko variant: [και ο/η Ανάδοχος2 κάτοικος Πόλεως]
        answers['και ο/η Ανάδοχος2 κάτοικος Πόλεως'] = `και ${gp2Full} κάτοικος ${gp2City}`.trim();
      } else {
        answers['και Ανάδοχος 2 κάτοικος Πόλεως']    = '';
        answers['και ο/η Ανάδοχος2 κάτοικος Πόλεως'] = '';
      }

      // ── Greek suffix/article mappings (gender & number) ──────────────────────
      // Child gender: accusative/genitive suffixes used in Greek documentary language
      answers['ον/ην']  = childGender === 'male' ? 'ον' : 'ην';   // νεοφώτιστ[ον/ην]
      answers['ον/αν']  = childGender === 'male' ? 'ον' : 'αν';
      answers['αν/ην']  = childGender === 'male' ? 'αν' : 'ην';
      answers['ού/ής']  = childGender === 'male' ? 'ού' : 'ής';   // αυτ[ού/ής]
      answers['ου/ης']  = childGender === 'male' ? 'ου' : 'ης';
      answers['ος/η']   = childGender === 'male' ? 'ος' : 'η';
      answers['Ο/Η']    = childGender === 'male' ? 'Ο' : 'Η';     // [Ο/Η] νεοφώτιστος/η

      // Godparent count → singular/plural suffixes
      const allGodparents = token.persons.filter(
        p => p.role === 'godparent' || p.role === 'godparent2'
      );
      const godparentCount = allGodparents.length;
      answers['ος/οι'] = godparentCount > 1 ? 'οι' : 'ος';   // ανάδοχ[ος/οι]
      answers['η/σαν'] = godparentCount > 1 ? 'ησαν' : 'η';   // παρέστ[η/σαν] → παρέστη / παρέστησαν

      // Godparent gender-based articles and noun forms (DilosiBaptiseos, ApantitikonBaptiseos)
      const gpFirstName = godparent?.firstName || '';
      const gpFemale    = ['α','η','ω','ου'].some(s => gpFirstName.toLowerCase().endsWith(s));
      if (godparentCount > 1) {
        answers['τον(ην)']          = 'τους';
        answers['ανάδοχο(ης)']      = 'αναδόχους';
        answers['(τους αναδόχους)'] = 'τους αναδόχους';
        answers['ο/η/οι']           = 'οι';
      } else {
        answers['τον(ην)']          = gpFemale ? 'την' : 'τον';
        answers['ανάδοχο(ης)']      = gpFemale ? 'ανάδοχη' : 'ανάδοχο';
        answers['(τους αναδόχους)'] = '';
        answers['ο/η/οι']           = gpFemale ? 'η' : 'ο';
      }

      // Full conditional phrase: [τον/την ανάδοχο (τούς αναδόχους)]
      if (godparentCount > 1) {
        answers['τον/την ανάδοχο (τούς αναδόχους)'] = 'τους αναδόχους';
      } else {
        answers['τον/την ανάδοχο (τούς αναδόχους)'] = gpFemale ? 'την ανάδοχη' : 'τον ανάδοχο';
      }
      // Genitive suffix for godparent noun: ανάδοχ[ου/ων]
      answers['ου/ων'] = godparentCount > 1 ? 'ων' : 'ου';
      // ────────────────────────────────────────────────────────────────────

    } else if (serviceTypeLower === 'gamos') {
      const groom = token.persons.find(p => p.role === 'groom');
      const bride = token.persons.find(p => p.role === 'bride');
      const koumparos = token.persons.find(p => p.role === 'koumparos');
      const koumparos2 = token.persons.find(p => p.role === 'koumparos2');

      // ── Groom ───────────────────────────────────────────────────────────
      if (groom) {
        const gFull = `${groom.firstName || ''} ${groom.lastName || ''}`.trim();
        const gFullGen = declineFullName(gFull, 'genitive', 'male');
        const gFirstGen = declineGreekName(groom.firstName || '', 'genitive', 'male');
        const gLastGen = declineGreekName(groom.lastName || '', 'genitive', 'male');
        const gFatherGen = declineGreekName(groom.fathersName || '', 'genitive', 'male');

        answers['groomFirstName']     = groom.firstName || '';
        answers['groomLastName']      = groom.lastName || '';
        answers['groomFullName']      = gFull;
        answers['groomFullNameGen']   = gFullGen;
        answers['groomFirstNameGen']  = gFirstGen;
        answers['groomLastNameGen']   = gLastGen;
        answers['groomFatherName']    = gFatherGen;

        // Greek-keyed aliases for template direct lookup
        answers['Όνομα Γαμπρού']                   = groom.firstName || '';
        answers['Επώνυμο Γαμπρού']                 = groom.lastName || '';
        answers['Ονοματεπώνυμο Γαμπρού']           = gFull;
        answers['Ονοματεπώνυμο Γαμπρού (γενική)']  = gFullGen;
        answers['Όνομα Γαμπρού (γενική)']          = gFirstGen;
        answers['Επώνυμο Γαμπρού (γενική)']        = gLastGen;
        answers['Πατρώνυμο Γαμπρού']               = gFatherGen;
        answers['Γαμπρός']                         = gFull;

        // Existing aliases kept for backward compat
        answers['Όνομα_Γαμπρού']     = groom.firstName || '';
        answers['Επώνυμο_Γαμπρού']   = groom.lastName || '';
        answers['Πατρώνυμο_Γαμπρού'] = groom.fathersName || '';
        answers['ΟΝΟΜΑ_ΓΑΜΠΡΟΥ']     = groom.firstName || '';
        answers['ΕΠΩΝΥΜΟ_ΓΑΜΠΡΟΥ']   = groom.lastName || '';
        answers['ΠΑΤΡΩΝΥΜΟ_ΓΑΜΠΡΟΥ'] = groom.fathersName || '';
        answers['Όν. Γαμπρού']       = groom.firstName || '';
        answers['Επ. Γαμπρού']       = groom.lastName || '';
      }

      // Mother of groom (from meta)
      if (answers['groomMotherFirst']) {
        const gmFull = `${answers['groomMotherFirst']} ${answers['groomMotherMaiden'] || groom?.lastName || ''}`.trim();
        const gmGen  = declineFullName(gmFull, 'genitive', 'female');
        answers['groomMotherName']     = declineGreekName(answers['groomMotherFirst'], 'genitive', 'female');
        answers['groomMotherFullName'] = gmFull;
        answers['Μητρώνυμο Γαμπρού']  = gmGen;
        answers['Ονοματεπώνυμο Μητρός Γαμπρού'] = gmFull;
      }
      // Father of groom: built from fathersName + groom lastName
      if (groom?.fathersName) {
        const gfFull = `${groom.fathersName} ${groom.lastName || ''}`.trim();
        answers['groomFatherFullName']           = gfFull;
        answers['Ονοματεπώνυμο Πατρός Γαμπρού'] = gfFull;
      }

      // dataJson passthrough fields for groom
      const gFields = ['groomBirthDate','groomBirthCity','groomProfession','groomReligion',
        'groomNationality','groomCity','groomAddress','groomAddressNumber','groomPostalCode',
        'groomTaxId','groomAmka','groomIdNumber','groomIdDate','groomIdAuthority',
        'groomMarriageRank','groomPrefecture','groomMunicipality','groomMunicipalRegNumber'];
      for (const f of gFields) {
        if (answers[f]) {
          const label = f.replace('groom', '');
          answers['Γαμπρός_' + label] = answers[f];
        }
      }
      // Greek display aliases for key groom fields
      if (answers['groomCity'])     { answers['Πόλεως Γαμπρού'] = declineGreekName(answers['groomCity'], 'genitive', 'unknown'); answers['Πόλη Γαμπρού'] = answers['groomCity']; }
      if (answers['groomAddress'])  answers['Οδός Γαμπρού']     = answers['groomAddress'];
      if (answers['groomAddressNumber']) answers['Αριθμός Γαμπρού'] = answers['groomAddressNumber'];
      if (answers['groomPostalCode']) answers['ΤΚ Γαμπρού']     = answers['groomPostalCode'];
      if (answers['groomTaxId'])    answers['ΑΦΜ Γαμπρού']      = answers['groomTaxId'];
      if (answers['groomAmka'])     answers['ΑΜΚΑ Γαμπρού']     = answers['groomAmka'];
      if (answers['groomIdNumber']) answers['ΑΔΤ Γαμπρού']      = answers['groomIdNumber'];
      if (answers['groomIdDate'])   answers['Ημ. ΑΔΤ Γαμπρού'] = answers['groomIdDate'];
      if (answers['groomIdAuthority']) answers['Αρχή ΑΔΤ Γαμπρού'] = answers['groomIdAuthority'];
      if (answers['groomBirthCity']) answers['Τόπος Γέννησης Γαμπρού'] = answers['groomBirthCity'];
      if (answers['groomProfession']) answers['Επάγγελμα Γαμπρού'] = answers['groomProfession'];
      if (answers['groomReligion']) answers['Θρήσκευμα Γαμπρού'] = answers['groomReligion'];
      if (answers['groomNationality']) answers['Υπηκοότητα Γαμπρού'] = answers['groomNationality'];
      if (answers['groomMarriageRank']) answers['Βαθμός Γάμου Γαμπρού'] = answers['groomMarriageRank'];

      // ── Bride ────────────────────────────────────────────────────────────
      if (bride) {
        const bFull = `${bride.firstName || ''} ${bride.lastName || ''}`.trim();
        const bFullGen = declineFullName(bFull, 'genitive', 'female');
        const bFirstGen = declineGreekName(bride.firstName || '', 'genitive', 'female');
        const bLastGen = declineGreekName(bride.lastName || '', 'genitive', 'female');
        const bFatherGen = declineGreekName(bride.fathersName || '', 'genitive', 'male');

        answers['brideFirstName']    = bride.firstName || '';
        answers['brideLastName']     = bride.lastName || '';
        answers['brideFullName']     = bFull;
        answers['brideFullNameGen']  = bFullGen;
        answers['brideFirstNameGen'] = bFirstGen;
        answers['brideLastNameGen']  = bLastGen;
        answers['brideFatherName']   = bFatherGen;

        answers['Όνομα Νύφης']                   = bride.firstName || '';
        answers['Επώνυμο Νύφης']                 = bride.lastName || '';
        answers['Ονοματεπώνυμο Νύφης']           = bFull;
        answers['Ονοματεπώνυμο Νύφης (γενική)']  = bFullGen;
        answers['Όνομα Νύφης (γενική)']          = bFirstGen;
        answers['Επώνυμο Νύφης (γενική)']        = bLastGen;
        answers['Πατρώνυμο Νύφης']               = bFatherGen;
        answers['Νύφη']                          = bFull;

        answers['Όνομα_Νύφης']     = bride.firstName || '';
        answers['Επώνυμο_Νύφης']   = bride.lastName || '';
        answers['Πατρώνυμο_Νύφης'] = bride.fathersName || '';
        answers['ΟΝΟΜΑ_ΝΥΦΗΣ']     = bride.firstName || '';
        answers['ΕΠΩΝΥΜΟ_ΝΥΦΗΣ']   = bride.lastName || '';
        answers['ΠΑΤΡΩΝΥΜΟ_ΝΥΦΗΣ'] = bride.fathersName || '';
        answers['Όν. Νύφης']       = bride.firstName || '';
        answers['Επ. Νύφης']       = bride.lastName || '';
      }

      if (answers['brideMotherFirst']) {
        const bmFull = `${answers['brideMotherFirst']} ${answers['brideMotherMaiden'] || bride?.lastName || ''}`.trim();
        const bmGen  = declineFullName(bmFull, 'genitive', 'female');
        answers['brideMotherName']     = declineGreekName(answers['brideMotherFirst'], 'genitive', 'female');
        answers['brideMotherFullName'] = bmFull;
        answers['Μητρώνυμο Νύφης']    = bmGen;
        answers['Ονοματεπώνυμο Μητρός Νύφης'] = bmFull;
      }
      if (bride?.fathersName) {
        const bfFull = `${bride.fathersName} ${bride.lastName || ''}`.trim();
        answers['brideFatherFullName']          = bfFull;
        answers['Ονοματεπώνυμο Πατρός Νύφης']  = bfFull;
      }

      const bFields = ['brideBirthDate','brideBirthCity','brideProfession','brideReligion',
        'brideNationality','brideCity','brideAddress','brideAddressNumber','bridePostalCode',
        'brideTaxId','brideAmka','brideIdNumber','brideIdDate','brideIdAuthority',
        'brideMarriageRank','bridePrefecture','brideMunicipality','brideMunicipalRegNumber'];
      for (const f of bFields) {
        if (answers[f]) {
          const label = f.replace('bride', '');
          answers['Νύφη_' + label] = answers[f];
        }
      }
      if (answers['brideCity'])     { answers['Πόλεως Νύφης'] = declineGreekName(answers['brideCity'], 'genitive', 'unknown'); answers['Πόλη Νύφης'] = answers['brideCity']; }
      if (answers['brideAddress'])  answers['Οδός Νύφης']     = answers['brideAddress'];
      if (answers['brideAddressNumber']) answers['Αριθμός Νύφης'] = answers['brideAddressNumber'];
      if (answers['bridePostalCode']) answers['ΤΚ Νύφης']     = answers['bridePostalCode'];
      if (answers['brideTaxId'])    answers['ΑΦΜ Νύφης']      = answers['brideTaxId'];
      if (answers['brideAmka'])     answers['ΑΜΚΑ Νύφης']     = answers['brideAmka'];
      if (answers['brideIdNumber']) answers['ΑΔΤ Νύφης']      = answers['brideIdNumber'];
      if (answers['brideIdDate'])   answers['Ημ. ΑΔΤ Νύφης'] = answers['brideIdDate'];
      if (answers['brideIdAuthority']) answers['Αρχή ΑΔΤ Νύφης'] = answers['brideIdAuthority'];
      if (answers['brideBirthCity']) answers['Τόπος Γέννησης Νύφης'] = answers['brideBirthCity'];
      if (answers['brideProfession']) answers['Επάγγελμα Νύφης'] = answers['brideProfession'];
      if (answers['brideReligion']) answers['Θρήσκευμα Νύφης'] = answers['brideReligion'];
      if (answers['brideNationality']) answers['Υπηκοότητα Νύφης'] = answers['brideNationality'];
      if (answers['brideMarriageRank']) answers['Βαθμός Γάμου Νύφης'] = answers['brideMarriageRank'];

      // ── Witness / Koumparos ──────────────────────────────────────────────
      const witnessCount = [koumparos, koumparos2].filter(Boolean).length;

      if (koumparos) {
        const wFull = `${koumparos.firstName || ''} ${koumparos.lastName || ''}`.trim();
        answers['witness']           = wFull;
        answers['witnessFirstName']  = koumparos.firstName || '';
        answers['witnessLastName']   = koumparos.lastName || '';
        answers['Παράνυμφος 1']         = wFull;
        answers['Όνομα Παράνυμφου 1']   = koumparos.firstName || '';
        answers['Επώνυμο Παράνυμφου 1'] = koumparos.lastName || '';
      }
      if (answers['witnessCity']) {
        const wcGen = declineGreekName(answers['witnessCity'], 'genitive', 'unknown');
        answers['Πόλη Παράνυμφου']   = answers['witnessCity'];
        answers['Πόλεως Παράνυμφου'] = wcGen;
        answers['κάτοικος Πόλης']    = `κάτοικος ${wcGen}`;
      }
      if (koumparos2) {
        const w2Full = `${koumparos2.firstName || ''} ${koumparos2.lastName || ''}`.trim();
        const k2FemaleGuess = /[αη]$/i.test(koumparos2.firstName?.trim() || '');
        answers['witness2']              = w2Full;
        answers['Παράνυμφος 2']          = w2Full;
        answers['και ο/η Παράνυμφος 2']  = `και ${k2FemaleGuess ? 'η' : 'ο'} ${w2Full}`;
        answers['και Παράνυμφος 2']      = `και ${w2Full}`;
        if (answers['witness2City']) {
          const wc2Gen = declineGreekName(answers['witness2City'], 'genitive', 'unknown');
          answers['Πόλη Παράνυμφου 2']   = answers['witness2City'];
          answers['Πόλεως Παράνυμφου 2'] = wc2Gen;
        }
      } else {
        answers['witness2']              = '';
        answers['Παράνυμφος 2']          = '';
        answers['και ο/η Παράνυμφος 2']  = '';
        answers['και Παράνυμφος 2']      = '';
        answers['Πόλεως Παράνυμφου 2']   = '';
      }

      // GamilionGramma: witness count agreement tokens
      answers['ος/οι'] = witnessCount > 1 ? 'οι' : 'ος';
      answers['ς/ρες'] = witnessCount > 1 ? 'ρες' : 'ς';
      answers['η/σαν'] = witnessCount > 1 ? 'σαν' : 'η';
      answers['ήταν οι'] = witnessCount > 1 ? 'ήταν οι' : 'ήταν';
      // First witness gender (infer from name ending)
      const k1Female = /[αη]$/i.test(koumparos?.firstName?.trim() || '');
      answers['ο/η'] = k1Female ? 'η' : 'ο';
      answers['και ο/η'] = koumparos2
        ? `και ${/[αη]$/i.test(koumparos2.firstName?.trim() || '') ? 'η' : 'ο'}`
        : '';
      answers['κάτοικος'] = koumparos2 ? 'κάτοικος' : '';

      // BebaiosiGamou: [ἀμφότεροι κάτοικοι Θεσσαλονίκης] — witness cities
      if (witnessCount > 1 && answers['witnessCity'] && answers['witness2City']) {
        const c1g = declineGreekName(answers['witnessCity'], 'genitive', 'unknown');
        const c2g = declineGreekName(answers['witness2City'], 'genitive', 'unknown');
        answers['ἀμφότεροι κάτοικοι Θεσσαλονίκης'] =
          answers['witnessCity'] === answers['witness2City']
            ? `αμφότεροι κάτοικοι ${c1g}`
            : `κάτοικοι ${c1g} και ${c2g} αντίστοιχα`;
      } else if (witnessCount === 1 && answers['witnessCity']) {
        answers['ἀμφότεροι κάτοικοι Θεσσαλονίκης'] = '';
      }

      // ── Couple joint address (post-marriage) ─────────────────────────────
      if (answers['coupleAddress']) {
        answers['Οδός Ζεύγους']                    = answers['coupleAddress'];
        answers['Ονομασία οδού κατοικίας ζεύγους'] = answers['coupleAddress'];
      }
      if (answers['coupleAddressNumber']) answers['Αριθμός Ζεύγους']   = answers['coupleAddressNumber'];
      if (answers['couplePostalCode'])    answers['ΤΚ Ζεύγους']        = answers['couplePostalCode'];
      if (answers['coupleCity'])          answers['Πόλη Ζεύγους']      = answers['coupleCity'];
      if (answers['couplePrefecture'])    answers['Νομός Ζεύγους']     = answers['couplePrefecture'];
      if (answers['coupleMunicipality'])  answers['Δήμος Ζεύγους']     = answers['coupleMunicipality'];

      // ── Marriage license ─────────────────────────────────────────────────
      if (answers['marriageLicenseNumber'])  answers['Αρ. Άδειας Γάμου']    = answers['marriageLicenseNumber'];
      if (answers['marriageParaboloNumber']) answers['Αρ. Παραβόλου Γάμου'] = answers['marriageParaboloNumber'];

      // ── Age fields (Aitisi) ───────────────────────────────────────────────
      if (answers['groomAge']) answers['Ηλικία Γαμπρού'] = answers['groomAge'];
      if (answers['brideAge']) answers['Ηλικία Νύφης']   = answers['brideAge'];

      // ── Birth date decomposition (DilosiGamou day/year fields) ───────────
      const parseBirthDate = (dateStr: string) => {
        if (!dateStr) return null;
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return null;
        return { day: String(d.getDate()), month: String(d.getMonth() + 1).padStart(2,'0'), year: String(d.getFullYear()) };
      };
      const gbd = parseBirthDate(answers['groomBirthDate']);
      if (gbd) {
        answers['groomBirthDay']  = gbd.day;
        answers['groomBirthYear'] = gbd.year;
        answers['Ημέρα Γέννησης Γαμπρού'] = gbd.day;
        answers['Έτος Γέννησης Γαμπρού']  = gbd.year;
      }
      const bbd = parseBirthDate(answers['brideBirthDate']);
      if (bbd) {
        answers['brideBirthDay']  = bbd.day;
        answers['brideBirthYear'] = bbd.year;
        answers['Ημέρα Γέννησης Νύφης'] = bbd.day;
        answers['Έτος Γέννησης Νύφης']  = bbd.year;
      }

      // Children's surname
      answers['Επώνυμο Τέκνων']  = groom?.lastName || bride?.lastName || '';
      answers['Επώνυμο_Τέκνων'] = answers['Επώνυμο Τέκνων'];
    }

    const grDate = token.ceremonyDate
      ? new Date(token.ceremonyDate).toLocaleDateString('el-GR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : '';
    answers['ΑΡΙΘΜ_ΠΡΩΤΟΚΟΛΛΟΥ'] = token.protocolNumber || '';
    answers['protocolNumber'] = token.protocolNumber || '';
    answers['ΑΡΙΘΜ_ΒΙΒΛΙΟΥ'] = token.bookNumber || '';
    answers['bookNumber'] = token.bookNumber || '';
    // [000] → protocol number for Aitisi/BebaiosiGamou; book number as fallback
    answers['000'] = token.protocolNumber || token.bookNumber || '';
    answers['ΗΜΕΡΟΜΗΝΙΑ_ΤΕΛΕΣΗΣ'] = grDate;
    answers['ceremonyDate'] = grDate;

    if (token.ceremonyDate) {
      const d = new Date(token.ceremonyDate);
      const months = [
        'Ιανουαρίου','Φεβρουαρίου','Μαρτίου','Απριλίου','Μαΐου','Ιουνίου',
        'Ιουλίου','Αυγούστου','Σεπτεμβρίου','Οκτωβρίου','Νοεμβρίου','Δεκεμβρίου',
      ];
      const dayNames = ['Κυριακή','Δευτέρα','Τρίτη','Τετάρτη','Πέμπτη','Παρασκευή','Σάββατο'];
      answers['Ημέρα_Τέλεσης'] = String(d.getDate());
      answers['Μήνας_Τέλεσης'] = months[d.getMonth()];
      answers['Μηνός_Τέλεσης'] = months[d.getMonth()];   // genitive alias [Μηνός]
      answers['Μηνός'] = months[d.getMonth()];
      answers['Έτος_Τέλεσης'] = String(d.getFullYear());
      answers['day'] = String(d.getDate());
      answers['month'] = months[d.getMonth()];
      answers['year'] = String(d.getFullYear());
      // Day-of-week name: [Ημέρα] in templates like "ημέρα [Σάββατο]"
      answers['Ημέρα'] = dayNames[d.getDay()];
      answers['Ημέρα_Εβδομάδας'] = dayNames[d.getDay()];
      // Ceremony date in template formats:
      // [00ην Μηνός]  → "30η Μαΐου"  (cleanKey: 00ηνμηνοσ)
      // [00 Μήνας 0000] → "30 Μαΐου 2026" (cleanKey: 00μηνασ0000) — used in headers
      answers['00ην Μηνός'] = `${d.getDate()}η ${months[d.getMonth()]}`;
      answers['ceremonyDayMonth'] = `${d.getDate()}η ${months[d.getMonth()]}`;
      // Full date: nominative month [00 Μήνας 0000] and genitive month [00 Μηνός 0000]
      answers['00 Μήνας 0000'] = `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
      answers['00 Μηνός 0000'] = `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
      // Ordinal + genitive month + year: [00ην Μηνός 0000] for BebaiosiGamou ceremony date
      answers['00ην Μηνός 0000'] = `${d.getDate()}ην ${months[d.getMonth()]} ${d.getFullYear()}`;
      // Variant without ν: [00η Μηνός 000] (3 zeros) used in some templates
      answers['00η Μηνός 000']   = `${d.getDate()}η ${months[d.getMonth()]} ${d.getFullYear()}`;
      // Literal digit-only placeholder keys used verbatim in older templates:
      // [0000] = ceremony year, [00] = ceremony day
      answers['0000'] = String(d.getFullYear());
      answers['00'] = String(d.getDate()).padStart(2, '0');
      // Ordinal forms: [7ην] in Baptistiko (template should use [00ην]); [00η] in ChildrenLastName
      answers['00ην'] = `${d.getDate()}ην`;
      answers['00η']  = `${d.getDate()}η`;
      // Standard semantic keys for ceremony day/year (used by synonym groups 30/31
      // and as fallback targets in the example-value pattern matcher)
      answers['ceremonyDay']  = String(d.getDate());
      answers['ceremonyYear'] = String(d.getFullYear());
      // Ceremony time from the DateTime field
      const cH = String(d.getHours()).padStart(2, '0');
      const cM = String(d.getMinutes()).padStart(2, '0');
      answers['00:00']        = `${cH}:${cM}`;
      answers['ceremonyTime'] = `${cH}:${cM}`;
    }

    // Common enrichments for ALL service types
    // Priest name in Greek genitive forms ([Ονοματεπώνυμο Εφημερίου], [Ονοματεπώνυμο Ιερέως])
    const priestName = token.assignedPriest || '';
    answers['Ονοματεπώνυμο_Εφημερίου'] = priestName;
    answers['Ονοματεπώνυμο_Ιερέως'] = priestName;

    answers['Εφημέριος'] = token.assignedPriest || '';
    answers['ΕΦΗΜΕΡΙΟΣ'] = token.assignedPriest || '';
    answers['assignedPriest'] = token.assignedPriest || '';

    // Priest title/rank — priority: per-ceremony (admin sets in AdminMetaForm) → temple settings → default
    let templeSettingsObj: any = {};
    try { if (token.temple.settings) templeSettingsObj = JSON.parse(token.temple.settings); } catch(e) {}
    const priestTitle = answers['assignedPriestTitle'] || templeSettingsObj.priestTitle || 'Εφημέριος';
    answers['Αρχιμανδρίτης του Οικουμενικού θρόνου'] = priestTitle;
    answers['priestTitle'] = priestTitle;
    answers['ΤίτλοςΙερέα'] = priestTitle;
    answers['Τίτλος Ιερέα']          = priestTitle;
    answers['Τίτλος Ιερέως']         = priestTitle;   // [Τίτλος Ιερέως] in Aitisi
    answers['Τίτλος']                = priestTitle;   // [Τίτλος] in BebaiosiGamou
    answers['Όνομα Ιερέως']          = priestName;   // [Όνομα Ιερέως] in ChildrenLastName/Aitisi
    answers['Όνομα Ιερέα']           = priestName;   // [Όνομα Ιερέα] in GamilionGramma
    answers['Ονοματεπώνυμο Ιερέα']   = priestName;   // alternative spelling
    answers['Ονοματεπώνυμο Ιερέως']  = priestName;   // [Ονοματεπώνυμο Ιερέως] in DilosiGamou
    answers['ΝΑΟΣ_ΟΝΟΜΑ'] = token.temple.name || '';
    answers['templeName'] = token.temple.name || '';
    answers['ΝΑΟΣ_ΔΙΕΥΘΥΝΣΗ'] = token.temple.address || '';
    answers['ΜΗΤΡΟΠΟΛΗ'] = token.temple.metropolis?.name || '';
    answers['metropolisName'] = token.temple.metropolis?.name || '';

    // Πόλη Ναού — from temple.city field or temple settings JSON
    const templeCity: string = token.temple.city
      || templeSettingsObj.city
      || templeSettingsObj.templeCity
      || '';
    answers['templeCity']    = templeCity;
    answers['ΠόληΝαού']      = templeCity;
    answers['ΠΟΛΗ_ΝΑΟΥ']     = templeCity;
    answers['ΤόποςΤελετής']  = templeCity;
    answers['ΗΜΕΡΟΜΗΝΙΑ'] = new Date().toLocaleDateString('el-GR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    // ─────────────────────────────────────────────────────────────────────────

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
      persons: token.persons.map(p => ({
        role: p.role,
        firstName: p.firstName,
        lastName: p.lastName,
        fathersName: p.fathersName,
      })),
      customTemplates: customTemplates.map(t => ({
        docType: t.docType,
        nameEl: t.nameEl,
        htmlContent: t.htmlContent,
      })),
    };

    // ─── Determine document list ──────────────────────────────────────────────
    //
    // Priority rule:
    //   1. If this temple has uploaded custom templates for the service type → use ALL of them.
    //   2. Otherwise fall back to the hardcoded pdfEngine generation (gamos / vaptisi only).
    //
    // This ensures every temple's own forms are used instead of the generic fallbacks,
    // regardless of what name they gave their templates.

    type DocEntry = { key: string; label: string; buffer: Buffer; filename: string };

    // Templates matching the ceremony type exactly
    const customTemplatesForType = customTemplates.filter(
      t => t.docType.toLowerCase() === serviceTypeLower,
    );

    // Any uploaded file templates (DOCX/PDF) for this temple — regardless of docType.
    // If the temple has uploaded their own files, never fall back to generic hardcoded PDFs
    // even if the docType category hasn't been set correctly yet.
    const hasAnyUploadedFiles = customTemplates.some(t => t.fileUrl || t.fileData);

    // Helper to turn a template record into a DocEntry
    const tplToDocEntry = (t: any): DocEntry => {
      let ext = 'pdf';
      if (t.fileUrl) {
        if (t.fileUrl.endsWith('.docx') || t.fileUrl.endsWith('.doc')) ext = 'docx';
        else if (t.fileUrl.endsWith('.html')) ext = 'html';
      } else if (t.htmlContent) {
        ext = 'html';
      }
      return {
        key: t.id,
        label: t.nameEl,
        buffer: Buffer.alloc(0), // filled below by generateFromTemplate
        filename: `${t.nameEl.replace(/\s+/g, '_')}_${Date.now()}.${ext}`,
      };
    };

    let docs: DocEntry[] = [];

    if (customTemplatesForType.length > 0) {
      // Best case: templates with correct ceremony type → use exactly those
      docs = customTemplatesForType.map(tplToDocEntry);
    } else if (hasAnyUploadedFiles) {
      // Temple has uploaded files but with wrong/missing docType → use ALL uploaded templates
      // so the church gets their own documents instead of generic hardcoded PDFs.
      // The admin should fix the categories via the 🏷️ button on each template card.
      logger.warn(`[generate-all] No templates found for docType="${serviceTypeLower}" — using ALL uploaded templates as fallback (fix template categories in /admin/documents)`);
      docs = customTemplates.filter(t => t.fileUrl || t.fileData || t.htmlContent).map(tplToDocEntry);
    } else if (serviceTypeLower === 'gamos') {
      docs = await generateAllGamosDocs(tokenData);
    } else if (serviceTypeLower === 'vaptisi') {
      docs = await generateAllBaptisiDocs(tokenData);
    }
    // For other types with no custom templates: docs stays empty — nothing to generate.

    const { generateFromTemplate } = await import('@/actions/docEngine');

    const result: any[] = [];

    for (const doc of docs) {
      let fileBuffer: Buffer = doc.buffer;
      let filename: string = doc.filename;

      // If buffer is empty, this is a custom template placeholder → generate it now
      if (fileBuffer.length === 0) {
        const genRes: any = await generateFromTemplate(doc.key, answers);
        if (genRes.success) {
          if (genRes.type === 'pdf' || genRes.type === 'docx') {
            fileBuffer = Buffer.from(genRes.base64, 'base64');
            filename = genRes.filename;
          } else if (genRes.type === 'html') {
            fileBuffer = Buffer.from(genRes.html, 'utf-8');
            filename = `${doc.label.replace(/\s+/g, '_')}_${Date.now()}.html`;
          }
        } else {
          logger.error(`[generate-all] Failed to generate template "${doc.label}" (ID: ${doc.key}):`, genRes.error);
        }

        if (fileBuffer.length === 0) {
          // Generation failed — skip this document rather than saving an empty file
          result.push({
            key: doc.key,
            label: doc.label,
            filename: doc.filename,
            base64: '',
            storagePath: null,
            error: genRes?.error || 'Αποτυχία παραγωγής εγγράφου',
          });
          continue;
        }
      }

      // Persist to file system
      const baseDir = path.join(process.cwd(), 'public', 'docs', token.templeId);
      if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true });

      const safeFilename = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.\-]/g, '_')}`;
      const filePath = path.join(baseDir, safeFilename);
      fs.writeFileSync(filePath, fileBuffer);

      const storagePath = `/docs/${token.templeId}/${safeFilename}`;

      await prisma.document.create({
        data: {
          templeId: token.templeId,
          tokenId: token.id,
          docType: doc.key,
          fileName: doc.label,
          storagePath,
        },
      });

      result.push({
        key: doc.key,
        label: doc.label,
        filename,
        base64: fileBuffer.toString('base64'),
        storagePath,
      });
    }

    // Bundle all generated docs into a single ZIP for easy download
    let zipBase64: string | null = null;
    const docsForZip = result.filter(d => d.base64 && d.filename);
    if (docsForZip.length > 0) {
      const zip = new JSZip();
      for (const doc of docsForZip) {
        zip.file(doc.filename, Buffer.from(doc.base64, 'base64'));
      }
      const zipBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
      zipBase64 = zipBuffer.toString('base64');
    }

    const safeName = (token.customerName || 'Εκκλησία').replace(/[^α-ωΑ-Ωa-zA-Z0-9_\- ]/g, '').trim().replace(/\s+/g, '_');
    const zipFilename = `${safeName}_${serviceTypeLower}.zip`;

    return NextResponse.json({ success: true, docs: result, count: result.length, zip: zipBase64 ? { base64: zipBase64, filename: zipFilename } : null });
  } catch (error: any) {
    logger.error('[generate-all] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
