import { z } from 'zod';

export function calculateMarriageClass(groomPrev: number, bridePrev: number): 'A' | 'B' | 'C' {
  const maxPrev = Math.max(groomPrev, bridePrev);
  if (maxPrev === 0) return 'A';
  if (maxPrev === 1) return 'B';
  return 'C';
}

// ==========================================
// ZOD VALIDATION SCHEMAS (GREEK ERRORS)
// ==========================================

export const MarriageDetailsSchema = z.object({
  groomFirstName: z.string({ error: 'Το όνομα του γαμπρού είναι υποχρεωτικό.' }).min(1, 'Το όνομα του γαμπρού είναι υποχρεωτικό.'),
  groomLastName: z.string({ error: 'Το επώνυμο του γαμπρού είναι υποχρεωτικό.' }).min(1, 'Το επώνυμο του γαμπρού είναι υποχρεωτικό.'),
  groomFathersName: z.string().optional(),
  groomMothersName: z.string().optional(),
  groomPreviousMarriages: z.number({ error: 'Οι προηγούμενοι γάμοι του γαμπρού είναι υποχρεωτικοί.' }).min(0, 'Οι προηγούμενοι γάμοι δεν μπορούν να είναι αρνητικοί.'),
  groomIsWidowed: z.boolean().optional().default(false),

  brideFirstName: z.string({ error: 'Το όνομα της νύφης είναι υποχρεωτικό.' }).min(1, 'Το όνομα της νύφης είναι υποχρεωτικό.'),
  brideLastName: z.string({ error: 'Το επώνυμο της νύφης είναι υποχρεωτικό.' }).min(1, 'Το επώνυμο της νύφης είναι υποχρεωτικό.'),
  brideFathersName: z.string().optional(),
  brideMothersName: z.string().optional(),
  bridePreviousMarriages: z.number({ error: 'Οι προηγούμενοι γάμοι της νύφης είναι υποχρεωτικοί.' }).min(0, 'Οι προηγούμενοι γάμοι δεν μπορούν να είναι αρνητικοί.'),
  brideIsWidowed: z.boolean().optional().default(false),

  koumbarosFirstName: z.string().optional(),
  koumbarosLastName: z.string().optional(),
});

export const BaptismDetailsSchema = z.object({
  baptizedFirstName: z.string().optional(),
  baptizedLastName: z.string().optional(),
  baptizedDateOfBirth: z.string().optional(),

  fatherFirstName: z.string().optional(),
  fatherLastName: z.string().optional(),
  motherFirstName: z.string().optional(),
  motherLastName: z.string().optional(),
  motherMaidenName: z.string().optional(),

  sponsorFirstName: z.string().optional(),
  sponsorLastName: z.string().optional(),
  sponsorIsOrthodox: z.boolean().optional().default(true),
});

export const FuneralDetailsSchema = z.object({
  deceasedFirstName: z.string({ error: 'Το όνομα του αποθανόντος είναι υποχρεωτικό.' }).min(1, 'Το όνομα του αποθανόντος είναι υποχρεωτικό.'),
  deceasedLastName: z.string({ error: 'Το επώνυμο του αποθανόντος είναι υποχρεωτικό.' }).min(1, 'Το επώνυμο του αποθανόντος είναι υποχρεωτικό.'),
  deceasedDateOfDeath: z.string({ error: 'Η ημερομηνία θανάτου είναι υποχρεωτική.' }).min(1, 'Η ημερομηνία θανάτου είναι υποχρεωτική.'),
  deceasedAge: z.number().optional(),

  relativeFirstName: z.string({ error: 'Το όνομα του συγγενή είναι υποχρεωτικό.' }).min(1, 'Το όνομα του συγγενή είναι υποχρεωτικό.'),
  relativeLastName: z.string({ error: 'Το επώνυμο του συγγενή είναι υποχρεωτικό.' }).min(1, 'Το επώνυμο του συγγενή είναι υποχρεωτικό.'),
  relativeRelationship: z.string({ error: 'Η σχέση συγγένειας είναι υποχρεωτική.' }).min(1, 'Η σχέση συγγένειας είναι υποχρεωτική.'),
});

export const CeremonyCreateSchema = z.object({
  type: z.enum(['MARRIAGE', 'BAPTISM', 'FUNERAL'], {
    error: 'Ο τύπος τελέτης πρέπει να είναι Γάμος, Βάπτιση ή Κηδεία.',
  }),
  subtype: z.string({ error: 'Ο υποτύπος τελέτης είναι υποχρεωτικός.' }),
  date: z.string({ error: 'Η ημερομηνία είναι υποχρεωτική.' }).transform((val) => new Date(val)),
  priest: z.string().optional().nullable(),
  details: z.any(), // Will be parsed specifically below
});

export const CeremonyUpdateSchema = z.object({
  date: z.string({ error: 'Η ημερομηνία είναι υποχρεωτική.' }).transform((val) => new Date(val)),
  priest: z.string().optional().nullable(),
  status: z.enum(['PENDING', 'COMPLETED', 'CANCELLED'], {
    error: 'Μη έγκυρη κατάσταση τελέτης.',
  }),
  details: z.any(),
});

