import { prisma } from '@/lib/prisma';
import AssignmentsClient from './AssignmentsClient';

export default async function AssignmentsPage() {
 const templeId ="cm0testtempleid0000000001"; // Default dev templeId

 // 1. Fetch Tokens for the calendar
 const tokens = await prisma.token.findMany({
 where: { 
 templeId, 
 status: { not: 'rejected' } 
 },
 include: {
 persons: true
 },
 orderBy: { ceremonyDate: 'asc' }
 });

 // 2. Fetch available Staff (Priests/Users) for the assignment dropdown
 const staff = await prisma.userTemple.findMany({
 where: { templeId },
 include: {
 user: { select: { id: true, firstName: true, lastName: true, email: true } },
 role: true
 }
 });

 return (
 <div className="container-fluid mt-6">
 <AssignmentsClient 
 initialTokens={tokens} 
 staffMembers={staff} 
 />
 </div>
);
}

