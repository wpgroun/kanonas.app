import { getParishioners } from '@/actions/parishioners'
import ParishionersClient from './ParishionersClient'

export default async function ParishionersList() {
  const rs = await getParishioners();
  
  return <ParishionersClient parishioners={rs} />
}
