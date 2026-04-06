import re

with open('src/app/admin/AdminShell.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace("{ href: '/admin/super', icon: ShieldCheck, label: dict.nav.superAdmin, requiredPerm: 'isSuperAdmin' },", "import { Globe } from 'lucide-react';\n { href: '/admin/super', icon: ShieldCheck, label: dict.nav.superAdmin, requiredPerm: 'isSuperAdmin' },")

# Add Globe import to AdminShell
if 'Globe' not in text:
    text = text.replace("import {", "import { Globe, ", 1)
    
text = text.replace("{ href: '/admin/super', icon: ShieldCheck, label: dict.nav.superAdmin, requiredPerm: 'isSuperAdmin' },", "{ href: '/admin/super/map', icon: Globe, label: 'Χάρτης Ναών', requiredPerm: 'isSuperAdmin' },\n  { href: '/admin/super', icon: ShieldCheck, label: dict.nav.superAdmin, requiredPerm: 'isSuperAdmin' },")

with open('src/app/admin/AdminShell.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

with open('src/app/admin/super/SuperDashboard.tsx', 'r', encoding='utf-8') as f:
    text2 = f.read()

if 'Globe' not in text2:
    text2 = text2.replace('import {\n  Building2,', 'import {\n  Globe,\n  Building2,')

old_buttons = '''        <Link href="/admin/onboarding">
          <button className="bg-[var(--brand)] hover:bg-[var(--brand-dark)] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all">
            <Plus className="w-5 h-5" /> Προσθήκη Νέου Ναού
          </button>
        </Link>'''

new_buttons = '''        <div className="flex items-center gap-3 flex-wrap">
          <Link href="/admin/super/map">
            <button className="bg-amber-100/90 text-amber-700 hover:bg-amber-200 border border-amber-300 px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-sm transition-all focus:ring-2 focus:ring-amber-500">
              <Globe className="w-5 h-5" /> Χάρτης Ναών
            </button>
          </Link>
          <Link href="/admin/onboarding">
            <button className="bg-[var(--brand)] hover:bg-[var(--brand-dark)] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all">
              <Plus className="w-5 h-5" /> Προσθήκη Νέου Ναού
            </button>
          </Link>
        </div>'''

text2 = text2.replace(old_buttons, new_buttons)

with open('src/app/admin/super/SuperDashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(text2)
