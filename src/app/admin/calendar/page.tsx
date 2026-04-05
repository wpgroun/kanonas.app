import { getCentralEvents } from '@/actions/calendar';
import CalendarClient from './CalendarClient';
import PageHeader from '@/components/PageHeader';

export default async function CalendarPage() {
 const eventsResult = await getCentralEvents();
 const events = eventsResult.success ? eventsResult.data : [];

 return (
 <div className="container-fluid mt-6 space-y-6">
 <PageHeader 
 title="Κεντρικό Ημερολόγιο (Events)"
 description="Πολυεπίπεδο ημερολόγιο δράσεων Еνορίας και Ιεράς Μητρόπολης."
 />
 <CalendarClient initialEvents={events || []} />
 </div>
);
}
