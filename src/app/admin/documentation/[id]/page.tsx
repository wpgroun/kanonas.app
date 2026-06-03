import { kbArticles, kbCategories } from '@/lib/kbData';
import { ArrowLeft, Tag, BookOpen } from 'lucide-react';
import Link from 'next/link';

export async function generateMetadata({ params }: { params: { id: string } }) {
 const article = kbArticles.find(a => a.id === params.id);
 return { title: article ? `${article.title} | Kanonas KB` : 'Άρθρο δεν βρέθηκε' };
}

export default function ArticlePage({ params }: { params: { id: string } }) {
 const article = kbArticles.find(a => a.id === params.id);

 if (!article) {
 return (
 <div className="max-w-4xl mx-auto py-20 text-center">
 <h1 className="text-2xl font-bold text-[var(--foreground)]">Το άρθρο δεν βρέθηκε</h1>
 <Link href="/admin/documentation"className="text-blue-600 mt-4 inline-block hover:underline">Επιστροφή στο Knowledge Base</Link>
 </div>
);
 }

 const category = kbCategories.find(c => c.id === article.categoryId);

 return (
 <div className="max-w-3xl mx-auto space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4">
 
 <Link href="/admin/documentation"className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--text-muted)] hover:text-blue-600 transition-colors bg-[var(--surface)] px-3 py-1.5 rounded-full border border-[var(--border)] shadow-sm w-fit mb-4">
 <ArrowLeft className="w-4 h-4"/> Πίσω στο Hub
 </Link>

 <div className="bg-[var(--surface)] rounded-3xl p-8 md:p-12 shadow-sm border border-[var(--border)]">
 <div className="flex items-center gap-2 mb-4">
 <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1">
 <BookOpen className="w-3.5 h-3.5"/> {category?.title || 'Γενικά'}
 </span>
 </div>
 
 <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--foreground)] leading-tight tracking-tight mb-6">
 {article.title}
 </h1>

 <div className="flex items-center gap-4 mb-10 border-b border-[var(--border)] pb-6 text-sm text-[var(--text-muted)] font-medium">
 <span className="flex items-center gap-1.5"><Tag className="w-4 h-4 text-[var(--text-muted)]"/> {article.tags.join(', ')}</span>
 <span>•</span>
 <span>{article.views} Προβολές Πανελλαδικά</span>
 </div>

 {/* Article Content Rendered */}
 <div className="prose prose-slate prose-blue max-w-none 
 prose-headings:font-bold prose-headings:tracking-tight 
 prose-h1:text-2xl prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:border-b prose-h2:border-[var(--border)] prose-h2:pb-2
 prose-p:text-[var(--text-secondary)] prose-p:leading-relaxed
 prose-li:text-[var(--text-secondary)]">
 {article.content.split('\n').map((paragraph, idx) => {
 if (paragraph.trim().startsWith('# ')) {
 return <h1 key={idx}>{paragraph.replace('# ', '')}</h1>;
 }
 if (paragraph.trim().startsWith('## ')) {
 return <h2 key={idx}>{paragraph.replace('## ', '')}</h2>;
 }
 if (paragraph.trim().match(/^[0-9]+\./)) {
 return <div key={idx} className="flex pl-4 mb-2 text-[var(--text-secondary)] font-medium">{paragraph}</div>;
 }
 if (paragraph.trim()) {
 return <p key={idx}>{paragraph}</p>;
 }
 return null;
 
 })}
 </div>

 <div className="mt-16 pt-8 border-t border-[var(--border)] flex items-center justify-between">
 <p className="text-sm font-semibold text-[var(--text-muted)]">Σας φάνηκε χρήσιμο αυτό το άρθρο;</p>
 <div className="flex gap-2">
 <button className="bg-[var(--background)] hover:bg-[var(--success-light)] text-[var(--text-secondary)] hover:text-[var(--success)] border border-[var(--border)] px-4 py-2 rounded-xl text-sm font-bold transition-all transition-colors shadow-sm">Ναι 👍</button>
 <button className="bg-[var(--background)] hover:bg-[var(--danger-light)] text-[var(--text-secondary)] hover:text-[var(--danger)] border border-[var(--border)] px-4 py-2 rounded-xl text-sm font-bold transition-all transition-colors shadow-sm">Όχι 👎</button>
 </div>
 </div>
 </div>
 </div>
);
}
