'use client';

import { useState } from 'react';
import { generateFilledDocument } from '@/actions/docEngine';
import { Printer, Download, ArrowLeft, FileText, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function DocPreviewClient({ templateId, initialAnswers }: { templateId?: string, initialAnswers?: Record<string, string> }) {
  const [html, setHtml] = useState<string | null>(null);
  const [title, setTitle] = useState('Έγγραφο');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!templateId) return;
    setLoading(true);
    const result = await generateFilledDocument(templateId, initialAnswers || {});
    if (result.success && result.html) {
      setHtml(result.html);
      setTitle(result.title || 'Έγγραφο');
    }
    setLoading(false);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow && html) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 500);
    }
  };

  if (!html) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-6">
        <div className="mx-auto w-20 h-20 bg-[var(--brand-light)] rounded-2xl flex items-center justify-center">
          <FileText className="w-10 h-10 text-[var(--brand)]"/>
        </div>
        <h2 className="text-2xl font-bold text-[var(--foreground)]">Προεπισκόπηση Εγγράφου</h2>
        <p className="text-[var(--text-muted)]">Πατήστε &quot;Δημιουργία&quot; για να συμπληρωθούν αυτόματα τα πεδία του προτύπου.</p>
        <button 
          onClick={handleGenerate} 
          disabled={loading || !templateId}
          className="btn btn-primary btn-lg"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : <FileText className="w-5 h-5"/>}
          {loading ? 'Δημιουργία...' : 'Δημιουργία Εγγράφου'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between bg-[var(--surface)] p-4 rounded-xl border border-[var(--border)] shadow-sm no-print">
        <div className="flex items-center gap-3">
          <Link href="/admin/documents" className="btn btn-ghost btn-sm">
            <ArrowLeft className="w-4 h-4"/> Πίσω
          </Link>
          <span className="text-sm font-bold text-[var(--foreground)]">{title}</span>
        </div>
        <div className="flex gap-2">
          <button onClick={handlePrint} className="btn btn-primary btn-sm">
            <Printer className="w-4 h-4"/> Εκτύπωση / PDF
          </button>
        </div>
      </div>

      {/* Preview iframe */}
      <div className="w-full flex justify-center">
        <iframe 
          srcDoc={html} 
          className="w-[21cm] h-[29.7cm] border border-[var(--border)] rounded-lg shadow-lg bg-white"
          title="Document Preview"
        />
      </div>
    </div>
  );
}
