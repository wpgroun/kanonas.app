'use client';

import { motion } from 'motion/react';
import { Users, FileText, Banknote, Calendar, Lock, Activity } from 'lucide-react';

export default function BentoFeatures() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100 } }
  };

  return (
    <section id="features" className="py-32 bg-[#1a1008] relative overflow-hidden">
      {/* Decorative BG */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[radial-gradient(ellipse_at_top,rgba(195,161,101,0.15),transparent_70%)]"></div>
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <h2 className="text-sm font-bold tracking-widest text-[#c3a165] uppercase mb-4">Απόλυτος Έλεγχος</h2>
          <h3 className="text-4xl md:text-5xl font-heading font-black text-white mb-6">Ο πυρήνας ενός σύγχρονου Ναού</h3>
          <p className="text-[#a89d96] text-lg">Λειτουργικότητα αιχμής, σχεδιασμένη ώστε να μη χρειάζεται εγχειρίδιο χρήσης.</p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 auto-rows-[300px] gap-6"
        >
          
          {/* Feature 1 (Large - Spans 2 cols, 2 rows) */}
          <motion.div variants={itemVariants} className="col-span-1 md:col-span-2 lg:col-span-2 row-span-1 md:row-span-2 p-8 rounded-3xl bg-gradient-to-br from-[#2b1f1a] to-[#1a1008] border border-white/10 group relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#c3a165]/10 rounded-full blur-3xl group-hover:bg-[#c3a165]/20 transition-all duration-700"></div>
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#59161a] border border-[#c3a165]/30 flex items-center justify-center mb-6 text-[#c3a165]">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 font-heading">Μητρώο & Φιλόπτωχο (C.R.M)</h3>
              <p className="text-[#a89d96] leading-relaxed max-w-md">Καρτέλες πιστών, ιστορικό μυστηρίων, αυτόματη καταγραφή συσσιτίου και αναλυτικά κριτήρια μοριοδότησης φιλοπτώχου. Όλα σε ένα σημείο.</p>
            </div>
            
            {/* Fake Visual */}
            <div className="mt-8 relative h-40 w-full bg-[#1a1008] rounded-t-xl border-t border-x border-white/10 overflow-hidden translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
               <div className="flex gap-2 border-b border-white/10 p-3 bg-white/5">
                 <div className="w-8 h-8 rounded-full bg-[#c3a165]/20"></div>
                 <div className="w-8 h-8 rounded-full bg-[#c3a165]/20"></div>
                 <div className="w-8 h-8 rounded-full bg-[#c3a165]/20"></div>
               </div>
               <div className="p-4 space-y-3">
                 <div className="h-3 w-3/4 bg-white/10 rounded"></div>
                 <div className="h-3 w-1/2 bg-white/10 rounded"></div>
                 <div className="h-3 w-5/6 bg-white/10 rounded"></div>
               </div>
            </div>
          </motion.div>

          {/* Feature 2 (Medium - Spans 2 cols, 1 row) */}
          <motion.div variants={itemVariants} className="col-span-1 md:col-span-1 lg:col-span-2 row-span-1 p-8 rounded-3xl bg-[#2b1f1a] border border-white/10 group relative flex flex-col justify-center overflow-hidden">
             <div className="absolute top-1/2 right-0 -translate-y-1/2 w-48 h-full bg-[#59161a]/20 blur-3xl"></div>
             <div className="relative z-10">
               <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-[#e0bc7b]">
                 <FileText className="w-6 h-6" />
               </div>
               <h3 className="text-xl font-bold text-white mb-2 font-heading">Έξυπνα Πιστοποιητικά (PDF)</h3>
               <p className="text-[#a89d96] text-sm">Άδειες γάμου, πιστοποιητικά αγαμίας και βαπτίσεως με 1 κλικ. Η μηχανή μας κλίνει αυτόματα τα ονόματα ("του Ιωάννου").</p>
             </div>
          </motion.div>

          {/* Feature 3 (Small - Spans 1 col, 1 row) */}
          <motion.div variants={itemVariants} className="col-span-1 md:col-span-1 lg:col-span-1 row-span-1 p-8 rounded-3xl bg-gradient-to-tr from-[#59161a]/40 to-[#2b1f1a] border border-[#c3a165]/20 group relative overflow-hidden">
             <div className="text-[#c3a165] mb-4"><Banknote className="w-8 h-8" /></div>
             <h3 className="text-xl font-bold text-white mb-2 font-heading">Οικονομικά</h3>
             <p className="text-[#a89d96] text-sm">Βιβλίο ταμείου, Ισολογισμοί, Αποδείξεις.</p>
          </motion.div>

          {/* Feature 4 (Small - Spans 1 col, 1 row) */}
          <motion.div variants={itemVariants} className="col-span-1 md:col-span-1 lg:col-span-1 row-span-1 p-8 rounded-3xl bg-[#2b1f1a] border border-white/10 group relative overflow-hidden">
             <div className="text-white/70 mb-4"><Calendar className="w-8 h-8" /></div>
             <h3 className="text-lg font-bold text-white mb-2 font-heading">Συγχρονισμός</h3>
             <p className="text-[#a89d96] text-sm tracking-tight">Αυτόματη σύνδεση με Google Calendar για Ακολουθίες.</p>
          </motion.div>

          {/* Feature 5 (Wide - Spans 2 cols, 1 row) */}
          <motion.div variants={itemVariants} className="col-span-1 md:col-span-2 lg:col-span-2 row-span-1 p-8 rounded-3xl bg-[#2b1f1a] border border-white/10 group relative overflow-hidden flex items-center justify-between">
             <div className="max-w-xs relative z-10">
               <div className="text-[#e0bc7b] mb-4"><Lock className="w-8 h-8" /></div>
               <h3 className="text-xl font-bold text-white mb-2 font-heading">Τραπεζική Ασφάλεια</h3>
               <p className="text-[#a89d96] text-sm">Ανεξάρτητα Data Centers, κρυπτογράφηση και Multi-Tenant δομή για 100% ιδιωτικότητα.</p>
             </div>
             
             {/* Fake Lock visual */}
             <div className="hidden sm:flex relative z-10 w-24 h-24 rounded-full border border-[#c3a165]/40 items-center justify-center bg-[#c3a165]/10 animate-pulse">
               <div className="w-16 h-16 rounded-full border border-[#c3a165] flex items-center justify-center shadow-[0_0_15px_#c3a165]">
                 <Lock className="w-6 h-6 text-[#c3a165]" />
               </div>
             </div>
          </motion.div>

          {/* Feature 6 (Small - Spans 2 cols, 1 row) */}
          <motion.div variants={itemVariants} className="col-span-1 md:col-span-1 lg:col-span-2 row-span-1 p-8 rounded-3xl bg-gradient-to-r from-[#2b1f1a] to-[#1a1008] border border-white/10 group relative overflow-hidden">
             <div className="flex justify-between items-start">
               <div>
                 <div className="text-[#c3a165] mb-4"><Activity className="w-8 h-8" /></div>
                 <h3 className="text-xl font-bold text-white mb-2 font-heading">Ψηφιακό Πρωτόκολλο</h3>
                 <p className="text-[#a89d96] text-sm max-w-[200px]">Αλάνθαστη αρχειοθέτηση εγγράφων Μητροπόλεως.</p>
               </div>
               <div className="text-[120px] font-black text-white/5 leading-none absolute -bottom-5 right-5 font-heading">
                 Nº1
               </div>
             </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}

