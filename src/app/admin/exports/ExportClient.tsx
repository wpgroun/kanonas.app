'use client';

import { useState } from 'react';
import { Download, FileSpreadsheet, Users, Banknote, Receipt, FileText, Database, Loader2, CheckCircle2 } from 'lucide-react';
import { exportParishionersCSV, exportDonationsCSV, exportExpensesCSV, exportSacramentsCSV } from '@/actions/exports';

const EXPORTS = [
  { id: 'parishioners', label: 'Μητρώο Ενοριτών', desc: 'Πλήρης εξαγωγή ενοριτών με στοιχεία επικοινωνίας, ΑΦΜ, ΑΔΤ', icon: Users, color: 'bg-indigo-100 text-indigo-600', action: () => exportParishionersCSV() },
  { id: 'donations', label: 'Έσοδα / Εισπράξεις', desc: 'Όλες οι εισπράξεις του τρέχοντος έτους', icon: Banknote, color: 'bg-emerald-100 text-emerald-600', action: () => exportDonationsCSV() },
  { id: 'expenses', label: 'Έξοδα / Δαπάνες', desc: 'Όλα τα έξοδα του τρέχοντος έτους', icon: Receipt, color: 'bg-rose-100 text-rose-600', action: () => exportExpensesCSV() },
  { id: 'sacraments', label: 'Μυστήρια & Ακολουθίες', desc: 'Βαπτίσεις, Γάμοι, Κηδείες — ιστορικό αρχείο', icon: FileText, color: 'bg-amber-100 text-amber-600', action: () => exportSacramentsCSV() },
];

export default function ExportClient() {
  const [loading, setLoading] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const handleExport = async (exportItem: typeof EXPORTS[0]) => {
    setLoading(exportItem.id);
    setDone(null);
    try {
      const csv = await exportItem.action();
      
      // Trigger download
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kanonas_${exportItem.id}_${new Date().toISOString().slice(0,10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setDone(exportItem.id);
    } catch (e) {
      alert('Αποτυχία εξαγωγής. Δοκιμάστε ξανά.');
    }
    setLoading(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Database className="w-6 h-6 text-[var(--brand)]"/> Κέντρο Εξαγωγής Δεδομένων
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Εξάγετε τα δεδομένα σας σε μορφή <b>CSV (Excel)</b>. Τα αρχεία υποστηρίζουν πλήρως ελληνικούς χαρακτήρες.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] bg-[var(--background)] px-3 py-1.5 rounded-lg border border-[var(--border)]">
          <FileSpreadsheet className="w-4 h-4"/> Μορφή: CSV (UTF-8)
        </div>
      </div>

      {/* Export Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {EXPORTS.map(exp => {
          const Icon = exp.icon;
          const isLoading = loading === exp.id;
          const isDone = done === exp.id;
          
          return (
            <div key={exp.id} className="card p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${exp.color}`}>
                  <Icon className="w-6 h-6"/>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-[var(--foreground)]">{exp.label}</h3>
                  <p className="text-xs text-[var(--text-muted)] mt-1">{exp.desc}</p>
                </div>
              </div>
              <button
                onClick={() => handleExport(exp)}
                disabled={isLoading}
                className={`w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                  isDone 
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                    : 'bg-[var(--brand)] text-white hover:opacity-90 shadow-md shadow-indigo-200'
                } disabled:opacity-50`}
              >
                {isLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin"/> Εξαγωγή...</>
                ) : isDone ? (
                  <><CheckCircle2 className="w-4 h-4"/> Ολοκληρώθηκε!</>
                ) : (
                  <><Download className="w-4 h-4"/> Λήψη CSV</>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800 flex items-start gap-3">
        <FileSpreadsheet className="w-5 h-5 mt-0.5 flex-shrink-0"/>
        <div>
          <p className="font-bold mb-1">Συμβατότητα με Excel</p>
          <p className="text-xs text-blue-700">
            Τα αρχεία CSV χρησιμοποιούν κωδικοποίηση UTF-8 με BOM και ελληνικό delimiter (;) για σωστή εμφάνιση στο Microsoft Excel. 
            Αν ανοίξετε το αρχείο και δείτε σπασμένους χαρακτήρες, επιλέξτε «Δεδομένα → Από κείμενο» με κωδικοποίηση UTF-8.
          </p>
        </div>
      </div>
    </div>
  );
}
