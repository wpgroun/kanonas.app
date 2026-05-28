'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Map, CheckCircle2, Loader2, Sparkles, HelpCircle, AlertCircle } from 'lucide-react'
import { saveVariableMap } from '@/actions/documents'
import { autoMapVariable, SYNONYM_GROUPS } from '@/lib/greekDeclension'

interface Props {
  template: {
    id: string
    nameEl: string
    docType: string
    context: string | null
    variableMap: any
    needsMapping: boolean
  }
}

// All known canonical data keys with their labels
const DATA_KEY_OPTIONS = SYNONYM_GROUPS.map(([canonical]) => canonical)

const DATA_KEY_LABELS: Record<string, string> = {
  childName: 'Όνομα Παιδιού / Κύριου Προσώπου',
  childLastName: 'Επώνυμο Παιδιού',
  childFullName: 'Ονοματεπώνυμο Παιδιού',
  fatherName: 'Όνομα Πατέρα (Πατρώνυμο)',
  fatherLastName: 'Επώνυμο Πατέρα',
  fatherFullName: 'Ονοματεπώνυμο Πατέρα',
  motherName: 'Όνομα Μητέρας (Μητρώνυμο)',
  motherLastName: 'Επώνυμο Μητέρας',
  motherFullName: 'Ονοματεπώνυμο Μητέρας',
  godparentName: 'Όνομα Αναδόχου / Νονού',
  godparentFullName: 'Ονοματεπώνυμο Αναδόχου',
  groomName: 'Όνομα Γαμπρού',
  groomFullName: 'Ονοματεπώνυμο Γαμπρού',
  brideName: 'Όνομα Νύφης',
  brideFullName: 'Ονοματεπώνυμο Νύφης',
  koumparosName: 'Όνομα Κουμπάρου',
  koumparosFullName: 'Ονοματεπώνυμο Κουμπάρου',
  priestName: 'Ονοματεπώνυμο Εφημερίου',
  templeName: 'Ονομασία Ναού',
  metropolisName: 'Ονομασία Μητρόπολης',
  ceremonyDate: 'Ημερομηνία Τελετής',
  currentDate: 'Σημερινή Ημερομηνία',
  protocolNumber: 'Αριθμός Πρωτοκόλλου',
  bookNumber: 'Αριθμός Βιβλίου',
  birthDate: 'Ημερομηνία Γέννησης',
  birthPlace: 'Τόπος Γέννησης',
  idNumber: 'Αριθμός Ταυτότητας (ΑΔΤ)',
  afm: 'ΑΦΜ',
  address: 'Διεύθυνση Κατοικίας',
  phone: 'Τηλέφωνο',
}

