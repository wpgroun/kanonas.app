import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

async function main() {
  const { prisma } = await import('../lib/prisma');
  console.log("Cleaning up old duplicate ServiceSchedule records...");
  const result = await prisma.serviceSchedule.deleteMany({
    where: {
      description: {
        contains: 'Δεσμευμένο από αίτηση'
      }
    }
  });
  console.log(`Deleted ${result.count} duplicate service schedule records.`);
}

main().catch(console.error);
