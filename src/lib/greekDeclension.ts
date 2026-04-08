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
