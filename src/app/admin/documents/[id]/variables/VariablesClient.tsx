'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, CheckCircle2, AlertTriangle, Loader2, EyeOff, Wand2, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { saveVariableMap, rescanTemplateVariables } from '@/actions/documents'

interface Props {
  template: { id: string; nameEl: string; needsMapping: boolean }
  detectedVars: string[]
  detectedFormat: string
  currentMap: Record<string, string>
  standardFields: { key: string; label: string }[]
}

const DELIMITER_DISPLAY: Record<string, (v: string) => string> = {
  brackets: (v) => `[${v}]`,
  single_curly: (v) => `{${v}}`,
  mustache: (v) => `{{${v}}}`,
}

export default function VariablesClient({
  template,
  detectedVars,
  detectedFormat,
  currentMap,
  standardFields,
}: Props) {
  const router = useRouter()
  const [map, setMap] = useState<Record<string, string>>(() => {
    // Ensure all detected vars have an entry
    const init: Record<string, string> = {}
    for (const v of detectedVars) {
      init[v] = currentMap[v] || '__unknown__'
    }
    return init
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [rescanning, setRescanning] = useState(false)

  const handleRescan = async () => {
    setRescanning(true)
    const res = await rescanTemplateVariables(template.id)
    setRescanning(false)
    if (res.success) {
      router.refresh()
    } else {
      alert(res.error || 'Σφάλμα επανα-σάρωσης')
    }
  }

  const formatVar = DELIMITER_DISPLAY[detectedFormat] || DELIMITER_DISPLAY.brackets

  const unknownCount = Object.values(map).filter(v => v === '__unknown__').length
  const mappedCount = Object.values(map).filter(v => v !== '__unknown__' && v !== '__ignore__').length
  const ignoredCount = Object.values(map).filter(v => v === '__ignore__').length

  const handleSave = async () => {
    setSaving(true)
    const res = await saveVariableMap(template.id, map)
    setSaving(false)
    if (res.success) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
      router.refresh()
    }
  }

  return (
    <div className="container-fluid mt-6 space-y-6 animate-in fade-in zoom-in-95 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Link href="/admin/documents" className="hover:text-foreground flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Πρότυπα
            </Link>
            <span>/</span>
            <span className="font-medium text-foreground">{template.nameEl}</span>
            <span>/</span>
            <span>Αντιστοίχηση Μεταβλητών</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Wand2 className="w-6 h-6 text-violet-500" />
            Αντιστοίχηση Μεταβλητών
          </h1>
          <p className="text-muted-foreground mt-1 text-sm max-w-2xl">
            Πείτε στο Kanonas τι αντιπροσωπεύει κάθε μεταβλητή του προτύπου σας.
            Έτσι θα συμπληρώνεται αυτόματα από τα δεδομένα της τελετής.
          </p>
          {mappedCount > 0 && unknownCount === 0 && (
            <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5 mt-2 inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5"/> Όλες οι μεταβλητές αναγνωρίστηκαν αυτόματα — δεν απαιτείται καμία ενέργεια.
            </p>
          )}
        </div>
        <div className="flex gap-2 self-start md:self-auto">
          <button
            onClick={handleRescan}
            disabled={rescanning}
            title="Επανα-σαρώνει το αρχείο για μεταβλητές (χρήσιμο αν ανέβηκε με παλαιό κώδικα)"
            className="btn btn-secondary flex items-center gap-2 border-violet-200 text-violet-700 hover:bg-violet-50"
          >
            {rescanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Επανα-σάρωση
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary flex items-center gap-2 shadow-lg shadow-brand/30"
          >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : saved ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saved ? 'Αποθηκεύτηκε!' : 'Αποθήκευση'}
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-sm font-bold text-emerald-700">
          <CheckCircle2 className="w-4 h-4" /> {mappedCount} αντιστοιχισμένες
        </div>
        {unknownCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-sm font-bold text-amber-700">
            <AlertTriangle className="w-4 h-4" /> {unknownCount} χωρίς αντιστοίχηση
          </div>
        )}
        {ignoredCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-sm font-bold text-slate-600">
            <EyeOff className="w-4 h-4" /> {ignoredCount} αγνοούνται
          </div>
        )}
      </div>

      {unknownCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 items-start">
          <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-amber-800">
            <p className="font-bold mb-0.5">Υπάρχουν μεταβλητές χωρίς αντιστοίχηση</p>
            <p>Επιλέξτε τι αντιπροσωπεύει η κάθε μεταβλητή από το αναπτυσσόμενο μενού.
            Αν κάποια μεταβλητή δεν χρειάζεται αντιστοίχηση, επιλέξτε «Αγνόηση».</p>
          </div>
        </div>
      )}

      {/* Variable mapping table */}
      <div className="card p-0 overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b border-[var(--border)] bg-[var(--background)] flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">
            {detectedVars.length} μεταβλητές στο πρότυπο
          </span>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {detectedVars.length === 0 && (
            <div className="p-8 text-center text-sm text-[var(--text-muted)] space-y-3">
              <p className="font-bold text-base">Δεν βρέθηκαν μεταβλητές στο πρότυπο.</p>
              <p className="text-xs">
                Το σύστημα αναγνωρίζει μεταβλητές σε 3 formats:<br/>
                <code className="bg-slate-100 px-1 rounded">{'{{Όνομα}}'}</code> &nbsp;
                <code className="bg-slate-100 px-1 rounded">{'[Όνομα]'}</code> &nbsp;
                <code className="bg-slate-100 px-1 rounded">{'{Όνομα}'}</code>
              </p>
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                Αν το αρχείο σας χρησιμοποιεί κάποιο από αυτά τα formats, διαγράψτε και ξανα-ανεβάστε το template
                — η τρέχουσα έκδοση κώδικα θα εντοπίσει τις μεταβλητές αυτόματα.
                <br/><br/>
                <b>Σημείωση:</b> Η παραγωγή εγγράφων λειτουργεί <b>κανονικά</b> ακόμα και χωρίς αντιστοίχηση —
                οι μεταβλητές αντικαθίστανται αυτόματα κατά τη γέννηση.
              </p>
            </div>
          )}
          {detectedVars.map((v) => {
            const current = map[v] || '__unknown__'
            const isMapped = current !== '__unknown__' && current !== '__ignore__'
            const isIgnored = current === '__ignore__'
            const isUnknown = current === '__unknown__'

            return (
              <div
                key={v}
                className={`flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4 transition-colors ${
                  isUnknown ? 'bg-amber-50/40' : isIgnored ? 'bg-slate-50/60 opacity-70' : 'hover:bg-[var(--background)]'
                }`}
              >
                {/* Placeholder chip */}
                <div className="flex-1 min-w-0">
                  <code className="text-sm font-bold font-mono text-violet-700 bg-violet-50 border border-violet-200 px-2.5 py-1 rounded-lg break-all">
                    {formatVar(v)}
                  </code>
                </div>

                {/* Arrow */}
                <div className="hidden sm:block text-[var(--text-muted)]">→</div>

                {/* Field selector */}
                <div className="flex-1 sm:max-w-xs">
                  <select
                    value={current}
                    onChange={(e) => setMap({ ...map, [v]: e.target.value })}
                    className={`w-full bg-[var(--background)] border rounded-xl px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-violet-400 transition-colors ${
                      isUnknown
                        ? 'border-amber-300 text-amber-700'
                        : isIgnored
                        ? 'border-slate-300 text-slate-500'
                        : 'border-emerald-300 text-emerald-700'
                    }`}
                  >
                    <option value="__unknown__">— Δεν έχει οριστεί —</option>
                    <option value="__ignore__">🚫 Αγνόηση (σταθερό κείμενο)</option>
                    <optgroup label="─────────────────">
                      {standardFields.map((f) => (
                        <option key={f.key} value={f.key}>
                          {f.label}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                {/* Status icon */}
                <div className="w-6 hidden sm:flex items-center justify-center">
                  {isMapped && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                  {isIgnored && <EyeOff className="w-5 h-5 text-slate-400" />}
                  {isUnknown && <AlertTriangle className="w-5 h-5 text-amber-400" />}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Save footer */}
      <div className="flex justify-end gap-3 pb-6">
        <Link href="/admin/documents" className="btn btn-secondary">
          Πίσω
        </Link>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary flex items-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Αποθήκευση αντιστοιχίσεων
        </button>
      </div>
    </div>
  )
}