export const DocumentStatusUpdateSchema = z.object({
  status: z.enum(['PENDING', 'RECEIVED', 'NOT_REQUIRED'], {
    error: 'Μη έγκυρη κατάσταση εγγράφου.',
  }),
  rejectionReason: z.string().optional().nullable(),
}).refine(data => {
  if (data.status === 'NOT_REQUIRED' && (!data.rejectionReason || data.rejectionReason.trim() === '')) {
    return false;
  }
  return true;
}, {
  message: 'Η αιτιολογία είναι υποχρεωτική όταν το έγγραφο σημειώνεται ως "Δεν απαιτείται".',
  path: ['rejectionReason'],
});

// ==========================================
// DOCUMENT CHECKLIST LOGIC
// ==========================================

export function getRequiredDocuments(
  type: 'MARRIAGE' | 'BAPTISM' | 'FUNERAL',
  subtype: string,
  details: any
): string[] {
  const docs: string[] = [];

  if (type === 'MARRIAGE') {
    // Α' Τάξη (Standard for groom and bride)
    docs.push(
      'Πιστοποιητικό Βαπτίσεως Γαμπρού',
      'Πιστοποιητικό Βαπτίσεως Νύφης',
      'Φωτοαντίγραφο Ταυτότητας Γαμπρού',
      'Φωτοαντίγραφο Ταυτότητας Νύφης',
      'Ληξιαρχική Πράξη Γέννησης Γαμπρού',
      'Ληξιαρχική Πράξη Γέννησης Νύφης',
      'Πιστοποιητικό Οικογενειακής Κατάστασης Γαμπρού',
      'Πιστοποιητικό Οικογενειακής Κατάστασης Νύφης',
      'Πιστοποιητικό Ελευθερίας Γαμπρού',
      'Πιστοποιητικό Ελευθερίας Νύφης',
      'Αίτηση Τέλεσης Γάμου',
      'Άδεια Γάμου Μητρόπολης'
    );

    const groomPrev = Number(details?.groomPreviousMarriages || 0);
    const bridePrev = Number(details?.bridePreviousMarriages || 0);

    // Β' & Γ' Τάξη - Extra documents for Groom
    if (groomPrev > 0) {
      for (let i = 1; i <= groomPrev; i++) {
        if (details?.groomIsWidowed) {
          docs.push(`Ληξιαρχική Πράξη Θανάτου Συζύγου Γαμπρού (Γάμος #${i})`);
        } else {
          docs.push(
            `Εκκλησιαστικό Διαζύγιο Γαμπρού (Γάμος #${i})`,
            `Πολιτικό Διαζύγιο Γαμπρού (Γάμος #${i})`,
            `Ληξιαρχική Πράξη Λύσης Γάμου Γαμπρού (Γάμος #${i})`
          );
        }
        docs.push(`Άδεια Β' Γάμου Μητρόπολης (Γαμπρός - Γάμος #${i})`);
      }
    }

    // Β' & Γ' Τάξη - Extra documents for Bride
    if (bridePrev > 0) {
      for (let i = 1; i <= bridePrev; i++) {
        if (details?.brideIsWidowed) {
          docs.push(`Ληξιαρχική Πράξη Θανάτου Συζύγου Νύφης (Γάμος #${i})`);
        } else {
          docs.push(
            `Εκκλησιαστικό Διαζύγιο Νύφης (Γάμος #${i})`,
            `Πολιτικό Διαζύγιο Νύφης (Γάμος #${i})`,
            `Ληξιαρχική Πράξη Λύσης Γάμου Νύφης (Γάμος #${i})`
          );
        }
        docs.push(`Άδεια Β' Γάμου Μητρόπολης (Νύφη - Γάμος #${i})`);
      }
    }

    // Γ' Τάξη Extra
    const marriageClass = calculateMarriageClass(groomPrev, bridePrev);
    if (marriageClass === 'C') {
      docs.push('Ειδική Επισκοπική Άδεια');
    }
  } else if (type === 'BAPTISM') {
    if (subtype === 'INFANT') {
      docs.push(
        'Ληξιαρχική Πράξη Γέννησης Βρέφους',
        'Ταυτότητες Γονέων',
        'Ταυτότητα Αναδόχου',
        'Πιστοποιητικό Βαπτίσεως Αναδόχου',
        'Υπεύθυνη Δήλωση Αναδόχου (Ορθόδοξος)',
        'Αίτηση Βάπτισης'
      );
    } else if (subtype === 'ADULT') {
      docs.push(
        'Ληξιαρχική Πράξη Γέννησης Βρέφους',
        'Ταυτότητες Γονέων',
        'Ταυτότητα Αναδόχου',
        'Πιστοποιητικό Βαπτίσεως Αναδόχου',
        'Υπεύθυνη Δήλωση Αναδόχου (Ορθόδοξος)',
        'Αίτηση Βάπτισης',
        'Ταυτότητα Βαπτιζόμενου',
        'Πιστοποιητικό Κατήχησης',
        'Άδεια Μητρόπολης'
      );
    } else if (subtype === 'CHRISMATION') {
      docs.push(
        'Πιστοποιητικό Βαπτίσης από Άλλο Δόγμα (μεταφρασμένο)',
        'Αίτηση Προσέλευσης στην Ορθοδοξία',
        'Άδεια Μητρόπολης',
        'Δήλωση Αποκήρυξης Προηγούμενου Δόγματος',
        'Ταυτότητα'
      );
    }
  } else if (type === 'FUNERAL') {
    docs.push(
      'Ληξιαρχική Πράξη Θανάτου',
      'Ταυτότητα Αποθανόντος',
      'Άδεια Ταφής (από Δήμο)',
      'Ταυτότητα Πλησιέστερου Συγγενή'
    );
  }

  return docs;
}
