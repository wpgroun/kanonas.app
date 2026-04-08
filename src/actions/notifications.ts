'use server'

import { prisma } from '@/lib/prisma'
import nodemailer from 'nodemailer'

// ═══════════════════════════════════════════════════════════════════════
// Email Template Generator
// ═══════════════════════════════════════════════════════════════════════

function buildEmailHTML(options: {
  title: string;
  greeting?: string;
  body: string;
  ctaText?: string;
  ctaUrl?: string;
  footer?: string;
}) {
  return `<!DOCTYPE html>
<html lang="el">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:#f4f4f7;">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">
    <!-- Header -->
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-flex;align-items:center;gap:8px;">
        <div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#7C3AED,#4F46E5);display:flex;align-items:center;justify-content:center;">
          <span style="color:#fff;font-weight:900;font-style:italic;font-family:Georgia,serif;font-size:1.3em;">κ</span>
        </div>
        <span style="font-size:20px;font-weight:700;color:#1a1a2e;">Κανόνας</span>
      </div>
    </div>

    <!-- Card -->
    <div style="background:#ffffff;border-radius:16px;padding:40px 32px;box-shadow:0 2px 12px rgba(0,0,0,0.06);border:1px solid #e8e8ee;">
      <h1 style="color:#1a1a2e;font-size:22px;margin:0 0 8px 0;">${options.title}</h1>
      ${options.greeting ? `<p style="color:#6b7280;font-size:14px;margin:0 0 24px 0;">${options.greeting}</p>` : ''}
      <div style="color:#374151;font-size:15px;line-height:1.7;">${options.body}</div>
      ${options.ctaText && options.ctaUrl ? `
      <div style="text-align:center;margin:32px 0 8px;">
        <a href="${options.ctaUrl}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#7C3AED,#4F46E5);color:#fff;font-weight:700;font-size:15px;text-decoration:none;border-radius:12px;box-shadow:0 4px 12px rgba(124,58,237,0.3);">
          ${options.ctaText}
        </a>
      </div>
      ` : ''}
    </div>

    <!-- Footer -->
    <div style="text-align:center;margin-top:24px;color:#9ca3af;font-size:12px;">
      ${options.footer || 'Κανόνας — Ψηφιακή Διαχείριση Ιερών Ναών'}
      <br/><span style="color:#d1d5db;">Αυτό είναι αυτοματοποιημένο μήνυμα. Μην απαντάτε.</span>
    </div>
  </div>
</body>
</html>`
}

// ═══════════════════════════════════════════════════════════════════════
// Transport — creates nodemailer transport from temple settings or env
// ═══════════════════════════════════════════════════════════════════════

async function getTransporter(templeId?: string) {
  // Try temple-specific SMTP first
  if (templeId) {
    const temple = await prisma.temple.findUnique({ where: { id: templeId } })
    const settings = (temple as any)?.settings as any
    if (settings?.smtpHost && settings?.smtpUser) {
      return nodemailer.createTransport({
        host: settings.smtpHost,
        port: parseInt(settings.smtpPort || '587'),
        secure: parseInt(settings.smtpPort || '587') === 465,
        auth: { user: settings.smtpUser, pass: settings.smtpPass || '' }
      })
    }
  }

  // Fallback to platform-level env SMTP
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: parseInt(process.env.SMTP_PORT || '587') === 465,
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
      }
    })
  }

  return null
}

// ═══════════════════════════════════════════════════════════════════════
// Public API — Send email
// ═══════════════════════════════════════════════════════════════════════

export async function sendEmail(options: {
  to: string;
  subject: string;
  title: string;
  greeting?: string;
  body: string;
  ctaText?: string;
  ctaUrl?: string;
  templeId?: string;
}) {
  try {
    const transporter = await getTransporter(options.templeId)
    if (!transporter) {
      console.warn('[Email] Δεν διαμορφώθηκε SMTP. Αποθηκεύεται μόνο στο log.')
      // Still log it even without SMTP
      await logEmail(options.templeId || '', options.to, options.subject, 'NO_SMTP')
      return { success: false, error: 'Δεν έχει ρυθμιστεί διακομιστής email.' }
    }

    const fromName = 'Κανόνας'
    const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@kanonas.app'

    const html = buildEmailHTML({
      title: options.title,
      greeting: options.greeting,
      body: options.body,
      ctaText: options.ctaText,
      ctaUrl: options.ctaUrl,
    })

    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: options.to,
      subject: options.subject,
      html,
    })

    await logEmail(options.templeId || '', options.to, options.subject, 'SENT')
    return { success: true }
  } catch (e: any) {
    console.error('[Email Error]', e.message)
    await logEmail(options.templeId || '', options.to, options.subject, 'FAILED')
    return { success: false, error: e.message }
  }
}

