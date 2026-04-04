'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { updateTempleSettings } from '@/actions/settings';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Save, Globe, KeyRound, Mail, MessageSquare } from 'lucide-react';

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
       viberToken: initialData.settings?.viberToken || ''
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

  return (
    <Tabs defaultValue="general" className="w-full">
      <TabsList className="mb-4 bg-slate-100 p-1 rounded-xl">
        <TabsTrigger value="general" className="rounded-lg gap-2"><Building2 className="w-4 h-4"/> Βασικά Στοιχεία</TabsTrigger>
        <TabsTrigger value="gateways" className="rounded-lg gap-2"><KeyRound className="w-4 h-4"/> Gateways (Mail & SMS)</TabsTrigger>
        <TabsTrigger value="web" className="rounded-lg gap-2"><Globe className="w-4 h-4"/> Web & Widgets</TabsTrigger>
      </TabsList>

      {/* GENERAL TAB */}
      <TabsContent value="general">
        <Card className="p-6 border-border rounded-xl shadow-sm">
           <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Προφίλ Ιερού Ναού</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Ονομασία Ναού</label>
                  <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="mt-1" />
              </div>
              <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Ιερά Μητρόπολη (Read-Only)</label>
                  <Input value={initialData.metropolisName} disabled className="mt-1 bg-slate-100 text-gray-500 italic" />
              </div>
              <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Α.Φ.Μ.</label>
                  <Input value={formData.taxId} onChange={e => setFormData({...formData, taxId: e.target.value})} className="mt-1" />
              </div>
              <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Τηλέφωνο Επικοινωνίας</label>
                  <Input value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} className="mt-1" />
              </div>
              <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Ταχυδρομική Διεύθυνση / Πόλη</label>
                  <div className="flex gap-2 mt-1">
                     <Input placeholder="Οδός & Αριθμός" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="flex-1" />
                     <Input placeholder="Πόλη / Περιοχή" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-1/3" />
                  </div>
              </div>
              <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Κεντρικό Email Ναού</label>
                  <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="mt-1" />
              </div>
           </div>
        </Card>
      </TabsContent>

      {/* GATEWAYS TAB */}
      <TabsContent value="gateways">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 border-border rounded-xl shadow-sm border-t-4 border-t-blue-500">
               <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2"><Mail className="text-blue-500"/> Mail Server (SMTP)</h3>
               <p className="text-xs text-gray-500 mb-6">Διαμορφώστε τον δικό σας διακομιστή (π.χ. server ενορίας) για μαζικές αποστολές email.</p>
               
               <div className="space-y-4">
                  <div>
                      <label className="text-xs font-semibold text-gray-600">SMTP Host</label>
                      <Input placeholder="π.χ. mail.mychurch.gr" value={formData.settings.smtpHost} onChange={e => setFormData({...formData, settings: {...formData.settings, smtpHost: e.target.value}})} className="mt-1" />
                  </div>
                  <div>
                      <label className="text-xs font-semibold text-gray-600">SMTP Port</label>
                      <Input placeholder="π.χ. 465 ή 587" value={formData.settings.smtpPort} onChange={e => setFormData({...formData, settings: {...formData.settings, smtpPort: e.target.value}})} className="mt-1" />
                  </div>
                  <div>
                      <label className="text-xs font-semibold text-gray-600">SMTP Username</label>
                      <Input placeholder="π.χ. info@mychurch.gr" value={formData.settings.smtpUser} onChange={e => setFormData({...formData, settings: {...formData.settings, smtpUser: e.target.value}})} className="mt-1" />
                  </div>
                  <div>
                      <label className="text-xs font-semibold text-gray-600">SMTP Password</label>
                      <Input type="password" placeholder="••••••••" value={formData.settings.smtpPass} onChange={e => setFormData({...formData, settings: {...formData.settings, smtpPass: e.target.value}})} className="mt-1" />
                  </div>
               </div>
            </Card>

            <Card className="p-6 border-border rounded-xl shadow-sm border-t-4 border-t-purple-500">
               <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2"><MessageSquare className="text-purple-500"/> SMS & Viber Gateways</h3>
               <p className="text-xs text-gray-500 mb-6">Αποθηκεύστε τα Auth Tokens του παρόχου σας (Twilio / Apifon) για SMS Alerts.</p>
               
               <div className="space-y-4">
                  <div>
                      <label className="text-xs font-semibold text-gray-600">SMS Gateway API Key</label>
                      <Input placeholder="Bearer sk_test_..." value={formData.settings.smsToken} onChange={e => setFormData({...formData, settings: {...formData.settings, smsToken: e.target.value}})} className="mt-1" />
                  </div>
                  <div>
                      <label className="text-xs font-semibold text-gray-600">Viber Official Bot Token</label>
                      <Input placeholder="Κωδικός λογαριασμού Viber Bot" value={formData.settings.viberToken} onChange={e => setFormData({...formData, settings: {...formData.settings, viberToken: e.target.value}})} className="mt-1" />
                  </div>
               </div>
               
               <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-100">
                  <span className="text-xs text-purple-700 block font-semibold mb-1">Πληροφορία</span>
                  <span className="text-xs text-purple-600">Αφού συμπληρώσετε το API Key σας, το Kanonas θα μπορεί να στέλνει μηνύματα στους Πιστούς με την ολοκλήρωση π.χ. Πιστοποιητικών.</span>
               </div>
            </Card>
        </div>
      </TabsContent>

      {/* WEB & MINI SITE TAB */}
      <TabsContent value="web">
        <Card className="p-6 border-border rounded-xl shadow-sm border-l-4 border-l-emerald-500">
           <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2"><Globe className="text-emerald-500"/> Public Kanonas Mini-Site URL</h3>
           <p className="text-sm text-gray-600 mb-6">Ορίστε το μοναδικό αναγνωριστικό SEO εάν θέλετε το Kanonas να δημιουργήσει δυναμική ιστοσελίδα (landing page) για την Ενορία σας.</p>

           <div>
               <label className="text-xs font-semibold text-gray-500 uppercase">Ιστοσελίδα Ναού URL (Slug)</label>
               <div className="flex items-center mt-1">
                  <span className="bg-slate-100 text-gray-500 px-3 py-2 border border-border border-r-0 rounded-l-md font-mono text-sm leading-5">kanonas.app/temple/</span>
                  <Input 
                     value={formData.slug} 
                     onChange={e => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})} 
                     className="rounded-l-none font-mono font-bold text-emerald-600" 
                     placeholder="agios-antonios"
                  />
               </div>
               <p className="text-xs text-gray-400 mt-2">Επιτρέπονται μόνο μικρά αγγλικά γράμματα και παύλες (-). Αυτό το URL μπορεί να δοθεί απ' ευθείας στους πιστούς.</p>
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
