"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Globe, Building2, Users, Plus, Shield, BarChart3,
  PowerOff, CircleDollarSign, TrendingUp, Search,
  ArrowUpRight, CheckCircle2, Eye, Edit3, Key,
  CreditCard, Banknote, ChevronUp, ChevronDown,
  Pause, Play, UserCog, FileText, X, Save, RefreshCw,
  Download, Megaphone, Server
} from "lucide-react";
import {
  getSuperAdminStats, toggleSubscriptionStatus,
  changeTempleSubscriptionPlan, pauseTempleSubscription,
  reactivateTempleSubscription, superAdminResetPassword,
  getSuperAdminFinancials, getAllUsers, updateTempleProfile
} from "@/actions/superadmin";
import { getSubscriptionPlans } from "@/actions/subscriptions";
import { exportAllTemplesCSV } from "@/actions/exports";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { PlatformSettingsTab } from "./PlatformSettingsTab";

type Tab = 'overview' | 'subscriptions' | 'financials' | 'users' | 'settings';

export default function SuperDashboard() {
  const [tab, setTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<any>(null);
  const [financials, setFinancials] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modals
  const [profileModal, setProfileModal] = useState<any>(null);
  const [planModal, setPlanModal] = useState<any>(null);
  const [passwordModal, setPasswordModal] = useState<any>(null);
  const [editingProfile, setEditingProfile] = useState<any>(null);
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    const [s, p] = await Promise.all([
      getSuperAdminStats(),
      getSubscriptionPlans()
    ]);
    setStats(s);
    setPlans(p);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  useEffect(() => {
    if (tab === 'financials' && !financials) {
      getSuperAdminFinancials().then(setFinancials);
    }
    if (tab === 'users' && users.length === 0) {
      getAllUsers().then((u: any) => setUsers(u));
    }
  }, [tab]);

  const handleToggleStatus = async (templeId: string, currentStatus: string) => {
    const msg = currentStatus === "active"
      ? "ΑΝΑΣΤΟΛΗ: Είστε σίγουροι;"
      : "ΕΝΕΡΓΟΠΟΙΗΣΗ: Ο Ναός θα αποκτήσει πάλι πρόσβαση.";
    if (!confirm(msg)) return;
    const res = await toggleSubscriptionStatus(templeId, currentStatus);
    if (res.success) fetchAll();
    else alert(res.error || "Σφάλμα");
  };

  const handleChangePlan = async (templeId: string, newPlanId: string) => {
    setSaving(true);
    const res = await changeTempleSubscriptionPlan(templeId, newPlanId);
    setSaving(false);
    if (res.success) { setPlanModal(null); fetchAll(); }
    else alert(res.error || "Σφάλμα");
  };

  const handlePause = async (templeId: string) => {
    if (!confirm("Παύση συνδρομής;")) return;
    await pauseTempleSubscription(templeId);
    fetchAll();
  };

  const handleReactivate = async (templeId: string) => {
    if (!confirm("Επανενεργοποίηση;")) return;
    await reactivateTempleSubscription(templeId);
    fetchAll();
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) { alert("Ελάχιστο 6 χαρακτήρες"); return; }
    setSaving(true);
    await superAdminResetPassword(passwordModal.id, newPassword);
    setSaving(false);
    setPasswordModal(null);
    setNewPassword("");
    alert("Ο κωδικός άλλαξε επιτυχώς.");
  };

  const handleSaveProfile = async () => {
    if (!editingProfile) return;
    setSaving(true);
    await updateTempleProfile(profileModal.id, {
      name: editingProfile.name,
      email: editingProfile.email,
      phoneNumber: editingProfile.phone,
      address: editingProfile.address,
      city: editingProfile.city,
      taxId: editingProfile.taxId,
    });
    setSaving(false);
    setProfileModal(null);
    setEditingProfile(null);
    fetchAll();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="animate-spin w-10 h-10 border-4 border-[var(--brand)] border-t-transparent rounded-full mb-4" />
        <p className="text-[var(--text-muted)] font-bold uppercase tracking-widest text-xs">Φόρτωση...</p>
      </div>
    );
  }

  const filteredTemples = stats?.recentTemples?.filter((t: any) =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.metropolis?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'overview', label: 'Επισκόπηση', icon: BarChart3 },
    { id: 'subscriptions', label: 'Συνδρομές & Προφίλ', icon: CreditCard },
    { id: 'financials', label: 'Οικονομικά Δικτύου', icon: Banknote },
    { id: 'users', label: 'Χρήστες & Κωδικοί', icon: UserCog },
    { id: 'settings', label: 'Ρυθμίσεις Πλατφόρμας', icon: Server },
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-[var(--surface)] rounded-3xl p-8 shadow-sm border border-[var(--border)] relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3 text-[var(--foreground)]">
            <Shield className="w-8 h-8 text-[var(--brand)]" /> Κέντρο Ελέγχου Συστήματος
          </h1>
          <p className="text-[var(--text-muted)] font-medium mt-2">Εποπτεία Ναών, Εσόδων, Συνδρομών και Οικονομικών Στοιχείων</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={async () => {
            const csv = await exportAllTemplesCSV();
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = `kanonas_all_temples_${new Date().toISOString().slice(0,10)}.csv`;
            document.body.appendChild(a); a.click(); document.body.removeChild(a);
          }} className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border border-emerald-300 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-sm transition-all text-sm">
            <Download className="w-4 h-4" /> Εξαγωγή CSV
          </button>
          <Link href="/admin/super/announcements">
            <button className="bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-300 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-sm transition-all text-sm">
              <Megaphone className="w-4 h-4" /> Ανακοινώσεις
            </button>
          </Link>
          <Link href="/admin/super/map">
            <button className="bg-amber-100/90 text-amber-700 hover:bg-amber-200 border border-amber-300 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-sm transition-all text-sm">
              <Globe className="w-4 h-4" /> Χάρτης
            </button>
          </Link>
          <Link href="/admin/onboarding">
            <button className="bg-[var(--brand)] hover:bg-[var(--brand-dark)] text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all text-sm">
              <Plus className="w-4 h-4" /> Νέος Ναός
            </button>
          </Link>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-[var(--background)] p-1 rounded-xl border border-[var(--border)] shadow-sm">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-bold transition-all ${
              tab === t.id
                ? 'bg-[var(--brand)] text-white shadow-md'
                : 'text-[var(--text-muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]'
            }`}
          >
            <t.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* ══════════════════════════ TAB: OVERVIEW ══════════════════════════ */}
      {tab === 'overview' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <KPICard label="Πελάτες (Ναοί)" value={stats?.totalTemples || 0} icon={<Building2 />} color="indigo" />
            <KPICard label="MRR (Μηνιαία Έσοδα)" value={`€${stats?.totalMRR?.toLocaleString('el-GR') || 0}`} icon={<TrendingUp />} color="gradient" />
            <KPICard label="Ενεργές Συνδρομές" value={stats?.recentTemples?.filter((t: any) => t.subscriptionStatus === 'active').length || 0} icon={<CircleDollarSign />} color="emerald" />
            <KPICard label="Χρήστες Πλατφόρμας" value={stats?.totalUsers || 0} icon={<Users />} color="orange" />
          </div>

          {/* Quick table */}
          <div className="bg-[var(--surface)] rounded-2xl shadow-sm border border-[var(--border)] overflow-hidden">
            <div className="p-5 border-b border-[var(--border)] flex flex-col md:flex-row justify-between items-center gap-4">
              <h2 className="text-lg font-bold text-[var(--foreground)]">Πελατολόγιο (Ναοί)</h2>
              <div className="flex items-center gap-2 w-full md:w-1/3 relative">
                <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3"/>
                <input
                  type="text"
                  placeholder="Αναζήτηση..."
                  className="pl-9 pr-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg w-full focus:ring-2 focus:ring-[var(--brand)] text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-[var(--text-muted)] uppercase bg-[var(--background)] font-extrabold tracking-wider border-b border-[var(--border)]">
                  <tr>
                    <th className="px-5 py-3">Ναός</th>
                    <th className="px-5 py-3">Πακέτο</th>
                    <th className="px-5 py-3">Κατάσταση</th>
                    <th className="px-5 py-3 text-center">Ενορίτες</th>
                    <th className="px-5 py-3 text-center">Χρήστες</th>
                    <th className="px-5 py-3 text-right">Ενέργειες</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {filteredTemples.map((temple: any) => (
                    <tr key={temple.id} className="hover:bg-[var(--background)] transition-colors">
                      <td className="px-5 py-3">
                        <p className="font-bold text-[var(--foreground)]">{temple.name}</p>
                        <p className="text-xs text-[var(--text-muted)]">{temple.metropolis} • {temple.city}</p>
                      </td>
                      <td className="px-5 py-3">
                        <span className="font-black text-[var(--brand)] bg-[var(--brand-50,theme(colors.indigo.50))] px-2 py-0.5 rounded capitalize text-xs">
                          {temple.subscriptionPlan}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                          temple.subscriptionStatus === "active" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                        }`}>
                          {temple.subscriptionStatus === "active" ? <><CheckCircle2 className="w-3 h-3"/>Ενεργός</> : <><PowerOff className="w-3 h-3"/>Ανενεργός</>}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center font-bold text-[var(--text-muted)]">{temple.parishioners}</td>
                      <td className="px-5 py-3 text-center font-bold text-[var(--text-muted)]">{temple.users}</td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => { setProfileModal(temple); setEditingProfile({ name: temple.name, email: temple.email || '', phone: temple.phone || '', address: temple.address || '', city: temple.city || '', taxId: '' }); }} className="p-1.5 rounded-md hover:bg-indigo-100 text-indigo-600 transition-colors" title="Προφίλ">
                            <Eye className="w-4 h-4"/>
                          </button>
                          <button onClick={() => setPlanModal(temple)} className="p-1.5 rounded-md hover:bg-amber-100 text-amber-600 transition-colors" title="Αλλαγή Πλάνου">
                            <CreditCard className="w-4 h-4"/>
                          </button>
                          <button
                            onClick={() => temple.subscriptionStatus === 'active' ? handlePause(temple.id) : handleReactivate(temple.id)}
                            className={`p-1.5 rounded-md transition-colors ${temple.subscriptionStatus === 'active' ? 'hover:bg-red-100 text-red-600' : 'hover:bg-emerald-100 text-emerald-600'}`}
                            title={temple.subscriptionStatus === 'active' ? 'Παύση' : 'Ενεργοποίηση'}
                          >
                            {temple.subscriptionStatus === 'active' ? <Pause className="w-4 h-4"/> : <Play className="w-4 h-4"/>}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredTemples.length === 0 && (
                    <tr><td colSpan={6} className="px-5 py-12 text-center text-[var(--text-muted)]">Κανένα αποτέλεσμα.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════ TAB: SUBSCRIPTIONS ══════════════════════════ */}
      {tab === 'subscriptions' && (
        <div className="space-y-6">
          <div className="bg-[var(--surface)] rounded-2xl p-6 border border-[var(--border)] shadow-sm">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><CreditCard className="w-5 h-5 text-[var(--brand)]"/> Διαχείριση Συνδρομών & Πακέτα</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {plans.map((plan: any) => (
                <div key={plan.id} className={`rounded-xl p-5 border-2 transition-all ${plan.isMetropolis ? 'border-purple-300 bg-purple-50/50' : 'border-[var(--border)] bg-[var(--background)]'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-black text-[var(--foreground)]">{plan.name}</h3>
                    {plan.isMetropolis && <span className="text-[10px] uppercase font-black bg-purple-200 text-purple-700 px-2 py-0.5 rounded">Μητρόπολη</span>}
                  </div>
                  <p className="text-2xl font-black text-[var(--brand)]">€{plan.priceMonthly}<span className="text-xs font-medium text-[var(--text-muted)]">/μήνα</span></p>
                  {plan.priceYearly > 0 && <p className="text-xs text-[var(--text-muted)]">ή €{plan.priceYearly}/έτος</p>}
                  <p className="text-xs text-[var(--text-muted)] mt-2">
                    {stats?.recentTemples?.filter((t: any) => t.subscriptionPlan === plan.name).length || 0} ναοί σε αυτό το πλάνο
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Per-temple subscription management */}
          <div className="bg-[var(--surface)] rounded-2xl shadow-sm border border-[var(--border)] overflow-hidden">
            <div className="p-5 border-b border-[var(--border)]">
              <h2 className="font-bold text-[var(--foreground)]">Αναλυτικά ανά Ναό</h2>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {stats?.recentTemples?.map((temple: any) => (
                <div key={temple.id} className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 hover:bg-[var(--background)] transition-colors">
                  <div className="flex-1">
                    <p className="font-bold text-[var(--foreground)]">{temple.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">{temple.metropolis} • {temple.city} • {temple.email}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-black text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">{temple.subscriptionPlan}</span>
                    <span className={`text-xs font-bold px-2 py-1 rounded ${temple.subscriptionStatus === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {temple.subscriptionStatus === 'active' ? '● Ενεργός' : '○ Ανενεργός'}
                    </span>
                    {temple.subscriptionEndDate && (
                      <span className="text-xs text-[var(--text-muted)]">
                        Λήξη: {new Date(temple.subscriptionEndDate).toLocaleDateString('el-GR')}
                      </span>
                    )}
                    <button onClick={() => setPlanModal(temple)} className="text-xs font-bold text-[var(--brand)] hover:underline flex items-center gap-1">
                      <ChevronUp className="w-3 h-3"/> Αλλαγή
                    </button>
                    {temple.subscriptionStatus === 'active' ? (
                      <button onClick={() => handlePause(temple.id)} className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1">
                        <Pause className="w-3 h-3"/> Παύση
                      </button>
                    ) : (
                      <button onClick={() => handleReactivate(temple.id)} className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1">
                        <Play className="w-3 h-3"/> Ενεργοποίηση
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════ TAB: FINANCIALS ══════════════════════════ */}
      {tab === 'financials' && (
        <div className="space-y-6">
          {!financials ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin w-8 h-8 border-4 border-[var(--brand)] border-t-transparent rounded-full" />
            </div>
          ) : (
            <>
              {/* Financial KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <KPICard label="Έσοδα Μήνα (Όλοι)" value={`€${financials.donationsMonth.toLocaleString('el-GR')}`} icon={<TrendingUp />} color="emerald" />
                <KPICard label="Έσοδα Έτους (Όλοι)" value={`€${financials.donationsYear.toLocaleString('el-GR')}`} icon={<Banknote />} color="indigo" />
                <KPICard label="Έξοδα Μήνα (Όλοι)" value={`€${financials.expensesMonth.toLocaleString('el-GR')}`} icon={<ChevronDown />} color="red" />
                <KPICard label="Ενεργές Συνδρομές" value={financials.activeSubscriptions} icon={<CheckCircle2 />} color="gradient" />
              </div>

              {/* Revenue Trend Chart */}
              <div className="bg-[var(--surface)] rounded-2xl p-6 border border-[var(--border)] shadow-sm">
                <h2 className="text-sm font-bold mb-4">Τάση Εσόδων Δικτύου (6 μήνες)</h2>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={financials.revenueTrend}>
                      <defs>
                        <linearGradient id="superGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(v: any) => `€${Number(v).toLocaleString('el-GR')}`} />
                      <Area type="monotone" dataKey="total" stroke="#7C3AED" fill="url(#superGrad)" strokeWidth={2.5} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top Temples + Recent Donations */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Temples */}
                <div className="bg-[var(--surface)] rounded-2xl p-6 border border-[var(--border)] shadow-sm">
                  <h2 className="text-sm font-bold mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-[var(--brand)]"/> Top 10 Ναοί (Έσοδα Έτους)</h2>
                  <div className="space-y-3">
                    {financials.topTemples.map((t: any, i: number) => (
                      <div key={t.templeId} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-black ${i < 3 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>{i + 1}</span>
                          <div>
                            <p className="text-sm font-bold text-[var(--foreground)]">{t.name}</p>
                            <p className="text-xs text-[var(--text-muted)]">{t.city}</p>
                          </div>
                        </div>
                        <span className="font-black text-sm text-emerald-600">€{t.total.toLocaleString('el-GR')}</span>
                      </div>
                    ))}
                    {financials.topTemples.length === 0 && <p className="text-sm text-[var(--text-muted)]">Δεν υπάρχουν δεδομένα.</p>}
                  </div>
                </div>

                {/* Recent Donations */}
                <div className="bg-[var(--surface)] rounded-2xl p-6 border border-[var(--border)] shadow-sm">
                  <h2 className="text-sm font-bold mb-4 flex items-center gap-2"><FileText className="w-4 h-4 text-emerald-600"/> Πρόσφατες Εισπράξεις</h2>
                  <div className="space-y-2 max-h-[350px] overflow-y-auto">
                    {financials.recentDonations.map((d: any) => (
                      <div key={d.id} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                        <div>
                          <p className="text-sm font-medium text-[var(--foreground)]">{d.temple}</p>
                          <p className="text-xs text-[var(--text-muted)]">{new Date(d.date).toLocaleDateString('el-GR')} • {d.type}</p>
                        </div>
                        <span className="font-black text-sm text-emerald-600">+€{d.amount.toLocaleString('el-GR')}</span>
                      </div>
                    ))}
                    {financials.recentDonations.length === 0 && <p className="text-sm text-[var(--text-muted)]">Δεν υπάρχουν εισπράξεις.</p>}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ══════════════════════════ TAB: USERS ══════════════════════════ */}
      {tab === 'users' && (
        <div className="space-y-6">
          <div className="bg-[var(--surface)] rounded-2xl shadow-sm border border-[var(--border)] overflow-hidden">
            <div className="p-5 border-b border-[var(--border)] flex justify-between items-center">
              <h2 className="font-bold text-[var(--foreground)] flex items-center gap-2"><UserCog className="w-5 h-5 text-[var(--brand)]"/> Χρήστες Πλατφόρμας</h2>
              <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-1 rounded">{users.length} χρήστες</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-[var(--text-muted)] uppercase bg-[var(--background)] font-extrabold tracking-wider border-b border-[var(--border)]">
                  <tr>
                    <th className="px-5 py-3">Email</th>
                    <th className="px-5 py-3">Όνομα</th>
                    <th className="px-5 py-3">Ναός/Ναοί</th>
                    <th className="px-5 py-3 text-center">Super Admin</th>
                    <th className="px-5 py-3 text-center">2FA</th>
                    <th className="px-5 py-3 text-right">Ενέργειες</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {users.map((user: any) => (
                    <tr key={user.id} className="hover:bg-[var(--background)] transition-colors">
                      <td className="px-5 py-3 font-medium text-[var(--foreground)]">{user.email}</td>
                      <td className="px-5 py-3 text-[var(--text-muted)]">{user.firstName} {user.lastName}</td>
                      <td className="px-5 py-3 text-[var(--text-muted)] text-xs">{user.temples?.map((ut: any) => ut.temple?.name).filter(Boolean).join(', ') || '—'}</td>
                      <td className="px-5 py-3 text-center">
                        {user.isSuperAdmin ? <span className="text-xs font-black bg-purple-100 text-purple-700 px-2 py-0.5 rounded">✓ SA</span> : <span className="text-[var(--text-muted)]">—</span>}
                      </td>
                      <td className="px-5 py-3 text-center">
                        {user.twoFactorEnabled ? <span className="text-xs font-bold text-emerald-600">🔒 Ενεργό</span> : <span className="text-[var(--text-muted)] text-xs">Ανενεργό</span>}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button onClick={() => { setPasswordModal(user); setNewPassword(''); }} className="text-xs font-bold text-[var(--brand)] hover:underline flex items-center gap-1 ml-auto">
                          <Key className="w-3 h-3"/> Αλλαγή Κωδικού
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════ TAB: SETTINGS ══════════════════════════ */}
      {tab === 'settings' && (
        <PlatformSettingsTab />
      )}

      {/* ═══════════════════ MODAL: PROFILE ═══════════════════ */}
      {profileModal && editingProfile && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4" onClick={() => { setProfileModal(null); setEditingProfile(null); }}>
          <div className="bg-[var(--surface)] rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-5 animate-in zoom-in-95 fade-in duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-black flex items-center gap-2"><Building2 className="w-5 h-5 text-[var(--brand)]"/> Προφίλ Ναού</h3>
              <button onClick={() => { setProfileModal(null); setEditingProfile(null); }} className="p-1 rounded hover:bg-[var(--background)]"><X className="w-5 h-5"/></button>
            </div>
            <div className="space-y-3">
              {[
                { key: 'name', label: 'Όνομα Ναού' },
                { key: 'email', label: 'Email' },
                { key: 'phone', label: 'Τηλέφωνο' },
                { key: 'address', label: 'Διεύθυνση' },
                { key: 'city', label: 'Πόλη' },
                { key: 'taxId', label: 'ΑΦΜ' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">{f.label}</label>
                  <input
                    type="text"
                    value={(editingProfile as any)[f.key] || ''}
                    onChange={e => setEditingProfile({ ...editingProfile, [f.key]: e.target.value })}
                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--brand)]"
                  />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-[var(--text-muted)]">
                <div>Ενορίτες: <b className="text-[var(--foreground)]">{profileModal.parishioners}</b></div>
                <div>Χρήστες: <b className="text-[var(--foreground)]">{profileModal.users}</b></div>
                <div>Μητρόπολη: <b className="text-[var(--foreground)]">{profileModal.metropolis}</b></div>
                <div>Πλάνο: <b className="text-[var(--brand)]">{profileModal.subscriptionPlan}</b></div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => { setProfileModal(null); setEditingProfile(null); }} className="px-4 py-2 rounded-lg text-sm font-bold text-[var(--text-muted)] hover:bg-[var(--background)]">Ακύρωση</button>
              <button onClick={handleSaveProfile} disabled={saving} className="px-5 py-2 rounded-lg text-sm font-bold bg-[var(--brand)] text-white hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5">
                {saving ? <RefreshCw className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4"/>} Αποθήκευση
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════ MODAL: PLAN CHANGE ═══════════════════ */}
      {planModal && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4" onClick={() => setPlanModal(null)}>
          <div className="bg-[var(--surface)] rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5 animate-in zoom-in-95 fade-in duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-black flex items-center gap-2"><CreditCard className="w-5 h-5 text-amber-600"/> Αλλαγή Πλάνου</h3>
              <button onClick={() => setPlanModal(null)} className="p-1 rounded hover:bg-[var(--background)]"><X className="w-5 h-5"/></button>
            </div>
            <p className="text-sm text-[var(--text-muted)]">Ναός: <b className="text-[var(--foreground)]">{planModal.name}</b></p>
            <p className="text-xs text-[var(--text-muted)]">Τρέχον: <b className="text-[var(--brand)]">{planModal.subscriptionPlan}</b></p>
            <div className="space-y-2">
              {plans.map((plan: any) => (
                <button
                  key={plan.id}
                  onClick={() => handleChangePlan(planModal.id, plan.id)}
                  disabled={saving}
                  className={`w-full text-left p-3 rounded-xl border-2 transition-all flex justify-between items-center ${
                    planModal.subscriptionPlan === plan.name ? 'border-[var(--brand)] bg-indigo-50' : 'border-[var(--border)] hover:border-[var(--brand)]'
                  } ${saving ? 'opacity-50' : ''}`}
                >
                  <div>
                    <p className="font-bold text-sm">{plan.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">€{plan.priceMonthly}/μήνα</p>
                  </div>
                  {planModal.subscriptionPlan === plan.name && <CheckCircle2 className="w-5 h-5 text-[var(--brand)]"/>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════ MODAL: PASSWORD RESET ═══════════════════ */}
      {passwordModal && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4" onClick={() => setPasswordModal(null)}>
          <div className="bg-[var(--surface)] rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-5 animate-in zoom-in-95 fade-in duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-black flex items-center gap-2"><Key className="w-5 h-5 text-red-600"/> Αλλαγή Κωδικού</h3>
              <button onClick={() => setPasswordModal(null)} className="p-1 rounded hover:bg-[var(--background)]"><X className="w-5 h-5"/></button>
            </div>
            <p className="text-sm text-[var(--text-muted)]">Χρήστης: <b className="text-[var(--foreground)]">{passwordModal.email}</b></p>
            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">Νέος Κωδικός</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Ελάχιστο 6 χαρακτήρες"
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--brand)]"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setPasswordModal(null)} className="px-4 py-2 rounded-lg text-sm font-bold text-[var(--text-muted)]">Ακύρωση</button>
              <button onClick={handleResetPassword} disabled={saving} className="px-5 py-2 rounded-lg text-sm font-bold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 flex items-center gap-1.5">
                {saving ? <RefreshCw className="w-4 h-4 animate-spin"/> : <Key className="w-4 h-4"/>} Αλλαγή
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── KPI Card Component ───
function KPICard({ label, value, icon, color }: { label: string; value: string | number; icon: React.ReactNode; color: string }) {
  const colorClasses: Record<string, string> = {
    indigo: 'bg-[var(--surface)] border-[var(--border)]',
    gradient: 'bg-gradient-to-br from-indigo-600 to-purple-700 text-white border-transparent',
    emerald: 'bg-[var(--surface)] border-emerald-200',
    orange: 'bg-[var(--surface)] border-[var(--border)]',
    red: 'bg-[var(--surface)] border-red-200',
  };
  const isGrad = color === 'gradient';
  return (
    <div className={`rounded-2xl p-6 shadow-sm border relative overflow-hidden ${colorClasses[color] || colorClasses.indigo}`}>
      <p className={`text-xs font-black uppercase tracking-widest mb-1 ${isGrad ? 'text-indigo-200' : 'text-[var(--text-muted)]'}`}>{label}</p>
      <div className="flex justify-between items-end mt-2">
        <h3 className={`text-3xl font-black ${isGrad ? '' : 'text-[var(--foreground)]'}`}>{value}</h3>
        <div className={`w-8 h-8 ${isGrad ? 'text-indigo-300' : 'text-indigo-200'} [&>svg]:w-8 [&>svg]:h-8`}>{icon}</div>
      </div>
    </div>
  );
}
