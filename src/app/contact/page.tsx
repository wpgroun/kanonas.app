'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Mail, Phone, MapPin, ArrowLeft, Send, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useEffect } from 'react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-[100dvh] flex flex-col w-full max-w-[100vw] overflow-x-hidden bg-[#FDFBF7]"
      style={{ fontFamily: "'Inter', sans-serif" }}>
      <style dangerouslySetInnerHTML={{__html: `
        .contact-input {
          width: 100%;
          padding: 0.85rem 1rem;
          border: 1.5px solid rgba(195,161,101,0.25);
          background: rgba(255,255,255,0.6);
          border-radius: 10px;
          font-size: 0.95rem;
          color: #2b1f1a;
          outline: none;
          transition: all 0.2s;
        }
        .contact-input:focus {
          background: #fff;
          border-color: #c3a165;
          box-shadow: 0 0 0 3px rgba(195,161,101,0.12);
        }
        .contact-input::placeholder { color: #b0a09a; }
      `}} />

      {/* SAME NAVBAR AS LANDING PAGE */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-sm py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-sm border border-white/50 group-hover:shadow-md transition-all">
              <Image src="/logo.png" alt="Deltos" fill className="object-cover" />
            </div>
            <span style={{fontFamily:"'Playfair Display', serif"}} className="font-black text-2xl tracking-widest text-[#2b1f1a]">ΔΕΛΤΟΣ</span>
          </Link>

          <div className="hidden md:flex items-center gap-10">
            <Link href="/#features" className="text-sm font-semibold text-[#736760] hover:text-[#59161a] transition-colors">Δυνατότητες</Link>
            <Link href="/#pricing" className="text-sm font-semibold text-[#736760] hover:text-[#59161a] transition-colors">Τιμοκατάλογος</Link>
            <Link href="/contact" className="text-sm font-semibold text-[#59161a] hover:text-[#59161a] transition-colors border-b-2 border-[#c3a165] pb-0.5">Επικοινωνία</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden sm:block">
              <span className="text-sm font-bold text-[#59161a] hover:opacity-80 transition-opacity">Είσοδος</span>
            </Link>
            <Link href="/#pricing">
              <button className="rounded-full px-6 py-2.5 bg-gradient-to-tr from-[#59161a] to-[#7b2126] text-white text-sm font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
                Δείτε Τιμές
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Banner */}
      <section className="bg-[#2b1f1a] pt-36 pb-16 relative overflow-hidden">
        <div className="absolute -top-20 right-0 w-[400px] h-[400px] bg-[#c3a165]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-[#a89d96] hover:text-[#c3a165] text-sm font-semibold mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Αρχική
          </Link>
          <h1 style={{fontFamily:"'Playfair Display', serif"}} className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight">
            Επικοινωνήστε <br className="hidden md:block" />
            <span style={{background:'linear-gradient(135deg,#c3a165,#e0bc7b)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent'}}>μαζί μας</span>
          </h1>
          <p className="text-[#a89d96] text-lg max-w-xl">
            Ενδιαφέρεστε να εντάξετε την Ενορία ή τη Μητρόπολή σας; Η ομάδα μας είναι διαθέσιμη για κάθε ερώτηση.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="flex-1 py-16 px-4 sm:px-6 bg-[#FDFBF7] relative">
        <div className="absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-[#c3a165] opacity-[0.04] rounded-full blur-3xl -z-10 pointer-events-none"></div>
        
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">

          {/* LEFT: Contact Info */}
          <div className="lg:col-span-2 space-y-8 pt-2">
            <div>
              <p className="text-sm font-bold tracking-widest text-[#c3a165] uppercase mb-2">Στοιχεία Επικοινωνίας</p>
              <h2 style={{fontFamily:"'Playfair Display', serif"}} className="text-2xl font-bold text-[#2b1f1a]">Είμαστε εδώ για εσάς</h2>
            </div>

            <div className="space-y-5">
              <ContactInfoRow
                icon={<Mail className="w-5 h-5 text-[#c3a165]" />}
                label="Email"
                value="contact@deltos.gr"
                iconBg="bg-[#c3a165]/10"
              />
              <ContactInfoRow
                icon={<Phone className="w-5 h-5 text-[#59161a]" />}
                label="Τηλέφωνο"
                value="+30 210 1234 567"
                sub="Δευ–Παρ, 09:00–17:00"
                iconBg="bg-[#59161a]/10"
              />
              <ContactInfoRow
                icon={<MapPin className="w-5 h-5 text-[#736760]" />}
                label="Έδρα"
                value="Αθήνα, Ελλάδα"
                iconBg="bg-[#736760]/10"
              />
            </div>

            {/* Trust Signals */}
            <div className="pt-6 border-t border-[#c3a165]/15 space-y-3">
              <div className="flex items-center gap-3 text-sm text-[#736760] font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                Προστασία δεδομένων σύμφωνα με GDPR
              </div>
              <div className="flex items-center gap-3 text-sm text-[#736760] font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                Απάντηση εντός 24 ωρών εργάσιμης ημέρας
              </div>
            </div>
          </div>

          {/* RIGHT: Form */}
          <div className="lg:col-span-3">
            <div className="bg-white/70 backdrop-blur-md border border-[#c3a165]/20 rounded-3xl shadow-[0_8px_30px_rgba(89,22,26,0.06)] p-8 md:p-10">
              {submitted ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                  </div>
                  <h3 style={{fontFamily:"'Playfair Display', serif"}} className="text-2xl font-bold text-[#2b1f1a] mb-2">Σας ευχαριστούμε!</h3>
                  <p className="text-[#736760]">Το μήνυμά σας ελήφθη. Θα επικοινωνήσουμε μαζί σας εντός 24 ωρών.</p>
                  <Link href="/">
                    <button className="mt-8 px-6 py-3 bg-[#59161a] text-white rounded-xl font-bold hover:bg-[#7b2126] transition-colors">
                      Επιστροφή στην Αρχική
                    </button>
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <h3 style={{fontFamily:"'Playfair Display', serif"}} className="text-xl font-bold text-[#2b1f1a] mb-6">Φόρμα Επικοινωνίας</h3>

                  <div>
                    <label className="text-sm font-semibold text-[#59161a] mb-1.5 block">Ονοματεπώνυμο / Ιδιότητα</label>
                    <input type="text" required placeholder="π.χ. Πρωτοπρεσβύτερος Ιωάννης..." className="contact-input" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-[#59161a] mb-1.5 block">Email</label>
                      <input type="email" required placeholder="email@example.com" className="contact-input" />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-[#59161a] mb-1.5 block">Τηλέφωνο</label>
                      <input type="text" required placeholder="69..." className="contact-input" />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-[#59161a] mb-1.5 block">Ιερός Ναός / Ι. Μητρόπολη</label>
                    <input type="text" required placeholder="Ι.Ν. Αγίου..." className="contact-input" />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-[#59161a] mb-1.5 block">Πώς μπορούμε να βοηθήσουμε;</label>
                    <textarea required rows={4} placeholder="Γράψτε μας τις ανάγκες του Ναού σας..." className="contact-input resize-none"></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 rounded-xl font-black text-white flex items-center justify-center gap-2 mt-2 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                    style={{ background: 'linear-gradient(135deg, #59161a, #7b2126)' }}
                  >
                    <Send className="w-5 h-5" /> Αποστολή Μηνύματος
                  </button>

                  <p className="text-xs text-center text-[#a89d96] pt-2">
                    Τα δεδομένα σας προστατεύονται και δεν κοινοποιούνται σε τρίτους. (GDPR)
                  </p>
                </form>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* Footer strip */}
      <footer className="bg-[#1a1008] text-white/40 py-8 border-t border-[#c3a165]/10 text-center text-xs px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-3">
          <p>© {new Date().getFullYear()} ΔΕΛΤΟΣ Software. Με επιφύλαξη παντός δικαιώματος.</p>
          <div className="flex gap-6">
            <Link href="/#features" className="hover:text-white transition-colors">Δυνατότητες</Link>
            <Link href="/#pricing" className="hover:text-white transition-colors">Τιμοκατάλογος</Link>
            <Link href="/login" className="hover:text-[#c3a165] transition-colors">Client Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ContactInfoRow({ icon, label, value, sub, iconBg }: { icon: React.ReactNode; label: string; value: string; sub?: string; iconBg: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <div className="text-xs font-bold text-[#a89d96] uppercase tracking-wider mb-0.5">{label}</div>
        <div className="font-semibold text-[#2b1f1a]">{value}</div>
        {sub && <div className="text-xs text-[#a89d96]">{sub}</div>}
      </div>
    </div>
  );
}
