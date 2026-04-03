'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

const TEMP_TEMPLE_ID = "cm0testtempleid0000000001";

async function getCurrentTempleId() {
  const session = await getSession();
  return session?.templeId || TEMP_TEMPLE_ID;
}

export async function inviteUserAction(email: string, roleId: string) {
  try {
    const templeId = await getCurrentTempleId();
    
    // Check if user exists globally
    let user = await prisma.user.findUnique({ where: { email }});
    
    if (!user) {
      // Create temporary user with a default strong password or invite token (mocked password here)
      const mockPasswordHash = await bcrypt.hash('temp1234', 10);
      user = await prisma.user.create({
        data: {
          email,
          firstName: 'Νέος',
          lastName: 'Χρήστης',
          passwordHash: mockPasswordHash,
        }
      });
    }

    // Connect user to temple with the specified role
    const existingRelation = await prisma.userTemple.findFirst({
      where: { userId: user.id, templeId }
    });

    if (existingRelation) {
      await prisma.userTemple.update({
        where: { id: existingRelation.id },
        data: { roleId }
      });
    } else {
      await prisma.userTemple.create({
        data: {
          userId: user.id,
          templeId,
          roleId,
          status: 'pending' // They must accept the invite conceptually
        }
      });
    }

    revalidatePath('/admin/settings/roles');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
