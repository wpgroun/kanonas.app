const fs = require('fs');
let content = fs.readFileSync('src/app/admin/schedule/ScheduleClient.tsx', 'utf8');

if (!content.includes('bulkImportOrthodoxCalendar')) {
  // Add Import
  content = content.replace(
    "import { addServiceSchedule, deleteServiceSchedule } from '@/actions/schedule'",
    "import { addServiceSchedule, deleteServiceSchedule, bulkImportOrthodoxCalendar } from '@/actions/schedule';"
  );
  
  // Add Lucide Icon
  content = content.replace(
    "import { CalendarDays, ExternalLink, Printer, Plus, Trash2, Clock } from 'lucide-react';",
    "import { CalendarDays, ExternalLink, Printer, Plus, Trash2, Clock, DownloadCloud } from 'lucide-react';"
  );

  // Add State
  content = content.replace(
    "const [loading, setLoading] = useState(false);",
    "const [loading, setLoading] = useState(false);\n  const [importing, setImporting] = useState(false);\n  const [importYear, setImportYear] = useState(new Date().getFullYear());\n\n  const handleBulkImport = async () => {\n    if(!confirm(`Θέλετε σίγουρα να εισάγετε αυτόματα τις εορτές του ${importYear};`)) return;\n    setImporting(true);\n    const res = await bulkImportOrthodoxCalendar(importYear);\n    alert(`Επιτυχία! Προστέθηκαν ${res.inserted} εορτές. (Παραλείφθηκαν ${res.skipped} που υπήρχαν ήδη).`);\n    setImporting(false);\n  };"
  );

  // Add Button to UI actions in PageHeader
  const headerTarget = `<Link href="/admin/schedule/print"target="_blank">\n <Button className="shadow-sm">\n <Printer className="w-4 h-4 mr-2"/> Εκτύπωση Εβδομάδας\n </Button>\n </Link>`;
  const addedButton = `${headerTarget}\n <Button variant="secondary" onClick={handleBulkImport} disabled={importing} className="shadow-sm border-slate-200">\n <DownloadCloud className="w-4 h-4 mr-2"/> {importing ? 'Γίνεται Εισαγωγή...' : 'Αυτόματο Εορτολόγιο'}\n </Button>`;
  
  content = content.replace(headerTarget, addedButton);

  fs.writeFileSync('src/app/admin/schedule/ScheduleClient.tsx', content, 'utf8');
  console.log('Successfully patched ScheduleClient.tsx');
} else {
  console.log('ScheduleClient.tsx already patched.');
}
