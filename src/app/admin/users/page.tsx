import { getTempleUsers } from '@/actions/users'
import { getTempleRoles } from '@/actions/roles'
import UsersClient from './UsersClient'

export default async function UsersPage() {
 const staff = await getTempleUsers();
 const roles = await getTempleRoles();
 
 return (
 <div className="container-fluid mt-6 space-y-6 animate-in fade-in duration-500">
 <div>
 <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
 Προσωπικό & Εθελοντές
 </h1>
 <p className="text-muted-foreground mt-1 text-sm">
 Διαχειριστείτε τους ανθρώπους που έχουν πρόσβαση στο σύστημα του Ναού σας.
 </p>
 </div>

 <UsersClient initialStaff={staff} roles={roles} />
 </div>
)
}
