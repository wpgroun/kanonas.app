import { Zap, CheckCircle2, LayoutTemplate, Box, Mail } from 'lucide-react';

export const metadata = {
  title: 'Kanonas Updates / Changelog | Kanonas SaaS',
};

// Αυτά τα δεδομένα θα παραμετροποιούνται από εμάς σε κάθε Version Update
const changelogEntries = [
  {
    version: 'v1.4.0 (Hawk Update)',
    date: '4 Απριλίου 2026',
    tag: 'SYSTEM',
    changes: [
      { type: 'NEW', text: 'Προσθήκη Δεξαμενής Εργασιών (Kanban Board) με Drag & Drop λογική.' },
      { type: 'NEW', text: 'Kanonas Public Mini-Sites. Αυτόματη δημιουργία Website Ναού /temple/slug' },
      { type: 'UPDATE', text: 'Global Settings Hub: Διαχείριση SMS Twilio & SMTP Mails' },
      { type: 'NEW', text: 'Μητροπολιτικό Κέντρο Ελέγχου (Hawk\'s Eye) για Super Admins με συγκεντρωτικά έσοδα.' }
    ]
  },
  {
    version: 'v1.3.5',
    date: '3 Απριλίου 2026',
    tag: 'PDF ENGINE',
    changes: [
      { type: 'NEW', text: 'Ενσωμάτωση Αυτοκόλλητων Ταχυδρομείου (Labels PDF) σε 3x7 Grid.' },
      { type: 'NEW', text: 'Μαζική επιλογή παραληπτών αλληλογραφίας (CRM Ενοριτών).' },
      { type: 'UPDATE', text: 'Ημερολόγιο Μνημοσύνων: Άδεια တέλεσης και μνημονεύσεις.' }
    ]
  },
  {
    version: 'v1.2.0',
    date: '2 Απριλίου 2026',
    tag: 'CORE',
    changes: [
      { type: 'NEW', text: 'Καταγραφή Εσόδων - Εξόδων & Προϋπολογισμών με ανάλυση Charting.' },
      { type: 'UPDATE', text: 'Αυτόματη Κλίση Ονομάτων (Γενική/Αιτιατική) στα Μυστήρια.' }
    ]
  }
];

export default function ChangelogPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-2 mb-2">
           <div className="bg-white/20 p-2 rounded-xl"><Zap className="text-yellow-300 w-6 h-6"/></div>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">Kanonas Changelog</h1>
        <p className="text-blue-100 mt-2 font-medium">Όλες οι νέες δυνατότητες που ενσωματώνουμε διαρκώς στην πλατφόρμα της Ενορίας σας.</p>
      </div>

      <div className="space-y-6">
         {changelogEntries.map((entry, idx) => (
            <div key={idx} className="bg-white border text-left border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col md:flex-row">
               <div className="bg-slate-50 md:w-1/4 p-6 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col justify-center">
                  <div className="text-sm font-extrabold text-blue-600">{entry.version}</div>
                  <div className="text-xs text-slate-500 font-mono mt-1">{entry.date}</div>
                  <span className="mt-3 inline-block bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-1 rounded w-fit">{entry.tag}</span>
               </div>
               <div className="p-6 md:w-3/4">
                  <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Λίστα Αλλαγών</h3>
                  <ul className="space-y-3">
                     {entry.changes.map((change, cIdx) => (
                        <li key={cIdx} className="flex items-start gap-3 text-sm text-slate-600">
                           {change.type === 'NEW' && <span className="bg-emerald-100 text-emerald-700 text-[10px] font-extrabold px-1.5 py-0.5 rounded shadow-sm shrink-0">NEW</span>}
                           {change.type === 'UPDATE' && <span className="bg-amber-100 text-amber-700 text-[10px] font-extrabold px-1.5 py-0.5 rounded shadow-sm shrink-0">UPDATE</span>}
                           {change.type === 'FIX' && <span className="bg-slate-100 text-slate-600 text-[10px] font-extrabold px-1.5 py-0.5 rounded shadow-sm shrink-0">FIX</span>}
                           <span className="leading-snug">{change.text}</span>
                        </li>
                     ))}
                  </ul>
               </div>
            </div>
         ))}
      </div>
    </div>
  );
}
