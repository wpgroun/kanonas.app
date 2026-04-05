import { getPhilanthropyStats, getBeneficiaries, getInventoryItems } from '@/actions/philanthropy'
import PhilanthropyClient from './PhilanthropyClient'
import { getTempleFeatures } from '@/lib/planFeatures'
import { getSession } from '@/lib/auth'
import UpgradeGate from '@/components/UpgradeGate'

export const metadata = {
 title: 'Φιλανθρωπία — Κανόνας',
}

export default async function PhilanthropyDashboard() {
 const session = await getSession()
 const features = await getTempleFeatures(session?.templeId as string)

 if (!features.philanthropy) {
 return <UpgradeGate feature="philanthropy"/>
 }

 const stats = await getPhilanthropyStats()
 const beneficiariesRes = await getBeneficiaries()
 const beneficiaries = beneficiariesRes.success ? beneficiariesRes.data : []
 const inventory = await getInventoryItems()

 return <PhilanthropyClient stats={stats} beneficiaries={beneficiaries} inventory={inventory} />
}
