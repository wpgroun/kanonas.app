'use client';
import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Zap, Variable } from 'lucide-react';
import { saveDynamicSacrament } from '@/actions/dynamicSacraments';
import { useRouter } from 'next/navigation';

export default function DynamicWizard({ internalDocType, templates, onClose }: any) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});

  // 1. EXTRACT UNIQUE VARIABLES FROM ALL RELEVANT TEMPLATES
  const variables = useMemo(() => {
    const allHtml = templates.map((t: any) => t.htmlContent).join(' ');
    const regex = /\{\{([^}]+)\}\}/g;
    let m;
    const found = new Set<string>();
    while ((m = regex.exec(allHtml)) !== null) {
      if (m.index === regex.lastIndex) regex.lastIndex++;
      const tag = m[1].trim().split(':')[0];
      // Filter out system tags or basic HTML junk if any
      if(tag.length > 1) found.add(tag);
    }
    return Array.from(found);
  }, [templates]);

  // Handle Dynamic Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await saveDynamicSacrament({
      recordType: internalDocType,
      primaryName: formData['CHILD_NAME'] || formData['GROOM_NAME'] || formData['NAME'] || 'Άγνωστο Πρόσωπο',
      jsonData: formData
    });

    if (!res.success) {
      alert('Σφάλμα: ' + res.error);
    } else {
      router.refresh();
      onClose();
    }
    setLoading(false);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-[var(--surface)] flex flex-col p-0 overflow-hidden max-h-[90vh]">
        <DialogHeader className="p-6 shrink-0 border-b border-[var(--border)] bg-[var(--background)]/50">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Zap className="text-brand"/> Dynamic Entry Wizard
          </DialogTitle>
          <DialogDescription>
            Τα παρακάτω πεδία δημιουργήθηκαν αυτόματα εντοπίζοντας τα tags <b>{`{{...}}`}</b> μέσα στα πρότυπα εγγράφων (*Document Engine*) αυτού του τύπου.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            {variables.length === 0 ? (
              <p className="text-[var(--text-muted)] text-sm">Δεν βρέθηκαν δυναμικές μεταβλητές στα πρότυπα.</p>
            ) : (
              variables.map((v) => (
                <div key={v} className="space-y-1.5 bg-[var(--background)] border border-[var(--border)]/60 p-3 rounded-xl animate-in zoom-in duration-300">
                  <Label className="uppercase text-[11px] font-black text-[var(--text-secondary)] tracking-wider flex items-center gap-1">
                    <Variable className="w-3 h-3 text-brand"/> {v.replace(/_/g, ' ')}
                  </Label>
                  <Input 
                    value={formData[v] || ''} 
                    onChange={e => setFormData(p => ({ ...p, [v]: e.target.value }))}
                    placeholder={`π.χ. Τιμή για ${v}`}
                    className="bg-[var(--surface)] border-slate-300 shadow-sm"
                  />
                </div>
              ))
            )}
          </div>
        </form>

        <DialogFooter className="p-6 shrink-0 border-t border-[var(--border)] bg-[var(--background)]/80">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="font-bold">Ακύρωση</Button>
          <Button type="submit" disabled={loading} className="btn-primary min-w-[200px] shadow-lg shadow-brand/20 font-bold">
            {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Αποθήκευση στο Μητρώο'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
