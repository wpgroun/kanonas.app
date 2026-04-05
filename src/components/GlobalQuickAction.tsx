'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Banknote, UserPlus, FileText } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function GlobalQuickAction() {
 const [open, setOpen] = useState(false);
 const pathname = usePathname();
 const ref = useRef<HTMLDivElement>(null);

 // Don't show outside admin
 if (!pathname?.startsWith('/admin')) return null;

 useEffect(() => {
 const clickOutside = (e: MouseEvent) => {
 if (open && ref.current && !ref.current.contains(e.target as Node)) {
 setOpen(false);
 }
 };
 document.addEventListener('mousedown', clickOutside);
 return () => document.removeEventListener('mousedown', clickOutside);
 }, [open]);

 return (
 <div ref={ref} className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3 pointer-events-none">
 {/* Menu Items */}
 <div className={`flex flex-col items-end gap-3 transition-all duration-300 pointer-events-auto origin-bottom ${open ? 'scale-100 opacity-100' : 'scale-75 opacity-0 invisible'}`}>
 <Link href="/admin/finances"onClick={() => setOpen(false)} className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-full shadow-lg border border-slate-200 hover:scale-105 hover:border-amber-400 hover:shadow-xl transition-all text-sm font-bold text-slate-700 group">
 <span className="text-amber-500 bg-amber-50 p-1.5 rounded-full group-hover:scale-110 transition-transform"><Banknote className="w-4 h-4"/></span> 
 <span>Καταχώρηση Ταμείου</span>
 </Link>
 <Link href="/admin/requests"onClick={() => setOpen(false)} className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-full shadow-lg border border-slate-200 hover:scale-105 hover:border-emerald-400 hover:shadow-xl transition-all text-sm font-bold text-slate-700 group">
 <span className="text-emerald-500 bg-emerald-50 p-1.5 rounded-full group-hover:scale-110 transition-transform"><FileText className="w-4 h-4"/></span> 
 <span>Νέο Μυστήριο</span>
 </Link>
 <Link href="/admin/parishioners"onClick={() => setOpen(false)} className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-full shadow-lg border border-slate-200 hover:scale-105 hover:border-blue-400 hover:shadow-xl transition-all text-sm font-bold text-slate-700 group">
 <span className="text-blue-500 bg-blue-50 p-1.5 rounded-full group-hover:scale-110 transition-transform"><UserPlus className="w-4 h-4"/></span> 
 <span>Νέος Ενορίτης</span>
 </Link>
 </div>

 {/* Main Button */}
 <button 
 onClick={() => setOpen(!open)}
 title="Quick Actions"
 className={`pointer-events-auto flex items-center justify-center w-14 h-14 rounded-full shadow-xl transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-primary/30 ${open ? 'bg-slate-800 text-white rotate-45 shadow-slate-500/50' : 'bg-primary text-primary-foreground shadow-primary/40'}`}
 >
 <Plus className="w-7 h-7"/>
 </button>
 </div>
);
}
