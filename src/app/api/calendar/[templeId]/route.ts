import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as ics from 'ics';

export async function GET(
 req: Request,
 { params }: { params: Promise<{ templeId: string }> }
) {
 try {
 const { templeId } = await params;

 // 1. Fetch Schedule
 const schedules = await prisma.serviceSchedule.findMany({
 where: { templeId },
 orderBy: { date: 'asc' }
 });

 // 2. Fetch Sacraments
 const sacraments = await prisma.sacrament.findMany({
 where: { templeId },
 include: { parishioner: true }
 });

 // 3. Construct ICS Events
 const events: ics.EventAttributes[] = [];

 // Map Schedules
 schedules.forEach((schedule: any) => {
 const date = new Date(schedule.date);
 events.push({
 start: [date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes()],
 duration: { hours: 2 }, // Approximate
 title: `Εκκλησιαστική Ακολουθία: ${schedule.title}`,
 description: schedule.description || '',
 status: 'CONFIRMED',
 busyStatus: 'BUSY',
 });
 });

 // Map Sacraments
 sacraments.forEach(sacrament => {
 if (!sacrament.sacramentDate) return;
 
 const date = new Date(sacrament.sacramentDate);
 events.push({
 start: [date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes()],
 duration: { hours: 1 }, 
 title: `${sacrament.sacramentType.toUpperCase()} - Οικ. ${sacrament.parishioner.lastName}`,
 description: `${sacrament.sacramentType} για τον/την ${sacrament.parishioner.firstName} ${sacrament.parishioner.lastName}.\nΣημειώσεις: ${sacrament.notes || ''}`,
 status: 'CONFIRMED',
 busyStatus: 'BUSY',
 });
 });

 // Generate Calendar
 const { error, value } = ics.createEvents(events);

 if (error) {
 console.error(error);
 return new NextResponse('Error generating calendar', { status: 500 });
 }

 // Return as downloadable webcal feed
 return new NextResponse(value, {
 status: 200,
 headers: {
 'Content-Type': 'text/calendar; charset=utf-8',
 'Content-Disposition': 'attachment; filename="church_calendar.ics"',
 },
 });

 } catch (error: any) {
 console.error('Calendar error:', error);
 return new NextResponse('Internal Server Error', { status: 500 });
 }
}
