/**
 * Greek Name Declension Engine
 * Converts Greek names from Nominative to Genitive or Accusative case.
 * Handles the most common patterns used in church certificates.
 */
export function declineGreekName(
 nominative: string,
 caseType: 'genitive' | 'accusative',
 gender: 'male' | 'female' | 'unknown' = 'unknown'
): string {
 if (!nominative) return '';
 const name = nominative.trim();
 const lower = name.toLowerCase();

 const isMale = gender === 'male';
 const isFemale = gender === 'female';

 // Helper: check ending in lowercase
 const endsWith = (suffix: string) => lower.endsWith(suffix.toLowerCase());

 // Helper: smart replace ending, preserve capitalization
 const replaceEnd = (cutLen: number, newEnd: string): string => {
 const base = name.slice(0, name.length - cutLen);
 return base + newEnd;
 };

 if (caseType === 'genitive') {

 // --- Ήδη σε Γενική (Πατρωνυμικά σε -ου, -η, -ι) ---
 if (endsWith('ου') || endsWith('ΟΥ')) return name;

 // --- Αρσενικά ---
 if (isMale || gender === 'unknown') {
 // Ιωάννης → Ιωάννου (irregular, very common in church)
 if (lower === 'ιωάννης' || lower === 'γιάννης') return replaceEnd(2, 'ου');

 // Ηλίας, Ηλίας → Ηλία (not -ου, stays with Η)
 if (endsWith('ίας')) return replaceEnd(1, '');

 // -ης → -η (e.g. Δημήτρης → Δημήτρη, Νίκης → Νίκη)
 if (endsWith('ης')) return replaceEnd(1, '');

 // -ος → -ου (e.g. Γεώργιος → Γεωργίου)
 if (endsWith('ος')) return replaceEnd(2, 'ου');

 // -ας → -α (e.g. Νικηφόρας → Νικηφόρα)
 if (endsWith('ας')) return replaceEnd(1, '');

 // -ων → -ωνος (e.g. Σόλων → Σόλωνος)
 if (endsWith('ων')) return replaceEnd(0, 'ος');
 }

 // --- Θηλυκά ---
 if (isFemale || gender === 'unknown') {
 // Μαρία → Μαρίας, Ελένα → Ελένας
 if (endsWith('α') || endsWith('ά')) return name + (lower.endsWith('ά') ? 'ς' : 'ς');

 // Ελένη → Ελένης, Σοφή → Σοφής
 if (endsWith('η') || endsWith('ή')) return name + 'ς';

 // -ώ → -ούς (e.g. Σαπφώ → Σαπφούς)
 if (endsWith('ώ')) return replaceEnd(1, 'ούς');
 }

 }

 if (caseType === 'accusative') {
 if (isMale || gender === 'unknown') {
 if (lower === 'ιωάννης' || lower === 'γιάννης') return replaceEnd(2, '');

 // -ης → στον → -η (accusative same as genitive for -ης words)
 if (endsWith('ης')) return replaceEnd(1, '');

 // -ος → -ο (τον Γεώργιο)
 if (endsWith('ος')) return replaceEnd(2, 'ο');

 // -ας → -α (τον Νικηφόρα)
 if (endsWith('ας')) return replaceEnd(1, '');
 }

 if (isFemale || gender === 'unknown') {
 // Feminine accusative same as nominative for -α, -η
 return name;
 }
 }

 // Fallback: return as-is (for undeclensible / foreign names)
 return name;
}

