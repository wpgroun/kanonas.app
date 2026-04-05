const fs = require('fs');
let content = fs.readFileSync('src/app/admin/settings/SettingsClient.tsx', 'utf8');

const targetStr = `  {/* GATEWAYS TAB */}
  <TabsContent value="gateways">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <Card className="p-6 border-border rounded-xl shadow-sm border-t-4 border-t-blue-500">
  <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2"><Mail className="text-blue-500"/> Mail Server (SMTP)</h3>
  <p className="text-xs text-gray-500 mb-6">Διαμορφώστε τον δικό σας διακομιστή (π.χ. server ενορίας) για μαζικές αποστολές email.</p>
  
  <div className="space-y-4">
  <div>
  <label className="text-xs font-semibold text-gray-600">SMTP Host</label>
  <Input placeholder="π.χ. mail.mychurch.gr"value={formData.settings.smtpHost} onChange={e => setFormData({...formData, settings: {...formData.settings, smtpHost: e.target.value}})} className="mt-1"/>
  </div>
  <div>
  <label className="text-xs font-semibold text-gray-600">SMTP Port</label>
  <Input placeholder="π.χ. 465 ή 587"value={formData.settings.smtpPort} onChange={e => setFormData({...formData, settings: {...formData.settings, smtpPort: e.target.value}})} className="mt-1"/>
  </div>
  <div>
  <label className="text-xs font-semibold text-gray-600">SMTP Username</label>
  <Input placeholder="π.χ. info@mychurch.gr"value={formData.settings.smtpUser} onChange={e => setFormData({...formData, settings: {...formData.settings, smtpUser: e.target.value}})} className="mt-1"/>
  </div>
  <div>
  <label className="text-xs font-semibold text-gray-600">SMTP Password</label>
  <Input type="password"placeholder="••••••••"value={formData.settings.smtpPass} onChange={e => setFormData({...formData, settings: {...formData.settings, smtpPass: e.target.value}})} className="mt-1"/>
  </div>
  </div>
  </Card>

  <Card className="p-6 border-border rounded-xl shadow-sm border-t-4 border-t-purple-500">
  <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2"><MessageSquare className="text-purple-500"/> SMS & Viber Gateways</h3>
  <p className="text-xs text-gray-500 mb-6">Αποθηκεύστε τα Auth Tokens του παρόχου σας (Twilio / Apifon) για SMS Alerts.</p>
  
  <div className="space-y-4">
  <div>
  <label className="text-xs font-semibold text-gray-600">SMS Gateway API Key</label>
  <Input placeholder="Bearer sk_test_..."value={formData.settings.smsToken} onChange={e => setFormData({...formData, settings: {...formData.settings, smsToken: e.target.value}})} className="mt-1"/>
  </div>
  <div>
  <label className="text-xs font-semibold text-gray-600">Viber Official Bot Token</label>
  <Input placeholder="Κωδικός λογαριασμού Viber Bot"value={formData.settings.viberToken} onChange={e => setFormData({...formData, settings: {...formData.settings, viberToken: e.target.value}})} className="mt-1"/>
  </div>
  </div>
  
  <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-100">
  <span className="text-xs text-purple-700 block font-semibold mb-1">Πληροφορία</span>
  <span className="text-xs text-purple-600">Αφού συμπληρώσετε το API Key σας, το Kanonas θα μπορεί να στέλνει μηνύματα στους Πιστούς με την ολοκλήρωση π.χ. Πιστοποιητικών.</span>
  </div>
  </Card>
  </div>
  </TabsContent>`;

const replacementStr = `  {/* GATEWAYS TAB */}
  <TabsContent value="gateways">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <Card className="p-6 border-border rounded-xl shadow-sm border-t-4 border-t-blue-500">
  <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2"><Mail className="text-blue-500"/> Ομαδική Αποστολή Email</h3>
  <p className="text-xs text-gray-500 mb-6">Τα μηνύματα δρομολογούνται κεντρικά μέσω των SaaS Server του Kanonas. Ορίστε μόνο τα στοιχεία Ενορίας.</p>
  
  <div className="space-y-4">
  <div>
  <label className="text-xs font-semibold text-gray-600">Όνομα Αποστολέα (Sender Name)</label>
  <Input placeholder="π.χ. Ι.Ν. Αγίου Δημητρίου"value={formData.settings.smtpUser} onChange={e => setFormData({...formData, settings: {...formData.settings, smtpUser: e.target.value}})} className="mt-1"/>
  </div>
  <div>
  <label className="text-xs font-semibold text-gray-600">Θέμα / Πρόθεμα</label>
  <Input placeholder="ΕΝΗΜΕΡΩΣΗ ΑΠΟ ΤΗΝ ΕΝΟΡΙΑ"value={formData.settings.smtpHost} onChange={e => setFormData({...formData, settings: {...formData.settings, smtpHost: e.target.value}})} className="mt-1"/>
  </div>
  </div>
  </Card>

  <Card className="p-6 border-border rounded-xl shadow-sm border-t-4 border-t-purple-500">
  <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2"><MessageSquare className="text-purple-500"/> SMS & Viber Αποστολές</h3>
  <p className="text-xs text-gray-500 mb-6">Ορίστε το Sender ID σας για την αποστολή SMS μέσω του Kanonas.</p>
  
  <div className="space-y-4">
  <div>
  <label className="text-xs font-semibold text-gray-600">Sender ID (Έως 11 αγγλικοί χαρακτήρες)</label>
  <Input placeholder="π.χ. AGIOS DIMIT" maxLength={11} value={formData.settings.smsToken} onChange={e => setFormData({...formData, settings: {...formData.settings, smsToken: e.target.value.substring(0,11).toUpperCase()}})} className="mt-1"/>
  </div>
  </div>
  </Card>
  </div>
  </TabsContent>`;

if (content.includes('Mail Server (SMTP)')) {
    content = content.replace(targetStr, replacementStr);
    fs.writeFileSync('src/app/admin/settings/SettingsClient.tsx', content, 'utf8');
    console.log('patched settings UI!');
} else {
    console.log('not found');
}
