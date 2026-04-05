import BookingWizard from './BookingWizard';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

export const metadata = { title: 'Κράτηση Μυστηρίου | Kanonas Connect' };

export default async function BookingPage({ params }: { params: { slug: string } }) {
  const temple = await prisma.temple.findUnique({
    where: { slug: params.slug },
    include: {
      bookingSlots: {
        where: { isBooked: false, startTime: { gte: new Date() } },
        orderBy: { startTime: 'asc' }
      }
    }
  });

  if (!temple) notFound();

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
