'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, User, Building, Loader2 } from 'lucide-react'
import { registerTempleAndAdmin } from '@/actions/register'
import { JURISDICTIONS } from '@/lib/constants/metropolises'

export default function RegisterPage() {
 const router = useRouter()
 const [loading, setLoading] = useState(false)
 const [error, setError] = useState('')
 const [isOtherMetropolis, setIsOtherMetropolis] = useState(false)

 // Form State
 const [formData, setFormData] = useState({
 templeName: '',
 metropolisName: '',
 adminEmail: '',
 adminFirstName: '',
 adminLastName: '',
 adminPassword: ''
 })

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault()
 setError('')
 setLoading(true)

 try {
 const res = await registerTempleAndAdmin({
 templeName: formData.templeName,
 metropolisName: formData.metropolisName,
 adminEmail: formData.adminEmail,
 adminFirstName: formData.adminFirstName,
 adminLastName: formData.adminLastName,
 adminPasswordPlain: formData.adminPassword
 })

 if (!res.success) throw new Error(res.error)

 // Registration successful! Redirect to login with success msg
 router.push('/login?registered=1')
 } catch (err: any) {
 setError(err.message)
 setLoading(false)
 }
 }

 return (
 <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4 py-12">
 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-br from-[#7C3AED]/5 to-[#4F46E5]/5 rounded-full blur-3xl -z-10"/>

 <div className="w-full max-w-[500px] animate-fade-in-up">
 <div className="text-center mb-8">
 <Link href="/"className="inline-flex items-center gap-2.5 mb-6">
 <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#4F46E5] flex items-center justify-center">
 <span className="text-white font-extrabold text-sm"style={{fontFamily:"Georgia, serif", fontStyle:"italic", fontSize:"1.3em", paddingRight:"2px"}}>κ</span>
 </div>
 <span className="font-bold text-[var(--foreground)] text-xl tracking-tight">Κανόνας</span>
 </Link>
 <h1 className="text-2xl font-bold text-[var(--foreground)] mb-1">Δημιουργία Λογαριασμού</h1>
 <p className="text-sm text-[var(--text-muted)]">Καταχωρήστε την Ενορία σας στην πλατφόρμα</p>
 </div>

 <div className="card p-6">
 <form onSubmit={handleSubmit} className="space-y-4">
 {error && (
 <div className="p-3 bg-[var(--danger-light)] border border-[var(--danger)]/20 text-[var(--danger)] text-sm rounded-lg text-center font-medium">
 {error}
 </div>
)}

 <div className="space-y-1.5">
 <label className="text-sm font-medium text-[var(--foreground)]">Μητρόπολη που ανήκετε <span className="text-[var(--danger)]">*</span></label>
 <div className="relative">
 <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]"/>
 <select
 value={isOtherMetropolis ? 'OTHER' : formData.metropolisName}
 onChange={e => {
 if (e.target.value === 'OTHER') {
 setIsOtherMetropolis(true);
 setFormData({ ...formData, metropolisName: '' });
 } else {
 setIsOtherMetropolis(false);
 setFormData({ ...formData, metropolisName: e.target.value });
 }
 }}
 className="input pl-10"
 required={!isOtherMetropolis}
 >
 <option value="">Επιλέξτε Μητρόπολη...</option>
 {JURISDICTIONS.map(jur => (
 <optgroup key={jur.label} label={jur.label}>
 {jur.metropolises.map(m => (
 <option key={m} value={m}>{m}</option>
))}
 </optgroup>
))}
 <option value="OTHER">Άλλη Μητρόπολη / Δικαιοδοσία (Εξωτερικού)</option>
 </select>
 </div>
 
 {isOtherMetropolis && (
 <div className="pt-2 animate-fade-in-up">
 <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">Ονομασία Μητρόπολης <span className="text-[var(--danger)]">*</span></label>
 <input
 type="text"
 placeholder="π.χ. Ιερά Αρχιεπισκοπή Αυστραλίας"
 value={formData.metropolisName}
 onChange={e => setFormData({ ...formData, metropolisName: e.target.value })}
 className="input"
 required
 />
 </div>
)}
 </div>

 <div className="space-y-1.5">
 <label className="text-sm font-medium text-[var(--foreground)]">Ονομασία Ιερού Ναού <span className="text-[var(--danger)]">*</span></label>
 <div className="relative">
 <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]"/>
 <input
 type="text"
 placeholder="π.χ. Ι.Ν. Αγίου Γεωργίου"
 value={formData.templeName}
 onChange={e => setFormData({ ...formData, templeName: e.target.value })}
 className="input pl-10"
 required
 />
 </div>
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div className="space-y-1.5">
 <label className="text-sm font-medium text-[var(--foreground)]">Όνομα (Προϊσταμένου) <span className="text-[var(--danger)]">*</span></label>
 <div className="relative">
 <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]"/>
 <input
 type="text"
 value={formData.adminFirstName}
 onChange={e => setFormData({ ...formData, adminFirstName: e.target.value })}
 className="input pl-10"
 required
 />
 </div>
 </div>
 <div className="space-y-1.5">
 <label className="text-sm font-medium text-[var(--foreground)]">Επώνυμο <span className="text-[var(--danger)]">*</span></label>
 <div className="relative">
 <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]"/>
 <input
 type="text"
 value={formData.adminLastName}
 onChange={e => setFormData({ ...formData, adminLastName: e.target.value })}
 className="input pl-10"
 required
 />
 </div>
 </div>
 </div>

 <div className="space-y-1.5">
 <label className="text-sm font-medium text-[var(--foreground)]">Email Υπευθύνου <span className="text-[var(--danger)]">*</span></label>
 <div className="relative">
 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]"/>
 <input
 type="email"
 placeholder="name@example.com"
 value={formData.adminEmail}
 onChange={e => setFormData({ ...formData, adminEmail: e.target.value })}
 className="input pl-10"
 required
 />
 </div>
 </div>

 <div className="space-y-1.5">
 <label className="text-sm font-medium text-[var(--foreground)]">Κωδικός Πρόσβασης <span className="text-[var(--danger)]">*</span></label>
 <div className="relative">
 <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]"/>
 <input
 type="password"
 placeholder="Τουλάχιστον 8 χαρακτήρες"
 value={formData.adminPassword}
 onChange={e => setFormData({ ...formData, adminPassword: e.target.value })}
 className="input pl-10"
 minLength={8}
 required
 />
 </div>
 </div>

 <button type="submit" disabled={loading} className="btn btn-primary w-full mt-6 disabled:opacity-60 relative overflow-hidden group">
  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
  {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto"/> : (
    <span className="flex items-center justify-center gap-2 relative z-10">
      Αποδοχή & Εγγραφή <span className="bg-white text-[var(--brand)] text-[10px] uppercase font-black px-2 py-0.5 rounded-full ml-2 shadow-sm">14 ΗΜΕΡΕΣ ΔΟΚΙΜΗ</span>
    </span>
  )}
 </button>
 <p className="text-center text-xs text-[var(--text-muted)] mt-3 font-medium">Δεν απαιτείται πιστωτική κάρτα.</p>
 </form>
 </div>

 <p className="text-center text-sm text-[var(--text-muted)] mt-6">
 Έχετε ήδη λογαριασμό;{' '}
 <Link href="/login"className="text-[var(--brand)] font-semibold hover:text-[var(--brand-dark)]">
 Συνδεθείτε
 </Link>
 </p>
 </div>
 </div>
)
}