export function declineFullName(fullName: string, caseType: 'genitive' | 'accusative', gender: 'male' | 'female'): string {
  if (!fullName) return '';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return declineGreekName(parts[0], caseType, gender);

  const firstName = parts[0];
  const lastParts = parts.slice(1);
  
  const declinedFirst = declineGreekName(firstName, caseType, gender);
  
  const declinedLast = lastParts.map(lastName => {
    const lower = lastName.toLowerCase();
    
    // If ends in -ου, -ή, -η: already in genitive — return as-is for genitive
    if (caseType === 'genitive') {
      if (lower.endsWith('ου') || lower.endsWith('ή') || lower.endsWith('η') || lower.endsWith('ού')) {
        return lastName;
      }
    }

    if (caseType === 'genitive') {
      if (gender === 'male') {
        if (lower.endsWith('ος')) return lastName.slice(0, -2) + 'ου';
        if (lower.endsWith('ης')) return lastName.slice(0, -1);
        if (lower.endsWith('ας')) return lastName.slice(0, -1);
      } else {
        if (lower.endsWith('α') || lower.endsWith('ά')) return lastName + 'ς';
      }
    } else if (caseType === 'accusative') {
      if (gender === 'male') {
        if (lower.endsWith('ος')) return lastName.slice(0, -1); 
        if (lower.endsWith('ης') || lower.endsWith('ας')) return lastName.slice(0, -1);
      }
    }

    return lastName;
  });

  return [declinedFirst, ...declinedLast].join(' ');
}

export function resolveGenderTokens(text: string, gender: 'male' | 'female'): string {
  if (!text) return '';
  
  const isMale = gender === 'male';

  // Specific multi-option or shorthand fallbacks
  let resolved = text
    .replace(/\[γεννηθείς\/σα\]/g, isMale ? 'γεννηθείς' : 'γεννηθείσα')
    .replace(/\[γεννηθεις\/σα\]/g, isMale ? 'γεννηθείς' : 'γεννηθείσα')
    .replace(/\[ο\/η\/οι\]/g, isMale ? 'ο' : 'η')
    .replace(/\[τον\/την\/τους\]/g, isMale ? 'τον' : 'την')
    .replace(/\[του\/της\]/g, isMale ? 'του' : 'της')
    .replace(/\[νεοφώτιστος\/η\]/g, isMale ? 'νεοφώτιστος' : 'νεοφώτιστη')
    .replace(/\[βαπτισθείς\/σα\]/g, isMale ? 'βαπτισθείς' : 'βαπτισθείσα');

  // Generic 2-option matcher [word1/word2]
  resolved = resolved.replace(/\[([^\/\]]+)\/([^\/\]]+)\]/g, (match, opt1, opt2) => {
    return isMale ? opt1 : opt2;
  });

  return resolved;
}

export function cleanKey(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove Greek accents/diacritics
    .replace(/ς/g, 'σ') // normalize sigmas
    .replace(/[^a-z0-9α-ω]/g, '') // keep only alphanumeric
    .trim();
}

// ─── Example-value pattern recognition constants ─────────────────────────────
// Greek month names (nominative + genitive) expressed as cleanKey output
export const GREEK_MONTHS_CLEAN = new Set<string>([
  'ιανουαριοσ','ιανουαριου',
  'φεβρουαριοσ','φεβρουαριου',
  'μαρτιοσ','μαρτιου',
  'απριλιοσ','απριλιου',
  'μαιοσ','μαιου',
  'ιουνιοσ','ιουνιου',
  'ιουλιοσ','ιουλιου',
  'αυγουστοσ','αυγουστου',
  'σεπτεμβριοσ','σεπτεμβριου',
  'οκτωβριοσ','οκτωβριου',
  'νοεμβριοσ','νοεμβριου',
  'δεκεμβριοσ','δεκεμβριου',
]);
// Ordinal-day placeholder: [7ην], [17η], [21ης] — 1-2 digits + η/ην/ης
export const ORDINAL_DAY_RE = /^\d{1,2}(ην|ης|η)$/;
// 4-digit year used as an example value: [2020], [1996]
export const EXAMPLE_YEAR_RE = /^\d{4}$/;
// Ecclesiastical title prefix → the placeholder is a priest full name
export const PRIEST_TITLE_RE =
  /^(αρχιμανδριτ|πρεσβυτερο|ιερε|πρωτοπρεσβυτερ|επισκοπ|μητροπολιτ|διακον|αρχιεπισκοπ)/;

