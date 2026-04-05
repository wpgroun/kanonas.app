"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
  CircleDollarSign,
  TrendingUp,
  Search,
  Filter,
  ArrowUpRight
} from "lucide-react";
import { getSuperAdminStats, toggleSubscriptionStatus } from "@/actions/superadmin";

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

  const handleToggleStatus = async (templeId: string, currentStatus: string) => {
    const confirmMsg = currentStatus === "active" 
      ? "ΑΠΕΝΕΡΓΟΠΟΙΗΣΗ ΣΥΝΔΡΟΜΗΣ: Είστε σίγουροι ότι θέλετε να κόψετε την πρόσβαση σε αυτόν τον Ναό;" 
      : "ΕΝΕΡΓΟΠΟΙΗΣΗ ΣΥΝΔΡΟΜΗΣ: Ο Ναός θα αποκτήσει πάλι πρόσβαση στο Kanonas SaaS.";
    if (!confirm(confirmMsg)) return;

    const res = await toggleSubscriptionStatus(templeId, currentStatus);
    if (res.success) fetchStats();
    else alert(res.error || "Σφάλμα");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="animate-spin w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full mb-4" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Ανταλλαγη δεδομενων...</p>
      </div>
    );
  }

  const filteredTemples = stats?.recentTemples?.filter((t: any) =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.metropolis?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3 text-slate-800">
            <Shield className="w-8 h-8 text-indigo-600" /> System Control Center
          </h1>
          <p className="text-slate-500 font-medium mt-2">Εποπτεία Ναών, MRR και Διαχείριση Πωλήσεων B2B</p>
        </div>
        <Link href="/admin/onboarding">
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all">
            <Plus className="w-5 h-5" /> Προσθήκη Νέου Ναού
          </button>
        </Link>
      </div>

      {/* KPI Cards: Epsilon-like statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 relative overflow-hidden">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Πελάτες (Ναοί)</p>
          <div className="flex justify-between items-end mt-2">
            <h3 className="text-4xl font-black text-slate-800">{stats?.totalTemples || 0}</h3>
            <Building2 className="w-8 h-8 text-indigo-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 shadow-xl relative overflow-hidden text-white">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-200 mb-1">Μηνιαία Έσοδα (MRR)</p>
          <div className="flex justify-between items-end mt-2">
            <h3 className="text-4xl font-black">€{stats?.totalMRR?.toLocaleString('el-GR') || 0}</h3>
            <TrendingUp className="w-8 h-8 text-indigo-300" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-200 relative overflow-hidden">
          <p className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-1">Τελευταίες Πωλήσεις</p>
          <div className="flex justify-between items-end mt-2">
            <h3 className="text-4xl font-black text-emerald-600">
              +{stats?.recentTemples.filter((t: any) => t.subscriptionStatus === 'active').length || 0}
            </h3>
            <CircleDollarSign className="w-8 h-8 text-emerald-200" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 relative overflow-hidden">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Χρήστες / Συνεργάτες</p>
          <div className="flex justify-between items-end mt-2">
            <h3 className="text-4xl font-black text-slate-800">{stats?.totalUsers || 0}</h3>
            <Users className="w-8 h-8 text-orange-200" />
          </div>
        </div>
      </div>

      {/* CRM DATA TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mt-8">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 className="text-lg font-bold text-slate-800">Πελατολόγιο & Συνδρομές</h2>
          <div className="flex items-center gap-2 w-full md:w-1/3 relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3"/>
            <input 
              type="text" 
              placeholder="Αναζήτηση Ναού ή Μητρόπολης..."
              className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 font-extrabold tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Ναός / Πελατης</th>
                <th className="px-6 py-4">Πακέτο & MRR</th>
                <th className="px-6 py-4">Κατάσταση</th>
                <th className="px-6 py-4">Ημ/νια Λήξης</th>
                <th className="px-6 py-4 text-center">Χρήστες</th>
                <th className="px-6 py-4 text-right">Ενέργειες</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTemples.map((temple: any) => (
                <tr key={temple.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800">{temple.name}</p>
                    <p className="text-xs text-slate-500">{temple.metropolis} • {temple.city}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-black text-indigo-700 bg-indigo-50 px-2 py-1 rounded capitalize text-xs">
                      {temple.subscriptionPlan}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={\`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black uppercase \${
                      temple.subscriptionStatus === "active" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                    }\`}>
                      {temple.subscriptionStatus === "active" ? <CheckCircle2 className="w-3 h-3"/> : <PowerOff className="w-3 h-3"/>}
                      {temple.subscriptionStatus === "active" ? "Ενεργος" : "Ανενεργος"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-medium">
                    {temple.subscriptionEndDate ? new Date(temple.subscriptionEndDate).toLocaleDateString('el-GR') : '-'}
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-slate-500">
                    {temple.users}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleToggleStatus(temple.id, temple.subscriptionStatus)}
                      className={\`px-3 py-1.5 rounded text-xs font-bold transition-colors \${
                        temple.subscriptionStatus === "active"
                          ? "bg-rose-50 text-rose-600 hover:bg-rose-100"
                          : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                      }\`}
                    >
                      {temple.subscriptionStatus === "active" ? "Αναστολή" : "Ενεργοποίηση"}
                    </button>
                  </td>
                </tr>
              ))}
              {filteredTemples.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    Δε βρέθηκαν αποτελέσματα.
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
