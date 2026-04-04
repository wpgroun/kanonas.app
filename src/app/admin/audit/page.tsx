'use client'

import { useState } from 'react'
import { Download, ShieldCheck, Activity } from 'lucide-react'
import { exportAuditLogsCSV } from '@/actions/export'

export default function AuditLogsPage() {
  const [downloading, setDownloading] = useState(false)

  const handleExport = async () => {
    setDownloading(true)
    try {
      const res = await exportAuditLogsCSV()
      if (res.success && res.csv) {
        // Create Blob and trigger download
        const blob = new Blob([res.csv], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = res.filename || 'AuditLogs.csv'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      } else {
        alert(res.error || 'Σφάλμα κατά την εξαγωγή Ιστορικού.')
      }
    } catch (e: any) {
      alert('Network / Export error: ' + e?.message)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-[var(--foreground)] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[var(--danger)]" />
            Ιστορικό Ενεργειών
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            Καταγραφή αλλαγών και συμβάντων συστήματος
          </p>
        </div>
        
        <button 
          onClick={handleExport} 
          disabled={downloading}
          className="btn bg-[var(--danger)] text-white hover:bg-opacity-90"
        >
          {downloading ? (
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          {downloading ? 'Εξαγωγή...' : 'Εξαγωγή CSV'}
        </button>
      </div>

      {/* Info Card */}
      <div className="card p-8 text-center flex flex-col items-center justify-center space-y-3">
        <div className="w-16 h-16 bg-[var(--danger-light)] text-[var(--danger)] rounded-full flex items-center justify-center">
          <Activity className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-[var(--foreground)]">Συμμόρφωση Ασφαλείας</h2>
        <p className="text-[var(--text-muted)] max-w-lg mx-auto">
          Όλες οι σημαντικές ενέργειες (δημιουργία, διαγραφή, ενημέρωση) που πραγματοποιούνται από διαχειριστές και χρήστες του Ναού σας καταγράφονται κρυπτογραφημένα στο ιστορικό. Αποτελεί απαίτηση πρωτοκόλλων ασφαλείας.
        </p>
        <p className="text-xs text-[var(--text-secondary)]">Εξάγετε το αρχείο CSV για πλήρη ανασκόπηση του αρχείου ελεγκτών (Auditing).</p>
      </div>
    </div>
  )
}
