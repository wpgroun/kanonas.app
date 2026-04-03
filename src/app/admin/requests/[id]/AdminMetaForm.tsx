'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { addProtocolEntry, markTokenAsDocsGenerated } from '../../../actions'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FileSignature, Printer, AlertTriangle, CheckCircle2 } from 'lucide-react'

export default function AdminMetaForm({ token }: { token: any }) {
  const router = useRouter();

  const [priest, setPriest] = useState(token.assignedPriest || '');
  const [book, setBook] = useState(token.bookNumber || '');
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const hasDocsGenerated = token.status === 'docs_generated' || token.protocolNumber;
  const isMissing = !priest || !book;

  async function handleIssue() {
    setSaving(true);
    
    // Generate Protocol
    const res = await addProtocolEntry({
      direction: 'OUT',
      subject: `Πιστοποιητικό ${token.serviceType === 'GAMOS' ? 'Γάμου' : 'Βάπτισης'} (${token.customerName})`,
      receiver: token.customerName,
      tokenId: token.id
    });

    if (res.success && res.entry) {
       await markTokenAsDocsGenerated(token.id, priest, book);
       alert(`Το πιστοποιητικό εκδόθηκε με επιτυχία! Αριθμός Πρωτοκόλλου: ${res.entry.number}/${res.entry.year}`);
       router.push(`/admin/requests/${token.id}`);
    } else {
       alert("Σφάλμα έκδοσης πρωτοκόλλου");
    }

    setSaving(false);
  }

  async function handleDownloadDocx() {
    setDownloading(true);
    try {
      const response = await fetch('/api/documents/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenId: token.id })
      });

      if (!response.ok) {
        const errData = await response.json();
        alert(`Σφάλμα: ${errData.error}`);
        setDownloading(false);
        return;
      }

      // Download triggered
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Πιστοποιητικό_${token.serviceType}_${token.protocolNumber || token.id.slice(-6)}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      alert("Αποτυχία δημιουργίας αρχείου. Ελέγξτε εάν το public/templates υπάρχει.");
    }
    setDownloading(false);
  }

  return (
    <Card className="mt-6 border-l-4 border-l-primary shadow-sm bg-card">
      <CardHeader className="pb-3 border-b border-border/50">
        <CardTitle className="text-xl flex items-center gap-2 text-primary">
          <FileSignature className="w-5 h-5" /> Επίσημη Έκδοση & Πρωτόκολλο
        </CardTitle>
        <CardDescription>Ολοκληρώστε τη διαδικασία για να λάβει το μυστήριο αριθμό πρωτοκόλλου.</CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-6">
        {!hasDocsGenerated && isMissing && (
          <div className="bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 p-4 rounded-md text-sm flex gap-3 items-start border border-amber-200 dark:border-amber-800">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <p><b>Προσοχή:</b> Συμπληρώστε πρώτα τον Εφημέριο και τον Τόμο Βιβλίου για να εκδοθεί το πιστοποιητικό και να λάβει αυτόματα Αριθμό Πρωτοκόλλου!</p>
          </div>
        )}

        {hasDocsGenerated && (
           <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400 p-4 rounded-md text-sm flex gap-3 items-start border border-emerald-200 dark:border-emerald-800">
             <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
             <p>✅ Το πιστοποιητικό έχει ήδη εκδοθεί και καταγραφεί στο βιβλίο Πρωτοκόλλου. (Συνδεδεμένος Εφημέριος: <strong>{token.assignedPriest}</strong>)</p>
           </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Ιερέας (Εφημέριος)</Label>
            <Input 
               disabled={hasDocsGenerated} 
               value={priest} 
               onChange={e => setPriest(e.target.value)} 
               placeholder="π.χ. π. Ιωάννης" 
               className={hasDocsGenerated ? 'opacity-70 bg-muted' : ''} 
            />
          </div>
          <div className="space-y-2">
            <Label>Τόμος / Αριθμός Βιβλίου</Label>
            <Input 
               disabled={hasDocsGenerated} 
               value={book} 
               onChange={e => setBook(e.target.value)} 
               placeholder="π.χ. Τόμος Β / 52" 
               className={hasDocsGenerated ? 'opacity-70 bg-muted' : ''} 
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end items-center gap-3 pt-4 border-t border-border">
          {!hasDocsGenerated ? (
            <Button onClick={handleIssue} disabled={saving || isMissing} className="w-full sm:w-auto">
              {saving ? 'Έκδοση...' : <><FileSignature className="w-4 h-4 mr-2"/> Έκδοση & Πρωτόκολλο</>}
            </Button>
          ) : (
            <>
              <Button onClick={() => router.push(`/admin/requests/${token.id}/print`)} variant="outline" className="w-full sm:w-auto">
                 Προβολή Web Print
              </Button>
              <Button onClick={handleDownloadDocx} disabled={downloading} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white">
                {downloading ? 'Παραγωγή...' : <><Printer className="w-4 h-4 mr-2"/> Λήψη .docx (Auto-fill)</>}
              </Button>
            </>
          )}
        </div>

      </CardContent>
    </Card>
  )
}
