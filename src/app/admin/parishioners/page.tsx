import { getParishioners } from '@/actions/parishioners'
import ParishionersClient from './ParishionersClient'

export const dynamic = 'force-dynamic';

export default async function ParishionersList() {
  const rs = await getParishioners();
  
  return <ParishionersClient parishioners={rs} />
}