export function getNormalizedValue(placeholderKey: string, answers: Record<string, any>): string {
  if (!answers || typeof answers !== 'object') return '';
  const pClean = cleanKey(placeholderKey);
  if (!pClean) return '';

  // Step 1: Direct normalized key comparison (fastest path)
  for (const [key, val] of Object.entries(answers)) {
    if (cleanKey(key) === pClean) {
      return val !== undefined && val !== null ? String(val) : '';
    }
  }

  // Step 2: SYNONYM_GROUPS — single source of truth
  for (const group of SYNONYM_GROUPS) {
    const groupCleaned = group.map(cleanKey);
    if (groupCleaned.includes(pClean)) {
      for (const [key, val] of Object.entries(answers)) {
        if (groupCleaned.includes(cleanKey(key)) && val !== undefined && val !== null && String(val) !== '') {
          return String(val);
        }
      }
      break;
    }
  }

  // Step 3: Pattern-based recognition for example-value placeholders
  if (GREEK_MONTHS_CLEAN.has(pClean)) {
    for (const [k, v] of Object.entries(answers)) {
      if (['birthmonth','μηνασγεννησης','μηνοςγεννησεως'].includes(cleanKey(k)) && v) return String(v);
    }
    for (const [k, v] of Object.entries(answers)) {
      if (['ceremonymonth','μηνος','μηνας','month'].includes(cleanKey(k)) && v != null) return String(v);
    }
  }

  if (ORDINAL_DAY_RE.test(pClean)) {
    for (const [k, v] of Object.entries(answers)) {
      if (['birthday','ημεραγεννησεως','ημεραγεννησης'].includes(cleanKey(k)) && v) return String(v);
    }
    for (const [k, v] of Object.entries(answers)) {
      if (['ceremonyday','ημερατελεσης'].includes(cleanKey(k)) && v) return String(v);
    }
  }

  if (EXAMPLE_YEAR_RE.test(pClean) && +pClean >= 1900 && +pClean <= 2100) {
    for (const [k, v] of Object.entries(answers)) {
      if (['birthyear','εποςγεννησεως','εποςγεννησης'].includes(cleanKey(k)) && v) return String(v);
    }
    for (const [k, v] of Object.entries(answers)) {
      if (['ceremonyyear','εποςτελεσης','year'].includes(cleanKey(k)) && v) return String(v);
    }
  }

  if (PRIEST_TITLE_RE.test(pClean)) {
    for (const [k, v] of Object.entries(answers)) {
      if (['εφημεριος','efimerios','priest','assignedpriest','priestname'].includes(cleanKey(k)) && v) return String(v);
    }
  }

  if (/^\d{1,2}:\d{2}$/.test(placeholderKey.trim())) {
    for (const [k, v] of Object.entries(answers)) {
      if (['ωρα','ωρατελεσης','ceremonytime','time','hour'].includes(cleanKey(k)) && v != null) return String(v);
    }
  }

  return '';
}


export function mergeSplitRuns(xml: string): string {
  // Replace content of each paragraph
  return xml.replace(/(<w:p(?: [^>]*)?>)([\s\S]*?)(<\/w:p>)/g, (match, openTag, pContent, closeTag) => {
    let insideT = false;
    const textChars: { char: string; nodeIndex: number }[] = [];
    const parsedNodes: { type: 'tag' | 'char'; value: string }[] = [];
    
    let j = 0;
    while (j < pContent.length) {
      if (pContent[j] === '<') {
        const tagEnd = pContent.indexOf('>', j);
        if (tagEnd !== -1) {
          const tag = pContent.slice(j, tagEnd + 1);
          parsedNodes.push({ type: 'tag', value: tag });
          if (tag.startsWith('<w:t')) {
            insideT = true;
          } else if (tag.startsWith('</w:t')) {
            insideT = false;
          }
          j = tagEnd + 1;
        } else {
          parsedNodes.push({ type: 'char', value: pContent[j] });
          if (insideT) {
            textChars.push({ char: pContent[j], nodeIndex: parsedNodes.length - 1 });
          }
          j++;
        }
      } else {
        parsedNodes.push({ type: 'char', value: pContent[j] });
        if (insideT) {
          textChars.push({ char: pContent[j], nodeIndex: parsedNodes.length - 1 });
        }
        j++;
      }
    }

    const plainText = textChars.map(tc => tc.char).join('');
    const placeholderRegex = /\{\{[^}]+\}\}|\{[^}]+\}|\[[^\]]+\]/g;
    
    let matchPl;
    const replacements: { startNode: number; endNode: number; text: string }[] = [];
    
    while ((matchPl = placeholderRegex.exec(plainText)) !== null) {
      const startIdx = matchPl.index;
      const endIdx = startIdx + matchPl[0].length;
      
      const startNode = textChars[startIdx].nodeIndex;
      const endNode = textChars[endIdx - 1].nodeIndex;
      replacements.push({ startNode, endNode, text: matchPl[0] });
    }
    
    for (const rep of replacements) {
      parsedNodes[rep.startNode].value = rep.text;
      for (let k = rep.startNode + 1; k <= rep.endNode; k++) {
        parsedNodes[k].value = '';
      }
    }
    
    const newParagraphContent = parsedNodes.map(n => n.value).join('');
    return openTag + newParagraphContent + closeTag;
  });
}


