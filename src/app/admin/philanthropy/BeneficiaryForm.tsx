'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { addBeneficiary } from '@/actions/philanthropy';
import { useRouter } from 'next/navigation';
import { UploadCloud, AlertTriangle } from 'lucide-react';

export default function BeneficiaryForm({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const fd = new FormData(e.target);
    
    const afm = (fd.get('afm') as string || '').trim();
    if (!afm || afm.length !== 9 || !/^\d{9}$/.test(afm)) {
      setError('Tο ΑΦΜ πρέπει να αποτελείται από ακριβώς 9 ψηφία.');
      setLoading(false);
      return;
    }

    const data = {
      firstName: fd.get('firstName'),
      lastName: fd.get('lastName'),
      afm: afm,
      phoneNumber: fd.get('phone'),
      address: fd.get('address'),
      familyMembers: Number(fd.get('portions')) || 1,
      needsScore: Number(fd.get('needsScore')) || 50,
    };
    
    const res = await addBeneficiary(data);
    if (!res.success) {
      setError(res.error || 'Σφάλμα');
    } else {
      router.refresh();
      onClose();
    }
    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-[var(--surface)]">
        <DialogHeader>
          <DialogTitle>Νέος Ωφελούμενος</DialogTitle>
          <DialogDescription>
            Προσθήκη νέου ωφελούμενου στο πρόγραμμα σίτισης/βοηθημάτων.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex gap-2 items-start border border-red-200">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5"/>
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Όνομα *</Label>
              <Input name="firstName" required className="bg-[var(--background)]"/>
            </div>
            <div className="space-y-1.5">
              <Label>Επώνυμο *</Label>
              <Input name="lastName" required className="bg-[var(--background)]"/>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>ΑΦΜ * <span className="text-xs text-red-500">(Υποχρεωτικό)</span></Label>
            <Input name="afm" required placeholder="123456789" maxLength={9} pattern="\d{9}" className="bg-[var(--background)] font-mono"/>
            <p className="text-xs text-[var(--text-muted)]">Υποχρεωτικό 9 ψηφίων. Ελέγχεται cross-ενοριακά για αποφυγή διπλοσίτισης.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Τηλέφωνο</Label>
              <Input name="phone" className="bg-[var(--background)]"/>
            </div>
            <div className="space-y-1.5">
              <Label>Μέλη Οικογένειας (Μερίδες)</Label>
              <Input name="portions" type="number" min="1" defaultValue="1" required className="bg-[var(--background)]"/>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Διεύθυνση</Label>
            <Input name="address" placeholder="Οδός, Αριθμός, ΤΚ" className="bg-[var(--background)]"/>
          </div>

          <div className="space-y-1.5">
            <Label>Βαθμός Ανάγκης (0-100)</Label>
            <Input name="needsScore" type="number" min="0" max="100" defaultValue="50" className="bg-[var(--background)]"/>
            <p className="text-xs text-[var(--text-muted)]">100 = Υψηλότερη ανάγκη (μεγαλύτερη προτεραιότητα).</p>
          </div>

          {/* Document Upload Area */}
          <div className="space-y-1.5">
            <Label>Δικαιολογητικά (Ανέβασμα Εγγράφων)</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-4 bg-[var(--background)] text-center">
              <UploadCloud className="w-8 h-8 mx-auto text-[var(--text-muted)] mb-2"/>
              <p className="text-sm text-[var(--text-muted)]">Σύρετε αρχεία εδώ ή κάντε κλικ</p>
              <Input name="documents" type="file" accept=".pdf,image/*,.doc,.docx" multiple 
                className="mt-2 text-xs cursor-pointer"/>
              <p className="text-[10px] text-[var(--text-muted)] mt-1">
                PDF, εικόνες, Word — Αποθηκεύονται στο Vault του Ναού
              </p>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Ακύρωση</Button>
            <Button type="submit" disabled={loading} className="bg-slate-900 text-white hover:bg-slate-800">
              {loading ? 'Αποθήκευση...' : 'Αποθήκευση'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
