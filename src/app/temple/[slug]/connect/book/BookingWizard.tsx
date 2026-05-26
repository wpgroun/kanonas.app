'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarDays, Clock, CheckCircle2, ChevronRight, ChevronLeft, Loader2, ExternalLink } from 'lucide-react';
import { submitPublicBooking } from '@/actions/connectBooking';
import { toast } from 'sonner';

type Slot = { id: string; serviceType: string; startTime: string; endTime: string | null };

export default function BookingWizard({ templeId, availableSlots }: { templeId: string, availableSlots: Slot[] }) {
  const [step, setStep] = useState(1);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  // Form State
  const [serviceType, setServiceType] = useState<string>('GAMOS');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Result State
  const [generatedTokenStr, setGeneratedTokenStr] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  // Group by Date string
  const groupedDates: Record<string, Slot[]> = {};
  availableSlots.forEach(s => {
    const dStr = new Date(s.startTime).toLocaleDateString('el-GR');
    if (!groupedDates[dStr]) groupedDates[dStr] = [];
    groupedDates[dStr].push(s);
  });

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;
    if (!name || !phone || !email) {
      toast.error('Παρακαλούμε συμπληρώστε όλα τα πεδία');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitPublicBooking({
        templeId,
        slotId: selectedSlot.id,
        serviceType,
        name,
        phone,
        email
      });

      if (res.success && res.tokenStr) {
        setGeneratedTokenStr(res.tokenStr);
        setStep(3);
      } else {
        toast.error('Αποτυχία καταχώρησης κράτησης');
      }
    } catch (err) {
      console.error(err);
      toast.error('Σφάλμα συστήματος κατά την κράτηση');
    } finally {
      setIsSubmitting(false);
    }
  };

  const publicUrl = typeof window !== 'undefined' ? `${window.location.origin}/request/${generatedTokenStr}` : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (step === 3) {
    return (
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 min-h-[500px] flex items-center justify-center p-8">
        <div className="max-w-md mx-auto space-y-6 text-center">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600"/>
          </div>
          <h2 className="text-3xl font-black text-slate-800">Το ραντεβού προκρατήθηκε!</h2>
          <p className="text-slate-500">
            Η ημερομηνία έχει κλειδωθεί προσωρινά. Για να ολοκληρωθεί η κράτηση, πρέπει να συμπληρώσετε το ερωτηματολόγιο και να επισυνάψετε τα δικαιολογητικά σας.
          </p>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-left space-y-2 mt-4">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Μοναδικό Link Αίτησης</span>
            <p className="font-mono text-sm break-all text-slate-700 bg-white p-2.5 rounded border border-slate-200">{publicUrl}</p>
            <div className="flex gap-2 pt-2">
              <Button onClick={handleCopy} variant="outline" size="sm" className="flex-1">
                {copied ? 'Αντιγράφηκε!' : 'Αντιγραφή Link'}
              </Button>
              <Button onClick={() => window.open(publicUrl, '_blank')} className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1">
                Μετάβαση στη Φόρμα <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 min-h-[500px] flex flex-col">
      <div className="flex border-b border-gray-100 text-sm font-medium text-gray-500">
        <div className={`p-4 flex-1 text-center border-b-2 ${step >= 1 ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50' : 'border-transparent'}`}>1. Επιλογή Ημερομηνίας</div>
        <div className={`p-4 flex-1 text-center border-b-2 ${step >= 2 ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50' : 'border-transparent'}`}>2. Στοιχεία Επικοινωνίας</div>
      </div>

      <div className="p-8 flex-1">
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h2 className="text-xl font-bold text-gray-800">Διαθέσιμες Ημερομηνίες & Ώρες</h2>
            {Object.keys(groupedDates).length === 0 ? (
              <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <CalendarDays className="w-8 h-8 mx-auto mb-3 opacity-50"/> Δεν υπάρχουν διαθέσιμες ημερομηνίες για κράτηση αυτή τη στιγμή.
              </div>
            ) : (
              <div className="grid gap-6">
                {Object.entries(groupedDates).map(([dateLabel, slots]) => (
                  <div key={dateLabel} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <h3 className="font-bold flex items-center text-slate-800 mb-3 block">
                      <CalendarDays className="w-4 h-4 mr-2 text-indigo-500"/>
                      {dateLabel}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {slots.map(s => {
                        const timeStr = new Date(s.startTime).toLocaleTimeString('el-GR', { hour: '2-digit', minute:'2-digit' });
                        const isSelected = selectedSlot?.id === s.id;
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => setSelectedSlot(s)}
                            className={`flex items-center px-4 py-2 rounded-lg font-bold transition-all text-sm ${isSelected ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-600 ring-offset-2' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}`}
                          >
                            <Clock className={`w-3.5 h-3.5 mr-1.5 ${isSelected ? 'opacity-100' : 'opacity-60'}`}/> {timeStr}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleBookingSubmit} className="space-y-5 max-w-md mx-auto animate-in fade-in duration-300">
            <h2 className="text-xl font-bold text-gray-800">Συμπλήρωση Στοιχείων Κράτησης</h2>

            <div className="space-y-2 bg-slate-50 p-4 rounded-xl border mb-4">
              <span className="text-xs text-indigo-700 font-bold uppercase tracking-wider block">Επιλεγμένο Ραντεβού</span>
              <p className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4 text-slate-500" />
                {selectedSlot ? new Date(selectedSlot.startTime).toLocaleString('el-GR') : ''}
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="serviceType">Λόγος Κράτησης (Μυστήριο)</Label>
              <Select value={serviceType} onValueChange={setServiceType}>
                <SelectTrigger id="serviceType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GAMOS">💍 Ιερό Μυστήριο Γάμου</SelectItem>
                  <SelectItem value="VAPTISI">🕊️ Ιερό Μυστήριο Βαπτίσεως</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="name">Ονοματεπώνυμο Αιτούντος</Label>
              <Input
                id="name"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="π.χ. Ιωάννης Παπαδόπουλος"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="phone">Τηλέφωνο Επικοινωνίας</Label>
                <Input
                  id="phone"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="69XXXXXXXX"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="hidden">
              <button type="submit" id="hidden-submit-btn" />
            </div>
          </form>
        )}
      </div>

      <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center mt-auto">
        <Button variant="outline" type="button" onClick={() => setStep(step - 1)} disabled={step === 1 || isSubmitting}>
          <ChevronLeft className="w-4 h-4 mr-2"/> Επιστροφή
        </Button>
        
        {step === 2 ? (
          <Button 
            className="bg-green-600 hover:bg-green-700 text-white px-8" 
            onClick={() => document.getElementById('hidden-submit-btn')?.click()} 
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin"/> : <><CheckCircle2 className="w-4 h-4 mr-2"/> Ολοκλήρωση Κράτησης</>}
          </Button>
        ) : (
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700 text-white" 
            onClick={() => setStep(step + 1)} 
            disabled={!selectedSlot}
            type="button"
          >
            Συνέχεια <ChevronRight className="w-4 h-4 ml-2"/>
          </Button>
        )}
      </div>
    </div>
  );
}
