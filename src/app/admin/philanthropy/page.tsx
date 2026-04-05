import { getSissitioDashboard, getSissitioRecipients, getSissitioInventory, getRecipes } from '@/actions/sissitio'
import SissitioModule from './SissitioModule'
import { getTempleFeatures } from '@/lib/planFeatures'
import { getSession } from '@/lib/auth'
import UpgradeGate from '@/components/UpgradeGate'
import { Lock } from 'lucide-react'

export const metadata = {
  title: 'Φιλανθρωπία & Συσσίτιο — Κανόνας',
}

export default async function PhilanthropyDashboard() {
  const session = await getSession()
  const features = await getTempleFeatures(session?.templeId as string)

  if (!features.philanthropy) {
    return <UpgradeGate feature="philanthropy"/>
  }

  // Fetch all sissitio data in parallel
  const [dashboard, recipients, inventory, recipes] = await Promise.all([
    getSissitioDashboard(),
    getSissitioRecipients(),
    getSissitioInventory(),
    getRecipes(),
  ])

  return (
    <div className="container-fluid mt-6 animate-in fade-in duration-500">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          Φιλόπτωχο & Συσσίτιο
          <span className="bg-amber-100/50 text-amber-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 border border-amber-200/50 ml-2">
            <Lock className="w-3 h-3"/> GDPR Safe
          </span>
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Διαχείριση ωφελουμένων ενορίας, αποθήκης τροφίμων και μεριδολογίου συσσιτίου.
        </p>
      </div>

      <SissitioModule dashboard={dashboard} recipients={recipients} inventory={inventory} recipes={recipes} />
    </div>
  )
}
