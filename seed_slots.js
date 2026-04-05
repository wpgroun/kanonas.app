const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  const temple = await prisma.temple.findFirst();
  if(!temple) return console.log('No temple');

  // Next Saturday 11:00
  let startTime = new Date();
  startTime.setDate(startTime.getDate() + (6 - startTime.getDay() + 7) % 7);
  startTime.setHours(11, 0, 0, 0);

  let endTime = new Date(startTime);
  endTime.setHours(12, 0, 0, 0);

  await prisma.bookingSlot.create({
    data: {
      templeId: temple.id,
      serviceType: 'BAPTISM',
      startTime, endTime
    }
  });

  // Next Saturday 18:00
  startTime.setHours(18, 0, 0, 0);
  endTime.setHours(19, 0, 0, 0);
  await prisma.bookingSlot.create({
    data: {
      templeId: temple.id,
      serviceType: 'GAMOS',
      startTime, endTime
    }
  });
  
  console.log('Seeded mock slots!');
}

seed();
