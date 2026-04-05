'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Droplet, Users, Plus, Search, Calendar, HeartPulse, Building2, Clock, CheckCircle2, TrendingUp, Filter, AlertCircle
} from 'lucide-react';
import {
  addBloodDonor, recordDonation, createBloodDrive, updateDriveStatus
} from '@/actions/bloodbank';

// ─── MAIN COMPONENT ─────────────────────────────────────────────
export default function BloodBankModule({ dashboard, donors, drives }: any) {
  const [activeView, setActiveView] = useState<'dashboard' | 'donors' | 'drives' | 'emergency'>('dashboard');

  return (
    <div className="space-y-6">
      {/* View Tabs */}
      <div className="flex gap-1 bg-muted/30 p-1 rounded-xl w-fit border border-border flex-wrap">
        {[
          { id: 'dashboard', label: 'Σύνοψη', icon: TrendingUp },
          { id: 'donors', label: 'Μητρώο Δοτών', icon: Users },
          { id: 'drives', label: 'Εκστρατείες', icon: Calendar },
          { id: 'emergency', label: 'Επείγουσα Ανάγκη', icon: HeartPulse },
        ].map(tab => (
          <Button key={tab.id} variant={activeView === tab.id ? 'primary' : 'ghost'}
            className={`rounded-lg gap-1.5 text-xs shadow-none ${activeView === tab.id ? 'bg-red-50 text-red-700 hover:bg-red-100' : ''}`}
            onClick={() => setActiveView(tab.id as any)}>
            <tab.icon className="w-4 h-4"/>{tab.label}
          </Button>
        ))}
      </div>

      {activeView === 'dashboard' && <BloodBankDashboard stats={dashboard} />}
      {activeView === 'donors' && <DonorsView donors={donors} />}
      {activeView === 'drives' && <DrivesView drives={drives} />}
      {activeView === 'emergency' && <EmergencyView />}
    </div>
  );
}

