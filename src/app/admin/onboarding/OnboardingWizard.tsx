'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { toast } from 'sonner'
import {
  Building2, Users, FileText, CheckCircle2, ArrowRight, ArrowLeft,
  Loader2, Upload, X, Plus, UserPlus, Eye, EyeOff,
  LayoutDashboard, ClipboardList, Settings, SkipForward,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { getOnboardingData, saveTempleProfile, completeOnboarding } from './actions'
import { addStaffToTemple } from '@/actions/users'

type OnboardingData = Awaited<ReturnType<typeof getOnboardingData>>

const STEPS = [
  { id: 1, label: 'Ναός', icon: Building2 },
  { id: 2, label: 'Προσωπικό', icon: Users },
  { id: 3, label: 'Έγγραφα', icon: FileText },
  { id: 4, label: 'Έτοιμο', icon: CheckCircle2 },
]

const DOC_TYPES = [
  { type: 'GAMOS',     label: 'Γάμος',      description: 'Πρότυπο εγγράφου τέλεσης Γάμου' },
  { type: 'VAPTISI',   label: 'Βάπτιση',    description: 'Πρότυπο εγγράφου τέλεσης Βάπτισης' },
  { type: 'KIDEIA',    label: 'Κηδεία',     description: 'Πρότυπο εγγράφου Κηδείας' },
  { type: 'MNIMOSINO', label: 'Μνημόσυνο',  description: 'Πρότυπο εγγράφου Μνημοσύνου' },
]

export default function OnboardingWizard() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [data, setData] = useState<OnboardingData | null>(null)
  const [pageLoading, setPageLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Step 1
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [taxId, setTaxId] = useState('')
  const [protocolPrefix, setProtocolPrefix] = useState('ΑΠ-')
  const [protocolStart, setProtocolStart] = useState('1')

  // Step 2
  const [showAddStaff, setShowAddStaff] = useState(false)
  const [staffEmail, setStaffEmail] = useState('')
  const [staffFirst, setStaffFirst] = useState('')
  const [staffLast, setStaffLast] = useState('')
  const [staffPassword, setStaffPassword] = useState('')
  const [staffRoleId, setStaffRoleId] = useState('')
  const [showStaffPwd, setShowStaffPwd] = useState(false)
  const [addingStaff, setAddingStaff] = useState(false)
  const [staffList, setStaffList] = useState<OnboardingData['users']>([])

  // Step 3
  const [uploadingFor, setUploadingFor] = useState<string | null>(null)
  const [uploadedTypes, setUploadedTypes] = useState<Set<string>>(new Set())
  const [uploadNames, setUploadNames] = useState<Record<string, string>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pendingDocType, setPendingDocType] = useState<string | null>(null)

  useEffect(() => {
    getOnboardingData().then(d => {
      setData(d)
      setAddress(d.temple.address)
      setCity(d.temple.city)
      setPhone(d.temple.phoneNumber)
      setEmail(d.temple.email)
      setTaxId(d.temple.taxId)
      setProtocolPrefix(d.temple.protocolPrefix)
      setProtocolStart(d.temple.protocolStartNumber)
      setStaffList(d.users)
      setUploadedTypes(new Set(d.templates.map(t => t.docType)))
      const names: Record<string, string> = {}
      d.templates.forEach(t => { names[t.docType] = t.nameEl })
      setUploadNames(names)
      setPageLoading(false)
    })
  }, [])

  // ── Step 1 ───────────────────────────────────────────────────────────────
  async function handleSaveProfile() {
    setSaving(true)
    const res = await saveTempleProfile({ address, city, phoneNumber: phone, email, taxId, protocolPrefix, protocolStartNumber: protocolStart })
    setSaving(false)
    if (!res.success) { toast.error(res.error || 'Σφάλμα αποθήκευσης'); return }
    toast.success('Τα στοιχεία αποθηκεύτηκαν!')
    setStep(2)
  }

  // ── Step 2 ───────────────────────────────────────────────────────────────
  async function handleAddStaff() {
    if (!staffEmail || !staffFirst || !staffLast || !staffPassword) {
      toast.error('Συμπληρώστε όλα τα πεδία'); return
    }
    setAddingStaff(true)
    const res = await addStaffToTemple({
      email: staffEmail,
      firstName: staffFirst,
      lastName: staffLast,
      roleId: staffRoleId || (data?.roles[0]?.id ?? ''),
      initialPassword: staffPassword,
    })
    setAddingStaff(false)
    if (!res.success) { toast.error(res.error || 'Σφάλμα'); return }
    toast.success('Το μέλος προστέθηκε!')
    setStaffList(prev => [...prev, {
      id: Date.now().toString(),
      isHeadPriest: false,
      name: `${staffFirst} ${staffLast}`,
      email: staffEmail,
      role: data?.roles.find(r => r.id === staffRoleId)?.name || 'Εφημέριος',
    }])
    setStaffEmail(''); setStaffFirst(''); setStaffLast('')
    setStaffPassword(''); setStaffRoleId('')
    setShowAddStaff(false)
  }

  // ── Step 3 ───────────────────────────────────────────────────────────────
  function triggerUpload(docType: string) {
    setPendingDocType(docType)
    fileInputRef.current?.click()
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !pendingDocType) return
    e.target.value = ''
    const docLabel = DOC_TYPES.find(d => d.type === pendingDocType)?.label || pendingDocType
    setUploadingFor(pendingDocType)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('docType', pendingDocType)
    fd.append('nameEl', `Πρότυπο ${docLabel}`)
    try {
      const res = await fetch('/api/documents/upload', { method: 'POST', body: fd })
      if (!res.ok) throw new Error()
      setUploadedTypes(prev => new Set([...prev, pendingDocType!]))
      setUploadNames(prev => ({ ...prev, [pendingDocType!]: `Πρότυπο ${docLabel}` }))
      toast.success(`Πρότυπο ${docLabel} ανέβηκε!`)
    } catch {
      toast.error('Σφάλμα ανεβάσματος αρχείου')
    } finally {
      setUploadingFor(null)
      setPendingDocType(null)
    }
  }

  // ── Step 4 ───────────────────────────────────────────────────────────────
  async function handleComplete() {
    setSaving(true)
    await completeOnboarding()
    setSaving(false)
    setStep(4)
  }

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
        <Loader2 className="w-8 h-8 animate-spin text-[#59161a]"/>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-start pt-10 pb-16 px-4">

      <input ref={fileInputRef} type="file" accept=".docx,.doc,.pdf" className="hidden" onChange={handleFileChange}/>

      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#59161a] flex items-center justify-center shadow-lg">
            <span className="text-white font-black" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '1.2em' }}>κ</span>
          </div>
          <span className="font-heading font-black text-2xl tracking-widest text-[#2b1f1a]">ΚΑΝΟΝΑΣ</span>
        </div>
        <p className="text-[#736760] text-sm font-medium">Γρήγορη Παραμετροποίηση Ναού</p>
      </div>

      {/* Stepper */}
      <div className="w-full max-w-2xl mb-6">
        <div className="flex items-center">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  step > s.id  ? 'bg-[#59161a] border-[#59161a] text-white'
                  : step === s.id ? 'border-[#c3a165] bg-[#c3a165]/10 text-[#59161a]'
                  : 'border-[#e5dfd9] bg-white text-[#a89d96]'
                }`}>
                  {step > s.id ? <CheckCircle2 className="w-5 h-5"/> : <s.icon className="w-4 h-4"/>}
                </div>
                <span className={`text-[10px] font-bold mt-1.5 ${step >= s.id ? 'text-[#59161a]' : 'text-[#a89d96]'}`}>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 mb-5 rounded-full transition-all duration-500 ${step > s.id ? 'bg-[#59161a]' : 'bg-[#e5dfd9]'}`}/>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-2xl bg-white rounded-3xl border border-[#e5dfd9] shadow-xl overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-[#59161a] to-[#c3a165]"
          style={{ width: `${(step / 4) * 100}%`, transition: 'width 0.5s ease' }}/>

        <div className="p-8">
          <AnimatePresence mode="wait">

            {/* ── STEP 1: Στοιχεία Ναού ─────────────────────────────── */}
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <div>
                  <h2 className="text-2xl font-black text-[#2b1f1a] font-heading">Στοιχεία Ναού</h2>
                  <p className="text-[#736760] text-sm mt-1">Συμπληρώστε τα βασικά στοιχεία που θα εμφανίζονται στα έγγραφα.</p>
                </div>

                <div className="bg-[#fdfaf7] border border-[#e5dfd9] rounded-xl px-4 py-2.5 text-sm flex flex-wrap gap-x-4 gap-y-1">
                  <span><span className="text-[#a89d96]">Ναός:</span> <strong className="text-[#2b1f1a]">{data?.temple.name}</strong></span>
                  <span><span className="text-[#a89d96]">Μητρόπολη:</span> <strong className="text-[#59161a]">{data?.temple.metropolisName}</strong></span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[#2b1f1a] font-bold text-sm">Διεύθυνση</Label>
                    <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="π.χ. Αθηνάς 12" className="rounded-xl border-[#e5dfd9] bg-[#fdfaf7]"/>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[#2b1f1a] font-bold text-sm">Πόλη *</Label>
                    <Input value={city} onChange={e => setCity(e.target.value)} placeholder="π.χ. Αθήνα" className="rounded-xl border-[#e5dfd9] bg-[#fdfaf7]"/>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[#2b1f1a] font-bold text-sm">Τηλέφωνο</Label>
                    <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="210..." className="rounded-xl border-[#e5dfd9] bg-[#fdfaf7]"/>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[#2b1f1a] font-bold text-sm">Email Ναού</Label>
                    <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="info@naos.gr" className="rounded-xl border-[#e5dfd9] bg-[#fdfaf7]"/>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[#2b1f1a] font-bold text-sm">Α.Φ.Μ.</Label>
                    <Input value={taxId} onChange={e => setTaxId(e.target.value)} placeholder="9 ψηφία" className="rounded-xl border-[#e5dfd9] bg-[#fdfaf7] font-mono"/>
                  </div>
                </div>

                <div className="border-t border-[#e5dfd9] pt-4 space-y-3">
                  <p className="text-xs font-bold text-[#2b1f1a] uppercase tracking-wide">Ρυθμίσεις Πρωτοκόλλου</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[#2b1f1a] font-bold text-sm">Πρόθεμα</Label>
                      <Input value={protocolPrefix} onChange={e => setProtocolPrefix(e.target.value)} placeholder="ΑΠ-" className="rounded-xl border-[#e5dfd9] bg-[#fdfaf7] font-mono"/>
                      <p className="text-xs text-[#a89d96]">π.χ. ΑΠ- → ΑΠ-0001</p>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[#2b1f1a] font-bold text-sm">Αρχικός Αριθμός</Label>
                      <Input type="number" min="1" value={protocolStart} onChange={e => setProtocolStart(e.target.value)} className="rounded-xl border-[#e5dfd9] bg-[#fdfaf7]"/>
                      <p className="text-xs text-[#a89d96]">Αν έχετε ήδη πρωτόκολλο</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── STEP 2: Προσωπικό ─────────────────────────────────── */}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div>
                  <h2 className="text-2xl font-black text-[#2b1f1a] font-heading">Προσωπικό & Χρήστες</h2>
                  <p className="text-[#736760] text-sm mt-1">Προσθέστε τα μέλη που θα χρησιμοποιούν το σύστημα.</p>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {staffList.map(u => (
                    <div key={u.id} className="flex items-center gap-3 bg-[#fdfaf7] border border-[#e5dfd9] rounded-xl px-4 py-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#59161a]/10 text-[#59161a] flex items-center justify-center font-bold text-sm shrink-0">
                        {u.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#2b1f1a] text-sm truncate">{u.name}</p>
                        <p className="text-xs text-[#a89d96] truncate">{u.email}</p>
                      </div>
                      <Badge className={`text-xs shrink-0 border-0 ${u.isHeadPriest ? 'bg-[#59161a] text-white' : 'bg-[#c3a165]/20 text-[#59161a]'}`}>
                        {u.isHeadPriest ? 'Προϊστάμενος' : u.role}
                      </Badge>
                    </div>
                  ))}
                </div>

                {showAddStaff ? (
                  <div className="border border-[#c3a165]/40 rounded-2xl p-4 bg-[#fdfaf7] space-y-3">
                    <p className="font-bold text-sm text-[#2b1f1a]">Νέο Μέλος Προσωπικού</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs font-bold text-[#2b1f1a]">Όνομα *</Label>
                        <Input value={staffFirst} onChange={e => setStaffFirst(e.target.value)} placeholder="Γεώργιος" className="rounded-lg text-sm border-[#e5dfd9]"/>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-bold text-[#2b1f1a]">Επώνυμο *</Label>
                        <Input value={staffLast} onChange={e => setStaffLast(e.target.value)} placeholder="Παπαδόπουλος" className="rounded-lg text-sm border-[#e5dfd9]"/>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-bold text-[#2b1f1a]">Email *</Label>
                      <Input type="email" value={staffEmail} onChange={e => setStaffEmail(e.target.value)} placeholder="email@example.com" className="rounded-lg text-sm border-[#e5dfd9]"/>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs font-bold text-[#2b1f1a]">Κωδικός *</Label>
                        <div className="relative">
                          <Input type={showStaffPwd ? 'text' : 'password'} value={staffPassword}
                            onChange={e => setStaffPassword(e.target.value)} placeholder="min. 6 χαρακτήρες"
                            className="rounded-lg text-sm border-[#e5dfd9] pr-9"/>
                          <button type="button" onClick={() => setShowStaffPwd(p => !p)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#a89d96]">
                            {showStaffPwd ? <EyeOff className="w-3.5 h-3.5"/> : <Eye className="w-3.5 h-3.5"/>}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-bold text-[#2b1f1a]">Ρόλος</Label>
                        <select value={staffRoleId} onChange={e => setStaffRoleId(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-[#e5dfd9] bg-white text-sm text-[#2b1f1a] focus:outline-none focus:ring-1 focus:ring-[#c3a165]">
                          {data?.roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button onClick={() => setShowAddStaff(false)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#e5dfd9] text-[#736760] text-sm font-bold hover:border-[#c3a165] transition-all">
                        <X className="w-3.5 h-3.5"/> Ακύρωση
                      </button>
                      <button onClick={handleAddStaff} disabled={addingStaff}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#59161a] text-white text-sm font-bold hover:bg-[#7b2126] transition-all disabled:opacity-50">
                        {addingStaff ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <UserPlus className="w-3.5 h-3.5"/>}
                        Προσθήκη
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setShowAddStaff(true)}
                    className="w-full border-2 border-dashed border-[#c3a165]/50 rounded-2xl py-3 text-sm font-bold text-[#c3a165] hover:border-[#c3a165] hover:bg-[#c3a165]/5 transition-all flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4"/> Προσθήκη Μέλους Προσωπικού
                  </button>
                )}

                <p className="text-xs text-[#a89d96] text-center">Μπορείτε να προσθέσετε περισσότερους χρήστες αργότερα από τις <strong>Ρυθμίσεις → Χρήστες</strong></p>
              </motion.div>
            )}

            {/* ── STEP 3: Πρότυπα Εγγράφων ─────────────────────────── */}
            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <div>
                  <h2 className="text-2xl font-black text-[#2b1f1a] font-heading">Πρότυπα Εγγράφων</h2>
                  <p className="text-[#736760] text-sm mt-1">Ανεβάστε τα .docx αρχεία που χρησιμοποιείτε για κάθε Μυστήριο.</p>
                </div>

                <div className="space-y-3">
                  {DOC_TYPES.map(dt => {
                    const uploaded = uploadedTypes.has(dt.type)
                    const isUploading = uploadingFor === dt.type
                    return (
                      <div key={dt.type} className={`flex items-center gap-4 rounded-2xl border px-4 py-3 transition-all ${uploaded ? 'border-emerald-200 bg-emerald-50' : 'border-[#e5dfd9] bg-[#fdfaf7]'}`}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${uploaded ? 'bg-emerald-100' : 'bg-[#59161a]/10'}`}>
                          {uploaded
                            ? <CheckCircle2 className="w-5 h-5 text-emerald-600"/>
                            : <FileText className="w-5 h-5 text-[#59161a]"/>
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-[#2b1f1a]">{dt.label}</p>
                          <p className="text-xs text-[#a89d96] truncate">
                            {uploaded ? (uploadNames[dt.type] || `Πρότυπο ${dt.label}`) : dt.description}
                          </p>
                        </div>
                        <button onClick={() => triggerUpload(dt.type)} disabled={isUploading}
                          className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all disabled:opacity-50 ${
                            uploaded
                              ? 'border border-emerald-300 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-[#59161a] text-white hover:bg-[#7b2126]'
                          }`}>
                          {isUploading
                            ? <><Loader2 className="w-3.5 h-3.5 animate-spin"/> Ανέβασμα...</>
                            : uploaded
                              ? <><Upload className="w-3.5 h-3.5"/> Αντικατάσταση</>
                              : <><Upload className="w-3.5 h-3.5"/> Ανέβασμα</>
                          }
                        </button>
                      </div>
                    )
                  })}
                </div>

                <p className="text-xs text-[#a89d96] text-center">
                  Υποστηρίζονται .docx με μεταβλητές σε αγκύλες{' '}
                  <code className="bg-[#f0ebe5] px-1 rounded">[ΌνομαΜεταβλητής]</code>.
                  Μπορείτε να τα αλλάξετε αργότερα από τις <strong>Ρυθμίσεις → Πρότυπα</strong>.
                </p>
              </motion.div>
            )}

            {/* ── STEP 4: Ολοκλήρωση ───────────────────────────────── */}
            {step === 4 && (
              <motion.div key="s4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-6 text-center space-y-6">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                  className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-emerald-50 border-4 border-emerald-200 mx-auto">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500"/>
                </motion.div>
                <div>
                  <h2 className="text-2xl font-black text-[#2b1f1a] font-heading">Ο Ναός είναι έτοιμος!</h2>
                  <p className="text-[#736760] mt-1.5 text-sm">Μπορείτε πλέον να χρησιμοποιήσετε πλήρως το σύστημα.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
                  {[
                    { icon: LayoutDashboard, label: 'Επισκόπηση', href: '/admin', desc: 'Dashboard ναού' },
                    { icon: ClipboardList, label: 'Αιτήσεις', href: '/admin/requests', desc: 'Διαχείριση αιτημάτων' },
                    { icon: Settings, label: 'Ρυθμίσεις', href: '/admin/settings', desc: 'Περαιτέρω ρυθμίσεις' },
                  ].map(item => (
                    <a key={item.href} href={item.href}
                      className="flex items-center gap-3 border border-[#e5dfd9] rounded-xl px-4 py-3 hover:border-[#c3a165] hover:bg-[#fdfaf7] transition-all group">
                      <item.icon className="w-5 h-5 text-[#59161a] shrink-0"/>
                      <div>
                        <p className="font-bold text-sm text-[#2b1f1a] group-hover:text-[#59161a]">{item.label}</p>
                        <p className="text-xs text-[#a89d96]">{item.desc}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          {/* Navigation */}
          {step < 4 && (
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-[#e5dfd9]">
              <button onClick={() => step > 1 ? setStep(s => s - 1) : router.push('/admin')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#e5dfd9] text-[#736760] font-bold text-sm hover:border-[#c3a165] hover:text-[#59161a] transition-all">
                <ArrowLeft className="w-4 h-4"/> {step > 1 ? 'Πίσω' : 'Dashboard'}
              </button>

              <div className="flex items-center gap-2">
                {(step === 2 || step === 3) && (
                  <button onClick={() => step === 3 ? handleComplete() : setStep(s => s + 1)}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[#a89d96] font-bold text-sm hover:text-[#736760] transition-all">
                    <SkipForward className="w-3.5 h-3.5"/> Παράλειψη
                  </button>
                )}

                {step === 1 && (
                  <button onClick={handleSaveProfile} disabled={saving || !city.trim()}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#59161a] text-white font-bold text-sm hover:bg-[#7b2126] transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed">
                    {saving
                      ? <><Loader2 className="w-4 h-4 animate-spin"/> Αποθήκευση...</>
                      : <>Αποθήκευση & Επόμενο <ArrowRight className="w-4 h-4"/></>
                    }
                  </button>
                )}
                {step === 2 && (
                  <button onClick={() => setStep(3)}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#59161a] text-white font-bold text-sm hover:bg-[#7b2126] transition-all shadow-md">
                    Επόμενο <ArrowRight className="w-4 h-4"/>
                  </button>
                )}
                {step === 3 && (
                  <button onClick={handleComplete} disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#59161a] text-white font-bold text-sm hover:bg-[#7b2126] transition-all shadow-md disabled:opacity-60">
                    {saving
                      ? <><Loader2 className="w-4 h-4 animate-spin"/> Ολοκλήρωση...</>
                      : <>Ολοκλήρωση <CheckCircle2 className="w-4 h-4"/></>
                    }
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <p className="mt-6 text-xs text-[#a89d96] text-center">
        Μπορείτε να επιστρέψετε ανά πάσα στιγμή από τις{' '}
        <a href="/admin/settings" className="text-[#59161a] font-bold hover:underline">Ρυθμίσεις</a>
      </p>
    </div>
  )
}
