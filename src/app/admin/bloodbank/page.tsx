import { getBloodBankDashboard, getBloodDonors, getBloodDrives } from '@/actions/bloodbank'
import BloodBankModule from './BloodBankModule'
import { getTempleFeatures } from '@/lib/planFeatures'
import { getSession } from '@/lib/auth'
import UpgradeGate from '@/components/UpgradeGate'
import { Droplet } from 'lucide-react'

export const metadata = {
  title: 'Αιμοδοσία — Κανόνας',
}

export default async function BloodBankPage() {
  const session = await getSession()
  const features = await getTempleFeatures(session?.templeId as string)

  if (!features.philanthropy) {
    return <UpgradeGate feature="philanthropy"/>
  }

  const [dashboard, donors, drives] = await Promise.all([
    getBloodBankDashboard(),
    getBloodDonors(),
    getBloodDrives(),
  ])

  return (
    <div className="container-fluid mt-6 animate-in fade-in duration-500">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Droplet className="w-6 h-6 text-red-500"/>
          Τράπεζα Αίματος
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Οργάνωση αιμοδοσιών, μητρώο δοτών, κανόνες επιλεξιμότητας και διαχείριση εκστρατειών.
        </p>
      </div>

      <BloodBankModule dashboard={dashboard} donors={donors} drives={drives} />
    </div>
  )
}
