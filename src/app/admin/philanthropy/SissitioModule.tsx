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
  Users, Plus, ClipboardList, Package, Utensils, DollarSign,
  HeartPulse, Search, Calendar, FileText, CheckCircle2, AlertTriangle, XCircle, TrendingUp, Receipt
} from 'lucide-react';
import {
  addSissitioRecipient, markSissitioAttendance, addSissitioPayment,
  addRecipe, logPortions, addSissitioInventoryItem,
  addInventoryMovement
} from '@/actions/sissitio';

// ─── MAIN COMPONENT ─────────────────────────────────────────────
export default function SissitioModule({ dashboard, recipients, inventory, recipes }: any) {
  const router = useRouter();
  const [activeView, setActiveView] = useState<'dashboard' | 'recipients' | 'attendance' | 'inventory' | 'kitchen'>('dashboard');

  return (
    <div className="space-y-6">
      {/* View Tabs */}
      <div className="flex gap-1 bg-muted/30 p-1 rounded-xl w-fit border border-border flex-wrap">
        {[
          { id: 'dashboard', label: 'Σύνοψη', icon: TrendingUp },
          { id: 'recipients', label: 'Δικαιούχοι', icon: Users },
          { id: 'attendance', label: 'Παρουσιολόγιο', icon: ClipboardList },
          { id: 'kitchen', label: 'Κουζίνα', icon: Utensils },
          { id: 'inventory', label: 'Αποθήκη', icon: Package },
        ].map(tab => (
          <Button key={tab.id} variant={activeView === tab.id ? 'primary' : 'ghost'}
            className="rounded-lg gap-1.5 text-xs shadow-none" onClick={() => setActiveView(tab.id as any)}>
            <tab.icon className="w-4 h-4"/>{tab.label}
          </Button>
        ))}
      </div>

      {activeView === 'dashboard' && <SissitioDashboard stats={dashboard} />}
      {activeView === 'recipients' && <RecipientsView recipients={recipients} />}
      {activeView === 'attendance' && <AttendanceView />}
      {activeView === 'kitchen' && <KitchenView recipes={recipes} />}
      {activeView === 'inventory' && <InventoryView inventory={inventory} />}
    </div>
  );
}

