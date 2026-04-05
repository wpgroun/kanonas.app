import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(req: Request) {
 const session = await getSession();
 // [SECURITY] Fixed operator precedence — parentheses required for correct OR/AND evaluation.
 // Without them: (!templeId || !isSuperAdmin) && !isHeadPriest — incorrect.
 // With them: (!templeId || (!isSuperAdmin && !isHeadPriest)) — correct.
 if (!session?.templeId || (!session?.isSuperAdmin && !session?.isHeadPriest)) {
 return NextResponse.json({ error: 'Μη εξουσιοδοτημένη πρόσβαση - Απαιτούνται δικαιώματα διαχειριστή.' }, { status: 401 });
 }

 try {
 const templeId = session.templeId;
 
 // Fetch all contextual data related to the Temple
 const [temple, parishioners, donations, expenses, diptychs, protocols, logs] = await Promise.all([
 prisma.temple.findUnique({ where: { id: templeId } }),
 prisma.parishioner.findMany({ where: { templeId } }),
 prisma.donation.findMany({ where: { templeId } }),
 prisma.expense.findMany({ where: { templeId } }),
 prisma.diptych.findMany({ where: { templeId } }),
 prisma.protocol.findMany({ where: { templeId } }),
 prisma.auditLog.findMany({ where: { templeId } }),
 ]);

 const backupData = {
 version:"1.0",
 app:"Kanonas SaaS",
 exportDate: new Date().toISOString(),
 metadata: { totalParishioners: parishioners.length, totalDonations: donations.length },
 data: {
 temple,
 parishioners,
 donations,
 expenses,
 diptychs,
 protocols,
 auditLogs: logs
 }
 };

 return new NextResponse(JSON.stringify(backupData, null, 2), {
 status: 200,
 headers: {
 'Content-Type': 'application/json; charset=utf-8',
 'Content-Disposition': `attachment; filename="Kanonas_Cloud_Backup_${new Date().toISOString().split('T')[0]}.json"`
 }
 });

 } catch (err: any) {
 console.error("Backup Generation Error:", err);
 return NextResponse.json({ error: 'Σφάλμα κατά την παραγωγή του Backup.' }, { status: 500 });
 }
}
