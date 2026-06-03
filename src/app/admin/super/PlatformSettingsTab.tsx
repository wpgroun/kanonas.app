"use client"

import { useState, useEffect } from 'react'
import { Save, Eye, EyeOff, Server, CreditCard, Mail, MessageSquare, Search, Send, Smartphone } from 'lucide-react'
import { getPlatformSettings, savePlatformSettings, testVivaConnection, testSmtpConnection, testSmsConnection } from '@/actions/superadmin'
import { toast } from 'sonner'

export function PlatformSettingsTab() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<any>({
    vivaClientId: '', vivaClientSecret: '', vivaSourceCode: '', vivaWebhookKey: '', vivaDemo: true,
    bankIban: '', bankBeneficiary: '', bankName: '',
    smtpHost: '', smtpPort: 587, smtpUser: '', smtpPass: '',
    yubotoApiKey: '', yubotoSenderId: ''
  })
  
  const [showVivaSecret, setShowVivaSecret] = useState(false)
  const [showVivaWebhook, setShowVivaWebhook] = useState(false)
  const [showSmtpPass, setShowSmtpPass] = useState(false)
  const [showYubotoKey, setShowYubotoKey] = useState(false)

  const [testingViva, setTestingViva] = useState(false)
  const [testingSmtp, setTestingSmtp] = useState(false)
  const [testingSms, setTestingSms] = useState(false)
  const [testPhone, setTestPhone] = useState('')

  useEffect(() => {
    getPlatformSettings().then((res: any) => {
      if (res) {
        setSettings({
          ...settings,
          ...res,
          vivaDemo: res.vivaDemo !== undefined ? res.vivaDemo : true
        })
      }
      setLoading(false)
    })
  }, [])

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setSaving(true)
    try {
      const res = await savePlatformSettings(settings)
      if (res.success) {
        toast.success("Οι ρυθμίσεις αποθηκεύτηκαν επιτυχώς!")
      } else {
        toast.error("Σφάλμα αποθήκευσης")
      }
    } catch {
      toast.error("Σφάλμα αποθήκευσης")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-12 text-center text-sm font-bold animate-pulse text-[var(--text-muted)]">Φόρτωση ρυθμίσεων...</div>

  return (
    <div className="space-y-6">
      
      {/* VIVA WALLET */}
      <div className="bg-[var(--surface)] p-6 rounded-2xl border border-[var(--border)] shadow-sm">
        <h2 className="text-lg font-black mb-4 flex items-center gap-2"><CreditCard className="w-5 h-5 text-indigo-500" /> Viva Wallet (Smart Checkout)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-[var(--text-muted)]">Client ID</label>
            <input type="text" value={settings.vivaClientId || ''} onChange={e => setSettings({...settings, vivaClientId: e.target.value})} className="input w-full mt-1" />
          </div>
          <div>
            <label className="text-xs font-bold text-[var(--text-muted)]">Client Secret</label>
            <div className="relative mt-1">
              <input type={showVivaSecret ? "text" : "password"} value={settings.vivaClientSecret || ''} onChange={e => setSettings({...settings, vivaClientSecret: e.target.value})} className="input w-full pr-10" />
              <button onClick={() => setShowVivaSecret(!showVivaSecret)} className="absolute right-2 top-2.5 text-[var(--text-muted)] hover:text-[var(--foreground)]">{showVivaSecret ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}</button>
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-[var(--text-muted)]">Source Code</label>
            <input type="text" value={settings.vivaSourceCode || ''} onChange={e => setSettings({...settings, vivaSourceCode: e.target.value})} className="input w-full mt-1 font-mono" />
          </div>
          <div>
            <label className="text-xs font-bold text-[var(--text-muted)]">Webhook Key</label>
            <div className="relative mt-1">
              <input type={showVivaWebhook ? "text" : "password"} value={settings.vivaWebhookKey || ''} onChange={e => setSettings({...settings, vivaWebhookKey: e.target.value})} className="input w-full pr-10 font-mono" />
              <button onClick={() => setShowVivaWebhook(!showVivaWebhook)} className="absolute right-2 top-2.5 text-[var(--text-muted)] hover:text-[var(--foreground)]">{showVivaWebhook ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}</button>
            </div>
          </div>
          <div className="md:col-span-2 flex items-center gap-3">
             <input type="checkbox" id="vivaDemo" checked={settings.vivaDemo} onChange={e => setSettings({...settings, vivaDemo: e.target.checked})} className="w-4 h-4 text-indigo-600 rounded" />
             <label htmlFor="vivaDemo" className="text-sm font-bold text-[var(--foreground)]">Ενεργό Demo Mode (demo.vivapayments.com)</label>
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-3 items-center">
          <button 
            onClick={async () => {
              setTestingViva(true);
              const res = await testVivaConnection();
              if (res.success) toast.success(res.message, { duration: 5000 });
              else toast.error(res.message, { duration: 5000 });
              setTestingViva(false);
            }} 
            disabled={testingViva || saving} 
            className="btn btn-outline gap-2"
          >
            {testingViva ? <span className="animate-spin text-lg block w-4 h-4 rounded-full border-2 border-indigo-500 border-t-transparent"/> : "🔍"} Δοκιμή Σύνδεσης
          </button>
          <button onClick={handleSave} disabled={saving} className="btn btn-primary"><Save className="w-4 h-4 mr-2"/> Αποθήκευση Viva</button>
        </div>
      </div>

      {/* BANK TRANSFER */}
      <div className="bg-[var(--surface)] p-6 rounded-2xl border border-[var(--border)] shadow-sm">
        <h2 className="text-lg font-black mb-4 flex items-center gap-2"><Server className="w-5 h-5 text-emerald-500" /> Τραπεζική Μεταφορά</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-[var(--text-muted)]">Τράπεζα (Όνομα)</label>
            <input type="text" value={settings.bankName || ''} onChange={e => setSettings({...settings, bankName: e.target.value})} className="input w-full mt-1" />
          </div>
          <div>
            <label className="text-xs font-bold text-[var(--text-muted)]">Δικαιούχος</label>
            <input type="text" value={settings.bankBeneficiary || ''} onChange={e => setSettings({...settings, bankBeneficiary: e.target.value})} className="input w-full mt-1" />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-[var(--text-muted)]">IBAN</label>
            <input type="text" value={settings.bankIban || ''} onChange={e => setSettings({...settings, bankIban: e.target.value})} className="input w-full mt-1 font-mono tracking-widest" />
          </div>
        </div>
        <div className="mt-4 flex justify-end items-center gap-3">
          <p className="text-sm text-[var(--success)] flex items-center mr-auto">ℹ️ Τα στοιχεία τραπεζικής μεταφοράς εμφανίζονται σωστά στους ενορίτες.</p>
          <button onClick={handleSave} disabled={saving} className="btn btn-primary"><Save className="w-4 h-4 mr-2"/> Αποθήκευση Τράπεζας</button>
        </div>
      </div>

      {/* SMTP EMAIL */}
      <div className="bg-[var(--surface)] p-6 rounded-2xl border border-[var(--border)] shadow-sm">
        <h2 className="text-lg font-black mb-4 flex items-center gap-2"><Mail className="w-5 h-5 text-amber-500" /> System Email (SMTP)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-[var(--text-muted)]">SMTP Host</label>
            <input type="text" value={settings.smtpHost || ''} onChange={e => setSettings({...settings, smtpHost: e.target.value})} className="input w-full mt-1" />
          </div>
          <div>
            <label className="text-xs font-bold text-[var(--text-muted)]">SMTP Port</label>
            <input type="number" value={settings.smtpPort || ''} onChange={e => setSettings({...settings, smtpPort: Number(e.target.value)})} className="input w-full mt-1" />
          </div>
          <div>
            <label className="text-xs font-bold text-[var(--text-muted)]">SMTP Username</label>
            <input type="text" value={settings.smtpUser || ''} onChange={e => setSettings({...settings, smtpUser: e.target.value})} className="input w-full mt-1" />
          </div>
          <div>
            <label className="text-xs font-bold text-[var(--text-muted)]">SMTP Password</label>
            <div className="relative mt-1">
              <input type={showSmtpPass ? "text" : "password"} value={settings.smtpPass || ''} onChange={e => setSettings({...settings, smtpPass: e.target.value})} className="input w-full pr-10" />
              <button onClick={() => setShowSmtpPass(!showSmtpPass)} className="absolute right-2 top-2.5 text-[var(--text-muted)] hover:text-[var(--foreground)]">{showSmtpPass ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}</button>
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-3 items-center">
          <button 
            onClick={async () => {
              setTestingSmtp(true);
              const res = await testSmtpConnection();
              if (res.success) toast.success(res.message, { duration: 5000 });
              else toast.error(res.message, { duration: 5000 });
              setTestingSmtp(false);
            }} 
            disabled={testingSmtp || saving} 
            className="btn btn-outline gap-2"
          >
            {testingSmtp ? <span className="animate-spin text-lg block w-4 h-4 rounded-full border-2 border-amber-500 border-t-transparent"/> : "📧"} Αποστολή Δοκιμαστικού
          </button>
          <button onClick={handleSave} disabled={saving} className="btn btn-primary"><Save className="w-4 h-4 mr-2"/> Αποθήκευση Email</button>
        </div>
      </div>

      {/* YUBOTO SMS */}
      <div className="bg-[var(--surface)] p-6 rounded-2xl border border-[var(--border)] shadow-sm">
        <h2 className="text-lg font-black mb-4 flex items-center gap-2"><MessageSquare className="w-5 h-5 text-purple-500" /> Platform SMS (Yuboto)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-[var(--text-muted)]">API Key</label>
            <div className="relative mt-1">
              <input type={showYubotoKey ? "text" : "password"} value={settings.yubotoApiKey || ''} onChange={e => setSettings({...settings, yubotoApiKey: e.target.value})} className="input w-full pr-10" />
              <button onClick={() => setShowYubotoKey(!showYubotoKey)} className="absolute right-2 top-2.5 text-[var(--text-muted)] hover:text-[var(--foreground)]">{showYubotoKey ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}</button>
            </div>
          </div>
          <div>
            <label className="flex justify-between text-xs font-bold text-[var(--text-muted)]">
              <span>Default Sender ID (Λατινικά αλφαριθμητικά)</span>
              <span className={((settings.yubotoSenderId?.length || 0) > 11) ? "text-red-500" : ""}>{settings.yubotoSenderId?.length || 0}/11</span>
            </label>
            <input type="text" maxLength={11} value={settings.yubotoSenderId || ''} onChange={e => {
              const val = e.target.value.replace(/[^A-Za-z0-9]/g, '');
              setSettings({...settings, yubotoSenderId: val})
            }} className="input w-full mt-1 font-mono" placeholder="π.χ. Kanonas" />
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-3 items-center">
          <div className="flex items-center gap-2 mr-auto">
            <input 
              type="text" 
              placeholder="+306912345678" 
              value={testPhone} 
              onChange={e => setTestPhone(e.target.value)} 
              className="input w-36 text-sm" 
            />
            <button 
              onClick={async () => {
                setTestingSms(true);
                const res = await testSmsConnection(testPhone);
                if (res.success) toast.success(res.message, { duration: 5000 });
                else toast.error(res.message, { duration: 5000 });
                setTestingSms(false);
              }} 
              disabled={testingSms || saving || !testPhone} 
              className="btn btn-outline gap-2"
            >
              {testingSms ? <span className="animate-spin text-lg block w-4 h-4 rounded-full border-2 border-purple-500 border-t-transparent"/> : "📱"} Αποστολή SMS
            </button>
          </div>
          <button onClick={handleSave} disabled={saving} className="btn btn-primary"><Save className="w-4 h-4 mr-2"/> Αποθήκευση SMS</button>
        </div>
      </div>

    </div>
  )
}
