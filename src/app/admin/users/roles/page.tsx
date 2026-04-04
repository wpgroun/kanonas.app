import { getTempleRoles } from '@/actions/roles'
import RolesClient from './RolesClient'

export default async function RolesPage() {
  const roles = await getTempleRoles();
  
  return (
    <div className="container-fluid mt-6 space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          Διαχείριση Ρόλων Πρόσβασης
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Δημιουργήστε προσαρμοσμένα πακέτα εξουσιοδοτήσεων για το Προσωπικό και τους Εθελοντές του Ναού.
        </p>
      </div>

      <RolesClient initialRoles={roles} />
    </div>
  )
}
