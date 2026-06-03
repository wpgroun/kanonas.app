'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
 Church, MapPin, User, FileText, CheckCircle2,
 ArrowRight, ArrowLeft, Loader2, Building2
} from 'lucide-react'
import { completeOnboarding, getMetropolisList } from '@/actions/onboarding'
import { useEffect } from 'react'

const steps = [
 { id: 1, label: 'Ναός', icon: Church },
 { id: 2, label: 'Μητρόπολη', icon: Building2 },
 { id: 3, label: 'Ιερέας', icon: User },
 { id: 4, label: 'Ολοκλήρωση', icon: CheckCircle2 },
]

export default function OnboardingWizard() {
 const router = useRouter()
 const [step, setStep] = useState(1)
 const [loading, setLoading] = useState(false)
 const [error, setError] = useState('')
 const [done, setDone] = useState(false)
 const [metropolises, setMetropolises] = useState<{ id: string; name: string }[]>([])

 const [form, setForm] = useState({
 templeName: '',
 city: '',
 address: '',
 templeEmail: '',

 metropolisName: '',
 priestFirstName: '',
 priestLastName: '',
 priestEmail: '',
 priestPassword: '',
 })

 useEffect(() => {
 getMetropolisList().then((list: any) => setMetropolises(list || []))
 }, [])

 const set = (key: string, value: string) =>
 setForm((prev) => ({ ...prev, [key]: value }))

 const canNext = () => {
 if (step === 1) return form.templeName.trim().length > 0
 if (step === 2) return form.metropolisName.trim().length > 0
 if (step === 3)
 return (
 form.priestFirstName.trim() &&
 form.priestLastName.trim() &&
 form.priestEmail.trim() &&
 form.priestPassword.trim().length >= 6
)
 return true
 }

 const handleSubmit = async () => {
 setLoading(true)
 setError('')
 const res = await completeOnboarding(form)
 if (res.success) {
 setDone(true)
 setStep(4)
 } else {
 setError(res.error || 'Σφάλμα κατά τη δημιουργία')
 }
 setLoading(false)
 }

 return (
 <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4 py-12">
 <div className="w-full max-w-2xl">

 {/* Logo */}
 <div className="text-center mb-8">
 <div className="inline-flex items-center gap-2.5 mb-4">
 <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#4F46E5] flex items-center justify-center">
 <span className="text-white font-extrabold text-sm"style={{fontFamily:"Georgia, serif", fontStyle:"italic", fontSize:"1.3em", paddingRight:"2px"}}>κ</span>
 </div>
 <span className="font-bold text-[var(--foreground)] text-xl tracking-tight">Κανόνας</span>
 </div>
 <h1 className="text-2xl font-bold text-[var(--foreground)]">Αρχικοποίηση Ναού</h1>
 <p className="text-sm text-[var(--text-muted)] mt-1">
 Ρυθμίστε τον Ναό σας σε 3 απλά βήματα
 </p>
 </div>

 {/* Progress */}
 <div className="flex items-center justify-center gap-1 mb-8">
 {steps.map((s, i) => (
 <div key={s.id} className="flex items-center">
 <div
 className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all
 ${step >= s.id
 ? 'bg-gradient-to-br from-[#7C3AED] to-[#4F46E5] text-white'
 : 'bg-[var(--surface-hover)] text-[var(--text-muted)]'
 }`}
 >
 {done && s.id === 4 ? (
 <CheckCircle2 className="w-4 h-4"/>
) : (
 <s.icon className="w-4 h-4"/>
)}
 </div>
 {i < steps.length - 1 && (
 <div className={`w-12 h-0.5 mx-1 rounded ${step > s.id ? 'bg-[var(--brand)]' : 'bg-[var(--border)]'}`} />
)}
 </div>
))}
 </div>

 {/* Card */}
 <div className="card p-6 md:p-8">
 {error && (
 <div className="p-3 mb-4 bg-[var(--danger-light)] border border-[var(--danger)]/20 text-[var(--danger)] text-sm rounded-lg font-medium">
 {error}
 </div>
)}

 {/* Step 1: Temple Info */}
 {step === 1 && (
 <div className="space-y-4 animate-fade-in-up">
 <div>
 <h2 className="text-lg font-bold text-[var(--foreground)] mb-1">Στοιχεία Ναού</h2>
 <p className="text-sm text-[var(--text-muted)]">Εισάγετε τα βασικά στοιχεία του Ιερού Ναού.</p>
 </div>
 <div>
 <label className="text-sm font-medium text-[var(--foreground)] mb-1.5 block">
 Όνομα Ναού <span className="text-[var(--danger)]">*</span>
 </label>
 <input
 className="input"
 placeholder="π.χ. Ι.Ν. Αγίου Δημητρίου"
 value={form.templeName}
 onChange={(e) => set('templeName', e.target.value)}
 />
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <label className="text-sm font-medium text-[var(--foreground)] mb-1.5 block">Πόλη</label>
 <input className="input"placeholder="Θεσσαλονίκη"value={form.city} onChange={(e) => set('city', e.target.value)} />
 </div>
 <div>
 <label className="text-sm font-medium text-[var(--foreground)] mb-1.5 block">Διεύθυνση</label>
 <input className="input"placeholder="Οδός, Αριθμός"value={form.address} onChange={(e) => set('address', e.target.value)} />
 </div>
 </div>
 <div className="grid grid-cols-1 gap-4">
 <div>
 <label className="text-sm font-medium text-[var(--foreground)] mb-1.5 block">Email Ναού</label>
 <input className="input"type="email"placeholder="info@agios-dimitrios.gr"value={form.templeEmail} onChange={(e) => set('templeEmail', e.target.value)} />
 </div>
 </div>
 </div>
)}

 {/* Step 2: Metropolis */}
 {step === 2 && (
 <div className="space-y-4 animate-fade-in-up">
 <div>
 <h2 className="text-lg font-bold text-[var(--foreground)] mb-1">Μητρόπολη</h2>
 <p className="text-sm text-[var(--text-muted)]">Επιλέξτε ή δημιουργήστε τη Μητρόπολη στην οποία ανήκει ο Ναός.</p>
 </div>
 <div>
 <label className="text-sm font-medium text-[var(--foreground)] mb-1.5 block">
 Όνομα Μητρόπολης <span className="text-[var(--danger)]">*</span>
 </label>
 <input
 className="input"
 placeholder="π.χ. Ιερά Μητρόπολη Θεσσαλονίκης"
 value={form.metropolisName}
 onChange={(e) => set('metropolisName', e.target.value)}
 
 />
 
    <select 
      className="input mt-2 border-slate-300" 
      onChange={(e) => {
         if(e.target.value) set('metropolisName', e.target.value);
      }}
    >
      <option value="">Επιλέξτε από διαθέσιμη λίστα (Προαιρετικό)...</option>
      <option value="Ιερά Αρχιεπισκοπή Αθηνών">Ιερά Αρχιεπισκοπή Αθηνών (Μητρόπολη Αθηνών)</option>
      {metropolises.map((m) => (
        <option key={m.id} value={m.name}>{m.name}</option>
      ))}
    </select>
  
 <p className="text-xs text-[var(--text-muted)] mt-1.5">
 Πληκτρολογήστε για αναζήτηση ή εισάγετε νέο όνομα.
 </p>
 </div>
 </div>
)}

 {/* Step 3: Priest */}
 {step === 3 && (
 <div className="space-y-4 animate-fade-in-up">
 <div>
 <h2 className="text-lg font-bold text-[var(--foreground)] mb-1">Προϊστάμενος Ιερέας</h2>
 <p className="text-sm text-[var(--text-muted)]">Δημιουργήστε τον λογαριασμό του Προϊσταμένου Εφημέριου.</p>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <label className="text-sm font-medium text-[var(--foreground)] mb-1.5 block">
 Όνομα <span className="text-[var(--danger)]">*</span>
 </label>
 <input className="input"placeholder="Ιωάννης"value={form.priestFirstName} onChange={(e) => set('priestFirstName', e.target.value)} />
 </div>
 <div>
 <label className="text-sm font-medium text-[var(--foreground)] mb-1.5 block">
 Επώνυμο <span className="text-[var(--danger)]">*</span>
 </label>
 <input className="input"placeholder="Παπαδόπουλος"value={form.priestLastName} onChange={(e) => set('priestLastName', e.target.value)} />
 </div>
 </div>
 <div>
 <label className="text-sm font-medium text-[var(--foreground)] mb-1.5 block">
 Email <span className="text-[var(--danger)]">*</span>
 </label>
 <input className="input"type="email"placeholder="ioannis@agios-dimitrios.gr"value={form.priestEmail} onChange={(e) => set('priestEmail', e.target.value)} />
 </div>
 <div>
 <label className="text-sm font-medium text-[var(--foreground)] mb-1.5 block">
 Κωδικός Πρόσβασης <span className="text-[var(--danger)]">*</span>
 </label>
 <input className="input"type="password"placeholder="Τουλάχιστον 6 χαρακτήρες"value={form.priestPassword} onChange={(e) => set('priestPassword', e.target.value)} />
 <p className="text-xs text-[var(--text-muted)] mt-1">Ο χρήστης θα μπορεί να τον αλλάξει αργότερα.</p>
 </div>
 </div>
)}

 {/* Step 4: Done */}
 {step === 4 && done && (
 <div className="text-center py-8 animate-fade-in-up">
 <div className="w-16 h-16 rounded-full bg-[var(--success-light)] flex items-center justify-center mx-auto mb-5">
 <CheckCircle2 className="w-8 h-8 text-[var(--success)]"/>
 </div>
 <h2 className="text-xl font-bold text-[var(--foreground)] mb-2">Ο Ναός σας είναι έτοιμος!</h2>
 <p className="text-sm text-[var(--text-muted)] mb-2 max-w-sm mx-auto">
 Δημιουργήθηκαν αυτόματα:
 </p>
 <ul className="text-sm text-[var(--text-secondary)] space-y-1.5 mb-8 max-w-xs mx-auto text-left">
 <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[var(--success)]"/> Ο Ιερός Ναός «{form.templeName}»</li>
 <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[var(--success)]"/> Σύνδεση με Μητρόπολη</li>
 <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[var(--success)]"/> Λογαριασμός Προϊσταμένου</li>
 <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[var(--success)]"/> Ρόλοι & Δικαιώματα</li>
 <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[var(--success)]"/> Πρότυπα Εγγράφων</li>
 </ul>
 <button
 onClick={() => router.push('/admin')}
 className="btn btn-primary btn-lg"
 >
 Μπείτε στο Σύστημα <ArrowRight className="w-4 h-4"/>
 </button>
 </div>
)}

 {/* Navigation */}
 {!done && (
 <div className="flex items-center justify-between mt-8 pt-5 border-t border-[var(--border)]">
 <button
 onClick={() => setStep((s) => Math.max(1, s - 1))}
 disabled={step === 1}
 className="btn btn-ghost btn-sm disabled:opacity-30"
 >
 <ArrowLeft className="w-3.5 h-3.5"/> Πίσω
 </button>

 {step < 3 ? (
 <button
 onClick={() => setStep((s) => s + 1)}
 disabled={!canNext()}
 className="btn btn-primary btn-sm disabled:opacity-50"
 >
 Επόμενο <ArrowRight className="w-3.5 h-3.5"/>
 </button>
) : (
 <button
 onClick={handleSubmit}
 disabled={!canNext() || loading}
 className="btn btn-primary btn-sm disabled:opacity-50"
 >
 {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : <>Ολοκλήρωση <CheckCircle2 className="w-3.5 h-3.5"/></>}
 </button>
)}
 </div>
)}
 </div>
 </div>
 </div>
)
}
