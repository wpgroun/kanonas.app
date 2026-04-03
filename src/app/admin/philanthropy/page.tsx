import { getPhilanthropyStats, getBeneficiaries, getInventoryItems } from '../../actions'
import PhilanthropyClient from './PhilanthropyClient'

export default async function PhilanthropyDashboard() {
  const stats = await getPhilanthropyStats();
  const beneficiaries = await getBeneficiaries();
  const inventory = await getInventoryItems();

  return <PhilanthropyClient stats={stats} beneficiaries={beneficiaries} inventory={inventory} />
}
