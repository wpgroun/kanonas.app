'use client'

import { useState, useCallback, useRef } from 'react'
import {
  Upload, FileText, CheckCircle2, AlertCircle, X,
  Download, Users, SkipForward, ChevronRight
} from 'lucide-react'
import { parseCSVParishioners, batchImportParishioners, ImportedParishioner } from '@/actions/import'

type Step = 'upload' | 'preview' | 'result'

interface ImportResult {
  created: number
  skipped: number
  errors: { row: number; reason: string }[]
}

export default function ImportWizard() {
  const [step, setStep] = useState<Step>('upload')
  const [rows, setRows] = useState<ImportedParishioner[]>([])
  const [fileName, setFileName] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(async (file: File) => {
    setFileName(file.name)
    const text = await file.text()
    const parsed = await parseCSVParishioners(text)
    setRows(parsed)
    setStep('preview')
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && (file.name.endsWith('.csv') || file.name.endsWith('.txt'))) {
      handleFile(file)
    }
  }, [handleFile])

  const handleImport = async () => {
    setLoading(true)
    try {
      const res = await batchImportParishioners(rows)
      setResult(res)
      setStep('result')
    } finally {
      setLoading(false)
    }
  }

  const downloadTemplate = () => {
    const template = 'Επώνυμο,Όνομα,Πατρώνυμο,Email,Τηλέφωνο,Διεύθυνση,Πόλη,ΑΦΜ\n' +
      'Παπαδόπουλος,Γεώργιος,Δημήτριος,g.papadopoulos@example.gr,6912345678,Ζεφύρου 12,Αθήνα,123456789'
    const blob = new Blob(['\ufeff' + template], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'πρότυπο_εισαγωγής_ενοριτών.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[var(--foreground)] flex items-center gap-2">
          <Upload className="w-5 h-5 text-[var(--brand)]" />
          Εισαγωγή Ενοριτών από CSV
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Εισάγετε μαζικά ενορίτες από αρχείο CSV ή Excel (αποθηκευμένο ως CSV).
        </p>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-2">
        {(['upload', 'preview', 'result'] as Step[]).map((s, idx) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              step === s ? 'bg-[var(--brand)] text-white' :
              (['upload', 'preview', 'result'].indexOf(step) > idx)
                ? 'bg-[var(--success)] text-white'
                : 'bg-[var(--surface-hover)] text-[var(--text-muted)]'
            }`}>{idx + 1}</div>
            <span className={`text-xs font-medium ${step === s ? 'text-[var(--foreground)]' : 'text-[var(--text-muted)]'}`}>
              {s === 'upload' ? 'Ανέβασμα' : s === 'preview' ? 'Προεπισκόπηση' : 'Αποτέλεσμα'}
            </span>
            {idx < 2 && <ChevronRight className="w-4 h-4 text-[var(--border)]" />}
          </div>
        ))}
      </div>

      {/* Step: Upload */}
      {step === 'upload' && (
        <div className="space-y-4">
          {/* Template download */}
          <div className="card p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)]">Κατεβάστε το Πρότυπο CSV</p>
              <p className="text-xs text-[var(--text-muted)]">Χρησιμοποιήστε την παρακάτω δομή για να προετοιμάσετε το αρχείο σας.</p>
            </div>
            <button onClick={downloadTemplate} className="btn btn-secondary btn-sm flex items-center gap-2">
              <Download className="w-3.5 h-3.5" /> Πρότυπο CSV
            </button>
          </div>

          {/* Drop zone */}
          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer ${
              dragOver
                ? 'border-[var(--brand)] bg-[var(--brand-light)]'
                : 'border-[var(--border)] hover:border-[var(--brand)] hover:bg-[var(--surface-hover)]'
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.txt"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
            />
            <Upload className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3" />
            <p className="text-base font-semibold text-[var(--foreground)]">Σύρτε το CSV εδώ ή κάντε κλικ</p>
            <p className="text-sm text-[var(--text-muted)] mt-1">Υποστηρίζονται αρχεία .csv και .txt</p>
          </div>
        </div>
      )}

      {/* Step: Preview */}
      {step === 'preview' && (
        <div className="space-y-4">
          <div className="card p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-[var(--brand)]" />
              <div>
                <p className="text-sm font-semibold">{fileName}</p>
                <p className="text-xs text-[var(--text-muted)]">{rows.length} εγγραφές βρέθηκαν</p>
              </div>
            </div>
            <button onClick={() => { setStep('upload'); setRows([]); setFileName('') }}
              className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[var(--surface-hover)] text-[var(--text-muted)]">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--surface-hover)]">
                    {['Επώνυμο', 'Όνομα', 'Πατρώνυμο', 'Email', 'Τηλέφωνο', 'Πόλη'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-muted)]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 20).map((r, i) => (
                    <tr key={i} className="border-b border-[var(--border)] hover:bg-[var(--surface-hover)]">
                      <td className="px-4 py-2.5 font-medium text-[var(--foreground)]">{r.lastName}</td>
                      <td className="px-4 py-2.5">{r.firstName}</td>
                      <td className="px-4 py-2.5 text-[var(--text-muted)]">{r.fathersName || '—'}</td>
                      <td className="px-4 py-2.5 text-[var(--text-muted)]">{r.email || '—'}</td>
                      <td className="px-4 py-2.5 text-[var(--text-muted)]">{r.phone || '—'}</td>
                      <td className="px-4 py-2.5 text-[var(--text-muted)]">{r.city || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {rows.length > 20 && (
              <div className="px-4 py-2.5 text-xs text-[var(--text-muted)] border-t border-[var(--border)] bg-[var(--surface-hover)]">
                ...και {rows.length - 20} ακόμη εγγραφές
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <button onClick={() => { setStep('upload'); setRows([]) }} className="btn btn-secondary">
              Πίσω
            </button>
            <button onClick={handleImport} disabled={loading || rows.length === 0} className="btn btn-primary">
              {loading ? 'Εισαγωγή...' : `Εισαγωγή ${rows.length} Ενοριτών`}
            </button>
          </div>
        </div>
      )}

      {/* Step: Result */}
      {step === 'result' && result && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="card p-4 text-center border border-[var(--success)]/20">
              <CheckCircle2 className="w-8 h-8 text-[var(--success)] mx-auto mb-2" />
              <p className="text-2xl font-extrabold text-[var(--success)]">{result.created}</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">Εισήχθησαν</p>
            </div>
            <div className="card p-4 text-center">
              <SkipForward className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2" />
              <p className="text-2xl font-extrabold text-[var(--foreground)]">{result.skipped}</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">Παραλείφθηκαν (διπλότυπα)</p>
            </div>
            <div className="card p-4 text-center border border-[var(--danger)]/20">
              <AlertCircle className="w-8 h-8 text-[var(--danger)] mx-auto mb-2" />
              <p className="text-2xl font-extrabold text-[var(--danger)]">{result.errors.length}</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">Σφάλματα</p>
            </div>
          </div>

          {result.errors.length > 0 && (
            <div className="card p-4 border border-[var(--danger)]/20">
              <h3 className="text-sm font-semibold text-[var(--danger)] mb-2">Σφάλματα εισαγωγής</h3>
              <div className="space-y-1">
                {result.errors.map((e, i) => (
                  <p key={i} className="text-xs text-[var(--text-muted)]">
                    <span className="font-semibold">Γραμμή {e.row}:</span> {e.reason}
                  </p>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => { setStep('upload'); setRows([]); setResult(null) }} className="btn btn-secondary">
              Νέα Εισαγωγή
            </button>
            <a href="/admin/parishioners" className="btn btn-primary flex items-center gap-2">
              <Users className="w-4 h-4" /> Μητρώο Ενοριτών
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
