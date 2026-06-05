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
 // -ης → -η (τον Ιωάννη, τον Ηλία)
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

  // ── Specific named patterns (high-priority, before generic matchers) ────────
  let resolved = text
    .replace(/\[γεννηθείς\/σα\]/g, isMale ? 'γεννηθείς' : 'γεννηθείσα')
    .replace(/\[γεννηθεις\/σα\]/g, isMale ? 'γεννηθείς' : 'γεννηθείσα')
    .replace(/\[ο\/η\/οι\]/g,        isMale ? 'ο' : 'η')
    .replace(/\[τον\/την\/τους\]/g,   isMale ? 'τον' : 'την')
    .replace(/\[του\/της\]/g,         isMale ? 'του' : 'της')
    .replace(/\[νεοφώτιστος\/η\]/g,   isMale ? 'νεοφώτιστος' : 'νεοφώτιστη')
    .replace(/\[βαπτισθείς\/σα\]/g,   isMale ? 'βαπτισθείς' : 'βαπτισθείσα')
    // Genitive singular/plural suffix (single godparent → ου, multiple → ων)
    .replace(/\[ου\/ών\]/g,  'ου')
    .replace(/\[ου\/ων\]/g,  'ου')
    // Complex godparent phrase: [τον/την ανάδοχο (τούς αναδόχους)]
    .replace(/\[τον\/την ανάδοχο[^\]]*\]/gi, isMale ? 'τον ανάδοχο' : 'την ανάδοχο');

  // ── [BASE(FEMALE_ENDING)] pattern ────────────────────────────────────────────
  // e.g. [τον(ην)]      → male: τον,      female: τ      + ην  = τη**ν**
  // e.g. [ανάδοχο(ης)]  → male: ανάδοχο,  female: ανάδοχ + ης  = ανάδοχης
  // Algorithm: find the last vowel in BASE; strip from there to end; append FEMALE_ENDING.
  // This correctly handles both short (1-char) and longer masculine endings.
  const GREEK_VOWELS = /[αεηιοουωάέήίόύώΑΕΗΙΟΥΩΆΈΉΊΌΎΏ]/u;
  resolved = resolved.replace(/\[([^/()\[\]]*)\(([^)]+)\)\]/g, (match, base, femSuffix) => {
    const b = base.trim();
    const f = femSuffix.trim();
    if (!b) return ''; // [(optional)] → always empty (optional plural text)
    if (isMale) return b;
    // Strip from the last vowel (inclusive) onward, then append female ending
    const baseChars = [...b]; // Unicode-safe array of codepoints
    let lastVowelIdx = -1;
    for (let i = 0; i < baseChars.length; i++) {
      if (GREEK_VOWELS.test(baseChars[i])) lastVowelIdx = i;
    }
    const stem = lastVowelIdx >= 0 ? baseChars.slice(0, lastVowelIdx).join('') : b;
    return stem + f;
  });

  // ── [(optional text)] → always empty (conditional blocks for 2nd godparent etc.) ──
  resolved = resolved.replace(/\[\([^\]]+\)\]/g, '');

  // ── Generic 2-option matcher [word1/word2] ───────────────────────────────────
  resolved = resolved.replace(/\[([^/\]]+)\/([^/\]]+)\]/g, (match, opt1, opt2) => {
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
// When a church template uses real example values as placeholder names
// (e.g. [Αυγούστου] instead of [Μηνός], [7ην] instead of [00ην],
//  [Αρχιμανδρίτης Νικόλαος Παπαγεωργίου] instead of [Εφημέριος]),
// these constants let getNormalizedValue and autoMapVariable recognise them
// automatically at generation time — no manual template editing required.

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
  /^(αρχιμανδριτ|πρεσβυτερο|ιερε|πρωτοπρεσβυτερ|πρωτοσυγκελ|επισκοπ|μητροπολιτ|διακον|αρχιεπισκοπ)/;

// ─── Synonym groups (shared between getNormalizedValue and autoMapVariable) ──
// Each group maps to the STANDARD_FIELDS key at the same index via GROUP_TO_FIELD.
export const SYNONYM_GROUPS: string[][] = [
  // 0 — childName
  ['ονομα', 'ονοματεκνου', 'ονοματεκνο', 'onoma', 'name', 'firstname', 'childname'],
  // 1 — childLastName
  ['επωνυμο', 'eponymo', 'lastname', 'surname', 'childlastname'],
  // 2 — fatherName
  ['πατρωνυμο', 'patronymo', 'patronym', 'fathersname', 'fathername', 'father', 'ονομαπατερα', 'πατερα', 'onomapatera', 'patera'],
  // 3 — motherName
  ['μητρωνυμο', 'mitronymo', 'mitronym', 'mothersname', 'mothername', 'mother', 'ονομαμητερας', 'μητερας', 'μητερα', 'onomamiteras', 'miteras', 'mitera'],
  // 4 — fatherFullName  [Ονοματεπώνυμο Πατέρα] — nominative
  ['ονοματεπωνυμοπατερα', 'fatherfullname', 'ονοματεπωνυμο1'],
  // 5 — motherFullName  [Ονοματεπώνυμο Μητέρας] — nominative
  ['ονοματεπωνυμομητερασ', 'motherfullname', 'ονοματεπωνυμο2'],
  // 6 — fatherFullNameGen  [Ονοματεπώνυμο Πατρός] — genitive
  ['ονοματεπωνυμοπατροσ', 'fatherfullnamegen'],
  // 7 — motherFullNameGen  [Ονοματεπώνυμο Μητρός] — genitive
  ['ονοματεπωνυμομητροσ', 'motherfullnamegen'],
  // 8 — godparent  [Ανάδοχος], [Ανάδοχος 1]
  ['αναδοχοσ', 'αναδοχοσ1', 'αναδοχου', 'anadochos', 'anadochos1', 'godparent', 'godparent1', 'godparentname', 'godparent1name', 'godparentfullname', 'sponsor', 'nounos', 'νονος', 'νονα', 'nonos', 'nona'],
  // 9 — godparent2
  ['αναδοχοσ2', 'secondgodparent', 'anadochos2', 'godparent2', 'godparent2name', 'godparent2fullname'],
  // 10 — priest
  ['εφημεριοσ', 'efimerios', 'priest', 'priestname', 'priestfullname', 'assignedpriest', 'ιερεας', 'ιερεαςονομα', 'iereas', 'iereasonoma',
   'ονοματεπωνυμοεφημεριου', 'ονοματεπωνυμοιερεωσ'],
  // 11 — templeNameEl
  ['ναος', 'naos', 'temple', 'templename', 'templenamel', 'ναοσονομα', 'naosonoma', 'ιερουναου', 'ιεροσναοσ',
   'ονομασιαναου', 'ονομασιαιερουναου', 'ονομαναου'],
  // 12 — metropolisName
  ['μητροπολη', 'metropolis', 'metropolisname', 'μητροποληονομα', 'mitropolionoma', 'mitropoli'],
  // 13 — currentDate
  ['ημερομηνια', 'imerominia', 'date', 'currentdate', 'today'],
  // 14 — ceremonyDate
  ['ημερομηνιατελεσης', 'imerominiatelesis', 'ceremonydate', 'dateofceremony'],
  // 15 — month  [Μήνας] / [Μηνός]
  ['μηνασ', 'μηνοσ', 'μηναστελεσησ', 'μηνοστελεσησ', 'month'],
  // 16 — dayName  [Ημέρα] + any standalone Greek day-of-week name as example value
  ['ημερα', 'ημεραεβδομαδασ', 'dayname', 'weekday', 'ημερατελεσησεβδ',
   'κυριακη', 'δευτερα', 'τριτη', 'τεταρτη', 'πεμπτη', 'παρασκευη', 'σαββατο'],
  // 17 — childGender  [φύλο] + gender example-values [άρρεν], [θήλυ]
  ['φυλο', 'φυλοτεκνου', 'childgender', 'gender', 'αρρεν', 'θηλυ', 'θηλυκο', 'αρσεν'],
  // 18 — protocolNumber
  ['πρωτοκολλο', 'protokollo', 'protocol', 'protocolnumber', 'αριθμπρωτοκολλου', 'arithmprotokollou'],
  // 19 — bookNumber
  ['βιβλιο', 'βιβλιου', 'βιβλιων', 'vivlio', 'book', 'booknumber', 'αριθμβιβλιου', 'βιβλιοαριθμοσ', 'arithmvivliou', 'vivlioarithmos'],
  // 20 — birthCity  [Πόλη] (nominative — child's birth city; [Πόλης] genitive is fatherCity, group 35)
  ['πολη', 'πολιτεκνου', 'birthcity', 'πολιγεννησησ', 'πολιγεννησεωσ', 'ποληγεννησησ', 'ποληγεννησεωσ', 'πολιγεννησεωσ'],
  // 21 — civilRegistry
  ['ληξιαρχειο', 'civilregistry', 'registryoffice'],
  // 22 — civilRegistryNumber
  ['αριθμοσληξιαρχικησ', 'αριθμοσπραξησ', 'ληξιαρχικη', 'civilregistrynumber', 'registrynumber'],
  // 23 — civilRegistryTome
  // "τομοστουληξιαρχ" (15 chars) covers "[Τόμος του Ληξιαρχείου]" and beats
  // "ληξιαρχειο" (10 chars, group 21) in longest-first substring matching.
  ['τομοσληξιαρχειου', 'τομοστουληξιαρχ', 'τομοσ', 'civilregistrytome', 'registrytome'],
  // 24 — civilRegistryYear
  ['ετοσληξιαρχικησ', 'civilregistryyear'],
  // 25 — birthDate
  ['ημερομηνιαγεννησησ', 'birthdate', 'birthdateformatted', 'birthformatted'],
  // 26 — godparentCity
  ['πολεωσ', 'πολιαναδοχου', 'godparentcity', 'anadoxoscity'],
  // 27 — address (Οδός, street)
  ['οδοσ', 'οδοστεκνου', 'address', 'street', 'streetname', 'οδοσκατοικιασ'],
  // 28 — ceremonyTime (Ώρα τελετής)
  ['ωρα', 'ωρατελεσησ', 'ceremonytime', 'timeoceremony', 'time', 'hour'],
  // 29 — birthDay  descriptive names like [ημέρα γέννησης]
  ['ημεραγεννησεωσ', 'ημεραγεννησησ', 'birthday', 'birthdaynumber', 'ημεραγεν'],
  // 30 — birthMonth  descriptive names like [μήνας γέννησης]
  ['μηνασγεννησησ', 'μηνοσγεννησεωσ', 'birthmonth', 'μηναγεννησησ', 'μηνγεννησησ'],
  // 31 — birthYear  descriptive names like [έτος γέννησης]
  ['εποσγεννησεωσ', 'εποσγεννησησ', 'birthyear', 'yearofbirth', 'εποσγεν'],
  // 32 — ceremonyDay  descriptive names like [ημέρα τελετής]
  ['ημερατελεσησ', 'ceremonyday', 'daynumber', 'αριθμοσημερασ'],
  // 33 — ceremonyYear  descriptive names like [έτος τελετής]
  ['εποστελεσησ', 'ceremonyyear', 'yearofceremony', 'ετοστελεσησ'],
  // 34 — templeCity  Πόλη του Ναού (fixed per temple, used in formal headers "εν [Πόλει]")
  ['πολιναου', 'πολητελεσησ', 'πολητελετησ', 'templecity', 'ceremonycity', 'naoscity',
   'πολιναοσ', 'εδρα', 'τοποστελεσησ'],
  // 35 — fatherCity  [Πόλης] (genitive — father's/parents' residence city)
  ['πολησπατερα', 'πολιγονεα', 'πολιπατερα', 'fathercity', 'parentcity', 'πολησ',
   'πολοικατοικιασγονεα', 'πολικατοικιασγονεα'],
  // 36 — fatherAddress  [Οδός Πατέρα]
  ['οδοσπατερα', 'οδοσγονεα', 'fatheraddress', 'parentaddress', 'οδοσκατοικιασπατερα',
   'οδοιπατερα', 'streetpatera'],
  // 37 — fatherAddressNumber  [Αριθμός Πατέρα]
  ['αριθμοσπατερα', 'αριθμοσγονεα', 'fatheraddressnumber', 'parentaddressnumber',
   'αριθμοσοδουπατερα', 'αριθμοσοδογονεα', 'αριθμοσοδοστεκνου'],
  // 38 — godparentAddress  [Οδός Αναδόχου]
  ['οδοσαναδοχου', 'οδοσκατοικιασαναδοχου', 'godparentaddress', 'anadoxosaddress',
   'οδοιαναδοχου', 'streetanadoxou'],
  // 39 — godparentAddressNumber  [Αριθμός Αναδόχου]
  ['αριθμοσαναδοχου', 'αριθμοσοδουαναδοχου', 'godparentaddressnumber', 'anadoxosaddressnumber',
   'αριθμοσοδοιαναδοχου'],
  // 40 — orderNumber  αρ. επισκοπικής εντολής
  ['αριθμοσεντολησ', 'εντολη', 'ordernumber', 'αριθμεντολησ', 'εντολησαριθμοσ',
   'αριθμοσεντολεωσ', 'εντολεωσαριθμοσ'],
  // 41 — orderDate  ημ. επισκοπικής εντολής
  ['ημερομηνιαεντολησ', 'orderdate', 'εντολησημερομηνια', 'ημερεντολησ',
   'ημερομηνιαεντολεωσ', 'εντολεωσημερομηνια'],
  // 42 — childNameAcc  [Αλέξανδρον] (όνομα τέκνου αιτιατική)
  ['ονομααιτιατικη', 'childnameacc', 'ονοματεκνουαιτιατικη', 'childnameaccusative',
   'ονομαβαπτιζομενου', 'ονομαβαπτιζομενης'],
  // 43 — childLastNameAcc  (επώνυμο τέκνου αιτιατική)
  ['επωνυμοαιτιατικη', 'childlastnameacc', 'επωνυμοτεκνουαιτιατικη', 'childlastnameaccusative',
   'επωνυμοβαπτιζομενου'],
  // 44 — previousReligion  [Αβάπτιστος] (θρήσκευμα πριν τη βάπτιση)
  ['θρησκευμα', 'θρησκεια', 'previousreligion', 'θρησκευματελεσησ', 'θρησκευμαπρο',
   'θρησκευμαπροτελεσησ', 'provreligion'],
  // 45 — residenceAddress  διεύθυνση διαμονής βαπτιζόμενου (για ενήλικες / Απαντητικόν)
  ['διευθυνσηδιαμονησ', 'διευθυνσηκατοικιασ', 'residenceaddress', 'τοποσδιαμονησ',
   'residencestreet', 'διευθυνσηβαπτιζομενου'],
  // 46 — residenceCity  πόλη διαμονής βαπτιζόμενου
  ['πολιδιαμονησ', 'πολοικατοικιασ', 'residencecity', 'τοποσκατοικιασ', 'cityofresidence',
   'πολοιδιαμονησ', 'πολιβαπτιζομενου'],
  // 47 — ceremonyDayMonth  "6η Ιουνίου" — day+month without year (Απαντητικόν pattern)
  ['ceremonydaymonth', 'ημερατελεσησμηνοσ', 'ημερακαιμηναστελεσησ', 'daymonthceremony'],
];

export function getNormalizedValue(placeholderKey: string, answers: Record<string, any>): string {
  if (!answers || typeof answers !== 'object') return '';
  const pClean = cleanKey(placeholderKey);
  if (!pClean) return '';

  // 1. Direct normalized key comparison
  for (const [key, val] of Object.entries(answers)) {
    if (cleanKey(key) === pClean) {
      return val !== undefined && val !== null ? String(val) : '';
    }
  }

  // 2. Synonym group lookup
  const group = SYNONYM_GROUPS.find(g => g.map(cleanKey).includes(pClean));
  if (group) {
    const cleanedGroup = group.map(cleanKey);
    for (const [key, val] of Object.entries(answers)) {
      const kClean = cleanKey(key);
      if (cleanedGroup.includes(kClean)) {
        return val !== undefined && val !== null ? String(val) : '';
      }
    }
  }

  // 3. Pattern-based recognition for example-value placeholders ────────────────
  // Handles templates that use concrete example values as placeholder names,
  // e.g. [Αυγούστου] instead of [Μηνός], or [7ην] instead of [00ην].
  // Strategy: prefer birth-date fields (most common use of example values in
  // baptism certificates), then fall back to ceremony-date equivalents.

  // Greek month name (any month, any grammatical form) ─────────────────────────
  if (GREEK_MONTHS_CLEAN.has(pClean)) {
    // Birth month first (Βαπτιστικό-style: "γεννηθέν την 7ην Αυγούστου 2020")
    for (const [k, v] of Object.entries(answers)) {
      if (cleanKey(k) === 'birthmonth' && v) return String(v);
    }
    // Fall back: ceremony month (group 13)
    const g13 = SYNONYM_GROUPS[13].map(cleanKey);
    for (const [k, v] of Object.entries(answers)) {
      if (g13.includes(cleanKey(k)) && v !== undefined && v !== null) return String(v);
    }
  }

  // Ordinal-day pattern: [7ην], [17η], [21ης] ──────────────────────────────────
  if (ORDINAL_DAY_RE.test(pClean)) {
    // Birth day first
    for (const [k, v] of Object.entries(answers)) {
      if (cleanKey(k) === 'birthday' && v) return String(v);
    }
    // Fall back: ceremony day ordinal [00ην]
    for (const [k, v] of Object.entries(answers)) {
      if (cleanKey(k) === '00ην' && v) return String(v);
    }
  }

  // 4-digit year as example value: [2020], [1996] ───────────────────────────────
  if (EXAMPLE_YEAR_RE.test(pClean) && +pClean >= 1900 && +pClean <= 2100) {
    // Birth year first
    for (const [k, v] of Object.entries(answers)) {
      if (cleanKey(k) === 'birthyear' && v) return String(v);
    }
    // Fall back: ceremony year [0000]
    for (const [k, v] of Object.entries(answers)) {
      if (cleanKey(k) === '0000' && v) return String(v);
    }
  }

  // Ecclesiastical title prefix → treat as priest full name ────────────────────
  // Matches: [Αρχιμανδρίτης Νικόλαος Παπαγεωργίου], [Πρεσβύτερος Γεώργιος Κ.], etc.
  if (PRIEST_TITLE_RE.test(pClean)) {
    const g8 = SYNONYM_GROUPS[8].map(cleanKey); // priest synonym group
    for (const [k, v] of Object.entries(answers)) {
      if (g8.includes(cleanKey(k)) && v) return String(v);
    }
  }

  // Time as example value: [12:00], [09:30] etc. — cleanKey strips the colon,
  // so we must test the ORIGINAL string here before pClean loses it.
  if (/^\d{1,2}:\d{2}$/.test(placeholderKey.trim())) {
    const g26 = SYNONYM_GROUPS[26].map(cleanKey); // ceremonyTime group
    for (const [k, v] of Object.entries(answers)) {
      if (g26.includes(cleanKey(k)) && v !== undefined && v !== null) return String(v);
    }
  }

  return '';
}

// ─── Standard field descriptors ─────────────────────────────────────────────
// Maps standard field keys (used as answer keys) to human-readable labels.
// Index must match GROUP_TO_FIELD and SYNONYM_GROUPS.
export const STANDARD_FIELDS: { key: string; label: string }[] = [
  { key: 'childName',           label: 'Όνομα τέκνου' },
  { key: 'childLastName',       label: 'Επώνυμο τέκνου' },
  { key: 'fatherName',          label: 'Πατρώνυμο (όνομα πατέρα)' },
  { key: 'motherName',          label: 'Μητρώνυμο (όνομα μητέρας)' },
  { key: 'fatherFullName',      label: 'Ονοματεπώνυμο Πατέρα (ονομαστική)' },
  { key: 'fatherFullNameGen',   label: 'Ονοματεπώνυμο Πατέρα (γενική)' },
  { key: 'motherFullName',      label: 'Ονοματεπώνυμο Μητέρας (ονομαστική)' },
  { key: 'motherFullNameGen',   label: 'Ονοματεπώνυμο Μητέρας (γενική)' },
  { key: 'godparent',           label: 'Ανάδοχος (κύριος)' },
  { key: 'godparent2',          label: 'Δεύτερος Ανάδοχος' },
  { key: 'priest',              label: 'Εφημέριος' },
  { key: 'templeNameEl',        label: 'Ονομασία Ναού' },
  { key: 'metropolisName',      label: 'Ιερά Μητρόπολη' },
  { key: 'currentDate',         label: 'Σημερινή Ημερομηνία' },
  { key: 'ceremonyDate',        label: 'Ημερομηνία Τελετής' },
  { key: 'month',               label: 'Μήνας Τελετής' },
  { key: 'dayName',             label: 'Ημέρα Εβδομάδας' },
  { key: 'childGender',         label: 'Φύλο τέκνου' },
  { key: 'protocolNumber',      label: 'Αρ. Πρωτοκόλλου' },
  { key: 'bookNumber',          label: 'Αρ. Βιβλίου' },
  { key: 'birthCity',           label: 'Πόλη Γέννησης' },
  { key: 'civilRegistry',       label: 'Ληξιαρχείο' },
  { key: 'civilRegistryNumber', label: 'Αρ. Ληξιαρχικής Πράξης' },
  { key: 'civilRegistryTome',   label: 'Τόμος Ληξιαρχείου' },
  { key: 'civilRegistryYear',   label: 'Έτος Ληξιαρχικής Πράξης' },
  { key: 'birthDate',           label: 'Ημερομηνία Γέννησης' },
  { key: 'godparentCity',       label: 'Πόλη Αναδόχου' },
  { key: 'address',             label: 'Οδός / Διεύθυνση' },
  { key: 'ceremonyTime',        label: 'Ώρα Τελετής' },
  { key: 'birthDay',            label: 'Ημέρα Γέννησης (αριθμός)' },
  { key: 'birthMonth',          label: 'Μήνας Γέννησης' },
  { key: 'birthYear',           label: 'Έτος Γέννησης' },
  { key: 'ceremonyDay',         label: 'Ημέρα Τελετής (αριθμός)' },
  { key: 'ceremonyYear',        label: 'Έτος Τελετής' },
  { key: 'templeCity',           label: 'Πόλη Ναού (τόπος τελετής)' },
  { key: 'fatherCity',           label: 'Πόλη Κατοικίας Πατέρα' },
  { key: 'fatherAddress',        label: 'Οδός Πατέρα' },
  { key: 'fatherAddressNumber',  label: 'Αριθμός Οδού Πατέρα' },
  { key: 'godparentAddress',     label: 'Οδός Αναδόχου' },
  { key: 'godparentAddressNumber', label: 'Αριθμός Οδού Αναδόχου' },
  { key: 'orderNumber',          label: 'Αρ. Επισκοπικής Εντολής' },
  { key: 'orderDate',            label: 'Ημ/νία Επισκοπικής Εντολής' },
  { key: 'childNameAcc',         label: 'Όνομα Τέκνου (αιτιατική)' },
  { key: 'childLastNameAcc',     label: 'Επώνυμο Τέκνου (αιτιατική)' },
  { key: 'previousReligion',     label: 'Θρήσκευμα (προ Βαπτίσεως)' },
  { key: 'residenceAddress',     label: 'Διεύθυνση Διαμονής' },
  { key: 'residenceCity',        label: 'Πόλη Διαμονής' },
  { key: 'ceremonyDayMonth',     label: 'Ημέρα & Μήνας Τελετής (χωρίς χρονιά)' },
];

// Maps synonym group index → standard field key (must stay in sync with SYNONYM_GROUPS)
export const GROUP_TO_FIELD: string[] = [
  'childName',           // 0
  'childLastName',       // 1
  'fatherName',          // 2
  'motherName',          // 3
  'fatherFullName',      // 4  — nominative
  'motherFullName',      // 5  — nominative
  'fatherFullNameGen',   // 6  — genitive
  'motherFullNameGen',   // 7  — genitive
  'godparent',           // 8
  'godparent2',          // 9
  'priest',              // 10
  'templeNameEl',        // 11
  'metropolisName',      // 12
  'currentDate',         // 13
  'ceremonyDate',        // 14
  'month',               // 15
  'dayName',             // 16
  'childGender',         // 17
  'protocolNumber',      // 18
  'bookNumber',          // 19
  'birthCity',           // 20
  'civilRegistry',       // 21
  'civilRegistryNumber', // 22
  'civilRegistryTome',   // 23
  'civilRegistryYear',   // 24
  'birthDate',           // 25
  'godparentCity',       // 26
  'address',             // 27
  'ceremonyTime',        // 28
  'birthDay',            // 29
  'birthMonth',          // 30
  'birthYear',           // 31
  'ceremonyDay',         // 32
  'ceremonyYear',        // 33
  'templeCity',          // 34
  'fatherCity',          // 35
  'fatherAddress',       // 36
  'fatherAddressNumber', // 37
  'godparentAddress',    // 38
  'godparentAddressNumber', // 39
  'orderNumber',         // 40
  'orderDate',           // 41
  'childNameAcc',        // 42
  'childLastNameAcc',    // 43
  'previousReligion',    // 44
  'residenceAddress',    // 45
  'residenceCity',       // 46
  'ceremonyDayMonth',   // 47
];

/**
 * Auto-maps a template variable name (e.g. "Πατρώνυμο" or "[Πατρώνυμο]")
 * to a standard field key (e.g. "fatherName").
 * Returns null if no match found — the user must map it manually.
 */
export function autoMapVariable(placeholder: string): string | null {
  // Strip any surrounding delimiters: [x], {{x}}, {x}
  const raw = placeholder
    .replace(/^\[/, '').replace(/\]$/, '')
    .replace(/^\{\{/, '').replace(/\}\}$/, '')
    .replace(/^\{/, '').replace(/\}$/, '')
    .trim();

  if (!raw) return null;

  // ── Numeric / format-hint patterns ──────────────────────────────────────────
  // These are format hints (e.g. [123], [00], [0000], [00:00]) — not data fields.
  // Exceptions: 4-digit example years (e.g. [2020]) and HH:MM example times (e.g. [12:00]).
  if (/^\d{1,2}:\d{2}$/.test(raw)) return 'ceremonyTime';  // [12:00], [09:30] → ceremony time
  const isExampleYear = /^\d{4}$/.test(raw) && +raw >= 1900 && +raw <= 2100;
  if (!isExampleYear && /^[\d: ]+$/.test(raw)) return '__ignore__';
  if (/^[Α-Ωα-ω]\d+$/u.test(raw)) return '__ignore__';

  // ── Conditional block phrases starting with "και" → ignore ──────────────────
  // e.g. [και Ανάδοχος 2 κατοίκου Πόλεως, Οδός, αριθμός 000]
  if (/^και\s/u.test(raw)) return '__ignore__';

  // ── Date-like compound patterns ─────────────────────────────────────────────
  // [30 Μαΐου 2026]      → has year  → ceremonyDate (full date)
  // [4ην Σεπτεμβρίου]    → no year   → ceremonyDayMonth ("6η Ιουνίου" format)
  // Skip zero-padded format hints like [00ην Μηνός] — literal answer keys.
  if (!/^0+\D/.test(raw) && /^\d+\s*(ην|ης|η)?\s+\S/iu.test(raw)) {
    return /\d{4}/.test(raw) ? 'ceremonyDate' : 'ceremonyDayMonth';
  }

  // ── Gender / number token patterns ──────────────────────────────────────────
  // These are handled by resolveGenderTokens at generation time, not as data fields.
  // Placeholders that are purely grammatical markers → __ignore__
  if (/^τον[/(]/u.test(raw) || /^τ[ηο][ν]?\//u.test(raw)) return '__ignore__';
  if (/^ανάδοχο/u.test(raw)) return '__ignore__';
  if (/^\(/u.test(raw)) return '__ignore__';          // [(τους αναδόχους)]
  if (/^[α-ω]{1,3}\/[α-ω]{1,3}$/u.test(raw)) return '__ignore__'; // [ου/ων], [ο/η]

  // ── Pass 1: Exact synonym group lookup ──────────────────────────────────────
  const pClean = cleanKey(raw);
  if (!pClean) return null;

  const groupIdx = SYNONYM_GROUPS.findIndex(g => g.map(cleanKey).includes(pClean));
  if (groupIdx >= 0 && groupIdx < GROUP_TO_FIELD.length) {
    return GROUP_TO_FIELD[groupIdx];
  }

  // ── Numeric-prefixed compound format keys ────────────────────────────────────
  // e.g. [00ῇ Μήνος 0000] → pClean "00ημηνοσ0000", [00ην Μηνός] → "00ημηνοσ"
  // These are literal answer keys (set in generate-all with the same name).
  // Return null so lookupKey uses direct hasOwnProperty and finds the correct value.
  if (/^\d/u.test(pClean) && pClean.length > 4 && /[α-ω]/u.test(pClean)) return null;

  // ── Pass 2: Substring / contains matching (longest synonym first) ────────────
  // Catches non-standard names like "[Πλήρες Ονοματεπώνυμο Πατέρα]",
  // "[Ονοματεπώνυμο & Διεύθυνση Αναδόχου]", "[Αρ. Πρωτοκόλλου Βαπτίσεως]" etc.
  // Minimum synonym length = 5 to keep short but meaningful terms (e.g. "τομοσ", "μηνασ")
  // while excluding single/two-letter tokens that cause false positives.
  // Sorted longest-first so that e.g. "ονοματεπωνυμοπατερα" (19) is tested before
  // "ονομαπατερα" (11) or "ονομα" (5), preventing premature short-circuit.
  const synonymList: { term: string; groupIdx: number }[] = [];
  for (let i = 0; i < SYNONYM_GROUPS.length; i++) {
    for (const s of SYNONYM_GROUPS[i]) {
      const cleaned = cleanKey(s);
      if (cleaned.length >= 5) {
        synonymList.push({ term: cleaned, groupIdx: i });
      }
    }
  }
  synonymList.sort((a, b) => b.term.length - a.term.length);

  for (const { term, groupIdx: gIdx } of synonymList) {
    if (pClean.includes(term)) {
      return GROUP_TO_FIELD[gIdx];
    }
  }

  // ── Pass 3: Example-value pattern recognition ────────────────────────────────
  // Handles templates that use real data values as placeholder names.
  // These are mapped to the most likely semantic field so the mapping UI
  // shows a sensible pre-filled suggestion.

  // Greek month name → birthMonth (example-value heuristic: baptism certificates
  // use example values for birth date while ceremony date uses format hints)
  if (GREEK_MONTHS_CLEAN.has(pClean)) return 'birthMonth';

  // Ordinal day [7ην], [17η] → birthDay
  if (ORDINAL_DAY_RE.test(pClean)) return 'birthDay';

  // 4-digit year in plausible range → birthYear
  if (EXAMPLE_YEAR_RE.test(pClean) && +pClean >= 1900 && +pClean <= 2100) return 'birthYear';

  // Ecclesiastical title prefix → priest
  if (PRIEST_TITLE_RE.test(pClean)) return 'priest';

  return null;
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
