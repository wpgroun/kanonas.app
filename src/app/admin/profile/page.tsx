import { getMyProfile } from '@/actions/users'
import { requireAuth } from '@/lib/requireAuth'
import ProfileClient from './ProfileClient'
import { UserCircle } from 'lucide-react'

export const metadata = {
  title: 'Ο Λογαριασμός Μου - Kanonas'
}

export default async function ProfilePage() {
  await requireAuth()
  const user = await getMyProfile()

  if (!user) return <div>Χρήστης δεν βρέθηκε</div>

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2 text-[var(--foreground)]">
          <UserCircle className="w-6 h-6 text-[var(--brand)]" /> Ο Λογαριασμός Μου
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">Επεξεργαστείτε τα προσωπικά σας στοιχεία και αλλάξτε τον κωδικό πρόσβασής σας.</p>
      </div>

      <ProfileClient 
        user={{ 
          firstName: user.firstName, 
          lastName: user.lastName, 
          email: user.email 
        }} 
      />
    </div>
  )
}
