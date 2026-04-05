import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

/**
 * POST /api/backup/restore
 *
 * Restores parishioners and diptychs from a Kanonas backup JSON file.
 * Only restores data that doesn't already exist (idempotent — checks by ID).
 *
 * Security: Requires head priest or super admin.
 * Body: JSON from the /api/backup GET endpoint.
 */
export async function POST(req: NextRequest) {
 const session = await getSession();
 if (!session?.templeId || (!session?.isSuperAdmin && !session?.isHeadPriest)) {
 return NextResponse.json({ error: 'Μη εξουσιοδοτημένη πρόσβαση.' }, { status: 401 });
 }

 let backupData: any;
 try {
 backupData = await req.json();
 } catch {
 return NextResponse.json({ error: 'Μη έγκυρο JSON αρχείο.' }, { status: 400 });
 }

 // Validate backup format
 if (!backupData?.version || !backupData?.data) {
 return NextResponse.json({ error: 'Άκυρη μορφή αρχείου backup. Βεβαιωθείτε ότι χρησιμοποιείτε αρχείο που εξήχθη από το Κανόνας.' }, { status: 400 });
 }

 const templeId = session.templeId;
 const { data } = backupData;
 const results = { parishioners: 0, donations: 0, diptychs: 0, protocols: 0, skipped: 0 };

 try {
 // ─── Restore Parishioners ──────────────────────────────────────────────
 if (Array.isArray(data.parishioners)) {
 for (const p of data.parishioners) {
 const exists = await prisma.parishioner.findUnique({ where: { id: p.id } });
 if (exists) { results.skipped++; continue; }
 await prisma.parishioner.create({
 data: { ...p, templeId, createdAt: new Date(p.createdAt), updatedAt: new Date() }
 }).catch(() => results.skipped++);
 results.parishioners++;
 }
 }

 // ─── Restore Diptychs ──────────────────────────────────────────────────
 if (Array.isArray(data.diptychs)) {
 for (const d of data.diptychs) {
 const exists = await prisma.diptych.findUnique({ where: { id: d.id } });
 if (exists) { results.skipped++; continue; }
 await prisma.diptych.create({
 data: { ...d, templeId, createdAt: new Date(d.createdAt), updatedAt: new Date() }
 }).catch(() => results.skipped++);
 results.diptychs++;
 }
 }

 // ─── Restore Protocols ────────────────────────────────────────────────
 if (Array.isArray(data.protocols)) {
 for (const pr of data.protocols) {
 const exists = await prisma.protocol.findUnique({ where: { id: pr.id } });
 if (exists) { results.skipped++; continue; }
 await prisma.protocol.create({
 data: { ...pr, templeId, createdAt: new Date(pr.createdAt), updatedAt: new Date() }
 }).catch(() => results.skipped++);
 results.protocols++;
 }
 }

 // Audit log
 await prisma.auditLog.create({
 data: {
 templeId,
 userId: session.userId as string,
 userEmail: (session as any).userEmail ?? null,
 action: 'RECOVER_BACKUP',
 detail: `Ανακτήθηκαν: ${results.parishioners} ενορίτες, ${results.diptychs} δίπτυχα, ${results.protocols} πρωτόκολλα. Παραλείφθηκαν: ${results.skipped}.`,
 }
 });

 return NextResponse.json({ success: true, results });
 } catch (err: any) {
 console.error('[Restore] Error:', err);
 return NextResponse.json({ error: 'Σφάλμα κατά την ανάκτηση. Ελέγξτε το αρχείο και προσπαθήστε ξανά.' }, { status: 500 });
 }
}
