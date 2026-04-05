'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { addBeneficiary } from '@/actions/philanthropy';
import { useRouter } from 'next/navigation';

export default function BeneficiaryForm({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.target);
    const data = {
      firstName: fd.get('firstName'),
      lastName: fd.get('lastName'),
      afm: fd.get('afm'),
      phone: fd.get('phone'),
      portions: Number(fd.get('portions')),
    };
    
    const res = await addBeneficiary(data);
    if (!res.success) {
      alert(res.error);
    } else {
      router.refresh();
      onClose();
    }
    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>Νέος Ωφελούμενος</DialogTitle>
          <DialogDescription>
            Προσθήκη νέου ωφελούμενου στο πρόγραμμα σίτισης/βοηθημάτων.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Όνομα *</Label>
              <Input name="firstName" required className="bg-slate-50"/>
            </div>
            <div className="space-y-1.5">
              <Label>Επώνυμο *</Label>
              <Input name="lastName" required className="bg-slate-50"/>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>ΑΦΜ (Προαιρετικό)</Label>
            <Input name="afm" placeholder="123456789" className="bg-slate-50"/>
            <p className="text-xs text-slate-500">Χρήσιμο για αποφυγή διπλοεγγραφών σε άλλη ενορία.</p>
          </div>
          <div className="space-y-1.5">
            <Label>Τηλέφωνο</Label>
            <Input name="phone" className="bg-slate-50"/>
          </div>
          <div className="space-y-1.5">
            <Label>Δικαιούχες Μερίδες Συσσιτίου (Ημερησίως)</Label>
            <Input name="portions" type="number" min="0" defaultValue="1" required className="bg-slate-50"/>
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
