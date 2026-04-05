const fs = require('fs');

let ash = fs.readFileSync('src/app/admin/AdminShell.tsx', 'utf8');

if (!ash.includes("/admin/documents")) {
  ash = ash.replace(
    "{ href: '/admin/settings', icon: Settings, label: dict.nav.settings, requiredPerm: 'isHeadPriest' },",
    "{ href: '/admin/documents', icon: FileText, label: 'Πρότυπα Εγγράφων', requiredPerm: 'isHeadPriest' },\n { href: '/admin/settings', icon: Settings, label: dict.nav.settings, requiredPerm: 'isHeadPriest' },"
  );
  fs.writeFileSync('src/app/admin/AdminShell.tsx', ash, 'utf8');
  console.log('Added Documents to AdminShell!');
} else {
  console.log('Already added.');
}
