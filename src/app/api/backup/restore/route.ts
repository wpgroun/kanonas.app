import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * POST /api/backup/restore
 *
 * Restores parishioners and diptychs from a Kanonas backup JSON file.
 * Only restores data that doesn't already exist (idempotent β€” checks by ID).
 *
 * Security: Requires head priest or super admin.
 * Body: JSON from the /api/backup GET endpoint.
 */
export async function POST(req: NextRequest) {
 const session = await getSession();
 if (!session?.templeId || (!session?.isSuperAdmin && !session?.isHeadPriest)) {
 return NextResponse.json({ error: 'ΞΞ· ΞµΞΎΞΏΟ…ΟƒΞΉΞΏΞ΄ΞΏΟ„Ξ·ΞΌΞ­Ξ½Ξ· Ο€ΟΟΟƒΞ²Ξ±ΟƒΞ·.' }, { status: 401 });
 }

 let backupData: any;
 try {
 backupData = await req.json();
 } catch {
 return NextResponse.json({ error: 'ΞΞ· Ξ­Ξ³ΞΊΟ…ΟΞΏ JSON Ξ±ΟΟ‡ΞµΞ―ΞΏ.' }, { status: 400 });
 }

 // Validate backup format
 if (!backupData?.version || !backupData?.data) {
 return NextResponse.json({ error: 'Ξ†ΞΊΟ…ΟΞ· ΞΌΞΏΟΟ†Ξ® Ξ±ΟΟ‡ΞµΞ―ΞΏΟ… backup. Ξ’ΞµΞ²Ξ±ΞΉΟ‰ΞΈΞµΞ―Ο„Ξµ ΟΟ„ΞΉ Ο‡ΟΞ·ΟƒΞΉΞΌΞΏΟ€ΞΏΞΉΞµΞ―Ο„Ξµ Ξ±ΟΟ‡ΞµΞ―ΞΏ Ο€ΞΏΟ… ΞµΞΎΞ®Ο‡ΞΈΞ· Ξ±Ο€Ο Ο„ΞΏ ΞΞ±Ξ½ΟΞ½Ξ±Ο‚.' }, { status: 400 });
 }

 const templeId = session.templeId;
 const { data } = backupData;
 const results = { parishioners: 0, donations: 0, diptychs: 0, protocols: 0, skipped: 0 };

 try {
 // β”€β”€β”€ Restore Parishioners β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€
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

 // β”€β”€β”€ Restore Diptychs β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€
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

 // β”€β”€β”€ Restore Protocols β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€
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
 detail: `Ξ‘Ξ½Ξ±ΞΊΟ„Ξ®ΞΈΞ·ΞΊΞ±Ξ½: ${results.parishioners} ΞµΞ½ΞΏΟΞ―Ο„ΞµΟ‚, ${results.diptychs} Ξ΄Ξ―Ο€Ο„Ο…Ο‡Ξ±, ${results.protocols} Ο€ΟΟ‰Ο„ΟΞΊΞΏΞ»Ξ»Ξ±. Ξ Ξ±ΟΞ±Ξ»ΞµΞ―Ο†ΞΈΞ·ΞΊΞ±Ξ½: ${results.skipped}.`,
 }
 });

 return NextResponse.json({ success: true, results });
 } catch (err: any) {
 console.error('[Restore] Error:', err);
 return NextResponse.json({ error: 'Ξ£Ο†Ξ¬Ξ»ΞΌΞ± ΞΊΞ±Ο„Ξ¬ Ο„Ξ·Ξ½ Ξ±Ξ½Ξ¬ΞΊΟ„Ξ·ΟƒΞ·. Ξ•Ξ»Ξ­Ξ³ΞΎΟ„Ξµ Ο„ΞΏ Ξ±ΟΟ‡ΞµΞ―ΞΏ ΞΊΞ±ΞΉ Ο€ΟΞΏΟƒΟ€Ξ±ΞΈΞ®ΟƒΟ„Ξµ ΞΎΞ±Ξ½Ξ¬.' }, { status: 500 });
 }
}
