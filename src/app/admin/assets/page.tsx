import { getAssets } from '@/actions/assets'
import AssetsClient from './AssetsClient'

export const dynamic = 'force-dynamic';

export default async function AssetsPage() {
 const assets = await getAssets();
 return <AssetsClient initialAssets={assets} />
}

