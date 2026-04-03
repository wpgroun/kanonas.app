import {
  LayoutGrid,
  FileText,
  BookOpen,
  CalendarDays,
  PenLine,
  Users,
  HeartHandshake,
  Landmark,
  Banknote,
  Settings,
  Files,
  Church,
  Scroll,
  Stamp,
  Calendar,
  Shield,
  Building2,
  FolderLock
} from 'lucide-react';
import { MenuConfig } from '@/config/types';

export const MENU_SIDEBAR: MenuConfig = [
  {
    title: 'ΓΕΝΙΚΑ',
    heading: 'ΓΕΝΙΚΑ',
  },
  {
    title: 'Σύνοψη',
    icon: Church,
    path: '/admin',
  },
  {
    title: 'Μυστήρια & Αιτήματα',
    icon: FileText,
    path: '/admin/requests',
  },
  {
    title: 'Δίπτυχα & Μνημόσυνα',
    icon: Scroll,
    path: '/admin/diptychs',
  },
  {
    title: 'Ημερολόγιο',
    icon: CalendarDays,
    path: '/admin/schedule',
  },
  {
    title: 'Πρωτόκολλο',
    icon: Stamp,
    path: '/admin/protocol',
  },
  {
    title: 'Αναθέσεις Προσωπικού',
    icon: Calendar,
    path: '/admin/assignments',
  },
  {
    heading: 'ΔΙΑΧΕΙΡΙΣΗ',
  },
  {
    title: 'Ενορίτες',
    icon: Users,
    path: '/admin/parishioners',
  },
  {
    title: 'Φιλόπτωχο',
    icon: HeartHandshake,
    path: '/admin/philanthropy',
  },
  {
    heading: 'ΟΡΓΑΝΩΣΗ',
  },
  {
    title: 'Οικονομικά',
    icon: Banknote,
    path: '/admin/finances',
  },
  {
    title: 'Περιουσιολόγιο',
    icon: Landmark,
    path: '/admin/assets',
  },
  {
    heading: 'ΡΥΘΜΙΣΕΙΣ',
  },
  {
    title: 'Πρότυπα Εγγράφων',
    icon: Files,
    path: '/admin/settings/templates',
  },
  {
    title: 'Χρήστες & Ρόλοι',
    icon: Shield,
    path: '/admin/settings/users',
  },
  {
    title: 'Ρυθμίσεις Ναού',
    icon: Settings,
    path: '/admin/settings',
  },
  {
    heading: 'ΜΗΤΡΟΠΟΛΗ',
  },
  {
    title: 'Πίνακας Μητρόπολης',
    icon: Building2,
    path: '/admin/metropolis',
  }
];

// We empty out the Mega menus so the Header is clean!
export const MENU_MEGA: MenuConfig = [];
export const MENU_MEGA_MOBILE: MenuConfig = [];
