import { requireAuth } from '@/lib/requireAuth'
import { getPhiloptochosMembers } from '@/actions/philanthropyBoard'
import BoardClient from './BoardClient'

export const metadata = {
 title: 'Συμβούλιο Φιλοπτώχου | Kanonas',
}

export default async function PhiloptochosBoardPage() {
 await requireAuth()
 const members = await getPhiloptochosMembers()

 return (
 <div className="space-y-6">
 <div>
 <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
 🛡️ Διοικητικό Συμβούλιο Φιλοπτώχου
 </h1>
 <p className="text-slate-500 mt-1 text-sm">
 Διαχειριστείτε την Πρόεδρο, τον Ταμία, τα Μέλη και καταγράψτε την περίοδο θητείας του ενοριακού Ε.Φ.Τ.
 </p>
 </div>

 <BoardClient initialMembers={members} />
 </div>
)
}
