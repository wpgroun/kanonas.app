'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { updateTempleSettings } from '@/actions/settings';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Save, Globe, KeyRound, Mail, MessageSquare, FileText, Hash, HelpCircle, CheckCircle2 } from 'lucide-react';

export default function SettingsClient({ initialData }: { initialData: any }) {
 const [isSaving, setIsSaving] = useState(false);
 const [formData, setFormData] = useState({
 name: initialData.name || '',
 taxId: initialData.taxId || '',
 phoneNumber: initialData.phoneNumber || '',
 address: initialData.address || '',
 city: initialData.city || '',
 email: initialData.email || '',
 slug: initialData.slug || '',
 settings: {
 smtpHost: initialData.settings?.smtpHost || '',
 smtpPort: initialData.settings?.smtpPort || '',
 smtpUser: initialData.settings?.smtpUser || '',
 smtpPass: initialData.settings?.smtpPass || '',
 smsToken: initialData.settings?.smsToken || '',
 viberToken: initialData.settings?.viberToken || '',
 // Protocol Settings
 protocolPrefix: initialData.settings?.protocolPrefix || '',
 protocolStartNumber: initialData.settings?.protocolStartNumber || '1',
 protocolBookYear: initialData.settings?.protocolBookYear || new Date().getFullYear().toString(),
 }
 });

 const handleSave = async () => {
 setIsSaving(true);
 try {
  const res = await updateTempleSettings(formData);
  if (!res.success) throw new Error(res.error);
  toast.success('Οι ρυθμίσεις αποθηκεύτηκαν επιτυχώς!');
 } catch (e: any) {
  toast.error(e.message || 'Αποτυχία αποθήκευσης.');
 } finally {
  setIsSaving(false);
 }
 };

 const completionChecks = [
  { label: 'Ονομασία Ναού', done: !!formData.name },
  { label: 'Email', done: !!formData.email },
  { label: 'Τηλέφωνο', done: !!formData.phoneNumber },
  { label: 'Διεύθυνση', done: !!formData.address },
  { label: 'ΑΦΜ', done: !!formData.taxId },
  { label: 'SMTP Email', done: !!formData.settings.smtpHost },
 ];
 const completionPct = Math.round((completionChecks.filter(c => c.done).length / completionChecks.length) * 100);

 return (
 <Tabs defaultValue="general" className="w-full">
 <TabsList className="mb-4 bg-slate-100 p-1 rounded-xl">
 <TabsTrigger value="general" className="rounded-lg gap-2"><Building2 className="w-4 h-4"/> Βασικά Στοιχεία</TabsTrigger>
 <TabsTrigger value="protocol" className="rounded-lg gap-2"><Hash className="w-4 h-4"/> Πρωτόκολλο</TabsTrigger>
 <TabsTrigger value="gateways" className="rounded-lg gap-2"><KeyRound className="w-4 h-4"/> Πύλες (Email/SMS)</TabsTrigger>
 <TabsTrigger value="web" className="rounded-lg gap-2"><Globe className="w-4 h-4"/> Ιστοσελίδα</TabsTrigger>
 </TabsList>

 {/* Completion Bar */}
 <div className="mb-6 card p-4 flex items-center gap-4">
  <div className="flex-1">
    <div className="flex justify-between items-center mb-1.5">
      <span className="text-xs font-bold text-[var(--text-muted)]">Ολοκλήρωση Προφίλ</span>
      <span className={`text-xs font-black ${completionPct === 100 ? 'text-emerald-600' : 'text-amber-600'}`}>{completionPct}%</span>
    </div>
    <div className="h-2 bg-[var(--background)] rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all ${completionPct === 100 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${completionPct}%` }}/>
    </div>
  </div>
  <div className="flex gap-1.5 flex-wrap">
    {completionChecks.map(c => (
      <span key={c.label} className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${c.done ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-red-50 text-red-500 border-red-200'}`}>
        {c.done ? '✓' : '✗'} {c.label}
      </span>
    ))}
  </div>
 </div>

 {/* GENERAL TAB */}
 <TabsContent value="general">
 <Card className="p-6 border-border rounded-xl shadow-sm">
 <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 border-b pb-2">Προφίλ Ιερού Ναού</h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div>
 <label className="text-xs font-semibold text-[var(--text-muted)] uppercase">Ονομασία Ναού</label>
 <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="mt-1"/>
 </div>
 <div>
 <label className="text-xs font-semibold text-[var(--text-muted)] uppercase">Ιερά Μητρόπολη (μόνο ανάγνωση)</label>
 <Input value={initialData.metropolisName} disabled className="mt-1 bg-slate-100 text-[var(--text-muted)] italic"/>
 </div>
 <div>
 <label className="text-xs font-semibold text-[var(--text-muted)] uppercase">Α.Φ.Μ.</label>
 <Input value={formData.taxId} onChange={e => setFormData({...formData, taxId: e.target.value})} className="mt-1"/>
 </div>
 <div>
 <label className="text-xs font-semibold text-[var(--text-muted)] uppercase">Τηλέφωνο Επικοινωνίας</label>
 <Input value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} className="mt-1"/>
 </div>
 <div className="md:col-span-2">
 <label className="text-xs font-semibold text-[var(--text-muted)] uppercase">Ταχυδρομική Διεύθυνση / Πόλη</label>
 <div className="flex gap-2 mt-1">
 <Input placeholder="Οδός & Αριθμός" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="flex-1"/>
 <Input placeholder="Πόλη / Περιοχή" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-1/3"/>
 </div>
 </div>
 <div>
 <label className="text-xs font-semibold text-[var(--text-muted)] uppercase">Κεντρικό Email Ναού</label>
 <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="mt-1"/>
 </div>
 </div>
 </Card>
 </TabsContent>

 {/* PROTOCOL TAB (NEW!) */}
 <TabsContent value="protocol">
 <Card className="p-6 border-border rounded-xl shadow-sm border-t-4 border-t-amber-500">
 <h3 className="text-lg font-bold text-[var(--foreground)] mb-2 flex items-center gap-2"><Hash className="text-amber-500"/> Ρυθμίσεις Πρωτοκόλλου</h3>
 <p className="text-xs text-[var(--text-muted)] mb-6">Διαμορφώστε τον τρόπο αρίθμησης και εμφάνισης των αριθμών πρωτοκόλλου.</p>
 
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 <div>
  <label className="text-xs font-semibold text-[var(--text-secondary)]">Πρόθεμα (Prefix)</label>
  <Input placeholder="π.χ. ΑΠ- ή ΙΝ-" value={formData.settings.protocolPrefix} onChange={e => setFormData({...formData, settings: {...formData.settings, protocolPrefix: e.target.value}})} className="mt-1 font-mono"/>
  <p className="text-[10px] text-[var(--text-muted)] mt-1">Εμφανίζεται πριν τον αριθμό (π.χ. ΑΠ-1/2026)</p>
 </div>
 <div>
  <label className="text-xs font-semibold text-[var(--text-secondary)]">Αρχικός Αριθμός Έτους</label>
  <Input type="number" value={formData.settings.protocolStartNumber} onChange={e => setFormData({...formData, settings: {...formData.settings, protocolStartNumber: e.target.value}})} className="mt-1 font-mono"/>
  <p className="text-[10px] text-[var(--text-muted)] mt-1">Η αρίθμηση ξεκινά κάθε χρόνο από αυτόν τον αριθμό</p>
 </div>
 <div>
  <label className="text-xs font-semibold text-[var(--text-secondary)]">Τρέχον Έτος Βιβλίου</label>
  <Input type="number" value={formData.settings.protocolBookYear} onChange={e => setFormData({...formData, settings: {...formData.settings, protocolBookYear: e.target.value}})} className="mt-1 font-mono"/>
  <p className="text-[10px] text-[var(--text-muted)] mt-1">Αλλάζει αυτόματα κάθε 1η Ιανουαρίου</p>
 </div>
 </div>

 <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
  <div className="flex items-start gap-3">
    <HelpCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0"/>
    <div className="text-xs text-amber-800">
      <p className="font-bold mb-1">Πώς λειτουργεί η αρίθμηση;</p>
      <p>Το Kanonas <b>αυτόματα</b> βρίσκει τον τελευταίο αριθμό πρωτοκόλλου και δίνει τον επόμενο. Αν ξεκινάτε τώρα ή θέλετε να μεταφέρετε ήδη υπάρχουσα αρίθμηση, ορίστε εδώ τον αρχικό αριθμό.</p>
      <p className="mt-2 font-mono bg-white/60 inline-block px-2 py-1 rounded border border-amber-300">
        Παράδειγμα: {formData.settings.protocolPrefix || ''}{formData.settings.protocolStartNumber || '1'}/{formData.settings.protocolBookYear || new Date().getFullYear()}
      </p>
    </div>
  </div>
 </div>
 </Card>
 </TabsContent>

 {/* GATEWAYS TAB */}
 <TabsContent value="gateways">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <Card className="p-6 border-border rounded-xl shadow-sm border-t-4 border-t-blue-500">
 <h3 className="text-lg font-bold text-[var(--foreground)] mb-2 flex items-center gap-2"><Mail className="text-blue-500"/> Διακομιστής Email (SMTP)</h3>
 <p className="text-xs text-[var(--text-muted)] mb-6">Διαμορφώστε τον δικό σας διακομιστή για μαζικές αποστολές email.</p>
 <div className="space-y-4">
 <div>
 <label className="text-xs font-semibold text-[var(--text-secondary)]">SMTP Host</label>
 <Input placeholder="π.χ. mail.mychurch.gr" value={formData.settings.smtpHost} onChange={e => setFormData({...formData, settings: {...formData.settings, smtpHost: e.target.value}})} className="mt-1"/>
 </div>
 <div>
 <label className="text-xs font-semibold text-[var(--text-secondary)]">SMTP Port</label>
 <Input placeholder="π.χ. 465 ή 587" value={formData.settings.smtpPort} onChange={e => setFormData({...formData, settings: {...formData.settings, smtpPort: e.target.value}})} className="mt-1"/>
 </div>
 <div>
 <label className="text-xs font-semibold text-[var(--text-secondary)]">SMTP Username</label>
 <Input placeholder="π.χ. info@mychurch.gr" value={formData.settings.smtpUser} onChange={e => setFormData({...formData, settings: {...formData.settings, smtpUser: e.target.value}})} className="mt-1"/>
 </div>
 <div>
 <label className="text-xs font-semibold text-[var(--text-secondary)]">SMTP Password</label>
 <Input type="password" placeholder="••••••••" value={formData.settings.smtpPass} onChange={e => setFormData({...formData, settings: {...formData.settings, smtpPass: e.target.value}})} className="mt-1"/>
 </div>
 </div>
 </Card>

 <Card className="p-6 border-border rounded-xl shadow-sm border-t-4 border-t-purple-500">
 <h3 className="text-lg font-bold text-[var(--foreground)] mb-2 flex items-center gap-2"><MessageSquare className="text-purple-500"/> SMS & Viber Πύλες</h3>
 <p className="text-xs text-[var(--text-muted)] mb-6">Auth Tokens του παρόχου σας (Twilio / Apifon) για SMS.</p>
 <div className="space-y-4">
 <div>
 <label className="text-xs font-semibold text-[var(--text-secondary)]">SMS Gateway API Key</label>
 <Input placeholder="Bearer sk_test_..." value={formData.settings.smsToken} onChange={e => setFormData({...formData, settings: {...formData.settings, smsToken: e.target.value}})} className="mt-1"/>
 </div>
 <div>
 <label className="text-xs font-semibold text-[var(--text-secondary)]">Viber Official Bot Token</label>
 <Input placeholder="Κωδικός λογαριασμού Viber Bot" value={formData.settings.viberToken} onChange={e => setFormData({...formData, settings: {...formData.settings, viberToken: e.target.value}})} className="mt-1"/>
 </div>
 </div>
 <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-100">
 <span className="text-xs text-purple-700 block font-semibold mb-1">Πληροφορία</span>
 <span className="text-xs text-purple-600">Αφού συμπληρώσετε το API Key, το Kanonas θα στέλνει αυτόματα μηνύματα στους Πιστούς.</span>
 </div>
 </Card>
 </div>
 </TabsContent>

 {/* WEB TAB */}
 <TabsContent value="web">
 <Card className="p-6 border-border rounded-xl shadow-sm border-l-4 border-l-emerald-500">
 <h3 className="text-lg font-bold text-[var(--foreground)] mb-2 flex items-center gap-2"><Globe className="text-emerald-500"/> Δημόσια Ιστοσελίδα Ναού</h3>
 <p className="text-sm text-[var(--text-secondary)] mb-6">Ορίστε το μοναδικό URL αν θέλετε δυναμική ιστοσελίδα για την Ενορία σας.</p>
 <div>
 <label className="text-xs font-semibold text-[var(--text-muted)] uppercase">URL Slug</label>
 <div className="flex items-center mt-1">
 <span className="bg-slate-100 text-[var(--text-muted)] px-3 py-2 border border-border border-r-0 rounded-l-md font-mono text-sm leading-5">kanonas.app/temple/</span>
 <Input 
 value={formData.slug} 
 onChange={e => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})} 
 className="rounded-l-none font-mono font-bold text-[var(--success)]"
 placeholder="agios-antonios"
 />
 </div>
 <p className="text-xs text-[var(--text-muted)] mt-2">Μόνο μικρά γράμματα και παύλες (-). Δίνεται στους πιστούς.</p>
 </div>
 </Card>
 </TabsContent>

 <div className="mt-6 flex justify-end">
 <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 px-8 py-6 text-sm flex items-center gap-2 rounded-xl shadow-lg shadow-blue-500/20">
 <Save className="w-5 h-5"/> {isSaving ? 'Αποθήκευση...' : 'Αποθήκευση Ρυθμίσεων'}
 </Button>
 </div>
 </Tabs>
);
}
