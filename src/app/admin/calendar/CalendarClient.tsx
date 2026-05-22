'use client';

import { useState, useMemo, useCallback, useTransition } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, CalendarDays, List, X, Clock, ExternalLink } from 'lucide-react';
import { getAggregatedCalendarEvents, type AggregatedCalendarEvent, type CalendarEventType } from '@/actions/calendar';

// ─── Constants ─────────────────────────────────────────────────────────────────

const MONTHS_EL = [
  'Ιανουάριος', 'Φεβρουάριος', 'Μάρτιος', 'Απρίλιος', 'Μάιος', 'Ιούνιος',
  'Ιούλιος', 'Αύγουστος', 'Σεπτέμβριος', 'Οκτώβριος', 'Νοέμβριος', 'Δεκέμβριος',
];
const DAYS_EL = ['Δευ', 'Τρι', 'Τετ', 'Πεμ', 'Παρ', 'Σαβ', 'Κυρ'];

const TYPE_LABELS: Record<CalendarEventType, string> = {
  SERVICE: 'Ακολουθίες',
  CEREMONY_MARRIAGE: 'Γάμοι',
  CEREMONY_BAPTISM: 'Βαπτίσεις',
  CEREMONY_FUNERAL: 'Κηδείες',
  CENTRAL_EVENT: 'Γεγονότα',
  SISSITIO: 'Φιλόπτωχο',
};

const TYPE_EMOJI: Record<CalendarEventType, string> = {
  SERVICE: '⛪',
  CEREMONY_MARRIAGE: '💒',
  CEREMONY_BAPTISM: '✝️',
  CEREMONY_FUNERAL: '🕯️',
  CENTRAL_EVENT: '📌',
  SISSITIO: '🍲',
};

const ALL_TYPES: CalendarEventType[] = [
  'SERVICE', 'CEREMONY_MARRIAGE', 'CEREMONY_BAPTISM', 'CEREMONY_FUNERAL', 'CENTRAL_EVENT', 'SISSITIO',
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getCalendarGrid(year: number, month: number): (Date | null)[] {
  // month is 1-indexed
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  // Monday = 0
  let startDow = firstDay.getDay() - 1;
  if (startDow < 0) startDow = 6;

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) cells.push(new Date(year, month - 1, d));
  // Pad to full 6 rows
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatDateEL(d: Date) {
  return d.toLocaleDateString('el-GR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function EventDot({ color, isMajor }: { color: string; isMajor?: boolean }) {
  return (
    <span
      className="inline-block w-2 h-2 rounded-full flex-shrink-0"
      style={{ backgroundColor: color, boxShadow: isMajor ? `0 0 0 2px ${color}40` : undefined }}
    />
  );
}

function EventPill({ event, onClick }: { event: AggregatedCalendarEvent; onClick: (e: React.MouseEvent) => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left text-[10px] font-semibold px-1.5 py-0.5 rounded truncate leading-tight transition-opacity hover:opacity-80"
      style={{ backgroundColor: event.color + '20', color: event.color, borderLeft: `2px solid ${event.color}` }}
      title={event.title}
    >
      {event.title}
    </button>
  );
}

function AgendaRow({ event, onClick }: { event: AggregatedCalendarEvent; onClick: () => void }) {
  const d = new Date(event.date);
  return (
    <button
      onClick={onClick}
      className="w-full flex items-start gap-3 p-3.5 rounded-xl border transition-all hover:shadow-md text-left group"
      style={{ borderColor: event.color + '30', backgroundColor: event.color + '08' }}
    >
      {/* Date badge */}
      <div
        className="flex-shrink-0 w-10 h-10 rounded-lg flex flex-col items-center justify-center font-bold"
        style={{ backgroundColor: event.color + '18', color: event.color }}
      >
        <span className="text-[10px] uppercase font-black tracking-wider leading-none">
          {d.toLocaleDateString('el-GR', { month: 'short' })}
        </span>
        <span className="text-lg leading-none">{d.getDate()}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-xs">{TYPE_EMOJI[event.type]}</span>
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: event.color }}>
            {TYPE_LABELS[event.type]}
          </span>
          {event.isMajor && (
            <span className="text-[10px] font-black bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">ΜΕΓΑΛΗ ΕΟΡΤΗ</span>
          )}
        </div>
        <p className="text-sm font-semibold text-[var(--foreground)] truncate">{event.title}</p>
        {(event.time || event.details) && (
          <p className="text-xs text-[var(--text-muted)] mt-0.5 flex items-center gap-2">
            {event.time && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {event.time}
              </span>
            )}
            {event.details && <span className="truncate">{event.details}</span>}
          </p>
        )}
      </div>

      {event.href && (
        <ExternalLink className="w-4 h-4 flex-shrink-0 text-[var(--text-muted)] group-hover:text-[var(--foreground)] transition-colors" />
      )}
    </button>
  );
}

