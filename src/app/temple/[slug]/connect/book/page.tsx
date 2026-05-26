import BookingWizard from './BookingWizard';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { generateBookingSlotsForTemple } from '@/actions/connectBooking';

export const metadata = { title: 'Κράτηση Μυστηρίου | Kanonas Connect' };

export default async function BookingPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;

  let temple = await prisma.temple.findUnique({
    where: { slug: slug },
    include: {
      bookingSlots: {
        where: { isBooked: false, startTime: { gte: new Date() } },
        orderBy: { startTime: 'asc' }
      }
    }
  });

  if (!temple) {
    temple = await prisma.temple.findUnique({
      where: { id: slug },
      include: {
        bookingSlots: {
          where: { isBooked: false, startTime: { gte: new Date() } },
          orderBy: { startTime: 'asc' }
        }
      }
    });
  }

  if (!temple) notFound();

  // If there are no future booking slots, generate them on the fly
  if (temple.bookingSlots.length === 0) {
    let schedule = null;
    try {
      if (temple.settings) {
        const parsed = JSON.parse(temple.settings);
        schedule = parsed.bookingSchedule;
      }
    } catch (e) {
      console.error("Failed to parse temple settings:", e);
    }
    
    await generateBookingSlotsForTemple(temple.id, schedule);
    
    // Reload temple with the new slots
    const updatedTemple = await prisma.temple.findUnique({
      where: { id: temple.id },
      include: {
        bookingSlots: {
          where: { isBooked: false, startTime: { gte: new Date() } },
          orderBy: { startTime: 'asc' }
        }
      }
    });
    if (updatedTemple) {
      temple = updatedTemple;
    }
  }

  // Group slots by date for easy parsing in the calendar UI
  const availableSlots = temple.bookingSlots.map(s => ({
    id: s.id,
    serviceType: s.serviceType,
    startTime: s.startTime.toISOString(),
    endTime: s.endTime?.toISOString() || null
  }));

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-gray-900">Προγραμματισμός Μυστηρίου</h1>
        <p className="text-gray-500 mt-2">Επιλέξτε ημερομηνία και ώρα από τη διαθεσιμότητα του Ι.Ν. {temple.name}</p>
      </div>
      
      <BookingWizard templeId={temple.id} availableSlots={availableSlots} />
    </div>
  );
}
