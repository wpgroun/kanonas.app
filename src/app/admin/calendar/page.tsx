import { getAggregatedCalendarEvents } from '@/actions/calendar';
import CalendarClient from './CalendarClient';
import PageHeader from '@/components/PageHeader';

export default async function CalendarPage() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const result = await getAggregatedCalendarEvents(year, month);
  const events = result.success ? (result.data ?? []) : [];

  return (
    <div className="container-fluid mt-6 space-y-6">
      <PageHeader
        title="Ημερολόγιο"
        description="Συγκεντρωτικό ημερολόγιο ακολουθιών, τελετών, γεγονότων και δράσεων της ενορίας."
      />
      <CalendarClient initialEvents={events} initialYear={year} initialMonth={month} />
    </div>
  );
}
