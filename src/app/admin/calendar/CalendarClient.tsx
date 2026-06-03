'use client';

import { useState, useMemo, useCallback, useTransition } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, CalendarDays, List, X, Clock, ExternalLink, Plus, Save, MapPin } from 'lucide-react';
import { getAggregatedCalendarEvents, addCentralEvent, type AggregatedCalendarEvent, type CalendarEventType } from '@/actions/calendar';

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

const CATEGORY_COLORS: Record<string, string> = {
  'ΛΕΙΤΟΥΡΓΙΑ': '#e11d48',
  'ΣΥΝΕΔΡΙΟ': '#8b5cf6',
  'ΚΑΤΑΣΚΗΝΩΣΗ': '#10b981',
  'ΜΗΤΡΟΠΟΛΗ': '#f59e0b',
  'ΑΛΛΟ': '#3b82f6',
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

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

function formatDateEL(d: Date) {
  return d.toLocaleDateString('el-GR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function toDateInputValue(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
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
      <div
        className="flex-shrink-0 w-10 h-10 rounded-lg flex flex-col items-center justify-center font-bold"
        style={{ backgroundColor: event.color + '18', color: event.color }}
      >
        <span className="text-[10px] uppercase font-black tracking-wider leading-none">
          {d.toLocaleDateString('el-GR', { month: 'short' })}
        </span>
        <span className="text-lg leading-none">{d.getDate()}</span>
      </div>
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
            {event.time && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{event.time}</span>}
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
        <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--surface-hover)] text-[var(--text-muted)] transition-colors">
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">{TYPE_EMOJI[event.type]}</span>
          <span className="text-xs font-black uppercase tracking-widest px-2 py-1 rounded-full" style={{ backgroundColor: event.color + '20', color: event.color }}>
            {TYPE_LABELS[event.type]}
          </span>
          {event.isMajor && <span className="text-xs font-black bg-red-100 text-red-700 px-2 py-1 rounded-full">ΜΕΓΑΛΗ ΕΟΡΤΗ</span>}
        </div>
        <h2 className="text-lg font-bold text-[var(--foreground)] mb-3 leading-snug">{event.title}</h2>
        <div className="space-y-2 text-sm text-[var(--text-secondary)]">
          <div className="flex items-center gap-2"><CalendarDays className="w-4 h-4 text-[var(--text-muted)]" /><span>{formatDateEL(d)}</span></div>
          {event.time && <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-[var(--text-muted)]" /><span>{event.time}</span></div>}
          {event.details && <div className="pt-2 border-t border-[var(--border)] mt-2"><p className="text-[var(--text-muted)]">{event.details}</p></div>}
        </div>
        {event.href && (
          <Link href={event.href} className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90" style={{ backgroundColor: event.color, color: '#fff' }}>
            <ExternalLink className="w-4 h-4" />Προβολή Λεπτομερειών
          </Link>
        )}
      </div>
    </div>
  );
}

// ─── Add Event Drawer ──────────────────────────────────────────────────────────

interface AddEventDrawerProps {
  onClose: () => void;
  onSuccess: () => void;
  defaultDate?: string; // YYYY-MM-DD
}

