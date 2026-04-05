'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Tent, Users, Plus, Trash2, Calendar, DollarSign, UserCheck, UserX,
  CheckCircle2, AlertTriangle, Search, ChevronRight, HeartPulse, Shirt,
  ClipboardList, Star, XCircle, Loader2
} from 'lucide-react';
import {
  createCamp, deleteCamp, registerCamper, cancelRegistration, addCampPayment,
  markCampAttendance, updateCamperConsent, createGroup, addCampStaff, removeCampStaff, assignGroup
} from '@/actions/camps';

// ─── MAIN COMPONENT ─────────────────────────────────────────────
export default function CampModule({ camps, stats }: { camps: any[]; stats: Record<string, any> }) {
  const router = useRouter();
  const [activeCampId, setActiveCampId] = useState<string | null>(camps[0]?.id || null);
  const [activeView, setActiveView] = useState<'dashboard' | 'campers' | 'attendance' | 'payments' | 'staff'>('dashboard');
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const activeCamp = camps.find(c => c.id === activeCampId);
  const campStats = activeCampId ? stats[activeCampId] : null;

  return (
    <div className="space-y-6">
      {/* Camp Selector + Create */}
      <div className="flex flex-wrap gap-3 items-center">
        {camps.map(camp => (
          <button key={camp.id} onClick={() => { setActiveCampId(camp.id); setActiveView('dashboard'); }}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeCampId === camp.id
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-muted/40 text-muted-foreground hover:bg-muted border border-border'
            }`}>
            <Tent className="w-4 h-4 inline mr-1.5 -mt-0.5"/>{camp.name}
            <Badge variant="secondary" className="ml-2 text-[10px]">{camp._count?.registrations || 0}</Badge>
          </button>
        ))}
        <CreateCampDialog onCreated={() => router.refresh()} />
      </div>

      {!activeCamp && <EmptyState />}

      {activeCamp && (
        <>
          {/* View Tabs */}
          <div className="flex gap-1 bg-muted/30 p-1 rounded-xl w-fit border border-border flex-wrap">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Star },
              { id: 'campers', label: 'Κατασκηνωτές', icon: Users },
              { id: 'attendance', label: 'Παρουσιολόγιο', icon: ClipboardList },
              { id: 'payments', label: 'Πληρωμές', icon: DollarSign },
              { id: 'staff', label: 'Προσωπικό', icon: UserCheck },
            ].map(tab => (
              <Button key={tab.id} variant={activeView === tab.id ? 'primary' : 'ghost'}
                className="rounded-lg gap-1.5 text-xs" onClick={() => setActiveView(tab.id as any)}>
                <tab.icon className="w-3.5 h-3.5"/>{tab.label}
              </Button>
            ))}
          </div>

          {activeView === 'dashboard' && <CampDashboard camp={activeCamp} stats={campStats} />}
          {activeView === 'campers' && <CampersView camp={activeCamp} search={search} setSearch={setSearch} />}
          {activeView === 'attendance' && <AttendanceView camp={activeCamp} />}
          {activeView === 'payments' && <PaymentsView camp={activeCamp} />}
          {activeView === 'staff' && <StaffView camp={activeCamp} />}
        </>
      )}
    </div>
  );
}

// ─── DASHBOARD ──────────────────────────────────────────────────
function CampDashboard({ camp, stats }: { camp: any; stats: any }) {
  const router = useRouter();
  if (!stats) return <div className="text-muted-foreground p-8 text-center">Φόρτωση...</div>;

  const fillPct = Math.round((stats.totalRegistered / stats.capacity) * 100);
  const revPct = stats.expectedRevenue > 0 ? Math.round((stats.totalRevenue / stats.expectedRevenue) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm border-border">
          <CardContent className="pt-5 pb-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Εγγεγραμμένοι</p>
                <p className="text-3xl font-black text-foreground mt-1">{stats.totalRegistered}<span className="text-lg text-muted-foreground">/{stats.capacity}</span></p>
              </div>
              <div className="p-2 bg-primary/10 rounded-xl"><Users className="w-5 h-5 text-primary"/></div>
            </div>
            <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-indigo-500 rounded-full transition-all" style={{width:`${Math.min(fillPct,100)}%`}}/>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">{fillPct}% πληρότητα</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border">
          <CardContent className="pt-5 pb-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Έσοδα</p>
                <p className="text-3xl font-black text-foreground mt-1">€{stats.totalRevenue.toFixed(0)}</p>
                <p className="text-[10px] text-muted-foreground">/ €{stats.expectedRevenue.toFixed(0)} αναμενόμενα</p>
              </div>
              <div className="p-2 bg-emerald-100 rounded-xl"><DollarSign className="w-5 h-5 text-emerald-600"/></div>
            </div>
            <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all" style={{width:`${Math.min(revPct,100)}%`}}/>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border">
          <CardContent className="pt-5 pb-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Εκκρεμείς Πληρωμές</p>
                <p className="text-3xl font-black text-foreground mt-1">{stats.pendingPayments}</p>
              </div>
              <div className={`p-2 rounded-xl ${stats.pendingPayments > 0 ? 'bg-amber-100' : 'bg-emerald-100'}`}>
                {stats.pendingPayments > 0 ? <AlertTriangle className="w-5 h-5 text-amber-600"/> : <CheckCircle2 className="w-5 h-5 text-emerald-600"/>}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border">
          <CardContent className="pt-5 pb-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Ομάδες</p>
                <p className="text-3xl font-black text-foreground mt-1">{camp.groups?.length || 0}</p>
              </div>
              <div className="p-2 bg-violet-100 rounded-xl"><Tent className="w-5 h-5 text-violet-600"/></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Group Distribution */}
      {stats.groupDistribution?.length > 0 && (
        <Card className="shadow-sm border-border">
          <CardHeader className="pb-3"><CardTitle className="text-base">Κατανομή ανά Ομάδα</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.groupDistribution.map((g: any, i: number) => {
                const pct = stats.totalRegistered > 0 ? Math.round((g.count / stats.totalRegistered) * 100) : 0;
                const colors = ['bg-blue-500','bg-violet-500','bg-amber-500','bg-emerald-500','bg-rose-500','bg-cyan-500'];
                return (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{g.name}</span>
                      <span className="text-muted-foreground">{g.count} ({pct}%)</span>
                    </div>
                    <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full ${colors[i % colors.length]} rounded-full transition-all`} style={{width:`${pct}%`}}/>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button className="gap-2"><Plus className="w-4 h-4"/>Νέα Εγγραφή</Button>
        <Button variant="outline" className="gap-2"><ClipboardList className="w-4 h-4"/>Σημερινό Παρουσιολόγιο</Button>
        <Button variant="outline" className="gap-2"><DollarSign className="w-4 h-4"/>Κατάσταση Πληρωμών</Button>
      </div>
    </div>
  );
}

// ─── CAMPERS VIEW ───────────────────────────────────────────────
function CampersView({ camp, search, setSearch }: { camp: any; search: string; setSearch: (s: string) => void }) {
  const router = useRouter();
  const [showRegForm, setShowRegForm] = useState(false);

  const regs = (camp.registrations || []).filter((r: any) =>
    r.status !== 'CANCELLED' &&
    (`${r.childFirstName} ${r.childLastName}`).toLowerCase().includes(search.toLowerCase())
  );

  const getPayColor = (s: string) => {
    if (s === 'PAID') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (s === 'DEPOSIT') return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-red-100 text-red-700 border-red-200';
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div className="flex items-center bg-muted/40 border border-border rounded-xl px-3 py-2 gap-2 flex-1 max-w-md">
          <Search className="w-4 h-4 text-muted-foreground"/>
          <input className="bg-transparent outline-none flex-1 text-sm" placeholder="Αναζήτηση κατασκηνωτή..."
            value={search} onChange={e => setSearch(e.target.value)}/>
        </div>
        <Dialog open={showRegForm} onOpenChange={setShowRegForm}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4"/>Νέα Εγγραφή</Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Εγγραφή Κατασκηνωτή</DialogTitle></DialogHeader>
            <RegistrationForm campId={camp.id} groups={camp.groups || []} price={camp.pricePerSlot}
              onDone={() => { setShowRegForm(false); router.refresh(); }} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-card rounded-xl border border-border shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-xs uppercase text-muted-foreground">
              <th className="text-left p-3">Ονοματεπώνυμο</th>
              <th className="text-left p-3 hidden md:table-cell">Ομάδα</th>
              <th className="text-left p-3 hidden lg:table-cell">Γονέας</th>
              <th className="text-left p-3">Πληρωμή</th>
              <th className="text-left p-3 hidden md:table-cell">Συναίνεση</th>
              <th className="text-center p-3">Ενέργειες</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {regs.map((r: any) => (
              <tr key={r.id} className="hover:bg-muted/20 transition-colors">
                <td className="p-3">
                  <div className="font-bold text-foreground">{r.childLastName} {r.childFirstName}</div>
                  {r.medicalNotes && <span className="text-[10px] text-amber-600 flex items-center gap-0.5 mt-0.5"><HeartPulse className="w-3 h-3"/>Ιατρικό</span>}
                </td>
                <td className="p-3 hidden md:table-cell">
                  <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">{r.parishCampGroup?.name || '—'}</span>
                </td>
                <td className="p-3 hidden lg:table-cell text-muted-foreground text-xs">{r.parentName || '—'}</td>
                <td className="p-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${getPayColor(r.paymentStatus)}`}>
                    {r.paymentStatus === 'PAID' ? 'Εξοφλημένο' : r.paymentStatus === 'DEPOSIT' ? 'Προκαταβολή' : 'Ανεξόφλητο'}
                  </span>
                  <div className="text-[10px] text-muted-foreground mt-0.5">€{r.amountPaid}/{r.amountDue}</div>
                </td>
                <td className="p-3 hidden md:table-cell">
                  {r.consentDate ? <CheckCircle2 className="w-4 h-4 text-emerald-500"/> : <AlertTriangle className="w-4 h-4 text-amber-500"/>}
                </td>
                <td className="p-3 text-center">
                  <Button variant="ghost" size="sm" className="text-xs text-destructive hover:bg-destructive/10"
                    onClick={async () => { if (confirm('Ακύρωση εγγραφής;')) { await cancelRegistration(r.id); router.refresh(); } }}>
                    <XCircle className="w-3.5 h-3.5"/>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {regs.length === 0 && <div className="p-8 text-center text-muted-foreground border-t border-border">Δεν βρέθηκαν κατασκηνωτές</div>}
      </div>
    </div>
  );
}

// ─── REGISTRATION FORM ──────────────────────────────────────────
function RegistrationForm({ campId, groups, price, onDone }: { campId: string; groups: any[]; price: number; onDone: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.target);
    const res = await registerCamper(campId, {
      childFirstName: fd.get('childFirstName') as string,
      childLastName: fd.get('childLastName') as string,
      childBirthDate: fd.get('childBirthDate') as string || undefined,
      gender: fd.get('gender') as string || undefined,
      parentName: fd.get('parentName') as string || undefined,
      parentPhone: fd.get('parentPhone') as string || undefined,
      parentEmail: fd.get('parentEmail') as string || undefined,
      medicalNotes: fd.get('medicalNotes') as string || undefined,
      allergies: fd.get('allergies') as string || undefined,
      medications: fd.get('medications') as string || undefined,
      tshirtColor: fd.get('tshirtColor') as string || undefined,
      tshirtSize: fd.get('tshirtSize') as string || undefined,
      groupId: fd.get('groupId') as string || undefined,
      depositAmount: Number(fd.get('deposit')) || 0,
    });
    setLoading(false);
    if (res.success) onDone();
    else alert(res.error);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Child */}
      <div className="space-y-3">
        <p className="text-xs font-bold uppercase text-muted-foreground">Στοιχεία Παιδιού</p>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Όνομα *</Label><Input name="childFirstName" required/></div>
          <div><Label>Επώνυμο *</Label><Input name="childLastName" required/></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Ημ/νία Γέννησης</Label><Input name="childBirthDate" type="date"/></div>
          <div><Label>Φύλο</Label>
            <select name="gender" className="w-full p-2 border rounded-md bg-transparent text-sm">
              <option value="">—</option><option value="M">Αγόρι</option><option value="F">Κορίτσι</option>
            </select>
          </div>
        </div>
      </div>

      {/* Parent */}
      <div className="space-y-3 p-3 bg-muted/20 rounded-lg border border-border">
        <p className="text-xs font-bold uppercase text-muted-foreground">Κηδεμόνας</p>
        <Input name="parentName" placeholder="Ονοματεπώνυμο Γονέα" required/>
        <div className="grid grid-cols-2 gap-3">
          <Input name="parentPhone" placeholder="Τηλέφωνο" required/>
          <Input name="parentEmail" placeholder="Email" type="email"/>
        </div>
      </div>

      {/* Medical */}
      <div className="space-y-3 p-3 bg-rose-50 rounded-lg border border-rose-100">
        <p className="text-xs font-bold uppercase text-rose-600 flex items-center gap-1"><HeartPulse className="w-3.5 h-3.5"/>Ιατρικά</p>
        <Input name="allergies" placeholder="Αλλεργίες"/>
        <Input name="medications" placeholder="Φαρμακευτική αγωγή"/>
        <textarea name="medicalNotes" placeholder="Σημειώσεις (Προαιρετικό)" rows={2} className="w-full p-2 border rounded-md bg-transparent text-sm resize-none"/>
      </div>

      {/* T-shirt + Group */}
      <div className="grid grid-cols-3 gap-3">
        <div><Label><Shirt className="w-3 h-3 inline mr-1"/>Χρώμα μπλούζας</Label>
          <select name="tshirtColor" className="w-full p-2 border rounded-md bg-transparent text-sm">
            <option value="">—</option><option value="WHITE">Λευκό</option><option value="BLUE">Μπλε</option>
            <option value="RED">Κόκκινο</option><option value="GREEN">Πράσινο</option><option value="YELLOW">Κίτρινο</option>
          </select>
        </div>
        <div><Label>Νούμερο</Label>
          <select name="tshirtSize" className="w-full p-2 border rounded-md bg-transparent text-sm">
            <option value="">—</option><option value="XS">XS</option><option value="S">S</option>
            <option value="M">M</option><option value="L">L</option><option value="XL">XL</option>
          </select>
        </div>
        <div><Label>Ομάδα</Label>
          <select name="groupId" className="w-full p-2 border rounded-md bg-transparent text-sm">
            <option value="">Χωρίς ομάδα</option>
            {groups.map((g: any) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </div>
      </div>

      {/* Payment */}
      <div className="space-y-2 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
        <p className="text-xs font-bold uppercase text-emerald-700 flex items-center gap-1"><DollarSign className="w-3.5 h-3.5"/>Πληρωμή</p>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Τιμή περιόδου:</span>
          <span className="font-bold">€{price}</span>
        </div>
        <div><Label>Προκαταβολή (€)</Label><Input name="deposit" type="number" min="0" step="0.01" defaultValue="0"/></div>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2"/>Αποθήκευση...</> : 'Ολοκλήρωση Εγγραφής'}
      </Button>
    </form>
  );
}

// ─── ATTENDANCE VIEW ────────────────────────────────────────────
function AttendanceView({ camp }: { camp: any }) {
  const router = useRouter();
  const [dateStr, setDateStr] = useState(new Date().toISOString().split('T')[0]);
  const regs = (camp.registrations || []).filter((r: any) => r.status === 'REGISTERED');

  const getStatus = (r: any) => {
    const att = (r.attendances || []).find((a: any) => a.date?.split?.('T')?.[0] === dateStr || new Date(a.date).toISOString().split('T')[0] === dateStr);
    return att ? att.isPresent : null;
  };

  const present = regs.filter((r: any) => getStatus(r) === true).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
        <Input type="date" value={dateStr} onChange={e => setDateStr(e.target.value)} className="w-auto"/>
        <Badge variant="outline" className="text-sm font-bold">{present}/{regs.length} Παρόντες</Badge>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm divide-y divide-border">
        {regs.map((r: any) => {
          const status = getStatus(r);
          return (
            <div key={r.id} className="p-3 flex items-center justify-between hover:bg-muted/20 transition-colors">
              <div>
                <span className="font-bold text-sm">{r.childLastName} {r.childFirstName}</span>
                <span className="text-xs text-muted-foreground ml-2">{r.parishCampGroup?.name || ''}</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant={status === true ? 'primary' : 'outline'}
                  className={status === true ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                  onClick={async () => { await markCampAttendance(r.id, dateStr, true); router.refresh(); }}>
                  <CheckCircle2 className="w-4 h-4 mr-1"/>Παρών
                </Button>
                <Button size="sm" variant={status === false ? 'destructive' : 'outline'}
                  onClick={async () => { await markCampAttendance(r.id, dateStr, false); router.refresh(); }}>
                  <XCircle className="w-4 h-4 mr-1"/>Απών
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── PAYMENTS VIEW ──────────────────────────────────────────────
function PaymentsView({ camp }: { camp: any }) {
  const router = useRouter();
  const regs = (camp.registrations || []).filter((r: any) => r.status !== 'CANCELLED');
  const [payRegId, setPayRegId] = useState<string | null>(null);
  const [payAmt, setPayAmt] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    if (!payRegId || !payAmt) return;
    setLoading(true);
    await addCampPayment(payRegId, Number(payAmt), 'CASH');
    setPayRegId(null); setPayAmt('');
    setLoading(false);
    router.refresh();
  };

  return (
    <div className="space-y-4">
      {payRegId && (
        <Card className="p-4 border-primary/30 bg-primary/5 flex gap-3 items-end flex-wrap">
          <div className="flex-1"><Label>Ποσό (€)</Label><Input type="number" value={payAmt} onChange={e => setPayAmt(e.target.value)} min="0" step="0.01"/></div>
          <Button onClick={handlePay} disabled={loading} className="gap-2"><DollarSign className="w-4 h-4"/>Καταχώρηση</Button>
          <Button variant="ghost" onClick={() => setPayRegId(null)}>Ακύρωση</Button>
        </Card>
      )}

      <div className="bg-card rounded-xl border border-border shadow-sm">
        <table className="w-full text-sm">
          <thead><tr className="border-b bg-muted/30 text-xs uppercase text-muted-foreground">
            <th className="text-left p-3">Κατασκηνωτής</th>
            <th className="text-left p-3">Αρ. Απόδειξης</th>
            <th className="text-right p-3">Οφειλή</th>
            <th className="text-right p-3">Πληρωμένο</th>
            <th className="text-right p-3">Υπόλοιπο</th>
            <th className="p-3"></th>
          </tr></thead>
          <tbody className="divide-y divide-border">
            {regs.map((r: any) => {
              const remaining = r.amountDue - r.amountPaid;
              return (
                <tr key={r.id} className="hover:bg-muted/10">
                  <td className="p-3 font-medium">{r.childLastName} {r.childFirstName}</td>
                  <td className="p-3 font-mono text-xs text-muted-foreground">{r.receiptNumber || '—'}</td>
                  <td className="p-3 text-right">€{r.amountDue}</td>
                  <td className="p-3 text-right font-bold text-emerald-600">€{r.amountPaid}</td>
                  <td className={`p-3 text-right font-bold ${remaining > 0 ? 'text-red-600' : 'text-emerald-600'}`}>€{remaining > 0 ? remaining : 0}</td>
                  <td className="p-3 text-right">
                    {remaining > 0 && (
                      <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => { setPayRegId(r.id); setPayAmt(String(remaining)); }}>
                        <DollarSign className="w-3 h-3"/>Πληρωμή
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── STAFF VIEW ─────────────────────────────────────────────────
function StaffView({ camp }: { camp: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.target);
    await addCampStaff(camp.id, {
      name: fd.get('staffName') as string,
      role: fd.get('staffRole') as string,
      phone: fd.get('staffPhone') as string || undefined,
    });
    e.target.reset();
    setLoading(false);
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 border-border">
        <form onSubmit={handleAdd} className="flex gap-3 items-end flex-wrap">
          <div className="flex-1 min-w-[150px]"><Label>Όνομα</Label><Input name="staffName" required/></div>
          <div className="w-40"><Label>Ρόλος</Label>
            <select name="staffRole" className="w-full p-2 border rounded-md bg-transparent text-sm" required>
              <option value="COUNSELOR">Σύμβουλος</option><option value="LEADER">Ομαδάρχης</option>
              <option value="MEDIC">Γιατρός/Νοσηλευτής</option><option value="COOK">Μάγειρας</option>
            </select>
          </div>
          <div className="w-40"><Label>Τηλέφωνο</Label><Input name="staffPhone"/></div>
          <Button type="submit" disabled={loading}><Plus className="w-4 h-4 mr-1"/>Προσθήκη</Button>
        </form>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(camp.staff || []).map((s: any) => (
          <Card key={s.id} className="p-4 border-border flex justify-between items-start">
            <div>
              <p className="font-bold">{s.name}</p>
              <Badge variant="outline" className="text-[10px] mt-1">{s.role}</Badge>
              {s.phone && <p className="text-xs text-muted-foreground mt-1">{s.phone}</p>}
            </div>
            <Button variant="ghost" size="icon" className="text-destructive"
              onClick={async () => { await removeCampStaff(s.id); router.refresh(); }}>
              <Trash2 className="w-4 h-4"/>
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── HELPERS ────────────────────────────────────────────────────
function CreateCampDialog({ onCreated }: { onCreated: () => void }) {
  const [loading, setLoading] = useState(false);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 border-dashed"><Plus className="w-4 h-4"/>Νέα Κατασκήνωση</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Δημιουργία Κατασκήνωσης</DialogTitle></DialogHeader>
        <form onSubmit={async (e: any) => {
          e.preventDefault(); setLoading(true);
          const fd = new FormData(e.target);
          await createCamp({
            name: fd.get('name') as string,
            year: Number(fd.get('year')) || new Date().getFullYear(),
            startDate: fd.get('startDate') as string,
            endDate: fd.get('endDate') as string,
            location: fd.get('location') as string || undefined,
            capacity: Number(fd.get('capacity')) || 100,
            pricePerSlot: Number(fd.get('price')) || 0,
          });
          setLoading(false); onCreated();
        }} className="space-y-4">
          <div><Label>Όνομα *</Label><Input name="name" required placeholder="π.χ. Κατασκήνωση Α' Περιόδου 2026"/></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Έτος</Label><Input name="year" type="number" defaultValue={new Date().getFullYear()}/></div>
            <div><Label>Τοποθεσία</Label><Input name="location" placeholder="Λουτράκι"/></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Έναρξη *</Label><Input name="startDate" type="date" required/></div>
            <div><Label>Λήξη *</Label><Input name="endDate" type="date" required/></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Θέσεις</Label><Input name="capacity" type="number" defaultValue="100"/></div>
            <div><Label>Τιμή (€)</Label><Input name="price" type="number" step="0.01" defaultValue="0"/></div>
          </div>
          <Button type="submit" disabled={loading} className="w-full">Δημιουργία</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EmptyState() {
  return (
    <div className="py-20 text-center border-2 border-dashed border-border rounded-2xl bg-muted/20">
      <Tent className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4"/>
      <h3 className="text-xl font-bold text-muted-foreground">Δεν υπάρχει κατασκήνωση</h3>
      <p className="text-sm text-muted-foreground mt-1">Δημιουργήστε μία νέα για να ξεκινήσετε.</p>
    </div>
  );
}
