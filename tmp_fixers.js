const fs = require('fs');
const path = require('path');

// 1. Fix page.tsx JSX
const pagePath = path.join(__dirname, 'src/app/admin/finances/page.tsx');
let pageContent = fs.readFileSync(pagePath, 'utf8');
const biStart = pageContent.indexOf('{/* Separator / BI */}');
if (biStart !== -1) {
    const keepStart = pageContent.substring(0, biStart);
    // Find the last </div> before BI
    // Actually just rebuild from biStart
    const newEnd = `
  {/* Separator / BI */}
  <div className="border-t border-border/50 pt-8 hidden sm:block">
    <h2 className="text-xl font-bold tracking-tight flex items-center gap-2 mb-6 text-foreground">
      <BarChart3 className="w-5 h-5 text-primary"/>
      Επισκόπηση Business Intelligence
    </h2>
    <FinanceBIClient {...biStats} />
  </div>
</div>
</div>
</div>
  );
}
`;
    // We trim the ending
    const targetTrim = keepStart.replace(/\s+<\/div>\s*<\/div>\s*<\/div>\s*$/g, '');
    fs.writeFileSync(pagePath, targetTrim + newEnd, 'utf8');
    console.log('Fixed page.tsx');
}

// 2. Fix TransactionDialog.tsx (remove X icon)
const txPath = path.join(__dirname, 'src/app/admin/finances/TransactionDialog.tsx');
let txContent = fs.readFileSync(txPath, 'utf8');
txContent = txContent.replace(/<X className="w-5 h-5"\/>/g, '<span className="text-xs font-bold px-2">ΚΛΕΙΣΙΜΟ</span>');
fs.writeFileSync(txPath, txContent, 'utf8');
console.log('Fixed TransactionDialog.tsx');

// 3. Fix LedgerClient.tsx (remove X icon)
const lcPath = path.join(__dirname, 'src/app/admin/finances/ledger/LedgerClient.tsx');
let lcContent = fs.readFileSync(lcPath, 'utf8');
lcContent = lcContent.replace(/<X className="w-5 h-5"\/>/g, '<span className="text-xs font-bold px-2">ΚΛΕΙΣΙΜΟ</span>');
fs.writeFileSync(lcPath, lcContent, 'utf8');
console.log('Fixed LedgerClient.tsx');
