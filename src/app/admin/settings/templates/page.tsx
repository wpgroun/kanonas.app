import { prisma } from '@/lib/prisma';
import TemplateClient from './TemplateClient';

export default async function TemplatesPage() {
  const templates = await prisma.docTemplate.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="container-fluid mt-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Διαχείριση Προτύπων (.docx)</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Ανεβάστε αρχεία MS Word για να τα χρησιμοποιήσετε ως πρότυπα στην αυτόματη έκδοση εγγράφων.
          </p>
        </div>
      </div>
      
      {/* We pass the templates to a Client component to handle File Upload states */}
      <TemplateClient initialTemplates={templates} />
    </div>
  );
}