function AddEventDrawer({ onClose, onSuccess, defaultDate }: AddEventDrawerProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(defaultDate ?? '');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState(defaultDate ?? '');
  const [endTime, setEndTime] = useState('');
  const [category, setCategory] = useState('ΑΛΛΟ');
  const [color, setColor] = useState(CATEGORY_COLORS['ΑΛΛΟ']);
  const [saving, setSaving] = useState(false);

  const handleCategoryChange = (val: string) => {
    setCategory(val);
    setColor(CATEGORY_COLORS[val] ?? '#3b82f6');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !startDate) return;
    setSaving(true);
    const res = await addCentralEvent({
      title, description,
      startDate, endDate: endDate || startDate,
      startTime: startTime || null, endTime: endTime || null,
      category, color,
    });
    setSaving(false);
    if (res.success) {
      onSuccess();
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white flex items-center justify-between flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              <h3 className="font-extrabold text-lg">Νέο Γεγονός</h3>
            </div>
            <p className="text-blue-100 text-sm mt-0.5">Προσθήκη στο Ημερολόγιο Ενορίας</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-[var(--foreground)]">Τίτλος *</label>
            <input
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="π.χ. Σύνοδος Εφημερίων..."
              className="w-full h-11 px-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent"
            />
          </div>

          {/* Category + Color */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[var(--foreground)]">Κατηγορία</label>
              <select
                value={category}
                onChange={e => handleCategoryChange(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)] cursor-pointer"
              >
                <option value="ΛΕΙΤΟΥΡΓΙΑ">Λειτουργία</option>
                <option value="ΣΥΝΕΔΡΙΟ">Συνέδριο / Ομιλία</option>
                <option value="ΚΑΤΑΣΚΗΝΩΣΗ">Κατασκήνωση</option>
                <option value="ΜΗΤΡΟΠΟΛΗ">Μητρόπολη / Συνάντηση</option>
                <option value="ΑΛΛΟ">Άλλο</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[var(--foreground)]">Χρώμα</label>
              <div className="flex items-center gap-2 h-11 border border-[var(--border)] rounded-xl px-3 bg-[var(--background)] focus-within:ring-2 focus-within:ring-[var(--brand)]">
                <input
                  type="color"
                  value={color}
                  onChange={e => setColor(e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border-none outline-none bg-transparent flex-shrink-0"
                />
                <span className="text-xs text-[var(--text-muted)] font-mono uppercase">{color}</span>
              </div>
            </div>
          </div>

          {/* Start date/time */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-[var(--foreground)]">Ημερομηνία & Ώρα Έναρξης *</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                required
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="h-11 px-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
              />
              <input
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="h-11 px-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
              />
            </div>
          </div>

          {/* End date/time */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-[var(--foreground)]">Ημερομηνία & Ώρα Λήξης <span className="text-[var(--text-muted)] font-normal">(προαιρετικό)</span></label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="h-11 px-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
              />
              <input
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="h-11 px-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-[var(--foreground)]">Περιγραφή <span className="text-[var(--text-muted)] font-normal">(προαιρετικό)</span></label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              placeholder="Επιπλέον πληροφορίες..."
              className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)] resize-none"
            />
          </div>

          {/* Preview */}
          <div className="rounded-xl p-3 text-sm font-medium flex items-center gap-2" style={{ backgroundColor: color + '15', color, border: `1px solid ${color}30` }}>
            <span className="text-base">📌</span>
            <span className="truncate">{title || 'Προεπισκόπηση τίτλου...'}</span>
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--border)] flex-shrink-0 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-11 rounded-xl border border-[var(--border)] text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] transition-colors"
          >
            Ακύρωση
          </button>
          <button
            onClick={handleSubmit as any}
            disabled={saving || !title || !startDate}
            className="flex-1 h-11 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)' }}
          >
            <Save className="w-4 h-4" />
            {saving ? 'Αποθήκευση...' : 'Αποθήκευση'}
          </button>
        </div>
      </div>
    </>
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
  const [month, setMonth] = useState(initialMonth);
  const [events, setEvents] = useState<AggregatedCalendarEvent[]>(initialEvents);
  const [loading, startTransition] = useTransition();
  const [view, setView] = useState<'month' | 'agenda'>('month');
  const [activeFilters, setActiveFilters] = useState<Set<CalendarEventType>>(new Set(ALL_TYPES));
  const [selectedEvent, setSelectedEvent] = useState<AggregatedCalendarEvent | null>(null);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [showAddDrawer, setShowAddDrawer] = useState(false);
  const [addDefaultDate, setAddDefaultDate] = useState<string | undefined>(undefined);

  const refreshEvents = useCallback((y: number, m: number) => {
    startTransition(async () => {
      const res = await getAggregatedCalendarEvents(y, m);
      if (res.success && res.data) setEvents(res.data);
    });
  }, []);

  const navigate = useCallback((newYear: number, newMonth: number) => {
    startTransition(async () => {
      const res = await getAggregatedCalendarEvents(newYear, newMonth);
      if (res.success && res.data) setEvents(res.data);
      setYear(newYear);
      setMonth(newMonth);
      setSelectedDay(null);
    });
  }, []);

  const goPrev = () => { if (month === 1) navigate(year - 1, 12); else navigate(year, month - 1); };
  const goNext = () => { if (month === 12) navigate(year + 1, 1); else navigate(year, month + 1); };
  const goToday = () => { const now = new Date(); navigate(now.getFullYear(), now.getMonth() + 1); };

  const toggleFilter = (type: CalendarEventType) => {
    setActiveFilters(prev => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type); else next.add(type);
      return next;
    });
  };

  const filteredEvents = useMemo(() => events.filter(e => activeFilters.has(e.type)), [events, activeFilters]);
  const dayEvents = useMemo(() => { if (!selectedDay) return []; return filteredEvents.filter(e => isSameDay(new Date(e.date), selectedDay)); }, [filteredEvents, selectedDay]);
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

  const openAddDrawer = (date?: Date) => {
    setAddDefaultDate(date ? toDateInputValue(date) : undefined);
    setShowAddDrawer(true);
  };

  return (
    <div className="space-y-4">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={goPrev} className="w-9 h-9 flex items-center justify-center rounded-xl border border-[var(--border)] hover:bg-[var(--surface-hover)] transition-colors text-[var(--text-secondary)]">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="min-w-[200px] text-center">
            <h2 className="text-xl font-bold text-[var(--foreground)] tracking-tight">{MONTHS_EL[month - 1]} {year}</h2>
          </div>
          <button onClick={goNext} className="w-9 h-9 flex items-center justify-center rounded-xl border border-[var(--border)] hover:bg-[var(--surface-hover)] transition-colors text-[var(--text-secondary)]">
            <ChevronRight className="w-4 h-4" />
          </button>
          <button onClick={goToday} className="ml-1 px-3 py-1.5 text-xs font-semibold rounded-lg border border-[var(--border)] hover:bg-[var(--surface-hover)] transition-colors text-[var(--text-secondary)]">
            Σήμερα
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center gap-1 bg-[var(--background)] border border-[var(--border)] rounded-xl p-1">
            <button onClick={() => setView('month')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${view === 'month' ? 'bg-white shadow-sm text-[var(--foreground)]' : 'text-[var(--text-muted)] hover:text-[var(--foreground)]'}`}>
              <CalendarDays className="w-3.5 h-3.5" /> Μήνας
            </button>
            <button onClick={() => setView('agenda')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${view === 'agenda' ? 'bg-white shadow-sm text-[var(--foreground)]' : 'text-[var(--text-muted)] hover:text-[var(--foreground)]'}`}>
              <List className="w-3.5 h-3.5" /> Λίστα
            </button>
          </div>

          {/* Add button */}
          <button
            onClick={() => openAddDrawer()}
            className="flex items-center gap-1.5 h-9 px-4 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 shadow-sm"
            style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)' }}
          >
            <Plus className="w-4 h-4" /> Νέο Γεγονός
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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${active ? 'border-transparent text-white' : 'bg-transparent border-[var(--border)] text-[var(--text-muted)] opacity-60'}`}
              style={active ? { backgroundColor: '#7c3aed' } : {}}
            >
              {TYPE_EMOJI[type]} {TYPE_LABELS[type]}
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${active ? 'bg-white/25' : 'bg-[var(--border)]'}`}>{count}</span>
            </button>
          );
        })}
        {loading && <span className="text-xs text-[var(--text-muted)] self-center animate-pulse">Φόρτωση...</span>}
      </div>

      {/* ── Month View ── */}
      {view === 'month' && (
        <div className="bg-white rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden">
          <div className="grid grid-cols-7 border-b border-[var(--border)]">
            {DAYS_EL.map(d => (
              <div key={d} className="py-2 text-center text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {grid.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} className="border-b border-r border-[var(--border)] min-h-[100px] bg-[var(--background)]" />;

              const isToday = isSameDay(day, today);
              const isSelected = selectedDay && isSameDay(day, selectedDay);
              const dayEvs = eventsByDay.get(day.toDateString()) ?? [];
              const isSunday = day.getDay() === 0;

              return (
                <div
                  key={day.toISOString()}
                  className={`border-b border-r border-[var(--border)] min-h-[100px] p-1.5 cursor-pointer transition-all hover:bg-[var(--background)] flex flex-col gap-1 group ${isSelected ? 'ring-2 ring-inset ring-[var(--brand)]' : ''} ${isSunday ? 'bg-red-50/30' : ''}`}
                  onClick={() => setSelectedDay(isSelected ? null : day)}
                >
                  <div className="flex items-center justify-between">
                    {/* Add button on hover */}
                    <button
                      onClick={e => { e.stopPropagation(); openAddDrawer(day); }}
                      className="w-5 h-5 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-[var(--brand-light)] text-[var(--brand)] transition-all"
                      title="Προσθήκη γεγονότος"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <span className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold transition-all ${isToday ? 'bg-[var(--brand)] text-white shadow-sm' : isSunday ? 'text-red-500 font-black' : 'text-[var(--foreground)]'}`}>
                      {day.getDate()}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5 flex-1">
                    {dayEvs.slice(0, 3).map(ev => (
                      <EventPill key={ev.id} event={ev} onClick={e => { e.stopPropagation(); setSelectedEvent(ev); }} />
                    ))}
                    {dayEvs.length > 3 && <span className="text-[10px] text-[var(--text-muted)] font-semibold px-1">+{dayEvs.length - 3} ακόμα</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Day detail ── */}
      {view === 'month' && selectedDay && (
        <div className="bg-white rounded-2xl border border-[var(--border)] shadow-sm p-4 animate-fade-in-up">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-[var(--foreground)] capitalize">{formatDateEL(selectedDay)}</h3>
            <div className="flex items-center gap-2">
              <button onClick={() => openAddDrawer(selectedDay)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--brand-light)] text-[var(--brand)] hover:bg-[var(--brand-50)] transition-colors">
                <Plus className="w-3.5 h-3.5" /> Γεγονός
              </button>
              <button onClick={() => setSelectedDay(null)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[var(--surface-hover)] text-[var(--text-muted)]">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          {dayEvents.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)] text-center py-4">Δεν υπάρχουν γεγονότα αυτή την ημέρα.</p>
          ) : (
            <div className="space-y-2">
              {dayEvents.map(ev => <AgendaRow key={ev.id} event={ev} onClick={() => setSelectedEvent(ev)} />)}
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
              <button onClick={() => openAddDrawer()} className="mt-4 flex items-center gap-1.5 mx-auto px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)' }}>
                <Plus className="w-4 h-4" /> Προσθήκη Γεγονότος
              </button>
            </div>
          ) : (
            filteredEvents.map(ev => <AgendaRow key={ev.id} event={ev} onClick={() => setSelectedEvent(ev)} />)
          )}
        </div>
      )}

      {/* ── Event Modal ── */}
      {selectedEvent && <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />}

      {/* ── Add Event Drawer ── */}
      {showAddDrawer && (
        <AddEventDrawer
          onClose={() => setShowAddDrawer(false)}
          onSuccess={() => refreshEvents(year, month)}
          defaultDate={addDefaultDate}
        />
      )}
    </div>
  );
}
