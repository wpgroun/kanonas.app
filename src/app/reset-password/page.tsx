'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Lock, Loader2, KeyRound } from 'lucide-react'
import { resetPasswordAction } from '@/actions/auth'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!token) {
    return (
      <div className="card p-6 text-center">
        <h3 className="text-lg font-bold text-[var(--danger)] mb-2">Μη έγκυρος σύνδεσμος</h3>
        <p className="text-sm text-[var(--text-muted)] mb-6">Ο σύνδεσμος επαναφοράς δεν είναι έγκυρος ή λείπει.</p>
        <Link href="/forgot-password">
          <button className="btn btn-secondary w-full">Αίτημα νέου συνδέσμου</button>
        </Link>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Οι κωδικοί δεν ταιριάζουν')
      return
    }

    if (password.length < 8) {
      setError('Ο κωδικός πρέπει να έχει τουλάχιστον 8 χαρακτήρες')
      return
    }

    setLoading(true)

    try {
      const res = await resetPasswordAction(token, password)
      if (!res.success) throw new Error(res.error)

      // Success, redirect to login
      router.push('/login?reset_success=1')
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="card p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-[var(--danger-light)] border border-[var(--danger)]/20 text-[var(--danger)] text-sm rounded-lg text-center font-medium">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[var(--foreground)]">Νέος Κωδικός</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input pl-10"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[var(--foreground)]">Επιβεβαίωση Κωδικού</label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input pl-10"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !password || !confirmPassword}
          className="btn btn-primary w-full mt-2 disabled:opacity-60"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Αποθήκευση νέου κωδικού'}
        </button>
      </form>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-br from-[#7C3AED]/5 to-[#4F46E5]/5 rounded-full blur-3xl -z-10" />

      <div className="w-full max-w-[400px] animate-fade-in-up">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#4F46E5] flex items-center justify-center">
              <span className="text-white font-extrabold text-sm" style={{fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "1.3em", paddingRight: "2px"}}>κ</span>
            </div>
            <span className="font-bold text-[var(--foreground)] text-xl tracking-tight">Κανόνας</span>
          </Link>
          <h1 className="text-2xl font-bold text-[var(--foreground)] mb-1">Νέος Κωδικός</h1>
          <p className="text-sm text-[var(--text-muted)]">Ορίστε έναν ασφαλή κωδικό για το λογαριασμό σας.</p>
        </div>

        <Suspense fallback={<div className="card p-6 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-[var(--brand)]" /></div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  )
}
