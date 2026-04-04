'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth, getCurrentTempleId } from '@/lib/session';
import { revalidatePath } from 'next/cache';

// Fetch Storage Items
export async function getInventory() {
  const templeId = await getCurrentTempleId();
  try {
     const data = await prisma.inventoryItem.findMany({
       where: { templeId },
       orderBy: { name: 'asc' }
     });
     return { success: true, data };
  } catch(e) {
     return { success: false, error: 'Σφάλμα ανάκτησης αποθήκης.' };
  }
}

// Add New Item to DB
export async function addInventoryItem(formData: any) {
  const session = await requireAuth();
  const templeId = await getCurrentTempleId();

  try {
     const created = await prisma.inventoryItem.create({
       data: {
         templeId,
         name: formData.name,
         category: formData.category,
         unitOfMeasure: formData.unitOfMeasure,
         minThreshold: Number(formData.minThreshold) || 10,
         currentStock: Number(formData.currentStock) || 0
       }
     });

     await prisma.auditLog.create({
       data: {
          templeId, userId: session.userId, userEmail: session.userId, 
          action: 'ΔΗΜΙΟΥΡΓΙΑ_ΕΙΔΟΥΣ', 
          details: `Νέο είδος: ${formData.name} προστέθηκε στην αποθήκη.`
       }
     });

     revalidatePath('/admin/philanthropy/inventory');
     return { success: true, data: created };
  } catch(e) {
     return { success: false, error: 'Τεχνικό Σφάλμα Αποθήκης' };
  }
}

// Adjust Stock (εισαγωγή / ανάλωση)
export async function adjustStock(itemId: string, diff: number, reason: string) {
  const session = await requireAuth();
  const templeId = await getCurrentTempleId();

  if(!session.isSuperAdmin && !session.isHeadPriest) {
    // Ideally some warehouse worker role here
  }

  try {
     const updated = await prisma.$transaction(async (tx) => {
        const item = await tx.inventoryItem.findUnique({ where: { id: itemId }});
        if(!item) throw new Error("Δεν βρέθηκε υλικό");

        const newStock = item.currentStock + diff;
        if(newStock < 0) throw new Error("Η ποσότητα δεν επαρκεί στην αποθήκη.");

        await tx.inventoryCheckout.create({
          data: {
             inventoryItemId: item.id,
             quantity: diff,
             reason: reason
          }
        });

        return tx.inventoryItem.update({
           where: { id: itemId },
           data: { currentStock: newStock }
        });
     });

     revalidatePath('/admin/philanthropy/inventory');
     return { success: true, newStock: updated.currentStock };
  } catch(e: any) {
     return { success: false, error: e.message || 'Αποτυχία ενημέρωσης αποθέματος.' };
  }
}
