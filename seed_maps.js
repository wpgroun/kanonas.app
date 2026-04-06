const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const temples = await prisma.temple.findMany({ take: 3 });
  if (temples.length > 0) {
     if (temples[0]) await prisma.temple.update({ where: { id: temples[0].id }, data: { lat: 37.9838, lng: 23.7275 } });
     if (temples[1]) await prisma.temple.update({ where: { id: temples[1].id }, data: { lat: 40.6401, lng: 22.9444 } });
     if (temples[2]) await prisma.temple.update({ where: { id: temples[2].id }, data: { lat: 38.2466, lng: 21.7346 } });
     console.log('Seeded coordinates for 3 temples.');
  }
}

main().finally(() => prisma.$disconnect());
