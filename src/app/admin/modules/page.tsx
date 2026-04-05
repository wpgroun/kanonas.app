import { requireAuth } from '@/lib/requireAuth';
import { prisma } from '@/lib/prisma';
import { Package, ShieldCheck, Settings, Globe, HeartHandshake, Banknote, Calendar, ClipboardList, BookOpen, Users, Tent, Info } from 'lucide-react';
import ModulesClient from './ModulesClient';

export const metadata = {
 title: 'Λειτουργικότητες & Ενότητες | Kanonas',
};

const modulesData = [
 {
 category:"Κεντρική Διαχείριση",
 icon: <Settings className="w-5 h-5 text-slate-500"/>,
 items: [
 { name: 'Dashboard (Επισκόπηση)', desc: 'Γρήγορη ματιά σε στατιστικά, έσοδα, ιερά μυστήρια, τελευταία αιτήματα και εορτάζοντες.', isCore: true },
 { name: 'Kanban Tasks', desc: 'Οπτικός πίνακας οργάνωσης εργασιών (Εκκρεμότητες, Σε εξέλιξη, Ολοκληρωμένα) για τις επιτροπές του Ναού.', isCore: false },
 { name: 'Ρυθμίσεις & Προφίλ', desc: 'Διαχείριση στοιχείων Ναού (ΑΦΜ, Διεύθυνση, Email) και ρύθμιση ειδοποιήσεων.', isCore: true },
 { name: 'Προσωπικό & Ρόλοι (RBAC)', desc: 'Διαχείριση Χρηστών (Ιερείς, Γραμματείς, Επιτρόποι) και αυστηρός καθορισμός δικαιωμάτων πρόσβασης.', isCore: true }
 ]
 },
 {
 category:"Ληξιαρχείο & Μητρώο (CRM)",
 icon: <Users className="w-5 h-5 text-blue-500"/>,
 items: [
 { name: 'Μητρώο Ενοριτών', desc: 'Πλήρης καρτέλα ενοριτών με στοιχεία επικοινωνίας, οικογενειακή κατάσταση, ρόλους και ιστορικό μυστηρίων/δωρεών.', isCore: false },
 { name: 'Ληξιαρχείο & Εκδημίες', desc: 'Καταγραφή κεκοιμημένων, ημερομηνίες ταφής / εκταφής και στοιχεία μνημοσύνων.', isCore: false },
 { name: 'Διαζύγια (Λύσεις Γάμων)', desc: 'Διαχείριση εκκλησιαστικών διαζυγίων, αρχειοθέτηση αποφάσεων Πρωτοδικείου και έκδοση διαζευκτηρίων.', isCore: false },
 { name: 'Τράπεζα Αίματος', desc: 'Μητρώο εθελοντών αιμοδοτών (ομάδα αίματος, τηλέφωνα) για περιπτώσεις έκτακτης ανάγκης.', isCore: false },
 { name: 'Κατασκηνώσεις (Νεολαία)', desc: 'Διαχείριση εγγραφών νεολαίας, ιατρικών ιστορικών και περιόδων κατασκήνωσης.', isCore: false }
 ]
 },
 {
 category:"Γραμματεία & Μυστήρια",
 icon: <ClipboardList className="w-5 h-5 text-emerald-500"/>,
 items: [
 { name: 'Ιερά Μυστήρια (Tokens)', desc: 'Ψηφιακός φάκελος ανά μυστήριο (Γάμοι, Βαπτίσεις). Στοιχεία αναδόχων/κουμπάρων, ημ/νία τελετής, και αρίθμηση βιβλίου.', isCore: false },
 { name: 'Αυτόματα Πιστοποιητικά', desc: 'Έκδοση PDF Πιστοποιητικών Αγαμίας, Γάμου, Βάπτισης απευθείας από τα δεδομένα του μυστηρίου.', isCore: false },
 { name: 'Kanonas Connect (e-Gov)', desc: 'Λήψη και έγκριση ψηφιακών αιτήσεων (Citizen Requests) που έρχονται απευθείας από το Mini-Site του Ναού.', isCore: false },
 { name: 'Πρωτόκολλο', desc: 'Ψηφιακό βιβλίο Πρωτοκόλλου. Αρίθμηση εισερχόμενων/εξερχόμενων με δυνατότητα επισύναψης σαρωμένων εγγράφων.', isCore: false }
 ]
 },
 {
 category:"Οικονομική Εποπτεία",
 icon: <Banknote className="w-5 h-5 text-amber-500"/>,
 items: [
 { name: 'Καθολικό Πληρωμών / Εισπράξεων', desc: 'Καταγραφή ημερήσιων εσόδων (π.χ. Παγκάρι, Δωρεές) και εξόδων (π.χ. Μισθοδοσία, ΔΕΗ) ανά κατηγορία.', isCore: false },
 { name: 'Προϋπολογισμός (Budgeting)', desc: 'Ορισμός προϋπολογισμού (Εγκριθέντα ποσά) ανά έτος και αυτόματη σύγκριση με τα πραγματικά έξοδα/έσοδα.', isCore: false },
 { name: 'Δωρεές Ενοριτών', desc: 'Καταγραφή δωρεών υπέρ του Ναού από συγκεκριμένους ενορίτες με έκδοση αριθμού απόδειξης.', isCore: false },
 { name: 'Περιουσιολόγιο (Assets)', desc: 'Κτηματολόγιο Ακινήτων και μητρώο κινητών κειμηλίων/ιερών σκευών του Ναού με εκτιμώμενη αξία.', isCore: false }
 ]
 },
 {
 category:"Φιλανθρωπία & Μέριμνα",
 icon: <HeartHandshake className="w-5 h-5 text-rose-500"/>,
 items: [
 { name: 'Συμβούλιο Φιλοπτώχου (ΕΦΤ)', desc: 'Ονόματα Διοικητικού Συμβουλίου Φιλοπτώχου (Πρόεδρος, Ταμίας, Μέλη) και θητεία.', isCore: false },
 { name: 'Μητρώο Ωφελουμένων', desc: 'Καταγραφή αναξιοπαθούντων (εισόδημα, μέλη οικογένειας) και μοριοδότηση μέσω κριτηρίων.', isCore: false },
 { name: 'Ημερήσιο Συσσίτιο', desc: 'Παρουσιολόγιο και κατανομή μερίδων ανά ημέρα για το ημερήσιο συσσίτιο.', isCore: false },
 { name: 'Αποθήκη (Inventory)', desc: 'Διαχείριση αποθεμάτων τροφίμων και ειδών πρώτης ανάγκης, με προειδοποιήσεις λήξης.', isCore: false },
 { name: 'Δίπτυχα & Προσκομιδή', desc: 'Ψηφιακά δίπτυχα (Υπέρ Υγείας / Αναπαύσεως) και δυνατότητα μαζικής εκτύπωσης για την Αγία Πρόθεση.', isCore: false },
 { name: 'Ετικέτες (Mailing)', desc: 'Μαζική προσθήκη ενοριτών σε Λίστες Αλληλογραφίας και παραγωγή ετικετών (για ΕΛΤΑ) για αποστολή ευχετηρίων.', isCore: false },
 { name: 'Διακονίες & Εθελοντές', desc: 'Οργάνωση εθελοντών σε ομάδες, δημιουργία βαρδιών και παρουσιολόγιο (Shift Planner) - Υψηλής ποιότητας.', isCore: false }
 ]
 },
 {
 category:"Πρακτικά & Σχεδιασμός",
 icon: <Calendar className="w-5 h-5 text-purple-500"/>,
 items: [
 { name: 'Ημερολόγιο Ακολουθιών', desc: 'Πρόγραμμα Ιερών Ακολουθιών. Δυνατότητα διασύνδεσης iCal και δημόσιας προβολής στα Widgets.', isCore: false },
 { name: 'Κεντρικό Ημερολόγιο', desc: 'Σημαντικά γεγονότα της ενορίας, εκδηλώσεις, συναντήσεις, συνέδρια της Μητρόπολης.', isCore: false },
 { name: 'Αναθέσεις Εφημερίων', desc: 'Προγραμματισμός Μυστηρίων και ανάθεση συγκεκριμένου Ιερέα/Ψάλτη/Νεωκόρου σε κάθε μυστήριο.', isCore: false },
 { name: 'Δημόσιο Mini-Site', desc: 'Δημόσια σελίδα του Ναού (`kanonas.app/temple/slug`) με ψηφιακές φόρμες επικοινωνίας.', isCore: false }
 ]
 }
];

export default async function ModulesInfoPage() {
 const session = await requireAuth();
 const templeId = (session as any).templeId;

 const temple = await prisma.temple.findUnique({ where: {id: templeId}, select: { settings: true } });
 let disabledModules: string[] = [];
 try {
 const settings = JSON.parse(temple?.settings ||"{}");
 disabledModules = settings.disabledModules || [];
 } catch(e) {}

 return (
 <div className="space-y-6 max-w-5xl">
 <div>
 <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
 <Info className="w-6 h-6 text-blue-600"/> Χάρτης Λειτουργικοτήτων
 </h1>
 <p className="text-slate-500 text-sm mt-1">
 Ενεργοποιήστε ή απενεργοποιήστε τις λειτουργικότητες (modules) που χρησιμοποιεί ο Ι.Ν. σας προκειμένου 
 να ελαφρύνετε το κεντρικό μενού και το Dashboard.
 </p>
 </div>

 <ModulesClient modulesData={modulesData} disabledModules={disabledModules} />
 </div>
);
}
