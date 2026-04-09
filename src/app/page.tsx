'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import {
 ArrowRight, Users, FileText, Banknote, ShieldCheck,
 BarChart3, Calendar, BookOpen, CheckCircle2, Zap,
 ChevronRight, Globe, Lock, HeartPulse, Tent, Mail, ScanFace,
 Layout, KanbanSquare, Search, Box
} from 'lucide-react';

const features = [
 {
 icon: <Users className="w-5 h-5"/>,
 title: 'Μητρώο Ενοριτών & Κεκοιμημένων',
 desc: 'Πλήρης καρτέλα ενοριτών, διαχείριση Ληξιαρχείου (Βαπτίσεις, Γάμοι) & Μνημοσύνων.',
 },
 {
 icon: <FileText className="w-5 h-5"/>,
 title: 'Αυτόματα Πιστοποιητικά & Ιστορικό',
 desc: 'PDF Engine για Πιστοποιητικά Αγαμίας, Γάμου, Βάπτισης, Εκδημίας με ένα κλικ.',
 },
 {
 icon: <Banknote className="w-5 h-5"/>,
 title: 'Οικονομική & Υλική Διαχείριση',
 desc: 'Έλεγχος εσόδων, εξόδων και πλήρες ψηφιακό Περιουσιολόγιο Ακινήτων και Κειμηλίων.',
 },
 {
 icon: <HeartPulse className="w-5 h-5"/>,
 title: 'Φιλόπτωχο & Συσσίτια',
 desc: 'Οργάνωση αναξιοπαθούντων αδελφών, διαχείριση αποθήκης μερίδων και δελτίων χορηγίας.',
 },
 {
 icon: <KanbanSquare className="w-5 h-5"/>,
 title: 'Kanban Μυστηρίων & Εργασιών',
 desc: 'Οπτικός πίνακας εργασιών (tasks) για γρήγορη οργάνωση των μυστηρίων και επιτροπών.',
 },
 {
 icon: <BookOpen className="w-5 h-5"/>,
 title: 'Δίπτυχα & Προσκομιδή',
 desc: 'Εκτύπωση ονομάτων Υπέρ Υγείας και Υπέρ Αναπαύσεως για την Αγία Πρόθεση.',
 },
 {
 icon: <Search className="w-5 h-5"/>,
 title: 'Οικουμενική Αναζήτηση (Global Search)',
 desc: 'Βρείτε ενορίτες, πιστοποιητικά, έγγραφα ή πρωτόκολλα στιγμιαία με το πάτημα του Ctrl+K.',
 },
 {
 icon: <Zap className="w-5 h-5"/>,
 title: 'Έξυπνο Action Center (Smart API)',
 desc: 'Το σύστημα αναγνωρίζει εκκρεμότητες και ειδοποιεί προληπτικά για τις εργασίες σας.',
 },
 {
 icon: <ShieldCheck className="w-5 h-5"/>,
 title: 'Απομόνωση & RBAC Ασφάλεια',
 desc: 'Multi-tenant απομόνωση ανά Ναό, με αυστηρούς ρόλους πρόσβασης (Role-Based) για κάθε χρήστη.',
 },
 {
 icon: <Box className="w-5 h-5"/>,
 title: 'Document Vault & Bulk PDF',
 desc: 'Ασφαλής αρχειοθήκη (Vault) για τα έγγραφα του Ναού με δυνατότητα μαζικής παραγωγής.',
 },
 {
 icon: <ScanFace className="w-5 h-5"/>,
 title: 'Πρωτόκολλο & Mobile Scanner',
 desc: 'Αυτόματη αρίθμηση και σάρωση φυσικών εγγράφων κατευθείαν από την κάμερα του κινητού.',
 },
 {
 icon: <Layout className="w-5 h-5"/>,
 title: 'Δημόσια Web-Widgets',
 desc: 'Αυτόματη ενσωμάτωση widget ημερολογίου ή φορμών επικοινωνίας στο site του ναού.',
 },
];

