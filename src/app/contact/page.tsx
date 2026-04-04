'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Send, CheckCircle2, ArrowRight } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">

      {/* ─── NAVBAR ─── */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-lg border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#4F46E5] flex items-center justify-center">
              <span className="text-white font-extrabold text-sm">Κ</span>
            </div>
            <span className="font-bold text-[var(--foreground)] text-lg tracking-tight">Κανόνας</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/#features" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors">Δυνατότητες</Link>
            <Link href="/#pricing" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors">Συνδρομές</Link>
            <Link href="/contact" className="text-sm font-semibold text-[var(--brand)]">Επικοινωνία</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors hidden sm:block">Είσοδος</Link>
            <Link href="/#pricing">
              <button className="btn btn-primary btn-sm">Συνδρομές</button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="pt-32 pb-12 bg-[var(--background)]">
        <div className="max-w-6xl mx-auto px-6">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--brand)] transition-colors mb-6">
            ← Αρχική
          </Link>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--foreground)] tracking-tight mb-3">
            Επικοινωνήστε μαζί μας
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-xl">
            Ενδιαφέρεστε να εντάξετε τον Ναό σας; Η ομάδα μας είναι διαθέσιμη για κάθε ερώτηση.
          </p>
        </div>
      </section>

      {/* ─── CONTENT ─── */}
      <section className="flex-1 py-12 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-12">

          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-4">
              <ContactRow
                icon={<Mail className="w-4 h-4 text-[var(--brand)]" />}
                label="Email"
                value="info@kanonas.app"
              />
              <ContactRow
                icon={<Phone className="w-4 h-4 text-[var(--brand)]" />}
                label="Τηλέφωνο"
                value="231 231 1359"
                sub="Δευ–Παρ, 09:00–17:00"
              />
              <ContactRow
                icon={<MapPin className="w-4 h-4 text-[var(--brand)]" />}
                label="Έδρα"
                value="Θεμιστοκλή Σοφούλη 57, 55131, Καλαμαριά"
              />
            </div>
            <div className="pt-5 border-t border-[var(--border)] space-y-2.5">
              <p className="text-xs text-[var(--text-muted)] flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[var(--success)]" />
                Προστασία δεδομένων GDPR
              </p>
              <p className="text-xs text-[var(--text-muted)] flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[var(--success)]" />
                Απάντηση εντός 24 ωρών
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            <div className="card p-6 md:p-8">
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-[var(--success-light)] flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-[var(--success)]" />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">Σας ευχαριστούμε!</h3>
                  <p className="text-sm text-[var(--text-muted)] mb-6">Θα επικοινωνήσουμε εντός 24 ωρών.</p>
                  <Link href="/">
                    <button className="btn btn-primary">Επιστροφή στην Αρχική</button>
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h3 className="text-lg font-bold text-[var(--foreground)] mb-2">Φόρμα Επικοινωνίας</h3>

                  <div>
                    <label className="text-sm font-medium text-[var(--foreground)] mb-1.5 block">Ονοματεπώνυμο / Ιδιότητα</label>
                    <input type="text" required placeholder="π.χ. π. Ιωάννης Παπαδόπουλος" className="input" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-[var(--foreground)] mb-1.5 block">Email</label>
                      <input type="email" required placeholder="email@example.com" className="input" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[var(--foreground)] mb-1.5 block">Τηλέφωνο</label>
                      <input type="text" required placeholder="69..." className="input" />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[var(--foreground)] mb-1.5 block">Ιερός Ναός / Μητρόπολη</label>
                    <input type="text" required placeholder="Ι.Ν. Αγίου..." className="input" />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[var(--foreground)] mb-1.5 block">Μήνυμα</label>
                    <textarea required rows={4} placeholder="Πώς μπορούμε να βοηθήσουμε;" className="input resize-none" />
                  </div>

                  <button type="submit" className="btn btn-primary w-full">
                    <Send className="w-4 h-4" /> Αποστολή
                  </button>

                  <p className="text-xs text-center text-[var(--text-muted)]">
                    Τα δεδομένα σας προστατεύονται σύμφωνα με τον Κανονισμό GDPR.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[var(--foreground)] text-white/40 py-8 text-center text-xs px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-3">
          <p>© {new Date().getFullYear()} Kanonas Software.</p>
          <div className="flex gap-6">
            <Link href="/#features" className="hover:text-white transition-colors">Δυνατότητες</Link>
            <Link href="/#pricing" className="hover:text-white transition-colors">Συνδρομές</Link>
            <Link href="/login" className="hover:text-[var(--brand)] transition-colors">Είσοδος</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ContactRow({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-lg bg-[var(--brand-light)] flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <div className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-0.5">{label}</div>
        <div className="text-sm font-semibold text-[var(--foreground)]">{value}</div>
        {sub && <div className="text-xs text-[var(--text-muted)]">{sub}</div>}
      </div>
    </div>
  );
}
