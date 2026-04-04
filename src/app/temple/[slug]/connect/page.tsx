import { prisma } from '@/lib/prisma';
import ConnectForm from './ConnectForm';
import { Church } from 'lucide-react';

export async function generateMetadata({ params }: { params: { slug: string } }) {
   const temple = await prisma.temple.findUnique({ where: { slug: params.slug } });
   return { title: temple ? \`Kanonas Connect | \${temple.name}\` : 'Ο Ναός δεν βρέθηκε' };
}

export default async function PublicConnectPage({ params }: { params: { slug: string } }) {
   const temple = await prisma.temple.findUnique({ where: { slug: params.slug } });

   if (!temple) {
      return (
         <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
            <h1 className="text-2xl font-bold text-slate-800">Ο Ναός δεν βρέθηκε</h1>
            <p className="text-slate-500 mt-2">Η διεύθυνση URL (slug) που πληκτρολογήσατε δεν αντιστοιχεί σε κάποια εγγεγραμμένη Ενορία.</p>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
         {/* Head / Cover Banner */}
         <div className="bg-gradient-to-r from-blue-900 to-slate-900 text-white p-8 md:p-16 shadow-lg rounded-b-[40px] text-center">
            <div className="mx-auto bg-white/10 w-fit p-4 rounded-full mb-6 relative shadow-inner">
               <Church className="w-12 h-12 text-blue-200" />
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-2">Ηλεκτρονικές Υπηρεσίες</h1>
            <h2 className="text-lg md:text-xl font-medium text-blue-200">{temple.name}</h2>
            <p className="mt-8 text-sm text-slate-300 max-w-2xl mx-auto">
               Καλώς ήρθατε στο Ψηφιακό Γραφείο της Ενορίας. Εδώ μπορείτε να υποβάλετε επίσημα αιτήματα έκδοσης πιστοποιητικών, 
               καθώς και να φόρμες συμμετοχής για κατηχητικά και εκδρομές.
            </p>
         </div>

         {/* Form Area */}
         <div className="max-w-4xl mx-auto -mt-8 relative z-10 px-4 pb-20">
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 md:p-10">
               {/* Client Component Handle Form Logic */}
               <ConnectForm slug={temple.slug as string} />
            </div>
         </div>
      </div>
   );
}
