'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarDays, Clock, CheckCircle2, ChevronRight, ChevronLeft, Loader2, ExternalLink } from 'lucide-react';
import { submitPublicBooking } from '@/actions/connectBooking';
import { toast } from 'sonner';

type Slot = { id: string; serviceType: string; startTime: string; endTime: string | null };

const MONTHS_EL = [
  'Ιανουάριος', 'Φεβρουάριος', 'Μάρτιος', 'Απρίλιος', 'Μάιος', 'Ιούνιος',
  'Ιούλιος', 'Αύγουστος', 'Σεπτέμβριος', 'Οκτώβριος', 'Νοέμβριος', 'Δεκέμβριος',
];
const DAYS_EL = ['Δευ', 'Τρι', 'Τετ', 'Πεμ', 'Παρ', 'Σαβ', 'Κυρ'];

function getCalendarGrid(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  let startDow = firstDay.getDay() - 1;
  if (startDow < 0) startDow = 6;

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) cells.push(new Date(year, month - 1, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

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

  // Calendar State
  const today = useMemo(() => new Date(), []);
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const goPrev = () => {
    if (currentMonth === 1) {
      setCurrentYear(currentYear - 1);
      setCurrentMonth(12);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goNext = () => {
    if (currentMonth === 12) {
      setCurrentYear(currentYear + 1);
      setCurrentMonth(1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth() + 1);
    setSelectedDay(today);
    setSelectedSlot(null);
  };

  const availableSlotsByDate = useMemo(() => {
    const map = new Map<string, Slot[]>();
    availableSlots.forEach(s => {
      const key = new Date(s.startTime).toDateString();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    });
    return map;
  }, [availableSlots]);

  const grid = useMemo(() => getCalendarGrid(currentYear, currentMonth), [currentYear, currentMonth]);

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
            {availableSlots.length === 0 ? (
              <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <CalendarDays className="w-8 h-8 mx-auto mb-3 opacity-50"/> Δεν υπάρχουν διαθέσιμες ημερομηνίες για κράτηση αυτή τη στιγμή.
              </div>
            ) : (
              <div className="space-y-6">
                {/* Calendar Navigation */}
                <div className="flex items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={goPrev} className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-100 bg-white transition-colors text-slate-600">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <div className="min-w-[150px] text-center">
                      <h3 className="text-base font-bold text-slate-800 capitalize">{MONTHS_EL[currentMonth - 1]} {currentYear}</h3>
                    </div>
                    <button type="button" onClick={goNext} className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-100 bg-white transition-colors text-slate-600">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <button type="button" onClick={goToday} className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 hover:bg-slate-100 bg-white transition-colors text-slate-600">
                    Σήμερα
                  </button>
                </div>

                {/* Calendar Month Grid */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
                    {DAYS_EL.map(d => (
                      <div key={d} className="py-2 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">{d}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7">
                    {grid.map((day, idx) => {
                      if (!day) return <div key={`empty-${idx}`} className="border-b border-r border-slate-100 min-h-[64px] bg-slate-50/20" />;

                      const isTodayDate = isSameDay(day, today);
                      const isSelected = selectedDay && isSameDay(day, selectedDay);
                      const dayEvs = availableSlotsByDate.get(day.toDateString()) ?? [];
                      const hasSlots = dayEvs.length > 0;
                      const isSunday = day.getDay() === 0;

                      return (
                        <button
                          key={day.toISOString()}
                          type="button"
                          disabled={!hasSlots}
                          className={`border-b border-r border-slate-100 min-h-[64px] p-2 flex flex-col items-center justify-between transition-all relative
                            ${hasSlots ? 'hover:bg-indigo-50/40 cursor-pointer' : 'opacity-40 cursor-not-allowed bg-slate-50/5'}
                            ${isSelected ? 'bg-indigo-50/60 ring-2 ring-inset ring-indigo-600 z-10' : ''}
                            ${isSunday && hasSlots ? 'bg-red-50/10' : ''}
                          `}
                          onClick={() => {
                            setSelectedDay(day);
                            setSelectedSlot(null);
                          }}
                        >
                          <span className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold
                            ${isTodayDate ? 'bg-indigo-600 text-white shadow-sm' : isSunday ? 'text-red-500 font-extrabold' : 'text-slate-800'}
                          `}>
                            {day.getDate()}
                          </span>
                          {hasSlots && (
                            <span className="text-[10px] font-black text-indigo-600 bg-indigo-100/60 px-1.5 py-0.5 rounded-full mt-1">
                              {dayEvs.length} {dayEvs.length === 1 ? 'ώρα' : 'ώρες'}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Day Time slots List */}
                {selectedDay && (
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <h3 className="font-bold flex items-center text-slate-800 mb-4 text-sm">
                      <Clock className="w-4 h-4 mr-2 text-indigo-500"/>
                      Διαθέσιμες Ώρες για {selectedDay.toLocaleDateString('el-GR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {(availableSlotsByDate.get(selectedDay.toDateString()) ?? []).map(s => {
                        const timeStr = new Date(s.startTime).toLocaleTimeString('el-GR', { hour: '2-digit', minute:'2-digit' });
                        const isSelected = selectedSlot?.id === s.id;
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => setSelectedSlot(s)}
                            className={`flex items-center px-4 py-2.5 rounded-xl font-bold transition-all text-sm shadow-sm border
                              ${isSelected 
                                ? 'bg-indigo-600 text-white ring-2 ring-indigo-600 ring-offset-2 border-indigo-600' 
                                : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-200'
                              }
                            `}
                          >
                            <Clock className={`w-3.5 h-3.5 mr-1.5 ${isSelected ? 'opacity-100' : 'opacity-60'}`}/> {timeStr}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
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
                  <SelectItem value="GAMOS">Ιερό Μυστήριο Γάμου</SelectItem>
                  <SelectItem value="VAPTISI">Ιερό Μυστήριο Βαπτίσεως</SelectItem>
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
