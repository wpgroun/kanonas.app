// @ts-nocheck
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    // 1. Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email: 'admin@kanonas.gr' } });
    if (existing) {
      return NextResponse.json({ message: 'Setup already completed. User exists.' });
    }

    // 2. Create Metropolis & Temple
    const metropolis = await prisma.metropolis.create({
      data: { name: 'Ιερά Μητρόπολη Αθηνών' }
    });

    const temple = await prisma.temple.upsert({
      where: { id: 'cm0testtempleid0000000001' },
      update: {},
      create: { 
        id: 'cm0testtempleid0000000001',
        name: 'Ιερός Ναός Αγίου Ελευθερίου',
        metropolisId: metropolis.id,
        email: 'info@agios-eleftherios.gr'
      }
    });

    // 3. Create Default Roles
    const priestRole = await prisma.role.create({
      data: {
        templeId: temple.id,
        name: 'Εφημέριος',
        canViewFinances: false,
        canEditFinances: false,
        canManageRequests: true,
        canManageRegistry: true,
        canManageSchedule: true,
        canManageAssets: false
      }
    });

    const secretaryRole = await prisma.role.create({
      data: {
        templeId: temple.id,
        name: 'Γραμματεία',
        canViewFinances: false,
        canEditFinances: false,
        canManageRequests: true,
        canManageRegistry: true,
        canManageSchedule: true,
        canManageAssets: false
      }
    });

    const councilRole = await prisma.role.create({
      data: {
        templeId: temple.id,
        name: 'Συμβούλιο / Ταμίας',
        canViewFinances: true,
        canEditFinances: true,
        canManageRequests: false,
        canManageRegistry: false,
        canManageSchedule: false,
        canManageAssets: true
      }
    });

    // 4. Create the Head Priest (Admin)
    const passwordHash = await bcrypt.hash('amen123', 10);
    const user = await prisma.user.create({
      data: {
        email: 'admin@kanonas.gr',
        passwordHash,
        firstName: 'Ιωάννης',
        lastName: 'Παππάς',
        isSuperAdmin: false,
        temples: {
          create: {
            templeId: temple.id,
            isHeadPriest: true // He is the head priest, bypassing roles
          }
        }
      }
    });

    return NextResponse.json({ message: 'Setup Complete', user });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


