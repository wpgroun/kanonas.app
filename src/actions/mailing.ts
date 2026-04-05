'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/requireAuth';
import { getCurrentTempleId } from '@/actions/core';
import { generateLabelsPdf } from '@/lib/pdfEngine';

// ─── Bulk Email ─────────────────────────────────────────────────────────────────

export type BulkEmailResult =
  | { success: true; sent: number }
  | { success: false; error: string; smtpHint?: boolean }

/**
 * Send bulk email to selected parishioners.
 *
 * TODO (future): When SMTP is configured, send via nodemailer in batches of 50.
 * Currently shows a setup hint if SMTP env vars are not set.
 */
export async function sendBulkEmail(
  selectedIds: string[],
  subject: string,
  body: string
): Promise<BulkEmailResult> {
  const session = await requireAuth()
  const templeId = await getCurrentTempleId()

  if (!subject.trim() || !body.trim()) {
    return { success: false, error: 'Θέμα και κείμενο email είναι υποχρεωτικά.' }
  }
  if (selectedIds.length === 0) {
    return { success: false, error: 'Επιλέξτε τουλάχιστον έναν παραλήπτη.' }
  }

  // [FEATURE-FLAG] Check SMTP configuration
  const smtpConfigured = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)
  if (!smtpConfigured) {
    return {
      success: false,
      smtpHint: true,
      error: 'Ο SMTP server δεν έχει ρυθμιστεί. Προσθέστε τα SMTP_HOST, SMTP_USER, SMTP_PASS στις μεταβλητές περιβάλλοντος του Railway για να ενεργοποιήσετε την αποστολή email.',
    }
  }

  try {
    // Fetch parishioners with email
    const people = await prisma.parishioner.findMany({
      where: { id: { in: selectedIds }, templeId, email: { not: null } },
      select: { id: true, firstName: true, lastName: true, email: true }
    })

    const withEmail = people.filter(p => !!p.email)
    if (withEmail.length === 0) {
      return { success: false, error: 'Κανένας από τους επιλεγμένους ενορίτες δεν έχει καταχωρημένο email.' }
    }

    // Send via nodemailer
    const { sendBulkParishionerEmail } = await import('@/lib/emailService')
    await sendBulkParishionerEmail(withEmail as any[], subject, body)

    // Audit log
    await prisma.auditLog.create({
      data: {
        templeId, userId: session.userId, userEmail: session.userEmail,
        action: 'ΜΑΖΙΚΟ_EMAIL',
        detail: `Εστάλησαν ${withEmail.length} emails με θέμα: "${subject}".`
      }
    })

    return { success: true, sent: withEmail.length }
  } catch (e: any) {
    console.error('[sendBulkEmail] Error:', e)
    return { success: false, error: 'Αποτυχία αποστολής email. Ελέγξτε τις ρυθμίσεις SMTP.' }
  }
}


export async function getMailingLists() {
  const templeId = await getCurrentTempleId();
  
  // We fetch parishioners that have an address.
  try {
     const parishioners = await prisma.parishioner.findMany({
        where: { 
           templeId,
           address: { not: null, notIn: [''] }
        },
        orderBy: { lastName: 'asc' }
     });

     return parishioners;
  } catch (e) {
     return [];
  }
}

export async function exportLabelsPdf(selectedIds: string[]) {
  const session = await requireAuth();
  const templeId = await getCurrentTempleId();

  try {
     const people = await prisma.parishioner.findMany({
        where: { id: { in: selectedIds }, templeId }
     });

     const customMapped = people.map(p => ({
        firstName: p.firstName,
        lastName: p.lastName,
        address: p.address,
        postalCode: '', // Fallback empty
        city: p.city || 'Αθήνα'
     }));

     const pdfBase64 = (await generateLabelsPdf(customMapped)).toString('base64');
     
     await prisma.auditLog.create({
         data: {
             templeId: templeId,
             userId: session.userId,
             userEmail: session.userEmail,
             action: 'ΕΚΤΥΠΩΣΗ_ΕΤΙΚΕΤΩΝ',
             detail: `Εκτυπώθηκαν ${selectedIds.length} ταχυδρομικές ετικέτες.`
         }
     });

     return { success: true, pdfBase64 };
  } catch (e) {
     return { success: false, error: 'Σφάλμα παραγωγής PDF.' };
  }
}
