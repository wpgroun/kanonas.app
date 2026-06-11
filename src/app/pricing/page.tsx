'use client';

import Link from 'next/link';
import { CheckCircle2, Server, Cloud, Shield, RefreshCw, Zap, ArrowRight, HelpCircle, Headphones, Star } from 'lucide-react';

const FAQS = [
  {
    q: "Χρειάζομαι πιστωτική κάρτα για τη δοκιμή;",
    a: "Όχι, η δοκιμαστική περίοδος των 14 ημερών είναι εντελώς δωρεάν και δεν απαιτεί καμία προσθήκη πιστωτικής ή χρεωστικής κάρτας. Απλώς εγγράφεστε και ξεκινάτε."
  },
  {
    q: "Τι γίνεται με τα δεδομένα μου αν διακόψω;",
    a: "Τα δεδομένα σας ανήκουν αποκλειστικά στον Ναό σας. Μπορείτε ανά πάσα στιγμή να τα εξάγετε (Export) σε μορφή Excel. Εάν διακόψετε τη συνδρομή σας, ο λογαριασμός παραμένει ενεργός σε λειτουργία 'Μόνο Ανάγνωση' (Read-Only) χωρίς να διαγραφεί τίποτα."
  },
  {
    q: "Μπορούν να έχουν πρόσβαση πάνω από ένας χρήστες;",
    a: "Ναι! Το Κανόνας υποστηρίζει Multi-user περιβάλλον. Σε κάθε Ναό μπορούν να προστεθούν πολλαπλοί ιερείς, νεωκόροι ή γραμματείς, ο καθένας με το δικό του προσωπικό PIN ή κωδικό και διαφορετικά δικαιώματα πρόσβασης."
  },
  {
    q: "Είναι τα δεδομένα μου ασφαλή στο Cloud;",
    a: "Απόλυτα. Χρησιμοποιούμε κρυπτογράφηση τραπεζικού επιπέδου (SSL/TLS), τακτικά αυτόματα Backups και πλήρη απομόνωση δεδομένων ανάμεσα στις Ενορίες. Η πλατφόρμα είναι σχεδιασμένη με βάση τις οδηγίες του GDPR."
  },
  {
    q: "Τι περιλαμβάνει η Υπηρεσία Support;",
    a: "Η Υπηρεσία Support (€50 εφάπαξ) περιλαμβάνει την πλήρη αρχική παραμετροποίηση του λογαριασμού σας από την ομάδα του Κανόνας: εισαγωγή στοιχείων ναού, ρύθμιση προσωπικού, φόρτωση εγγράφων-προτύπων και εκπαίδευση χρηστών. Ιδανικό για ναούς που δεν θέλουν να ασχοληθούν με την τεχνική εγκατάσταση."
  },
  {
    q: "Η πλατφόρμα είναι κατάλληλη για Ναούς εκτός Ελλάδος;",
    a: "Ναι, αν και οι πρότυπες φόρμες (πχ Βεβαιώσεις Γάμου) είναι εναρμονισμένες με την Εκκλησία της Ελλάδος. Μπορείτε ωστόσο να ανεβάσετε τα δικά σας πρότυπα έγγραφα στο σύστημα εάν ανήκετε στο Οικουμενικό Πατριαρχείο, την Εκκλησία της Κύπρου ή την Ομογένεια."
  }
];

