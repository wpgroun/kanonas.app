const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const temples = await prisma.temple.findMany({ 
    select: { slug: true, name: true }
  });
  console.log('--- TEMPLE SLUGS ---');
  if (temples.length === 0) console.log('Δεν βρέθηκαν ναοί.');
  temples.forEach(t => console.log(`${t.name} -> /temple/${t.slug}/connect`));
  
  const metropolises = await prisma.metropolis.findMany({
    select: { slug: true, name: true }
  });
  console.log('\n--- METROPOLIS SLUGS ---');
  if (metropolises.length === 0) console.log('Δεν βρέθηκαν μητροπόλεις με slug.');
  metropolises.forEach(m => console.log(`${m.name} -> /metropolis/${m.slug}`));
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  });
