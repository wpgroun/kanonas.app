'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  User, Mail, Building2, Shield, Key,
  LogOut, ChevronRight, Loader2, Settings
} from 'lucide-react'
import { logoutAction } from '@/actions/auth'

export default function MyAccountPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    await logoutAction()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Top Bar */}
      <header className="bg-white border-b border-[var(--border)] sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#4F46E5] flex items-center justify-center">
              <span className="text-white font-extrabold text-sm" style={{fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "1.3em", paddingRight: "2px"}}>κ</span>
            </div>
            <span className="font-bold text-[var(--foreground)] text-lg tracking-tight">Κανόνας</span>
          </Link>
          <button
            onClick={handleLogout}
            disabled={loading}
            className="btn btn-ghost btn-sm text-[var(--danger)]"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><LogOut className="w-3.5 h-3.5" /> Αποσύνδεση</>}
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <div>
          <h1 className="text-xl font-bold text-[var(--foreground)]">Ο λογαριασμός μου</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">Διαχείριση προφίλ & ρυθμίσεων</p>
        </div>

        {/* Profile Card */}
        <div className="card p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#4F46E5] flex items-center justify-center">
              <span className="text-white text-xl font-bold">Α</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--foreground)]">Διαχειριστής</h2>
              <p className="text-sm text-[var(--text-muted)]">admin@kanonas.gr</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-[var(--background)] border border-[var(--border)]">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-4 h-4 text-[var(--brand)]" />
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Ναός</span>
              </div>
              <p className="text-sm font-semibold text-[var(--foreground)]">Ιερός Ναός Αγίου Ελευθερίου</p>
            </div>
            <div className="p-4 rounded-lg bg-[var(--background)] border border-[var(--border)]">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-[var(--brand)]" />
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Ρόλος</span>
              </div>
              <p className="text-sm font-semibold text-[var(--foreground)]">Προϊστάμενος</p>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="card p-0 overflow-hidden">
          <div className="px-5 py-3 border-b border-[var(--border)]">
            <h3 className="text-sm font-bold text-[var(--foreground)]">Γρήγορη πρόσβαση</h3>
          </div>
          {[
            { href: '/admin', icon: Settings, label: 'Πίνακας Ελέγχου', desc: 'Dashboard & στατιστικά' },
            { href: '/admin/requests', icon: Mail, label: 'Αιτήματα', desc: 'Διαχείριση μυστηρίων' },
            { href: '/admin/parishioners', icon: User, label: 'Μητρώο', desc: 'Ενορίτες & καρτέλες' },
            { href: '/admin/settings', icon: Key, label: 'Ρυθμίσεις', desc: 'Στοιχεία Ναού & χρήστες' },
          ].map((item) => (
            <Link key={item.href} href={item.href}>
              <div className="flex items-center justify-between px-5 py-3.5 hover:bg-[var(--surface-hover)] transition-colors border-b border-[var(--border)] last:border-0 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[var(--brand-light)] flex items-center justify-center">
                    <item.icon className="w-4 h-4 text-[var(--brand)]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--foreground)]">{item.label}</p>
                    <p className="text-xs text-[var(--text-muted)]">{item.desc}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
