/**
 * Ελέγχει την μαθηματική ορθότητα ενός Ελληνικού Α.Φ.Μ.
 * Βασίζεται στον αλγόριθμο Modulo 11 της ΑΑΔΕ.
 */
export function isValidAFM(afm: string): boolean {
 if (!afm || !/^[0-9]{9}$/.test(afm)) return false;
 if (afm === '000000000') return false;

 let sum = 0;
 for (let i = 0; i < 8; i++) {
 sum += parseInt(afm.charAt(i)) * Math.pow(2, 8 - i);
 }
 
 const modResult = sum % 11;
 const expectedCheckDigit = modResult === 10 ? 0 : modResult;
 const actualCheckDigit = parseInt(afm.charAt(8));

 return expectedCheckDigit === actualCheckDigit;
}

/**
 * Ελέγχει την ορθότητα ενός Α.Μ.Κ.Α. (Αριθμός Μητρώου Κοινωνικής Ασφάλισης).
 * Βασίζεται στον αλγόριθμο Luhn (Mod 10).
 */
export function isValidAMKA(amka: string): boolean {
 if (!amka || !/^[0-9]{11}$/.test(amka)) return false;

 // Τα πρώτα 6 ψηφία πρέπει να είναι έγκυρη ημερομηνία (ΗΗΜΜΕΕ) - Basic check
 const day = parseInt(amka.substring(0, 2));
 const month = parseInt(amka.substring(2, 4));
 if (day < 1 || day > 31 || month < 1 || month > 12) return false;

 // Luhn Check (Mod 10)
 let sum = 0;
 for (let i = 0; i < 11; i++) {
 let digit = parseInt(amka.charAt(i));
 
 // Πολλαπλασιασμός με 2 για τις «ζυγές» θέσεις (μετρώντας από αριστερά στο AMKA)
 // Επειδή είναι 11 ψηφία περιττό μήκος, οι δείκτες 1, 3, 5 κλπ διπλασιάζονται
 if (i % 2 !== 0) {
 digit *= 2;
 if (digit > 9) digit -= 9;
 }
 sum += digit;
 }

 return sum % 10 === 0;
}