export default function VariablesClient({ template }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Parse variables from context
  const vars = useMemo((): string[] => {
    try {
      if (!template.context) return []
      const parsed = JSON.parse(template.context)
      if (Array.isArray(parsed)) return parsed
      return parsed.vars || []
    } catch { return [] }
  }, [template.context])

  // Initialize mapping from saved variableMap, with auto-suggestions for unmapped vars
  const initialMap = useMemo(() => {
    const saved: Record<string, string> = {}
    try {
      const existing = template.variableMap as Record<string, string> | null
      if (existing && typeof existing === 'object') {
        Object.assign(saved, existing)
      }
    } catch {}
    // Auto-suggest for any var not yet in the saved map
    for (const v of vars) {
      if (!saved[v]) {
        const suggested = autoMapVariable(v)
        if (suggested) saved[v] = suggested
      }
    }
    return saved
  }, [template.variableMap, vars])

  const [mapping, setMapping] = useState<Record<string, string>>(initialMap)

  const handleChange = (varName: string, dataKey: string) => {
    setMapping(prev => ({ ...prev, [varName]: dataKey }))
  }

  const handleSave = async () => {
    setSaving(true)
    // Only include non-empty mappings
    const cleaned: Record<string, string> = {}
    for (const [k, v] of Object.entries(mapping)) {
      if (v) cleaned[k] = v
    }
    await saveVariableMap(template.id, cleaned)
    setSaving(false)
    setSaved(true)
    setTimeout(() => {
      router.push('/admin/documents')
      router.refresh()
    }, 800)
  }

  const mappedCount = Object.values(mapping).filter(Boolean).length
  const totalVars = vars.length

  return (
    <div className="container max-w-3xl mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/documents" className="p-2 rounded-lg hover:bg-[var(--surface)] text-[var(--text-muted)] hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Map className="w-6 h-6 text-yellow-600" />
            Αντιστοίχιση Μεταβλητών
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            <span className="font-semibold text-foreground">{template.nameEl}</span>
          </p>
        </div>
      </div>

      {/* Info box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3 items-start">
        <HelpCircle className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
        <div className="text-sm text-blue-800">
          <p className="font-bold mb-1">Τι κάνω εδώ;</p>
          <p>Αντιστοιχίστε κάθε μεταβλητή του προτύπου σας (π.χ. <code className="bg-blue-100 px-1 rounded">{'{{Πατρώνυμο}}'}</code>) με το πεδίο δεδομένων που πρέπει να γεμίσει αυτόματα κατά την παραγωγή εγγράφου.
          Το σύστημα έχει ήδη κάνει αυτόματες προτάσεις — ελέγξτε τες και διορθώστε αν χρειάζεται.</p>
        </div>
      </div>

      {/* Progress */}
      {totalVars > 0 && (
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-[var(--border)] rounded-full h-2">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all"
              style={{ width: `${(mappedCount / totalVars) * 100}%` }}
            />
          </div>
          <span className="text-sm font-bold text-[var(--text-muted)]">
            {mappedCount}/{totalVars} αντιστοιχισμένες
          </span>
        </div>
      )}

      {/* Variable Mapping Table */}
      {vars.length === 0 ? (
        <div className="card p-8 text-center space-y-3">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-[var(--text-muted)] font-medium">Δεν βρέθηκαν μεταβλητές στο πρότυπο.</p>
          <p className="text-sm text-[var(--text-muted)]">Επεξεργαστείτε το πρότυπο για να προσθέσετε μεταβλητές (π.χ. <code>{'{{Όνομα}}'}</code>).</p>
          <Link href="/admin/documents" className="btn btn-secondary mt-2 inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Επιστροφή
          </Link>
        </div>
      ) : (
        <div className="card divide-y divide-[var(--border)]">
          {vars.map((varName) => {
            const selectedKey = mapping[varName] || ''
            const isAutoMapped = !!autoMapVariable(varName)
            return (
              <div key={varName} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1">
                  <code className="text-sm font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded border border-indigo-100">
                    {`{{${varName}}}`}
                  </code>
                  {isAutoMapped && !template.variableMap?.[varName] && (
                    <span className="ml-2 text-[10px] font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200 uppercase tracking-wide">
                      <Sparkles className="w-2.5 h-2.5 inline mr-0.5" />
                      Αυτόματο
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 sm:w-72">
                  <span className="text-[var(--text-muted)] text-lg">→</span>
                  <select
                    value={selectedKey}
                    onChange={e => handleChange(varName, e.target.value)}
                    className="flex-1 bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-brand"
                  >
                    <option value="">— Αγνοήστε —</option>
                    {DATA_KEY_OPTIONS.map(key => (
                      <option key={key} value={key}>
                        {DATA_KEY_LABELS[key] || key}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Save Footer */}
      {vars.length > 0 && (
        <div className="flex justify-between items-center pt-2 pb-8">
          <Link href="/admin/documents" className="btn btn-secondary flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Ακύρωση
          </Link>
          <button
            onClick={handleSave}
            disabled={saving || saved}
            className="btn btn-primary flex items-center gap-2 shadow-lg shadow-brand/30 min-w-[160px] justify-center"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saved ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <Map className="w-4 h-4" />
            )}
            {saved ? 'Αποθηκεύτηκε!' : 'Αποθήκευση Αντιστοίχισης'}
          </button>
        </div>
      )}
    </div>
  )
}
