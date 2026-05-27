'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/requireAuth';
import { getCurrentTempleId } from '@/actions/core';
import { generateBookingSlotsForTemple } from './connectBooking';

// Fields that only a Super Admin may read/write
const SUPER_ADMIN_ONLY_SETTINGS = ['smtpHost', 'smtpPort', 'smtpUser', 'smtpPass', 'smsToken', 'smsSenderId', 'viberToken'];

export async function getTempleSettings() {
 const session = await requireAuth();
 const templeId = await getCurrentTempleId();
 
 const temple = await prisma.temple.findUnique({
 where: { id: templeId },
 include: { metropolis: true }
 });

 if (!temple) throw new Error("Temple not found");

 // Parse JSON settings safely
 let parsedSettings: Record<string, any> = {};
 try {
 if (temple.settings) {
 parsedSettings = JSON.parse(temple.settings);
 }
 } catch (e) {
 parsedSettings = {};
 }

 // Strip sensitive gateway fields for non-super-admins
 if (!session.isSuperAdmin) {
 for (const key of SUPER_ADMIN_ONLY_SETTINGS) {
 delete parsedSettings[key];
 }
 }

 return {
 id: temple.id,
 name: temple.name,
 metropolisName: temple.metropolis?.name || '',
 slug: temple.slug || '',
 taxId: temple.taxId || '',
 phoneNumber: temple.phoneNumber || '',
 address: temple.address || '',
 city: temple.city || '',
 email: temple.email || '',
 settings: parsedSettings,
 isSuperAdmin: session.isSuperAdmin,
 };
}

export async function updateTempleSettings(data: {
 name: string;
 slug?: string;
 taxId?: string;
 phoneNumber?: string;
 address?: string;
 city?: string;
 email?: string;
 settings: any;
}) {
 const session = await requireAuth();
 const templeId = await getCurrentTempleId();

 try {
 // If slug is provided, verify it is unique to avoid Prisma unique constraint failures
 if (data.slug) {
 const existingSlug = await prisma.temple.findFirst({
 where: { slug: data.slug, id: { not: templeId } }
 });
 if (existingSlug) {
 return { success: false, error: 'Το αναγνωριστικό SEO (slug) χρησιμοποιείται ήδη.' };
 }
 }

 // Non-super-admins cannot write gateway/SMTP/SMS fields — preserve existing values
 let settingsToSave = { ...data.settings };
 if (!session.isSuperAdmin) {
 // Fetch the current stored settings and keep the super-admin-only fields intact
 const existing = await prisma.temple.findUnique({ where: { id: templeId }, select: { settings: true } });
 let existingSettings: Record<string, any> = {};
 try { existingSettings = existing?.settings ? JSON.parse(existing.settings) : {}; } catch {}
 for (const key of SUPER_ADMIN_ONLY_SETTINGS) {
 settingsToSave[key] = existingSettings[key];
 }
 }

 const updated = await prisma.temple.update({
 where: { id: templeId },
 data: {
 name: data.name,
 slug: data.slug || null,
 taxId: data.taxId,
 phoneNumber: data.phoneNumber,
 address: data.address,
 city: data.city,
 email: data.email,
 settings: JSON.stringify(settingsToSave)
 }
 });

  // If schedule is updated, regenerate booking slots
  if (data.settings?.bookingSchedule) {
    try {
      await generateBookingSlotsForTemple(templeId, data.settings.bookingSchedule);
    } catch (err) {
      console.error("Error regenerating slots during settings update:", err);
    }
  }

  await prisma.auditLog.create({
    data: {
      templeId,
      userId: session.userId,
      userEmail: session.userEmail,
      action: 'UPDATE_SETTINGS',
      detail: 'Ενημερώθηκαν οι Κεντρικές Ρυθμίσεις (Settings & Integrations) του Ναού.'
    }
  });

 return { success: true };
 } catch (e: any) {
 return { success: false, error: e.message || 'Αποτυχία ενημέρωσης ρυθμίσεων.' };
 }
}

export const saveTempleSettings = updateTempleSettings;

// ─── Gateway Test Actions (Super Admin only) ────────────────────────────────

