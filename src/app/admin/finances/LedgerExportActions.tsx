'use client';

import { Download, Lock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useState } from 'react';

export default function LedgerExportActions({ currentYear = new Date().getFullYear() }: { currentYear?: number }) {
  const [isExporting, setIsExporting] = useState(false);
  const [isSealing, setIsSealing] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    // Simulate generation
    toast.info('Δημιουργία Γενικού Καθολικού σε PDF...');
    setTimeout(() => {
      toast.success('Το αρχείο είναι έτοιμο για λήψη!');
      setIsExporting(false);
    }, 1500);
  };

  const handleSeal = async () => {
    if (!confirm(`Είστε σίγουροι ότι θέλετε να σφραγίσετε το οικονομικό έτος ${currentYear}; Μετά τη σφράγιση, καμία συναλλαγή δε μπορεί να διαγραφεί ή να τροποποιηθεί.`)) return;
    
    setIsSealing(true);
    // Let's pretend to call a server action
    setTimeout(() => {
      toast.error('Πρέπει να καλέσετε την εντολή κλεισίματος μέσω του συστήματος διαχείρισης. Μη διαθέσιμο στο τρέχον Demo.');
      setIsSealing(false);
    }, 1000);
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={handleExport} disabled={isExporting} className="bg-[var(--surface)] border-[var(--border)] text-slate-700 hover:bg-[var(--background)]">
        <Download className="w-4 h-4 mr-2" />
        Εξαγωγή (PDF/Excel)
      </Button>

      <Button variant="outline" size="sm" onClick={handleSeal} disabled={isSealing} className="bg-[var(--danger-light)] border-[var(--danger)]/20 text-[var(--danger)] hover:bg-[var(--danger-light)] font-bold transition-colors">
        <Lock className="w-4 h-4 mr-2" />
        Κλείσιμο Έτους ('{currentYear.toString().substring(2)})
      </Button>
    </div>
  );
}
