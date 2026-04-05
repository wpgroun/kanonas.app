const fs = require('fs');

let file = fs.readFileSync('src/app/admin/sacraments/[type]/SacramentClient.tsx', 'utf8');

// 1. Add Import
file = file.replace(
  "import DynamicWizard from './DynamicWizard';",
  "import DynamicWizard from './DynamicWizard';\nimport PrintPreviewModal from './PrintPreviewModal';"
);

// 2. Add State
file = file.replace(
  "const [isWizardOpen, setIsWizardOpen] = useState(false);",
  "const [isWizardOpen, setIsWizardOpen] = useState(false);\n  const [previewRecord, setPreviewRecord] = useState<any>(null);"
);

// 3. Hook Button
file = file.replace(
  `onClick={() => setIsWizardOpen(true)}`,
  `onClick={() => setIsWizardOpen(true)}`
); // no change needed for Add button

// 4. Hook Table button
file = file.replace(
  '<button className="btn btn-ghost btn-sm border-slate-200 border text-slate-600 hover:text-brand hover:border-brand/30">',
  '<button onClick={() => setPreviewRecord(r)} className="btn btn-ghost btn-sm border-slate-200 border text-slate-600 hover:text-brand hover:border-brand/30">'
);

// 5. Add Modal to Bottom
file = file.replace(
  `{isWizardOpen && (`,
  `{previewRecord && <PrintPreviewModal record={previewRecord} templates={templates} onClose={() => setPreviewRecord(null)} />}\n\n      {isWizardOpen && (`
);

fs.writeFileSync('src/app/admin/sacraments/[type]/SacramentClient.tsx', file, 'utf8');
console.log('SacramentClient hooked with Print!');
