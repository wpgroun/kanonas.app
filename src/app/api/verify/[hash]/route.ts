import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Public document verification endpoint.
 * QR codes embedded in generated PDFs point here.
 * GET /api/verify/[hash]
 */
export async function GET(
 _req: NextRequest,
 { params }: { params: Promise<{ hash: string }> }
) {
 const { hash } = await params;

 if (!hash || hash.length < 16) {
 return NextResponse.json({ valid: false, error: 'Μη έγκυρος κωδικός επαλήθευσης' }, { status: 400 });
 }

 try {
 const token = await prisma.token.findUnique({
 where: { tokenStr: hash },
 select: {
 id: true,
 serviceType: true,
 customerName: true,
 ceremonyDate: true,
 status: true,
 assignedPriest: true,
 temple: { select: { name: true, city: true } },
 },
 });

 if (!token) {
 return NextResponse.json({ valid: false, error: 'Το έγγραφο δεν βρέθηκε στο σύστημα' }, { status: 404 });
 }

 return NextResponse.json({
 valid: true,
 document: {
 serviceType: token.serviceType,
 customerName: token.customerName,
 ceremonyDate: token.ceremonyDate?.toLocaleDateString('el-GR') ?? null,
 status: token.status,
 assignedPriest: token.assignedPriest,
 templeName: token.temple.name,
 templeCity: token.temple.city,
 verifiedAt: new Date().toISOString(),
 },
 });
 } catch (error) {
 console.error('[Verify] Error:', error);
 return NextResponse.json({ valid: false, error: 'Σφάλμα επαλήθευσης' }, { status: 500 });
 }
}