// ─── DASHBOARD ──────────────────────────────────────────────────
function BloodBankDashboard({ stats }: { stats: any }) {
  if (!stats) return <p>Φόρτωση...</p>;

  return (
    <div className="space-y-6 animate-in fade-in flex flex-col">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Donors */}
        <Card className="border-border/50">
          <CardContent className="p-5 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
               <p className="text-sm text-muted-foreground font-medium">Ενεργοί Δότες</p>
               <div className="bg-red-100 p-2 rounded-lg text-red-600"><Users className="w-4 h-4"/></div>
            </div>
            <div>
              <p className="text-3xl font-black">{stats.totalActive}</p>
              <p className="text-xs text-muted-foreground mt-1">Συνολικά εγγεγραμμένοι</p>
            </div>
          </CardContent>
        </Card>
        
        {/* Eligible Now */}
        <Card className="border-emerald-200 bg-emerald-50/30">
          <CardContent className="p-5 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
               <p className="text-sm text-emerald-800 font-bold">Επιλέξιμοι Τώρα</p>
               <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600"><CheckCircle2 className="w-4 h-4"/></div>
            </div>
            <div>
              <p className="text-3xl font-black text-emerald-600">{stats.eligibleNow}</p>
              <p className="text-xs text-emerald-700 mt-1">+, {stats.soonEligible} επιλέξιμοι &lt;14 μέρες</p>
            </div>
          </CardContent>
        </Card>

        {/* Donations this year */}
        <Card className="border-border/50">
          <CardContent className="p-5 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
               <p className="text-sm text-muted-foreground font-medium">Δωρεές (Τρέχον Έτος)</p>
               <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><Droplet className="w-4 h-4"/></div>
            </div>
            <div>
              <p className="text-3xl font-black">{stats.thisYearDonations}</p>
              <p className="text-xs text-muted-foreground mt-1">vs {stats.prevYearDonations} πέρυσι</p>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Drives */}
        <Card className="border-border/50">
          <CardContent className="p-5 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
               <p className="text-sm text-muted-foreground font-medium">Επερχόμενες Εκστρατείες</p>
               <div className="bg-amber-100 p-2 rounded-lg text-amber-600"><Calendar className="w-4 h-4"/></div>
            </div>
            <div>
              <p className="text-3xl font-black">{stats.upcomingDrives?.length || 0}</p>
              <p className="text-xs text-muted-foreground mt-1">Τις επόμενες 30 ημέρες</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base text-muted-foreground">Ομάδες Αίματος</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.bloodTypeDistribution?.map((g: any) => {
                const pct = stats.totalActive > 0 ? Math.round((g.count / stats.totalActive) * 100) : 0;
                return (
                  <div key={g.type}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-bold w-8">{g.type}</span>
                      <span className="text-muted-foreground">{g.count} δότες ({pct}%)</span>
                    </div>
                    <Progress value={pct} className="h-2 bg-muted [&>div]:bg-red-500" />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── DONORS VIEW ────────────────────────────────────────────────
function DonorsView({ donors }: { donors: any[] }) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showReg, setShowReg] = useState(false);

  const filtered = donors.filter((d: any) => 
    (!filterType || d.bloodType === filterType) &&
    `${d.lastName} ${d.firstName} ${d.phone || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 animate-in fade-in">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-2 flex-1 max-w-lg">
          <div className="flex items-center bg-muted/40 border border-border rounded-xl px-3 py-2 flex-1">
            <Search className="w-4 h-4 text-muted-foreground mr-2"/>
            <input className="bg-transparent outline-none flex-1 text-sm" placeholder="Αναζήτηση..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="bg-card border rounded-xl px-3 py-2 text-sm outline-none" value={filterType} onChange={e => setFilterType(e.target.value)}>
             <option value="">Όλες οι Ομάδες</option>
             {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <Dialog open={showReg} onOpenChange={setShowReg}>
          <DialogTrigger asChild><Button className="gap-2 bg-red-600 hover:bg-red-700 text-white"><Plus className="w-4 h-4"/>Νέος Δότης</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Εγγραφή Εθελοντή Αιμοδότη</DialogTitle></DialogHeader>
            <DonorForm onDone={() => { setShowReg(false); router.refresh(); }} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card border rounded-xl overflow-x-auto shadow-sm">
        <table className="w-full text-sm">
          <thead><tr className="bg-muted/30 text-muted-foreground text-xs uppercase border-b"><th className="p-3 text-left">Ονοματεπώνυμο</th><th className="p-3 text-center">Ομάδα</th><th className="p-3 text-center">Δωρεές</th><th className="p-3">Επιλεξιμότητα</th><th className="p-3 text-right">Ενέργειες</th></tr></thead>
          <tbody className="divide-y">
            {filtered.map((d: any) => {
               const elig = d.eligibility;
               return (
                 <tr key={d.id} className="hover:bg-muted/10">
                   <td className="p-3">
                     <div className="font-bold">{d.lastName} {d.firstName}</div>
                     <div className="text-xs text-muted-foreground">{d.phone || '—'}</div>
                   </td>
                   <td className="p-3 text-center">
                     <span className="px-2 py-1 bg-red-100 text-red-700 rounded-lg font-bold text-lg">{d.bloodType}</span>
                   </td>
                   <td className="p-3 text-center font-bold text-muted-foreground">{d.totalDonations}</td>
                   <td className="p-3">
                     {elig.status === 'eligible' && <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 gap-1"><CheckCircle2 className="w-3 h-3"/>Επιλέξιμος</Badge>}
                     {elig.status === 'soon' && <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 gap-1"><AlertCircle className="w-3 h-3"/>Σε {elig.daysUntil} ημέρες</Badge>}
                     {elig.status === 'ineligible' && <div><Badge variant="outline" className="border-red-200 bg-red-50 text-red-700 gap-1"><Droplet className="w-3 h-3"/>Αναμονή ({elig.daysUntil}ημ.)</Badge><div className="text-[10px] text-muted-foreground mt-1">Από: {new Date(d.lastDonation).toLocaleDateString('el-GR')}</div></div>}
                   </td>
                   <td className="p-3 text-right">
                     <LogDonationDialog donor={d} onDone={() => router.refresh()} />
                   </td>
                 </tr>
               )
            })}
            {filtered.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Δε βρέθηκαν δότες.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DonorForm({ onDone }: { onDone: () => void }) {
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e: any) => {
    e.preventDefault(); setLoading(true);
    const fd = new FormData(e.target);
    await addBloodDonor({
      lastName: fd.get('lastName') as string, firstName: fd.get('firstName') as string,
      phone: fd.get('phone') as string || undefined, bloodType: fd.get('bloodType') as string,
      gender: fd.get('gender') as string || undefined, dateOfBirth: fd.get('dob') as string || undefined,
    });
    setLoading(false); onDone();
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Επώνυμο *</Label><Input name="lastName" required/></div>
        <div><Label>Όνομα *</Label><Input name="firstName" required/></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Τηλέφωνο</Label><Input name="phone"/></div>
        <div>
          <Label>Ομάδα Αίματος *</Label>
          <select name="bloodType" className="w-full p-2 border rounded-md text-sm" required>
            <option value="">— Επιλογή —</option>
            {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Ημ/νία Γέννησης</Label><Input name="dob" type="date"/></div>
        <div>
          <Label>Φύλο</Label>
          <select name="gender" className="w-full p-2 border rounded-md text-sm">
            <option value="">— Επιλογή —</option><option value="M">Άνδρας</option><option value="F">Γυναίκα</option>
          </select>
        </div>
      </div>
      <Button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white">Αποθήκευση</Button>
    </form>
  )
}

function LogDonationDialog({ donor, onDone }: { donor: any, onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e: any) => {
    e.preventDefault(); setLoading(true);
    const fd = new FormData(e.target);
    const res = await recordDonation(donor.id, {
      date: fd.get('date') as string,
      hospital: fd.get('hospital') as string || undefined,
      hemoglobinLevel: Number(fd.get('hemo')) || undefined,
    });
    setLoading(false); 
    if (res.success) { setOpen(false); onDone(); } else alert(res.error);
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm" variant="ghost" className="h-8 gap-1"><Plus className="w-3 h-3"/>Νέα Δωρεά</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Καταγραφή Δωρεάς ({donor.lastName} {donor.firstName})</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-red-50 p-3 rounded-lg border border-red-100 mb-4">
             <p className="text-sm font-bold text-red-800 mb-1">Προσοχή στους κανόνες!</p>
             <p className="text-xs text-red-600">Η καταγραφή θα θέσει το δότη σε περίοδο αναμονής 56 ημερών πριν την επόμενη δωρεά.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Ημερομηνία *</Label><Input type="date" name="date" required defaultValue={new Date().toISOString().split('T')[0]}/></div>
            <div><Label>Νοσοκομείο / Κέντρο</Label><Input name="hospital"/></div>
          </div>
          <div><Label>Αιμοσφαιρίνη (Hgb g/dL - προαιρετικό)</Label><Input type="number" step="0.1" name="hemo"/></div>
          <Button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white">Καταχώρηση Ευχαριστήριου</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── DRIVES VIEW ────────────────────────────────────────────────
function DrivesView({ drives }: { drives: any[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-4 animate-in fade-in">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg">Εκστρατείες & Εθελοντικές Αιμοδοσίες</h3>
        <Dialog open={showForm} onOpenChange={setShowForm}>
           <DialogTrigger asChild><Button className="bg-red-600 hover:bg-red-700 text-white gap-2"><Plus className="w-4 h-4"/>Νέα Εκστρατεία</Button></DialogTrigger>
           <DialogContent className="max-w-xl">
             <DialogHeader><DialogTitle>Προγραμματισμός Εκστρατείας</DialogTitle></DialogHeader>
             <form onSubmit={async (e: any) => {
               e.preventDefault(); const fd = new FormData(e.target);
               await createBloodDrive({ name: fd.get('name') as string, date: fd.get('date') as string, location: fd.get('location') as string || undefined, hospitalName: fd.get('hospital') as string || undefined, target: Number(fd.get('target')) || undefined });
               setShowForm(false); router.refresh();
             }} className="space-y-4">
               <div><Label>Τίτλος *</Label><Input name="name" required placeholder="π.χ. Εαρινή Αιμοδοσία Αγ. Δημητρίου"/></div>
               <div className="grid grid-cols-2 gap-3">
                 <div><Label>Ημερομηνία *</Label><Input type="date" name="date" required/></div>
                 <div><Label>Τοποθεσία</Label><Input name="location" placeholder="Αίθουσα Ι. Ναού"/></div>
               </div>
               <div className="grid grid-cols-2 gap-3">
                 <div><Label>Συνεργαζόμενο Νοσοκομείο</Label><Input name="hospital" placeholder="π.χ. Γενικό Κρατικό"/></div>
                 <div><Label>Στόχος (Φιάλες)</Label><Input type="number" name="target" placeholder="π.χ. 50"/></div>
               </div>
               <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white">Δημιουργία</Button>
             </form>
           </DialogContent>
        </Dialog>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {drives.map((d: any) => {
          const collected = d.donations?.reduce((acc: number, curr: any) => acc + curr.units, 0) || 0;
          const target = d.target || 1;
          const pct = Math.min(100, Math.round((collected / target) * 100));

          return (
            <Card key={d.id} className="relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500"></div>
              <CardContent className="p-5 pl-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-bold text-lg">{d.name}</h4>
                    <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><Calendar className="w-3 h-3"/>{new Date(d.date).toLocaleDateString('el-GR')} {d.location && `• ${d.location}`}</span>
                  </div>
                  <Badge variant={d.status === 'COMPLETED' ? 'outline' : 'primary'} className={d.status === 'PLANNED' ? 'bg-amber-100 text-amber-700 hover:bg-amber-100' : ''}>
                    {d.status === 'PLANNED' ? 'Προσεχής' : d.status === 'ACTIVE' ? 'Σε εξέλιξη' : 'Ολοκληρωμένη'}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm mt-4 bg-muted/30 p-3 rounded-lg">
                  <div className="flex-1">
                    <div className="flex justify-between mb-1 text-xs">
                      <span className="font-semibold text-red-700">{collected} φιάλες</span>
                      <span className="text-muted-foreground">Στόχος: {d.target || '-'}</span>
                    </div>
                    <Progress value={pct} className="h-2 [&>div]:bg-red-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {drives.length === 0 && <p className="text-muted-foreground p-4">Δεν βρέθηκαν εκστρατείες.</p>}
      </div>
    </div>
  );
}

// ─── EMERGENCY VIEW ─────────────────────────────────────────────
function EmergencyView() {
  const [bloodType, setBloodType] = useState('A+');
  const [donors, setDonors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    // A real implementation would call findEligibleDonorsForType from actions
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  };

  return (
    <div className="space-y-6 animate-in fade-in max-w-3xl">
      <Card className="border-red-200">
        <CardHeader className="bg-red-50/50 pb-4 border-b border-red-100">
          <CardTitle className="text-red-700 flex items-center gap-2"><HeartPulse className="w-5 h-5"/>Επείγουσα Αναζήτηση Συμβατών Δοτών</CardTitle>
          <CardDescription>Βρείτε άμεσα επιλέξιμους δότες για αιμοδοσία βάσει συμβατότητας.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-4">
               <div>
                  <Label>Ομάδα Αίματος Ασθενούς</Label>
                  <select className="w-full mt-1 p-3 border rounded-xl text-lg font-bold bg-muted/20" value={bloodType} onChange={e => setBloodType(e.target.value)}>
                    {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
               </div>
               <div className="bg-muted p-4 rounded-xl">
                 <p className="text-xs text-muted-foreground font-bold uppercase mb-2">Συμβατοί Δότες μπορούν να είναι:</p>
                 <div className="flex gap-2 flex-wrap text-sm font-bold">
                   {getCompatiblePart(bloodType).map((t: string) => <span key={t} className="px-2 py-1 bg-background rounded-md border border-border shadow-sm text-red-600">{t}</span>)}
                 </div>
               </div>
               <Button onClick={handleSearch} disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white h-12 text-base shadow-lg shadow-red-500/20">
                 {loading ? 'Αναζήτηση...' : 'Εύρεση Επιλέξιμων Δοτών'}
               </Button>
            </div>
            
            <div className="md:w-1/2 flex flex-col justify-center border-l pl-6">
               <div className="text-center p-6 border-2 border-dashed border-red-200 rounded-2xl bg-red-50">
                 {loading ? <p>Φόρτωση...</p> : (
                   <>
                     <HeartPulse className="w-12 h-12 mx-auto text-red-300 mb-2"/>
                     <p className="text-muted-foreground text-sm">Κάντε αναζήτηση για να δείτε τους επιλέξιμους δότες (άνω των 56 ημερών από την τελευταία δωρεά) που μπορούν να δώσουν αίμα.</p>
                   </>
                 )}
               </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Quick helper
function getCompatiblePart(recipient: string) {
  const map: any = {
    'AB+': ['O-','O+','A-','A+','B-','B+','AB-','AB+'],
    'AB-': ['O-','A-','B-','AB-'],
    'A+': ['O-','O+','A-','A+'],
    'A-': ['O-','A-'],
    'B+': ['O-','O+','B-','B+'],
    'B-': ['O-','B-'],
    'O+': ['O-','O+'],
    'O-': ['O-']
  };
  return map[recipient] || [];
}