const PLANS = [
  {
    slug: 'basic',
    name: 'BASIC',
    price: '29,99',
    yearly: '290',
    tagline: 'Για τις βασικές ανάγκες της ενορίας',
    featured: false,
    features: [
      'Μητρώο Ενοριτών (απεριόριστο)',
      'Μυστήρια — Γάμος & Βάπτιση',
      'Παραγωγή Εγγράφων (PDF/DOCX)',
      'Οικονομικά & Ταμείο',
      'Πρωτόκολλο Αλληλογραφίας',
      'Πρόγραμμα & Ακολουθίες',
      'Εξαγωγή Δεδομένων (Excel)',
    ],
  },
  {
    slug: 'standard',
    name: 'STANDARD',
    price: '49,99',
    yearly: '490',
    tagline: 'Η πλήρης λύση για κάθε ενορία',
    featured: true,
    badge: 'ΠΡΟΤΕΙΝΟΜΕΝΟ',
    features: [
      'Όλα του Basic +',
      'Φιλόπτωχο & Συσσίτιο',
      'Περιουσιολόγιο Ναού',
      'Προχωρημένα Οικονομικά & BI',
      'Διαχείριση Εθελοντών',
      'Εισαγωγή Δεδομένων (Import)',
    ],
  },
  {
    slug: 'premium',
    name: 'PREMIUM',
    price: '69,99',
    yearly: '690',
    tagline: 'Για μεγάλες ενορίες & προσκυνήματα',
    featured: false,
    features: [
      'Όλα του Standard +',
      'Κατασκηνώσεις & Νεολαία',
      'Τράπεζα Αίματος',
      'Ψηφιακό Θησαυροφυλάκιο',
      'Μαζική Αποστολή Email',
      'Ρυθμίσεις Κληρικών',
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* ─── NAVBAR ─── */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-lg border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#4F46E5] flex items-center justify-center">
              <span className="text-white font-extrabold text-sm" style={{fontFamily:"Georgia, serif", fontStyle:"italic", fontSize:"1.3em", paddingRight:"2px"}}>κ</span>
            </div>
            <span className="font-bold text-[var(--foreground)] text-lg tracking-tight">Κανόνας</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/#features" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors">Δυνατότητες</Link>
            <Link href="/pricing" className="text-sm font-bold text-[var(--foreground)] transition-colors">Συνδρομές</Link>
            <Link href="/contact" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors">Επικοινωνία</Link>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors hidden sm:block">
              Είσοδος
            </Link>
            <Link href="/register">
              <button className="btn btn-primary btn-sm">
                Εγγραφή <ArrowRight className="w-3.5 h-3.5"/>
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HEADER ─── */}
      <header className="pt-40 pb-16 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[var(--foreground)] mb-6">
          Απλή, Διαφανής Επιλογή
        </h1>
        <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto mb-6">
          Ξεκινήστε τώρα τον ψηφιακό μετασχηματισμό της Ενορίας σας, χωρίς πολύπλοκες χρεώσεις.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--brand-light)]/50 text-[var(--brand)] rounded-full text-sm font-bold shadow-sm">
            <Shield className="w-4 h-4"/> Σχεδιασμένο για Ελληνικές Ορθόδοξες Ενορίες
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-bold shadow-sm">
            <CheckCircle2 className="w-4 h-4"/> 14 ημέρες δωρεάν δοκιμή, χωρίς κάρτα
          </div>
        </div>
      </header>

      {/* ─── PRICING PLANS ─── */}
      <section className="px-6 pb-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.slug}
              className={`card flex flex-col transition-all relative ${
                plan.featured
                  ? 'border-2 border-[var(--brand)] shadow-2xl p-8'
                  : 'p-8 md:mt-6 hover:border-[var(--brand)]/30'
              }`}
            >
              {plan.badge && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-[#7C3AED] to-[#4F46E5] text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-md whitespace-nowrap">
                  {plan.badge}
                </div>
              )}

              <div className="mb-4 mt-2">
                <h2 className="text-2xl font-bold text-[var(--foreground)]">{plan.name}</h2>
              </div>

              <div className="mb-6 pb-6 border-b border-[var(--border)]">
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-4xl font-extrabold text-[var(--foreground)]">€{plan.price}</span>
                  <span className="text-sm text-[var(--text-muted)] pb-1">/ μήνα</span>
                </div>
                <div className="text-sm font-bold text-emerald-600 bg-emerald-50 inline-block px-2 py-0.5 rounded mt-1">
                  ή €{plan.yearly} / χρόνο (2 μήνες δωρεάν)
                </div>
                <p className="text-sm text-[var(--text-muted)] mt-3">{plan.tagline}</p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((item, idx) => (
                  <li key={idx} className={`flex gap-3 text-sm leading-tight ${idx === 0 && item.includes('+') ? 'font-bold text-[var(--brand)]' : 'text-[var(--text-secondary)] font-medium'}`}>
                    {idx === 0 && item.includes('+')
                      ? <Zap className="w-4 h-4 flex-shrink-0 mt-0.5"/>
                      : <CheckCircle2 className="w-4 h-4 text-[var(--success)] flex-shrink-0 mt-0.5"/>
                    }
                    {item}
                  </li>
                ))}
              </ul>

              <Link href="/register" className="w-full">
                <button className={`w-full text-sm py-2.5 ${plan.featured ? 'btn btn-primary shadow-md shadow-brand/20' : 'btn btn-secondary'}`}>
                  Ξεκινήστε Δωρεάν
                </button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ─── SUPPORT SERVICE ADD-ON ─── */}
      <section className="px-6 pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="card p-8 border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 flex flex-col md:flex-row items-center gap-8">
            <div className="shrink-0 w-16 h-16 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center">
              <Headphones className="w-8 h-8 text-amber-600"/>
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                <Star className="w-4 h-4 text-amber-500 fill-amber-400"/>
                <span className="text-xs font-bold uppercase tracking-widest text-amber-600">Υπηρεσία Πρόσθετη</span>
              </div>
              <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">Υπηρεσία Support & Εγκατάστασης</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-xl">
                Η ομάδα του Κανόνας αναλαμβάνει την πλήρη αρχική παραμετροποίηση: εισαγωγή στοιχείων ναού, ρύθμιση προσωπικού, φόρτωση εγγράφων-προτύπων και εκπαίδευση χρηστών. Ιδανικό για ναούς που θέλουν να ξεκινήσουν χωρίς καθυστέρηση.
              </p>
              <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
                {['Ρύθμιση Στοιχείων Ναού', 'Εισαγωγή Προσωπικού', 'Φόρτωση Εγγράφων-Προτύπων', 'Εκπαίδευση Χρηστών'].map(f => (
                  <span key={f} className="text-xs font-bold px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full border border-amber-200">{f}</span>
                ))}
              </div>
            </div>
            <div className="shrink-0 text-center">
              <div className="text-4xl font-extrabold text-[var(--foreground)] mb-1">€50</div>
              <div className="text-sm text-[var(--text-muted)] font-bold mb-4">εφάπαξ</div>
              <Link href="/contact">
                <button className="btn bg-amber-500 hover:bg-amber-600 border-amber-500 text-white font-bold text-sm px-6 py-2.5 shadow-sm">
                  Μάθετε Περισσότερα
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── COMPARISON SECTION ─── */}
      <section className="py-20 bg-white border-y border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[var(--foreground)] mb-4">Γιατί Κανόνας αντί για παραδοσιακό λογισμικό;</h2>
            <p className="text-[var(--text-secondary)]">Μια σύγχρονη εναλλακτική απέναντι στα παλαιού τύπου desktop προγράμματα.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Cloud className="w-5 h-5"/>
                </div>
                <div>
                  <h3 className="font-bold text-[var(--foreground)] mb-1">Cloud vs Desktop</h3>
                  <p className="text-sm text-[var(--text-secondary)]">Το Κανόνας τρέχει απευθείας στον browser σας. Δε χρειάζεται να εγκαταστήσετε τίποτα, ούτε ανησυχείτε για ιούς στον τοπικό σας δίσκο.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <Server className="w-5 h-5"/>
                </div>
                <div>
                  <h3 className="font-bold text-[var(--foreground)] mb-1">Αυτόματα Backups</h3>
                  <p className="text-sm text-[var(--text-secondary)]">Ξεχάστε τα USB flash drives. Τα δεδομένα σας αποθηκεύονται αυτόματα και με ασφάλεια στους servers μας, προστατευμένα από κάθε κίνδυνο απώλειας.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                  <RefreshCw className="w-5 h-5"/>
                </div>
                <div>
                  <h3 className="font-bold text-[var(--foreground)] mb-1">Πάντα Ενημερωμένο</h3>
                  <p className="text-sm text-[var(--text-secondary)]">Δεν απαιτούνται πληρωμένες ετήσιες αναβαθμίσεις. Κάθε βελτίωση που κάνουμε γίνεται άμεσα διαθέσιμη σε όλους τους Ναούς-συνδρομητές, εντελώς δωρεάν.</p>
                </div>
              </div>
            </div>

            <div className="card bg-slate-50 p-6 md:p-8 border-dashed border-2">
              <h3 className="font-bold text-lg mb-6 border-b pb-4">Η παλιά μέθοδος vs Κανόνας</h3>
              <div className="space-y-4">
                 <div className="flex items-center justify-between text-sm">
                   <span className="text-[var(--text-muted)] line-through">Εγκατάσταση (CDs/Downloads)</span>
                   <span className="font-bold text-emerald-600"><CheckCircle2 className="w-4 h-4 inline mr-1"/>Άμεση Πρόσβαση</span>
                 </div>
                 <div className="flex items-center justify-between text-sm">
                   <span className="text-[var(--text-muted)] line-through">Εξειδικευμένο PC στο Γραφείο</span>
                   <span className="font-bold text-emerald-600"><CheckCircle2 className="w-4 h-4 inline mr-1"/>Tablet, Κινητό, Mac</span>
                 </div>
                 <div className="flex items-center justify-between text-sm">
                   <span className="text-[var(--text-muted)] line-through">Κρυμμένα Κόστη Υποστήριξης</span>
                   <span className="font-bold text-emerald-600"><CheckCircle2 className="w-4 h-4 inline mr-1"/>Όλα Περιλαμβάνονται</span>
                 </div>
                 <div className="flex items-center justify-between text-sm">
                   <span className="text-[var(--text-muted)] line-through">Χειροκίνητο Backup</span>
                   <span className="font-bold text-emerald-600"><CheckCircle2 className="w-4 h-4 inline mr-1"/>Real-time Αντίγραφα Ασφαλείας</span>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="py-24 bg-[var(--background)]">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[var(--foreground)] mb-4">Συχνές Ερωτήσεις</h2>
          </div>
          <div className="space-y-6">
            {FAQS.map((faq, i) => (
              <div key={i} className="card p-6 border-transparent hover:border-[var(--border)] transition-colors">
                <h3 className="font-bold text-lg text-[var(--foreground)] mb-2 flex items-start gap-3">
                  <HelpCircle className="w-6 h-6 text-[var(--brand)] shrink-0"/> {faq.q}
                </h3>
                <p className="text-sm text-[var(--text-secondary)] pl-9 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-zinc-950 text-zinc-400 py-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#7C3AED] to-[#4F46E5] flex items-center justify-center">
              <span className="text-white font-extrabold text-xs" style={{fontFamily:"Georgia, serif", fontStyle:"italic", fontSize:"1em", paddingRight:"1px"}}>κ</span>
            </div>
            <span className="font-bold text-white text-sm">Κανόνας</span>
          </div>
          <div className="flex gap-6 text-sm">
            <Link href="/" className="hover:text-white transition-colors">Αρχική</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Επικοινωνία</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Όροι Χρήσης</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
