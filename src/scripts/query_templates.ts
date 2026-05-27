import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const templates = await prisma.docTemplate.findMany();
  console.log("TEMPLATES COUNT:", templates.length);
  for (const t of templates) {
    console.log(`- ID: ${t.id}, Name: ${t.nameEl}, FileUrl: ${t.fileUrl}, HasHTML: ${!!t.htmlContent}, docType: ${t.docType}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
