'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'motion/react'
import {
  Building2, FileText, UserCheck, CheckCircle2, Building,
  ArrowRight, ArrowLeft, Eye, EyeOff, Loader2
} from 'lucide-react'
import { setupTemple } from './actions'
import { OFFICIAL_METROPOLISES } from '@/lib/constants/metropolises'

const STEPS = [
  { id: 1, label: 'Ναός',     icon: Building2 },
  { id: 2, label: 'Διαχ/τής', icon: UserCheck },
  { id: 3, label: 'Ρυθμίσεις', icon: FileText },
  { id: 4, label: 'Έτοιμο',   icon: CheckCircle2 },
]

export default function OnboardingWizard() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isOtherMetropolis, setIsOtherMetropolis] = useState(false)

  const [formData, setFormData] = useState({
    metropolisName: '',
    templeName: '',
    city: '',
    phone: '',
    email: '',
    adminFirstName: '',
    adminLastName: '',
    adminEmail: '',
    adminPassword: '',
    protocolStart: '1',
    masterPassword: '',
  })

  const set = (k: string, v: string) => setFormData(p => ({ ...p, [k]: v }))

  const canNext = () => {
    if (step === 1) return formData.metropolisName.trim() && formData.templeName.trim() && formData.city.trim()
    if (step === 2) return formData.adminFirstName.trim() && formData.adminLastName.trim()
      && formData.adminEmail.includes('@') && formData.adminPassword.length >= 10
    return true
  }

  const handleComplete = async () => {
    setSaving(true)
    try {
      const result = await setupTemple({
        ...formData,
        protocolStart: parseInt(formData.protocolStart) || 1,
      })
      if (!result.success) {
        toast.error(result.error || 'Σφάλμα ρύθμισης')
        setSaving(false)
        return
      }
      setStep(4)
      setTimeout(() => router.push('/admin'), 2000)
    } catch (e) {
      toast.error('Απρόσμενο σφάλμα')
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-4">

      {/* Logo */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-[#59161a] flex items-center justify-center shadow-lg">
            <span className="text-white font-black text-xl" style={{fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "1.3em", paddingRight: "2px"}}>κ</span>
          </div>
          <span className="font-heading font-black text-3xl tracking-widest text-[#2b1f1a]">ΚΑΝΟΝΑΣ</span>
        </div>
        <p className="text-[#736760] font-medium">Ρύθμιση νέου Ιερού Ναού σε 3 βήματα</p>
      </div>

      {/* Stepper */}
      <div className="w-full max-w-xl mb-8">
        <div className="flex items-center">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  step > s.id ? 'bg-[#59161a] border-[#59161a] text-white'
                  : step === s.id ? 'border-[#c3a165] bg-[#c3a165]/10 text-[#59161a]'
                  : 'border-[#e5dfd9] bg-white text-[#a89d96]'
                }`}>
                  {step > s.id ? <CheckCircle2 className="w-5 h-5" /> : <s.icon className="w-4 h-4" />}
                </div>
                <span className={`text-[10px] font-bold mt-1.5 ${step >= s.id ? 'text-[#59161a]' : 'text-[#a89d96]'}`}>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 mb-5 rounded-full transition-all duration-500 ${step > s.id ? 'bg-[#59161a]' : 'bg-[#e5dfd9]'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-xl bg-white rounded-3xl border border-[#e5dfd9] shadow-xl overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-[#59161a] to-[#c3a165]" style={{ width: `${(step / 4) * 100}%`, transition: 'width 0.5s ease' }} />

        <div className="p-8">
          <AnimatePresence mode="wait">
            {/* STEP 1: Temple Details */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <div>
                  <h2 className="text-2xl font-black text-[#2b1f1a] font-heading">Στοιχεία Ναού</h2>
                  <p className="text-[#736760] text-sm mt-1">Εισάγετε τα επίσημα στοιχεία του Ιερού Ναού σας.</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-[#2b1f1a] mb-1.5">Ιερά Μητρόπολη *</label>
                    <select
                      value={isOtherMetropolis ? 'OTHER' : formData.metropolisName}
                      onChange={e => {
                        if (e.target.value === 'OTHER') {
                          setIsOtherMetropolis(true);
                          set('metropolisName', '');
                        } else {
                          setIsOtherMetropolis(false);
                          set('metropolisName', e.target.value);
                        }
                      }}
                      className="w-full px-4 py-3 rounded-xl border border-[#e5dfd9] bg-[#fdfaf7] text-[#2b1f1a] focus:outline-none focus:ring-2 focus:ring-[#c3a165]/50 focus:border-[#c3a165] text-sm transition-all"
                      required={!isOtherMetropolis}
                    >
                      <option value="">Επιλέξτε Μητρόπολη...</option>
                      {OFFICIAL_METROPOLISES.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                      <option value="OTHER">Άλλη Μητρόπολη / Δικαιοδοσία (Εξωτερικού)</option>
                    </select>
                  </div>
                  
                  {isOtherMetropolis && (
                    <div className="animate-fade-in-up">
                      <label className="block text-sm font-bold text-[#2b1f1a] mb-1.5">Ονομασία Μητρόπολης *</label>
                      <input value={formData.metropolisName} onChange={e => set('metropolisName', e.target.value)}
                        placeholder="π.χ. Ιερά Αρχιεπισκοπή Αυστραλίας"
                        className="w-full px-4 py-3 rounded-xl border border-[#e5dfd9] bg-[#fdfaf7] text-[#2b1f1a] focus:outline-none focus:ring-2 focus:ring-[#c3a165]/50 focus:border-[#c3a165] text-sm transition-all"
                        required
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-bold text-[#2b1f1a] mb-1.5">Ονομασία Ναού *</label>
                    <input value={formData.templeName} onChange={e => set('templeName', e.target.value)}
                      placeholder="π.χ. Ι.Ν. Αγίου Γεωργίου Κάτω Πατησίων"
                      className="w-full px-4 py-3 rounded-xl border border-[#e5dfd9] bg-[#fdfaf7] text-[#2b1f1a] focus:outline-none focus:ring-2 focus:ring-[#c3a165]/50 focus:border-[#c3a165] text-sm transition-all" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-[#2b1f1a] mb-1.5">Πόλη *</label>
                      <input value={formData.city} onChange={e => set('city', e.target.value)}
                        placeholder="Αθήνα"
                        className="w-full px-4 py-3 rounded-xl border border-[#e5dfd9] bg-[#fdfaf7] text-[#2b1f1a] focus:outline-none focus:ring-2 focus:ring-[#c3a165]/50 focus:border-[#c3a165] text-sm transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#2b1f1a] mb-1.5">Τηλέφωνο</label>
                      <input value={formData.phone} onChange={e => set('phone', e.target.value)}
                        placeholder="210..."
                        className="w-full px-4 py-3 rounded-xl border border-[#e5dfd9] bg-[#fdfaf7] text-[#2b1f1a] focus:outline-none focus:ring-2 focus:ring-[#c3a165]/50 focus:border-[#c3a165] text-sm transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#2b1f1a] mb-1.5">Email Ναού</label>
                    <input value={formData.email} onChange={e => set('email', e.target.value)}
                      placeholder="info@agiosgeorgios.gr" type="email"
                      className="w-full px-4 py-3 rounded-xl border border-[#e5dfd9] bg-[#fdfaf7] text-[#2b1f1a] focus:outline-none focus:ring-2 focus:ring-[#c3a165]/50 focus:border-[#c3a165] text-sm transition-all" />
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Admin User */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <div>
                  <h2 className="text-2xl font-black text-[#2b1f1a] font-heading">Λογαριασμός Διαχειριστή</h2>
                  <p className="text-[#736760] text-sm mt-1">Δημιουργήστε τον κύριο λογαριασμό (Προϊστάμενος/Γραμματεία).</p>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-[#2b1f1a] mb-1.5">Όνομα *</label>
                      <input value={formData.adminFirstName} onChange={e => set('adminFirstName', e.target.value)}
                        placeholder="Γεώργιος"
                        className="w-full px-4 py-3 rounded-xl border border-[#e5dfd9] bg-[#fdfaf7] text-[#2b1f1a] focus:outline-none focus:ring-2 focus:ring-[#c3a165]/50 focus:border-[#c3a165] text-sm transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#2b1f1a] mb-1.5">Επώνυμο *</label>
                      <input value={formData.adminLastName} onChange={e => set('adminLastName', e.target.value)}
                        placeholder="Παπαδόπουλος"
                        className="w-full px-4 py-3 rounded-xl border border-[#e5dfd9] bg-[#fdfaf7] text-[#2b1f1a] focus:outline-none focus:ring-2 focus:ring-[#c3a165]/50 focus:border-[#c3a165] text-sm transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#2b1f1a] mb-1.5">Email (για σύνδεση) *</label>
                    <input value={formData.adminEmail} onChange={e => set('adminEmail', e.target.value)}
                      placeholder="admin@agiosgeorgios.gr" type="email"
                      className="w-full px-4 py-3 rounded-xl border border-[#e5dfd9] bg-[#fdfaf7] text-[#2b1f1a] focus:outline-none focus:ring-2 focus:ring-[#c3a165]/50 focus:border-[#c3a165] text-sm transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#2b1f1a] mb-1.5">Κωδικός Πρόσβασης * (τουλ. 6 χαρακτήρες)</label>
                    <div className="relative">
                      <input value={formData.adminPassword} onChange={e => set('adminPassword', e.target.value)}
                        type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                        className="w-full px-4 py-3 rounded-xl border border-[#e5dfd9] bg-[#fdfaf7] text-[#2b1f1a] focus:outline-none focus:ring-2 focus:ring-[#c3a165]/50 focus:border-[#c3a165] text-sm transition-all pr-12" />
                      <button onClick={() => setShowPassword(p => !p)} type="button"
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#a89d96] hover:text-[#59161a] transition-colors">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Settings */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <div>
                  <h2 className="text-2xl font-black text-[#2b1f1a] font-heading">Ρυθμίσεις Πρωτοκόλλου</h2>
                  <p className="text-[#736760] text-sm mt-1">Από πού να ξεκινήσει η αρίθμηση των εγγράφων σας;</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#2b1f1a] mb-1.5">Αρχικός Αριθμός Πρωτοκόλλου</label>
                  <input value={formData.protocolStart} onChange={e => set('protocolStart', e.target.value)}
                    type="number" min="1" placeholder="1"
                    className="w-full px-4 py-3 rounded-xl border border-[#e5dfd9] bg-[#fdfaf7] text-[#2b1f1a] focus:outline-none focus:ring-2 focus:ring-[#c3a165]/50 focus:border-[#c3a165] text-sm transition-all" />
                  <p className="text-xs text-[#a89d96] mt-2">Αν έχετε ήδη πρωτόκολλο, εισάγετε τον τρέχοντα αριθμό για να συνεχίσει από εκεί.</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#2b1f1a] mb-1.5">Κωδικός Εγκατάστασης (Master Password) *</label>
                  <input value={formData.masterPassword} onChange={e => set('masterPassword', e.target.value)}
                    type="password" placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl border border-[#e5dfd9] bg-[#fdfaf7] text-[#2b1f1a] focus:outline-none focus:ring-2 focus:ring-[#c3a165]/50 focus:border-[#c3a165] text-sm transition-all" />
                  <p className="text-xs text-[#a89d96] mt-2">Απαιτείται ο κωδικός που σας έχει δοθεί από τη διαχείριση του συστήματος.</p>
                </div>

                {/* Summary box */}
                <div className="bg-[#fdfaf7] border border-[#e5dfd9] rounded-2xl p-5 space-y-2 text-sm">
                  <p className="font-bold text-[#2b1f1a] mb-3">📋 Σύνοψη Ρύθμισης:</p>
                  <div className="flex justify-between"><span className="text-[#736760]">Μητρόπολη:</span><span className="font-semibold text-[#2b1f1a]">{formData.metropolisName}</span></div>
                  <div className="flex justify-between"><span className="text-[#736760]">Ναός:</span><span className="font-semibold text-[#2b1f1a]">{formData.templeName}</span></div>
                  <div className="flex justify-between"><span className="text-[#736760]">Διαχειριστής:</span><span className="font-semibold text-[#2b1f1a]">{formData.adminFirstName} {formData.adminLastName}</span></div>
                  <div className="flex justify-between"><span className="text-[#736760]">Email σύνδεσης:</span><span className="font-semibold text-[#2b1f1a]">{formData.adminEmail}</span></div>
                </div>
              </motion.div>
            )}

            {/* STEP 4: Success */}
            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-8 text-center space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                  className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-emerald-50 border-4 border-emerald-200 mx-auto"
                >
                  <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                </motion.div>
                <h2 className="text-2xl font-black text-[#2b1f1a] font-heading">Ο Ναός σας είναι έτοιμος!</h2>
                <p className="text-[#736760]">Μεταφέρεστε στο Dashboard...</p>
                <Loader2 className="w-6 h-6 animate-spin text-[#c3a165] mx-auto" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          {step < 4 && (
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-[#e5dfd9]">
              <button onClick={() => setStep(s => s - 1)} disabled={step === 1}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#e5dfd9] text-[#736760] font-bold text-sm hover:border-[#c3a165] hover:text-[#59161a] transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                <ArrowLeft className="w-4 h-4" /> Πίσω
              </button>

              {step < 3 ? (
                <button onClick={() => setStep(s => s + 1)} disabled={!canNext()}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#59161a] text-white font-bold text-sm hover:bg-[#7b2126] transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed">
                  Επόμενο <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button onClick={handleComplete} disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#59161a] text-white font-bold text-sm hover:bg-[#7b2126] transition-all shadow-md disabled:opacity-60">
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Αποθήκευση...</> : <>Ολοκλήρωση <CheckCircle2 className="w-4 h-4" /></>}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <p className="mt-6 text-xs text-[#a89d96] text-center">
        Έχετε ήδη λογαριασμό; <a href="/login" className="text-[#59161a] font-bold hover:underline">Σύνδεση</a>
      </p>
    </div>
  )
}
