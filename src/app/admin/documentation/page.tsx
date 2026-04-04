import { BookOpen, FolderTree, Landmark, Settings, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Εγχειρίδιο Χρήσης (Docs) | Kanonas SaaS',
};

const docs = [
  {
     category: 'Βασική Διαχείριση',
     icon: <Landmark className="w-6 h-6 text-blue-500" />,
     articles: [
        { title: 'Πώς να καταχωρήσετε ένα νέο Μυστήριο', link: '#' },
        { title: 'Δημιουργία Πιστοποιητικών σε PDF', link: '#' },
        { title: 'Εκτύπωση Ετικετών (Ταχυδρομείο ΕΛΤΑ)', link: '/admin/mailing' }
     ]
  },
  {
     category: 'Οικονομικά & Λογιστικά',
     icon: <FolderTree className="w-6 h-6 text-emerald-500" />,
     articles: [
        { title: 'Άνοιγμα νέου Οικονομικού Έτους', link: '#' },
        { title: 'Καταγραφή Δωρεάς', link: '#' },
        { title: 'Εξαγωγή Βιβλίου Εσόδων-Εξόδων (Excel)', link: '#' }
     ]
  },
  {
     category: 'Προηγμένες Ρυθμίσεις (Settings)',
     icon: <Settings className="w-6 h-6 text-slate-500" />,
     articles: [
        { title: 'Σύνδεση Twilio για αυτόματα SMS', link: '/admin/settings' },
        { title: 'Πώς λειτουργεί το Kanonas Public Mini-Site', link: '#' },
        { title: 'Δεξαμενή Εργασιών (Kanban Board)', link: '/admin/board' }
     ]
  }
];

export default function DocumentationPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -top-10 text-white/5"><BookOpen className="w-48 h-48"/></div>
        <h1 className="text-3xl font-extrabold tracking-tight relative z-10 flex items-center gap-3">
           Εγχειρίδιο Χρήσης (Kanonas Base)
        </h1>
        <p className="text-slate-400 mt-2 text-sm relative z-10 w-2/3">Βρείτε γρήγορα απαντήσεις, οδηγούς χρήσης και εκπαιδευτικό υλικό για όλες τις δυνατότητες της πλατφόρμας Kanonas SaaS.</p>
        
        <div className="mt-6 relative z-10 max-w-sm">
           <input type="text" placeholder="Αναζήτηση στα κείμενα..." className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition"/>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {docs.map((docCategory, idx) => (
            <div key={idx} className="bg-white border text-left border-border rounded-2xl shadow-sm hover:shadow-md transition p-6 flex flex-col">
               <div className="flex items-center gap-3 border-b border-border pb-4 mb-4">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">{docCategory.icon}</div>
                  <h3 className="font-bold text-slate-800">{docCategory.category}</h3>
               </div>
               
               <ul className="flex-1 space-y-4">
                  {docCategory.articles.map((article, aIdx) => (
                     <li key={aIdx}>
                        <Link href={article.link} className="group flex items-start gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition">
                           <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 shrink-0 mt-0.5"/>
                           <span className="leading-snug">{article.title}</span>
                        </Link>
                     </li>
                  ))}
               </ul>
            </div>
         ))}
      </div>
    </div>
  );
}
