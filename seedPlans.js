const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Cleaning up old plans...');
  await prisma.plan.deleteMany();

  console.log('🌱 Seeding new Kanonas Plans...');

  const plans = [
    {
      name: 'Starter / Δοκιμή',
      slug: 'starter',
      priceMonthly: 0,
      priceYearly: 0,
      isMetropolis: false,
      features: JSON.stringify([
        'Έως 10 ενεργοί Ενορίτες',
        'Δοκιμαστικά Ημερολόγια',
        'Αναζήτηση',
        'Βασική υποστήριξη'
      ]),
      sortOrder: 1
    },
    {
      name: 'Βασική Ενορία',
      slug: 'basic',
      priceMonthly: 29,
      priceYearly: 299,
      isMetropolis: false,
      features: JSON.stringify([
        'Έως 500 ενορίτες',
        'Ληξιαρχείο (Βαπτίσεις, Γάμοι)',
        'Βασικά Πιστοποιητικά (PDF)',
        'Πρωτόκολλο',
        'Email υποστήριξη'
      ]),
      sortOrder: 2
    },
    {
      name: 'Premium Ναός',
      slug: 'premium',
      priceMonthly: 59,
      priceYearly: 690,
      isMetropolis: false,
      features: JSON.stringify([
        'Απεριόριστοι Ενορίτες',
        'Κεντρικό Ταμείο',
        'Ετικέτες ΕΛΤΑ',
        'Εργαλεία Συσσιτίων',
        'Kanban Board (Τμήματα)',
        'Public Website',
        'Twilio SMS'
      ]),
      sortOrder: 3
    },
    {
      name: 'Ιερά Μητρόπολη',
      slug: 'metropolis',
      priceMonthly: 80, // using 80/mo as representation for 960/yr
      priceYearly: 800,
      isMetropolis: true,
      features: JSON.stringify([
        'Hawk\'s Eye Dashboard',
        'Κεντρικός Έλεγχος всех Ναών',
        'Αθροιστικά KPIs',
        'Super Admin "Dive-In"'
      ]),
      sortOrder: 4
    }
  ];

  for (const p of plans) {
    await prisma.plan.create({ data: p });
    console.log(`✅ Created plan: ${p.name}`);
  }

  console.log('🎉 Subscription seeding completed!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
