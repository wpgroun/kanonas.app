'use client';
import { useState } from 'react';
import { Plus, List, Search, Map, CheckCircle2, XCircle } from 'lucide-react';
import DynamicWizard from './DynamicWizard';
import PrintPreviewModal from './PrintPreviewModal';

export default function SacramentClient({ urlType, internalDocType, templates, initialRecords }: any) {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [previewRecord, setPreviewRecord] = useState<any>(null);

  const titleMap: Record<string, string> = {
    'baptisms': 'Βιβλίο Βαπτίσεων',
    'marriages': 'Βιβλίο Γάμων',
    'funerals': 'Βιβλίο Εκδημιών'
  };

  const title = titleMap[urlType] || 'Μητρώο Μυστηρίων';

  return (
    <div className="container-fluid mt-6 space-y-6 animate-in fade-in zoom-in-95 duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            {title} <span className="text-xs bg-brand-light text-brand font-black px-2 py-0.5 rounded-full border border-brand/20 uppercase">Dynamic Engine</span>
          </h1>
          <p className="text-muted-foreground mt-1 text-sm max-w-2xl">
            Αρχείο {title.split(' ')[1] || 'Μυστηρίων'}. {templates.length === 0 ? 'Δεν υπάρχουν πρότυπα (Templates) για αυτό το μυστήριο στο Document Engine.' : `Έχουν φορτωθεί ${templates.length} δυναμικά πρότυπα.`} 
          </p>
        </div>
        <button
          disabled={templates.length === 0}
          onClick={() => setIsWizardOpen(true)}
          className="btn btn-primary flex items-center gap-2 shadow-lg shadow-brand/30 disabled:opacity-50"
        >
          <Plus className="w-5 h-5"/> Νέα Καταχώρηση
        </button>
      </div>

      {templates.length === 0 && (
        <div className="bg-[var(--warning-light)] border border-amber-200 text-[var(--warning)] p-4 rounded-xl flex items-center gap-3">
          <XCircle className="w-6 h-6"/>
          <div>
            <span className="font-bold block">Απαιτείται Document Template</span>
            <span className="text-sm">Πρέπει πρώτα να δημιουργήσετε ένα πρότυπο HTML στο "Πρότυπα Εγγράφων" (Ρυθμίσεις) για να αποκαλυφθούν τα πεδία του Wizard!</span>
          </div>
        </div>
      )}

      {/* MATRIX */}
      <div className="bg-[var(--surface)] rounded-2xl shadow-sm border border-[var(--border)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[var(--background)] text-[var(--text-secondary)] border-b border-[var(--border)] font-medium">
              <tr>
                <th className="p-4 font-bold text-center w-24">A/A</th>
                <th className="p-4 font-bold">Όνομα Πελάτη</th>
                <th className="p-4 font-bold">Ημερομηνία</th>
                <th className="p-4 font-bold">Κατάσταση</th>
                <th className="p-4 font-bold text-center">Μεταβλητές (JSON)</th>
                <th className="p-4 font-bold text-center">Ενέργειες / Εκτύπωση</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {initialRecords.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-[var(--text-muted)]">Δεν βρέθηκαν καταχωρήσεις.</td></tr>
              ) : initialRecords.map((r: any) => {
                const meta = r.ceremonyMeta?.dataJson ? JSON.parse(r.ceremonyMeta.dataJson) : {};
                const keys = Object.keys(meta).length;
                return (
                  <tr key={r.id} className="hover:bg-[var(--background)] transition-colors">
                    <td className="p-4 text-center font-mono text-xs text-[var(--text-muted)] font-bold">{(r.id as string).substring(r.id.length-6).toUpperCase()}</td>
                    <td className="p-4 font-bold text-[var(--foreground)]">{r.customerName || '-'}</td>
                    <td className="p-4 text-[var(--text-secondary)]">{new Date(r.createdAt).toLocaleDateString('el-GR')}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-[var(--success-light)] text-[var(--success)] text-xs font-bold rounded-lg border border-[var(--success)]/20">ΟΛΟΚΛΗΡΩΜΕΝΟ</span>
                    </td>
                    <td className="p-4 text-center text-xs font-bold text-blue-600">
                      {keys} Dynamic Tags
                    </td>
                    <td className="p-4 text-center">
                      <button onClick={() => setPreviewRecord(r)} className="btn btn-ghost btn-sm border-[var(--border)] border text-[var(--text-secondary)] hover:text-brand hover:border-brand/30">
                        Προβολή
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {previewRecord && <PrintPreviewModal record={previewRecord} templates={templates} onClose={() => setPreviewRecord(null)} />}

      {isWizardOpen && (
         <DynamicWizard 
            internalDocType={internalDocType} 
            templates={templates} 
            onClose={() => setIsWizardOpen(false)} 
         />
      )}
    </div>
  );
}
