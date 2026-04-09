'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useState } from 'react';
import { LayoutDashboard, Users, FileText, Banknote, Calendar,
 BookOpen, HeartHandshake, Package, ClipboardList, Settings,
 LogOut, ChevronLeft, Menu, Bell, ShieldCheck, Mail, KanbanSquare, Tent,
 Globe, HeartPulse, Shield, Info, CreditCard, UserCircle, AlertTriangle, X, Utensils,
 Download, Megaphone
} from 'lucide-react';
import { logoutAction } from '@/actions/auth';

import type { ExpiryWarning } from '@/actions/subscriptions';
import GlobalSearch from '@/components/GlobalSearch';

interface AdminShellProps {
 children: ReactNode
 perms: Record<string, any>
 subscriptionWarning: ExpiryWarning
 disabledModules?: string[]
}

export default function AdminShell({ children, perms, subscriptionWarning, disabledModules = [] }: AdminShellProps) {
 const pathname = usePathname();
 const router = useRouter();

 const [collapsed, setCollapsed] = useState(false);
 const [mobileOpen, setMobileOpen] = useState(false);
 const [bannerDismissed, setBannerDismissed] = useState(false);

 const navGroups = [
 {
 group:"Γραμματεία & Διοίκηση",
 items: [
 { href: '/admin', icon: LayoutDashboard, label: 'Επισκόπηση', requiredPerm: null, moduleLabel: 'Dashboard (Επισκόπηση)' },
 { href: '/admin/calendar', icon: Calendar, label: 'Ημερολόγιο', requiredPerm: null, moduleLabel: 'Κεντρικό Ημερολόγιο' },
 { href: '/admin/board', icon: KanbanSquare, label: 'Εργασίες', requiredPerm: null, moduleLabel: 'Πίνακας Εργασιών' },
 { href: '/admin/requests', icon: FileText, label: 'Αιτήματα', requiredPerm: 'canManageRequests', moduleLabel: 'Αιτήματα Μυστηρίων' },
 { href: '/admin/protocol', icon: ClipboardList, label: 'Πρωτόκολλο', requiredPerm: 'canManageProtocol', moduleLabel: 'Πρωτόκολλο' },
 { href: '/admin/mailing', icon: Mail, label: 'Αλληλογραφία & Ετικέτες', requiredPerm: null, moduleLabel: 'Αλληλογραφία & Ετικέτες' },
 { href: '/admin/connect', icon: Globe, label: 'Δημόσια Σελίδα', requiredPerm: null, moduleLabel: 'Δημόσια Σελίδα' },
 ]
 },
 {
 group:"Μητρώα & Πιστοποιητικά",
 items: [
 { href: '/admin/parishioners', icon: Users, label: 'Μητρώο', requiredPerm: 'canManageRegistry', moduleLabel: 'Μητρώο Ενοριτών' },
 { href: '/admin/sacraments/baptisms', icon: FileText, label: 'Βιβλίο Βαπτίσεων', requiredPerm: null, moduleLabel: 'Βαπτίσεις & Μυστήρια' },
              { href: '/admin/sacraments/marriages', icon: FileText, label: 'Βιβλίο Γάμων', requiredPerm: null, moduleLabel: 'Γάμοι & Μυστήρια' },
              { href: '/admin/sacraments/divorces', icon: FileText, label: 'Διαζύγια (Λύσεις)', requiredPerm: 'canManageRegistry', moduleLabel: 'Διαζύγια (Λύσεις Γάμων)' },
 { href: '/admin/sacraments/funerals', icon: FileText, label: 'Ληξιαρχείο (Εκδημίες)', requiredPerm: 'canManageRegistry', moduleLabel: 'Ληξιαρχείο & Εκδημίες' },
 ]
 },
 {
 group:"Οικονομικά & Ταμείο",
 items: [
 { href: '/admin/finances', icon: Banknote, label: 'Οικονομικά', requiredPerm: 'canViewFinances', moduleLabel: 'Καθολικό Πληρωμών / Εισπράξεων' },
 { href: '/admin/finances/ledger', icon: BookOpen, label: 'Βιβλίο Εσόδων-Εξόδων', requiredPerm: 'canViewFinances', moduleLabel: 'Καθολικό Πληρωμών / Εισπράξεων' },
 { href: '/admin/finances/budget', icon: FileText, label: 'Προϋπολογισμός', requiredPerm: 'canViewFinances', moduleLabel: 'Προϋπολογισμός (Budgeting)' },
 ]
 },
 {
 group:"Ιερό Βήμα & Πρόγραμμα",
 items: [
 { href: '/admin/schedule', icon: Calendar, label: 'Πρόγραμμα', requiredPerm: 'canManageSchedule', moduleLabel: 'Ημερολόγιο Ακολουθιών' },
 { href: '/admin/diptychs', icon: BookOpen, label: 'Δίπτυχα', requiredPerm: null, moduleLabel: 'Δίπτυχα & Προσκομιδή' },
 { href: '/admin/ministries', icon: Users, label: 'Διακονίες & Εθελοντές', requiredPerm: null, moduleLabel: 'Διακονίες & Εθελοντές' },
 { href: '/admin/assignments', icon: Users, label: 'Αναθέσεις Εφημερίων', requiredPerm: 'isHeadPriest', moduleLabel: 'Αναθέσεις Εφημερίων' },
 ]
 },
 {
 group:"Δομές & Ενέργειες",
 items: [
 { href: '/admin/philanthropy', icon: HeartHandshake, label: 'Φιλόπτωχο', requiredPerm: 'canViewBeneficiaries', moduleLabel: 'Μητρώο Ωφελουμένων' },
 { href: '/admin/philanthropy/board', icon: Shield, label: 'Συμβούλιο Φιλοπτώχου', requiredPerm: 'canViewBeneficiaries', moduleLabel: 'Συμβούλιο Φιλοπτώχου (ΕΦΤ)' },
 { href: '/admin/youth', icon: Tent, label: 'Κατασκηνώσεις', requiredPerm: null, moduleLabel: 'Κατασκηνώσεις (Νεολαία)' },
 { href: '/admin/bloodbank', icon: HeartPulse, label: 'Τράπεζα Αίματος', requiredPerm: null, moduleLabel: 'Τράπεζα Αίματος' },
 { href: '/admin/assets', icon: Package, label: 'Περιουσιολόγιο', requiredPerm: 'canManageAssets', moduleLabel: 'Περιουσιολόγιο' },
 ]
 }
 ];

 // Systematically filter items
 const filteredGroups = navGroups.map(group => ({
 ...group,
 items: group.items.filter(item => {
 // 1. Permission Check
 if (item.requiredPerm) {
 if (item.requiredPerm === 'isHeadPriest' && !perms.isHeadPriest && !perms.isSuperAdmin) return false;
 if (item.requiredPerm === 'isSuperAdmin' && !perms.isSuperAdmin) return false;
 if (item.requiredPerm !== 'isHeadPriest' && item.requiredPerm !== 'isSuperAdmin') {
 if (!perms[item.requiredPerm] && !perms.isSuperAdmin && !perms.isHeadPriest) return false;
 }
 }
 // 2. Module Toggle Check (hide if module specifically turned off)
 if (disabledModules.includes(item.moduleLabel)) return false;
 return true;
 })
 })).filter(g => g.items.length > 0);

 const secondaryItems = [
 { href: '/admin/modules', icon: Info, label: 'Λειτουργικότητες', requiredPerm: null },
 { href: '/admin/exports', icon: Download, label: 'Εξαγωγή Δεδομένων', requiredPerm: 'isHeadPriest' },
 { href: '/admin/audit', icon: ShieldCheck, label: 'Ιστορικό Ενεργειών', requiredPerm: 'isHeadPriest' },
 { href: '/admin/subscription', icon: CreditCard, label: 'Διαχείριση Συνδρομής', requiredPerm: 'isHeadPriest' },
 { href: '/admin/documents', icon: FileText, label: 'Πρότυπα Εγγράφων', requiredPerm: 'isHeadPriest' },
 { href: '/admin/settings', icon: Settings, label: 'Ρυθμίσεις', requiredPerm: 'isHeadPriest' },
 { href: '/admin/users', icon: Users, label: 'Προσωπικό & Ρόλοι', requiredPerm: 'isHeadPriest' },
 { href: '/admin/super/announcements', icon: Megaphone, label: 'Ανακοινώσεις', requiredPerm: 'isSuperAdmin' },
 { href: '/admin/super/map', icon: Globe, label: 'Χάρτης Ναών', requiredPerm: 'isSuperAdmin' },
 { href: '/admin/super', icon: ShieldCheck, label: 'Κέντρο Ελέγχου', requiredPerm: 'isSuperAdmin' },
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

 const showBanner = subscriptionWarning && !bannerDismissed && !perms.isSuperAdmin;

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
 <Link href="/admin"className="flex items-center gap-2.5 min-w-0">
 <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#4F46E5] flex items-center justify-center flex-shrink-0">
 <span className="text-white font-extrabold text-sm"style={{fontFamily:"Georgia, serif", fontStyle:"italic", fontSize:"1.3em", paddingRight:"2px"}}>κ</span>
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
 <nav className="sidebar-nav mt-1 pb-4">
 {filteredGroups.map((group, i) => (
 <div key={i} className="mb-1">
 {!collapsed && <div className="sidebar-section-label mt-3 mb-1 px-3 text-[0.68rem] font-bold uppercase tracking-wider text-[var(--text-muted)]">{group.group}</div>}
 {group.items.map(item => (
 <Link
 key={item.href}
 href={item.href}
 onClick={() => setMobileOpen(false)}
 className={`nav-item ${isActive(item.href) ? 'active' : ''}`}
 title={collapsed ? item.label : undefined}
 >
 <item.icon className="nav-icon"/>
 {!collapsed && <span>{item.label}</span>}
 </Link>
))}
 </div>
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
 <item.icon className="nav-icon"/>
 {!collapsed && <span>{item.label}</span>}
 </Link>
))}
 </nav>

 {/* Bottom */}
 <div className="p-3 border-t border-[var(--border)] mt-auto flex flex-col gap-1">
 <Link
 href="/admin/profile"
 onClick={() => setMobileOpen(false)}
 className={`nav-item text-[var(--text-secondary)] hover:text-[var(--foreground)] ${isActive('/admin/profile') ? 'active' : ''}`}
 >
 <UserCircle className="nav-icon"/>
 {!collapsed && <span>Ο Λογαριασμός Μου</span>}
 </Link>
 <button
 onClick={handleLogout}
 className="nav-item w-full text-[var(--danger)] hover:bg-[var(--danger-light)]"
 >
 <LogOut className="nav-icon"/>
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
 <Menu className="w-5 h-5"/>
 </button>
 </div>
 
 <div className="flex-1 flex justify-center px-4">
 <GlobalSearch />
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
 <Bell className="w-[18px] h-[18px]"/>
 </button>
 <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#4F46E5] flex items-center justify-center">
 <span className="text-white text-xs font-bold">
 {(perms.userEmail as string)?.[0]?.toUpperCase() ?? 'Α'}
 </span>
 </div>
 </div>
 </header>

 {/* ─── Subscription Expiry Banner ─────────────────────────────────────── */}
 {showBanner && (
 <div className={`flex items-center justify-between gap-3 px-4 py-2.5 text-sm font-medium border-b ${
 subscriptionWarning.level === 'danger'
 ? 'bg-red-50 border-red-200 text-red-800'
 : 'bg-[var(--warning-light)] border-amber-200 text-[var(--warning)]'
 }`}>
 <div className="flex items-center gap-2">
 <AlertTriangle className="w-4 h-4 flex-shrink-0"/>
 {subscriptionWarning.level === 'danger'
 ? `⚠️ Η συνδρομή σας λήγει σε ${subscriptionWarning.daysLeft} ${subscriptionWarning.daysLeft === 1 ? 'ημέρα' : 'ημέρες'}! Ανανεώστε άμεσα.`
 : `Η συνδρομή σας λήγει σε ${subscriptionWarning.daysLeft} ημέρες.`
 }
 <Link
 href="/admin/subscription"
 className={`underline underline-offset-2 font-semibold hover:opacity-80 ${
 subscriptionWarning.level === 'danger' ? 'text-red-900' : 'text-[var(--warning)]'
 }`}
 >
 Ανανέωση →
 </Link>
 </div>
 <button
 onClick={() => setBannerDismissed(true)}
 className="p-1 rounded hover:bg-black/10 transition-colors flex-shrink-0"
 aria-label="Κλείσιμο"
 >
 <X className="w-3.5 h-3.5"/>
 </button>
 </div>
)}

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
