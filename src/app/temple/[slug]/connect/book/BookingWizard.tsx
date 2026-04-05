'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalendarDays, Clock, CheckCircle2, ChevronRight, ChevronLeft, Loader2, Info } from 'lucide-react';
import { getSmartTemplatesForBooking, submitBookingRequest } from '@/actions/connectBooking';
import { toast } from 'sonner';

type Slot = { id: string; serviceType: string; startTime: string; endTime: string | null };
type SmartTemplate = {
  id: string;
  nameEl: string;
  conditionRuleRaw: string | null;
  conditionVariable: string | null;
  conditionTargetValue: string | null;
  variables: string[];
};

export default function BookingWizard({ templeId, availableSlots }: { templeId: string, availableSlots: Slot[] }) {
  const [step, setStep] = useState(1);
  const [service, setService] = useState<'GAMOS' | 'BAPTISM' | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  // Smart Engine State
  const [templates, setTemplates] = useState<SmartTemplate[]>([]);
  const [loadingSmart, setLoadingSmart] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  // Group by Date string
  const groupedDates: Record<string, Slot[]> = {};
  availableSlots.forEach(s => {
    if (service && s.serviceType !== service && s.serviceType !== 'ALL') return;
    const dStr = new Date(s.startTime).toLocaleDateString('el-GR');
    if (!groupedDates[dStr]) groupedDates[dStr] = [];
    groupedDates[dStr].push(s);
  });

  // Step 3 Logic: Evaluate Rule Engine
  useEffect(() => {
    if (step === 3 && service) {
      setLoadingSmart(true);
      getSmartTemplatesForBooking(templeId, service).then(data => {
        setTemplates(data);
        setLoadingSmart(false);
      });
    }
  }, [step, service, templeId]);

  // Phase 1: Identify all Condition Variables (e.g. {{OIKOG_STATUS}}) that dictate WHICH docs will be active
  const conditionVariables = Array.from(new Set(templates.filter(t => t.conditionVariable).map(t => t.conditionVariable as string)));
  
  // What templates are active based on the answers?
  const activeTemplates = templates.filter(t => {
    if (!t.conditionVariable) return true; // generic doc
    return answers[t.conditionVariable] === t.conditionTargetValue;
  });

  // Gather all final variables needed from the ACTIVE templates ONLY
  const requiredVariables = Array.from(new Set(activeTemplates.flatMap(t => t.variables)));
  // Exclude condition variables from the final list to avoid rendering twice
  const baseVariables = requiredVariables.filter(v => !conditionVariables.includes(v));

  const handleSmartAnswer = (key: string, value: string) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const submitFinal = async () => {
    if (!selectedSlot) return;
    setIsSubmitting(true);
    try {
      await submitBookingRequest(templeId, selectedSlot.id, answers);
      setStep(4);
      setIsDone(true);
    } catch(e) {
      toast.error('Σφάλμα κατά την κράτηση');
    }
    setIsSubmitting(false);
  };

  if (isDone) {
    return (
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 min-h-[500px] flex items-center justify-center text-center p-8">
        <div className="max-w-md mx-auto space-y-4">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600"/>
          </div>
          <h2 className="text-3xl font-black text-slate-800">Η κράτησή σας ολοκληρώθηκε!</h2>
          <p className="text-slate-500">
            Τα έγγραφα σας προπαρασκευάστηκαν στο σύστημα της Ενορίας βάσει των απαντήσεων σας. 
            Θα λάβετε SMS επιβεβαίωσης.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 min-h-[600px] flex flex-col">
      <div className="flex border-b border-gray-100 text-sm font-medium text-gray-500">
        <div className={`p-4 flex-1 text-center border-b-2 ${step >= 1 ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50' : 'border-transparent'}`}>1. Μυστήριο</div>
        <div className={`p-4 flex-1 text-center border-b-2 ${step >= 2 ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50' : 'border-transparent'}`}>2. Ημερομηνία & Ώρα</div>
        <div className={`p-4 flex-1 text-center border-b-2 ${step >= 3 ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50' : 'border-transparent'}`}>3. Έξυπνη Φόρμα (Q&A)</div>
      </div>

      <div className="p-8 flex-1">
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800">Τι ακριβώς θέλετε να προγραμματίσετε;</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Card 
                onClick={() => setService('BAPTISM')}
                className={`p-6 cursor-pointer hover:border-indigo-400 transition-all ${service === 'BAPTISM' ? 'ring-2 ring-indigo-600 border-indigo-600 bg-indigo-50/20' : 'border-border'}`}>
                <h3 className="text-xl font-bold text-indigo-900 mb-2">Ιερό Μυστήριο Βαπτίσεως</h3>
                <p className="text-sm text-gray-500">Κλείστε ώρα για βαπτίσεις. Απαιτούνται ληξιαρχικές πράξεις γεννήσεως 6μήνου.</p>
              </Card>
              <Card 
                onClick={() => setService('GAMOS')}
                className={`p-6 cursor-pointer hover:border-rose-400 transition-all ${service === 'GAMOS' ? 'ring-2 ring-rose-600 border-rose-600 bg-rose-50/20' : 'border-border'}`}>
                <h3 className="text-xl font-bold text-rose-900 mb-2">Ιερό Μυστήριο Γάμου</h3>
                <p className="text-sm text-gray-500">Επιλέξτε ώρα για το γάμο σας. Το σύστημα θα σας καθοδηγήσει για τα χαρτιά.</p>
              </Card>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-xl font-bold text-gray-800">Διαθέσιμες Ώρες Μυστηρίων</h2>
            {Object.keys(groupedDates).length === 0 ? (
              <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <CalendarDays className="w-8 h-8 mx-auto mb-3 opacity-50"/> Δεν υπάρχουν διαθέσιμες ημερομηνίες για αυτό το μυστήριο.
              </div>
            ) : (
              <div className="grid gap-6">
                {Object.entries(groupedDates).map(([dateLabel, slots]) => (
                  <div key={dateLabel} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <h3 className="font-bold flex items-center text-slate-800 mb-3 block"><CalendarDays className="w-4 h-4 mr-2 text-indigo-500"/>{dateLabel}</h3>
                    <div className="flex flex-wrap gap-2">
                      {slots.map(s => {
                        const timeStr = new Date(s.startTime).toLocaleTimeString('el-GR', { hour: '2-digit', minute:'2-digit' });
                        const isSelected = selectedSlot?.id === s.id;
                        return (
                          <button
                            key={s.id}
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

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            {loadingSmart ? (
               <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
            ) : (
              <>
                <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 border-l-4 border-amber-500 p-5 rounded-r-xl shadow-sm mb-8">
                  <h3 className="font-extrabold text-amber-900 text-lg flex items-center gap-2"><Info className="w-5 h-5"/> Σύστημα Έξυπνων Εγγράφων</h3>
                  <p className="text-sm text-amber-900/80 mt-1 max-w-2xl leading-relaxed">Απαντήστε στις παρακάτω ερωτήσεις. Το σύστημα αναλύει τους κανόνες της Ενορίας (Rule Engine) και δημιουργεί δυναμικά τη λίστα εγγράφων σας, αποτρέποντας από περιττή γραφειοκρατία.</p>
                </div>

                {/* 1. Prompt Condition Rules First */}
                {conditionVariables.length > 0 && (
                  <div className="mb-8 space-y-4">
                    <h4 className="font-bold text-slate-800 border-b pb-2 mb-4 uppercase tracking-wider text-sm flex items-center justify-between">
                      Ερωτήσεις Διαλογής
                      <span className="bg-slate-100 text-slate-500 text-xs px-2 py-1 rounded-full">{conditionVariables.length} Rules Found</span>
                    </h4>
                    {conditionVariables.map(cv => (
                      <div key={cv} className="bg-white border rounded-xl p-4 shadow-sm">
                        <Label className="text-base text-indigo-900 mb-2 block font-bold">Πεδίο: {cv}</Label>
                        <Input 
                          placeholder="π.χ. ΧΗΡΕΙΑ, ΔΙΑΖΥΓΙΟ, κ.ά." 
                          value={answers[cv] || ''} 
                          onChange={e => handleSmartAnswer(cv, e.target.value)} 
                          className="font-bold text-lg bg-indigo-50 focus-visible:ring-indigo-500 border-indigo-200"
                        />
                        <p className="text-xs text-slate-500 mt-2">Η απάντησή σας παραπάνω θα φορτώσει την κατάλληλη υπεύθυνη δήλωση αυτόματα!</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* 2. Determine and Show the Generated Smart Form Inputs */}
                {baseVariables.length > 0 ? (
                  <div className="space-y-4 pt-6 border-t border-dashed border-slate-200">
                    <h4 className="font-bold text-slate-800 mb-4 uppercase tracking-wider text-sm flex justify-between items-center">
                      Πεδία Εγγράφων που Ενεργοποιήθηκαν
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">{activeTemplates.length} Έγγραφα θα παραχθούν</span>
                    </h4>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      {activeTemplates.map(t => (
                        <span key={t.id} className="text-[10px] uppercase font-bold bg-slate-800 text-white py-1 px-3 rounded-full">{t.nameEl}</span>
                      ))}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      {baseVariables.map(bv => (
                        <div key={bv}>
                          <Label className="text-xs font-semibold text-gray-500 mb-1 block uppercase">{bv}</Label>
                          <Input 
                            value={answers[bv] || ''} 
                            onChange={e => handleSmartAnswer(bv, e.target.value)}
                            className="bg-slate-50 border-slate-200"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-20 flex items-center justify-center text-slate-400 italic">
                    Παρακαλούμε απαντήστε στις Ερωτήσεις Διαλογής.
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center mt-auto">
        <Button variant="outline" onClick={() => setStep(step - 1)} disabled={step === 1 || isSubmitting}>
          <ChevronLeft className="w-4 h-4 mr-2"/> Επιστροφή
        </Button>
        
        {step === 3 ? (
          <Button className="bg-green-600 hover:bg-green-700 text-white px-8" onClick={submitFinal} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin"/> : <><CheckCircle2 className="w-4 h-4 mr-2"/> Ολοκλήρωση Κράτησης</>}
          </Button>
        ) : (
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => setStep(step + 1)} disabled={(step === 1 && !service) || (step === 2 && !selectedSlot)}>
            Συνέχεια <ChevronRight className="w-4 h-4 ml-2"/>
          </Button>
        )}
      </div>
    </div>
  );
}
