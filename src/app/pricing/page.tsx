'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { CheckCircle2, Server, Cloud, Shield, RefreshCw, Zap, ArrowRight, ChevronRight, HelpCircle } from 'lucide-react';

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
    q: "Η πλατφόρμα είναι κατάλληλη για Ναούς εκτός Ελλάδος;",
    a: "Ναι, αν και οι πρότυπες φόρμες (πχ Βεβαιώσεις Γάμου) είναι εναρμονισμένες με την Εκκλησία της Ελλάδος. Μπορείτε ωστόσο να ανεβάσετε τα δικά σας πρότυπα έγγραφα στο σύστημα εάν ανήκετε στο Οικουμενικό Πατριαρχείο, την Εκκλησία της Κύπρου ή την Ομογένεια."
  }
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
      <header className="pt-40 pb-20 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[var(--foreground)] mb-6">
          Απλή, Διαφανής Επιλογή
        </h1>
        <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto mb-4">
          Ξεκινήστε τώρα τον ψηφιακό μετασχηματισμό της Ενορίας σας, χωρίς πολύπλοκες χρεώσεις.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--brand-light)]/50 text-[var(--brand)] rounded-full text-sm font-bold shadow-sm">
          <Shield className="w-4 h-4"/> Σχεδιασμένο για Ελληνικές Ορθόδοξες Ενορίες
        </div>
      </header>

      {/* ─── PRICING PLANS ─── */}
      <section className="px-6 pb-24">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Trial Plan */}
          <div className="card p-8 flex flex-col hover:border-[var(--brand)]/30 transition-all">
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-zinc-100 text-zinc-600 font-bold text-[10px] uppercase tracking-wider rounded-full mb-3">
                Χωρίς πιστωτική κάρτα
              </span>
              <h2 className="text-2xl font-bold text-[var(--foreground)]">ΔΟΚΙΜΑΣΤΙΚΟ</h2>
            </div>
            <div className="mb-6 pb-6 border-b border-[var(--border)]">
              <div className="flex items-end gap-1 mb-2">
                <span className="text-4xl font-extrabold text-[var(--foreground)]">Δωρεάν</span>
              </div>
              <p className="text-sm text-[var(--text-muted)]">για 14 ημέρες πλήρους πρόσβασης</p>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              {['Όλα τα features του Basic πακέτου', 'Απεριόριστα Πιστοποιητικά (Δοκιμαστικά)', 'Προσωπική Επίδειξη Χρήσης'].map(item => (
                <li key={item} className="flex gap-3 text-sm text-[var(--text-secondary)] leading-tight">
                  <CheckCircle2 className="w-4 h-4 text-[var(--brand)] flex-shrink-0 mt-0.5"/> {item}
                </li>
              ))}
            </ul>
            <Link href="/register" className="w-full">
              <button className="btn btn-secondary w-full text-sm py-2.5">
                Ξεκινήστε Δωρεάν
              </button>
            </Link>
          </div>

          {/* Basic Plan (Recommended) */}
          <div className="card p-8 border-2 border-[var(--brand)] shadow-xl relative flex flex-col transform md:-translate-y-4">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-[#7C3AED] to-[#4F46E5] text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-md">
              Προτεινομενο
            </div>
            <div className="mb-4 mt-2">
              <h2 className="text-2xl font-bold text-[var(--foreground)]">ΒΑΣΙΚΟ</h2>
            </div>
            <div className="mb-6 pb-6 border-b border-[var(--border)]">
              <div className="flex flex-col gap-1 mb-2">
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-extrabold text-[var(--foreground)]">€29</span>
                  <span className="text-sm text-[var(--text-muted)] pb-1">/ μήνα</span>
                </div>
                <div className="text-sm font-bold text-emerald-600 bg-emerald-50 inline-block px-2 py-0.5 rounded w-max mt-1">
                  ή €290 / χρόνο (2 μήνες δωρεάν)
                </div>
              </div>
              <p className="text-sm text-[var(--text-muted)] mt-3">Ιδανικό για την καθημερινότητα των Ναών</p>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              {[
                'Μητρώο Ενοριτών (απεριόριστο)',
                'Παραγωγή Εγγράφων (PDF/DOCX)',
                'Οικονομικά & Ταμείο',
                'Πρωτόκολλο',
                'Ηλεκτρονικές Αιτήσεις (Connect)',
                'Φιλόπτωχο & Συσσίτιο',
                'Email υποστήριξη'
              ].map(item => (
                <li key={item} className="flex gap-3 text-sm text-[var(--foreground)] font-medium leading-tight">
                  <CheckCircle2 className="w-4 h-4 text-[var(--success)] flex-shrink-0 mt-0.5"/> {item}
                </li>
              ))}
            </ul>
            <Link href="/register" className="w-full">
              <button className="btn btn-primary w-full text-sm py-2.5 shadow-md shadow-brand/20">
                Ξεκινήστε Δωρεάν
              </button>
            </Link>
          </div>

          {/* Premium Plan */}
          <div className="card p-8 flex flex-col hover:border-[var(--brand)]/30 transition-all">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-[var(--foreground)]">PREMIUM</h2>
            </div>
            <div className="mb-6 pb-6 border-b border-[var(--border)]">
              <div className="flex flex-col gap-1 mb-2">
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-extrabold text-[var(--foreground)]">€59</span>
                  <span className="text-sm text-[var(--text-muted)] pb-1">/ μήνα</span>
                </div>
                <div className="text-sm font-bold text-[var(--text-muted)] mt-1">
                  ή €590 / χρόνο
                </div>
              </div>
              <p className="text-sm text-[var(--text-muted)] mt-3">Για μεγάλους Ναούς / Προσκυνήματα</p>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex gap-3 text-sm font-bold text-[var(--brand)] leading-tight mb-2">
                <Zap className="w-4 h-4 flex-shrink-0 mt-0.5"/> Όλα του Basic +
              </li>
              {[
                'Πολλαπλοί Ναοί στο ίδιο account',
                'SMS Ειδοποιήσεις (Χρεώνεται ξεχωριστά)',
                'Αυτόματη Εξαγωγή στη Μητρόπολη',
                'Προτεραιότητα υποστήριξης 24/7',
                'Προσαρμοσμένα Reports'
              ].map(item => (
                <li key={item} className="flex gap-3 text-sm text-[var(--text-secondary)] leading-tight">
                  <CheckCircle2 className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0 mt-0.5"/> {item}
                </li>
              ))}
            </ul>
            <Link href="mailto:info@kanonas.app" className="w-full">
              <button className="btn bg-zinc-900 border-0 hover:bg-zinc-800 text-white w-full text-sm py-2.5">
                Επικοινωνήστε μαζί μας
              </button>
            </Link>
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
      {/* Shortened footer for brevity, or full footer like mapping */}
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
