'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveTempleSettings } from '../../../actions';
import { CalendarIcon, CodeIcon, ClockIcon, SaveIcon, CopyIcon, SettingsIcon, AlertTriangleIcon } from 'lucide-react';

export default function BookingSettingsClient({ initialSettings, templeId }: { initialSettings: any, templeId: string }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  
  const defaultSchedule = initialSettings?.bookingSchedule || {
    disabledDaysOfWeek: [1, 3], 
    timeSlots: ['17:00', '18:00', '19:00', '20:00'],
    bufferMinutes: 15,
    gamosDurationMin: 45,
    vaptisiDurationMin: 30,
    exceptionalDisabledDates: [] // strings YYYY-MM-DD
  };

  const [schedule, setSchedule] = useState(defaultSchedule);
  const [newDateStr, setNewDateStr] = useState('');
  
  const embedCode = `<iframe src="https://Deltos.gr/widget/booking/${templeId}" width="100%" height="600px" style="border:none; border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.1);"></iframe>`;

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(embedCode);
    alert('Ο κώδικας ενσωμάτωσης αντιγράφηκε στο πρόχειρο!');
  };

  const handleDayToggle = (dayIndex: number) => {
    const isSelected = schedule.disabledDaysOfWeek.includes(dayIndex);
    let newDays = [...schedule.disabledDaysOfWeek];
    if (isSelected) {
      newDays = newDays.filter((d: number) => d !== dayIndex);
    } else {
      newDays.push(dayIndex);
    }
    setSchedule({ ...schedule, disabledDaysOfWeek: newDays });
  };

  const handleSlotToggle = (slot: string) => {
    const isSelected = schedule.timeSlots.includes(slot);
    let newSlots = [...schedule.timeSlots];
    if (isSelected) {
      newSlots = newSlots.filter((s: string) => s !== slot);
    } else {
      newSlots.push(slot);
    }
    newSlots.sort();
    setSchedule({ ...schedule, timeSlots: newSlots });
  };

  const addExceptionalDate = () => {
    if (!newDateStr) return;
    if (!schedule.exceptionalDisabledDates.includes(newDateStr)) {
      setSchedule({ ...schedule, exceptionalDisabledDates: [...schedule.exceptionalDisabledDates, newDateStr].sort() });
    }
    setNewDateStr('');
  };

  const removeExceptionalDate = (dateStr: string) => {
    setSchedule({
      ...schedule,
      exceptionalDisabledDates: schedule.exceptionalDisabledDates.filter((d: string) => d !== dateStr)
    });
  };

  const saveAll = async () => {
    setSaving(true);
    const updatedSettings = { ...initialSettings, bookingSchedule: schedule };
    await saveTempleSettings(updatedSettings);
    setSaving(false);
    alert('Οι ρυθμίσεις διαθεσιμότητας αποθηκεύτηκαν!');
    router.refresh();
  };

  const dayNames = ['Κυριακή', 'Δευτέρα', 'Τρίτη', 'Τετάρτη', 'Πέμπτη', 'Παρασκευή', 'Σάββατο'];
  // Generate 30min slots
  const possibleSlots = Array.from({ length: 26 }, (_, i) => {
    const hour = Math.floor(i / 2) + 9; // starts at 09:00
    const mins = i % 2 === 0 ? '00' : '30';
    return `${hour.toString().padStart(2, '0')}:${mins}`;
  });

  return (
    <div style={{ animation: 'fadeInUp 0.5s ease', maxWidth: '900px', margin: '0 auto', paddingBottom: '3rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title text-3xl font-bold mb-2">Ρυθμίσεις Διαθεσιμότητας (Booking)</h1>
          <p className="text-muted-foreground">Έξυπνος παραμετροποιήσιμος αλγόριθμος κρατήσεων ναού.</p>
        </div>
        <button onClick={saveAll} disabled={saving} className="btn-primary flex items-center gap-2 px-6 py-2">
          {saving ? 'Αποθήκευση...' : <><SaveIcon size={18} /> Αποθήκευση</>}
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* ΑΡΙΣΤΕΡΑ: ΡΥΘΜΙΣΕΙΣ */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <div className="glass-panel p-6">
            <h3 className="text-lg font-bold border-b border-border pb-3 mb-5 flex items-center gap-2">
              <SettingsIcon className="text-primary" size={20} /> Διάρκεια Μυστηρίων & Εξαιρέσεις
            </h3>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-semibold mb-1">Διάρκεια Γάμου (Λεπτά)</label>
                <input type="number" className="data-input w-full" value={schedule.gamosDurationMin} onChange={e => setSchedule({...schedule, gamosDurationMin: parseInt(e.target.value) || 45})} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Διάρκεια Βάπτισης (Λεπτά)</label>
                <input type="number" className="data-input w-full" value={schedule.vaptisiDurationMin} onChange={e => setSchedule({...schedule, vaptisiDurationMin: parseInt(e.target.value) || 30})} />
              </div>
            </div>

            <h4 className="text-sm font-bold mt-4 mb-2">Συγκεκριμένες Μη-Διαθέσιμες Ημερομηνίες (π.χ. Μεγάλη Εβδομάδα)</h4>
            <div className="flex gap-2 mb-4">
              <input type="date" className="data-input flex-1" value={newDateStr} onChange={e => setNewDateStr(e.target.value)} />
              <button onClick={addExceptionalDate} className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold">Προσθήκη</button>
            </div>
            
            {schedule.exceptionalDisabledDates.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {schedule.exceptionalDisabledDates.map((d: string) => (
                  <span key={d} className="inline-flex items-center gap-2 px-3 py-1 bg-destructive/10 text-destructive text-sm font-bold rounded-full">
                    {d.split('-').reverse().join('/')}
                    <button onClick={() => removeExceptionalDate(d)} className="hover:text-destructive/70">✕</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="glass-panel p-6">
            <h3 className="text-lg font-bold border-b border-border pb-3 mb-5 flex items-center gap-2">
              <CalendarIcon className="text-primary" size={20} /> Σταθερές Μη-Διαθέσιμες Ημέρες
            </h3>
            <div className="flex flex-wrap gap-3">
              {dayNames.map((day, ix) => {
                const isDisabled = schedule.disabledDaysOfWeek.includes(ix);
                return (
                  <button 
                    key={ix}
                    onClick={() => handleDayToggle(ix)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${isDisabled ? 'bg-destructive/10 border-destructive/50 text-destructive' : 'bg-background hover:bg-muted border-border text-foreground'}`}
                  >
                    {day}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="glass-panel p-6">
            <h3 className="text-lg font-bold border-b border-border pb-3 mb-5 flex items-center gap-2">
              <ClockIcon className="text-primary" size={20} /> Επιτρεπτές Ώρες Έναρξης (Time Blocks)
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Επιλέξτε ΚΑΘΕ πιθανή ώρα που μπορεί να <b>ξεκινήσει</b> ένα μυστήριο. Το Deltos θα αφαιρεί αυτόματα τις επιλογές αν δεν υπάρχει επαρκής χρόνος βάσει της διάρκειας!
            </p>
            
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {possibleSlots.map((slot) => {
                const active = schedule.timeSlots.includes(slot);
                return (
                  <button 
                    key={slot}
                    onClick={() => handleSlotToggle(slot)}
                    className={`px-2 py-2 rounded-lg border text-xs font-bold transition-all text-center ${active ? 'bg-primary text-primary-foreground border-primary shadow-sm' : 'bg-background hover:bg-muted border-border text-muted-foreground'}`}
                  >
                    {slot}
                  </button>
                )
              })}
            </div>
          </div>

        </div>

        {/* ΔΕΞΙΑ: ΕΝΣΩΜΑΤΩΣΗ */}
        <div className="flex flex-col gap-6">
           <div className="glass-panel p-6 bg-primary/5 border-primary/20">
              <h3 className="text-lg font-bold border-b border-primary/20 pb-3 mb-5 flex items-center gap-2 text-primary">
                <CodeIcon size={20} /> Κώδικας Ενσωμάτωσης
              </h3>
              <p className="text-sm text-foreground/80 mb-5">
                Αντιγράψτε τον κώδικα HTML στο site του ναού (WordPress, Wix κλπ).
              </p>
              
              <div className="bg-background border border-border p-3 rounded-lg overflow-x-auto mb-4 text-xs font-mono text-muted-foreground">
                {embedCode}
              </div>

              <button onClick={copyEmbedCode} className="w-full btn-secondary bg-primary text-primary-foreground hover:bg-primary/90 flex justify-center items-center gap-2 py-2">
                <CopyIcon size={16} /> Αντιγραφή Κώδικα
              </button>
           </div>
           
           <div className="glass-panel p-6 p-4">
              <h4 className="flex items-center gap-2 font-bold mb-2 text-indigo-600">
                <AlertTriangleIcon size={18} /> Έξυπνη Αποτροπή Συγκρούσεων
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Όταν ορίζετε διάρκεια 45λ για ένα Γάμο, και επιτρέπετε ενάρξεις ανά μισάωρο (π.χ. 18:00, 18:30). 
                Αν κάποιος κλείσει Γάμο στις 18:00, το σύστημα <b>δεν</b> θα επιτρέψει σε άλλον να επιλέξει τις 18:30, μέχρι και τις 18:45, προστατεύοντας τον ναό!
              </p>
           </div>
        </div>

      </div>
    </div>
  )
}

