'use client'

import { useState, useTransition } from 'react'
import { Globe, Loader2 } from 'lucide-react'
import { setLocaleAction } from '@/actions/setLocale'

export default function LanguageSwitcher({ currentLocale = 'el' }: { currentLocale?: 'el' | 'en' }) {
 const [isPending, startTransition] = useTransition()
 const [isOpen, setIsOpen] = useState(false)

 const handleSelect = (lang: 'el' | 'en') => {
 setIsOpen(false)
 if (lang === currentLocale) return
 
 startTransition(async () => {
 await setLocaleAction(lang)
 })
 }

 return (
 <div className="relative">
 <button 
 onClick={() => setIsOpen(!isOpen)}
 disabled={isPending}
 className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors disabled:opacity-50"
 title="Αλλαγή Γλώσσας"
 >
 {isPending ? <Loader2 className="w-4 h-4 animate-spin"/> : <Globe className="w-4 h-4"/>}
 </button>

 {isOpen && (
 <>
 <div className="fixed inset-0 z-40"onClick={() => setIsOpen(false)} />
 <div className="absolute right-0 bottom-full mb-2 w-36 bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-2">
 <button 
 onClick={() => handleSelect('el')}
 className={`w-full text-left px-4 py-3 text-sm transition-colors hover:bg-[var(--surface-hover)] ${currentLocale === 'el' ? 'font-bold text-[var(--brand)]' : 'text-[var(--text-secondary)]'}`}
 >
 🇬🇷 Ελληνικά
 </button>
 <button 
 onClick={() => handleSelect('en')}
 className={`w-full text-left px-4 py-3 text-sm transition-colors hover:bg-[var(--surface-hover)] ${currentLocale === 'en' ? 'font-bold text-[var(--brand)]' : 'text-[var(--text-secondary)]'}`}
 >
 🇬🇧 English
 </button>
 </div>
 </>
)}
 </div>
)
}