export async function testSmtpConnection(): Promise<{ success: boolean; message: string }> {
  const session = await requireAuth();
  if (!session.isSuperAdmin) return { success: false, message: 'Δεν έχετε δικαίωμα.' };

  const templeId = await getCurrentTempleId();
  const temple = await prisma.temple.findUnique({ where: { id: templeId }, select: { settings: true, email: true } });
  let s: Record<string, any> = {};
  try { s = temple?.settings ? JSON.parse(temple.settings) : {}; } catch {}

  const host = s.smtpHost || process.env.SMTP_HOST;
  const port = parseInt(s.smtpPort || process.env.SMTP_PORT || '587');
  const user = s.smtpUser || process.env.SMTP_USER;
  const pass = s.smtpPass || process.env.SMTP_PASS;
  const toEmail = temple?.email || session.userEmail;

  if (!host || !user || !pass) {
    return { success: false, message: 'Δεν έχουν οριστεί SMTP Host, Username ή Password.' };
  }

  try {
    const { createSafeTransporter } = await import('@/lib/email');
    const transporter = await createSafeTransporter({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
    } as any);

    await transporter.verify();
    await transporter.sendMail({
      from: `"Kanonas Test" <${user}>`,
      to: toEmail,
      subject: '✅ Kanonas — Δοκιμαστικό SMTP Email',
      html: '<p>Ο διακομιστής SMTP λειτουργεί σωστά! ✅<br>Αυτό είναι ένα αυτόματο test email από το Kanonas.</p>',
    });

    return { success: true, message: `Το email στάλθηκε επιτυχώς στο ${toEmail}` };
  } catch (e: any) {
    return { success: false, message: `Σφάλμα SMTP: ${e.message}` };
  }
}

export async function testSmsConnection(testPhone: string): Promise<{ success: boolean; message: string }> {
  const session = await requireAuth();
  if (!session.isSuperAdmin) return { success: false, message: 'Δεν έχετε δικαίωμα.' };

  const templeId = await getCurrentTempleId();
  const temple = await prisma.temple.findUnique({ where: { id: templeId }, select: { settings: true } });
  let s: Record<string, any> = {};
  try { s = temple?.settings ? JSON.parse(temple.settings) : {}; } catch {}

  const apiKey = s.smsToken || process.env.YUBOTO_API_KEY;
  const rawSenderId = s.smsSenderId || process.env.YUBOTO_SENDER_ID || 'Kanonas';
  // Sender ID: max 11 alphanumeric chars
  const senderId = rawSenderId.replace(/[^A-Za-z0-9]/g, '').slice(0, 11) || 'Kanonas';

  if (!apiKey) {
    return { success: false, message: 'Δεν έχει οριστεί SMS Gateway API Key.' };
  }
  if (!testPhone) {
    return { success: false, message: 'Δεν έχετε δώσει αριθμό τηλεφώνου για το test.' };
  }

  try {
    // Normalize phone to international format
    const normalizePhone = (phone: string) => {
      let p = phone.replace(/[\s\-().+]/g, '');
      if (p.startsWith('00')) p = p.slice(2);
      if (p.startsWith('6') && p.length === 10) p = '30' + p;
      if (p.startsWith('2') && p.length === 10) p = '30' + p;
      return p;
    };
    const normalizedPhone = normalizePhone(testPhone);

    const msgText = 'Test SMS apo Kanonas. An lamvanete auto, i pyli SMS leitoyrgei!';

    // Format authorization header to Basic <base64Key>
    let authHeader = apiKey.trim();
    if (!authHeader.startsWith('Basic ')) {
      if (authHeader.includes('-')) {
        authHeader = 'Basic ' + Buffer.from(authHeader).toString('base64');
      } else {
        authHeader = 'Basic ' + authHeader;
      }
    }

    const response = await fetch('https://services.yuboto.com/omni/v1/Send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify({
        dlr: 'false',
        contacts: [
          {
            phonenumber: normalizedPhone,
          },
        ],
        sms: {
          sender: senderId,
          text: msgText,
          typesms: 'sms',
        },
      }),
      signal: AbortSignal.timeout(15000),
    });

    const text = await response.text();
    if (!response.ok) {
      return { success: false, message: `Σφάλμα Yuboto API (${response.status}): ${text}` };
    }

    let parsed: any = {};
    try { parsed = JSON.parse(text); } catch {}
    if (parsed?.ErrorCode && parsed.ErrorCode !== 0) {
      return { success: false, message: `Σφάλμα Yuboto (ErrorCode ${parsed.ErrorCode}): ${parsed.ErrorMessage || text}` };
    }

    return { success: true, message: `SMS στάλθηκε στο ${testPhone} επιτυχώς!` };
  } catch (e: any) {
    return { success: false, message: `Σφάλμα αποστολής SMS: ${e.message}` };
  }
}
