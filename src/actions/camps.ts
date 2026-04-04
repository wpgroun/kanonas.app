'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth, getCurrentTempleId } from '@/lib/session';
import { revalidatePath } from 'next/cache';

// Fetch all camps and their children
export async function getCamps() {
  const templeId = await getCurrentTempleId();
  try {
     return await prisma.parishCamp.findMany({
        where: { templeId },
        include: {
           registrations: {
             include: { parishioner: true }
           }
        },
        orderBy: { year: 'desc' }
     });
  } catch (e) {
     return [];
  }
}

// Add a new camping season / period
export async function addCamp(formData: any) {
  const session = await requireAuth();
  const templeId = await getCurrentTempleId();
  try {
     await prisma.parishCamp.create({
        data: {
           templeId,
           name: formData.name,
           year: parseInt(formData.year),
           startDate: new Date(formData.startDate),
           endDate: new Date(formData.endDate),
           location: formData.location || null
        }
     });

     await prisma.auditLog.create({
        data: {
           templeId, userId: session.userId, userEmail: session.userId,
           action: 'ΔΗΜΙΟΥΡΓΙΑ_ΚΑΤΑΣΚΗΝΩΣΗΣ',
           details: `Νέα περίοδος κατασκηνώσεων: ${formData.name} (${formData.year})`
        }
     });

     revalidatePath('/admin/registry/camps');
     return { success: true };
  } catch (e) {
     return { success: false, error: 'Σφάλμα δημιουργίας κατασκήνωσης.' };
  }
}

// Register a child (from parishioner table) or standalone
export async function registerToCamp(campId: string, payload: any) {
  const session = await requireAuth();
  try {
     // If child is not in CRM, create Parishioner record first
     let childId = payload.parishionerId;
     if (!childId) {
        const templeId = await getCurrentTempleId();
        const newChild = await prisma.parishioner.create({
           data: {
              templeId,
              firstName: payload.firstName,
              lastName: payload.lastName,
              fathersName: payload.fathersName || null,
              phone: payload.emergencyPhone,
              roles: '["child", "camper"]',
              birthDate: payload.birthDate ? new Date(payload.birthDate) : null
           }
        });
        childId = newChild.id;
     }

     await prisma.campRegistration.create({
        data: {
           campId,
           parishionerId: childId,
           medicalNotes: payload.medicalNotes || null,
        }
     });

     revalidatePath('/admin/registry/camps');
     return { success: true };
  } catch (e) {
     return { success: false, error: 'Αποτυχία εγγραφής στην κατασκήνωση.' };
  }
}
