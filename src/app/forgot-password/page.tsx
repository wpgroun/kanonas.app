'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, Loader2, CheckCircle2 } from 'lucide-react'
import { forgotPasswordAction } from '@/actions/auth'

export default function ForgotPasswordPage() {
 const [email, setEmail] = useState('')
 const [loading, setLoading] = useState(false)
 const [error, setError] = useState('')
 const [success, setSuccess] = useState(false)

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault()
 setError('')
 setLoading(true)

 try {
 const res = await forgotPasswordAction(email)
 if (!res.success) throw new Error(res.error)
 setSuccess(true)
 } catch (err: any) {
 setError(err.message)
 } finally {
 setLoading(false)
 }
 }

 return (
 <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4">
 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-br from-[#7C3AED]/5 to-[#4F46E5]/5 rounded-full blur-3xl -z-10"/>

 <div className="w-full max-w-[400px] animate-fade-in-up">
 {/* Logo */}
 <div className="text-center mb-8">
 <Link href="/"className="inline-flex items-center gap-2.5 mb-6">
 <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#4F46E5] flex items-center justify-center">
 <span className="text-white font-extrabold text-sm"style={{fontFamily:"Georgia, serif", fontStyle:"italic", fontSize:"1.3em", paddingRight:"2px"}}>κ</span>
 </div>
 <span className="font-bold text-[var(--foreground)] text-xl tracking-tight">Κανόνας</span>
 </Link>
 <h1 className="text-2xl font-bold text-[var(--foreground)] mb-1">Ανάκτηση Κωδικού</h1>
 <p className="text-sm text-[var(--text-muted)]">Εισάγετε το email σας για να λάβετε σύνδεσμο επαναφοράς.</p>
 </div>

 <div className="card p-6">
 {success ? (
 <div className="text-center py-6">
 <div className="w-12 h-12 bg-[var(--success-light)] rounded-full flex items-center justify-center mx-auto mb-4">
 <CheckCircle2 className="w-6 h-6 text-[var(--success)]"/>
 </div>
 <h3 className="text-lg font-bold text-[var(--foreground)] mb-2">Ελέγξτε το email σας</h3>
 <p className="text-sm text-[var(--text-secondary)]">
 Αν υπάρχει λογαριασμός με αυτό το email, σας στείλαμε σύνδεσμο για επαναφορά.
 </p>
 <Link href="/login">
 <button className="btn btn-secondary w-full mt-6">Επιστροφή στη σύνδεση</button>
 </Link>
 </div>
) : (
 <form onSubmit={handleSubmit} className="space-y-4">
 {error && (
 <div className="p-3 bg-[var(--danger-light)] border border-[var(--danger)]/20 text-[var(--danger)] text-sm rounded-lg text-center font-medium">
 {error}
 </div>
)}

 <div className="space-y-1.5">
 <label className="text-sm font-medium text-[var(--foreground)]">Email</label>
 <div className="relative">
 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]"/>
 <input
 type="email"
 placeholder="email@example.gr"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 className="input pl-10"
 required
 />
 </div>
 </div>

 <button
 type="submit"
 disabled={loading || !email}
 className="btn btn-primary w-full mt-2 disabled:opacity-60"
 >
 {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Αποστολή Συνδέσμου'}
 </button>
 </form>
)}
 </div>

 <p className="text-center text-sm text-[var(--text-muted)] mt-6">
 Θυμηθήκατε τον κωδικό σας;{' '}
 <Link href="/login"className="text-[var(--brand)] font-semibold hover:text-[var(--brand-dark)]">
 Επιστροφή
 </Link>
 </p>
 </div>
 </div>
)
}