// ═══════════════════════════════════════════════════════════════════════
// Auto Variable Mapping
// ═══════════════════════════════════════════════════════════════════════

/**
 * Known data keys (right-hand side of variableMap) with their synonym aliases.
 * Each entry: [canonicalKey, ...aliases]
 */
export const SYNONYM_GROUPS: [string, ...string[]][] = [
  // ─── CHILD / BAPTIZED PERSON ───────────────────────────────────────────
  ['childName',
    'ονομα', 'onoma', 'name', 'firstname', 'childname', 'παιδι', 'τεκνο',
    'βαπτιζομενος', 'νεοφωτιστος', 'childfirstname', 'child_firstname', 'child_name'],
  ['childLastName',
    'επωνυμο', 'eponymo', 'lastname', 'surname', 'childlastname',
    'childsurname', 'child_lastname'],
  ['childFullName',
    'ονοματεπωνυμο', 'fullname', 'childfullname', 'ονοματεπωνυμοτεκνου', 'child_fullname'],
  ['childGender',
    'φυλο', 'childgender', 'gender', 'αρρεν', 'θηλυ', 'θηλυκο', 'αρσεν', 'φυλοτεκνου'],

  // ─── FATHER ────────────────────────────────────────────────────
  ['fatherName',
    'πατρωνυμο', 'patronymo', 'patronym', 'fathersname', 'fathername', 'father',
    'ονομαπατερα', 'πατερας', 'onomapatera', 'ονομαπατρος',
    'fatherfirstname', 'father_firstname', 'father_name'],
  ['fatherLastName',
    'επωνυμοπατερα', 'fatherlastname', 'fathersurname', 'επωνυμοπατρος', 'father_lastname'],
  ['fatherFullName',
    'ονοματεπωνυμοπατερα', 'fatherfullname', 'ονοματεπωνυμοπατρος', 'father_fullname'],

  // ─── MOTHER ────────────────────────────────────────────────────
  ['motherName',
    'μητρωνυμο', 'mitronymo', 'mitronym', 'mothersname', 'mothername', 'mother',
    'ονομαμητερας', 'μητερας', 'μητερα', 'onomamiteras', 'ονομαμητρος',
    'motherfirstname', 'mother_firstname', 'mother_name'],
  ['motherLastName',
    'επωνυμομητερας', 'motherlastname', 'mothersurname', 'επωνυμομητρος', 'mother_lastname'],
  ['motherFullName',
    'ονοματεπωνυμομητερας', 'motherfullname', 'ονοματεπωνυμομητρος', 'mother_fullname'],
  ['motherMaidenName',
    'πατρικοεπωνυμομητερας', 'maidenname', 'mothermaidenname', 'γενοςμητερας',
    'πατρικο', 'mother_maiden', 'mothermaiden', 'mothersurnamebirth'],

  // ─── GODPARENT (ΒΑΠΤΙΣΗ) ───────────────────────────────────────────
  ['godparentName',
    'αναδοχος', 'αναδοχη', 'anadochos', 'godparent', 'sponsor', 'nounos',
    'νονος', 'νονα', 'ονομααναδοχου', 'godparentfirstname', 'godparent_firstname', 'godparent_name'],
  ['godparentLastName',
    'επωνυμοαναδοχου', 'godparentlastname', 'godparent_lastname'],
  ['godparentFullName',
    'ονοματεπωνυμοαναδοχου', 'godparentfullname', 'αναδοχος1', 'αναδοχη1',
    'godparent_fullname', 'αναδοχοςονοματεπωνυμο'],
  ['godparentCity',
    'πολεως', 'ποληςαναδοχου', 'godparentcity', 'αναδοχοςπολη', 'πολιαναδοχου',
    'κατοικος', 'κατοικιααναδοχου', 'godparent_city'],

  // ─── GROOM (ΓΑΜΟΣ) ───────────────────────────────────────────────
  ['groomName',
    'γαμπρος', 'groom', 'groomname', 'νυμφιος', 'nymfios',
    'ονομαγαμπρου', 'ονομανυμφιου', 'groomfirstname', 'groom_firstname', 'groom_name'],
  ['groomLastName',
    'επωνυμογαμπρου', 'groomlastname', 'επωνυμονυμφιου', 'groom_lastname'],
  ['groomFullName',
    'ονοματεπωνυμογαμπρου', 'groomfullname', 'ονοματεπωνυμονυμφιου', 'groom_fullname'],
  ['groomFatherName',
    'πατρωνυμογαμπρου', 'groomfathername', 'πατρωνυμονυμφιου',
    'ονομαπατερα1', 'ονομαπατροςγαμπρου', 'groom_fathername', 'groomfathersname'],
  ['groomMotherName',
    'ονομαμητεραςγαμπρου', 'groommothername', 'μητρωνυμογαμπρου', 'groom_mothername'],
  ['groomMotherMaiden',
    'πατρικοεπωνυμομητεραςγαμπρου', 'groommothermaidenname',
    'πατρικομητεραςγαμπρου', 'groom_mothermaidenname'],

  // ─── BRIDE (ΓΑΜΟΣ) ───────────────────────────────────────────────
  ['brideName',
    'νυφη', 'bride', 'bridename', 'νυμφη', 'nymfi',
    'ονομανυφης', 'bridefirstname', 'bride_firstname', 'bride_name'],
  ['brideLastName',
    'επωνυμονυφης', 'bridelastname', 'bride_lastname'],
  ['brideFullName',
    'ονοματεπωνυμονυφης', 'bridefullname', 'bride_fullname'],
  ['brideFatherName',
    'πατρωνυμονυφης', 'bridefathername', 'ονομαπατερα2',
    'ονομαπατροςνυφης', 'bride_fathername', 'bridesfathername'],
  ['brideMotherName',
    'ονομαμητεραςνυφης', 'bridemothername', 'μητρωνυμονυφης', 'bride_mothername'],
  ['brideMotherMaiden',
    'πατρικοεπωνυμομητεραςνυφης', 'bridemothermaidenname',
    'πατρικομητεραςνυφης', 'bride_mothermaidenname'],

  // ─── KOUMPAROS (ΓΑΜΟΣ) ───────────────────────────────────────────
  ['koumparosName',
    'κουμπαρος', 'κουμπαρα', 'koumparos', 'bestman', 'paranymfos',
    'παρανυμφος', 'ονομακουμπαρου', 'koumparosfirstname', 'koumparos_firstname'],
  ['koumparosFullName',
    'ονοματεπωνυμοκουμπαρου', 'koumparosfullname', 'koumparos_fullname'],

  // ─── PRIEST ──────────────────────────────────────────────────────
  ['priestName',
    'εφημεριος', 'efimerios', 'priest', 'assignedpriest', 'ιερεας',
    'ιερουργων', 'ιερουργησας', 'assignedpriestname', 'priest_name'],
  ['priestTitle',
    'τιτλοςιερεα', 'priesttitle', 'αιδεσιμολογιωτατος',
    'πανοσιολογιωτατος', 'αιδεσιμωτατος', 'priest_title'],

  // ─── TEMPLE / CHURCH ───────────────────────────────────────────
  ['templeName',
    'ναος', 'naos', 'temple', 'templename', 'ναοςονομα', 'ονομαναου', 'ιεροςναος'],
  ['templeAddress',
    'διευθυνσηναου', 'templeaddress', 'ναοςδιευθυνση', 'temple_address'],
  ['templeCity',
    'ποληςναου', 'templecity', 'τοποςτελετης', 'τοποςναου',
    'πολιτελετης', 'temple_city', 'τοποςτελεσης'],
  ['metropolisName',
    'μητροπολη', 'metropolis', 'metropolisname', 'ιερακαιρα', 'μητροπολις'],

  // ─── CEREMONY DATE & TIME ─────────────────────────────────────────
  ['ceremonyDate',
    'ημερομηνιατελεσης', 'ceremonydate', 'dateofceremony',
    'ημερομηνιατελετης', 'ημερομηνιαιερολογησεως'],
  ['ceremonyDay',
    'ημερατελεσης', 'ceremonyday', 'daynumber', 'ημερατελετης'],
  ['ceremonyMonth',
    'μηνος', 'μηνας', 'μηναςτελεσης', 'μηνοςτελεσης', 'ceremonymonth', 'month', 'μηναςτελετης'],
  ['ceremonyYear',
    'εποςτελεσης', 'ceremonyyear', 'yearofceremony', 'ετοςτελεσης', 'year'],
  ['ceremonyTime',
    'ωρα', 'ωρατελεσης', 'ceremonytime', 'time', 'hour', 'ωρατελετης'],
  ['dayName',
    'ημερα', 'dayname', 'weekday', 'ημερεβδομαδας',
    'κυριακη', 'δευτερα', 'τριτη', 'τεταρτη', 'πεμπτη', 'παρασκευη', 'σαββατο'],
  ['currentDate',
    'ημερομηνια', 'imerominia', 'currentdate', 'today', 'σημερα', 'date'],

  // ─── BIRTH DATE ───────────────────────────────────────────────────
  ['birthDate',
    'ημερομηνιαγεννησης', 'birthdate', 'dateofbirth', 'γεννηση', 'ημερομηνιαγεννησεως'],
  ['birthDay',
    'ημεραγεννησεως', 'ημεραγεννησης', 'birthday', 'birthdaynumber'],
  ['birthMonth',
    'μηναςγεννησης', 'μηνοςγεννησεως', 'birthmonth', 'μηναγεννησης', 'μηνγεννησης'],
  ['birthYear',
    'εποςγεννησεως', 'εποςγεννησης', 'birthyear', 'yearofbirth', 'εποςγεν'],

  // ─── CIVIL REGISTRY (ΛΗΞΙΑΡΧΕΙΟ) ────────────────────────────────────
  ['civilRegistryName',
    'ληξιαρχειο', 'civilregistry', 'civilregistryname', 'ονομαληξιαρχειου', 'registryname'],
  ['civilRegistryNumber',
    'αριθμοςληξιαρχικης', 'civilregistrynumber', 'αριθμοςπραξης',
    'αριθμληξιαρχικης', 'αριθμοςβαπτισης', 'αριθμλ'],
  ['civilRegistryTome',
    'τομοςληξιαρχειου', 'civilregistrytome', 'τομος', 'tome', 'τομοςλ'],
  ['civilRegistryYear',
    'εποςληξιαρχικης', 'civilregistryyear', 'ετοςληξιαρχικης', 'εποςλ'],

  // ─── LOCATION ─────────────────────────────────────────────────────
  ['birthPlace',
    'τοποςγεννησης', 'birthplace', 'placeofbirth', 'πολη', 'πολις', 'city',
    'τοποςγεννησεως', 'πολιγεννησης', 'birthcity'],

  // ─── REGISTRY NUMBERS ───────────────────────────────────────────
  ['protocolNumber',
    'πρωτοκολλο', 'protokollo', 'protocol', 'protocolnumber', 'αριθμπρωτοκολλου', 'αριθμοςπρωτοκολλου'],
  ['bookNumber',
    'βιβλιο', 'vivlio', 'book', 'booknumber', 'αριθμβιβλιου', 'αριθμοςβιβλιου'],

  // ─── PERSONAL INFO ────────────────────────────────────────────────
  ['idNumber',
    'αδτ', 'adt', 'idnumber', 'identitynumber', 'αριθμοςταυτοτητας', 'αριθμοςδελτιουταυτοτητας'],
  ['afm',   'αφμ', 'afm', 'taxid', 'vat'],
  ['address', 'διευθυνση', 'address', 'diefthynsi', 'κατοικια'],
  ['phone',   'τηλεφωνο', 'phone', 'telephone', 'tilefono'],
];
  ['childLastName',      'επωνυμο', 'eponymo', 'lastname', 'surname', 'childlastname'],
  ['childFullName',      'ονοματεπωνυμο', 'fullname', 'childfullname'],
  ['fatherName',         'πατρωνυμο', 'patronymo', 'patronym', 'fathersname', 'fathername', 'father', 'ονομαπατερα', 'πατερας', 'onomapatera'],
  ['fatherLastName',     'επωνυμοπατερα', 'fatherlastname', 'fathersurname'],
  ['fatherFullName',     'ονοματεπωνυμοπατερα', 'fatherfullname'],
  ['motherName',         'μητρωνυμο', 'mitronymo', 'mitronym', 'mothersname', 'mothername', 'mother', 'ονομαμητερας', 'μητερας', 'μητερα', 'onomamiteras'],
  ['motherLastName',     'επωνυμομητερας', 'motherlastname', 'mothersurname'],
  ['motherFullName',     'ονοματεπωνυμομητερας', 'motherfullname'],
  ['godparentName',      'αναδοχος', 'anadochos', 'godparent', 'sponsor', 'nounos', 'νονος', 'νονα'],
  ['godparentFullName',  'ονοματεπωνυμοαναδοχου', 'godparentfullname'],
  ['godparentCity',      'πολεωσ', 'πολησαναδοχου', 'godparentcity', 'αναδοχοσπολη', 'πολιαναδοχου', 'κατοικοσ'],
  ['groomName',          'γαμπρος', 'groom', 'groomname', 'νυμφιος', 'nymfios'],
  ['groomFullName',      'ονοματεπωνυμογαμπρου', 'groomfullname'],
  ['brideName',          'νυφη', 'bride', 'bridename', 'νυμφη', 'nymfi'],
  ['brideFullName',      'ονοματεπωνυμονυφης', 'bridefullname'],
  ['koumparosName',      'κουμπαρος', 'koumparos', 'bestman', 'paranymfos', 'παρανυμφος'],
  ['koumparosFullName',  'ονοματεπωνυμοκουμπαρου', 'koumparosfullname'],
  ['priestName',         'εφημεριος', 'efimerios', 'priest', 'assignedpriest', 'ιερεας'],
  ['templeName',         'ναος', 'naos', 'temple', 'templename', 'ναοσονομα'],
  ['metropolisName',     'μητροπολη', 'metropolis', 'metropolisname'],
  ['ceremonyDate',       'ημερομηνιατελεσης', 'ceremonydate', 'dateofceremony', 'ημερομηνιατελετης'],
  ['currentDate',        'ημερομηνια', 'imerominia', 'date', 'currentdate', 'today'],
  ['protocolNumber',     'πρωτοκολλο', 'protokollo', 'protocol', 'protocolnumber', 'αριθμπρωτοκολλου'],
  ['bookNumber',         'βιβλιο', 'vivlio', 'book', 'booknumber', 'αριθμβιβλιου'],
  ['birthDate',          'ημερομηνιαγεννησης', 'birthdate', 'dateofbirth', 'γεννηση'],
  ['birthPlace',         'τοποσγεννησης', 'birthplace', 'placeofbirth', 'τοποςγεννησης', 'πολη', 'πολισ', 'city'],
  ['idNumber',           'αδτ', 'adt', 'idnumber', 'identitynumber', 'αριθμοσταυτοτητας'],
  ['afm',                'αφμ', 'afm', 'taxid', 'vat'],
  ['address',            'διευθυνση', 'address', 'diefthynsi'],
  ['phone',              'τηλεφωνο', 'phone', 'telephone', 'tilefono'],
  // Day names as example values
  ['dayName',            'ημερα', 'dayname', 'weekday',
   'κυριακη', 'δευτερα', 'τριτη', 'τεταρτη', 'πεμπτη', 'παρασκευη', 'σαββατο'],
  // Gender example values
  ['childGender',        'φυλο', 'childgender', 'gender', 'αρρεν', 'θηλυ', 'θηλυκο', 'αρσεν'],
  // Birth date components
  ['birthDay',           'ημεραγεννησεωσ', 'ημεραγεννησησ', 'birthday', 'birthdaynumber'],
  ['birthMonth',         'μηνασγεννησησ', 'μηνοσγεννησεωσ', 'birthmonth', 'μηναγεννησησ'],
  ['birthYear',          'εποσγεννησεωσ', 'εποσγεννησησ', 'birthyear', 'yearofbirth'],
  // Ceremony date components
  ['ceremonyMonth',      'μηνοσ', 'μηνας', 'μηναστελεσησ', 'μηνοστελεσησ', 'ceremonymonth', 'month'],
  ['ceremonyDay',        'ημερατελεσησ', 'ceremonyday', 'daynumber'],
  ['ceremonyYear',       'εποστελεσησ', 'ceremonyyear', 'yearofceremony', 'ετοστελεσησ'],
  ['ceremonyTime',       'ωρα', 'ωρατελεσησ', 'ceremonytime', 'time', 'hour'],
];

