import { getAssets } from '@/actions/assets'
import AssetsClient from './AssetsClient'

export default async function AssetsPage() {
 const assets = await getAssets();
 return <AssetsClient initialAssets={assets} />
}

