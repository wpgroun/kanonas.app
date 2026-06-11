'use client'

import { useEffect, useState, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Loader2, FileText } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  base64: string
  filename: string
  label: string
}

const DOCX_PREVIEW_CSS = `
  .docx-wrapper {
    background: #525659 !important;
    padding: 24px !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    min-height: 100% !important;
    box-sizing: border-box !important;
  }
  .docx-wrapper > section.docx {
    background: white !important;
    box-shadow: 0 4px 16px rgba(0,0,0,0.4) !important;
    margin-bottom: 24px !important;
    flex-shrink: 0 !important;
  }
`

export default function DocPreviewModal({ open, onClose, base64, filename, label }: Props) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null)
  const [rendering, setRendering] = useState(false)
  const [error, setError] = useState('')

  const containerRef = useCallback((node: HTMLDivElement | null) => {
    setContainer(node)
  }, [])

  useEffect(() => {
    // Inject docx-preview page styles once
    const styleId = 'docx-preview-global-styles'
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style')
      style.id = styleId
      style.textContent = DOCX_PREVIEW_CSS
      document.head.appendChild(style)
    }
  }, [])

  useEffect(() => {
    if (!open || !container || !base64) return

    let cancelled = false
    setRendering(true)
    setError('')
    container.innerHTML = ''

    async function render() {
      try {
        const { renderAsync } = await import('docx-preview')
        const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0))
        const blob = new Blob([bytes], {
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        })
        if (cancelled) return
        await renderAsync(blob, container as HTMLElement, undefined, {
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
          console.error('[DocPreview]', e)
          setError('Δεν ήταν δυνατή η προεπισκόπηση του εγγράφου.')
          setRendering(false)
        }
      }
    }

    render()
    return () => { cancelled = true }
  }, [open, container, base64])

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent
        className="flex flex-col p-0 gap-0"
        style={{
          width: '90vw',
          maxWidth: '1100px',
          height: '92vh',
          maxHeight: '92vh',
        }}
      >
        <DialogHeader className="px-5 py-3 border-b flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-base">
            <FileText className="w-4 h-4 text-[var(--brand)]" />
            {label}
            <span className="text-xs font-normal text-[var(--text-muted)] ml-2">{filename}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto relative" style={{ background: '#525659' }}>
          {rendering && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10" style={{ background: '#525659' }}>
              <Loader2 className="w-8 h-8 animate-spin text-white opacity-80" />
              <p className="text-sm text-white opacity-60">Φόρτωση προεπισκόπησης...</p>
            </div>
          )}
          {error && !rendering && (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-white opacity-70 p-8 text-center">
              {error}
            </div>
          )}
          <div ref={containerRef} style={{ minHeight: '100%' }} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
