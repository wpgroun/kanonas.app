/**
 * Κανόνας Email Service
 * Wraps nodemailer with Greek-language email templates.
 */
import nodemailer from 'nodemailer';

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
  });
}

const FROM_NAME = process.env.SMTP_FROM_NAME || 'Κανόνας – Γραμματεία Ναού';
const FROM_EMAIL = process.env.SMTP_USER || 'no-reply@kanonas.gr';

// ─── Templates ────────────────────────────────────────────────────────────────

function htmlWrapper(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="el">
<head><meta charset="UTF-8"><title>${title}</title>
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
  .container { max-width: 600px; margin: 32px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
  .header { background: linear-gradient(135deg, #1e3a5f, #2d6a8f); padding: 32px 32px 24px; color: #fff; }
  .header h1 { margin: 0; font-size: 22px; font-weight: 700; }
  .header p { margin: 8px 0 0; opacity: 0.8; font-size: 14px; }
  .body { padding: 32px; color: #333; line-height: 1.7; font-size: 15px; }
  .cta { display: inline-block; margin: 20px 0; padding: 14px 28px; background: #1e3a5f; color: #fff !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; }
  .info-box { background: #f0f5ff; border-left: 4px solid #1e3a5f; padding: 16px; border-radius: 4px; margin: 16px 0; }
  .footer { background: #f8f8f8; padding: 16px 32px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #eee; }
  .cross { font-size: 28px; margin-bottom: 8px; display: block; }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <span class="cross">✝</span>
    <h1>${title}</h1>
    <p>Αυτοματοποιημένο μήνυμα από το σύστημα Κανόνας</p>
  </div>
  <div class="body">${body}</div>
  <div class="footer">© Κανόνας – Ψηφιακή Γραμματεία Ναού • Σε περίπτωση λάθους, αγνοήστε αυτό το email.</div>
</div>
</body></html>`;
}

// ─── Exported functions ───────────────────────────────────────────────────────

/** Send the questionnaire link to a family */
export async function sendFormLinkEmail(opts: {
  to: string;
  familyName: string;
  serviceType: 'GAMOS' | 'VAPTISI';
  tokenUrl: string;
  ceremonyDate?: string;
  templeName?: string;
}): Promise<void> {
  const label = opts.serviceType === 'GAMOS' ? 'Γάμου' : 'Βάπτισης';
  const dateText = opts.ceremonyDate || '(ημερομηνία θα οριστεί)';

  const body = `
    <p>Αγαπητή <strong>Οικογένεια ${opts.familyName}</strong>,</p>
    <p>Η Γραμματεία του Ιερού Ναού σας αποστέλλει τον ακόλουθο σύνδεσμο για τη δήλωση στοιχείων της <strong>Ιερής Τελετής ${label}</strong>:</p>
    <div class="info-box">
      📅 <strong>Ημερομηνία Τελετής:</strong> ${dateText}
    </div>
    <p>Παρακαλούμε να συμπληρώσετε όλα τα απαραίτητα στοιχεία μέσω του παρακάτω συνδέσμου:</p>
    <a href="${opts.tokenUrl}" class="cta">📝 Συμπλήρωση Στοιχείων</a>
    <p style="font-size: 13px; color: #666;">Αν το κουμπί δεν λειτουργεί, αντιγράψτε τον σύνδεσμο: <code>${opts.tokenUrl}</code></p>
    <p>Για οποιαδήποτε απορία, επικοινωνήστε με τη Γραμματεία του Ναού.</p>
    <p>Με εκτίμηση,<br><strong>${opts.templeName || 'Ιερός Ναός'}</strong></p>
  `;

  const transporter = getTransporter();
  await transporter.sendMail({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to: opts.to,
    subject: `✝ Δήλωση Στοιχείων ${label} — ${opts.templeName || 'Ιερός Ναός'}`,
    html: htmlWrapper(`Δήλωση Στοιχείων ${label}`, body),
  });
}

/** Ceremony reminder — 3 days before */
export async function sendCeremonyReminderEmail(opts: {
  to: string;
  familyName: string;
  serviceType: 'GAMOS' | 'VAPTISI';
  ceremonyDate: string;
  templeName?: string;
}): Promise<void> {
  const label = opts.serviceType === 'GAMOS' ? 'Γάμου' : 'Βάπτισης';

  const body = `
    <p>Αγαπητή <strong>Οικογένεια ${opts.familyName}</strong>,</p>
    <p>Σας υπενθυμίζουμε ότι η <strong>Ιερή Τελετή ${label}</strong> σας έχει προγραμματιστεί για:</p>
    <div class="info-box" style="font-size: 18px; text-align: center;">
      📅 <strong>${opts.ceremonyDate}</strong>
    </div>
    <p>Παρακαλούμε να βεβαιωθείτε ότι όλα τα απαραίτητα έγγραφα έχουν προσκομιστεί στη Γραμματεία του Ναού.</p>
    <p>Με εκτίμηση,<br><strong>${opts.templeName || 'Ιερός Ναός'}</strong></p>
  `;

  const transporter = getTransporter();
  await transporter.sendMail({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to: opts.to,
    subject: `✝ Υπενθύμιση: ${label} σε 3 ημέρες — ${opts.templeName || 'Ιερός Ναός'}`,
    html: htmlWrapper(`Υπενθύμιση Τελετής ${label}`, body),
  });
}

/** Confirmation email after protocol is issued */
export async function sendProtocolIssuedEmail(opts: {
  to: string;
  familyName: string;
  serviceType: 'GAMOS' | 'VAPTISI';
  protocolNumber: string;
  templeName?: string;
}): Promise<void> {
  const label = opts.serviceType === 'GAMOS' ? 'Γάμου' : 'Βάπτισης';

  const body = `
    <p>Αγαπητή <strong>Οικογένεια ${opts.familyName}</strong>,</p>
    <p>Σας γνωρίζουμε ότι εκδόθηκε το πρωτόκολλο για την Ιερή Τελετή ${label} σας:</p>
    <div class="info-box">
      📋 <strong>Αριθμός Πρωτοκόλλου:</strong> ${opts.protocolNumber}
    </div>
    <p>Τα έγγραφά σας είναι έτοιμα. Αν απαιτείται η παραλαβή τους, επικοινωνήστε με τη Γραμματεία.</p>
    <p>Με εκτίμηση,<br><strong>${opts.templeName || 'Ιερός Ναός'}</strong></p>
  `;

  const transporter = getTransporter();
  await transporter.sendMail({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to: opts.to,
    subject: `✝ Πρωτόκολλο ${label} Εκδόθηκε — Αρ. ${opts.protocolNumber}`,
    html: htmlWrapper(`Έκδοση Πρωτοκόλλου ${label}`, body),
  });
}

/** Test email — called from settings page */
export async function sendTestEmail(to: string): Promise<void> {
  const transporter = getTransporter();
  await transporter.sendMail({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to,
    subject: '✝ Κανόνας — Δοκιμαστικό Email',
    html: htmlWrapper('Δοκιμαστικό Email', '<p>Αυτό είναι ένα δοκιμαστικό email από το Κανόνας. Αν το λάβατε, οι ρυθμίσεις SMTP είναι σωστές! ✅</p>'),
  });
}

/** Bulk email to a list of parishioners — called from the mailing action.
 *  Supports template variables: {{firstName}}, {{lastName}}, {{fullName}} */
export async function sendBulkParishionerEmail(
  recipients: Array<{ firstName: string; lastName: string; email: string }>,
  subject: string,
  bodyHtml: string
): Promise<void> {
  const transporter = getTransporter();
  // Send sequentially to respect SMTP rate limits
  for (const recipient of recipients) {
    const personalizedBody = bodyHtml
      .replace(/\{\{firstName\}\}/g, recipient.firstName)
      .replace(/\{\{lastName\}\}/g, recipient.lastName)
      .replace(/\{\{fullName\}\}/g, `${recipient.firstName} ${recipient.lastName}`)

    await transporter.sendMail({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: recipient.email,
      subject,
      html: htmlWrapper(subject, personalizedBody),
    });
  }
}


