import { getSissitioDashboard, getSissitioRecipients, getSissitioInventory, getRecipes } from '@/actions/sissitio'
import { getTempleFeatures } from '@/lib/planFeatures'
import { getSession } from '@/lib/auth'
import UpgradeGate from '@/components/UpgradeGate'
import { Lock } from 'lucide-react'
import PhilanthropyTabs from './PhilanthropyTabs'
import { Suspense } from 'react'

export const metadata = {
  title: 'Φιλόπτωχο — Κανόνας',
}

export default async function PhilanthropyDashboard() {
  const session = await getSession()
  const features = await getTempleFeatures(session?.templeId as string)

  if (!features.philanthropy) {
    return <UpgradeGate feature="philanthropy"/>
  }

  // Fetch all data in parallel
  const [dashboard, recipients, inventory, recipes] = await Promise.all([
    getSissitioDashboard(),
    getSissitioRecipients(),
    getSissitioInventory(),
    getRecipes(),
  ])

  const sissitioData = { dashboard, recipients, inventory, recipes }
  
  // For philanthropy we reuse some of the same data for now, 
  // but calculate specific stats if needed
  const philanthropyData = {
     stats: { 
       activeBeneficiaries: dashboard?.totalActive || 0,
       portions30Days: 0,
       cost30Days: 0,
       monthGrowth: '0%'
     },
     beneficiaries: recipients,
     inventory: inventory
  }

  return (
    <div className="container-fluid mt-6 animate-in fade-in duration-500">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          Φιλόπτωχο
          <span className="bg-amber-100/50 text-amber-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 border border-amber-200/50 ml-2">
            <Lock className="w-3 h-3"/> GDPR Safe
          </span>
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Κέντρο Φιλανθρωπικής Δράσης της Ενορίας
        </p>
      </div>

      <Suspense fallback={<div>Φόρτωση δεδομένων...</div>}>
        <PhilanthropyTabs sissitioData={sissitioData} philanthropyData={philanthropyData} />
      </Suspense>
    </div>
  )
}
