"use client";

import { useEffect, useState } from"react";
import Link from"next/link";
import {
 Building2,
 Users,
 UserCheck,
 Plus,
 Calendar,
 Shield,
 BarChart3,
 Power,
 PowerOff,
 Mail,
 MapPin,
 Search,
 ArrowUpCircle,
 Settings,
} from"lucide-react";
import {
 getSuperAdminStats,
 toggleSubscriptionStatus,
 changeSubscriptionPlan,
} from"@/actions/superadmin";

export default function SuperDashboard() {
 const [stats, setStats] = useState<any>(null);
 const [loading, setLoading] = useState(true);
 const [searchTerm, setSearchTerm] = useState("");

 const fetchStats = () => {
 setLoading(true);
 getSuperAdminStats().then((data) => {
 setStats(data);
 setLoading(false);
 });
 };

 useEffect(() => {
 fetchStats();
 }, []);

 const handleToggleStatus = async (
 templeId: string,
 currentStatus: string,
) => {
 const confirmMsg =
 currentStatus ==="active"
 ?"ΑΠΕΝΕΡΓΟΠΟΙΗΣΗ ΣΥΝΔΡΟΜΗΣ: Είστε σίγουροι;"
 :"ΕΝΕΡΓΟΠΟΙΗΣΗ ΣΥΝΔΡΟΜΗΣ: Είστε σίγουροι;";
 if (!confirm(confirmMsg)) return;

 const res = await toggleSubscriptionStatus(templeId, currentStatus);
 if (res.success) fetchStats();
 else alert(res.error ||"Σφάλμα");
 };

 const handleChangePlan = async (templeId: string, currentPlan: string) => {
 const newPlan = currentPlan ==="premium"?"basic":"premium";
 if (!confirm(`Αλλαγή πλάνου σε ${newPlan.toUpperCase()};`)) return;

 const res = await changeSubscriptionPlan(templeId, newPlan);
 if (res.success) fetchStats();
 else alert(res.error ||"Σφάλμα");
 };

 if (loading) {
 return (
 <div className="flex flex-col items-center justify-center py-32">
 <div className="animate-spin w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full mb-4"/>
 <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
 Φόρτωση Συστήματος...
 </p>
 </div>
);
 }

 const filteredTemples =
 stats?.recentTemples?.filter(
 (t: any) =>
 t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
 t.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
 t.metropolis?.toLowerCase().includes(searchTerm.toLowerCase()),
) || [];

 return (
 <div className="space-y-8 pb-12 animate-in fade-in duration-500">
 {/* Header with Gradient */}
 <div className="bg-gradient-to-r from-slate-900 to-indigo-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
 <div className="absolute top-0 right-0 opacity-10">
 <Shield className="w-64 h-64 -mt-10 -mr-10"/>
 </div>
 <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
 <div>
 <h1 className="text-3xl font-black flex items-center gap-3">
 <Shield className="w-8 h-8 text-indigo-400"/> Kanonas OS{""}
 <span className="font-light text-indigo-200">| Ιδιοκτήτης</span>
 </h1>
 <p className="text-indigo-200 font-medium mt-2">
 Διαχείριση Πελατών (Ναών), Συνδρομών & Μετρικών
 </p>
 </div>
 <Link href="/admin/onboarding">
 <button className="bg-white text-indigo-900 hover:bg-indigo-50 px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-transform active:scale-95">
 <Plus className="w-5 h-5"/> Νέος Πελάτης (Ναός)
 </button>
 </Link>
 </div>
 </div>

 {/* KPI Cards */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
 <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-100 flex justify-between items-center relative overflow-hidden group">
 <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors"/>
 <div>
 <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">
 Πελάτες (Ναοί)
 </p>
 <h3 className="text-4xl font-black text-slate-800">
 {stats?.totalTemples || 0}
 </h3>
 </div>
 <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
 <Building2 className="w-6 h-6"/>
 </div>
 </div>
 <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-100 flex justify-between items-center relative overflow-hidden group">
 <div className="absolute inset-0 bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors"/>
 <div>
 <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">
 Μηνιαία Έσοδα MRR
 </p>
 <h3 className="text-4xl font-black text-emerald-600">
 €{stats?.totalMRR || 0}
 </h3>
 </div>
 <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
 <BarChart3 className="w-6 h-6"/>
 </div>
 </div>
 <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-100 flex justify-between items-center relative overflow-hidden group">
 <div className="absolute inset-0 bg-purple-500/5 group-hover:bg-purple-500/10 transition-colors"/>
 <div>
 <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">
 Χρήστες CRM
 </p>
 <h3 className="text-4xl font-black text-purple-600">
 {stats?.totalUsers || 0}
 </h3>
 </div>
 <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
 <UserCheck className="w-6 h-6"/>
 </div>
 </div>
 <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-100 flex justify-between items-center relative overflow-hidden group">
 <div className="absolute inset-0 bg-amber-500/5 group-hover:bg-amber-500/10 transition-colors"/>
 <div>
 <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">
 Ενορίτες
 </p>
 <h3 className="text-4xl font-black text-amber-600">
 {stats?.totalParishioners || 0}
 </h3>
 </div>
 <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
 <Users className="w-6 h-6"/>
 </div>
 </div>
 <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-100 flex justify-between items-center relative overflow-hidden group">
 <div className="absolute inset-0 bg-rose-500/5 group-hover:bg-rose-500/10 transition-colors"/>
 <div>
 <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">
 Χρήση Δίσκου
 </p>
 <h3 className="text-3xl font-black text-rose-600">
 {((stats?.totalStorageMB || 0) / 1024).toFixed(1)} GB
 </h3>
 </div>
 <div className="w-14 h-14 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
 <Shield className="w-6 h-6"/>
 </div>
 </div>
 </div>

 {/* Tenants/Customers CMS */}
 <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
 <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/50">
 <div className="flex items-center gap-3">
 <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
 <Building2 className="w-6 h-6"/>
 </div>
 <div>
 <h2 className="text-xl font-black text-slate-800 mb-0.5">
 Πελατολόγιο SaaS
 </h2>
 <p className="text-sm font-medium text-slate-500">
 Όλοι οι εγγεγραμμένοι Ναοί στο σύστημα
 </p>
 </div>
 </div>
 <div className="relative w-full md:w-72">
 <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
 <input
 type="text"
 placeholder="Αναζήτηση Ιερού Ναού..."
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white shadow-sm focus:ring-4 focus:ring-indigo-500/10"
 />
 </div>
 </div>

 <div className="overflow-x-auto">
 <table className="w-full text-left">
 <thead className="bg-slate-50 text-slate-500 uppercase tracking-widest text-[10px] font-black border-b border-slate-200">
 <tr>
 <th className="px-6 py-4">Ιερός Ναός (Πελάτης)</th>
 <th className="px-6 py-4">Επικοινωνία</th>
 <th className="px-6 py-4">Ογκος Δεδομένων</th>
 <th className="px-6 py-4 text-center">Συνδρομή</th>
 <th className="px-6 py-4 text-center">Κατάσταση</th>
 <th className="px-6 py-4 text-right">Ενέργειες Διαχειριστή</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100">
 {filteredTemples.length > 0 ? (
 filteredTemples.map((t: any) => (
 <tr
 key={t.id}
 className="hover:bg-slate-50/80 transition-colors"
 >
 <td className="px-6 py-4">
 <div className="font-bold text-slate-800 text-base">
 {t.name}
 </div>
 <div className="text-xs font-medium text-slate-500 flex items-center gap-1.5 mt-1">
 <Building2 className="w-3.5 h-3.5 text-slate-400"/>{""}
 Ι.Μ. {t.metropolis}
 </div>
 </td>
 <td className="px-6 py-4">
 <div className="flex flex-col gap-1.5">
 {t.email ? (
 <div className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 bg-slate-100 rounded-md px-2 py-1 w-max">
 <Mail className="w-3.5 h-3.5"/> {t.email}
 </div>
) : (
 <span className="text-xs text-slate-400 italic">
 Χωρίς Email
 </span>
)}
 {t.city && (
 <div className="text-xs font-medium text-slate-500 flex items-center gap-1">
 <MapPin className="w-3 h-3"/> {t.city}
 </div>
)}
 </div>
 </td>
 <td className="px-6 py-4">
 <div className="flex gap-2">
 <div
 className="flex flex-col items-center bg-indigo-50 border border-indigo-100 rounded-lg px-2 py-1 tooltip"
 data-tip="Ενορίτες"
 >
 <span className="text-xs font-black text-indigo-700">
 {t.parishioners}
 </span>
 <span className="text-[9px] uppercase font-bold text-indigo-400">
 ΕΝΟΡΙTΕΣ
 </span>
 </div>
 <div
 className="flex flex-col items-center bg-blue-50 border border-blue-100 rounded-lg px-2 py-1 tooltip"
 data-tip="Χρήστες Πίνακα"
 >
 <span className="text-xs font-black text-blue-700">
 {t.users}
 </span>
 <span className="text-[9px] uppercase font-bold text-blue-400">
 USERS
 </span>
 </div>
 </div>
 </td>
 <td className="px-6 py-4 text-center">
 <button
 onClick={() =>
 handleChangePlan(t.id, t.subscriptionPlan)
 }
 className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black tracking-widest uppercase transition-transform hover:scale-105 shadow-sm border ${t.subscriptionPlan ==="premium"?"bg-amber-100 text-amber-700 border-amber-200":"bg-slate-100 text-slate-500 border-slate-200"}`}
 title="Κλικ για αλλαγή πλάνου"
 >
 {t.subscriptionPlan ==="premium"?"PREMIUM":"BASIC"}
 </button>
 </td>
 <td className="px-6 py-4 text-center">
 <span
 className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black tracking-widest uppercase border ${t.subscriptionStatus ==="active"?"bg-emerald-100 text-emerald-700 border-emerald-200":"bg-rose-100 text-rose-700 border-rose-200"}`}
 >
 {t.subscriptionStatus ==="active"
 ?"Ενεργή"
 :"Ανενεργή"}
 </span>
 </td>
 <td className="px-6 py-4">
 <div className="flex items-center justify-end gap-2">
 <button
 onClick={() =>
 handleToggleStatus(t.id, t.subscriptionStatus)
 }
 className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all shadow-sm ${t.subscriptionStatus ==="active"?"bg-white text-rose-500 border border-rose-200 hover:bg-rose-50":"bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/30"}`}
 title={
 t.subscriptionStatus ==="active"
 ?"Αναστολή Πρόσβασης (Suspension)"
 :"Άμεση Ενεργοποίηση"
 }
 >
 {t.subscriptionStatus ==="active"? (
 <PowerOff className="w-4 h-4"/>
) : (
 <Power className="w-4 h-4"/>
)}
 </button>
 </div>
 </td>
 </tr>
))
) : (
 <tr>
 <td colSpan={6} className="text-center py-16">
 <Building2 className="w-12 h-12 mx-auto text-slate-200 mb-3"/>
 <p className="text-slate-500 font-bold">
 Δεν βρέθηκαν αποτελέσματα
 </p>
 </td>
 </tr>
)}
 </tbody>
 </table>
 </div>
 </div>
 </div>
);
}
