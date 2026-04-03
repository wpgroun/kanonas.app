'use client'

import React, { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format, isSameDay, startOfDay } from 'date-fns';
import { el } from 'date-fns/locale';
import { HelpCircleIcon } from 'lucide-react';

interface BookedSlot {
  isoDate: string;
  type: string;
}

interface BookingWidgetClientProps {
  templeId: string;
  templeName: string;
  schedule: {
    disabledDaysOfWeek: number[];
    timeSlots: string[];
    gamosDurationMin?: number;
    vaptisiDurationMin?: number;
    exceptionalDisabledDates?: string[];
  };
  bookedSlots: BookedSlot[]; 
}

export default function BookingWidgetClient({ templeId, templeName, schedule, bookedSlots }: BookingWidgetClientProps) {
  const [serviceType, setServiceType] = useState<'GAMOS' | 'VAPTISI'>('GAMOS');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const durationMin = serviceType === 'GAMOS' ? (schedule.gamosDurationMin || 45) : (schedule.vaptisiDurationMin || 30);

  // Parse existing bookings to their time ranges
  const getBookedRanges = (dateStr: string) => {
    return bookedSlots
      .filter(b => b.isoDate.startsWith(dateStr))
      .map(b => {
        const start = new Date(b.isoDate);
        const dur = b.type === 'GAMOS' ? (schedule.gamosDurationMin || 45) : (schedule.vaptisiDurationMin || 30);
        const end = new Date(start.getTime() + dur * 60000);
        return { start, end };
      });
  };

  const matchDisabledDays = (date: Date) => {
    if (startOfDay(date) < startOfDay(new Date())) return true;
    if (schedule.disabledDaysOfWeek?.includes(date.getDay())) return true;
    
    // Check exceptional dates YYYY-MM-DD
    const str = format(date, 'yyyy-MM-dd');
    if (schedule.exceptionalDisabledDates?.includes(str)) return true;
    
    return false;
  };

  const getAvailableSlots = (date: Date) => {
    const baseDateStr = format(date, 'yyyy-MM-dd');
    const existingRanges = getBookedRanges(baseDateStr);

    return (schedule.timeSlots || []).filter(time => {
      const [th, tm] = time.split(':');
      const candidateStart = new Date(date);
      candidateStart.setHours(parseInt(th), parseInt(tm), 0, 0);
      const candidateEnd = new Date(candidateStart.getTime() + durationMin * 60000);

      // Check if [candidateStart, candidateEnd] overlaps with any existing range
      const overlap = existingRanges.some(range => {
        return (candidateStart < range.end && candidateEnd > range.start);
      });
      return !overlap;
    });
  };

  const currentAvailableSlots = selectedDate ? getAvailableSlots(selectedDate) : [];

  const handleBooking = () => {
    if (!selectedDate || !selectedTime) return;
    const [hours, minutes] = selectedTime.split(':');
    const finalDate = new Date(selectedDate);
    finalDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    window.location.href = `/book?templeId=${templeId}&type=${serviceType}&date=${finalDate.toISOString()}`;
  };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: '1.5rem', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', border: '1px solid #eaeaea' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.3rem', color: '#111' }}>Κράτηση Μυστηρίου</h2>
        <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.9rem', color: '#666' }}>{templeName}</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Υπηρεσία */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button 
             onClick={() => { setServiceType('GAMOS'); setSelectedTime(null); }}
             style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', border: serviceType === 'GAMOS' ? '2px solid #4f46e5' : '1px solid #ccc', background: serviceType === 'GAMOS' ? '#eef2ff' : '#fff', fontWeight: 'bold' }}
          >Γάμος ({schedule.gamosDurationMin || 45}')</button>
          <button 
             onClick={() => { setServiceType('VAPTISI'); setSelectedTime(null); }}
             style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', border: serviceType === 'VAPTISI' ? '2px solid #4f46e5' : '1px solid #ccc', background: serviceType === 'VAPTISI' ? '#eef2ff' : '#fff', fontWeight: 'bold' }}
          >Βάπτιση ({schedule.vaptisiDurationMin || 30}')</button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <DayPicker 
            mode="single"
            selected={selectedDate}
            onSelect={(d) => { setSelectedDate(d); setSelectedTime(null); }}
            disabled={matchDisabledDays}
            locale={el}
            styles={{
              caption: { color: '#4f46e5', fontWeight: 'bold' },
              day_selected: { backgroundColor: '#4f46e5', color: 'white' },
              day_today: { color: '#4f46e5', fontWeight: 'bold' }
            }}
          />
        </div>

        {selectedDate && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#333', textAlign: 'center', borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
              Ώρες για {format(selectedDate, 'dd/MM/yyyy')}
            </h3>
            
            {currentAvailableSlots.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#e53e3e', fontSize: '0.9rem', padding: '1rem', background: '#fff5f5', borderRadius: '8px' }}>
                Δεν υπάρχουν επαρκώς διαθέσιμες ώρες για τη συγκεκριμένη υπηρεσία ({durationMin} λεπτά).
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.8rem' }}>
                {currentAvailableSlots.map(time => (
                  <button 
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    style={{
                      padding: '0.6rem',
                      borderRadius: '6px',
                      border: selectedTime === time ? '2px solid #4f46e5' : '1px solid #ccc',
                      background: selectedTime === time ? '#eef2ff' : '#fff',
                      color: selectedTime === time ? '#4f46e5' : '#333',
                      fontWeight: selectedTime === time ? 'bold' : 'normal',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {time}
                  </button>
                ))}
              </div>
            )}

            {selectedTime && (
              <button 
                onClick={handleBooking}
                style={{
                  width: '100%',
                  marginTop: '1.5rem',
                  padding: '1rem',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 6px rgba(16, 185, 129, 0.2)'
                }}
              >
                Επιβεβαίωση Κράτησης
              </button>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
