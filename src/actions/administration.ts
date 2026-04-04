'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth, getCurrentTempleId } from '@/lib/session';
import { revalidatePath } from 'next/cache';

// Fetch users with their UserTemple details
export async function getStaff() {
  const templeId = await getCurrentTempleId();
  try {
     const data = await prisma.userTemple.findMany({
       where: { templeId },
       include: {
         user: true,
         role: true
       }
     });
     return { success: true, data };
  } catch(e) {
     return { success: false, error: 'Σφάλμα ανάκτησης προσωπικού.' };
  }
}

// Update priest ordinations or staff details
export async function updateStaffDetails(userTempleId: string, payload: any) {
  const session = await requireAuth();
  
  try {
     const updated = await prisma.userTemple.update({
       where: { id: userTempleId },
       data: {
          ordinationDiaconate: payload.ordinationDiaconate ? new Date(payload.ordinationDiaconate) : null,
          ordinationPriesthood: payload.ordinationPriesthood ? new Date(payload.ordinationPriesthood) : null,
          offikia: payload.offikia,
          hireDate: payload.hireDate ? new Date(payload.hireDate) : null,
       }
     });

     revalidatePath('/admin/administration/staff');
     return { success: true, data: updated };
  } catch(e) {
     return { success: false, error: 'Τεχνικό Σφάλμα Αποθήκευσης' };
  }
}

// Get Philoptochos Board
export async function getPhiloptochosBoard() {
  const templeId = await getCurrentTempleId();
  try {
     const data = await prisma.philoptochosMember.findMany({
       where: { templeId },
       orderBy: { startDate: 'desc' }
     });
     return { success: true, data };
  } catch(e) {
     return { success: false, error: 'Σφάλμα ανάκτησης συμβουλίου.' };
  }
}