/**
 * Given a template placeholder (e.g. "Πατρώνυμο", "fatherName"),
 * returns the best canonical data-key from SYNONYM_GROUPS,
 * or null if no match is found.
 */
export function autoMapVariable(placeholder: string): string | null {
  const raw = placeholder.trim();
  const pClean = cleanKey(raw);

  // Gender / grammatical tokens — already resolved automatically by resolveGenderTokens & enrichAnswers
  if (/^[a-zα-ωά-ώΑ-ΩΆ-Ώ]+\/[a-zα-ωά-ώΑ-ΩΆ-Ώ]+$/i.test(raw)) return '__ignore__';

  // Pass 1: exact/synonym match in SYNONYM_GROUPS
  for (const [canonical, ...aliases] of SYNONYM_GROUPS) {
    const allAliases = [cleanKey(canonical), ...aliases.map(cleanKey)];
    if (allAliases.includes(pClean)) return canonical;
  }

  // ── Numeric / format-hint patterns ──────────────────────────────────────────
  // Exceptions: 4-digit example years (e.g. [2020]) and HH:MM example times (e.g. [12:00]).
  if (/^\d{1,2}:\d{2}$/.test(raw)) return 'ceremonyTime';  // [12:00], [09:30]
  const isExampleYear = /^\d{4}$/.test(raw) && +raw >= 1900 && +raw <= 2100;
  if (!isExampleYear && /^[\d: ]+$/.test(raw)) return '__ignore__';
  if (/^[Α-Ωα-ω]\d+$/u.test(raw)) return '__ignore__';

  // Pass 3: Example-value pattern recognition ──────────────────────────────────
  // Greek month name → birthMonth
  if (GREEK_MONTHS_CLEAN.has(pClean)) return 'birthMonth';

  // Ordinal day [7ην], [17η] → birthDay
  if (ORDINAL_DAY_RE.test(pClean)) return 'birthDay';

  // 4-digit year in plausible range → birthYear
  if (EXAMPLE_YEAR_RE.test(pClean) && +raw >= 1900 && +raw <= 2100) return 'birthYear';

  // Ecclesiastical title prefix → priest
  if (PRIEST_TITLE_RE.test(pClean)) return 'priestName';

  return null;
}

