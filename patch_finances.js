const fs = require('fs');

let content = fs.readFileSync('src/app/admin/finances/page.tsx', 'utf8');

if (!content.includes('LedgerExportActions')) {
  // Add Import
  content = content.replace("import PageHeader from '@/components/PageHeader'", "import LedgerExportActions from './LedgerExportActions'\nimport PageHeader from '@/components/PageHeader'");
  
  // Replace Actions
  content = content.replace(
    'actions={<TransactionDialog categories={categories} />}', 
    `actions={
      <div className="flex items-center gap-3">
        <LedgerExportActions />
        <TransactionDialog categories={categories} />
      </div>
    }`
  );

  fs.writeFileSync('src/app/admin/finances/page.tsx', content);
  console.log('patched finances page');
} else {
  console.log('already patched');
}
