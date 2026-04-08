export const GREEKLISH_MAP: Record<string, string> = {
  'imorominia': 'Ημερομηνία',
  'minas_geniki': 'Μήνας (Γενική)',
  'etos': 'Έτος',
  'imera_evdomadas': 'Ημέρα Εβδομάδας',
  'ora': 'Ώρα',
  'onomateponymo_gamprou': 'Ονοματεπώνυμο Γαμπρού',
  'onomateponymo_nyfis': 'Ονοματεπώνυμο Νύφης',
  'adt_gamprou': 'ΑΔΤ Γαμπρού',
  'adt_nyfis': 'ΑΔΤ Νύφης',
  'patromymo_gamprou': 'Πατρώνυμο Γαμπρού',
  'patromymo_nyfis': 'Πατρώνυμο Νύφης',
  'mitromymo_gamprou': 'Μητρώνυμο Γαμπρού',
  'mitromymo_nyfis': 'Μητρώνυμο Νύφης',
  'topos_gennisis_gamprou': 'Τόπος Γέννησης Γαμπρού',
  'topos_gennisis_nyfis': 'Τόπος Γέννησης Νύφης',
  'eponymo_teknon': 'Επώνυμο Τέκνων',
  'protolollo': 'Αριθμός Πρωτοκόλλου',
  'arithmos_vivliou': 'Αριθμός Βιβλίου',
  'arithmos_gamou': 'Αριθμός Γάμου',
  'lixiarxeio': 'Ληξιαρχείο',
  'paranymbos_1': 'Παράνυμφος 1',
  'paranymbos_2': 'Παράνυμφος 2',
  'katoikos_1': 'Κάτοικος 1',
  'katoikos_2': 'Κάτοικος 2',
  'fylo': 'Φύλο',
  'thriskeyma': 'Θρήσκευμα',
  'ypikootita': 'Υπηκοότητα',
  'epangelma': 'Επάγγελμα',
  'diefthinsi': 'Διεύθυνση',
  'tk': 'Τ.Κ.',
  'poli': 'Πόλη',
  'tilefono': 'Τηλέφωνο',
}

export function humanizeVarName(varName: string): string {
  if (!varName) return ''
  const lower = varName.toLowerCase()
  if (GREEKLISH_MAP[lower]) return GREEKLISH_MAP[lower]
  // Try partial match (e.g. key contained in varName)
  for (const [key, label] of Object.entries(GREEKLISH_MAP)) {
    if (lower.includes(key)) return label
  }
  // Fallback: replace underscores and return as-is
  return varName.replace(/_/g, ' ')
}
