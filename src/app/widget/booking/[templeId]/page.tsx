import { prisma } from '@/lib/prisma';
import BookingWidgetClient from './BookingWidgetClient';

// Get booked tokens to disable slots
async function getBookedSlots(templeId: string) {
 const tokens = await prisma.token.findMany({
 where: { templeId, status: { not: 'rejected' } }, 
 select: { ceremonyDate: true, serviceType: true }
 });
 
 return tokens
 .filter(t => t.ceremonyDate)
 .map(t => {
 const d = new Date(t.ceremonyDate!);
 return {
 isoDate: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`,
 type: t.serviceType
 };
 });
}

export default async function BookingWidgetPage({ params }: { params: Promise<{ templeId: string }> | { templeId: string } }) {
 // Await params to get templeId
 const resolvedParams = await params;
 const templeId = resolvedParams.templeId;

 // Retrieve settings
 const temple = await prisma.temple.findUnique({ where: { id: templeId } });
 
 if (!temple) {
 return <div className="p-8 text-center text-muted-foreground font-medium">Το ημερολόγιο του ναού δεν βρέθηκε.</div>;
 }

 const settings = temple.settings ? JSON.parse(temple.settings) : {};
 const schedule = settings.bookingSchedule || {
 disabledDaysOfWeek: [1, 3], 
 timeSlots: ['17:00', '18:00', '19:00', '20:00']
 };

 const bookedSlots = await getBookedSlots(templeId);

 return (
 <div style={{ maxWidth: '600px', margin: '0 auto' }}>
 <BookingWidgetClient 
 templeId={templeId} 
 templeName={temple.name}
 schedule={schedule}
 bookedSlots={bookedSlots} 
 />
 </div>
);
}
