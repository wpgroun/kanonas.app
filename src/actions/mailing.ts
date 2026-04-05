'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/requireAuth';
import { getCurrentTempleId } from '@/actions/core';
import { generateLabelsPdf } from '@/lib/pdfEngine';

export async function getMailingLists() {
  const templeId = await getCurrentTempleId();
  
  // We fetch parishioners that have an address.
  try {
     const parishioners = await prisma.parishioner.findMany({
        where: { 
           templeId,
           address: { not: null, notIn: [''] }
        },
        orderBy: { lastName: 'asc' }
     });

     return parishioners;
  } catch (e) {
     return [];
  }
}

export async function exportLabelsPdf(selectedIds: string[]) {
  const session = await requireAuth();
  const templeId = await getCurrentTempleId();

  try {
     const people = await prisma.parishioner.findMany({
        where: { id: { in: selectedIds }, templeId }
     });

     const customMapped = people.map(p => ({
        firstName: p.firstName,
        lastName: p.lastName,
        address: p.address,
        postalCode: '', // Fallback empty
        city: p.city || 'Αθήνα'
     }));

     const pdfBase64 = (await generateLabelsPdf(customMapped)).toString('base64');
     
     await prisma.auditLog.create({
         data: {
             templeId: templeId,
             userId: session.userId,
             userEmail: session.userEmail,
             action: 'ΕΚΤΥΠΩΣΗ_ΕΤΙΚΕΤΩΝ',
             detail: `Εκτυπώθηκαν ${selectedIds.length} ταχυδρομικές ετικέτες.`
         }
     });

     return { success: true, pdfBase64 };
  } catch (e) {
     return { success: false, error: 'Σφάλμα παραγωγής PDF.' };
  }
}
