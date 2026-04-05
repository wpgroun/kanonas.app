/**
 * Εορτολόγιο της Ορθόδοξης Εκκλησίας (Namedays Engine)
 * Υποστηρίζει Κινητές Εορτές (βάσει Πασχαλίου) και Μόνιμες Εορτές.
 */

// 1. Υπολογισμός Ορθόδοξου Πάσχα (Αλγόριθμος του Καρλ Φρίντριχ Γκάους)
export function getOrthodoxEaster(year: number): Date {
 const a = year % 19;
 const b = year % 4;
 const c = year % 7;
 const d = (19 * a + 15) % 30;
 const e = (2 * b + 4 * c + 6 * d + 6) % 7;
 
 // 13 Days is the drift difference between Julian and Gregorian up until the year 2099
 const daysToAdd = d + e + 13; 
 
 // Start from March 21
 const easter = new Date(year, 2, 21); // Month 2 is March in JS
 easter.setDate(easter.getDate() + daysToAdd);
 return easter;
}

// 2. Λεξικό κοινών Ελληνικών Ονομάτων (Normalizer: αφαίρεση τόνων)
export function normalizeGreekName(name: string): string {
 return name.trim().toUpperCase()
 .replace(/[ΆΑΑ]/g, 'Α')
 .replace(/[ΈΕΕ]/g, 'Ε')
 .replace(/[ΉΗΗ]/g, 'Η')
 .replace(/[ΊΙΙΪ]/g, 'Ι')
 .replace(/[ΌΟΟ]/g, 'Ο')
 .replace(/[ΎΥΥΫ]/g, 'Υ')
 .replace(/[ΏΩΩ]/g, 'Ω');
}

// Σταθερές Εορτές. Key = MM-DD -> Array of Names
const FIXED_FEASTS: Record<string, string[]> = {
 // Ιανουάριος
"01-01": ["ΒΑΣΙΛΕΙΟΣ","ΒΑΣΙΛΙΚΗ","ΒΑΣΩ","ΒΑΣΙΛΗΣ","ΒΙΛΛΥ"],
"01-07": ["ΙΩΑΝΝΗΣ","ΙΩΑΝΝΑ","ΓΙΑΝΝΗΣ","ΓΙΑΝΝΑ","ΠΡΟΔΡΟΜΟΣ"],
"01-11": ["ΘΕΟΔΟΣΙΟΣ"],
"01-17": ["ΑΝΤΩΝΙΟΣ","ΑΝΤΩΝΙΑ","ΑΝΤΩΝΗΣ","ΤΩΝΙΑ"],
"01-18": ["ΑΘΑΝΑΣΙΟΣ","ΑΘΑΝΑΣΙΑ","ΘΑΝΑΣΗΣ","ΘΑΝΟΣ","ΝΑΝΣΥ","ΚΥΡΙΛΛΟΣ"],
"01-25": ["ΓΡΗΓΟΡΙΟΣ","ΓΡΗΓΟΡΗΣ"],
"01-26": ["ΞΕΝΟΦΩΝ"],
"01-30": ["ΤΡΕΙΣ ΙΕΡΑΡΧΕΣ"],
 
 // Φεβρουάριος
"02-10": ["ΧΑΡΑΛΑΜΠΟΣ","ΜΠΑΜΠΗΣ"],
 
 // Μάρτιος
"03-25": ["ΕΥΑΓΓΕΛΟΣ","ΕΥΑΓΓΕΛΙΑ","ΒΑΓΓΕΛΗΣ","ΕΥΑ","ΒΑΓΓΕΛΙΤΣΑ"],
 
 // Μάιος
"05-21": ["ΚΩΝΣΤΑΝΤΙΝΟΣ","ΚΩΣΤΑΣ","ΕΛΕΝΗ","ΝΤΙΝΟΣ","ΛΕΝΑ"],
"05-29": ["ΥΠΟΜΟΝΗ"],

 // Ιούνιος
"06-29": ["ΠΕΤΡΟΣ","ΠΑΥΛΟΣ"],
"06-30": ["ΑΠΟΣΤΟΛΟΣ","ΑΠΟΣΤΟΛΙΑ","ΤΟΛΗΣ"],

 // Ιούλιος
"07-17": ["ΜΑΡΙΝΑ"],
"07-20": ["ΗΛΙΑΣ"],
"07-25": ["ΑΝΝΑ"],
"07-26": ["ΠΑΡΑΣΚΕΥΗ","ΒΟΥΛΑ","ΕΥΗ","ΠΑΡΙΣ"],
"07-27": ["ΠΑΝΤΕΛΗΣ","ΠΑΝΤΕΛΕΗΜΩΝ"],

 // Αύγουστος
"08-15": ["ΜΑΡΙΑ","ΜΑΡΙΟΣ","ΔΕΣΠΟΙΝΑ","ΠΑΝΑΓΙΩΤΗΣ","ΓΙΩΤΑ","ΣΗΛΙΑ"],
"08-26": ["ΑΔΡΙΑΝΟΣ","ΝΑΤΑΛΙΑ"],
"08-30": ["ΑΛΕΞΑΝΔΡΟΣ"],

 // Σεπτέμβριος
"09-14": ["ΣΤΑΥΡΟΣ","ΣΤΑΥΡΟΥΛΑ"],
"09-17": ["ΣΟΦΙΑ","ΕΛΠΙΔΑ","ΑΓΑΠΗ","ΠΙΣΤΗ"],

 // Οκτώβριος
"10-26": ["ΔΗΜΗΤΡΙΟΣ","ΔΗΜΗΤΡΑ","ΔΗΜΗΤΡΗΣ","ΜΙΜΗΣ","ΜΗΤΣΟΣ"],

 // Νοέμβριος
"11-08": ["ΜΙΧΑΗΛ","ΓΑΒΡΙΗΛ","ΑΓΓΕΛΟΣ","ΑΓΓΕΛΙΚΗ","ΜΙΧΑΛΗΣ","ΡΑΦΑΗΛ","ΤΑΞΙΑΡΧΗΣ","ΜΙΧΑΕΛΑ"],
"11-09": ["ΝΕΚΤΑΡΙΟΣ"],
"11-25": ["ΑΙΚΑΤΕΡΙΝΗ","ΚΑΤΕΡΙΝΑ"],
"11-30": ["ΑΝΔΡΕΑΣ"],

 // Δεκέμβριος
"12-06": ["ΝΙΚΟΛΑΟΣ","ΝΙΚΟΛΕΤΑ","ΝΙΚΟΣ"],
"12-12": ["ΣΠΥΡΙΔΩΝ","ΣΠΥΡΙΔΟΥΛΑ","ΣΠΥΡΟΣ"],
"12-15": ["ΕΛΕΥΘΕΡΙΟΣ","ΕΛΕΥΘΕΡΙΑ","ΛΕΥΤΕΡΗΣ"],
"12-25": ["ΧΡΗΣΤΟΣ","ΧΡΙΣΤΙΝΑ","ΕΜΜΑΝΟΥΗΛ","ΜΑΝΩΛΗΣ","ΜΑΝΟΣ","ΧΡΥΣΑ"],
"12-27": ["ΣΤΕΦΑΝΟΣ","ΣΤΕΦΑΝΙΑ","ΣΤΕΦΑΝ"],
};

