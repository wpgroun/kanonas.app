'use client';

import { useState, useMemo, useRef } from 'react';
import { generateFromTemplate } from '@/actions/docEngine';
import { FileText, Download, Printer, ArrowLeft, ChevronRight, Loader2,
         Sparkles, FileSignature, FileUp, CheckCircle2, Search, Eye } from 'lucide-react';
import Link from 'next/link';
import { humanizeVarName } from '@/lib/greeklishMap';

const DOC_TYPE_LABELS: Record<string, string> = {
  vaptisi: '💧 Βαπτίσεως', gamos: '💍 Γάμου', divorce: '📋 Διαζυγίου',
  funeral: '🕯️ Κηδείας', other: '📄 Λοιπά'
};

export default function GenerateClient({ templates, selectedTemplateId }: { templates: any[], selectedTemplateId?: string }) {
  const [step, setStep] = useState(selectedTemplateId ? 1 : 0);
  const [templateId, setTemplateId] = useState(selectedTemplateId || '');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const selected = useMemo(() => templates.find(t => t.id === templateId), [templates, templateId]);

  const variables = useMemo(() => {
    if (!selected) return [];
    // From context (uploaded PDFs)
    try { if (selected.context) return JSON.parse(selected.context); } catch {}
    // From HTML content
    if (selected.htmlContent) {
      const regex = /\{\{([^}]+)\}\}/g;
      const found = new Set<string>(); let m;
      while ((m = regex.exec(selected.htmlContent)) !== null) found.add(m[1].trim());
      return Array.from(found);
    }
    return [];
  }, [selected]);

  const filteredTemplates = useMemo(() => {
    if (!search) return templates;
    const q = search.toLowerCase();
    return templates.filter(t => t.nameEl.toLowerCase().includes(q) || (t.docType || '').toLowerCase().includes(q));
  }, [templates, search]);

  const handleGenerate = async () => {
    if (!templateId) return;
    setLoading(true);
    const res = await generateFromTemplate(templateId, answers);
    setResult(res);
    setLoading(false);
    if (res.success) setStep(3);
  };

  const handleDownload = () => {
    if (!result?.success) return;
    if (result.type === 'html') {
      const blob = new Blob([result.html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url;
      a.download = `${result.title || 'document'}.html`;
      a.click(); URL.revokeObjectURL(url);
    } else {
      const mime = result.type === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      const ext = result.type === 'pdf' ? '.pdf' : '.docx';
      const bytes = Uint8Array.from(atob(result.base64), c => c.charCodeAt(0));
      const blob = new Blob([bytes], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url;
      a.download = result.filename || `document${ext}`;
      a.click(); URL.revokeObjectURL(url);
    }
  };

  const handlePrint = () => {
    if (result?.type === 'html') {
      const w = window.open('', '_blank');
      if (w) { w.document.write(result.html); w.document.close(); w.focus(); setTimeout(() => w.print(), 500); }
    } else if (result?.type === 'pdf') {
      const bytes = Uint8Array.from(atob(result.base64), c => c.charCodeAt(0));
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    }
  };

  const STEPS = ['Πρότυπο', 'Συμπλήρωση', 'Δημιουργία', 'Αποτέλεσμα'];

  // System variables that are auto-filled
  const SYSTEM_VARS = ['ΝΑΟΣ_ΟΝΟΜΑ', 'ΝΑΟΣ_ΔΙΕΥΘΥΝΣΗ', 'ΜΗΤΡΟΠΟΛΗ', 'ΗΜΕΡΟΜΗΝΙΑ'];
  const userVars = variables.filter((v: string) => !SYSTEM_VARS.includes(v));

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 animate-in fade-in zoom-in-95 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/documents" className="btn btn-ghost btn-sm"><ArrowLeft className="w-4 h-4"/> Πίσω</Link>
          <h1 className="text-xl font-bold text-foreground">Δημιουργία Εγγράφου</h1>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex gap-1 mb-8">
        {STEPS.map((s, i) => (
          <div key={i} className={`flex-1 text-center py-2 rounded-lg text-xs font-bold transition-all ${i === step ? 'bg-[var(--brand)] text-white shadow-md' : i < step ? 'bg-emerald-100 text-emerald-700' : 'bg-[var(--surface)] text-[var(--text-muted)] border border-[var(--border)]'}`}>
            {i < step ? '✓' : i + 1}. {s}
          </div>
        ))}
      </div>

      {/* ── Step 0: Choose Template ── */}
      {step === 0 && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]"/>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Αναζήτηση προτύπου..." className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-brand/30"/>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredTemplates.map((t: any) => {
              const isUpload = !!t.fileUrl && !t.htmlContent;
              const isSelected = templateId === t.id;
              return (
                <button key={t.id} onClick={() => { setTemplateId(t.id); setStep(1); setAnswers({}); }}
                  className={`text-left p-4 rounded-xl border-2 transition-all ${isSelected ? 'border-[var(--brand)] bg-[var(--brand-light)]/30 shadow-sm' : 'border-[var(--border)] hover:border-[var(--brand)]/40 bg-[var(--surface)]'}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isUpload ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'}`}>
                      {isUpload ? <FileUp className="w-5 h-5"/> : <FileSignature className="w-5 h-5"/>}
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{t.nameEl}</p>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">{DOC_TYPE_LABELS[t.docType] || t.docType}</p>
                      {isUpload && <span className="text-[9px] uppercase font-black bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded mt-1 inline-block">PDF/DOCX</span>}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12 text-[var(--text-muted)]">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-30"/>
              <p className="font-medium">Δεν βρέθηκαν πρότυπα.</p>
              <Link href="/admin/documents" className="text-[var(--brand)] text-sm font-bold mt-2 inline-block">Δημιουργήστε ένα πρότυπο πρώτα →</Link>
            </div>
          )}
        </div>
      )}

      {/* ── Step 1: Fill Variables ── */}
      {step === 1 && selected && (
        <div className="space-y-6">
          <div className="card p-5 flex items-center gap-4 bg-[var(--brand-light)]/20 border-[var(--brand)]/20">
            <FileSignature className="w-8 h-8 text-[var(--brand)]"/>
            <div>
              <p className="font-bold text-foreground text-lg">{selected.nameEl}</p>
              <p className="text-sm text-[var(--text-muted)]">{DOC_TYPE_LABELS[selected.docType] || selected.docType} — {variables.length} μεταβλητές</p>
            </div>
          </div>

          {/* Auto-filled notice */}
          {variables.some((v: string) => SYSTEM_VARS.includes(v)) && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex gap-3 items-start">
              <Sparkles className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0"/>
              <div className="text-xs text-emerald-800">
                <p className="font-bold mb-1">Αυτόματη Συμπλήρωση</p>
                <p>Τα πεδία <b>Ναός</b>, <b>Μητρόπολη</b>, <b>Διεύθυνση</b> και <b>Ημερομηνία</b> συμπληρώνονται αυτόματα από τα στοιχεία του Ναού.</p>
              </div>
            </div>
          )}

          {/* User variables form */}
          {userVars.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">Συμπληρώστε τα παρακάτω πεδία:</h3>
              {userVars.map((v: string) => (
                <div key={v}>
                  <label className="block text-sm font-bold text-foreground mb-1">{humanizeVarName(v)}</label>
                  <input type="text" value={answers[v] || ''} onChange={e => setAnswers({...answers, [v]: e.target.value})}
                    placeholder={`Εισάγετε ${humanizeVarName(v).toLowerCase()}...`}
                    className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand/30"/>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-[var(--text-muted)]">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-emerald-400"/>
              <p className="font-medium">Όλα τα πεδία είναι αυτόματα!</p>
              <p className="text-xs mt-1">Πατήστε "Δημιουργία" για να προχωρήσετε.</p>
            </div>
          )}

          <div className="flex justify-between pt-4">
            <button onClick={() => setStep(0)} className="btn btn-ghost">← Αλλαγή Προτύπου</button>
            <button onClick={() => setStep(2)} className="btn btn-primary flex items-center gap-2">
              Επόμενο <ChevronRight className="w-4 h-4"/>
            </button>
          </div>
        </div>
      )}

      {/* ── Step 2: Confirm & Generate ── */}
      {step === 2 && selected && (
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-brand"/>  Επιβεβαίωση Στοιχείων
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between py-2 border-b border-[var(--border)]">
                <span className="text-sm text-[var(--text-muted)]">Πρότυπο</span>
                <span className="text-sm font-bold">{selected.nameEl}</span>
              </div>
              {userVars.map((v: string) => (
                <div key={v} className="flex justify-between py-2 border-b border-[var(--border)]">
                  <span className="text-sm text-[var(--text-muted)]">{humanizeVarName(v)}</span>
                  <span className="text-sm font-bold">{answers[v] || <span className="italic text-[var(--text-muted)]">—</span>}</span>
                </div>
              ))}
              {SYSTEM_VARS.filter(v => variables.includes(v)).map(v => (
                <div key={v} className="flex justify-between py-2 border-b border-[var(--border)] opacity-60">
                  <span className="text-sm text-[var(--text-muted)]">{humanizeVarName(v)}</span>
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-bold">Αυτόματο</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <button onClick={() => setStep(1)} className="btn btn-ghost">← Πίσω</button>
            <button onClick={handleGenerate} disabled={loading}
              className="btn btn-primary flex items-center gap-2 px-8 shadow-lg shadow-brand/30">
              {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Sparkles className="w-4 h-4"/>}
              {loading ? 'Δημιουργία...' : 'Δημιουργία Εγγράφου'}
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: Result ── */}
      {step === 3 && result && (
        <div className="space-y-6">
          {result.success ? (
            <>
              <div className="card p-6 text-center bg-emerald-50 border-emerald-200">
                <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto mb-3"/>
                <h3 className="text-xl font-black text-emerald-800">Το έγγραφο δημιουργήθηκε!</h3>
                <p className="text-sm text-emerald-600 mt-1">{result.title} — {result.type?.toUpperCase()}</p>
              </div>

              <div className="flex justify-center gap-3">
                <button onClick={handleDownload} className="btn btn-primary flex items-center gap-2 px-6 shadow-lg">
                  <Download className="w-4 h-4"/> Λήψη {result.type?.toUpperCase()}
                </button>
                {(result.type === 'html' || result.type === 'pdf') && (
                  <button onClick={handlePrint} className="btn btn-secondary flex items-center gap-2 px-6">
                    <Printer className="w-4 h-4"/> Εκτύπωση
                  </button>
                )}
              </div>

              {/* Preview for HTML */}
              {result.type === 'html' && (
                <div className="flex justify-center mt-4">
                  <iframe ref={iframeRef} srcDoc={result.html}
                    className="w-[21cm] h-[29.7cm] border border-[var(--border)] rounded-lg shadow-lg bg-white"
                    title="Προεπισκόπηση"/>
                </div>
              )}

              <div className="flex justify-center pt-4">
                <button onClick={() => { setStep(0); setResult(null); setAnswers({}); setTemplateId(''); }}
                  className="btn btn-ghost text-sm">
                  Δημιουργία Νέου Εγγράφου
                </button>
              </div>
            </>
          ) : (
            <div className="card p-6 text-center border-red-200 bg-red-50">
              <p className="text-red-700 font-bold">{result.error || 'Σφάλμα κατά τη δημιουργία.'}</p>
              <button onClick={() => setStep(2)} className="btn btn-ghost mt-4">← Δοκιμάστε ξανά</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
