'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Loader2 } from 'lucide-react';

import { loginAction } from '@/actions/auth';

export default function LoginPage() {
  const router = useRouter();
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
        throw new Error(res.error || 'Αποτυχία σύνδεσης');
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
              <span className="text-white font-extrabold text-sm">Κ</span>
            </div>
            <span className="font-bold text-[var(--foreground)] text-xl tracking-tight">Κανόνας</span>
          </Link>
          <h1 className="text-2xl font-bold text-[var(--foreground)] mb-1">Σύνδεση</h1>
          <p className="text-sm text-[var(--text-muted)]">Εισάγετε τα στοιχεία του λογαριασμού σας</p>
        </div>

        {/* Card */}
        <div className="card p-6">
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 bg-[var(--danger-light)] border border-[var(--danger)]/20 text-[var(--danger)] text-sm rounded-lg text-center font-medium">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--foreground)]">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type="email"
                  placeholder="admin@kanonas.gr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-[var(--foreground)]">Κωδικός</label>
                <Link href="#" className="text-xs font-medium text-[var(--brand)] hover:text-[var(--brand-dark)]">
                  Ξεχάσατε;
                </Link>
              </div>
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

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full mt-2 disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Είσοδος'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-[var(--text-muted)] mt-6">
          Δεν έχετε λογαριασμό;{' '}
          <Link href="/contact" className="text-[var(--brand)] font-semibold hover:text-[var(--brand-dark)]">
            Επικοινωνήστε μαζί μας
          </Link>
        </p>
      </div>
    </div>
  );
}
