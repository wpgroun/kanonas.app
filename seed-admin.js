const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.user.findUnique({ where: { email: 'admin@kanonas.gr' } });
  if (existing) {
    console.log('Admin already exists.');
    return;
  }

  let metropolis = await prisma.metropolis.findFirst({
    where: { name: 'Ιερά Μητρόπολη Αθηνών' }
  });
  if (!metropolis) {
    metropolis = await prisma.metropolis.create({
      data: { name: 'Ιερά Μητρόπολη Αθηνών' }
    });
  }

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

  const passwordHash = await bcrypt.hash('amen123', 12);
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
          isHeadPriest: true
        }
      }
    }
  });

  console.log('Success! Admin user created (admin@kanonas.gr / amen123)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
