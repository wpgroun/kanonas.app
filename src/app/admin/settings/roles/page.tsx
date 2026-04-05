import { prisma } from '@/lib/prisma';
import RolesClient from './RolesClient';

export default async function RolesPage() {
 const templeId ="cm0testtempleid0000000001";
 
 // Fetch existing roles
 const roles = await prisma.role.findMany({
 where: { templeId },
 });

 // Fetch users assigned to this temple
 const users = await prisma.userTemple.findMany({
 where: { templeId },
 include: {
 user: { select: { id: true, email: true, firstName: true, lastName: true } },
 role: true
 }
 });

 return (
 <div className="container-fluid mt-6 max-w-6xl">
 <div className="mb-6">
 <h1 className="text-2xl font-bold">Διαχείριση Χρηστών & Ρόλων</h1>
 <p className="text-muted-foreground">Προσκαλέστε συνεργάτες και ορίστε δικαιώματα πρόσβασης για ενορίτες κληρικούς/νεωκόρους.</p>
 </div>
 <RolesClient templeId={templeId} initialRoles={roles} initialUsers={users} />
 </div>
);
}

