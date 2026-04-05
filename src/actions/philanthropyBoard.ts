'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentTempleId } from '@/actions/core';
import { requirePermission } from '@/lib/requireAuth';

export async function getPhiloptochosMembers() {
 await requirePermission(['canViewBeneficiaries', 'isSuperAdmin']);
 const templeId = await getCurrentTempleId();

 return await prisma.philoptochosMember.findMany({
 where: { templeId },
 orderBy: { startDate: 'desc' }
 });
}

export async function createPhiloptochosMember(data: { firstName: string; lastName: string; role: string; startDate: string; endDate?: string }) {
 await requirePermission(['canViewBeneficiaries', 'isSuperAdmin']);
 const templeId = await getCurrentTempleId();

 if (!templeId) throw new Error("No temple session");

 return await prisma.philoptochosMember.create({
 data: {
 templeId,
 firstName: data.firstName,
 lastName: data.lastName,
 role: data.role,
 startDate: new Date(data.startDate),
 endDate: data.endDate ? new Date(data.endDate) : null
 }
 });
}

export async function deletePhiloptochosMember(id: string) {
 await requirePermission(['canViewBeneficiaries', 'isSuperAdmin']);
 const templeId = await getCurrentTempleId();

 if (!templeId) throw new Error("No temple session");
 
 // Verify ownership
 const member = await prisma.philoptochosMember.findUnique({ where: { id } });
 if (!member || member.templeId !== templeId) throw new Error("Δεν βρέθηκε ή δεν ανήκει στον Ναό σας");

 return await prisma.philoptochosMember.delete({ where: { id } });
}
