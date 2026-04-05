import { BookOpen, FolderTree, Landmark, Settings, Search, FileText, Activity } from 'lucide-react';
import Link from 'next/link';
import { kbCategories, kbArticles } from '@/lib/kbData';

export const metadata = {
 title: 'Kanonas Knowledge Base | Εκπαιδευτικό Υλικό',
};

// Map string icons to Lucide components
const iconMap: Record<string, any> = {
 book: <BookOpen className="w-6 h-6 text-blue-500"/>,
 coins: <Landmark className="w-6 h-6 text-emerald-500"/>,
 settings: <Settings className="w-6 h-6 text-[var(--text-muted)]"/>,
 eagle: <Activity className="w-6 h-6 text-purple-500"/>
};

export default function KnowledgeBaseHub() {
 return (
 <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 pb-12">
 
 {/* Hero Search Section */}
 <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden flex flex-col items-center text-center">
 <div className="absolute -left-10 -top-10 text-white/5 rotate-12"><BookOpen className="w-64 h-64"/></div>
 
 <h1 className="text-4xl font-black tracking-tight relative z-10 mb-3 text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white">
 Πώς μπορούμε να βοηθήσουμε;
 </h1>
 <p className="text-slate-300 text-sm relative z-10 w-full max-w-xl mx-auto font-medium">Αναζητήστε εγχειρίδια χρήσης, λύσεις σε προβλήματα και στρατηγικές διαχείρισης της Ενορίας σας μέσα από την εκτενή τράπεζα πληροφοριών (Knowledge Base) του Kanonas.</p>
 
 <div className="mt-8 relative z-10 w-full max-w-lg mb-4">
 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
 <Search className="h-5 w-5 text-[var(--text-muted)]"/>
 </div>
 <input 
 type="text"
 placeholder="Αναζητήστε π.χ. «Ετικέτες ΕΛΤΑ», «Twilio SMS»..."
 className="w-full bg-[var(--surface)]/10 backdrop-blur-md border border-white/20 rounded-2xl pl-11 pr-4 py-3.5 text-base text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-[var(--surface)]/20 transition-all shadow-inner"
 />
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
 {/* Categories Grid (2 Columns inside an area) */}
 <div className="lg:col-span-2 space-y-6">
 <h2 className="text-xl font-extrabold text-[var(--foreground)] flex items-center gap-2">
 <FolderTree className="w-5 h-5 text-blue-500"/> Περιήγηση ανά Κατηγορία
 </h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {kbCategories.map(cat => (
 <Link key={cat.id} href={`#cat-${cat.id}`} className="bg-[var(--surface)] border border-[var(--border)] p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-300 transition-all group">
 <div className="flex items-start gap-4">
 <div className="bg-[var(--background)] p-3 rounded-xl border border-[var(--border)] group-hover:bg-blue-50 transition-colors">
 {iconMap[cat.icon]}
 </div>
 <div>
 <h3 className="font-bold text-[var(--foreground)] group-hover:text-blue-600 transition-colors">{cat.title}</h3>
 <p className="text-xs text-[var(--text-muted)] mt-1">{cat.description}</p>
 <span className="text-[10px] font-bold text-blue-500 mt-3 block">Προβολή Άρθρων &rarr;</span>
 </div>
 </div>
 </Link>
))}
 </div>
 </div>

 {/* Promoted / Most Viewed Articles Sidebar */}
 <div className="bg-[var(--background)] border border-[var(--border)] p-6 rounded-3xl">
 <h2 className="text-sm font-extrabold text-[var(--foreground)] uppercase tracking-widest mb-6 border-b border-[var(--border)] pb-2">Top Άρθρα</h2>
 <div className="space-y-4">
 {kbArticles.sort((a,b) => b.views - a.views).slice(0,3).map(article => (
 <Link href={`/admin/documentation/${article.id}`} key={article.id} className="block group">
 <div className="flex items-start gap-3">
 <FileText className="w-4 h-4 text-[var(--text-muted)] mt-0.5 group-hover:text-blue-500 transition-colors shrink-0"/>
 <div>
 <h4 className="text-sm font-bold text-slate-700 leading-snug group-hover:text-blue-600 transition-colors">{article.title}</h4>
 <span className="text-[10px] text-[var(--text-muted)] mt-1 block">{article.views} Προβολές</span>
 </div>
 </div>
 </Link>
))}
 </div>
 </div>
 </div>
 </div>
);
}
