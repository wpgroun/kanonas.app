import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@kanonas.gr';
  
  // Check if test temple exists
  let temple = await prisma.temple.findUnique({ where: { id: 'cm0testtempleid0000000001' } });
  if (!temple) {
    temple = await prisma.temple.create({
      data: {
        id: 'cm0testtempleid0000000001',
        name: 'Ιερός Ναός Δοκιμών',
      }
    });
    console.log('Created Template Temple.');
  }

  // Create or Update Admin user
  const passwordHash = await bcrypt.hash('password123', 10);
  
  let user = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash, isSuperAdmin: true },
    create: {
      email: adminEmail,
      firstName: 'Super',
      lastName: 'Admin',
      passwordHash,
      isSuperAdmin: true,
    }
  });
  console.log(`Upserted Super Admin: ${user.email}`);

  // Link to temple
  const link = await prisma.userTemple.findFirst({ where: { userId: user.id, templeId: temple.id }});
  if (!link) {
    await prisma.userTemple.create({
      data: {
        userId: user.id,
        templeId: temple.id,
        isHeadPriest: true,
        status: 'active'
      }
    });
    console.log('Linked Super Admin to Temple as Head Priest.');
  }

  console.log('Seed completed successfully. You can login with admin@kanonas.gr / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

