'use client';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { saveDocTemplate } from '@/actions/documents';
import { useRouter } from 'next/navigation';
import { Loader2, PlusCircle, Variable, X } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

const DOC_TYPES = [
  { id: 'vaptisi', label: 'Βαπτίσεως (Μυστήριο)' },
  { id: 'gamos', label: 'Γάμου (Μυστήριο)' },
  { id: 'divorce', label: 'Διαζυγίου (Λύση)' },
  { id: 'funeral', label: 'Ληξιαρχείο/Κηδείας' },
  { id: 'other', label: 'Λοιπά Πιστοποιητικά' },
];

export default function DocTemplateForm({ template, onClose }: { template?: any, onClose: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [variables, setVariables] = useState<string[]>([]);
  
  const [form, setForm] = useState({
    nameEl: template?.nameEl || '',
    docType: template?.docType || 'vaptisi',
    htmlContent: template?.htmlContent || '<h1>Πιστοποιητικό Βαπτίσεως</h1>\n<p>Ο/Η κάτωθι <b>{{IEΡΕΑΣ_ΟΝΟΜΑ}}</b>, εφημέριος του ναού...</p>\n<p>Τέκνο του <b>{{ΠΑΤΕΡΑΣ_ΟΝΟΜΑ}}</b> και της <b>{{ΜΗΤΕΡΑ_ΟΝΟΜΑ}}</b></p>',
  });

  const extractVariables = (text: string) => {
    const regex = /\{\{([^}]+)\}\}/g; // Matches {{WHATEVER_HERE}}
    let m;
    const found = new Set<string>();
    while ((m = regex.exec(text)) !== null) {
      if (m.index === regex.lastIndex) {
        regex.lastIndex++;
      }
      found.add(m[1].trim());
    }
    setVariables(Array.from(found));
  };

  useEffect(() => {
    extractVariables(form.htmlContent);
  }, [form.htmlContent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await saveDocTemplate(template?.id || null, form.docType, form.nameEl, form.htmlContent);
    if (!res.success) {
      alert('Αποτυχία αποθήκευσης.');
    } else {
      router.refresh();
      onClose();
    }
    setLoading(false);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-white w-full h-[90vh] flex flex-col gap-0 p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2 shrink-0 border-b border-border bg-slate-50/50">
          <DialogTitle className="text-xl flex items-center gap-2">
            <FileTextIcon /> {template ? 'Επεξεργασία Προτύπου' : 'Νέο Πρότυπο (Document Engine)'}
          </DialogTitle>
          <DialogDescription>
            Ορίστε το HTML template. Τα "διπλά αγκύλια" <b>{`{{METAVLITI}}`}</b> που εισάγετε στον κώδικα θα μεταμορφωθούν αυτόματα σε πεδία φόρμας κατά τη συμπλήρωση του Μυστηρίου!
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Ονομασία Εγγράφου *</Label>
                <Input 
                  value={form.nameEl} 
                  onChange={e => setForm(p => ({ ...p, nameEl: e.target.value }))}
                  required 
                  placeholder="π.χ. Δήλωση Βαπτίσεως" 
                  className="bg-white border-slate-300 font-medium"
                />
              </div>
              <div className="space-y-2">
                <Label>Κατηγορία / Module</Label>
                <select 
                  className="w-full h-10 px-3 py-2 rounded-md border border-slate-300 bg-white text-sm"
                  value={form.docType}
                  onChange={e => setForm(p => ({ ...p, docType: e.target.value }))}
                >
                  {DOC_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full min-h-[400px]">
              
              <div className="md:col-span-2 flex flex-col">
                <Label className="mb-2 flex items-center gap-2">
                  Πηγαίος Κώδικας HTML <span className="text-xs font-normal text-muted-foreground">(Template Body)</span>
                </Label>
                <Textarea 
                  value={form.htmlContent}
                  onChange={e => setForm(p => ({ ...p, htmlContent: e.target.value }))}
                  className="flex-1 font-mono text-[13px] bg-slate-900 text-green-400 p-4 rounded-xl border-0 shadow-inner resize-none focus-visible:ring-offset-0 focus-visible:ring-1 focus-visible:ring-slate-400 leading-relaxed"
                  placeholder="<h1>...</h1>"
                />
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col">
                <h4 className="font-bold text-slate-800 flex items-center gap-2 border-b border-slate-200 pb-3 mb-4">
                  <Variable className="w-4 h-4 text-brand"/> Εντοπισμένα Πεδία
                </h4>
                <div className="flex-1 overflow-y-auto">
                  {variables.length === 0 ? (
                    <p className="text-xs text-slate-500 italic text-center mt-10">
                      Γράψτε π.χ. <code className="bg-slate-200 px-1 rounded text-[10px]">{`{{CHILD_NAME}}`}</code> στον κώδικα HTML για να δημιουργηθεί αυτόματα το πεδίο.
                    </p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {variables.map(v => (
                        <div key={v} className="bg-white border border-slate-200 shadow-sm rounded-lg p-2 flex items-center gap-2 animate-in fade-in zoom-in-95">
                          <code className="text-xs font-bold text-brand w-full overflow-hidden text-ellipsis">{v}</code>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>

          <DialogFooter className="p-6 shrink-0 border-t border-border bg-slate-50/80">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Ακύρωση</Button>
            <Button type="submit" disabled={loading} className="btn-primary min-w-[140px]">
              {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Αποθήκευση Προτύπου'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FileTextIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>;
}
