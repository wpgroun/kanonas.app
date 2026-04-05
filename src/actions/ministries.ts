'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/requireAuth';
import { getCurrentTempleId } from './core';
import { revalidatePath } from 'next/cache';

// -- MINISTRIES -- //

export async function getMinistries() {
  await requireAuth();
  const templeId = await getCurrentTempleId();
  try {
    return await prisma.ministry.findMany({
       where: { templeId },
       include: {
          volunteers: { include: { volunteer: true } },
       },
       orderBy: { name: 'asc' }
    });
  } catch(e) { return []; }
}

export async function addMinistry(data: { name: string, description?: string, color?: string }) {
  await requireAuth();
  const templeId = await getCurrentTempleId();
  try {
    await prisma.ministry.create({
       data: {
          templeId,
          name: data.name,
          description: data.description,
          color: data.color
       }
    });
    revalidatePath('/admin/ministries');
    return { success: true };
  } catch(e) { return { success: false, error: 'Σφάλμα δημιουργίας' }; }
}

export async function deleteMinistry(id: string) {
  await requireAuth();
  const templeId = await getCurrentTempleId();
  try {
    const existing = await prisma.ministry.findFirst({ where: { id, templeId } });
    if (!existing) return { success: false, error: 'Unauthorized' };
    await prisma.ministry.delete({ where: { id } });
    revalidatePath('/admin/ministries');
    return { success: true };
  } catch(e) { return { success: false, error: 'Σφάλμα διαγραφής' }; }
}

// -- VOLUNTEERS -- //

export async function getVolunteers() {
  await requireAuth();
  const templeId = await getCurrentTempleId();
  try {
    return await prisma.volunteer.findMany({
       where: { templeId },
       include: { ministries: { include: { ministry: true } } },
       orderBy: { lastName: 'asc' }
    });
  } catch(e) { return []; }
}

export async function addVolunteer(data: { firstName: string, lastName: string, phone?: string, email?: string, ministryIds?: string[] }) {
  await requireAuth();
  const templeId = await getCurrentTempleId();
  try {
    const vol = await prisma.volunteer.create({
       data: {
          templeId,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          email: data.email
       }
    });
    
    // Assign to ministries
    if(data.ministryIds && data.ministryIds.length > 0) {
       await prisma.ministryVolunteer.createMany({
          data: data.ministryIds.map(mid => ({
             ministryId: mid,
             volunteerId: vol.id
          }))
       });
    }

    revalidatePath('/admin/ministries');
    return { success: true };
  } catch(e) { return { success: false, error: 'Σφάλμα δημιουργίας' }; }
}

export async function deleteVolunteer(id: string) {
  await requireAuth();
  const templeId = await getCurrentTempleId();
  try {
    const existing = await prisma.volunteer.findFirst({ where: { id, templeId } });
    if (!existing) return { success: false, error: 'Unauthorized' };
    await prisma.volunteer.delete({ where: { id } });
    revalidatePath('/admin/ministries');
    return { success: true };
  } catch (e) { return { success: false, error: 'Σφάλμα' }; }
}

export async function assignToMinistry(volunteerId: string, ministryId: string) {
   await requireAuth();
   try {
     await prisma.ministryVolunteer.create({
        data: { volunteerId, ministryId }
     });
     revalidatePath('/admin/ministries');
     return { success: true };
   } catch(e) { return { success: false, error: 'Ήδη ανατεθειμένος' }; }
}

export async function unassignFromMinistry(volunteerId: string, ministryId: string) {
   await requireAuth();
   try {
     await prisma.ministryVolunteer.deleteMany({
        where: { volunteerId, ministryId }
     });
     revalidatePath('/admin/ministries');
     return { success: true };
   } catch(e) { return { success: false, error: 'Σφάλμα' }; }
}

// -- SHIFTS -- //

export async function getRecentShifts() {
  await requireAuth();
  const templeId = await getCurrentTempleId();
  try {
     // Fetch shifts for the temple's ministries
     return await prisma.shift.findMany({
        where: { ministry: { templeId } },
        include: {
           ministry: true,
           assignments: { include: { volunteer: true } }
        },
        orderBy: { date: 'asc' }
     });
  } catch(e) { return []; }
}

export async function createShift(data: { ministryId: string, date: Date, startTime?: string, endTime?: string, volunteerIds: string[], notes?: string }) {
  await requireAuth();
  try {
     const shift = await prisma.shift.create({
        data: {
           ministryId: data.ministryId,
           date: data.date,
           startTime: data.startTime,
           endTime: data.endTime,
           notes: data.notes
        }
     });

     if(data.volunteerIds && data.volunteerIds.length > 0) {
        await prisma.shiftAssignment.createMany({
           data: data.volunteerIds.map(vid => ({
              shiftId: shift.id,
              volunteerId: vid,
              status: 'PENDING'
           }))
        });
     }
     
     revalidatePath('/admin/ministries');
     return { success: true };
  } catch(e) { return { success: false, error: 'Σφάλμα' }; }
}

export async function updateShiftAssignmentStatus(assignmentId: string, status: string) {
   await requireAuth();
   try {
      await prisma.shiftAssignment.update({
         where: { id: assignmentId },
         data: { status }
      });
      revalidatePath('/admin/ministries');
      return { success: true };
   } catch(e) { return { success: false, error: 'Σφάλμα' }; }
}
