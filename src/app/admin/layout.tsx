'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useState, useEffect } from 'react';
import { LayoutDashboard, Users, FileText, Banknote, Calendar,
  BookOpen, HeartHandshake, Package, ClipboardList, Settings,
  LogOut, ChevronLeft, Menu, Bell, ShieldCheck, Mail, KanbanSquare, Tent,
  Globe, HeartPulse, Shield, Info
} from 'lucide-react';
import { logoutAction } from '@/actions/auth';
import { fetchSessionClient } from '@/actions/clientSession';
import { useDict } from '@/i18n/TranslationProvider';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const dict = useDict();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [perms, setPerms] = useState<any>(null);

  useEffect(() => {
    fetchSessionClient().then(data => setPerms(data));
  }, []);

  // Show nothing or skeleton while loading session logic initially
  if (!perms) return <div className="h-screen w-screen flex items-center justify-center bg-background"><div className="w-8 h-8 rounded-full border-t-2 border-primary animate-spin"></div></div>;

  const navItems = [
    { href: '/admin', icon: LayoutDashboard, label: dict.nav.dashboard, requiredPerm: null },
    { href: '/admin/connect', icon: Globe, label: 'Kanonas Connect / e-Gov', requiredPerm: null },
    { href: '/admin/requests', icon: FileText, label: dict.nav.requests, requiredPerm: 'canManageRequests' },
    { href: '/admin/parishioners', icon: Users, label: dict.nav.parishioners, requiredPerm: 'canManageRegistry' },
    { href: '/admin/finances', icon: Banknote, label: dict.nav.finances, requiredPerm: 'canViewFinances' },
    { href: '/admin/schedule', icon: Calendar, label: dict.nav.calendar, requiredPerm: 'canManageSchedule' },
    { href: '/admin/board', icon: KanbanSquare, label: 'Kanban Tasks', requiredPerm: null },
    { href: '/admin/protocol', icon: ClipboardList, label: dict.nav.documents, requiredPerm: 'canManageProtocol' },
    { href: '/admin/diptychs', icon: BookOpen, label: dict.nav.diptychs, requiredPerm: null },
    { href: '/admin/mailing', icon: Mail, label: 'Mailing & Ετικέτες', requiredPerm: null },
    { href: '/admin/registry/funerals', icon: FileText, label: 'Ληξιαρχείο & Εκδημίες', requiredPerm: 'canManageRegistry' },
    { href: '/admin/sacraments/divorces', icon: FileText, label: 'Διαζύγια (Λύσεις Γάμων)', requiredPerm: 'canManageRegistry' },
    { href: '/admin/registry/camps', icon: Tent, label: 'Κατασκηνώσεις (Νεολαία)', requiredPerm: null },
    { href: '/admin/registry/bloodbank', icon: HeartPulse, label: 'Τράπεζα Αίματος', requiredPerm: null },
    { href: '/admin/assignments', icon: Users, label: 'Αναθέσεις Εφημερίων', requiredPerm: 'isHeadPriest' },
    { href: '/admin/philanthropy', icon: HeartHandshake, label: dict.nav.philanthropy, requiredPerm: 'canViewBeneficiaries' },
    { href: '/admin/philanthropy/board', icon: Shield, label: 'Συμβούλιο Φιλοπτώχου', requiredPerm: 'canViewBeneficiaries' },
    { href: '/admin/assets', icon: Package, label: dict.nav.assets, requiredPerm: 'canManageAssets' },
  ].filter(item => !item.requiredPerm || perms[item.requiredPerm] === true || perms.isSuperAdmin || perms.isHeadPriest);

  const secondaryItems = [
    { href: '/admin/modules', icon: Info, label: 'Λειτουργικότητες', requiredPerm: null },
    { href: '/admin/settings', icon: Settings, label: dict.nav.settings, requiredPerm: 'isHeadPriest' },
    { href: '/admin/users', icon: Users, label: 'Προσωπικό & Ρόλοι', requiredPerm: 'isHeadPriest' },
    { href: '/admin/super', icon: ShieldCheck, label: dict.nav.superAdmin, requiredPerm: 'isSuperAdmin' },
  ].filter(item => {
     if (item.requiredPerm === 'isHeadPriest') return perms.isHeadPriest || perms.isSuperAdmin;
     if (item.requiredPerm === 'isSuperAdmin') return perms.isSuperAdmin;
     return true;
  });

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
              <span className="text-white font-extrabold text-sm" style={{fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "1.3em", paddingRight: "2px"}}>κ</span>
            </div>
            {!collapsed && (
              <span className="font-bold text-[var(--foreground)] text-base tracking-tight truncate">
                {dict.general.appName}
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
          {!collapsed && <div className="sidebar-section-label">{dict.nav.sectionManagement}</div>}
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

          {!collapsed && <div className="sidebar-section-label mt-2">{dict.nav.sectionSystem}</div>}
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
            {!collapsed && <span>{dict.nav.logout}</span>}
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
            <button 
              onClick={async () => {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                  new Notification('Κανόνας', {
                    body: 'Οι PWA Ειδοποιήσεις είναι ενεργοποιημένες!',
                    icon: '/icon.png'
                  });
                } else {
                  alert('Πρέπει να επιτρέψεις τις ειδοποιήσεις στον browser!');
                }
              }}
              className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-[var(--surface-hover)] text-[var(--text-muted)] relative tooltip tooltip-bottom"
              title="Ενεργοποίηση Web Push Ειδοποιήσεων"
              data-tip="Ειδοποιήσεις"
            >
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
