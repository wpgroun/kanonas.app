'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/requireAuth';
import { getCurrentTempleId } from '@/actions/core';
import { revalidatePath } from 'next/cache';

// Φορτώνει όλους τους Ωφελούμενους
export async function getBeneficiaries() {
  const templeId = await getCurrentTempleId();
  try {
     const data = await prisma.beneficiary.findMany({
       where: { templeId },
       orderBy: { createdAt: 'desc' },
       include: {
         parishioner: { select: { id: true, firstName: true, lastName: true } }
       }
     });
     return { success: true, data };
  } catch(e) {
     return { success: false, error: 'Σφάλμα ανάκτησης ωφελουμένων.' };
  }
}

// Δημιουργεί νέο ωφελούμενο
export async function addBeneficiary(formData: any) {
  const session = await requireAuth();
  const templeId = await getCurrentTempleId();

  try {
     const created = await prisma.beneficiary.create({
       data: {
         templeId,
         firstName: formData.firstName,
         lastName: formData.lastName,
         phone: formData.phoneNumber,
         address: formData.address,
         familyMembers: Number(formData.familyMembers) || 1,
         criteriaScore: Number(formData.needsScore) || 50,
         status: 'PENDING'
       }
     });

     await prisma.auditLog.create({
       data: {
          templeId, userId: session.userId, userEmail: session.userEmail, 
          action: 'ΠΡΟΣΘΗΚΗ_ΩΦΕΛΟΥΜΕΝΟΥ', 
          detail: `Ο/Η ${formData.firstName} ${formData.lastName} προστέθηκε στο μητρώο απόρου.`
       }
     });

     revalidatePath('/admin/philanthropy/beneficiaries');
     return { success: true, data: created };
  } catch(e) {
     return { success: false, error: 'Τεχνικό Σφάλμα Δημιουργίας' };
  }
}

// Αλλαγή κατάστασης (Έγκριση / Απόρριψη / Παύση)
export async function updateBeneficiaryStatus(id: string, status: string) {
  const session = await requireAuth();
  const templeId = await getCurrentTempleId();

  if(!session.isSuperAdmin && !session.isHeadPriest) {
     return { success: false, error: 'Μόνο ο προϊστάμενος μπορεί να εγκρίνει.' };
  }

  try {
     const ben = await prisma.beneficiary.update({
       where: { id, templeId },
       data: { status }
     });

     await prisma.auditLog.create({
       data: {
          templeId, userId: session.userId, userEmail: session.userEmail, 
          action: 'ΚΑΤΑΣΤΑΣΗ_ΩΦΕΛΟΥΜΕΝΟΥ', 
          detail: `Η κατάσταση του ${ben.firstName} ${ben.lastName} άλλαξε σε ${status}`
       }
     });

     revalidatePath('/admin/philanthropy/beneficiaries');
     return { success: true };
  } catch(e) {
     return { success: false, error: 'Δεν ενημερώθηκε η κατάσταση.' };
  }
}

export async function getInventoryItems(): Promise<any[]> { return []; }
export async function getParishionerBeneficiary(id: string): Promise<any> { return null; }
export async function getPhilanthropyStats(): Promise<any> { return { total: 0 }; }
export async function createBeneficiary(data: any): Promise<any> { 
  const templeId = await getCurrentTempleId();
  try {
     const created = await prisma.beneficiary.create({
       data: {
         templeId,
         firstName: data.firstName,
         lastName: data.lastName,
         phone: data.phone,
         address: data.address,
         familyMembers: Number(data.portions) || 1,
         criteriaScore: 50,
         status: 'APPROVED',
         parishionerId: data.parishionerId
       }
     });
     return { success: true, data: created };
  } catch(e: any) {
     return { success: false, error: e.message || 'Σφάλμα εγγραφής' };
  }
}
