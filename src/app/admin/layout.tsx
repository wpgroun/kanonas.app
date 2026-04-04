'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useState } from 'react';
import {
  LayoutDashboard, Users, FileText, Banknote, Calendar,
  BookOpen, HeartHandshake, Package, ClipboardList, Settings,
  LogOut, ChevronLeft, Menu, Bell, ShieldCheck
} from 'lucide-react';
import { logoutAction } from '@/actions/auth';

const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Επισκόπηση' },
  { href: '/admin/requests', icon: FileText, label: 'Αιτήματα' },
  { href: '/admin/parishioners', icon: Users, label: 'Μητρώο' },
  { href: '/admin/finances', icon: Banknote, label: 'Οικονομικά' },
  { href: '/admin/schedule', icon: Calendar, label: 'Πρόγραμμα' },
  { href: '/admin/protocol', icon: ClipboardList, label: 'Πρωτόκολλο' },
  { href: '/admin/diptychs', icon: BookOpen, label: 'Δίπτυχα' },
  { href: '/admin/philanthropy', icon: HeartHandshake, label: 'Φιλόπτωχο' },
  { href: '/admin/assets', icon: Package, label: 'Περιουσιολόγιο' },
];

const secondaryItems = [
  { href: '/admin/settings', icon: Settings, label: 'Ρυθμίσεις' },
  { href: '/admin/super', icon: ShieldCheck, label: 'Super Admin' },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    await logoutAction();
    router.push('/login');
  };

  return (
    <div className="admin-wrapper">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`admin-sidebar fixed lg:relative z-50 h-full transition-all duration-200 ease-out
          ${collapsed ? 'w-[68px]' : 'w-[var(--sidebar-width)]'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="sidebar-header flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#4F46E5] flex items-center justify-center flex-shrink-0">
              <span className="text-white font-extrabold text-sm">Κ</span>
            </div>
            {!collapsed && (
              <span className="font-bold text-[var(--foreground)] text-base tracking-tight truncate">
                Κανόνας
              </span>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex w-7 h-7 items-center justify-center rounded-md hover:bg-[var(--surface-hover)] text-[var(--text-muted)] transition-colors"
          >
            <ChevronLeft className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Main nav */}
        <nav className="sidebar-nav mt-1">
          {!collapsed && <div className="sidebar-section-label">Διαχείριση</div>}
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`nav-item ${isActive(item.href) ? 'active' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="nav-icon" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}

          {!collapsed && <div className="sidebar-section-label mt-2">Σύστημα</div>}
          {secondaryItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`nav-item ${isActive(item.href) ? 'active' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="nav-icon" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-[var(--border)] mt-auto">
          <button
            onClick={handleLogout}
            className="nav-item w-full text-[var(--danger)] hover:bg-[var(--danger-light)]"
          >
            <LogOut className="nav-icon" />
            {!collapsed && <span>Αποσύνδεση</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="topbar">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-md hover:bg-[var(--surface-hover)] text-[var(--text-secondary)]"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-[var(--surface-hover)] text-[var(--text-muted)] relative">
              <Bell className="w-[18px] h-[18px]" />
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#4F46E5] flex items-center justify-center">
              <span className="text-white text-xs font-bold">Α</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="admin-main">
          <div className="admin-content">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
