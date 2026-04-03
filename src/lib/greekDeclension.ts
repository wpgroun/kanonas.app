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

      // -ης  →  -η  (e.g. Δημήτρης → Δημήτρη, Νίκης → Νίκη)
      if (endsWith('ης')) return replaceEnd(1, '');

      // -ος  →  -ου  (e.g. Γεώργιος → Γεωργίου)
      if (endsWith('ος')) return replaceEnd(2, 'ου');

      // -ας  →  -α  (e.g. Νικηφόρας → Νικηφόρα)
      if (endsWith('ας')) return replaceEnd(1, '');

      // -ων  →  -ωνος  (e.g. Σόλων → Σόλωνος)
      if (endsWith('ων')) return replaceEnd(0, 'ος');
    }

    // --- Θηλυκά ---
    if (isFemale || gender === 'unknown') {
      // Μαρία → Μαρίας, Ελένα → Ελένας
      if (endsWith('α') || endsWith('ά')) return name + (lower.endsWith('ά') ? 'ς' : 'ς');

      // Ελένη → Ελένης, Σοφή → Σοφής
      if (endsWith('η') || endsWith('ή')) return name + 'ς';

      // -ώ  →  -ούς  (e.g. Σαπφώ → Σαπφούς)
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
