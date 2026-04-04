'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { loginAction } from '@/actions/auth';
import { useDict } from '@/i18n/TranslationProvider';

export default function LoginPage() {
  const router = useRouter();
  const dict = useDict();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await loginAction(email, password);
      if (!res.success) {
        throw new Error(res.error || 'Αποτυχία σύνδεσης / Login failed');
      }
      router.push('/admin');
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4">
      {/* Subtle gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-br from-[#7C3AED]/5 to-[#4F46E5]/5 rounded-full blur-3xl -z-10" />

      <div className="w-full max-w-[400px] animate-fade-in-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#4F46E5] flex items-center justify-center">
              <span className="text-white font-extrabold text-sm" style={{fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "1.3em", paddingRight: "2px"}}>κ</span>
            </div>
            <span className="font-bold text-[var(--foreground)] text-xl tracking-tight">{dict.general.appName}</span>
          </Link>
          <h1 className="text-2xl font-bold text-[var(--foreground)] mb-1">{dict.login.title}</h1>
          <p className="text-sm text-[var(--text-muted)]">{dict.login.subtitle}</p>
        </div>

        {/* Card */}
        <div className="card p-6">
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 bg-[var(--danger-light)] border border-[var(--danger)]/20 text-[var(--danger)] text-sm rounded-lg text-center font-medium">
                {error}
              </div>
            )}
            
            {typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('registered') === '1' && (
              <div className="p-3 bg-[var(--success-light)] border border-[var(--success)]/20 text-[var(--success)] text-sm rounded-lg text-center font-medium">
                Η εγγραφή ολοκληρώθηκε! Συνδεθείτε με τον λογαριασμό σας.
              </div>
            )}

            {typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('reset_success') === '1' && (
              <div className="p-3 bg-[var(--success-light)] border border-[var(--success)]/20 text-[var(--success)] text-sm rounded-lg text-center font-medium">
                Ο κωδικός σας άλλαξε με επιτυχία.
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--foreground)]">{dict.login.emailLabel}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type="email"
                  placeholder={dict.login.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-[var(--foreground)]">{dict.login.passwordLabel}</label>
                <Link href="/forgot-password" className="text-xs font-medium text-[var(--brand)] hover:text-[var(--brand-dark)]">
                  {dict.login.forgotPassword}
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type="password"
                  placeholder={dict.login.passwordPlaceholder}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-10"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full mt-2 disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : dict.login.submitButton}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-[var(--text-muted)] mt-6">
          {dict.login.noAccount}{' '}
          <Link href="/contact" className="text-[var(--brand)] font-semibold hover:text-[var(--brand-dark)]">
            {dict.login.contactUs}
          </Link>
        </p>
      </div>
    </div>
  );
}