function EventModal({ event, onClose }: { event: AggregatedCalendarEvent; onClose: () => void }) {
  const d = new Date(event.date);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-fade-in-up"
        onClick={e => e.stopPropagation()}
        style={{ borderTop: `4px solid ${event.color}` }}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--surface-hover)] text-[var(--text-muted)] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">{TYPE_EMOJI[event.type]}</span>
          <span
            className="text-xs font-black uppercase tracking-widest px-2 py-1 rounded-full"
            style={{ backgroundColor: event.color + '20', color: event.color }}
          >
            {TYPE_LABELS[event.type]}
          </span>
          {event.isMajor && (
            <span className="text-xs font-black bg-red-100 text-red-700 px-2 py-1 rounded-full">ΜΕΓΑΛΗ ΕΟΡΤΗ</span>
          )}
        </div>

        <h2 className="text-lg font-bold text-[var(--foreground)] mb-3 leading-snug">{event.title}</h2>

        <div className="space-y-2 text-sm text-[var(--text-secondary)]">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-[var(--text-muted)]" />
            <span>{formatDateEL(d)}</span>
          </div>
          {event.time && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[var(--text-muted)]" />
              <span>{event.time}</span>
            </div>
          )}
          {event.details && (
            <div className="pt-2 border-t border-[var(--border)] mt-2">
              <p className="text-[var(--text-muted)]">{event.details}</p>
            </div>
          )}
        </div>

        {event.href && (
          <Link
            href={event.href}
            className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
            style={{ backgroundColor: event.color, color: '#fff' }}
          >
            <ExternalLink className="w-4 h-4" />
            Προβολή Λεπτομερειών
          </Link>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

interface Props {
  initialEvents: AggregatedCalendarEvent[];
  initialYear: number;
  initialMonth: number;
}

export default function CalendarClient({ initialEvents, initialYear, initialMonth }: Props) {
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth); // 1-indexed
  const [events, setEvents] = useState<AggregatedCalendarEvent[]>(initialEvents);
  const [loading, startTransition] = useTransition();
  const [view, setView] = useState<'month' | 'agenda'>('month');
  const [activeFilters, setActiveFilters] = useState<Set<CalendarEventType>>(new Set(ALL_TYPES));
  const [selectedEvent, setSelectedEvent] = useState<AggregatedCalendarEvent | null>(null);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const navigate = useCallback((newYear: number, newMonth: number) => {
    startTransition(async () => {
      const res = await getAggregatedCalendarEvents(newYear, newMonth);
      if (res.success && res.data) setEvents(res.data);
      setYear(newYear);
      setMonth(newMonth);
      setSelectedDay(null);
    });
  }, []);

  const goPrev = () => {
    if (month === 1) navigate(year - 1, 12);
    else navigate(year, month - 1);
  };

  const goNext = () => {
    if (month === 12) navigate(year + 1, 1);
    else navigate(year, month + 1);
  };

  const goToday = () => {
    const now = new Date();
    navigate(now.getFullYear(), now.getMonth() + 1);
  };

  const toggleFilter = (type: CalendarEventType) => {
    setActiveFilters(prev => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  const filteredEvents = useMemo(
    () => events.filter(e => activeFilters.has(e.type)),
    [events, activeFilters],
  );

  const dayEvents = useMemo(() => {
    if (!selectedDay) return [];
    return filteredEvents.filter(e => isSameDay(new Date(e.date), selectedDay));
  }, [filteredEvents, selectedDay]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, AggregatedCalendarEvent[]>();
    for (const e of filteredEvents) {
      const key = new Date(e.date).toDateString();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    }
    return map;
  }, [filteredEvents]);

  const grid = useMemo(() => getCalendarGrid(year, month), [year, month]);
  const today = new Date();

  return (
    <div className="space-y-4">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* Month nav */}
          <button
            onClick={goPrev}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-[var(--border)] hover:bg-[var(--surface-hover)] transition-colors text-[var(--text-secondary)]"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="min-w-[200px] text-center">
            <h2 className="text-xl font-bold text-[var(--foreground)] tracking-tight">
              {MONTHS_EL[month - 1]} {year}
            </h2>
          </div>
          <button
            onClick={goNext}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-[var(--border)] hover:bg-[var(--surface-hover)] transition-colors text-[var(--text-secondary)]"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={goToday}
            className="ml-1 px-3 py-1.5 text-xs font-semibold rounded-lg border border-[var(--border)] hover:bg-[var(--surface-hover)] transition-colors text-[var(--text-secondary)]"
          >
            Σήμερα
          </button>
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 bg-[var(--background)] border border-[var(--border)] rounded-xl p-1">
          <button
            onClick={() => setView('month')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              view === 'month' ? 'bg-white shadow-sm text-[var(--foreground)]' : 'text-[var(--text-muted)] hover:text-[var(--foreground)]'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" /> Μήνας
          </button>
          <button
            onClick={() => setView('agenda')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              view === 'agenda' ? 'bg-white shadow-sm text-[var(--foreground)]' : 'text-[var(--text-muted)] hover:text-[var(--foreground)]'
            }`}
          >
            <List className="w-3.5 h-3.5" /> Λίστα
          </button>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-2">
        {ALL_TYPES.map(type => {
          const active = activeFilters.has(type);
          const count = events.filter(e => e.type === type).length;
          if (count === 0) return null;
          return (
            <button
              key={type}
              onClick={() => toggleFilter(type)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                active ? 'border-transparent text-white' : 'bg-transparent border-[var(--border)] text-[var(--text-muted)] opacity-60'
              }`}
              style={active ? { backgroundColor: '#7c3aed' } : {}}
              title={active ? 'Κάντε κλικ για απόκρυψη' : 'Κάντε κλικ για εμφάνιση'}
            >
              {TYPE_EMOJI[type]} {TYPE_LABELS[type]}
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${active ? 'bg-white/25' : 'bg-[var(--border)]'}`}>
                {count}
              </span>
            </button>
          );
        })}
        {loading && <span className="text-xs text-[var(--text-muted)] self-center animate-pulse">Φόρτωση...</span>}
      </div>

      {/* ── Month View ── */}
      {view === 'month' && (
        <div className="bg-white rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-[var(--border)]">
            {DAYS_EL.map(d => (
              <div key={d} className="py-2 text-center text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                {d}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-7">
            {grid.map((day, idx) => {
              if (!day) {
                return <div key={`empty-${idx}`} className="border-b border-r border-[var(--border)] min-h-[100px] bg-[var(--background)]" />;
              }

              const isToday = isSameDay(day, today);
              const isSelected = selectedDay && isSameDay(day, selectedDay);
              const dayEvs = eventsByDay.get(day.toDateString()) ?? [];
              const isSunday = day.getDay() === 0;

              return (
                <div
                  key={day.toISOString()}
                  className={`border-b border-r border-[var(--border)] min-h-[100px] p-1.5 cursor-pointer transition-all hover:bg-[var(--background)] flex flex-col gap-1 ${
                    isSelected ? 'ring-2 ring-inset ring-[var(--brand)]' : ''
                  } ${isSunday ? 'bg-red-50/30' : ''}`}
                  onClick={() => setSelectedDay(isSelected ? null : day)}
                >
                  {/* Day number */}
                  <div className="flex justify-end">
                    <span
                      className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold transition-all ${
                        isToday
                          ? 'bg-[var(--brand)] text-white shadow-sm'
                          : isSunday
                          ? 'text-red-500 font-black'
                          : 'text-[var(--foreground)]'
                      }`}
                    >
                      {day.getDate()}
                    </span>
                  </div>

                  {/* Events (show max 3, then +N) */}
                  <div className="flex flex-col gap-0.5 flex-1">
                    {dayEvs.slice(0, 3).map(ev => (
                      <EventPill
                        key={ev.id}
                        event={ev}
                        onClick={e => { (e as any).stopPropagation(); setSelectedEvent(ev); }}
                      />
                    ))}
                    {dayEvs.length > 3 && (
                      <span className="text-[10px] text-[var(--text-muted)] font-semibold px-1">
                        +{dayEvs.length - 3} ακόμα
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Day detail (when day is selected in month view) ── */}
      {view === 'month' && selectedDay && (
        <div className="bg-white rounded-2xl border border-[var(--border)] shadow-sm p-4 animate-fade-in-up">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-[var(--foreground)] capitalize">
              {formatDateEL(selectedDay)}
            </h3>
            <button onClick={() => setSelectedDay(null)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[var(--surface-hover)] text-[var(--text-muted)]">
              <X className="w-4 h-4" />
            </button>
          </div>
          {dayEvents.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)] text-center py-4">Δεν υπάρχουν γεγονότα αυτή την ημέρα.</p>
          ) : (
            <div className="space-y-2">
              {dayEvents.map(ev => (
                <AgendaRow key={ev.id} event={ev} onClick={() => setSelectedEvent(ev)} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Agenda View ── */}
      {view === 'agenda' && (
        <div className="space-y-2">
          {filteredEvents.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-[var(--border)] py-16 text-center">
              <CalendarDays className="w-12 h-12 mx-auto text-[var(--border)] mb-3" />
              <p className="text-[var(--text-muted)] font-medium">Δεν υπάρχουν γεγονότα αυτό τον μήνα.</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">Δοκιμάστε να αφαιρέσετε φίλτρα ή να μεταβείτε σε άλλο μήνα.</p>
            </div>
          ) : (
            filteredEvents.map(ev => (
              <AgendaRow key={ev.id} event={ev} onClick={() => setSelectedEvent(ev)} />
            ))
          )}
        </div>
      )}

      {/* ── Event Modal ── */}
      {selectedEvent && (
        <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </div>
  );
}
