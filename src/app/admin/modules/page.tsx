import { requireAuth } from '@/lib/requireAuth';
import { Package, CheckCircle2, ShieldCheck, Settings, Globe, HeartHandshake, Banknote, Calendar, ClipboardList, BookOpen, Users, Tent, Info } from 'lucide-react';

export const metadata = {
  title: 'Λειτουργικότητες & Ενότητες | Kanonas',
};

const modulesData = [
  {
    category: "Κεντρική Διαχείριση",
    icon: <Settings className="w-5 h-5 text-slate-500" />,
    items: [
      { name: 'Dashboard (Επισκόπηση)', desc: 'Γρήγορη ματιά σε στατιστικά, έσοδα, ιερά μυστήρια, τελευταία αιτήματα και εορτάζοντες.', status: 'Ενεργό' },
      { name: 'Kanban Tasks', desc: 'Οπτικός πίνακας οργάνωσης εργασιών (Εκκρεμότητες, Σε εξέλιξη, Ολοκληρωμένα) για τις επιτροπές του Ναού.', status: 'Ενεργό' },
      { name: 'Ρυθμίσεις & Προφίλ', desc: 'Διαχείριση στοιχείων Ναού (ΑΦΜ, Διεύθυνση, Email) και ρύθμιση ειδοποιήσεων.', status: 'Ενεργό' },
      { name: 'Προσωπικό & Ρόλοι (RBAC)', desc: 'Διαχείριση Χρηστών (Ιερείς, Γραμματείς, Επιτρόποι) και αυστηρός καθορισμός δικαιωμάτων πρόσβασης.', status: 'Ενεργό' }
    ]
  },
  {
    category: "Ληξιαρχείο & Μητρώο (CRM)",
    icon: <Users className="w-5 h-5 text-blue-500" />,
    items: [
      { name: 'Μητρώο Ενοριτών', desc: 'Πλήρης καρτέλα ενοριτών με στοιχεία επικοινωνίας, οικογενειακή κατάσταση, ρόλους και ιστορικό μυστηρίων/δωρεών.', status: 'Ενεργό' },
      { name: 'Ληξιαρχείο & Εκδημίες', desc: 'Καταγραφή κεκοιμημένων, ημερομηνίες ταφής / εκταφής και στοιχεία μνημοσύνων.', status: 'Ενεργό' },
      { name: 'Διαζύγια (Λύσεις Γάμων)', desc: 'Διαχείριση εκκλησιαστικών διαζυγίων, αρχειοθέτηση αποφάσεων Πρωτοδικείου και έκδοση διαζευκτηρίων.', status: 'Ενεργό' },
      { name: 'Τράπεζα Αίματος', desc: 'Μητρώο εθελοντών αιμοδοτών (ομάδα αίματος, τηλέφωνα) για περιπτώσεις έκτακτης ανάγκης.', status: 'Ενεργό' },
      { name: 'Κατασκηνώσεις (Νεολαία)', desc: 'Διαχείριση εγγραφών νεολαίας, ιατρικών ιστορικών και περιόδων κατασκήνωσης.', status: 'Ενεργό' }
    ]
  },
  {
    category: "Γραμματεία & Μυστήρια",
    icon: <ClipboardList className="w-5 h-5 text-emerald-500" />,
    items: [
      { name: 'Ιερά Μυστήρια (Tokens)', desc: 'Ψηφιακός φάκελος ανά μυστήριο (Γάμοι, Βαπτίσεις). Στοιχεία αναδόχων/κουμπάρων, ημ/νία τελετής, και αρίθμηση βιβλίου.', status: 'Ενεργό' },
      { name: 'Αυτόματα Πιστοποιητικά', desc: 'Έκδοση PDF Πιστοποιητικών Αγαμίας, Γάμου, Βάπτισης απευθείας από τα δεδομένα του μυστηρίου.', status: 'Ενεργό' },
      { name: 'Kanonas Connect (e-Gov)', desc: 'Λήψη και έγκριση ψηφιακών αιτήσεων (Citizen Requests) που έρχονται απευθείας από το Mini-Site του Ναού.', status: 'Ενεργό' },
      { name: 'Πρωτόκολλο', desc: 'Ψηφιακό βιβλίο Πρωτοκόλλου. Αρίθμηση εισερχόμενων/εξερχόμενων με δυνατότητα επισύναψης σαρωμένων εγγράφων.', status: 'Ενεργό' }
    ]
  },
  {
    category: "Οικονομική Εποπτεία",
    icon: <Banknote className="w-5 h-5 text-amber-500" />,
    items: [
      { name: 'Καθολικό Πληρωμών / Εισπράξεων', desc: 'Καταγραφή ημερήσιων εσόδων (π.χ. Παγκάρι, Δωρεές) και εξόδων (π.χ. Μισθοδοσία, ΔΕΗ) ανά κατηγορία.', status: 'Ενεργό' },
      { name: 'Προϋπολογισμός (Budgeting)', desc: 'Ορισμός προϋπολογισμού (Εγκριθέντα ποσά) ανά έτος και αυτόματη σύγκριση με τα πραγματικά έξοδα/έσοδα.', status: 'Ενεργό' },
      { name: 'Δωρεές Ενοριτών', desc: 'Καταγραφή δωρεών υπέρ του Ναού από συγκεκριμένους ενορίτες με έκδοση αριθμού απόδειξης.', status: 'Ενεργό' },
      { name: 'Περιουσιολόγιο (Assets)', desc: 'Κτηματολόγιο Ακινήτων και μητρώο κινητών κειμηλίων/ιερών σκευών του Ναού με εκτιμώμενη αξία.', status: 'Ενεργό' }
    ]
  },
  {
    category: "Φιλανθρωπία & Μέριμνα",
    icon: <HeartHandshake className="w-5 h-5 text-rose-500" />,
    items: [
      { name: 'Συμβούλιο Φιλοπτώχου (ΕΦΤ)', desc: 'Ονόματα Διοικητικού Συμβουλίου Φιλοπτώχου (Πρόεδρος, Ταμίας, Μέλη) και θητεία.', status: 'Ενεργό' },
      { name: 'Μητρώο Ωφελουμένων', desc: 'Καταγραφή αναξιοπαθούντων (εισόδημα, μέλη οικογένειας) και μοριοδότηση μέσω κριτηρίων.', status: 'Ενεργό' },
      { name: 'Ημερήσιο Συσσίτιο', desc: 'Παρουσιολόγιο και κατανομή μερίδων ανά ημέρα για το ημερήσιο συσσίτιο.', status: 'Ενεργό' },
      { name: 'Αποθήκη (Inventory)', desc: 'Διαχείριση αποθεμάτων τροφίμων και ειδών πρώτης ανάγκης, με προειδοποιήσεις λήξης.', status: 'Ενεργό' },
      { name: 'Δίπτυχα & Προσκομιδή', desc: 'Ψηφιακά δίπτυχα (Υπέρ Υγείας / Αναπαύσεως) και δυνατότητα μαζικής εκτύπωσης για την Αγία Πρόθεση.', status: 'Ενεργό' },
      { name: 'Ετικέτες (Mailing)', desc: 'Μαζική προσθήκη ενοριτών σε Λίστες Αλληλογραφίας και παραγωγή ετικετών (για ΕΛΤΑ) για αποστολή ευχετηρίων.', status: 'Ενεργό' },
      { name: 'Διακονίες & Εθελοντές', desc: 'Οργάνωση εθελοντών σε ομάδες, δημιουργία βαρδιών και παρουσιολόγιο (Shift Planner) - Υψηλής ποιότητας.', status: 'Ενεργό' }
    ]
  },
  {
    category: "Πρακτικά & Σχεδιασμός",
    icon: <Calendar className="w-5 h-5 text-purple-500" />,
    items: [
      { name: 'Ημερολόγιο Ακολουθιών', desc: 'Πρόγραμμα Ιερών Ακολουθιών. Δυνατότητα διασύνδεσης iCal και δημόσιας προβολής στα Widgets.', status: 'Ενεργό' },
      { name: 'Αναθέσεις Εφημερίων', desc: 'Προγραμματισμός Μυστηρίων και ανάθεση συγκεκριμένου Ιερέα/Ψάλτη/Νεωκόρου σε κάθε μυστήριο.', status: 'Ενεργό' },
      { name: 'Δημόσιο Mini-Site', desc: 'Δημόσια σελίδα του Ναού (`kanonas.app/temple/slug`) με ψηφιακές φόρμες επικοινωνίας (Prayer Requests / Πιστοποιητικά).', status: 'Ενεργό' }
    ]
  }
];

export default async function ModulesInfoPage() {
  await requireAuth();

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
          <Info className="w-6 h-6 text-blue-600" /> Χάρτης Λειτουργικοτήτων
        </h1>
        <p className="text-slate-500 text-sm mt-1">Συνοπτικός πίνακας όλων των διαθέσιμων ενεργών modules του Kanonas OS.</p>
      </div>

      <div className="space-y-8 pb-10">
        {modulesData.map((mod, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-3">
              <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100">{mod.icon}</div>
              <h2 className="text-lg font-bold text-slate-800">{mod.category}</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100/50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 w-1/4">Module / Submodule</th>
                    <th className="px-6 py-3 w-2/3">Συνοπτική Περιγραφή</th>
                    <th className="px-6 py-3 w-auto min-w-[100px]">Κατάσταση</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {mod.items.map((item, j) => (
                    <tr key={j} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 group-hover:border-blue-200 transition-colors inline-block">{item.name}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 leading-relaxed">
                        {item.desc}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" /> {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
