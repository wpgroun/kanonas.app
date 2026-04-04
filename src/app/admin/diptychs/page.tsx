import { getDiptychs, getPendingPrayerRequests } from '@/actions/diptychs'
import DiptychClient from './DiptychClient'

export default async function DiptychsPage() {
  const [diptychs, pendingRequests] = await Promise.all([
    getDiptychs(),
    getPendingPrayerRequests()
  ]);
  
  return <DiptychClient initialDiptychs={diptychs} pendingRequests={pendingRequests} />
}

