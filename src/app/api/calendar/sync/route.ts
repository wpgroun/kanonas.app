import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
 const { searchParams } = new URL(req.url);
 const templeId = searchParams.get('templeId');

 if (!templeId) {
 return NextResponse.json({ error: 'Missing templeId' }, { status: 400 });
 }

 const tokens = await prisma.token.findMany({
 where: { templeId, ceremonyDate: { not: null }, status: { not: 'rejected' } }
 });

 // Load temple settings to find real duration if possible
 const temple = await prisma.temple.findUnique({ where: { id: templeId }});
 const settings = temple?.settings ? JSON.parse(temple.settings) : {};
 const gamosDuration = settings.bookingSchedule?.gamosDurationMin || 45;
 const vaptisiDuration = settings.bookingSchedule?.vaptisiDurationMin || 30;

 let ics ="BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//ΞΞ±Ξ½ΟΞ½Ξ±Ο‚//GR\nCALSCALE:GREGORIAN\nMETHOD:PUBLISH\nX-WR-CALNAME:ΞΞ±Ξ½ΟΞ½Ξ±Ο‚ ΞΟ…ΟƒΟ„Ξ®ΟΞΉΞ±\n";
 
 for (const t of tokens) {
 if(!t.ceremonyDate) continue;
 
 const d = new Date(t.ceremonyDate);
 const duration = t.serviceType === 'GAMOS' ? gamosDuration : vaptisiDuration;
 const endD = new Date(d.getTime() + duration * 60000);
 
 // Format date strictly according to RFC 5545
 const formatIcsDate = (date: Date) => {
 return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
 };

 const title = t.serviceType === 'GAMOS' ? `Ξ“Ξ‘ΞΞΞ£: ${t.customerName}` : `Ξ’Ξ‘Ξ Ξ¤Ξ™Ξ£Ξ—: ${t.customerName}`;
 const desc = t.assignedPriest ? `Ξ™ΞµΟΞ­Ξ±Ο‚: ${t.assignedPriest}` : `Ξ•ΞΊΞΊΟΞµΞΌΞµΞ― Ξ±Ξ½Ξ¬ΞΈΞµΟƒΞ· ΞΉΞµΟΞ­Ξ±.`;
 
 ics +="BEGIN:VEVENT\n";
 ics += `UID:${t.id}@kanonas.gr\n`;
 ics += `DTSTAMP:${formatIcsDate(new Date())}\n`;
 ics += `DTSTART:${formatIcsDate(d)}\n`;
 ics += `DTEND:${formatIcsDate(endD)}\n`;
 ics += `SUMMARY:${title}\n`;
 ics += `DESCRIPTION:${desc}\n`;
 ics +="END:VEVENT\n";
 }
 
 ics +="END:VCALENDAR";

 return new NextResponse(ics, {
 headers: {
 'Content-Type': 'text/calendar; charset=utf-8',
 'Content-Disposition': 'attachment; filename="ΞΞ±Ξ½ΟΞ½Ξ±Ο‚-sync.ics"'
 }
 });
}


