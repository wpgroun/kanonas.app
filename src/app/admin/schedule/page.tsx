import { getServiceSchedules } from '../../actions'
import ScheduleClient from './ScheduleClient'

export default async function SchedulePage() {
  const schedules = await getServiceSchedules();
  return <ScheduleClient initialSchedules={schedules} />
}

