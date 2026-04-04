import Link from 'next/link';

export const metadata = {
  title: 'Όροι Χρήσης — Κανόνας',
  description: 'Οι Όροι Χρήσης της πλατφόρμας Κανονάς.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ─── NAVBAR ─── */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-lg border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#4F46E5] flex items-center justify-center">
              <span className="text-white font-extrabold text-sm" style={{fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "1.3em", paddingRight: "2px"}}>κ</span>
            </div>
            <span className="font-bold text-[var(--foreground)] text-lg tracking-tight">Κανόνας</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--foreground)]">Αρχική</Link>
            <Link href="/privacy" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--foreground)]">Πολιτική Απορρήτου</Link>
          </div>
        </div>
      </nav>

      {/* ─── CONTENT ─── */}
      <main className="pt-32 pb-24 max-w-3xl mx-auto px-6">
        <h1 className="text-4xl font-extrabold text-[var(--foreground)] mb-4 tracking-tight">Όροι Χρήσης</h1>
        <p className="text-[var(--text-muted)] mt-1 mb-8">Τελευταία ενημέρωση: 4 Απριλίου 2026</p>

        <div className="prose prose-[var(--text-secondary)]">
          <p>
            Καλώς ήρθατε στην πλατφόρμα «Κανόνας». Με την πρόσβαση και τη χρήση της πλατφόρμας μας, 
            συμφωνείτε να δεσμεύεστε από τους παρόντες Όρους Χρήσης. Εάν δεν συμφωνείτε με οποιοδήποτε
            μέρος αυτών των όρων, δεν επιτρέπεται η χρήση της υπηρεσίας.
          </p>

          <h2 className="text-xl font-bold text-[var(--foreground)] mt-8 mb-3">1. Περιγραφή της Υπηρεσίας</h2>
          <p>
            Ο «Κανόνας» αποτελεί ένα Λογισμικό ως Υπηρεσία (SaaS) που παρέχεται σε Ιερούς Ναούς και Ιερές Μητροπόλεις 
            και έχει ως σκοπό τη διευκόλυνση της ψηφιακής τους οργάνωσης (Διαχείριση μυστηρίων, ενοριτών, δωρεών, πρωτοκόλλου κ.ά.).
          </p>

          <h2 className="text-xl font-bold text-[var(--foreground)] mt-8 mb-3">2. Δημιουργία Λογαριασμού & Ασφάλεια</h2>
          <p>
            Για τη χρήση της πλατφόρμας απαιτείται η δημιουργία λογαριασμού (Ενορίας ή Μητρόπολης). Είστε
            αποκλειστικά υπεύθυνοι για τη διατήρηση της εμπιστευτικότητας του κωδικού πρόσβασής σας. Σε περίπτωση
            μη εξουσιοδοτημένης πρόσβασης, οφείλετε να μας ενημερώσετε άμεσα.
          </p>

          <h2 className="text-xl font-bold text-[var(--foreground)] mt-8 mb-3">3. Προστασία Δεδομένων & GDPR</h2>
          <p>
            Ο «Κανόνας» λειτουργεί ως "Εκτελών την Επεξεργασία" (Data Processor), ενώ ο Ιερός Ναός ή 
            η Μητρόπολη παραμένει ο "Υπεύθυνος Επεξεργασίας" (Data Controller). Όλα τα δεδομένα διατηρούνται 
            σε εξυπηρετητές κρυπτογραφημένα (SSL/TLS Encryption). Καμία μεταβίβαση των δεδομένων σας σε 
            τρίτους δεν πραγματοποιείται χωρίς την προηγούμενη, ρητή συγκατάθεσή σας.
          </p>

          <h2 className="text-xl font-bold text-[var(--foreground)] mt-8 mb-3">4. Συνδρομές & Πληρωμές</h2>
          <p>
            Οι συνδρομές μας υποστηρίζονται μέσω της υπηρεσίας Stripe. Η πληρωμή γίνεται προκαταβολικά (ανά μήνα ή
            έτος). Μπορείτε να ακυρώσετε τη συνδρομή σας όποτε επιθυμείτε, και αυτή θα παραμείνει ενεργή έως το τέλος
            της τρέχουσας περιόδου χρέωσης.
          </p>

          <h2 className="text-xl font-bold text-[var(--foreground)] mt-8 mb-3">5. Περιορισμός Ευθύνης</h2>
          <p>
            Καταβάλλουμε κάθε δυνατή προσπάθεια ώστε η εφαρμογή να είναι διαθέσιμη στο μέγιστο δυνατό 
            βαθμό (uptime). Παρόλα αυτά δεν φέρουμε ευθύνη απέναντι στους Ναούς ή/και τρίτους για ενδεχόμενες 
            ολιγόωρες διακοπές (downtimes), τεχνικά ζητήματα διαδικτύου ή τυχόν εσφαλμένα δεδομένα που 
            καταχωρούνται από τους ίδιους τους χρήστες.
          </p>

          <h2 className="text-xl font-bold text-[var(--foreground)] mt-8 mb-3">6. Τροποποίηση των Όρων</h2>
          <p>
            Διατηρούμε το δικαίωμα να τροποποιήσουμε αυτούς τους όρους οποιαδήποτε στιγμή. Θα σας 
            ειδοποιήσουμε για τυχόν ουσιώδεις αλλαγές μέσω της πλατφόρμας ή μέσω του email επικοινωνίας
            σας.
          </p>

          <div className="mt-12 pt-6 border-t border-[var(--border)] text-sm text-[var(--text-muted)]">
            Για οποιαδήποτε διευκρίνιση σχετικά με τους Όρους Χρήσης, επικοινωνήστε μαζί μας στο <a href="mailto:info@kanonas.app" className="text-[var(--brand)] font-medium">info@kanonas.app</a>.
          </div>
        </div>
      </main>

      <footer className="bg-[var(--foreground)] text-white/40 py-8 text-center text-sm">
        © {new Date().getFullYear()} Kanonas Software. All rights reserved.
      </footer>
    </div>
  );
}
