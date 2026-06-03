'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, Users, FileText, Package, HeartHandshake, X } from 'lucide-react';
import { globalAdminSearch, SearchResult } from '@/actions/search';

export default function GlobalSearch() {
 const [query, setQuery] = useState('');
 const [results, setResults] = useState<SearchResult[]>([]);
 const [loading, setLoading] = useState(false);
 const [isOpen, setIsOpen] = useState(false);
 const router = useRouter();
 const wrapperRef = useRef<HTMLDivElement>(null);

 // Debounce search
 useEffect(() => {
 if (query.trim().length < 2) {
 setResults([]);
 setLoading(false);
 return;
 }

 setLoading(true);
 const delayDebounceFn = setTimeout(async () => {
 const res = await globalAdminSearch(query);
 if (res.success && res.results) {
 setResults(res.results);
 }
 setLoading(false);
 }, 400);

 return () => clearTimeout(delayDebounceFn);
 }, [query]);

 // Click outside to close
 useEffect(() => {
 function handleClickOutside(event: MouseEvent) {
 if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
 setIsOpen(false);
 }
 }
 document.addEventListener("mousedown", handleClickOutside);
 return () => document.removeEventListener("mousedown", handleClickOutside);
 }, [wrapperRef]);

 // Command + K shortcut
 useEffect(() => {
 const handleKeyDown = (e: KeyboardEvent) => {
 if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
 e.preventDefault();
 setIsOpen(true);
 document.getElementById('global-search-input')?.focus();
 }
 };
 window.addEventListener('keydown', handleKeyDown);
 return () => window.removeEventListener('keydown', handleKeyDown);
 }, []);

 const handleSelect = (url: string) => {
 setIsOpen(false);
 setQuery('');
 router.push(url);
 };

 const getIcon = (type: string) => {
 switch (type) {
 case 'PARISHIONER': return <Users className="w-4 h-4 text-[var(--success)]"/>;
 case 'PROTOCOL': return <FileText className="w-4 h-4 text-blue-600"/>;
 case 'BENEFICIARY': return <HeartHandshake className="w-4 h-4 text-[var(--danger)]"/>;
 case 'ASSET': return <Package className="w-4 h-4 text-amber-600"/>;
 default: return <Search className="w-4 h-4 text-[var(--text-muted)]"/>;
 }
 };

 const getLabel = (type: string) => {
 switch (type) {
 case 'PARISHIONER': return 'Ενορίτης';
 case 'PROTOCOL': return 'Πρωτόκολλο';
 case 'BENEFICIARY': return 'Συσσίτιο';
 case 'ASSET': return 'Πάγιο';
 default: return 'Άλλο';
 }
 };

 return (
 <div ref={wrapperRef} className="relative w-full max-w-md hidden md:block">
 <div 
 className={`flex items-center w-full px-3 py-2 bg-slate-100 hover:bg-slate-200 transition-colors border border-transparent focus-within:bg-[var(--surface)] focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 rounded-lg ${isOpen ? 'bg-[var(--surface)] border-indigo-400 ring-2 ring-indigo-100' : ''}`}
 >
 <Search className="w-4 h-4 text-[var(--text-muted)] mr-2"/>
 <input 
 id="global-search-input"
 type="text"
 value={query}
 onChange={(e) => {
 setQuery(e.target.value);
 setIsOpen(true);
 }}
 onClick={() => setIsOpen(true)}
 placeholder="Αναζήτηση παντού (Ctrl+K)..."
 className="bg-transparent border-none outline-none w-full text-sm placeholder:text-[var(--text-muted)] text-[var(--foreground)]"
 autoComplete="off"
 />
 {loading && <Loader2 className="w-4 h-4 text-indigo-500 animate-spin"/>}
 {!loading && query && (
 <X 
 className="w-4 h-4 text-[var(--text-muted)] cursor-pointer hover:text-[var(--text-secondary)]"
 onClick={() => { setQuery(''); setIsOpen(false); }} 
 />
)}
 </div>

 {isOpen && query.trim().length >= 2 && (
 <div className="absolute top-12 left-0 w-full min-w-[400px] bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-2xl overflow-hidden z-[9999] animate-in fade-in slide-in-from-top-2">
 {results.length === 0 && !loading ? (
 <div className="p-6 text-center text-[var(--text-muted)] text-sm">
 <Search className="w-8 h-8 text-slate-300 mx-auto mb-2"/>
 Δεν βρέθηκαν αποτελέσματα για"{query}"
 </div>
) : (
 <div className="max-h-[60vh] overflow-y-auto p-2">
 {results.map((result) => (
 <div 
 key={`${result.type}-${result.id}`}
 onClick={() => handleSelect(result.url)}
 className="flex items-start gap-3 p-3 hover:bg-[var(--background)] cursor-pointer rounded-lg border border-transparent hover:border-[var(--border)] transition-colors group"
 >
 <div className="mt-0.5 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 group-hover:bg-[var(--surface)] group-hover:shadow-sm">
 {getIcon(result.type)}
 </div>
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2">
 <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-slate-100 text-[var(--text-secondary)] group-hover:bg-[var(--surface)] group-hover:text-[var(--brand)]">
 {getLabel(result.type)}
 </span>
 </div>
 <p className="text-sm font-bold text-[var(--foreground)] mt-1 truncate">{result.title}</p>
 {result.subtitle && <p className="text-xs text-[var(--text-muted)] truncate">{result.subtitle}</p>}
 </div>
 </div>
))}
 </div>
)}
 
 <div className="bg-[var(--background)] px-3 py-2 text-[10px] text-[var(--text-muted)] border-t border-[var(--border)] uppercase tracking-wider font-semibold flex justify-between">
 <span>Global Admin Search</span>
 <span>Kanonas Engine</span>
 </div>
 </div>
)}
 </div>
);
}
