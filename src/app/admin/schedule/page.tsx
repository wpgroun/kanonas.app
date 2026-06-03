import { getServiceSchedules } from '@/actions/schedule'
import ScheduleClient from './ScheduleClient'

export const dynamic = 'force-dynamic';

export default async function SchedulePage() {
 const schedules = await getServiceSchedules();
 return <ScheduleClient initialSchedules={schedules} />
}

