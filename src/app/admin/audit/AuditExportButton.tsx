'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'
import { exportAuditLogsCSV } from '@/actions/export'

export default function AuditExportButton() {
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    setLoading(true)
    try {
      const res = await exportAuditLogsCSV()
      if (res.success && res.csv) {
        const blob = new Blob([res.csv], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = res.filename || 'AuditLogs.csv'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="btn bg-[var(--danger)] text-white hover:bg-opacity-90 text-sm"
    >
      {loading ? (
        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
      ) : (
        <Download className="w-4 h-4" />
      )}
      {loading ? 'Εξαγωγή...' : 'Εξαγωγή CSV'}
    </button>
  )
}
