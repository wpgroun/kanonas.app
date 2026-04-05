'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { FileText, Download, Loader2, CheckCircle2, AlertCircle, FolderOpen } from 'lucide-react'

interface GeneratedDoc {
 key: string;
 label: string;
 filename: string;
 base64: string;
}

function downloadBase64Pdf(base64: string, filename: string) {
 const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
 const blob = new Blob([bytes], { type: 'application/pdf' });
 const url = URL.createObjectURL(blob);
 const a = document.createElement('a');
 a.href = url;
 a.download = filename;
 document.body.appendChild(a);
 a.click();
 document.body.removeChild(a);
 URL.revokeObjectURL(url);
}

function downloadAll(docs: GeneratedDoc[]) {
 docs.forEach((doc, i) => {
 setTimeout(() => downloadBase64Pdf(doc.base64, doc.filename), i * 350);
 });
}

export default function GenerateAllDocsButton({ tokenId, serviceType, hasProtocol=false }: { tokenId: string, serviceType: string, hasProtocol?: boolean }) {
 const [open, setOpen] = useState(false);
 const [loading, setLoading] = useState(false);
 const [docs, setDocs] = useState<GeneratedDoc[]>([]);
 const [error, setError] = useState('');

 const isGamos = serviceType === 'GAMOS';
 const label = isGamos ? 'Γάμου' : 'Βάπτισης';

 async function handleGenerate() {
 if (!hasProtocol) return;
 setLoading(true);
 setError('');
 setDocs([]);
 try {
 const res = await fetch('/api/documents/generate-all', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ tokenId }),
 });
 const data = await res.json();
 if (data.success) {
 setDocs(data.docs);
 } else {
 setError(data.error || 'Σφάλμα παραγωγής εγγράφων');
 }
 } catch (e: any) {
 setError(e.message || 'Σφάλμα δικτύου');
 }
 setLoading(false);
 }

 function handleOpen() {
 setOpen(true);
 handleGenerate();
 }

 return (
 <>
 <Button
 onClick={handleOpen}
 disabled={!hasProtocol}
 className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 disabled:opacity-50"
 title={!hasProtocol ? 'Εκδώστε πρώτα Πρωτόκολλο για να ξεκλειδώσει το κουμπί.' : ''}
 size="lg"
 >
 <FolderOpen className="w-4 h-4"/>
 {hasProtocol ? `Παραγωγή Όλων των Εγγράφων ${label}` : 'Απαιτείται Πρωτόκολλο'}
 </Button>

 <Dialog open={open} onOpenChange={(v) => { if (!loading) setOpen(v); }}>
 <DialogContent className="sm:max-w-lg">
 <DialogHeader>
 <DialogTitle className="flex items-center gap-2 text-xl">
 <FileText className="w-5 h-5 text-indigo-600"/>
 Έγγραφα {label}
 </DialogTitle>
 <DialogDescription>
 {loading ? 'Δημιουργία εγγράφων σε εξέλιξη...' : docs.length > 0 ? `${docs.length} έγγραφα έτοιμα για λήψη.` : 'Κάντε κλικ για παραγωγή.'}
 </DialogDescription>
 </DialogHeader>

 <div className="space-y-3 mt-2">
 {loading && (
 <div className="flex flex-col items-center py-8 gap-3">
 <Loader2 className="w-10 h-10 animate-spin text-indigo-500"/>
 <p className="text-sm text-muted-foreground">Δημιουργία εγγράφων με αυτόματη κλίση ονομάτων...</p>
 </div>
)}

 {error && (
 <div className="flex items-center gap-2 bg-destructive/10 text-destructive p-3 rounded-md text-sm">
 <AlertCircle className="w-4 h-4 shrink-0"/>
 {error}
 </div>
)}

 {docs.length > 0 && (
 <>
 <div className="space-y-2">
 {docs.map((doc) => (
 <div
 key={doc.key}
 className="flex items-center justify-between p-3 bg-muted/40 rounded-lg border border-border/50 hover:bg-muted/60 transition-colors"
 >
 <div className="flex items-center gap-2">
 <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0"/>
 <span className="text-sm font-medium text-foreground">{doc.label}</span>
 </div>
 <Button
 size="sm"
 variant="outline"
 onClick={() => downloadBase64Pdf(doc.base64, doc.filename)}
 className="gap-1 text-xs"
 >
 <Download className="w-3 h-3"/>
 Λήψη
 </Button>
 </div>
))}
 </div>

 <div className="pt-2 border-t border-border">
 <Button
 className="w-full bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
 onClick={() => downloadAll(docs)}
 >
 <Download className="w-4 h-4"/>
 Λήψη Όλων ({docs.length} αρχεία)
 </Button>
 </div>
 </>
)}
 </div>
 </DialogContent>
 </Dialog>
 </>
);
}
