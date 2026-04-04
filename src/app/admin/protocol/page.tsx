import { getProtocols } from '@/actions/protocol'
import ProtocolClient from './ProtocolClient'

export default async function ProtocolPage() {
  const protocols = await getProtocols();
  return <ProtocolClient initialProtocols={protocols} />
}

