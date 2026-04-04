const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🏛️ Χτίζεται η Hierarchy Test Structure...');

  // 1. Δημιουργούμε την Ιερά Μητρόπολη
  const metropolis = await prisma.metropolis.upsert({
    where: { slug: 'thessaloniki' },
    update: { name: 'Ιερά Μητρόπολις Θεσσαλονίκης' },
    create: {
      name: 'Ιερά Μητρόπολις Θεσσαλονίκης',
      slug: 'thessaloniki'
    }
  });
  console.log(`✅ Μητρόπολη δημιουργήθηκε: ${metropolis.id}`);

  // 2. Δημιουργούμε τον Ναό υπό τη Μητρόπολη
  const temple = await prisma.temple.upsert({
    where: { slug: 'agios-dimitrios-skg' },
    update: { metropolisId: metropolis.id },
    create: {
      name: 'Ιερός Ναός Αγίου Δημητρίου (Πολιούχος)',
      slug: 'agios-dimitrios-skg',
      metropolisId: metropolis.id,
      taxId: '090000000',
      settings: JSON.stringify({ publicVisible: true })
    }
  });
  console.log(`✅ Ναός δημιουργήθηκε: ${temple.name}`);

  // 3. Δημιουργούμε τα Accounts (Default κωδικός για το OAuth simulation ή session mapping αν έχετε passkeys,
  // αλλά στο Kanonas χρησιμοποιούμε NextAuth emails. Οπότε βάζουμε emails που θα χρησιμοποιείτε)
  
  // A. SaaS Owner
  const owner = await prisma.user.upsert({
    where: { email: 'owner@kanonas.app' },
    update: { isSuperAdmin: true },
    create: {
      email: 'owner@kanonas.app',
      name: 'SaaS Platform Owner',
      isSuperAdmin: true
    }
  });

  // B. Metropolis Admin
  const metropolisAdmin = await prisma.user.upsert({
    where: { email: 'thessaloniki@kanonas.app' },
    update: { isSuperAdmin: true }, // Δίνουμε power για το Hawk's Eye
    create: {
      email: 'thessaloniki@kanonas.app',
      name: 'Μητροπολίτης / Γραμματεία',
      isSuperAdmin: true
    }
  });

  // Συνδέουμε τον Metropolis Admin με τη Μητρόπολη
  await prisma.metropolisUser.upsert({
     where: { userId_metropolisId: { userId: metropolisAdmin.id, metropolisId: metropolis.id } },
     update: {},
     create: { userId: metropolisAdmin.id, metropolisId: metropolis.id, role: 'ADMIN' }
  });

  // C. Temple Admin (Εφημέριος Αγίου Δημητρίου)
  const priest = await prisma.user.upsert({
    where: { email: 'agiosdimitrios@kanonas.app' },
    update: { isSuperAdmin: false },
    create: {
      email: 'agiosdimitrios@kanonas.app',
      name: 'Προϊστάμενος Αγίου Δημητρίου',
      isSuperAdmin: false
    }
  });

  // Συνδέουμε τον Ιερέα με τον Ναό
  await prisma.userTemple.upsert({
     where: { userId_templeId: { userId: priest.id, templeId: temple.id } },
     update: {},
     create: { userId: priest.id, templeId: temple.id, role: 'ADMIN' }
  });

  console.log('✅ Accounts Mapped Successfully!');
  console.log('----------------------------------------------------');
  console.log('🎯 credentials για δοκιμές (Κάνετε Login μέσω Magic Link ή local bypass αν είστε σε dev):');
  console.log('SaaS Owner:  owner@kanonas.app');
  console.log('Metropolis: thessaloniki@kanonas.app  -> Go to /metropolis');
  console.log('Priest:     agiosdimitrios@kanonas.app -> Go to /admin');
  console.log('----------------------------------------------------');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
