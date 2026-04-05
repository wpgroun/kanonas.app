import Link from 'next/link'
import { Lock, Sparkles, ArrowRight } from 'lucide-react'

interface UpgradeGateProps {
 /** The feature key (from planFeatures.ts) — used for messaging */
 feature: string
 /** Human-readable feature name in Greek */
 featureLabel?: string
 /** Show a compact inline badge instead of a full page */
 compact?: boolean
}

const FEATURE_LABELS: Record<string, string> = {
 philanthropy: 'Φιλανθρωπία & Απόρων',
 bloodbank: 'Τράπεζα Αίματος',
 youth: 'Νεολαία & Κατασκηνώσεις',
 assignments: 'Αναθέσεις Εφημερίων',
 ministries: 'Διακονίες & Εθελοντές',
 assets: 'Διαχείριση Περιουσίας',
 vault: 'Ψηφιακό Αρχείο (Vault)',
 documentGeneration: 'Παραγωγή Εγγράφων',
 advancedFinances: 'Προχωρημένα Οικονομικά',
 bulkEmail: 'Μαζική Αποστολή Email',
 importData: 'Εισαγωγή Δεδομένων',
}

export default function UpgradeGate({ feature, featureLabel, compact = false }: UpgradeGateProps) {
 const label = featureLabel ?? FEATURE_LABELS[feature] ?? feature

 if (compact) {
 return (
 <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
 <Lock className="w-3 h-3"/>
 Απαιτείται Premium
 </span>
)
 }

 return (
 <div className="flex flex-col items-center justify-center min-h-[420px] text-center px-4 py-16 space-y-6">
 {/* Icon */}
 <div className="relative">
 <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-200">
 <Lock className="w-9 h-9 text-white"/>
 </div>
 <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-amber-400 flex items-center justify-center shadow">
 <Sparkles className="w-3.5 h-3.5 text-white"/>
 </div>
 </div>

 {/* Text */}
 <div className="space-y-2 max-w-md">
 <h2 className="text-xl font-extrabold text-[var(--foreground)] tracking-tight">
 {label}
 </h2>
 <p className="text-[var(--text-muted)] text-sm leading-relaxed">
 Αυτή η ενότητα είναι διαθέσιμη στο{' '}
 <span className="font-semibold text-[var(--brand)]">Premium πακέτο</span> της
 πλατφόρμας Κανόνας. Αναβαθμίστε για να αποκτήσετε πρόσβαση σε όλες τις λειτουργίες.
 </p>
 </div>

 {/* Feature highlights */}
 <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 max-w-sm w-full text-left space-y-2">
 <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-3">
 Στο Premium συμπεριλαμβάνεται
 </p>
 {[
 'Φιλανθρωπία & Μητρώο Απόρων',
 'Τράπεζα Αίματος Ενορίας',
 'Νεολαία & Κατασκηνώσεις',
 'Παραγωγή & Αρχειοθέτηση Εγγράφων',
 'Προχωρημένα Οικονομικά & BI',
 ].map((item, i) => (
 <div key={i} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
 <div className="w-4 h-4 rounded-full bg-[var(--success-light)] flex items-center justify-center flex-shrink-0">
 <svg className="w-2.5 h-2.5 text-[var(--success)]"fill="currentColor"viewBox="0 0 20 20">
 <path fillRule="evenodd"d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"clipRule="evenodd"/>
 </svg>
 </div>
 {item}
 </div>
))}
 </div>

 {/* CTA */}
 <Link
 href="/admin/subscription"
 className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold px-6 py-3 rounded-xl shadow-md shadow-violet-200 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
 >
 <Sparkles className="w-4 h-4"/>
 Αναβάθμιση σε Premium
 <ArrowRight className="w-4 h-4"/>
 </Link>
 </div>
)
}
