import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/schedule/ical/[slug]
 *
 * Returns an RFC 5545-compliant iCalendar file for a temple's service schedule.
 * Compatible with Google Calendar, Apple Calendar, Outlook.
 *
 * Subscribe URL (add to calendar app):
 * https://kanonas.app/api/schedule/ical/[temple-slug]
 */
export async function GET(
 req: Request,
 { params }: { params: Promise<{ slug: string }> }
) {
 const { slug } = await params;
 const temple = await prisma.temple.findUnique({
 where: { slug },
 select: { id: true, name: true, slug: true }
 });

 if (!temple) {
 return NextResponse.json({ error: 'Temple not found' }, { status: 404 });
 }

 const now = new Date();
 const from = new Date(now.getFullYear(), 0, 1); // Jan 1st current year
 const to = new Date(now.getFullYear() + 1, 11, 31); // Dec 31st next year

 const schedules = await prisma.serviceSchedule.findMany({
 where: {
 templeId: temple.id,
 date: { gte: from, lte: to }
 },
 orderBy: { date: 'asc' }
 });

 // ─── Build iCal ──────────────────────────────────────────────────────────────

 const lines: string[] = [
 'BEGIN:VCALENDAR',
 'VERSION:2.0',
 `PRODID:-//Kanonas SaaS//${temple.name}//EL`,
 'CALSCALE:GREGORIAN',
 'METHOD:PUBLISH',
 `X-WR-CALNAME:${temple.name} — Ωρολόγιο Λειτουργιών`,
 'X-WR-TIMEZONE:Europe/Athens',
 'X-WR-CALDESC:Πρόγραμμα Ιερών Ακολουθιών & Εορτών',
 ];

 for (const s of schedules) {
 const uid = `kanonas-${s.id}@kanonas.app`;
 const dtStamp = formatIcalDate(now);
 const dtStart = formatIcalDate(s.date);
 // Events are all-day (DATE format, not DATETIME)
 const dtStartDate = formatIcalDateOnly(s.date);
 const dtEndDate = formatIcalDateOnly(new Date(s.date.getTime() + 86400000)); // +1 day for all-day

 lines.push('BEGIN:VEVENT');
 lines.push(`UID:${uid}`);
 lines.push(`DTSTAMP:${dtStamp}`);
 lines.push(`DTSTART;VALUE=DATE:${dtStartDate}`);
 lines.push(`DTEND;VALUE=DATE:${dtEndDate}`);
 lines.push(`SUMMARY:${escapeIcal((s.isMajor ? '🕊 ' : '✝ ') + s.title)}`);
 if (s.description) {
 lines.push(`DESCRIPTION:${escapeIcal(s.description)}`);
 }
 lines.push(`CATEGORIES:${s.isMajor ? 'MAJOR FEAST' : 'SERVICE'}`);
 lines.push('END:VEVENT');
 }

 lines.push('END:VCALENDAR');

 const ical = lines.join('\r\n') + '\r\n';
 const filename = `Kanonas_${slug}_${now.getFullYear()}.ics`;

 return new NextResponse(ical, {
 headers: {
 'Content-Type': 'text/calendar; charset=utf-8',
 'Content-Disposition': `attachment; filename="${filename}"`,
 'Cache-Control': 'public, max-age=3600', // 1 hour cache
 }
 });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatIcalDate(d: Date): string {
 return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function formatIcalDateOnly(d: Date): string {
 const y = d.getFullYear();
 const m = String(d.getMonth() + 1).padStart(2, '0');
 const day = String(d.getDate()).padStart(2, '0');
 return `${y}${m}${day}`;
}

function escapeIcal(s: string): string {
 return s
 .replace(/\\/g, '\\\\')
 .replace(/;/g, '\\;')
 .replace(/,/g, '\\,')
 .replace(/\n/g, '\\n');
}