async function logEmail(templeId: string, to: string, subject: string, status: string) {
  try {
    if (templeId) {
      await prisma.auditLog.create({
        data: {
          templeId,
          userId: 'SYSTEM',
          userEmail: 'system@kanonas.app',
          action: `EMAIL_${status}`,
          detail: `Αποστολή email σε ${to}: "${subject}"`
        }
      })
    }
  } catch {}
}

// ═══════════════════════════════════════════════════════════════════════
// Notification Functions — Ready to use from anywhere
// ═══════════════════════════════════════════════════════════════════════

/**
 * Notify temple admins about a new sacrament request.
 */
export async function notifyNewRequest(templeId: string, requestType: string, customerName: string, ceremonyDate?: string) {
  const temple = await prisma.temple.findUnique({
    where: { id: templeId },
    include: { users: { include: { user: true } } }
  })
  if (!temple) return

  const admins = temple.users
    .filter((ut: any) => ut.role?.isHeadPriest || ut.role?.canManageRequests)
    .map((ut: any) => ut.user.email)
    .filter(Boolean)

  if (admins.length === 0) return

  const typeNames: Record<string, string> = {
    'BAPTISM': 'Βάπτιση', 'GAMOS': 'Γάμος', 'FUNERAL': 'Κηδεία', 'OTHER': 'Άλλο'
  }
  const typeName = typeNames[requestType] || requestType
  const dateStr = ceremonyDate ? new Date(ceremonyDate).toLocaleDateString('el-GR') : '—'

  for (const email of admins) {
    await sendEmail({
      to: email,
      subject: `📩 Νέο Αίτημα: ${typeName} — ${customerName}`,
      title: `Νέο Αίτημα ${typeName}`,
      greeting: `Αγαπητέ/ή,`,
      body: `
        <p>Υποβλήθηκε νέο αίτημα μυστηρίου στον Ναό <b>${temple.name}</b>.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          <tr><td style="padding:8px 0;color:#6b7280;width:140px;">Τύπος:</td><td style="padding:8px 0;font-weight:700;">${typeName}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280;">Ονοματεπώνυμο:</td><td style="padding:8px 0;font-weight:700;">${customerName}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280;">Ημερομηνία:</td><td style="padding:8px 0;font-weight:700;">${dateStr}</td></tr>
        </table>
        <p>Εισέλθετε στον πίνακα ελέγχου για να το διαχειριστείτε.</p>
      `,
      ctaText: 'Προβολή Αιτημάτων',
      ctaUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://kanonas.app'}/admin/requests`,
      templeId,
    })
  }
}

/**
 * Notify temple admin about subscription expiring soon.
 */
