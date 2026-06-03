import { getYouthPrograms, getParticipants } from '@/actions/youth'
import { getCamps, getCampStats } from '@/actions/camps'
import YouthClient from './YouthClient'
import CampModule from './CampModule'
import { getTempleFeatures } from '@/lib/planFeatures'
import { getSession } from '@/lib/auth'
import UpgradeGate from '@/components/UpgradeGate'

export const metadata = {
  title: 'Νεολαία & Κατασκηνώσεις - Kanonas'
}

export default async function YouthPage() {
  const session = await getSession()
  const features = await getTempleFeatures(session?.templeId as string)

  if (!features.youth) {
    return <UpgradeGate feature="youth"/>
  }

  const [programs, participants, camps] = await Promise.all([
    getYouthPrograms(),
    getParticipants(),
    getCamps(),
  ]);

  // Build stats for each camp
  const statsMap: Record<string, any> = {};
  for (const camp of camps) {
    statsMap[camp.id] = await getCampStats(camp.id);
  }

  return (
    <div className="container-fluid mt-6 animate-in fade-in duration-500">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          Νεολαία &amp; Κατασκηνώσεις
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Διαχείριση περιόδων κατασκήνωσης, κατηχητικού και μητρώο νέων.
        </p>
      </div>

      {/* Camp Management Module */}
      <div className="mb-10">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-foreground">
          🏕️ Κατασκήνωση
        </h2>
        <CampModule camps={camps as any} stats={statsMap} />
      </div>

      {/* Youth Registry (existing) */}
      <div className="border-t border-border pt-8">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-foreground">
          👶 Κατηχητικό & Νεολαία
        </h2>
        <YouthClient
          initialPrograms={programs}
          initialParticipants={participants}
        />
      </div>
    </div>
  )
}
