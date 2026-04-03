'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'motion/react';
import { ShieldCheck, ArrowRight, CheckCircle2, Lock, Mail } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import BentoFeatures from '@/components/home/BentoFeatures';

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  
  // Parallax effects
  const { scrollYProgress } = useScroll();
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative min-h-[100dvh] w-full max-w-[100vw] bg-[#FDFBF7] font-sans overflow-x-hidden selection:bg-[#c3a165]/30 selection:text-[#59161a]">
      {/* Dynamic Style block for specific utility classes not in Tailwind config natively or for simplicity */}
      <style dangerouslySetInnerHTML={{__html: `
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
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-100%); }
        }
      `}} />

      {/* --- PREMIUM NAVBAR --- */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-white/80 backdrop-blur-xl border-b border-black/5 shadow-sm py-4' : 'bg-transparent py-5 lg:py-6'}`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 lg:w-12 lg:h-12 rounded-xl overflow-hidden shadow-sm border border-white/80 group-hover:shadow-md transition-all">
              <Image src="/logo.png" alt="ΔΕΛΤΟΣ" fill className="object-cover" />
            </div>
            <span className="font-heading font-black text-xl lg:text-2xl tracking-widest text-[#2b1f1a]">ΔΕΛΤΟΣ</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-10">
            <Link href="#features" className="text-sm font-semibold text-[#736760] hover:text-[#59161a] transition-colors">Δυνατότητες</Link>
            <Link href="#pricing" className="text-sm font-semibold text-[#736760] hover:text-[#59161a] transition-colors">Τιμοκατάλογος</Link>
            <Link href="/contact" className="text-sm font-semibold text-[#736760] hover:text-[#59161a] transition-colors">Επικοινωνία</Link>
          </div>

          <div className="flex items-center gap-3 lg:gap-4">
            <Link href="/login" className="hidden sm:block">
              <span className="text-sm font-bold text-[#59161a] hover:opacity-80 transition-opacity">Είσοδος</span>
            </Link>
            <Link href="/contact">
              <button className="relative overflow-hidden group rounded-full px-5 py-2.5 lg:px-6 lg:py-2.5 bg-[#2b1f1a] text-white text-sm font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
                <span className="relative z-10 flex items-center gap-2">
                  Δοκιμή <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
              </button>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-36 pb-24 lg:pt-52 lg:pb-32 overflow-hidden landscape:min-h-screen flex items-center justify-center">
        {/* Animated Background blobs (Using Motion instead of CSS keyframes) */}
        <motion.div 
          animate={{ x: [0, 30, -20, 0], y: [0, -50, 20, 0], scale: [1, 1.1, 0.9, 1] }} 
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 -left-40 w-96 h-96 bg-[#c3a165]/20 rounded-full mix-blend-multiply blur-3xl opacity-70"
        ></motion.div>
        <motion.div 
          animate={{ x: [0, -40, 20, 0], y: [0, 40, -10, 0], scale: [1, 1.2, 0.8, 1] }} 
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-20 -right-20 lg:-right-40 w-96 h-96 bg-[#59161a]/10 rounded-full mix-blend-multiply blur-3xl opacity-70"
        ></motion.div>
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Copy */}
            <motion.div 
               style={{ opacity: opacityHero }}
               initial={{ opacity: 0, x: -50 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ duration: 0.8, ease: "easeOut" }}
               className="lg:col-span-5 max-w-xl mx-auto lg:mx-0 text-center lg:text-left"
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#c3a165]/30 bg-[#c3a165]/10 mb-8 shadow-sm"
              >
                <ShieldCheck className="w-4 h-4 text-[#c3a165]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#736760]">Cloud ERP Ναων</span>
              </motion.div>
              
              <h1 className="text-5xl lg:text-7xl font-heading font-black leading-[1.1] mb-6 text-[#2b1f1a]">
                Απόλυτη Τάξη. <br className="hidden lg:block"/>
                <span className="text-gradient">Ψηφιακό Νέφος.</span>
              </h1>
              
              <p className="text-lg text-[#736760] mb-10 leading-relaxed font-medium">
                Η προηγμένη πλατφόρμα <strong>Δέλτος</strong> φέρνει τον Ιερό σας Ναό στη νέα εποχή. 
                Μητρώο, πιστοποιητικά και λογιστήριο με ένα κλικ.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/contact" className="w-full sm:w-auto">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full px-8 py-4 bg-[#2b1f1a] hover:bg-black text-white rounded-xl font-bold text-base shadow-[0_10px_30px_rgba(43,31,26,0.3)] transition-all flex items-center justify-center gap-3"
                  >
                    Δωρεάν Επίδειξη <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </Link>
                <Link href="#features" className="w-full sm:w-auto">
                  <motion.button 
                    whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.9)" }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full px-8 py-4 glass-premium text-[#59161a] rounded-xl font-bold text-base shadow-sm transition-all flex items-center justify-center"
                  >
                    Χαρακτηριστικά
                  </motion.button>
                </Link>
              </div>

              <div className="mt-10 flex items-center justify-center lg:justify-start gap-6 text-sm font-semibold text-[#736760]">
                <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> Web-Based</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> ISO 27001</div>
              </div>
            </motion.div>

            {/* Right Interactive Web Mockup */}
            <motion.div 
               initial={{ opacity: 0, y: 100, rotateX: 10 }}
               animate={{ opacity: 1, y: 0, rotateX: 0 }}
               transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
               style={{ y: yBg }}
               className="lg:col-span-7 relative hidden lg:block perspective-1000"
            >
               <div className="relative w-full aspect-[16/10] bg-[#e5dfd9] p-2 rounded-[2rem] shadow-2xl overflow-hidden border border-[#d5cec6] transform -rotate-2 hover:rotate-0 transition-transform duration-700 ease-out">
                 {/* Browser Chrome */}
                 <div className="absolute top-0 inset-x-0 h-10 bg-[#f4f1ee] border-b border-[#e5dfd9] flex items-center px-4 gap-2 z-20">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                    <div className="ml-4 flex-1 h-6 bg-white rounded-md border border-[#e5dfd9] flex items-center justify-center text-[10px] text-gray-400 font-mono font-medium">
                      <Lock className="w-3 h-3 inline mr-1 text-emerald-500" /> kanonas.gr/admin
                    </div>
                 </div>
                 {/* App UI Visual */}
                 <div className="absolute top-10 inset-0 bg-[#f8f6f3] flex z-10">
                    {/* Sidebar skeleton */}
                    <div className="w-1/4 h-full bg-[#362a26] p-4 flex flex-col gap-3 border-r border-[#4f3d37]">
                      <div className="w-full text-center py-2 mb-4 border-b border-[#4f3d37]"><span className="text-white/80 font-heading font-bold">ΔΕΛΤΟΣ</span></div>
                      {[1,2,3,4,5].map(i => (
                        <div key={i} className="w-full h-8 bg-white/5 rounded-md"></div>
                      ))}
                    </div>
                    {/* Main content skeleton */}
                    <div className="flex-1 p-6 flex flex-col gap-6">
                      <div className="flex justify-between items-center">
                        <div className="w-1/3 h-8 bg-black/5 rounded-md"></div>
                        <div className="w-10 h-10 bg-black/5 rounded-full"></div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        {[1,2,3].map(i => (
                          <motion.div 
                            key={i} 
                            whileHover={{ y: -5 }}
                            className="bg-white rounded-xl shadow-sm border border-black/5 h-24 p-4 flex flex-col gap-2"
                          >
                            <div className="w-8 h-8 rounded bg-[#c3a165]/20"></div>
                            <div className="w-1/2 h-4 bg-black/10 rounded"></div>
                          </motion.div>
                        ))}
                      </div>
                      <div className="flex-1 bg-white rounded-xl shadow-sm border border-black/5 p-4 flex gap-4">
                        <div className="w-1/3 h-full border-r border-black/5 flex flex-col justify-end gap-2 pr-4 pb-2">
                           <div className="w-full h-1/4 bg-[#59161a]/10 rounded-t"></div>
                           <div className="w-full h-2/4 bg-[#c3a165]/20 rounded-t"></div>
                           <div className="w-full h-3/4 bg-[#59161a] rounded-t text-xs text-white p-2">Total Έσοδα</div>
                        </div>
                        <div className="flex-1 flex flex-col gap-3 pt-2">
                           {[1,2,3,4].map(i => (
                             <div key={i} className="flex justify-between items-center border-b border-black/5 pb-2">
                               <div className="w-1/2 h-4 bg-black/5 rounded"></div>
                               <div className="w-1/4 h-4 bg-[#c3a165]/20 rounded"></div>
                             </div>
                           ))}
                        </div>
                      </div>
                    </div>
                 </div>
               </div>
               
               {/* Floating Badges */}
               <motion.div 
                 animate={{ y: [0, -10, 0] }}
                 transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                 className="absolute -right-6 top-1/4 glass-premium px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 z-30"
               >
                 <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                   <div className="w-4 h-4 border-2 border-emerald-600 rounded-sm bg-emerald-500"></div>
                 </div>
                 <div>
                   <div className="text-sm font-bold text-[#2b1f1a]">Σύνδεση Τραπέζης</div>
                   <div className="text-xs text-[#736760]">Συγχρονισμός επιτυχής</div>
                 </div>
               </motion.div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* --- LOGO CLOUD (Social Proof) --- */}
      <section className="py-10 border-y border-black/5 bg-white overflow-hidden flex flex-col items-center">
         <p className="text-xs font-bold uppercase tracking-widest text-[#736760] mb-8 text-center">Μας εμπιστευονται Ναοι σε ολη την Ελλαδα</p>
         <div className="w-full relative flex overflow-x-hidden">
           {/* Gradient overlays to smooth the edges */}
           <div className="absolute top-0 left-0 bottom-0 w-24 lg:w-48 bg-gradient-to-r from-white to-transparent z-10"></div>
           <div className="absolute top-0 right-0 bottom-0 w-24 lg:w-48 bg-gradient-to-l from-white to-transparent z-10"></div>
           
           <div className="flex w-[200%] md:w-auto gap-16 md:gap-24 opacity-60 grayscale hover:grayscale-0 transition-opacity duration-500 pl-4 items-center animate-marquee whitespace-nowrap h-12">
             <div className="font-heading text-xl font-bold text-black/60 flex items-center gap-2"><Lock className="w-5 h-5"/> Ι.Μ. Αθηνών</div>
             <div className="font-heading text-xl font-bold text-black/60 flex items-center gap-2"><Lock className="w-5 h-5"/> Ι.Ν. Αγ. Δημητρίου</div>
             <div className="font-heading text-xl font-bold text-black/60 flex items-center gap-2"><Lock className="w-5 h-5"/>Ι.Μ. Θεσσαλονίκης</div>
             <div className="font-heading text-xl font-bold text-black/60 flex items-center gap-2"><Lock className="w-5 h-5"/> Ι.Ν. Αγ. Νικολάου</div>
             <div className="font-heading text-xl font-bold text-black/60 flex items-center gap-2"><Lock className="w-5 h-5"/> Ι.Ν. Παναγίας</div>
             <div className="font-heading text-xl font-bold text-black/60 flex items-center gap-2"><Lock className="w-5 h-5"/> Ι.Μ. Περιστερίου</div>
             {/* Duplicate for infinite effect */}
             <div className="font-heading text-xl font-bold text-black/60 flex items-center gap-2"><Lock className="w-5 h-5"/> Ι.Μ. Αθηνών</div>
             <div className="font-heading text-xl font-bold text-black/60 flex items-center gap-2"><Lock className="w-5 h-5"/> Ι.Ν. Αγ. Δημητρίου</div>
             <div className="font-heading text-xl font-bold text-black/60 flex items-center gap-2"><Lock className="w-5 h-5"/>Ι.Μ. Θεσσαλονίκης</div>
           </div>
         </div>
      </section>

      {/* --- FEATURES GRID (BENTO) --- */}
      <BentoFeatures />

      {/* --- PRICING SECTION --- */}
      <section id="pricing" className="py-32 bg-[#FDFBF7] relative">
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-[#1a1008] to-transparent opacity-5 z-0"></div>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-heading font-black text-[#2b1f1a] mb-6">Απλή, Διαφανής Χρέωση</h2>
            <p className="text-lg text-[#736760] max-w-2xl mx-auto">Επενδύστε στην οργάνωση του Ναού σας. Επιλέξτε το πακέτο που ανταποκρίνεται στο μέγεθος της Ενορίας σας.</p>
          </motion.div>

          {/* Pricing Cards Container */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto items-center">
            
            {/* Standard Tier */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.1)" }}
              className="glass-premium p-10 rounded-3xl relative overflow-hidden transition-colors"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#c3a165]/10 rounded-bl-full -z-10"></div>
              <h3 className="text-2xl font-bold text-[#2b1f1a] mb-2 font-heading">Basic Ενορία</h3>
              <p className="text-[#736760] mb-8 text-sm border-b border-[#c3a165]/20 pb-8">Η βάση για την ψηφιακή μετάβαση μικρών Ναών.</p>
              <div className="flex items-end gap-2 mb-8">
                <span className="text-5xl font-black text-[#2b1f1a]">29€</span><span className="text-[#736760] font-medium mb-1">/ μήνα</span>
              </div>
              <ul className="space-y-4 mb-10">
                <li className="flex items-center gap-3 text-sm font-semibold text-[#2b1f1a]"><CheckCircle2 className="w-5 h-5 text-[#c3a165]" /> Έως 500 Καρτέλες Ενοριτών</li>
                <li className="flex items-center gap-3 text-sm font-semibold text-[#2b1f1a]"><CheckCircle2 className="w-5 h-5 text-[#c3a165]" /> Ηλεκτρονικό Πρωτόκολλο</li>
                <li className="flex items-center gap-3 text-sm font-semibold text-[#2b1f1a]"><CheckCircle2 className="w-5 h-5 text-[#c3a165]" /> Διαχείριση Συσσιτίου (CRM)</li>
                <li className="flex items-center gap-3 text-sm font-semibold text-[#736760]/50 line-through"><CheckCircle2 className="w-5 h-5 opacity-40" /> Smart PDF: Υποδείγματα</li>
              </ul>
              <Link href="/contact" className="block">
                <button className="w-full py-4 rounded-xl border-2 border-[#59161a]/20 text-[#59161a] font-bold hover:bg-[#59161a]/10 hover:border-[#59161a]/40 transition-colors">Επικοινωνία</button>
              </Link>
            </motion.div>

            {/* Premium Tier */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              className="bg-[#2b1f1a] p-10 rounded-3xl relative overflow-hidden shadow-2xl transform z-10 group"
            >
              {/* Dynamic hover glow effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#59161a]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="absolute -top-10 -right-10 w-48 h-48 bg-[#c3a165] blur-3xl opacity-20 rounded-full group-hover:bg-[#c3a165]/30 transition-all duration-500"></div>
              <div className="absolute top-6 right-6 bg-gradient-to-r from-[#c3a165] to-[#e0bc7b] text-[#1a1008] text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg z-20">
                Προτεινομενο
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-2 font-heading relative z-20">Premium Ναός</h3>
              <p className="text-white/60 mb-8 text-sm border-b border-white/10 pb-8 relative z-20">Πλήρης σουίτα αυτοματισμών, ιδανική για δραστήριους Ναούς.</p>
              <div className="flex items-end gap-2 mb-8 relative z-20">
                <span className="text-5xl font-black text-white">49€</span><span className="text-white/40 font-medium mb-1">/ μήνα</span>
              </div>
              <ul className="space-y-4 mb-10 relative z-20">
                <li className="flex items-center gap-3 text-sm font-semibold text-white/90"><CheckCircle2 className="w-5 h-5 text-[#c3a165]" /> Απεριόριστο C.R.M. Ενοριτών</li>
                <li className="flex items-center gap-3 text-sm font-semibold text-white/90"><CheckCircle2 className="w-5 h-5 text-[#c3a165]" /> <strong>Smart PDF:</strong> Άδειες Γάμων, Βαπτίσεων</li>
                <li className="flex items-center gap-3 text-sm font-semibold text-white/90"><CheckCircle2 className="w-5 h-5 text-[#c3a165]" /> Booking Widget Κρατήσεων</li>
                <li className="flex items-center gap-3 text-sm font-semibold text-white/90"><CheckCircle2 className="w-5 h-5 text-[#c3a165]" /> Vault (Αρχείο Ψηφιακών Εγγράφων)</li>
                <li className="flex items-center gap-3 text-sm font-semibold text-white/90"><CheckCircle2 className="w-5 h-5 text-[#c3a165]" /> Οικονομικό Module & Ισολογισμοί</li>
              </ul>
              
              <Link href="/contact" className="block relative z-20 w-full hover:scale-[1.02] transition-transform active:scale-95">
                <button className="w-full py-4 rounded-xl bg-[linear-gradient(135deg,#c3a165,#e0bc7b)] text-[#1a1008] font-black shadow-[0_5px_20px_rgba(195,161,101,0.2)] hover:shadow-[0_8px_30px_rgba(195,161,101,0.4)] transition-all">
                  Ξεκινήστε τώρα
                </button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-24 bg-[#59161a] relative overflow-hidden flex justify-center items-center">
        <div className="absolute inset-0 bg-[url('/bg-noise.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute -left-[20%] top-0 w-[60%] h-full bg-[#c3a165]/20 blur-[100px] rounded-full mix-blend-lighten"></div>
        
        <div className="relative text-center max-w-2xl mx-auto px-6 z-10 text-white">
           <h2 className="text-4xl md:text-5xl font-heading font-black mb-6">Είστε έτοιμοι για το επόμενο βήμα;</h2>
           <p className="text-white/80 text-lg mb-10">Αφήστε πίσω τη γραφειοκρατία. Αφιερώστε τον χρόνο σας στο πραγματικό ποιμαντικό σας έργο.</p>
           <Link href="/contact" className="inline-block relative group">
              <button className="px-10 py-5 bg-white text-[#59161a] rounded-full font-bold text-lg shadow-xl group-hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] transition-all transform group-hover:-translate-y-1">
                Επικοινωνήστε μαζί μας
              </button>
           </Link>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-[#1a1008] text-white/50 py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
          
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6 opacity-90 hover:opacity-100 transition-opacity">
              <div className="w-10 h-10 relative overflow-hidden rounded-lg">
                <Image src="/logo.png" alt="ΔΕΛΤΟΣ" fill className="object-cover" />
              </div>
              <span className="font-heading font-black text-2xl tracking-widest text-[#c3a165]">ΔΕΛΤΟΣ</span>
            </Link>
            <p className="text-sm leading-relaxed max-w-sm mb-6 text-white/60">
              Το Σύγχρονο Λογισμικό Οργάνωσης & Διοίκησης Ιερών Ναών και Μητροπόλεων. 
              Ασφαλές, Γρήγορο, Cloud-Based. Ένα προϊόν σχεδιασμένο με προσοχή στη λεπτομέρεια.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-4">Πλοήγηση</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="#features" className="hover:text-white transition-colors">Δυνατότητες</Link></li>
              <li><Link href="#pricing" className="hover:text-white transition-colors">Συνδρομές</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Επικοινωνία</Link></li>
              <li><Link href="/login" className="text-[#c3a165] font-semibold hover:text-[#e0bc7b] transition-colors">Είσοδος (Admin)</Link></li>
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
        <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-semibold text-white/40">
          <p>© {new Date().getFullYear()} ΔΕΛΤΟΣ Software. Με επιφύλαξη παντός δικαιώματος.</p>
          <div className="flex gap-6">
             <Link href="#" className="hover:text-white transition-colors">Όροι Σύμβασης</Link>
             <Link href="#" className="hover:text-white transition-colors">Πολιτική Απορρήτου (GDPR)</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