export async function notifySubscriptionExpiring(templeId: string, daysLeft: number) {
  const temple = await prisma.temple.findUnique({
    where: { id: templeId },
    include: { users: { include: { user: true } } }
  })
  if (!temple) return

  const admins = temple.users
    .filter((ut: any) => ut.role?.isHeadPriest)
    .map((ut: any) => ut.user.email)
    .filter(Boolean)

  const urgency = daysLeft <= 3 ? '🔴' : daysLeft <= 7 ? '🟠' : '🟡'
  const sub = (temple as any).subscriptionPlan || 'Basic'

  for (const email of admins) {
    await sendEmail({
      to: email,
      subject: `${urgency} Η συνδρομή σας λήγει σε ${daysLeft} ημέρες`,
      title: `Λήξη Συνδρομής σε ${daysLeft} ημέρες`,
      greeting: `Αγαπητέ/ή Εφημέριε,`,
      body: `
        <p>Η συνδρομή <b>${sub}</b> του Ναού <b>${temple.name}</b> λήγει σε <b style="color:#dc2626">${daysLeft} ημέρες</b>.</p>
        <p>Για να αποφύγετε τη διακοπή υπηρεσιών, παρακαλούμε ανανεώστε τη συνδρομή σας εγκαίρως.</p>
        <div style="background:#fef3c7;border:1px solid #f59e0b;border-radius:12px;padding:16px;margin:16px 0;">
          <p style="margin:0;color:#92400e;font-weight:700;font-size:13px;">⚠️ Τι συμβαίνει μετά τη λήξη;</p>
          <p style="margin:8px 0 0;color:#92400e;font-size:13px;">Ο Ναός θα παραμείνει προσβάσιμος σε λειτουργία ανάγνωσης. Δεν θα χαθούν δεδομένα.</p>
        </div>
      `,
      ctaText: 'Ανανέωση Συνδρομής',
      ctaUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://kanonas.app'}/admin/subscription`,
      templeId,
    })
  }
}

/**
 * Send a welcome email after onboarding is complete.
 */
export async function notifyWelcome(email: string, templeName: string) {
  await sendEmail({
    to: email,
    subject: 'Καλώς ήρθατε στο Κανόνας! 🕊️',
    title: 'Καλώς ήρθατε στο Κανόνας!',
    greeting: `Αγαπητέ/ή,`,
    body: `
      <p>Η εγγραφή του Ναού <b>${templeName}</b> ολοκληρώθηκε με επιτυχία!</p>
      <p>Μπορείτε τώρα να:</p>
      <ul style="padding-left:18px;margin:12px 0;">
        <li>📋 Διαχειριστείτε το <b>Μητρώο Ενοριτών</b></li>
        <li>📄 Εκδώσετε <b>Πιστοποιητικά & Έγγραφα</b></li>
        <li>💰 Παρακολουθήσετε τα <b>Οικονομικά</b></li>
        <li>📅 Οργανώσετε το <b>Πρόγραμμα Ακολουθιών</b></li>
      </ul>
      <p>Επισκεφθείτε τον πίνακα ελέγχου για να ξεκινήσετε!</p>
    `,
    ctaText: 'Είσοδος στο Κανόνας',
    ctaUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://kanonas.app'}/admin`,
  })
}

/**
 * Notify about document generation completion.
 */
export async function notifyDocumentReady(templeId: string, recipientEmail: string, docName: string) {
  await sendEmail({
    to: recipientEmail,
    subject: `✅ Το έγγραφο "${docName}" είναι έτοιμο`,
    title: 'Το Έγγραφό σας είναι Έτοιμο',
    body: `
      <p>Το έγγραφο <b>${docName}</b> δημιουργήθηκε με επιτυχία.</p>
      <p>Μπορείτε να το κατεβάσετε ή εκτυπώσετε από τον πίνακα ελέγχου.</p>
    `,
    ctaText: 'Προβολή Εγγράφου',
    ctaUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://kanonas.app'}/admin/documents`,
    templeId,
  })
}

// ═══════════════════════════════════════════════════════════════════════
// CRON: Check all temples for expiring subscriptions (call daily)
// ═══════════════════════════════════════════════════════════════════════

export async function cronCheckSubscriptionExpiry() {
  const now = new Date()
  const thresholds = [30, 14, 7, 3, 1] // days before expiry to notify

  for (const days of thresholds) {
    const target = new Date(now)
    target.setDate(target.getDate() + days)
    const dayStart = new Date(target.getFullYear(), target.getMonth(), target.getDate())
    const dayEnd = new Date(dayStart)
    dayEnd.setDate(dayEnd.getDate() + 1)

    const temples = await prisma.temple.findMany({
      where: {
        subscriptionEndDate: { gte: dayStart, lt: dayEnd },
        subscriptionStatus: 'ACTIVE'
      }
    })

    for (const temple of temples) {
      await notifySubscriptionExpiring(temple.id, days)
    }
  }

  return { checked: thresholds.length, timestamp: now.toISOString() }
}
