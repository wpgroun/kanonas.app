'use client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { useRef } from 'react';

import { declineGreekName } from '@/lib/greekDeclension';

export default function PrintPreviewModal({ record, templates, onClose }: any) {
  const printRef = useRef<HTMLIFrameElement>(null);

  // We find whatever template matches internalDocType. If multiple, we just use the first for now.
  const tpl = templates[0];
  const meta = record.ceremonyMeta?.dataJson ? JSON.parse(record.ceremonyMeta.dataJson) : {};

  // Merge the template HTML with the dynamic variables
  let finalHtml = tpl?.htmlContent || 'Δεν υπάρχει πρότυπο';
  if (tpl) {
    finalHtml = finalHtml.replace(/\{\{([^}]+)\}\}/g, (match: string, tagContents: string) => {
      const parts = tagContents.trim().split(':');
      const baseKey = parts[0];
      const modifier = parts[1];
      let val = meta[baseKey] || '';
      
      if (val) {
        if (modifier === 'GEN') val = declineGreekName(val, 'genitive');
        else if (modifier === 'ACC') val = declineGreekName(val, 'accusative');
      }
      return `<strong>${val}</strong>`;
    });
  }

  const handlePrint = () => {
    if (!printRef.current) return;
    const doc = printRef.current.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(`
        <html>
          <head>
            <title>Εκτύπωση</title>
            <style>
              body { font-family: sans-serif; padding: 40px; margin: 0; }
              @media print { body { padding: 0; } }
            </style>
          </head>
          <body>${finalHtml}</body>
        </html>
      `);
      doc.close();
      printRef.current.contentWindow?.focus();
      printRef.current.contentWindow?.print();
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-[var(--surface)] flex flex-col p-0 overflow-hidden h-[80vh]">
        <DialogHeader className="p-4 shrink-0 border-b border-[var(--border)] flex flex-row items-center justify-between">
          <DialogTitle className="text-xl flex gap-2"><Printer className="text-brand"/> Προεπισκόπηση & Εκτύπωση</DialogTitle>
          <Button onClick={handlePrint} className="btn-primary shadow-lg"><Printer className="w-4 h-4 mr-2"/> Εκτύπωση</Button>
        </DialogHeader>
        
        <div className="flex-1 bg-slate-200 p-8 overflow-y-auto flex items-center justify-center">
           <div className="bg-[var(--surface)] w-[210mm] min-h-[297mm] shadow-2xl p-12 relative">
             <div dangerouslySetInnerHTML={{ __html: finalHtml }} />
             <iframe ref={printRef} className="hidden" />
           </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
