'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { requireAuth } from '@/lib/auth'
import { getCurrentTempleId } from './core'
import bcrypt from 'bcryptjs'

export async function getTempleUsers() {
  await requireAuth();
  const templeId = await getCurrentTempleId();
  try {
    return await prisma.userTemple.findMany({
      where: { templeId },
      include: {
        user: true,
        role: true
      },
      orderBy: { createdAt: 'desc' }
    });
  } catch(e) {
    return [];
  }
}

export async function addStaffToTemple(data: { email: string, firstName: string, lastName: string, roleId: string, initialPassword?: string }) {
  const session = await requireAuth();
  if(!session.isHeadPriest && !session.isSuperAdmin) return { success: false, error: 'Μη εξουσιοδοτημένη ενέργεια. Μόνο ο Προϊστάμενος.' };
  
  const templeId = await getCurrentTempleId();
  const cleanEmail = data.email.toLowerCase().trim();

  try {
     // 1. Find if user exists globally
     let user = await prisma.user.findUnique({ where: { email: cleanEmail }});
     
     if (!user) {
        // User does not exist in the whole system. Create them.
        if (!data.initialPassword || data.initialPassword.length < 6) {
          return { success: false, error: 'Aπαιτείται έγκυρος κωδικός πρόσβασης (τουλάχιστον 6 χαρακτήρων) για νέους λογαριασμούς.' };
        }
        const passwordHash = await bcrypt.hash(data.initialPassword, 10);
        user = await prisma.user.create({
          data: {
             email: cleanEmail,
             passwordHash,
             firstName: data.firstName,
             lastName: data.lastName
          }
        });
     }

     // 2. Check if already assigned to this temple
     const existingAssign = await prisma.userTemple.findUnique({
        where: { userId_templeId: { userId: user.id, templeId } }
     });

     if (existingAssign) {
        return { success: false, error: 'Ο χρήστης (με αυτό το email) εργάζεται ήδη στον Ναό σας!' };
     }

     // 3. Create Assignment
     await prisma.userTemple.create({
        data: {
           userId: user.id,
           templeId,
           roleId: data.roleId || null,
           isHeadPriest: false // Never head priest from UI automatically
        }
     });

     revalidatePath('/admin/users');
     return { success: true };
  } catch(e: any) {
     console.error(e);
     return { success: false, error: 'Σφάλμα ανάθεσης υπαλλήλου' };
  }
}

export async function removeStaffFromTemple(userTempleId: string) {
  const session = await requireAuth();
  if(!session.isHeadPriest && !session.isSuperAdmin) return { success: false, error: 'Μη Εξουσιοδοτημένη ενέργεια.' };

  try {
     const templeId = await getCurrentTempleId()
     const ut = await prisma.userTemple.findUnique({ where: { id: userTempleId } });
     if (!ut || ut.isHeadPriest) {
       return { success: false, error: 'Δεν μπορείτε να αφαιρέσετε τον εαυτό σας ή τον Προϊστάμενο του Ναού.' }
     }
     
     if (ut.templeId !== templeId) {
       return { success: false, error: 'Ο χρήστης δε βρέθηκε στον Ναό σας!' }
     }
     
     await prisma.userTemple.delete({ where: { id: userTempleId } });
     revalidatePath('/admin/users');
     return { success: true };
  } catch (e) {
     return { success: false, error: 'Σφάλμα διαγραφής.' };
  }
}

export async function updateStaffRole(userTempleId: string, roleId: string) {
  const session = await requireAuth();
  if(!session.isHeadPriest && !session.isSuperAdmin) return { success: false, error: 'Μη Εξουσιοδοτημένη ενέργεια.' };

  try {
     const templeId = await getCurrentTempleId()
     const ut = await prisma.userTemple.findUnique({ where: { id: userTempleId } });
     if (!ut || ut.templeId !== templeId) {
       return { success: false, error: 'Μη Εξουσιοδοτημένη ενέργεια.' }
     }

     await prisma.userTemple.update({
        where: { id: userTempleId },
        data: { roleId }
     });
     revalidatePath('/admin/users');
     return { success: true };
  } catch (e) {
     return { success: false, error: 'Σφάλμα.' };
  }
}
