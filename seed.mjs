import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  try {
    const existing = await prisma.user.findUnique({ where: { email: 'admin@churchos.gr' } })
    if (existing) {
      console.log('Setup already completed.');
      return;
    }

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

    const roleData = await prisma.role.create({
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

    const passwordHash = await bcrypt.hash('amen123', 10);
    const user = await prisma.user.create({
      data: {
        email: 'admin@churchos.gr',
        passwordHash,
        firstName: 'Ιωάννης',
        lastName: 'Παππάς',
        isSuperAdmin: false,
        temples: {
          create: {
            templeId: temple.id,
            isHeadPriest: true 
          }
        }
      }
    });

    console.log('Seed completed successfully!', user.email);
  } catch(e) {
    console.error(e);
  } finally {
    await prisma.$disconnect()
  }
}

main()
