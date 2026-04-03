'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Users, FileText, Banknote, ShieldCheck, Activity, Calendar, ArrowRight, CheckCircle2, Cloud, Lock, Mail } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative min-h-[100dvh] w-full max-w-[100vw] bg-[#FDFBF7] font-sans overflow-x-hidden selection:bg-[#c3a165]/30 selection:text-[#59161a]">
      {/* Dynamic Style block for custom keyframes and blobs */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        @keyframes float-delayed {
          0% { transform: translateY(0px); }
          50% { transform: translateY(20px); }
          100% { transform: translateY(0px); }
        }
        .animate-blob { animation: blob 12s infinite cubic-bezier(0.4, 0, 0.2, 1); }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 8s ease-in-out infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        .glass-premium {
          background: rgba(255, 255, 255, 0.65);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.8);
          box-shadow: 0 8px 32px rgba(89, 22, 26, 0.05);
        }
        .text-gradient {
          background: linear-gradient(135deg, #59161a 0%, #a63a41 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .text-gradient-gold {
          background: linear-gradient(135deg, #c3a165 0%, #e0bc7b 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}} />

      {/* --- PREMIUM NAVBAR --- */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-sm py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-sm border border-white/50 group-hover:shadow-md transition-all">
              <Image src="/logo.png" alt="Κανόνας" fill className="object-cover" />
            </div>
            <span className="font-heading font-black text-2xl tracking-widest text-[#2b1f1a]">ΔΕΛΤΟΣ</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-10">
            <Link href="#features" className="text-sm font-semibold text-[#736760] hover:text-[#59161a] transition-colors">Δυνατότητες</Link>
            <Link href="#pricing" className="text-sm font-semibold text-[#736760] hover:text-[#59161a] transition-colors">Τιμοκατάλογος</Link>
            <Link href="/contact" className="text-sm font-semibold text-[#736760] hover:text-[#59161a] transition-colors">Επικοινωνία</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden sm:block">
              <span className="text-sm font-bold text-[#59161a] hover:opacity-80 transition-opacity">Είσοδος</span>
            </Link>
            <Link href="/contact">
              <button className="relative overflow-hidden group rounded-full px-6 py-2.5 bg-gradient-to-tr from-[#59161a] to-[#7b2126] text-white text-sm font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
                <span className="relative z-10 flex items-center gap-2">
                  Ξεκινήστε τώρα <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
                {/* Button shine effect */}
                <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-40 pb-32 lg:pt-56 lg:pb-40 overflow-hidden">
        {/* Animated Background Blobs */}
        <div className="absolute top-0 -left-40 w-96 h-96 bg-[#c3a165]/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-40 w-96 h-96 bg-[#59161a]/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-40 left-20 w-96 h-96 bg-[#e0bc7b]/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center">
            
            {/* Left Copy */}
            <div className="max-w-xl animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#c3a165]/30 bg-[#c3a165]/5 mb-8 shadow-sm">
                <ShieldCheck className="w-4 h-4 text-[#c3a165]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#736760]">Cloud Multi-Tenant SaaS</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-heading font-black leading-[1.1] mb-6 text-[#2b1f1a]">
                Απόλυτη Τάξη. <br />
                <span className="text-gradient">Ψηφιακό Νέφος.</span>
              </h1>
              
              <p className="text-lg text-[#736760] mb-10 leading-relaxed font-medium">
                Η προηγμένη πλατφόρμα <strong>Δέλτος</strong> φέρνει τον Ιερό σας Ναό στη νέα εποχή. 
                Μητρώο πιστών, αυτόματη έκδοση πιστοποιητικών, πλήρες λογιστήριο και διαχείριση ημερολογίου, 
                από οποιαδήποτε συσκευή, με απαράμιλλη ασφάλεια.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-5">
                <Link href="/contact">
                  <button className="w-full sm:w-auto px-8 py-4 bg-[#2b1f1a] hover:bg-black text-white rounded-xl font-bold text-base shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 flex items-center justify-center gap-3">
                    Δωρεάν Επίδειξη <ArrowRight className="w-5 h-5" />
                  </button>
                </Link>
                <Link href="#features">
                  <button className="w-full sm:w-auto px-8 py-4 bg-white/50 backdrop-blur-md border border-[#c3a165]/30 hover:bg-white text-[#59161a] rounded-xl font-bold text-base shadow-sm hover:shadow-md transition-all flex items-center justify-center">
                    Δείτε τα χαρακτηριστικά
                  </button>
                </Link>
              </div>

              <div className="mt-12 flex items-center gap-6 text-sm font-semibold text-[#736760]">
                <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> Χωρίς Εγκατάσταση</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> Απόλυτη Κρυπτογράφηση</div>
              </div>
            </div>

            {/* Right Visual Floating Element */}
            <div className="relative hidden lg:block h-[600px] animate-in fade-in zoom-in duration-1000 delay-300 fill-mode-both">
               {/* Main Dashboard Card */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] glass-premium rounded-2xl p-4 shadow-2xl rotate-[-2deg] animate-float">
                  <Image src="/logo.png" width={40} height={40} alt="Κανόνας" className="absolute -top-5 -left-5 rounded-xl shadow-lg border border-white" />
                  <div className="flex items-center justify-between mb-4 border-b border-black/5 pb-2">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                      <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                    </div>
                    <div className="text-xs font-mono text-muted-foreground bg-white px-2 py-1 rounded">kanonas.gr/admin</div>
                  </div>
                  {/* Fake UI */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-white/60 h-24 rounded-lg border border-white/40 p-3 shadow-sm">
                       <div className="flex justify-between items-center mb-2"><Users className="w-5 h-5 text-[#c3a165]" /><span className="text-xs font-bold">Μητρώο</span></div>
                       <div className="h-2 w-1/2 bg-[#59161a]/10 rounded mb-2"></div><div className="h-6 w-3/4 bg-[#59161a] rounded"></div>
                    </div>
                    <div className="bg-white/60 h-24 rounded-lg border border-white/40 p-3 shadow-sm">
                       <div className="flex justify-between items-center mb-2"><FileText className="w-5 h-5 text-[#c3a165]" /><span className="text-xs font-bold">Πιστοποιητικά</span></div>
                       <div className="h-2 w-1/2 bg-[#59161a]/10 rounded mb-2"></div><div className="h-6 w-3/4 bg-[#59161a] rounded"></div>
                    </div>
                    <div className="bg-white/60 h-24 rounded-lg border border-white/40 p-3 shadow-sm">
                       <div className="flex justify-between items-center mb-2"><Banknote className="w-5 h-5 text-[#c3a165]" /><span className="text-xs font-bold">Έσοδα</span></div>
                       <div className="h-2 w-1/2 bg-[#59161a]/10 rounded mb-2"></div><div className="h-6 w-3/4 bg-[#59161a] rounded"></div>
                    </div>
                  </div>
                  <div className="bg-white/60 h-40 rounded-lg border border-white/40 p-4 shadow-sm relative overflow-hidden">
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[var(--byz-burgundy)]/5 to-transparent"></div>
                    <div className="flex gap-2 items-end h-full pt-4">
                      <div className="w-1/6 bg-[#c3a165] rounded-t-sm h-1/3"></div>
                      <div className="w-1/6 bg-[#c3a165] rounded-t-sm h-2/3"></div>
                      <div className="w-1/6 bg-[#59161a] rounded-t-sm h-[90%] shadow-[0_0_15px_rgba(89,22,26,0.3)]"></div>
                      <div className="w-1/6 bg-[#c3a165] rounded-t-sm h-1/2"></div>
                      <div className="w-1/6 bg-[#c3a165] rounded-t-sm h-[70%]"></div>
                      <div className="w-1/6 bg-[#c3a165] rounded-t-sm h-1/4"></div>
                    </div>
                  </div>
               </div>
               
               {/* Floating Badges */}
               <div className="absolute top-1/4 right-0 glass-premium px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-float-delayed z-20">
                 <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center"><CheckCircle2 className="text-emerald-600 w-5 h-5" /></div>
                 <div>
                   <div className="text-sm font-bold text-[#2b1f1a]">Πιστοποιητικό Γάμου</div>
                   <div className="text-xs text-[#736760]">Εκδόθηκε αυτόματα</div>
                 </div>
               </div>
               
               <div className="absolute bottom-1/4 -left-10 glass-premium px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-float-delayed z-20" style={{ animationDelay: '2s' }}>
                 <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center"><Cloud className="text-blue-600 w-5 h-5" /></div>
                 <div>
                   <div className="text-sm font-bold text-[#2b1f1a]">Cloud Backup</div>
                   <div className="text-xs text-[#736760]">100% ασφαλές</div>
                 </div>
               </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section id="features" className="py-32 bg-[#2b1f1a] relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-sm font-bold tracking-widest text-[#c3a165] uppercase mb-4">Επαγγελματικα Εργαλεια</h2>
            <h3 className="text-4xl md:text-5xl font-heading font-bold text-white mb-6">Όλα όσα χρειάζεται<br/>η σύγχρονη ενορία</h3>
            <p className="text-[#a89d96] text-lg">Μια προηγμένη σουίτα εργαλείων κρυμμένη πίσω από ένα απολύτως φιλικό και απλό περιβάλλον χρήσης (UI).</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeaturePremiumCard 
              icon={<Users />}
              title="C.R.M. Ενοριτών"
              desc="Διαχειριστείτε τις καρτέλες των πιστών, το ιστορικό μυστηρίων, έγγραφα (Vault) και τακτικές συνδρομές."
            />
            <FeaturePremiumCard 
              icon={<FileText />}
              title="Αυτοματισμός Εγγράφων"
              desc="Παράγετε εντυπωσιακά PDF (Πιστοποιητικά, Βεβαιώσεις, Άδειες Γάμου) με ένα κλικ. Το σύστημα αναλαμβάνει την Ελληνική κλίση ονομάτων."
            />
            <FeaturePremiumCard 
              icon={<Banknote />}
              title="Οικονομική Εποπτεία"
              desc="Βιβλίο Εσόδων-Εξόδων, παρακολούθηση λογαριασμών και αυτόματη δημιουργία Ισολογισμού με βάση τις αποδείξεις σας."
            />
            <FeaturePremiumCard 
              icon={<Calendar />}
              title="Ημερολόγιο & Web Widget"
              desc="Προσφέρετε στους ενορίτες σας ένα όμορφο σύστημα online κρατήσεων και συγχρονίστε το αυτόματα με το Google Calendar του Ναού."
            />
            <FeaturePremiumCard 
              icon={<Lock />}
              title="Multi-Tenant Ασφάλεια"
              desc="Κάθε Ναός είναι ένα κλειστό οικοσύστημα (tenant). Μόνο πιστοποιημένοι κληρικοί και γραμματείς έχουν πρόσβαση."
            />
            <FeaturePremiumCard 
              icon={<Activity />}
              title="Ψηφιακό Πρωτόκολλο"
              desc="Καταγράψτε την αλληλογραφία, εγκυκλίους και έγγραφα Ιεράς Μητροπόλεως εύκολα, με αυτόματη αρίθμηση."
            />
          </div>
        </div>
      </section>

      {/* --- PRICING SECTION --- */}
      <section id="pricing" className="py-32 bg-[#FDFBF7]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20 animate-in fade-in slide-in-from-bottom-8">
            <h2 className="text-4xl md:text-5xl font-heading font-black text-[#2b1f1a] mb-6">Διαφανής Τιμοκατάλογος</h2>
            <p className="text-lg text-[#736760] max-w-2xl mx-auto">Επενδύστε στην οργάνωση του Ναού σας. Επιλέξτε το πακέτο που ανταποκρίνεται στο μέγεθος της Ενορίας σας.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto items-center">
            
            {/* Standard Tier */}
            <div className="glass-premium p-10 rounded-3xl relative overflow-hidden transition-all hover:shadow-2xl hover:-translate-y-2">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#c3a165]/10 rounded-bl-full -z-10"></div>
              <h3 className="text-2xl font-bold text-[#2b1f1a] mb-2 font-heading">Basic Ενορία</h3>
              <p className="text-[#736760] mb-8 text-sm border-b border-[#c3a165]/20 pb-8">Η βάση για την ψηφιακή μετάβαση μικρών Ναών.</p>
              <div className="flex items-end gap-2 mb-8">
                <span className="text-5xl font-black text-gradient">29€</span><span className="text-[#736760] font-medium mb-1">/ μήνα</span>
              </div>
              <ul className="space-y-4 mb-10">
                <li className="flex items-center gap-3 text-sm font-semibold text-[#2b1f1a]"><CheckCircle2 className="w-5 h-5 text-[#c3a165]" /> Έως 500 Καρτέλες Ενοριτών</li>
                <li className="flex items-center gap-3 text-sm font-semibold text-[#2b1f1a]"><CheckCircle2 className="w-5 h-5 text-[#c3a165]" /> Ηλεκτρονικό Πρωτόκολλο</li>
                <li className="flex items-center gap-3 text-sm font-semibold text-[#2b1f1a]"><CheckCircle2 className="w-5 h-5 text-[#c3a165]" /> Διαχείριση Συσσιτίου (CRM)</li>
                <li className="flex items-center gap-3 text-sm font-semibold text-[#736760]/50 line-through"><CheckCircle2 className="w-5 h-5 opacity-40" /> Αυτόματη Έκδοση PDF Μυστηρίων</li>
              </ul>
              <Link href="/contact" className="block">
                <button className="w-full py-4 rounded-xl border-2 border-[#59161a] text-[#59161a] font-bold hover:bg-[#59161a] hover:text-white transition-colors">Επικοινωνία</button>
              </Link>
            </div>

            {/* Premium Tier */}
            <div className="bg-[#59161a] p-10 rounded-3xl relative overflow-hidden shadow-[0_20px_50px_rgba(89,22,26,0.3)] transform md:scale-105 z-10 transition-all hover:-translate-y-2">
              <div className="absolute -top-10 -right-10 w-48 h-48 bg-[#c3a165] blur-3xl opacity-20 rounded-full"></div>
              <div className="absolute top-5 right-5 bg-gradient-to-r from-[#c3a165] to-[#e0bc7b] text-[#1a1008] text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                Προτεινομενο
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-2 font-heading">Premium Ναός</h3>
              <p className="text-white/60 mb-8 text-sm border-b border-white/10 pb-8">Πλήρης σουίτα αυτοματισμών, ιδανική για μεγάλους Ναούς.</p>
              <div className="flex items-end gap-2 mb-8">
                <span className="text-5xl font-black text-white">49€</span><span className="text-white/50 font-medium mb-1">/ μήνα</span>
              </div>
              <ul className="space-y-4 mb-10">
                <li className="flex items-center gap-3 text-sm font-semibold text-white"><CheckCircle2 className="w-5 h-5 text-[#c3a165]" /> Απεριόριστο C.R.M. Ενοριτών</li>
                <li className="flex items-center gap-3 text-sm font-semibold text-white"><CheckCircle2 className="w-5 h-5 text-[#c3a165]" /> <strong>Smart PDF:</strong> Άδειες Γάμων, Βαπτίσεων</li>
                <li className="flex items-center gap-3 text-sm font-semibold text-white"><CheckCircle2 className="w-5 h-5 text-[#c3a165]" /> Booking Widget Κρατήσεων</li>
                <li className="flex items-center gap-3 text-sm font-semibold text-white"><CheckCircle2 className="w-5 h-5 text-[#c3a165]" /> Vault (Αρχείο Ψηφιακών Εγγράφων)</li>
                <li className="flex items-center gap-3 text-sm font-semibold text-white"><CheckCircle2 className="w-5 h-5 text-[#c3a165]" /> Οικονομικό Module & Ισολογισμοί</li>
              </ul>
              
              <form action="/api/checkout" method="POST">
                <input type="hidden" name="lookup_key" value="premium_monthly" />
                <button type="submit" className="w-full py-4 rounded-xl bg-gradient-to-r from-[#c3a165] to-[#e0bc7b] text-[#1a1008] font-black shadow-[0_5px_20px_rgba(195,161,101,0.4)] hover:shadow-[0_8px_30px_rgba(195,161,101,0.6)] transition-all hover:-translate-y-1">
                  Ξεκινήστε τώρα
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-[#1a1008] text-white/50 py-16 border-t border-[#c3a165]/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
          
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <Image src="/logo.png" alt="Κανόνας" width={40} height={40} className="w-10 h-10 brightness-0 invert opacity-90" />
              <span className="font-heading font-black text-2xl tracking-widest text-white/90">ΔΕΛΤΟΣ</span>
            </Link>
            <p className="text-sm leading-relaxed max-w-sm mb-6">
              Το Σύγχρονο Λογισμικό Οργάνωσης & Διοίκησης Ιερών Ναών και Μητροπόλεων. 
              Ασφαλές, Γρήγορο, Cloud-Based.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-4">Πλοήγηση</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="#features" className="hover:text-white transition-colors">Δυνατότητες</Link></li>
              <li><Link href="#pricing" className="hover:text-white transition-colors">Συνδρομές</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Επικοινωνία</Link></li>
              <li><Link href="/login" className="hover:text-[#c3a165] font-semibold transition-colors">Είσοδος (Login)</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-4">Επικοινωνία</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-[#c3a165]" /> contact@kanonas.gr</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#c3a165]" /> Αθήνα, Ελλάδα</li>
            </ul>
          </div>
          
        </div>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <p>© {new Date().getFullYear()} ΔΕΛΤΟΣ Software. Με επιφύλαξη παντός δικαιώματος.</p>
          <div className="flex gap-6">
             <Link href="#" className="hover:text-white">Όροι Σύμβασης</Link>
             <Link href="#" className="hover:text-white">Πολιτική Απορρήτου (GDPR)</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Private Component
function FeaturePremiumCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="group p-8 rounded-3xl bg-[#362a26] border border-white/5 hover:bg-[#3f312c] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#c3a165] to-[#e0bc7b] text-[#1a1008] flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
        <div className="[&>svg]:w-6 [&>svg]:h-6">
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-bold text-white mb-3 font-heading">{title}</h3>
      <p className="text-[#a89d96] text-sm leading-relaxed">{desc}</p>
    </div>
  )
}
