'use client'

import { useEffect, useRef, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Loader2, FileText } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  base64: string
  filename: string
  label: string
}

export default function DocPreviewModal({ open, onClose, base64, filename, label }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [rendering, setRendering] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open || !base64 || !containerRef.current) return

    let cancelled = false
    setRendering(true)
    setError('')

    async function render() {
      try {
        const { renderAsync } = await import('docx-preview')
        const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0))
        const blob = new Blob([bytes], {
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        })
        if (cancelled || !containerRef.current) return
        containerRef.current.innerHTML = ''
        await renderAsync(blob, containerRef.current, undefined, {
          className: 'docx-preview-body',
          inWrapper: true,
          ignoreWidth: false,
          ignoreHeight: false,
          ignoreFonts: false,
          breakPages: true,
          useBase64URL: true,
          renderChanges: false,
          renderHeaders: true,
          renderFooters: true,
          renderFootnotes: true,
          renderEndnotes: true,
        })
        if (!cancelled) setRendering(false)
      } catch (e: any) {
        if (!cancelled) {
          setError('Δεν ήταν δυνατή η προεπισκόπηση του εγγράφου.')
          setRendering(false)
        }
      }
    }

    render()
    return () => { cancelled = true }
  }, [open, base64])

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-5 py-3 border-b flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-base">
            <FileText className="w-4 h-4 text-[var(--brand)]" />
            {label}
            <span className="text-xs font-normal text-[var(--text-muted)] ml-1">{filename}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto bg-slate-100 relative min-h-[400px]">
          {rendering && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-100 z-10">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--brand)]" />
              <p className="text-sm text-[var(--text-muted)]">Φόρτωση προεπισκόπησης...</p>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-destructive p-8 text-center">
              {error}
            </div>
          )}
          <div
            ref={containerRef}
            className="docx-wrapper p-4"
            style={{ minHeight: '400px' }}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
