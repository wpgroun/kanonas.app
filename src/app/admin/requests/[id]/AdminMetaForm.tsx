'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { addProtocolEntry } from '@/actions/protocol'
import { markTokenAsDocsGenerated, updateCeremonyMetaByAdmin } from '@/actions/sacraments'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FileSignature, Printer, AlertTriangle, CheckCircle2, ScrollText } from 'lucide-react'

export default function AdminMetaForm({ token }: { token: any }) {
  const router = useRouter();

  const [priest, setPriest] = useState(token.assignedPriest || '');
  const [book, setBook] = useState(token.bookNumber || '');
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Parse existing meta for admin-only fields
  const existingMeta: Record<string, string> = (() => {
    try { return JSON.parse(token.ceremonyMeta?.dataJson || '{}'); } catch { return {}; }
  })();

  const [orderNumber, setOrderNumber] = useState(existingMeta.orderNumber || '');
  const [orderDate, setOrderDate] = useState(existingMeta.orderDate || '');
  const [previousReligion, setPreviousReligion] = useState(existingMeta.previousReligion || '');
  const [residenceAddress, setResidenceAddress] = useState(existingMeta.residenceAddress || '');
  const [residenceCity, setResidenceCity] = useState(existingMeta.residenceCity || '');
  const [priestTitle, setPriestTitle] = useState(existingMeta.assignedPriestTitle || '');
  const [savingMeta, setSavingMeta] = useState(false);
  const [metaSaved, setMetaSaved] = useState(false);

  const isVaptisi = token.serviceType?.toLowerCase() === 'vaptisi';

  async function handleSaveMeta() {
    setSavingMeta(true);
    setMetaSaved(false);
    await updateCeremonyMetaByAdmin(token.id, {
      orderNumber, orderDate, previousReligion, residenceAddress, residenceCity,
    });
    setMetaSaved(true);
    setSavingMeta(false);
    setTimeout(() => setMetaSaved(false), 3000);
  }

  const hasDocsGenerated = token.status === 'docs_generated' || token.protocolNumber;
  const isMissing = !priest || !book;

  async function handleIssue() {
    setSaving(true);

    const fd = new FormData();
    fd.append('direction', 'OUT');
    fd.append('subject', `Πιστοποιητικό ${token.serviceType === 'GAMOS' ? 'Γάμου' : 'Βάπτισης'} (${token.customerName})`);
    fd.append('receiver', token.customerName);
    fd.append('tokenId', token.id);

    const res = await addProtocolEntry(fd);

    if (res.success && res.protocolNumber) {
      const protoStr = res.protocolNumber;
      // Save priest title to ceremonyMeta before issuing
      if (priestTitle) {
        await updateCeremonyMetaByAdmin(token.id, { assignedPriestTitle: priestTitle });
      }
      await markTokenAsDocsGenerated(token.id, priest, book, protoStr);
      alert(`Το πιστοποιητικό εκδόθηκε με επιτυχία! Αριθμός Πρωτοκόλλου: ${res.protocolNumber}`);
      router.push(`/admin/requests/${token.id}`);
    } else {
      alert('Σφάλμα έκδοσης πρωτοκόλλου');
    }

    setSaving(false);
  }

  async function handleDownloadDocx() {
    setDownloading(true);
    try {
      // Use generate-all: custom templates + full civil registry data + [bracket] replacement
      const response = await fetch('/api/documents/generate-all', {
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

      const data = await response.json();
      if (!data.success || !data.docs?.length) {
        alert('Δεν βρέθηκαν πρότυπα έγγραφα. Ανεβάστε πρώτα πρότυπα από τις Ρυθμίσεις Ναού.');
        setDownloading(false);
        return;
      }

      // Download every generated file
      let downloaded = 0;
      for (const doc of data.docs) {
        if (!doc.base64 || !doc.filename) continue;
        const ext = (doc.filename.split('.').pop() || '').toLowerCase();
        const mime =
          ext === 'docx'
            ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            : ext === 'pdf'
            ? 'application/pdf'
            : 'application/octet-stream';
        const bytes = Uint8Array.from(atob(doc.base64), c => c.charCodeAt(0));
        const blob = new Blob([bytes], { type: mime });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        downloaded++;
      }

      if (downloaded === 0) {
        alert(`Παράχθηκαν ${data.docs.length} έγγραφα. Τα έγγραφα HTML/PDF είναι αποθηκευμένα στο Vault του Ναού.`);
      }
    } catch (e) {
      alert('Αποτυχία παραγωγής εγγράφων.');
    }
    setDownloading(false);
  }

  return (
    <div className="space-y-4 mt-6">

      {/* ── Στοιχεία Επισκοπικής Εντολής (Βάπτιση) ──────────────────────── */}
      {isVaptisi && (
        <Card className="border-l-4 border-l-violet-500 shadow-sm bg-card">
          <CardHeader className="pb-3 border-b border-border/50">
            <CardTitle className="text-lg flex items-center gap-2 text-violet-700">
              <ScrollText className="w-4 h-4"/> Στοιχεία Επισκοπικής Εντολής
            </CardTitle>
            <CardDescription>Συμπληρώνονται από τον ιερέα — δεν ζητούνται από τον πολίτη.</CardDescription>
          </CardHeader>
          <CardContent className="pt-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Αρ. Επισκοπικής Εντολής</Label>
                <Input value={orderNumber} onChange={e => setOrderNumber(e.target.value)} placeholder="π.χ. 517" />
              </div>
              <div className="space-y-2">
                <Label>Ημ/νία Εντολής</Label>
                <Input value={orderDate} onChange={e => setOrderDate(e.target.value)} placeholder="π.χ. 10.08.2024" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Θρήσκευμα (προ Βαπτίσεως) <span className="text-muted-foreground text-xs">(μόνο για ενήλικες/αβάπτιστους)</span></Label>
              <Input value={previousReligion} onChange={e => setPreviousReligion(e.target.value)} placeholder="π.χ. Αβάπτιστος, Καθολικός..." />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Διεύθυνση Διαμονής <span className="text-muted-foreground text-xs">(για ενήλικες)</span></Label>
                <Input value={residenceAddress} onChange={e => setResidenceAddress(e.target.value)} placeholder="π.χ. Εγνατίας 12" />
              </div>
              <div className="space-y-2">
                <Label>Πόλη Διαμονής <span className="text-muted-foreground text-xs">(για ενήλικες)</span></Label>
                <Input value={residenceCity} onChange={e => setResidenceCity(e.target.value)} placeholder="π.χ. Θεσσαλονίκη" />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button onClick={handleSaveMeta} disabled={savingMeta} variant="outline" size="sm">
                {savingMeta ? 'Αποθήκευση...' : metaSaved ? '✓ Αποθηκεύτηκε' : 'Αποθήκευση'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Επίσημη Έκδοση & Πρωτόκολλο ─────────────────────────────────── */}
      <Card className="border-l-4 border-l-primary shadow-sm bg-card">
        <CardHeader className="pb-3 border-b border-border/50">
          <CardTitle className="text-xl flex items-center gap-2 text-primary">
            <FileSignature className="w-5 h-5"/> Επίσημη Έκδοση & Πρωτόκολλο
          </CardTitle>
          <CardDescription>Ολοκληρώστε τη διαδικασία για να λάβει το μυστήριο αριθμό πρωτοκόλλου.</CardDescription>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {!hasDocsGenerated && isMissing && (
            <div className="bg-[var(--warning-light)] text-[var(--warning)] p-4 rounded-md text-sm flex gap-3 items-start border border-amber-200">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5"/>
              <p><b>Προσοχή:</b> Συμπληρώστε πρώτα τον Εφημέριο και τον Τόμο Βιβλίου για να εκδοθεί το πιστοποιητικό και να λάβει αυτόματα Αριθμό Πρωτοκόλλου!</p>
            </div>
          )}

          {hasDocsGenerated && (
            <div className="bg-[var(--success-light)] text-emerald-800 p-4 rounded-md text-sm flex gap-3 items-start border border-[var(--success)]/20">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5"/>
              <p>✅ Το πιστοποιητικό έχει ήδη εκδοθεί και καταγραφεί στο βιβλίο Πρωτοκόλλου. (Συνδεδεμένος Εφημέριος: <strong>{token.assignedPriest}</strong>)</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Τίτλος Ιερέα</Label>
              <Input
                disabled={hasDocsGenerated}
                value={priestTitle}
                onChange={e => setPriestTitle(e.target.value)}
                placeholder="π.χ. Αρχιμανδρίτης, Πρεσβύτερος"
                className={hasDocsGenerated ? 'opacity-70 bg-muted' : ''}
              />
            </div>
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
                  {downloading ? 'Παραγωγή...' : <><Printer className="w-4 h-4 mr-2"/> Λήψη Εγγράφων</>}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
