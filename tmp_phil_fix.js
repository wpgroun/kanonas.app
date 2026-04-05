const fs = require('fs');

let file = fs.readFileSync('src/app/admin/philanthropy/PhilanthropyClient.tsx', 'utf8');

// 1. Add Import
file = file.replace(
  "import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';", 
  "import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';\nimport BeneficiaryForm from './BeneficiaryForm';"
);

// 2. Add State
file = file.replace(
  "const [activeTab, setActiveTab] = useState('Στατιστικά');",
  "const [activeTab, setActiveTab] = useState('Στατιστικά');\n  const [isAddModalOpen, setIsAddModalOpen] = useState(false);"
);

// 3. Shrink Message
const oldHeading = `<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
 <div>
 <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
 Συσσίτιο & Φιλόπτωχο
 </h1>
 <p className="text-muted-foreground mt-1 text-sm">
 Διαχείριση ωφελουμένων, αποθήκης και καθημερινού συσσιτίου.
 </p>
 </div>
 </div>

 <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
 <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5"/>
 <div>
 <h4 className="text-sm font-semibold text-amber-800">Αυστηρά εμπιστευτικά δεδομένα</h4>
 <p className="text-sm text-amber-700/80 mt-0.5">Πρόσβαση στο Φιλόπτωχο έχουν μόνο εξουσιοδοτημένοι διαχειριστές και η Φιλόπτωχος Αδελφότης.</p>
 </div>
 </div>`;

const newHeading = `<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
 <div>
 <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
 Συσσίτιο & Φιλόπτωχο
 <span className="bg-amber-100/50 text-amber-700 text-xs font-semibold px-2 py-1 rounded inline-flex items-center gap-1 border border-amber-200/50 ml-2">
   <Lock className="w-3 h-3"/> GDPR
 </span>
 </h1>
 <p className="text-muted-foreground mt-1 text-sm">
 Διαχείριση ωφελουμένων, αποθήκης και καθημερινού συσσιτίου.
 </p>
 </div>
 </div>`;

file = file.replace(oldHeading, newHeading);

// 4. Hook Button
file = file.replace(
  `<Button size="sm"><Plus className="w-4 h-4 mr-2"/> Προσθήκη Ανεξάρτητου</Button>`,
  `<Button size="sm" onClick={() => setIsAddModalOpen(true)}><Plus className="w-4 h-4 mr-2"/> Προσθήκη Ανεξάρτητου</Button>`
);

// 5. Add Modal to Bottom
file = file.replace(
  `</div>\n)`,
  `  <BeneficiaryForm isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />\n  </div>\n)`
);

fs.writeFileSync('src/app/admin/philanthropy/PhilanthropyClient.tsx', file, 'utf8');
console.log('PhilanthropyClient Modified!');
