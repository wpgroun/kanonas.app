/**
 * Orthodox Easter Date Computation — Meeus/Jones/Butcher algorithm
 * adapted for the Julian calendar (Orthodox Easter).
 *
 * Returns the date of Orthodox Easter for a given year.
 */

export function orthodoxEaster(year: number): Date {
 // Meeus Julian algorithm
 const a = year % 4
 const b = year % 7
 const c = year % 19
 const d = (19 * c + 15) % 30
 const e = (2 * a + 4 * b - d + 34) % 7
 const f = Math.floor((d + e + 114) / 31) // month (3=March, 4=April)
 const g = ((d + e + 114) % 31) + 1 // day in Julian

 // Convert Julian to Gregorian (add 13 days for 20th-21st century)
 const julianDate = new Date(year, f - 1, g)
 julianDate.setDate(julianDate.getDate() + 13)
 return julianDate
}

/** All moveable feasts of the Orthodox year relative to Easter */
export interface OrthodoxFeast {
 name: string
 daysFromEaster: number
 isMajor: boolean
}

export const MOVEABLE_FEASTS: OrthodoxFeast[] = [
 { name: 'Κυριακή Τελώνου & Φαρισαίου', daysFromEaster: -70, isMajor: false },
 { name: 'Απόκριες (Σαββατοκύριακο)', daysFromEaster: -56, isMajor: false },
 { name: 'Καθαρά Δευτέρα', daysFromEaster: -48, isMajor: true },
 { name: 'Κυριακή της Ορθοδοξίας', daysFromEaster: -42, isMajor: true },
 { name: 'Σταυροπροσκύνηση', daysFromEaster: -21, isMajor: false },
 { name: 'Σάββατο Αζύμων (Λαζάρου)', daysFromEaster: -8, isMajor: false },
 { name: 'Κυριακή Βαΐων', daysFromEaster: -7, isMajor: true },
 { name: 'Μεγάλη Τετάρτη', daysFromEaster: -4, isMajor: false },
 { name: 'Μεγάλη Πέμπτη', daysFromEaster: -3, isMajor: true },
 { name: 'Μεγάλη Παρασκευή', daysFromEaster: -2, isMajor: true },
 { name: 'Μεγάλο Σάββατο — Αναστάσιμη Αγρυπνία', daysFromEaster: -1, isMajor: true },
 { name: 'ΠΑΣΧΑ — Ανάσταση', daysFromEaster: 0, isMajor: true },
 { name: 'Δευτέρα Διακαινησίμου', daysFromEaster: 1, isMajor: false },
 { name: 'Κυριακή Αντίπασχα (Θωμά)', daysFromEaster: 7, isMajor: false },
 { name: 'Κυριακή Μυροφόρων', daysFromEaster: 14, isMajor: false },
 { name: 'Κυριακή Παραλύτου', daysFromEaster: 21, isMajor: false },
 { name: 'Μεσοπεντηκοστή', daysFromEaster: 24, isMajor: false },
 { name: 'Κυριακή Σαμαρείτιδος', daysFromEaster: 28, isMajor: false },
 { name: 'Κυριακή Τυφλού', daysFromEaster: 35, isMajor: false },
 { name: 'Ανάληψη', daysFromEaster: 39, isMajor: true },
 { name: 'Αποδόσεις Πάσχα', daysFromEaster: 48, isMajor: false },
 { name: 'Πεντηκοστή', daysFromEaster: 49, isMajor: true },
 { name: 'Αγίου Πνεύματος (Δευτέρα)', daysFromEaster: 50, isMajor: false },
 { name: 'Κυριακή Αγίων Πάντων', daysFromEaster: 56, isMajor: false },
]

/**
 * Generate schedule entries for all moveable feasts in a given year.
 * Returns array ready for bulk insertion into ServiceSchedule.
 */
export function generateMoveableFeastsSchedule(year: number): Array<{
 date: Date
 title: string
 isMajor: boolean
 description: string
}> {
 const easter = orthodoxEaster(year)

 return MOVEABLE_FEASTS.map(feast => {
 const date = new Date(easter)
 date.setDate(date.getDate() + feast.daysFromEaster)
 return {
 date,
 title: feast.name,
 isMajor: feast.isMajor,
 description: feast.daysFromEaster === 0
 ? `Πάσχα ${year} — Κεντρική Εορτή`
 : feast.daysFromEaster < 0
 ? `${Math.abs(feast.daysFromEaster)} ημέρες πριν το Πάσχα ${year}`
 : `${feast.daysFromEaster} ημέρες μετά το Πάσχα ${year}`,
 }
 })
}

/**
 * Fixed (non-moveable) Orthodox feasts — always same date.
 */
export const FIXED_FEASTS = [
 { date: '01-01', title: 'Πρωτοχρονιά — Άγιος Βασίλειος', isMajor: true },
 { date: '01-06', title: 'Θεοφάνεια (Φώτα)', isMajor: true },
 { date: '02-02', title: 'Υπαπαντή του Κυρίου', isMajor: true },
 { date: '03-25', title: 'Ευαγγελισμός Θεοτόκου & Εθνική Εορτή', isMajor: true },
 { date: '08-06', title: 'Μεταμόρφωση του Σωτήρος', isMajor: true },
 { date: '08-15', title: 'Κοίμηση Θεοτόκου', isMajor: true },
 { date: '09-08', title: 'Γενέθλιον Θεοτόκου', isMajor: false },
 { date: '09-14', title: 'Ύψωση Τιμίου Σταυρού', isMajor: true },
 { date: '10-26', title: 'Άγιος Δημήτριος', isMajor: false },
 { date: '11-08', title: 'Σύναξη Αρχαγγέλων', isMajor: false },
 { date: '11-21', title: 'Εισόδια Θεοτόκου', isMajor: true },
 { date: '12-06', title: 'Άγιος Νικόλαος', isMajor: false },
 { date: '12-25', title: 'Χριστούγεννα — Γέννηση Ιησού Χριστού', isMajor: true },
 { date: '12-26', title: 'Σύναξη Θεοτόκου', isMajor: false },
 { date: '12-27', title: 'Άγιος Στέφανος Πρωτομάρτυρας', isMajor: false },
] as const

/** Generate fixed feasts for a given year */
export function generateFixedFeastsSchedule(year: number): Array<{
 date: Date; title: string; isMajor: boolean; description: string
}> {
 return FIXED_FEASTS.map(f => {
 const [month, day] = f.date.split('-').map(Number)
 return {
 date: new Date(year, month - 1, day),
 title: f.title,
 isMajor: f.isMajor,
 description: `Αμετακίνητη Εορτή ${year}`,
 }
 })
}
