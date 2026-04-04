import { getDiptychs } from '@/actions/diptychs'
import DiptychClient from './DiptychClient'

export default async function DiptychsPage() {
  const diptychs = await getDiptychs();
  
  return <DiptychClient initialDiptychs={diptychs} />
}

