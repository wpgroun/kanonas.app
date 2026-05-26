'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { FileText, Download, Loader2, CheckCircle2, AlertCircle, FolderOpen, Mail, Sparkles } from 'lucide-react'
import { sendRoutingEmail, shareWithMetropolisSystem } from '@/actions/connect'
import { toast } from 'sonner'

interface GeneratedDoc {
  key: string;
  label: string;
  filename: string;
  base64: string;
}

interface DestinationState {
  couple: boolean;
  temple: boolean;
  metropolis: boolean;
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

export default function GenerateAllDocsButton({
  tokenId,
  serviceType,
  hasProtocol = false,
  customerEmail,
  customerName,
  coupleEmails = []
}: {
  tokenId: string;
  serviceType: string;
  hasProtocol?: boolean;
  customerEmail?: string | null;
  customerName?: string | null;
  coupleEmails?: string[];
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [docs, setDocs] = useState<GeneratedDoc[]>([]);
  const [destinations, setDestinations] = useState<Record<string, DestinationState>>({});
  const [error, setError] = useState('');
  
  const [sendingCouple, setSendingCouple] = useState(false);
  const [sendingMetro, setSendingMetro] = useState(false);

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
        
        // Setup default destinations
        const initialDests: Record<string, DestinationState> = {};
        data.docs.forEach((doc: GeneratedDoc) => {
          initialDests[doc.key] = {
            couple: doc.key === 'bebaiosi' || doc.key === 'baptistiko' || doc.key === 'gamilion',
            temple: true, // all stay in temple by default
            metropolis: doc.key === 'pinakas_synthikon' || doc.key === 'aitisi' || doc.key === 'bebaiosi'
          };
        });
        setDestinations(initialDests);
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

  const toggleDest = (key: string, field: keyof DestinationState) => {
    setDestinations(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: !prev[key][field]
      }
    }));
  };

  const downloadTargetZip = async (target: keyof DestinationState, zipName: string) => {
    const targetDocs = docs.filter(d => destinations[d.key]?.[target]);
    if (targetDocs.length === 0) {
      toast.error('Δεν υπάρχουν επιλεγμένα έγγραφα για αυτόν τον προορισμό.');
      return;
    }

    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      targetDocs.forEach(d => {
        const binaryString = atob(d.base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        zip.file(d.filename, bytes);
      });

      const blob = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${zipName}_${customerName || 'Φάκελος'}_${Date.now()}.zip`;
      link.click();
      toast.success(`Ο φάκελος (${zipName}) λήφθηκε επιτυχώς.`);
    } catch (err) {
      console.error(err);
      toast.error('Σφάλμα κατά τη δημιουργία του ZIP.');
    }
  };

  const handleSendToCouple = async () => {
    const targetDocs = docs.filter(d => destinations[d.key]?.couple);
    if (targetDocs.length === 0) {
      toast.error('Δεν υπάρχουν επιλεγμένα έγγραφα για το ζευγάρι.');
      return;
    }

    const emailList = coupleEmails.length > 0 ? coupleEmails : (customerEmail ? [customerEmail] : []);

    if (emailList.length === 0) {
      toast.warning('Δεν έχει καταχωρηθεί Email επικοινωνίας για το ζευγάρι. Η αποστολή Email παραλείφθηκε.');
      return;
    }

    setSendingCouple(true);
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      targetDocs.forEach(d => {
        const binaryString = atob(d.base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        zip.file(d.filename, bytes);
      });

      const zipBase64 = await zip.generateAsync({ type: 'base64' });

      await sendRoutingEmail({
        to: emailList.join(', '),
        subject: `Έγγραφα Μυστηρίου — ${customerName || 'Οικογένεια'}`,
        body: `
          <h3>Αγαπητή οικογένεια,</h3>
          <p>Σας αποστέλλουμε συνημμένα τα έτοιμα έγγραφα για το μυστήριο σας σε συμπιεσμένο αρχείο ZIP.</p>
          <p>Παρακαλούμε να τα ελέγξετε και να επικοινωνήσετε με τον Ναό αν απαιτείται κάποια διόρθωση.</p>
        `,
        files: [
          {
            filename: `Fakelos_Mystiriou_${customerName || 'Zeygari'}.zip`,
            base64: zipBase64,
            type: 'zip'
          }
        ]
      });
      toast.success(`Τα έγγραφα στάλθηκαν με email στο ${emailList.join(', ')}.`);
      
      // Also download locally for convenience
      await downloadTargetZip('couple', 'Ζευγάρι');
    } catch (err) {
      console.error(err);
      toast.error('Αποτυχία αποστολής email στο ζευγάρι.');
    } finally {
      setSendingCouple(false);
    }
  };

  const handleSendToMetropolis = async () => {
    const targetDocs = docs.filter(d => destinations[d.key]?.metropolis);
    if (targetDocs.length === 0) {
      toast.error('Δεν υπάρχουν επιλεγμένα έγγραφα για τη Μητρόπολη.');
      return;
    }

    setSendingMetro(true);
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      targetDocs.forEach(d => {
        const binaryString = atob(d.base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        zip.file(d.filename, bytes);
      });

      const zipBase64 = await zip.generateAsync({ type: 'base64' });

      const shareRes = await shareWithMetropolisSystem({
        tokenId,
        files: targetDocs.map(d => ({ key: d.key, label: d.label, filename: d.filename, base64: d.base64 }))
      });

      if (shareRes.success) {
        toast.success(`Τα έγγραφα συγχρονίστηκαν επιτυχώς στο ψηφιακό αρχείο της Μητρόπολης (${shareRes.metropolisName})!`);
        
        await downloadTargetZip('metropolis', 'Μητρόπολη');

        if (shareRes.email) {
          await sendRoutingEmail({
            to: shareRes.email,
            subject: `Υποβολή Εγγράφων Μυστηρίου — Ενορία: ${customerName || '—'}`,
            body: `
              <h3>Ιερά Μητρόπολη,</h3>
              <p>Σας υποβάλλουμε συνημμένα σε αρχείο ZIP τα έγγραφα του μυστηρίου που τελέστηκε/θα τελεστεί στον Ναό μας.</p>
              <p>Όνομα οικογένειας: <strong>${customerName || '—'}</strong></p>
            `,
            files: [
              {
                filename: `Fakelos_Mitropolis_${customerName || 'Mysterio'}.zip`,
                base64: zipBase64,
                type: 'zip'
              }
            ]
          });
          toast.success(`Τα έγγραφα στάλθηκαν με email στη Μητρόπολη (${shareRes.email}).`);
        }
      } else {
        toast.warning(shareRes.error || 'Σφάλμα κατά τη σύνδεση με τη Μητρόπολη. Λήψη ZIP μόνο.');
        await downloadTargetZip('metropolis', 'Μητρόπολη');
      }
    } catch (err) {
      console.error(err);
      toast.error('Σφάλμα κατά την αποστολή στη Μητρόπολη.');
    } finally {
      setSendingMetro(false);
    }
  };

  return (
    <>
      <Button
        onClick={handleOpen}
        disabled={!hasProtocol}
        className="bg-[var(--brand)] hover:bg-[var(--brand-dark)] text-white gap-2 disabled:opacity-50"
        title={!hasProtocol ? 'Εκδώστε πρώτα Πρωτόκολλο για να ξεκλειδώσει το κουμπί.' : ''}
        size="lg"
      >
        <FolderOpen className="w-4 h-4"/>
        {hasProtocol ? `Παραγωγή Όλων των Εγγράφων ${label}` : 'Απαιτείται Πρωτόκολλο'}
      </Button>

      <Dialog open={open} onOpenChange={(v) => { if (!loading) setOpen(v); }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <FileText className="w-5 h-5 text-[var(--brand)]"/>
              Διανομή & Παραγωγή Εγγράφων {label}
            </DialogTitle>
            <DialogDescription>
              {loading ? 'Δημιουργία εγγράφων σε εξέλιξη...' : docs.length > 0 ? 'Επιλέξτε πού θα δρομολογηθεί κάθε έγγραφο.' : 'Κάντε κλικ για παραγωγή.'}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4 my-4 pr-1">
            {loading && (
              <div className="flex flex-col items-center py-12 gap-3">
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
              <div className="space-y-3">
                <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider grid grid-cols-12 px-3">
                  <span className="col-span-5">Έγγραφο</span>
                  <span className="col-span-7 text-center">Δρομολόγηση / Προορισμός</span>
                </div>

                <div className="space-y-2">
                  {docs.map((doc) => {
                    const dest = destinations[doc.key] || { couple: false, temple: true, metropolis: false };
                    return (
                      <div
                        key={doc.key}
                        className="grid grid-cols-12 items-center p-2.5 bg-muted/40 rounded-xl border border-border/50 hover:bg-muted/60 transition-colors gap-2"
                      >
                        <div className="col-span-5 flex items-center gap-2 min-w-0">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0"/>
                          <span className="text-xs font-bold text-foreground truncate" title={doc.label}>{doc.label}</span>
                        </div>
                        <div className="col-span-7 flex justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => toggleDest(doc.key, 'couple')}
                            className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${dest.couple ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-slate-100 text-slate-400 border border-transparent'}`}
                          >
                            👫 Ζευγάρι
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleDest(doc.key, 'temple')}
                            className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${dest.temple ? 'bg-blue-100 text-blue-800 border border-blue-300' : 'bg-slate-100 text-slate-400 border border-transparent'}`}
                          >
                            ⛪ Ναός
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleDest(doc.key, 'metropolis')}
                            className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${dest.metropolis ? 'bg-purple-100 text-purple-800 border border-purple-300' : 'bg-slate-100 text-slate-400 border border-transparent'}`}
                          >
                            🏛️ Μητρόπολη
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {docs.length > 0 && (
            <DialogFooter className="flex flex-col sm:flex-row gap-2 border-t pt-4">
              <Button
                variant="outline"
                onClick={() => downloadTargetZip('temple', 'Ναός')}
                className="gap-1.5 text-xs font-bold"
              >
                <Download className="w-3.5 h-3.5" />
                Φάκελος Ναού (ZIP)
              </Button>
              
              <Button
                variant="outline"
                disabled={sendingCouple}
                onClick={handleSendToCouple}
                className="gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-800 border-amber-200"
              >
                {sendingCouple ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
                Στο Ζευγάρι (Email & ZIP)
              </Button>

              <Button
                disabled={sendingMetro}
                onClick={handleSendToMetropolis}
                className="bg-purple-600 hover:bg-purple-700 text-white gap-1.5 text-xs font-bold"
              >
                {sendingMetro ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                Στη Μητρόπολη
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