/**
 * Υπολογισμός Κινητών Εορτών
 */
function getMovableFeasts(year: number): Record<string, string[]> {
 const easter = getOrthodoxEaster(year);
 
 // Helpers
 const addDays = (date: Date, days: number): Date => {
 const res = new Date(date);
 res.setDate(res.getDate() + days);
 return res;
 };
 const toMMDD = (d: Date) => `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

 const movable: Record<string, string[]> = {};

 // Πάσχα
 movable[toMMDD(easter)] = ["ΑΝΑΣΤΑΣΙΟΣ","ΑΝΑΣΤΑΣΙΑ","ΤΑΣΟΣ","ΠΑΣΧΑΛΗΣ","ΠΑΣΧΑΛΙΑ"];
 
 // Κυριακή των Βαΐων (Πάσχα - 7)
 movable[toMMDD(addDays(easter, -7))] = ["ΒΑΪΟΣ","ΒΑΪΑ"];
 
 // Λάζαρος (Πάσχα - 8)
 movable[toMMDD(addDays(easter, -8))] = ["ΛΑΖΑΡΟΣ"];
 
 // Θωμά (Πάσχα + 7)
 movable[toMMDD(addDays(easter, 7))] = ["ΘΩΜΑΣ","ΜΑΚΗΣ"]; 
 
 // Ζωοδόχου Πηγής (Πάσχα + 5)
 movable[toMMDD(addDays(easter, 5))] = ["ΖΩΗ","ΠΗΓΗ"];

 // ΑΓ. ΓΕΩΡΓΙΟΣ (Ειδικός Κανόνας)
 // Γεώργιος είναι 23 Απριλίου. ΑΝ όμω>ς το Πάσχα είναι μετά τις 23 Απριλίου, μεταφέρεται Τη Δευτέρα του Πάσχα.
 const easterTime = easter.getTime();
 const stGeorgeFixed = new Date(year, 3, 23).getTime(); // April 23
 if (easterTime >= stGeorgeFixed) {
 // Moved to Easter Monday
 movable[toMMDD(addDays(easter, 1))] = ["ΓΕΩΡΓΙΟΣ","ΓΕΩΡΓΙΑ","ΓΙΩΡΓΟΣ","ΓΩΓΩ"];
 } else {
 // Fixed on 23rd
 movable["04-23"] = ["ΓΕΩΡΓΙΟΣ","ΓΕΩΡΓΙΑ","ΓΙΩΡΓΟΣ","ΓΩΓΩ"];
 }

 // ΑΓ. ΜΑΡΚΟΣ (Ειδικός Κανόνας)
 const stMarkFixed = new Date(year, 3, 25).getTime(); // April 25
 if (easterTime >= stMarkFixed) {
 // Moved to Easter Tuesday
 movable[toMMDD(addDays(easter, 2))] = ["ΜΑΡΚΟΣ"];
 } else {
 movable["04-25"] = ["ΜΑΡΚΟΣ"];
 }

 return movable;
}

/**
 * Returns a list of names celebrating on a specific exact Date
 */
export function getCelebratingNamesForDate(date: Date): string[] {
 const mmdd = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
 const year = date.getFullYear();
 
 const movables = getMovableFeasts(year);
 
 const namesFixed = FIXED_FEASTS[mmdd] || [];
 const namesMovable = movables[mmdd] || [];
 
 return [...namesFixed, ...namesMovable];
}

/**
 * Helper to check if a specific name is celebrating on a date
 */
export function isNameday(name: string, date: Date): boolean {
 const celebratingStrList = getCelebratingNamesForDate(date);
 if (celebratingStrList.length === 0) return false;
 
 const normName = normalizeGreekName(name);

 // Partial match logic. E.g if normName is"ΔΗΜΗΤΡΗΣ"and list has"ΔΗΜΗΤΡΙΟΣ", we can use a prefix check or straight inclusions
 return celebratingStrList.some(celeb => {
 if (normName === celeb) return true;
 // Rough matching for nicknames
 if (normName.startsWith(celeb.substring(0,4))) return true; 
 return false;
 });
}
