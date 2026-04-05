import { getBloodDonors } from '@/actions/bloodbank'
import BloodBankClient from './BloodBankClient'
import { getTempleFeatures } from '@/lib/planFeatures'
import { getSession } from '@/lib/auth'
import UpgradeGate from '@/components/UpgradeGate'

export const metadata = {
 title: 'Τράπεζα Αίματος | Kanonas',
}

export default async function BloodBankPage() {
 const session = await getSession()
 const features = await getTempleFeatures(session?.templeId as string)

 if (!features.bloodbank) {
 return <UpgradeGate feature="bloodbank"/>
 }

 const donors = await getBloodDonors()

 return (
 <div className="max-w-7xl mx-auto space-y-6">
 <div>
 <h1 className="text-2xl font-bold text-[var(--foreground)] flex items-center gap-2">
 🩸 Ενοριακή Τράπεζα Αίματος
 </h1>
 <p className="text-sm text-[var(--text-muted)]">
 Καταγραφή εθελοντών αιμοδοτών και ιστορικό προσφοράς για περιπτώσεις έκτακτης ανάγκης.
 </p>
 </div>
 <BloodBankClient initialDonors={donors} />
 </div>
)
}
