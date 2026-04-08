const fs = require('fs');
const path = require('path');

const files = [
  'src/app/admin/parishioners/ParishionersClient.tsx',
  'src/app/admin/finances/page.tsx',
  'src/app/admin/finances/TransactionDialog.tsx',
  'src/app/admin/documents/DocumentsClient.tsx',
  'src/app/admin/connect/ConnectClient.tsx',
  'src/app/admin/bloodbank/BloodBankModule.tsx'
];

for (const relPath of files) {
  const p = path.join(process.cwd(), relPath);
  if (!fs.existsSync(p)) continue;
  
  let content = fs.readFileSync(p, 'utf8');

  // Remove ALL dark: prefixes
  content = content.replace(/dark:[^\s"']+/g, '');

  // Badges
  // bg-emerald-100 text-emerald-800 border border-emerald-200 -> badge badge-success
  // bg-red-100 text-red-700 -> badge badge-danger
  content = content.replace(/bg-emerald-\d+\s+text-emerald-\d+(?:\s+border\s+border-emerald-\d+)?/g, 'badge badge-success');
  content = content.replace(/bg-red-\d+\s+text-red-\d+(?:\s+border\s+border-red-\d+)?/g, 'badge badge-danger');
  content = content.replace(/bg-amber-\d+\s+text-amber-\d+(?:\s+border\s+border-amber-\d+)?/g, 'badge badge-warning');
  content = content.replace(/bg-blue-\d+\s+text-blue-\d+(?:\s+border\s+border-blue-\d+)?/g, 'badge badge-info');
  // text-[var(--success)] bg-[var(--success-light)] -> badge badge-success
  content = content.replace(/bg-\[var\(--success-light\)]\s+text-\[var\(--success\)]/g, 'badge badge-success');
  content = content.replace(/bg-\[var\(--danger-light\)]\s+text-\[var\(--danger\)]/g, 'badge badge-danger');
  content = content.replace(/bg-zinc-800\s+text-zinc-100\s+border\s+border-zinc-900/g, 'badge');
  content = content.replace(/bg-gray-100\s+text-gray-800\s+border\s+border-gray-200/g, 'badge bg-slate-100 text-slate-700 border border-slate-200');

  // Input
  content = content.replace(/bg-white border-2 border-border/g, 'input bg-white');

  // Buttons
  content = content.replace(/bg-gradient-to-r\s+from-indigo-\d+\s+to-violet-\d+\s+hover:from-indigo-\d+\s+hover:to-violet-\d+\s+text-white\s+shadow-md\s+border-0/g, 'btn btn-primary shadow-md');
  content = content.replace(/bg-gradient-to-r\s+from-emerald-500\s+to-teal-600\s+hover:from-emerald-600\s+hover:to-teal-700\s+text-white/g, 'btn btn-success');
  content = content.replace(/bg-gradient-to-r\s+from-rose-500\s+to-orange-600\s+hover:from-rose-600\s+hover:to-orange-700\s+text-white/g, 'btn btn-danger');
  content = content.replace(/bg-gradient-to-r\s+from-emerald-500\s+to-teal-500\s+hover:from-emerald-600\s+hover:to-teal-600/g, 'btn btn-success');
  content = content.replace(/bg-gradient-to-r\s+from-rose-500\s+to-orange-500\s+hover:from-rose-600\s+hover:to-orange-600/g, 'btn btn-danger');
  
  content = content.replace(/bg-emerald-600\s+hover:bg-emerald-700\s+text-white/g, 'btn btn-success');
  content = content.replace(/bg-red-600\s+hover:bg-red-700\s+text-white/g, 'btn btn-danger');
  content = content.replace(/bg-purple-600\s+hover:bg-purple-700\s+text-white/g, 'btn btn-primary');
  content = content.replace(/bg-amber-600\s+hover:bg-amber-700\s+text-white/g, 'btn text-white bg-amber-600 hover:bg-amber-700');
  content = content.replace(/bg-blue-600\s+hover:bg-blue-700\s+text-white/g, 'btn btn-info');
  // "btn btn-secondary border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold"
  
  // Cards
  content = content.replace(/shadow-sm\s+border-border\/60\s+bg-\[var\(--surface\)]/g, 'card');
  content = content.replace(/shadow-sm\s+border-border\/60\s+hover:shadow-md/g, 'card hover:shadow-md');
  content = content.replace(/bg-\[var\(--surface\)]\s+w-full\s+max-w-xl\s+rounded-2xl\s+shadow-2xl/g, 'card w-full max-w-xl shadow-2xl');

  // Empty state substitutions
  content = content.replace(/shadow-sm\s+border-border\/50\s+border-dashed\s+border-2\s+bg-muted\/20/g, 'empty-state');
  
  // Cleanup multiple spaces
  content = content.replace(/  +/g, ' ');

  fs.writeFileSync(p, content, 'utf8');
  console.log(`Refactored ${relPath}`);
}
