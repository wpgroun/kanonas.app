import Link from 'next/link';

export const metadata = {
  title: 'Πολιτική Απορρήτου — Κανόνας',
  description: 'Η Πολιτική Απορρήτου και διαχείρισης δεδομένων της πλατφόρμας Κανονάς.',
};

export default function PrivacyPage() {
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
            <Link href="/terms" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--foreground)]">Όροι Χρήσης</Link>
          </div>
        </div>
      </nav>

      {/* ─── CONTENT ─── */}
      <main className="pt-32 pb-24 max-w-3xl mx-auto px-6">
        <h1 className="text-4xl font-extrabold text-[var(--foreground)] mb-4 tracking-tight">Πολιτική Απορρήτου</h1>
        <p className="text-[var(--text-muted)] mt-1 mb-8">Τελευταία ενημέρωση: 4 Απριλίου 2026</p>

        <div className="prose prose-[var(--text-secondary)]">
          <p>
            Η προστασία των προσωπικών σας δεδομένων αποτελεί απόλυτη προτεραιότητα για εμάς. Καθώς διαχειριζόμαστε
            ευαίσθητα δεδομένα ενοριών και μυστηρίων, λαμβάνουμε κάθε τεχνικό μέτρο ώστε να διασφαλίσουμε πως
            τίποτα δεν εκτίθεται σε μη εξουσιοδοτημένα άτομα (τήρηση κανονισμού GDPR).
          </p>

          <h2 className="text-xl font-bold text-[var(--foreground)] mt-8 mb-3">1. Ποια Δεδομένα Συλλέγουμε</h2>
          <p>
            <strong>Δεδομένα του διαχειριστή/ιερέα:</strong> Ονοματεπώνυμο, email επικοινωνίας και στοιχεία χρέωσης 
            μέσω του υποσυστήματος κρυπτογραφημένων πληρωμών Stripe.
          </p>
          <p>
            <strong>Δεδομένα πελατών-ενοριτών:</strong> Ονοματεπώνυμα, ημερομηνίες γεννήσεως, οικογενειακή κατάσταση,
            και ιστορικό μυστηρίων ή δωρεών. Αυτά τα δεδομένα συλλέγονται από τους ίδιους τους Ναούς για δική τους χρήση.
          </p>

          <h2 className="text-xl font-bold text-[var(--foreground)] mt-8 mb-3">2. Πώς Χρησιμοποιούμε τα Δεδομένα</h2>
          <p>
            Ο «Κανόνας» σε καμία περίπτωση δεν εκμεταλλεύεται εμπορικά, ούτε μοιράζεται τα δεδομένα των ενοριτών σας
            με τρίτα μέρη, διαφημιστικές ή άλλους οργανισμούς. Όλα τα δεδομένα χρησιμοποιούνται αποκλειστικά 
            και μόνο για την απόδοση της υπηρεσίας στην ενορία σας (π.χ. δημιουργία πιστοποιητικών pdf).
          </p>

          <h2 className="text-xl font-bold text-[var(--foreground)] mt-8 mb-3">3. Ασφάλεια (Security)</h2>
          <p>
            Όλα τα συστήματα επικοινωνούν μέσω κρυπτογραφημένων καναλιών SSL/TLS. Οι κωδικοί πρόσβασης διατηρούνται 
            σε ισχυρά κρυπτογραφημένη (hashed) μορφή μέσω τεχνολογίας bcrypt, ενώ τα αντίγραφα ασφαλείας (backups)
            κρυπτογραφούνται πλήρως. Το περιβάλλον φιλοξενίας που χρησιμοποιούμε (cloud servers) λαμβάνει καθημερινούς
            ελέγχους για vulnerabilities.
          </p>

          <h2 className="text-xl font-bold text-[var(--foreground)] mt-8 mb-3">4. Εποπτεία Μητρόπολης</h2>
          <p>
            Διατηρήστε υπόψη ότι, με βάση τους εσωτερικούς κανονισμούς της Εκκλησίας, μία Ιερά Μητρόπολη δύναται
            να έχει εποπτική πρόσβαση (read-only) στα δεδομένα του ναού σας (π.χ. πρωτοκόλληση εγγράφων, μυστήρια)
            εφόσον έχει αναβαθμίσει τη συνδρομή της, και μόνον αν ο ναός σας έχει αντιστοιχιστεί επίσημα στην Μητρόπολη αυτή.
          </p>

          <h2 className="text-xl font-bold text-[var(--foreground)] mt-8 mb-3">5. Δικαιώματα Διαγραφής</h2>
          <p>
            Οι χρήστες (ιερείς/ενορίες) έχουν το πλήρες δικαίωμα εξαγωγής όλων των δεδομένων τους (Data Portability) και 
            τον δικαίωμα της αυτοματοποιημένης, πλήρους καταστροφής (Right to be Forgotten) κατά τη λήξη της διάρκειας
            αν θέλουν να ακυρώσουν το λογαριασμό τους.
          </p>

          <div className="mt-12 pt-6 border-t border-[var(--border)] text-sm text-[var(--text-muted)]">
            Εάν αναζητάτε τον υπεύθυνο προστασίας δεδομένων (DPO), επικοινωνήστε στο <a href="mailto:privacy@kanonas.app" className="text-[var(--brand)] font-medium">privacy@kanonas.app</a>.
          </div>
        </div>
      </main>

      <footer className="bg-[var(--foreground)] text-white/40 py-8 text-center text-sm">
        © {new Date().getFullYear()} Kanonas Software. All rights reserved.
      </footer>
    </div>
  );
}