// ─── DASHBOARD ──────────────────────────────────────────────────
function SissitioDashboard({ stats }: { stats: any }) {
  if (!stats) return <p>Φόρτωση...</p>;

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground font-medium">Ενεργοί Δικαιούχοι</p>
            <p className="text-3xl font-black mt-1">{stats.totalActive}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground font-medium">Σημερινές Παρουσίες</p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-3xl font-black text-emerald-600">{stats.todayPresent}</p>
              <span className="text-sm text-muted-foreground">/ {stats.totalActive}</span>
            </div>
          </CardContent>
        </Card>
        <Card className={stats.stockAlerts > 0 ? "border-red-200 bg-red-50/50" : ""}>
          <CardContent className="p-5">
            <p className={`text-sm font-medium ${stats.stockAlerts > 0 ? "text-red-600" : "text-muted-foreground"}`}>Ειδοποιήσεις Αποθήκης</p>
            <div className="flex items-center justify-between mt-1">
              <p className={`text-3xl font-black ${stats.stockAlerts > 0 ? "text-red-600" : "text-foreground"}`}>{stats.stockAlerts}</p>
              {stats.stockAlerts > 0 && <AlertTriangle className="w-5 h-5 text-red-500"/>}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground font-medium">Κατηγορίες Δικαιούχων</p>
            <div className="mt-2 space-y-1">
              {stats.categoryDistribution?.map((c: any) => (
                <div key={c.category} className="flex justify-between text-xs">
                  <span>{c.category}</span><span className="font-bold">{c.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── RECIPIENTS VIEW ────────────────────────────────────────────
function RecipientsView({ recipients }: { recipients: any[] }) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  const filtered = recipients.filter((r: any) => 
    `${r.lastName} ${r.firstName} ${r.afm || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 animate-in fade-in">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center bg-muted/40 border border-border rounded-xl px-3 py-2 flex-1 max-w-sm">
          <Search className="w-4 h-4 text-muted-foreground mr-2"/>
          <input className="bg-transparent outline-none flex-1 text-sm" placeholder="Αναζήτηση..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="w-4 h-4"/>Νέος Δικαιούχος</Button></DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Εγγραφή Δικαιούχου Συσσιτίου</DialogTitle></DialogHeader>
            <RecipientForm onDone={() => { setShowForm(false); router.refresh(); }} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card border rounded-xl overflow-x-auto shadow-sm">
        <table className="w-full text-sm">
          <thead><tr className="bg-muted/30 text-muted-foreground text-xs uppercase border-b"><th className="p-3 text-left">Ονοματεπώνυμο</th><th className="p-3 text-left">Κατηγορία</th><th className="p-3">ΑΦΜ/Τηλ.</th><th className="p-3 text-center">Μερίδες</th><th className="p-3 text-center">Status</th></tr></thead>
          <tbody className="divide-y">
            {filtered.map((r: any) => (
              <tr key={r.id} className="hover:bg-muted/10">
                <td className="p-3">
                  <div className="font-bold">{r.lastName} {r.firstName}</div>
                  {r.medicalProfile?.dietaryNeeds && <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded flex w-fit items-center mt-0.5 gap-1"><HeartPulse className="w-3 h-3"/> Ιατρικό: {r.medicalProfile.dietaryNeeds}</span>}
                </td>
                <td className="p-3">
                  <Badge variant="outline" className={r.category === 'taktikos' ? 'border-emerald-200 text-emerald-700 bg-emerald-50' : r.category === 'ektaktos' ? 'border-amber-200 text-amber-700 bg-amber-50' : 'border-blue-200 text-blue-700 bg-blue-50'}>
                    {r.category === 'taktikos' ? 'Τακτικός' : r.category === 'ektaktos' ? 'Έκτακτος' : 'Επισκέπτης'}
                  </Badge>
                </td>
                <td className="p-3 text-xs text-muted-foreground">{r.afm || r.phone || '—'}</td>
                <td className="p-3 text-center font-bold">{r.familyMembers} <span className="text-[10px] font-normal text-muted-foreground">άτομα</span></td>
                <td className="p-3 text-center">{r.isActive ? <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto"/> : <XCircle className="w-5 h-5 text-red-500 mx-auto"/>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RecipientForm({ onDone }: { onDone: () => void }) {
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e: any) => {
    e.preventDefault(); setLoading(true);
    const fd = new FormData(e.target);
    const res = await addSissitioRecipient({
      lastName: fd.get('lastName') as string, firstName: fd.get('firstName') as string,
      afm: fd.get('afm') as string || undefined, phone: fd.get('phone') as string || undefined,
      category: fd.get('category') as string, familyMembers: Number(fd.get('members')) || 1,
      dietaryNeeds: fd.get('dietary') as string || undefined,
    });
    setLoading(false);
    if (res.success) onDone(); else alert(res.error);
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3"><div className="space-y-1"><Label>Επώνυμο *</Label><Input name="lastName" required/></div><div className="space-y-1"><Label>Όνομα *</Label><Input name="firstName" required/></div></div>
      <div className="grid grid-cols-2 gap-3"><div className="space-y-1"><Label>ΑΦΜ *</Label><Input name="afm" required/></div><div className="space-y-1"><Label>Τηλέφωνο</Label><Input name="phone"/></div></div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1"><Label>Κατηγορία</Label><select name="category" className="w-full p-2 border rounded-md text-sm bg-background"><option value="taktikos">Τακτικός</option><option value="ektaktos">Έκτακτος</option><option value="episkeptis">Επισκέπτης</option></select></div>
        <div className="space-y-1"><Label>Αριθμός Μελών Οικογένειας (Μερίδες)</Label><Input type="number" name="members" min="1" defaultValue="1" required/></div>
      </div>
      <div className="space-y-1 p-3 bg-amber-50 border border-amber-100 rounded-lg"><Label className="text-amber-800">Διατροφικές Ιδιαιτερότητες / Ιατρικό Προφίλ</Label><Input name="dietary" placeholder="π.χ. Διαβήτης, Χωρίς Γλουτένη, κλπ"/></div>
      <Button type="submit" disabled={loading} className="w-full">Αποθήκευση</Button>
    </form>
  );
}

// ─── ATTENDANCE VIEW ────────────────────────────────────────────
function AttendanceView() {
  const router = useRouter();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [data, setData] = useState<any[]>([]);
  
  // Real implementation would fetch based on 'date' from server
  // This is a placeholder since the server action takes a date parameter.
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-auto"/>
        <Button variant="outline"><Search className="w-4 h-4 mr-2"/>Ανάκτηση Ημέρας</Button>
      </div>
      <div className="bg-card p-8 text-center text-muted-foreground border rounded-xl border-dashed">
        Επιλέξτε ημερομηνία για να δείτε τη λίστα δικαιούχων και να σημειώσετε παρουσίες.
        <br/><br/>(Για live integration, προσθέστε useTransition hook που τραβάει το getSissitioAttendance)
      </div>
    </div>
  );
}

// ─── KITCHEN VIEW ───────────────────────────────────────────────
function KitchenView({ recipes }: { recipes: any[] }) {
  const router = useRouter();
  const [showLog, setShowLog] = useState(false);
  
  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <Button onClick={() => setShowLog(true)} className="gap-2"><Utensils className="w-4 h-4"/>Καταγραφή Μερίδων Ημέρας</Button>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2">Συνταγολόγιο</CardTitle></CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recipes.map((r: any) => (
              <div key={r.id} className="p-3 border rounded-lg hover:border-primary/50 transition-colors">
                <p className="font-bold">{r.name}</p>
                <div className="flex items-center justify-between mt-2">
                  <Badge variant="outline" className="text-[10px]">{r.category}</Badge>
                  {r.isNistisimo && <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200">Νηστίσιμο</Badge>}
                </div>
              </div>
            ))}
            {recipes.length === 0 && <p className="text-muted-foreground text-sm">Δεν υπάρχουν καταχωρημένες συνταγές.</p>}
          </div>
        </CardContent>
      </Card>
      
      {showLog && (
        <Dialog open={true} onOpenChange={setShowLog}>
          <DialogContent>
            <DialogHeader><DialogTitle>Ημερήσιο Μεριδολόγιο</DialogTitle></DialogHeader>
            <form onSubmit={async (e: any) => {
              e.preventDefault(); const fd = new FormData(e.target);
              await logPortions(fd.get('date') as string, { totalPortions: Number(fd.get('total')), servedPortions: Number(fd.get('served')), leftover: Number(fd.get('leftover')) });
              setShowLog(false); router.refresh();
            }} className="space-y-4">
              <Input type="date" name="date" required defaultValue={new Date().toISOString().split('T')[0]}/>
              <div className="grid grid-cols-3 gap-3">
                <div><Label>Μαγειρεύτηκαν</Label><Input type="number" name="total" required/></div>
                <div><Label>Σερβιρίστηκαν</Label><Input type="number" name="served" required/></div>
                <div><Label>Περίσσεψαν</Label><Input type="number" name="leftover" required/></div>
              </div>
              <Button type="submit" className="w-full">Αποθήκευση</Button>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// ─── INVENTORY VIEW ─────────────────────────────────────────────
function InventoryView({ inventory }: { inventory: any[] }) {
  const router = useRouter();
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg">Αποθήκη Τροφίμων & Υλικών</h3>
        <Button className="gap-2"><Plus className="w-4 h-4"/>Νέο Είδος</Button>
      </div>
      <div className="bg-card border rounded-xl overflow-x-auto shadow-sm">
        <table className="w-full text-sm">
          <thead><tr className="bg-muted/30 text-muted-foreground text-xs uppercase border-b"><th className="p-3 text-left">Είδος</th><th className="p-3 text-left">Κατηγορία</th><th className="p-3 text-right">Υπόλοιπο</th><th className="p-3 text-center">Κατάσταση</th><th className="p-3"></th></tr></thead>
          <tbody className="divide-y">
            {inventory.map((i: any) => {
              const isLow = i.minQuantity && i.quantity <= i.minQuantity;
              return (
                <tr key={i.id} className="hover:bg-muted/10">
                  <td className="p-3 font-medium">{i.name}</td>
                  <td className="p-3 text-xs text-muted-foreground uppercase">{i.category}</td>
                  <td className="p-3 text-right font-bold text-lg">{i.quantity} <span className="text-[10px] text-muted-foreground font-normal">{i.unit}</span></td>
                  <td className="p-3 text-center">{isLow ? <Badge variant="destructive" className="text-[10px]">Χαμηλό Απόθεμα</Badge> : <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 text-[10px]">Επαρκές</Badge>}</td>
                  <td className="p-3 text-right">
                    <Button size="sm" variant="outline" className="gap-1 h-7 text-xs"><Package className="w-3 h-3"/>Κίνηση</Button>
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
