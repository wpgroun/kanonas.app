import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendCeremonyReminderEmail } from '@/lib/emailService';
import { sendSMS } from '@/lib/sms';

/**
 * Cron endpoint — called daily by Railway/Vercel scheduler.
 * Finds tokens with ceremony dates in the next 3 days and sends reminder emails.
 *
 * Security: protected by CRON_SECRET header.
 * Railway config: set CRON_SECRET env var and schedule daily at 08:00.
 */
export async function GET(req: NextRequest) {
 // Validate the cron secret to prevent unauthorized triggering
 const authHeader = req.headers.get('authorization');
 const cronSecret = process.env.CRON_SECRET;
 if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
 return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 }

 const now = new Date();
 const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
 const fourDaysFromNow = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000);

 try {
 // Find tokens whose ceremony is in ~3 days AND haven't been completed yet
 const upcomingTokens = await prisma.token.findMany({
 where: {
 ceremonyDate: {
 gte: threeDaysFromNow,
 lt: fourDaysFromNow,
 },
 status: { not: 'completed' },
 customerEmail: { not: null },
 },
 include: {
 temple: { select: { name: true, settings: true } },
 },
 });

 const results: { id: string; status: 'sent' | 'skipped' | 'error'; reason?: string }[] = [];

 for (const token of upcomingTokens) {
 if (!token.customerEmail || !token.ceremonyDate) {
 results.push({ id: token.id, status: 'skipped', reason: 'No email or date' });
 continue;
 }

 try {
  await sendCeremonyReminderEmail({
    to: token.customerEmail,
    familyName: token.customerName || 'Αγαπητή Οικογένεια',
    serviceType: token.serviceType as 'GAMOS' | 'VAPTISI',
    ceremonyDate: token.ceremonyDate.toLocaleDateString('el-GR'),
    templeName: token.temple.name,
  });

  // Example SMS call passing the temple's smsSenderId
  let templeSettings: any = {};
  if (token.temple.settings) {
    try {
      templeSettings = JSON.parse(token.temple.settings);
    } catch (e) {}
  }
  
  // If the token or customer had a phone number, we would send it like this:
  // await sendSMS([customerPhone], `Υπενθύμιση...`, { smsSenderId: templeSettings.smsSenderId });

  results.push({ id: token.id, status: 'sent' });
 } catch (emailError) {
 console.error(`[Cron] Failed to send reminder for token ${token.id}:`, emailError);
 results.push({ id: token.id, status: 'error', reason: String(emailError) });
 }
 }

 console.log(`[Cron /api/cron/reminders] Processed ${upcomingTokens.length} tokens:`, results);

 return NextResponse.json({
 ok: true,
 processed: upcomingTokens.length,
 results,
 timestamp: now.toISOString(),
 });
 } catch (error) {
 console.error('[Cron] Fatal error in reminders cron:', error);
 return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
 }
}