export default function Home() {
 return (
 <div className="min-h-screen bg-white">

 {/* ─── NAVBAR ─── */}
 <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-lg border-b border-[var(--border)]">
 <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
 <Link href="/"className="flex items-center gap-2.5">
 <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#4F46E5] flex items-center justify-center">
 <span className="text-white font-extrabold text-sm"style={{fontFamily:"Georgia, serif", fontStyle:"italic", fontSize:"1.3em", paddingRight:"2px"}}>κ</span>
 </div>
 <span className="font-bold text-[var(--foreground)] text-lg tracking-tight">Κανόνας</span>
 </Link>

 <div className="hidden md:flex items-center gap-8">
 <Link href="#features"className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors">
 Δυνατότητες
 </Link>
 <Link href="/pricing"className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors">
 Συνδρομές
 </Link>
 <Link href="/contact"className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors">
 Επικοινωνία
 </Link>
 </div>

 <div className="flex items-center gap-3">
 <Link href="/login"className="text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors hidden sm:block">
 Είσοδος
 </Link>
 <Link href="/register">
 <button className="btn btn-primary btn-sm">
 Εγγραφή Ναού <ArrowRight className="w-3.5 h-3.5"/>
 </button>
 </Link>
 </div>
 </div>
 </nav>

 {/* ─── HERO ─── */}
 <section className="pt-32 pb-20 lg:pt-40 lg:pb-28 relative overflow-hidden">
 {/* Subtle gradient background */}
 <div className="absolute inset-0 bg-gradient-to-b from-[var(--brand-50)] to-white -z-10"/>
 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-br from-[#7C3AED]/5 to-[#4F46E5]/5 rounded-full blur-3xl -z-10"/>

 <div className="max-w-6xl mx-auto px-6">
 <div className="max-w-3xl mx-auto text-center">
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.5 }}
 >
 <div className="inline-flex flex-col items-center gap-3 mb-6">
  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--brand-light)] text-[var(--brand)] text-xs font-semibold">
  <Zap className="w-3.5 h-3.5"/>
  Cloud Platform για Ιερούς Ναούς
  </div>
  <span className="text-sm font-semibold text-[var(--text-secondary)]">Χρησιμοποιείται από 300+ Ιερούς Ναούς</span>
 </div>

 <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-[var(--foreground)] mb-6 leading-[1.1]">
 Ο Ναός σας,{' '}
 <span className="bg-gradient-to-r from-[#7C3AED] to-[#4F46E5] bg-clip-text text-transparent">
 ψηφιακά.
 </span>
 </h1>

 <p className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed">
 Μητρώο ενοριτών, πιστοποιητικά, οικονομικά, πρωτόκολλο —{' '}
 <span className="text-[var(--foreground)] font-medium">όλα σε μία πλατφόρμα.</span>{' '}
 Απλή, ασφαλής, σχεδιασμένη για σας.
 </p>

 <div className="flex flex-col sm:flex-row gap-3 justify-center">
 <Link href="/register">
 <button className="btn btn-primary btn-lg w-full sm:w-auto">
 Δοκιμάστε Δωρεάν 14 ημέρες <ArrowRight className="w-4 h-4"/>
 </button>
 </Link>
 <Link href="/pricing">
 <button className="btn btn-secondary btn-lg w-full sm:w-auto">
 Δείτε τις Τιμές
 </button>
 </Link>
 </div>
 </motion.div>

 {/* Trust signals */}
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 transition={{ delay: 0.3, duration: 0.5 }}
 className="flex items-center justify-center gap-6 mt-12 text-sm text-[var(--text-muted)] font-medium"
 >
 <span className="flex items-center gap-1.5">
 <Lock className="w-3.5 h-3.5 text-[var(--success)]"/>
 GDPR
 </span>
 <span className="flex items-center gap-1.5">
 <ShieldCheck className="w-3.5 h-3.5 text-[var(--success)]"/>
 SSL/TLS Encrypted
 </span>
 <span className="flex items-center gap-1.5">
 <Globe className="w-3.5 h-3.5 text-[var(--success)]"/>
 Cloud-based
 </span>
 </motion.div>
 </div>

 {/* Dashboard Preview */}
 <motion.div
 initial={{ opacity: 0, y: 40 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.2, duration: 0.7, ease: 'easeOut' }}
 className="mt-16 max-w-4xl mx-auto"
 >
 <div className="rounded-xl border border-[var(--border)] shadow-xl overflow-hidden bg-white">
 {/* Browser dots */}
 <div className="flex items-center gap-2 px-4 py-3 bg-[var(--background)] border-b border-[var(--border)]">
 <div className="w-3 h-3 rounded-full bg-[#EF4444]/60"/>
 <div className="w-3 h-3 rounded-full bg-[#F59E0B]/60"/>
 <div className="w-3 h-3 rounded-full bg-[#10B981]/60"/>
 <div className="flex-1 mx-4 h-7 bg-white rounded-md border border-[var(--border)] flex items-center justify-center text-xs text-[var(--text-muted)] font-mono">
 <Lock className="w-3 h-3 mr-1 text-[var(--success)]"/>
 kanonas.app/admin
 </div>
 </div>
 {/* Mock dashboard */}
 <div className="flex h-[300px] md:h-[400px]">
 {/* Mini sidebar */}
 <div className="w-48 border-r border-[var(--border)] p-3 hidden md:flex flex-col gap-1.5">
 <div className="flex items-center gap-2 p-2 mb-2">
 <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#7C3AED] to-[#4F46E5]"/>
 <div className="w-16 h-3 bg-[var(--foreground)]/10 rounded"/>
 </div>
 {[1,2,3,4,5,6].map(i => (
 <div key={i} className={`flex items-center gap-2 p-2 rounded-md ${i === 1 ? 'bg-[var(--brand-light)]' : ''}`}>
 <div className={`w-4 h-4 rounded ${i === 1 ? 'bg-[var(--brand)]/30' : 'bg-[var(--border)]'}`} />
 <div className={`h-2.5 rounded ${i === 1 ? 'w-20 bg-[var(--brand)]/30' : 'w-16 bg-[var(--border)]'}`} />
 </div>
))}
 </div>
 {/* Main content mock */}
 <div className="flex-1 p-5">
 <div className="flex justify-between items-center mb-5">
 <div className="w-40 h-5 bg-[var(--foreground)]/8 rounded"/>
 <div className="w-8 h-8 bg-[var(--border)] rounded-full"/>
 </div>
 <div className="grid grid-cols-3 gap-3 mb-5">
 {[1,2,3].map(i => (
 <div key={i} className="rounded-lg border border-[var(--border)] p-4 flex flex-col gap-2">
 <div className="w-8 h-8 rounded-md bg-[var(--brand-light)]"/>
 <div className="w-12 h-4 bg-[var(--foreground)]/10 rounded"/>
 <div className="w-20 h-2.5 bg-[var(--border)] rounded"/>
 </div>
))}
 </div>
 <div className="rounded-lg border border-[var(--border)] p-4 flex-1">
 <div className="w-28 h-3 bg-[var(--foreground)]/8 rounded mb-4"/>
 {[1,2,3].map(i => (
 <div key={i} className="flex items-center gap-3 py-2.5 border-b border-[var(--border)] last:border-0">
 <div className="w-6 h-6 bg-[var(--brand-light)] rounded"/>
 <div className="w-32 h-2.5 bg-[var(--border)] rounded"/>
 <div className="ml-auto w-16 h-5 bg-[var(--success-light)] rounded-full"/>
 </div>
))}
 </div>
 </div>
 </div>
 </div>
 </motion.div>
 </div>
 </section>

 {/* ─── FEATURES ─── */}
 <section id="features"className="py-24 bg-white">
 <div className="max-w-6xl mx-auto px-6">
 <div className="text-center mb-16">
 <h2 className="text-3xl md:text-4xl font-extrabold text-[var(--foreground)] mb-4 tracking-tight">
 Όλα όσα χρειάζεστε, σε ένα μέρος
 </h2>
 <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
 Σχεδιάστηκε αποκλειστικά για τις ανάγκες Ιερών Ναών και Ενοριών.
 </p>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {features.map((f, i) => (
 <motion.div
 key={f.title}
 initial={{ opacity: 0, y: 16 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true }}
 transition={{ delay: i * 0.08, duration: 0.4 }}
 className="card card-interactive p-6 group"
 >
 <div className="w-10 h-10 rounded-lg bg-[var(--brand-light)] flex items-center justify-center text-[var(--brand)] mb-4 group-hover:bg-gradient-to-br group-hover:from-[#7C3AED] group-hover:to-[#4F46E5] group-hover:text-white transition-all duration-200">
 {f.icon}
 </div>
 <h3 className="text-base font-bold text-[var(--foreground)] mb-2">{f.title}</h3>
 <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{f.desc}</p>
 </motion.div>
))}
 </div>
 </div>
 </section>

 {/* ─── PRICING ─── */}
 <section id="pricing"className="py-24 bg-[var(--background)]">
 <div className="max-w-5xl mx-auto px-6">
 <div className="text-center mb-16">
 <h2 className="text-3xl md:text-4xl font-extrabold text-[var(--foreground)] mb-4 tracking-tight">
 Απλή, διαφανής τιμολόγηση
 </h2>
 <p className="text-lg text-[var(--text-secondary)]">
 Επιλέξτε το πακέτο που ανταποκρίνεται στις ανάγκες της Ενορίας σας.
 </p>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
 {/* Free */}
 <div className="card p-6 opacity-90">
 <h3 className="text-lg font-bold text-[var(--foreground)] mb-1">Starter</h3>
 <p className="text-xs text-[var(--text-muted)] mb-6">Γνωρίστε την πλατφόρμα δωρεάν</p>
 <div className="flex items-end gap-1 mb-8">
 <span className="text-4xl font-extrabold text-[var(--foreground)]">0€</span>
 </div>
 <ul className="space-y-3 mb-8">
 {['Έως 10 ενεργοί Ενορίτες', 'Δοκιμαστικά Ημερολόγια (Widget)', 'Αναζήτηση', 'Βασική υποστήριξη'].map(item => (
 <li key={item} className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
 <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 text-gray-400 flex-shrink-0"/>
 {item}
 </li>
))}
 </ul>
 <Link href="/register"className="block mt-auto">
 <button className="btn btn-secondary w-full text-sm">Παρέχεται Δωρεάν</button>
 </Link>
 </div>

 {/* Basic */}
 <div className="card p-6">
 <h3 className="text-lg font-bold text-[var(--foreground)] mb-1">Βασική Ενορία</h3>
 <p className="text-xs text-[var(--text-muted)] mb-6">Ιδανικό για χωριά / μικρούς Ναούς</p>
 <div className="flex items-end gap-1 mb-8">
 <span className="text-4xl font-extrabold text-[var(--foreground)]">29€</span>
 <span className="text-[var(--text-muted)] mb-1 text-xs font-medium">/ μήνα</span>
 </div>
 <ul className="space-y-3 mb-8">
 {['Έως 500 ενορίτες', 'Ληξιαρχείο (Βαπτίσεις, Γάμοι)', 'Βασικά Πιστοποιητικά (PDF)', 'Πρωτόκολλο', 'Email υποστήριξη'].map(item => (
 <li key={item} className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
 <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 text-[var(--success)] flex-shrink-0"/>
 {item}
 </li>
))}
 </ul>
 <Link href="/register"className="block mt-auto">
 <button className="btn btn-secondary w-full text-sm">Αγοράστε το</button>
 </Link>
 </div>

 {/* Premium */}
 <div className="relative card p-6 border-[var(--brand)] border-2 shadow-lg">
 <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-gradient-to-r from-[#7C3AED] to-[#4F46E5] text-white text-[10px] uppercase font-extrabold rounded-full tracking-wider">
 Προτεινόμενο
 </div>
 <h3 className="text-lg font-bold text-[var(--foreground)] mb-1">Premium Ναός</h3>
 <p className="text-xs text-[var(--text-muted)] mb-6">Η Σουίτα των μεγάλων Ενοριών</p>
 <div className="flex items-end gap-1 mb-8">
 <span className="text-4xl font-extrabold text-[var(--foreground)] text-transparent bg-clip-text bg-gradient-to-br from-[#7C3AED] to-[#4F46E5]">59€</span>
 <span className="text-[var(--text-muted)] mb-1 text-xs font-medium">/ μήνα</span>
 </div>
 <ul className="space-y-3 mb-8">
 {['Απεριόριστοι Ενορίτες', 'Κεντρικό Ταμείο (Charts & Export)', 'Ετικέτες ΕΛΤΑ (Mailing Labels)', 'Εργαλεία Φιλόπτωχου & Συσσιτίων', 'Kanban Board Διαχείρισης', 'Public Website (Mini-Site)', 'Διασύνδεση SMS / Twilio'].map(item => (
 <li key={item} className="flex items-start gap-2 text-[11px] font-semibold text-[var(--text-secondary)]">
 <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 text-[var(--brand)] flex-shrink-0"/>
 {item}
 </li>
))}
 </ul>
 <Link href="/register"className="block mt-auto">
 <button className="btn btn-primary w-full text-sm py-2">Αγοράστε το</button>
 </Link>
 </div>

 {/* Metropolis / Enterprise */}
 <div className="card p-6 bg-slate-900 text-white border-0">
 <h3 className="text-lg font-bold text-white mb-1">Ιερά Μητρόπολη</h3>
 <p className="text-xs text-slate-400 mb-6">Κεντρική Εποπτεία Επαρχίας</p>
 <div className="flex items-end gap-1 mb-8 pt-2">
 <span className="text-xl md:text-2xl font-extrabold text-blue-400">Ειδική Τιμολόγηση</span>
 </div>
 <ul className="space-y-3 mb-8">
 {['Metropolis"Hawk\'s Eye"Dashboard', 'Κεντρικός Έλεγχος всех Ναών', 'Αθροιστικά KPIs / Στατιστικά', 'Super Admin"Dive-In"', 'Bulk Licensing για 50+ Ναούς'].map(item => (
 <li key={item} className="flex items-start gap-2 text-xs text-slate-300 font-medium">
 <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 text-blue-500 flex-shrink-0"/>
 {item}
 </li>
))}
 </ul>
 <Link href="/contact"className="block mt-auto">
 <button className="bg-white text-slate-900 w-full rounded-md py-2 text-sm font-bold hover:bg-slate-200 transition">Επικοινωνήστε</button>
 </Link>
 </div>
 </div>
 </div>
 </section>

 {/* ─── TESTIMONIALS ─── */}
 <section className="py-24 bg-slate-50 border-t border-[var(--border)]">
  <div className="max-w-6xl mx-auto px-6">
  <div className="text-center mb-16">
  <h2 className="text-3xl font-extrabold text-[var(--foreground)] mb-4">Τι λένε οι Ιερείς για τον Κανόνα</h2>
  <p className="text-lg text-[var(--text-secondary)]">Η καθημερινότητα στις ενορίες άλλαξε ριζικά.</p>
  </div>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
  <div className="bg-white p-8 rounded-2xl shadow-sm border border-[var(--border)] relative">
  <div className="flex text-amber-400 mb-4">{"★".repeat(5)}</div>
  <p className="text-[var(--text-secondary)] italic mb-6">«Η έκδοση πιστοποιητικών που παλιά έπαιρνε 20 λεπτά, τώρα γίνεται με 3 κλικ. Η διαχείριση της ενορίας έγινε παιχνίδι και έχω περισσότερο χρόνο για το ποιμαντικό μου έργο.»</p>
  <div className="font-bold text-[var(--foreground)]">π. Νικόλαος Παπαδόπουλος</div>
  <div className="text-xs text-[var(--text-muted)] mt-1">Ι.Ν. Αγ. Γεωργίου Θεσσαλονίκης</div>
  </div>
  <div className="bg-white p-8 rounded-2xl shadow-sm border border-[var(--border)] relative">
  <div className="flex text-amber-400 mb-4">{"★".repeat(5)}</div>
  <p className="text-[var(--text-secondary)] italic mb-6">«Εξαιρετικό εργαλείο. Με τα αυτόματα backups δεν ανησυχώ πια για το αν θα χάσω τα δεδομένα του Ληξιαρχείου αν χαλάσει ο υπολογιστής στο γραφείο του Ναού.»</p>
  <div className="font-bold text-[var(--foreground)]">π. Δημήτριος Αναστασίου</div>
  <div className="text-xs text-[var(--text-muted)] mt-1">Ι.Ν. Κοιμ. Θεοτόκου Αθηνών</div>
  </div>
  <div className="bg-white p-8 rounded-2xl shadow-sm border border-[var(--border)] relative">
  <div className="flex text-amber-400 mb-4">{"★".repeat(5)}</div>
  <p className="text-[var(--text-secondary)] italic mb-6">«Το σύστημα των ηλεκτρονικών αιτήσεων άλλαξε την επικοινωνία μας με τους πιστούς. Όλα έρχονται τακτοποιημένα. Συστήνω ανεπιφύλακτα τον Κανόνα!»</p>
  <div className="font-bold text-[var(--foreground)]">π. Κωνσταντίνος Παπαϊωάννου</div>
  <div className="text-xs text-[var(--text-muted)] mt-1">Ι.Ν. Αγ. Νικολάου Πατρών</div>
  </div>
  </div>
  </div>
 </section>

 {/* ─── COMPARISON TABLE ─── */}
 <section className="py-24 bg-white border-t border-[var(--border)]">
  <div className="max-w-4xl mx-auto px-6">
  <div className="text-center mb-16">
  <h2 className="text-3xl font-extrabold text-[var(--foreground)] mb-4">Κανόνας vs Παραδοσιακό Λογισμικό</h2>
  <p className="text-lg text-[var(--text-secondary)]">Γιατί να επιλέξετε cloud πλατφόρμα 100% σχεδιασμένη για σήμερα.</p>
  </div>
  <div className="overflow-hidden rounded-2xl border border-[var(--border)] shadow-sm">
  <table className="w-full text-left text-sm bg-white">
  <thead className="bg-slate-50 border-b border-[var(--border)]">
  <tr>
  <th className="p-4 font-bold text-slate-800">Δυνατότητα</th>
  <th className="p-4 font-bold text-blue-600 bg-blue-50/50 text-center">Κανόνας Cloud</th>
  <th className="p-4 font-bold text-slate-500 text-center">Desktop Λογισμικό</th>
  </tr>
  </thead>
  <tbody className="divide-y divide-[var(--border)]">
  {[
  ['Cloud πρόσβαση (Από παντού)', true, false],
  ['Διαδικασία Εγκατάστασης', 'Μηδενική', 'Απαιτεί τεχνικό'],
  ['Αυτόματα Backups', true, false],
  ['Mobile friendly', true, false],
  ['Online Αιτήσεις Πιστών', true, false],
  ['Αυτόματα Updates', true, false],
  ['Παραγωγή Εγγράφων PDF', true, true],
  ['Τιμή', 'Μηνιαία Συνδρομή', 'Υψηλό Κόστος Αγοράς']
  ].map((row, i) => (
  <tr key={i} className="hover:bg-slate-50/50 transition">
  <td className="p-4 font-medium text-slate-700">{row[0]}</td>
  <td className="p-4 bg-blue-50/30 text-emerald-600 font-bold text-center">
  {typeof row[1] === 'boolean' ? (row[1] ? <CheckCircle2 className="w-5 h-5 mx-auto"/> : '—') : row[1]}
  </td>
  <td className="p-4 text-slate-500 text-center">
  {typeof row[2] === 'boolean' ? (row[2] ? <CheckCircle2 className="w-5 h-5 mx-auto"/> : '—') : row[2]}
  </td>
  </tr>
  ))}
  </tbody>
  </table>
  </div>
  </div>
 </section>

 {/* ─── STATS ─── */}
 <section className="py-16 bg-[var(--foreground)] text-white border-t border-slate-800">
  <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/10">
  <div>
  <div className="text-3xl md:text-5xl font-black mb-2 text-blue-400">100%</div>
  <div className="text-sm font-medium text-slate-400">Ελληνική Εκκλησία</div>
  </div>
  <div>
  <div className="text-3xl md:text-5xl font-black mb-2 text-blue-400">14</div>
  <div className="text-sm font-medium text-slate-400">Ημέρες δοκιμή δωρεάν</div>
  </div>
  <div>
  <div className="text-3xl md:text-5xl font-black mb-2 text-blue-400">0</div>
  <div className="text-sm font-medium text-slate-400">Εγκαταστάσεις / Setup</div>
  </div>
  <div>
  <div className="text-3xl md:text-5xl font-black mb-2 text-blue-400">24/7</div>
  <div className="text-sm font-medium text-slate-400">Αυτόματο Cloud Backup</div>
  </div>
  </div>
 </section>

 {/* ─── CTA ─── */}
 <section className="py-24 relative overflow-hidden">
 <div className="absolute inset-0 bg-gradient-to-br from-[#7C3AED] to-[#4F46E5]"/>
 <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PHBhdGggZD0iTTM2IDM0djJIMjR2LTJoMTJ6bTAtMTB2Mkg0di0yaDMyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"/>
 <div className="relative max-w-3xl mx-auto px-6 text-center">
 <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 tracking-tight">
 Είστε έτοιμοι για το επόμενο βήμα;
 </h2>
 <p className="text-lg text-white/80 mb-10 max-w-xl mx-auto">
 Αφήστε πίσω τη γραφειοκρατία. Αφιερώστε τον χρόνο σας στο πραγματικό ποιμαντικό σας έργο.
 </p>
 <Link href="/contact">
 <button className="btn btn-lg bg-white text-[var(--brand-dark)] font-bold hover:bg-white/90 shadow-xl hover:shadow-2xl transition-all">
 Επικοινωνήστε μαζί μας <ChevronRight className="w-4 h-4"/>
 </button>
 </Link>
 </div>
 </section>

 {/* ─── FOOTER ─── */}
 <footer className="bg-[var(--foreground)] text-white/50 py-12">
 <div className="max-w-6xl mx-auto px-6">
 <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
 <div>
 <Link href="/"className="flex items-center gap-2.5 mb-4">
 <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[#7C3AED] to-[#4F46E5] flex items-center justify-center">
 <span className="text-white font-extrabold text-xs"style={{fontFamily:"Georgia, serif", fontStyle:"italic", fontSize:"1.3em", paddingRight:"2px"}}>κ</span>
 </div>
 <span className="font-bold text-white text-base">Κανόνας</span>
 </Link>
 <p className="text-sm text-white/40 leading-relaxed max-w-xs">
 Η σύγχρονη πλατφόρμα διαχείρισης Ιερών Ναών. Ασφαλής, γρήγορη, cloud-based.
 </p>
 </div>
 <div>
 <h4 className="text-white font-semibold text-sm mb-4">Πλοήγηση</h4>
 <ul className="space-y-2.5 text-sm">
 <li><Link href="#features"className="hover:text-white transition-colors">Δυνατότητες</Link></li>
 <li><Link href="/pricing"className="hover:text-white transition-colors">Συνδρομές</Link></li>
 <li><Link href="/contact"className="hover:text-white transition-colors">Επικοινωνία</Link></li>
 <li><Link href="/login"className="text-[var(--brand)] hover:text-[#A78BFA] transition-colors font-medium">Είσοδος</Link></li>
 </ul>
 </div>
 <div>
 <h4 className="text-white font-semibold text-sm mb-4">Επικοινωνία</h4>
 <ul className="space-y-2.5 text-sm">
 <li>info@kanonas.app</li>
 <li>231 231 1359</li>
 <li>Θεμιστοκλή Σοφούλη 57, 55131, Καλαμαριά</li>
 </ul>
 </div>
 </div>
 <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-white/30">
 <p>© {new Date().getFullYear()} Kanonas Software. Με επιφύλαξη παντός δικαιώματος.</p>
 <div className="flex gap-6">
 <Link href="/terms"className="hover:text-white/60 transition-colors">Όροι Χρήσης</Link>
 <Link href="/privacy"className="hover:text-white/60 transition-colors">Πολιτική Απορρήτου</Link>
 </div>
 </div>
 </div>
 </footer>
 </div>
);
}
