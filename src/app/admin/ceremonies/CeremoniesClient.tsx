'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Baby, 
  Skull, 
  Search, 
  Calendar as CalendarIcon, 
  Plus, 
  User, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  XCircle 
} from 'lucide-react';

interface Document {
  id: string;
  name: string;
  status: string;
}

interface Ceremony {
  id: string;
  type: 'MARRIAGE' | 'BAPTISM' | 'FUNERAL';
  subtype: string;
  date: string;
  priest: string | null;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  registryNumber: string | null;
  detailsJson: string;
  documents: Document[];
}

export default function CeremoniesClient({ initialCeremonies }: { initialCeremonies: Ceremony[] }) {
  const [activeTab, setActiveTab] = useState<'MARRIAGE' | 'BAPTISM' | 'FUNERAL' | 'CALENDAR'>('MARRIAGE');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [yearFilter, setYearFilter] = useState<string>('ALL');

  // Calendar State
  const [calendarDate, setCalendarDate] = useState(new Date());

  // Derive unique years for filter
  const years = useMemo(() => {
    const yrs = new Set<string>();
    initialCeremonies.forEach(c => {
      const yr = new Date(c.date).getFullYear().toString();
      yrs.add(yr);
    });
    return Array.from(yrs).sort((a, b) => b.localeCompare(a));
  }, [initialCeremonies]);

  // Filter ceremonies for lists
  const filteredCeremonies = useMemo(() => {
    return initialCeremonies.filter(c => {
      // Tab check
      if (activeTab !== 'CALENDAR' && c.type !== activeTab) return false;

      // Status filter
      if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;

      // Year filter
      if (yearFilter !== 'ALL') {
        const yr = new Date(c.date).getFullYear().toString();
        if (yr !== yearFilter) return false;
      }

      // Search filter
      if (search.trim() !== '') {
        const query = search.toLowerCase();
        const regNum = (c.registryNumber || '').toLowerCase();
        const priest = (c.priest || '').toLowerCase();
        let detailsText = '';
        try {
          const details = JSON.parse(c.detailsJson || '{}');
          detailsText = JSON.stringify(details).toLowerCase();
        } catch {}

        if (!regNum.includes(query) && !priest.includes(query) && !detailsText.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [initialCeremonies, activeTab, statusFilter, yearFilter, search]);

  // Document progress calculation helper
  const getDocProgress = (docs: Document[]) => {
    if (docs.length === 0) return { received: 0, total: 0, percent: 0 };
    const total = docs.length;
    const received = docs.filter(d => d.status === 'RECEIVED' || d.status === 'NOT_REQUIRED').length;
    const percent = Math.round((received / total) * 100);
    return { received, total, percent };
  };

  // Status mapping
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Ολοκληρώθηκε</Badge>;
      case 'CANCELLED':
        return <Badge className="bg-rose-500 hover:bg-rose-600 text-white gap-1"><XCircle className="w-3.5 h-3.5" /> Ακυρώθηκε</Badge>;
      default:
        return <Badge className="bg-amber-500 hover:bg-amber-600 text-white gap-1"><Clock className="w-3.5 h-3.5" /> Σε εκκρεμότητα</Badge>;
    }
  };

  // Participant formatting
  const getParticipants = (c: Ceremony) => {
    try {
      const details = JSON.parse(c.detailsJson || '{}');
      if (c.type === 'MARRIAGE') {
        return (
          <div className="space-y-1">
            <p className="text-sm font-semibold text-[var(--foreground)]">Γαμπρός: {details.groomLastName} {details.groomFirstName}</p>
            <p className="text-sm font-semibold text-[var(--foreground)]">Νύφη: {details.brideLastName} {details.brideFirstName}</p>
          </div>
        );
      } else if (c.type === 'BAPTISM') {
        const name = details.baptizedFirstName ? `${details.baptizedLastName || ''} ${details.baptizedFirstName}` : 'Βρέφος / Ανώνυμο';
        return (
          <div>
            <p className="text-sm font-semibold text-[var(--foreground)]">Βαπτιζόμενος: {name}</p>
            {details.sponsorFirstName && <p className="text-xs text-[var(--text-muted)]">Ανάδοχος: {details.sponsorLastName} {details.sponsorFirstName}</p>}
          </div>
        );
      } else {
        return (
          <div>
            <p className="text-sm font-semibold text-[var(--foreground)]">Αποβιώσας: {details.deceasedLastName} {details.deceasedFirstName}</p>
            <p className="text-xs text-[var(--text-muted)]">Συγγενής: {details.relativeLastName} {details.relativeFirstName} ({details.relativeRelationship})</p>
          </div>
        );
      }
    } catch {
      return <p className="text-sm text-rose-500">Σφάλμα φόρτωσης στοιχείων</p>;
    }
  };

  // Calendar Helpers
  const calendarMonths = ['Ιανουάριος', 'Φεβρουάριος', 'Μάρτιος', 'Απρίλιος', 'Μάιος', 'Ιούνιος', 'Ιούλιος', 'Αύγουστος', 'Σεπτέμβριος', 'Οκτώβριος', 'Νοέμβριος', 'Δεκέμβριος'];
  
  const handlePrevMonth = () => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1));
  };
  const handleNextMonth = () => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1));
  };

  const calendarDays = useMemo(() => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();

    // Day of week index for 1st of month (0 = Sunday, 1 = Monday, etc.)
    // We adjust it so Monday is index 0.
    const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7;
    const totalDays = new Date(year, month + 1, 0).getDate();

    const days: (Date | null)[] = [];

    // Add empty slots for days before 1st of month
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  }, [calendarDate]);

  const getCeremoniesForDay = (date: Date) => {
    return initialCeremonies.filter(c => {
      const cDate = new Date(c.date);
      return cDate.getFullYear() === date.getFullYear() &&
             cDate.getMonth() === date.getMonth() &&
             cDate.getDate() === date.getDate();
    });
  };

  const getCeremonyColor = (type: string) => {
    switch (type) {
      case 'MARRIAGE': return 'bg-blue-500 text-white';
      case 'BAPTISM': return 'bg-purple-500 text-white';
      case 'FUNERAL': return 'bg-rose-500 text-white';
      default: return 'bg-slate-500 text-white';
    }
  };

  const getCeremonyShortLabel = (c: Ceremony) => {
    try {
      const details = JSON.parse(c.detailsJson || '{}');
      const prefix = c.type === 'MARRIAGE' ? 'Γ' : c.type === 'BAPTISM' ? 'Β' : 'Κ';
      let name = '';
      if (c.type === 'MARRIAGE') name = `${details.groomLastName || ''} - ${details.brideLastName || ''}`;
      else if (c.type === 'BAPTISM') name = details.baptizedFirstName || 'Βάπτιση';
      else name = details.deceasedLastName || 'Κηδεία';
      return `${prefix}: ${name.substring(0, 15)}`;
    } catch {
      return c.type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[var(--border)] pb-px">
        <button
          onClick={() => setActiveTab('MARRIAGE')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-bold text-sm transition-colors ${
            activeTab === 'MARRIAGE'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--foreground)]'
          }`}
        >
          <Heart className="w-4 h-4" /> Γάμοι
        </button>
        <button
          onClick={() => setActiveTab('BAPTISM')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-bold text-sm transition-colors ${
            activeTab === 'BAPTISM'
              ? 'border-purple-500 text-purple-600'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--foreground)]'
          }`}
        >
          <Baby className="w-4 h-4" /> Βαπτίσεις
        </button>
        <button
          onClick={() => setActiveTab('FUNERAL')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-bold text-sm transition-colors ${
            activeTab === 'FUNERAL'
              ? 'border-rose-500 text-rose-600'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--foreground)]'
          }`}
        >
          <Skull className="w-4 h-4" /> Κηδείες
        </button>
        <button
          onClick={() => setActiveTab('CALENDAR')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-bold text-sm transition-colors ${
            activeTab === 'CALENDAR'
              ? 'border-amber-500 text-amber-600'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--foreground)]'
          }`}
        >
          <CalendarIcon className="w-4 h-4" /> Ημερολόγιο
        </button>
      </div>

      {activeTab !== 'CALENDAR' ? (
        <div className="space-y-6">
          {/* Action Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--surface)] p-4 rounded-xl border border-[var(--border)]">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 flex-1">
              {/* Search */}
              <div className="relative col-span-1 md:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Αναζήτηση με όνομα ή Α/Α..."
                  className="pl-9 h-10 rounded-lg bg-[var(--background)] border border-[var(--border)] text-sm"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="h-10 px-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none"
              >
                <option value="ALL">Όλες οι καταστάσεις</option>
                <option value="PENDING">Σε εκκρεμότητα</option>
                <option value="COMPLETED">Ολοκληρωμένες</option>
                <option value="CANCELLED">Ακυρωμένες</option>
              </select>

              {/* Year Filter */}
              <select
                value={yearFilter}
                onChange={e => setYearFilter(e.target.value)}
                className="h-10 px-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none"
              >
                <option value="ALL">Όλα τα έτη</option>
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            {/* Create Button */}
            <Link href={`/admin/ceremonies/create?type=${activeTab}`}>
              <Button className="h-10 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 gap-2 rounded-lg w-full md:w-auto">
                <Plus className="w-4 h-4" /> Καταγραφή Τελετής
              </Button>
            </Link>
          </div>

          {/* List Cards */}
          {filteredCeremonies.length === 0 ? (
            <Card className="shadow-inner border-dashed border-2 bg-[var(--background)] text-center py-16">
              <CalendarIcon className="w-12 h-12 mx-auto text-slate-300 mb-4" />
              <p className="text-[var(--text-muted)] font-medium">Δεν βρέθηκαν τελετές.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCeremonies.map(c => {
                const { received, total, percent } = getDocProgress(c.documents);
                const colorMap = {
                  MARRIAGE: 'border-blue-200 bg-blue-50/50',
                  BAPTISM: 'border-purple-200 bg-purple-50/50',
                  FUNERAL: 'border-rose-200 bg-rose-50/50',
                };
                return (
                  <Card key={c.id} className={`shadow-sm hover:shadow-md transition-all border rounded-2xl overflow-hidden`}>
                    <CardContent className="p-5 space-y-4">
                      {/* Top Header */}
                      <div className="flex items-start justify-between">
                        <div>
                          <Badge className="bg-slate-100 dark:bg-slate-800 text-[var(--text-secondary)] font-mono border text-xs px-2 py-0.5 rounded-md">
                            {c.registryNumber || '---'}
                          </Badge>
                          {c.type === 'MARRIAGE' && (
                            <Badge className="ml-2 bg-indigo-50 border border-indigo-200 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300 text-[10px] uppercase font-bold">
                              Τάξη {c.subtype}'
                            </Badge>
                          )}
                          {c.type === 'BAPTISM' && (
                            <Badge className="ml-2 bg-indigo-50 border border-indigo-200 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300 text-[10px] uppercase font-bold">
                              {c.subtype === 'INFANT' ? 'Νήπιο' : c.subtype === 'ADULT' ? 'Ενήλικος' : 'Χρίσμα'}
                            </Badge>
                          )}
                        </div>
                        {getStatusBadge(c.status)}
                      </div>

                      {/* Participants */}
                      {getParticipants(c)}

                      {/* Date & Priest */}
                      <div className="grid grid-cols-2 gap-2 border-t border-[var(--border)] pt-3 text-xs text-[var(--text-muted)]">
                        <div className="flex items-center gap-1.5 font-medium">
                          <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(c.date).toLocaleDateString('el-GR', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                        <div className="flex items-center gap-1.5 font-medium">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          {c.priest || 'Χωρίς Ιερέα'}
                        </div>
                      </div>

                      {/* Document Progress */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-[var(--text-muted)]">Έγγραφα</span>
                          <span className="text-[var(--foreground)]">{received} / {total} ({percent}%)</span>
                        </div>
                        <Progress value={percent} className="h-1.5 bg-slate-100" />
                      </div>

                      {/* Detail Button */}
                      <Link href={`/admin/ceremonies/${c.id}`} className="block">
                        <Button variant="outline" className="w-full text-xs font-bold h-9 border-[var(--border)] hover:bg-[var(--background)] hover:text-indigo-600 rounded-lg">
                          Διαχείριση & Λεπτομέρειες
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Calendar View Tab */
        <Card className="shadow-sm border border-[var(--border)] bg-[var(--surface)] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-extrabold text-[var(--foreground)] flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-indigo-600" />
              {calendarMonths[calendarDate.getMonth()]} {calendarDate.getFullYear()}
            </h3>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" onClick={handlePrevMonth} className="h-9 w-9 rounded-lg border-[var(--border)]">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleNextMonth} className="h-9 w-9 rounded-lg border-[var(--border)]">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Weekdays */}
          <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-black tracking-widest text-[var(--text-muted)] uppercase">
            <div>Δευ</div>
            <div>Τρι</div>
            <div>Τετ</div>
            <div>Πεμ</div>
            <div>Παρ</div>
            <div>Σαβ</div>
            <div>Κυρ</div>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="h-28 bg-slate-50/30 dark:bg-slate-800/10 rounded-xl border border-transparent" />;
              }

              const dayCeremonies = getCeremoniesForDay(day);
              const isToday = new Date().toDateString() === day.toDateString();

              return (
                <div 
                  key={day.toISOString()} 
                  className={`h-28 p-2 rounded-xl border flex flex-col justify-between transition-colors ${
                    isToday 
                      ? 'border-indigo-500 bg-indigo-50/20' 
                      : 'border-[var(--border)] bg-[var(--background)] hover:bg-slate-50/50 dark:hover:bg-slate-800/20'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className={`text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ${
                      isToday ? 'bg-indigo-600 text-white' : 'text-[var(--text-muted)]'
                    }`}>
                      {day.getDate()}
                    </span>
                  </div>

                  <div className="space-y-1 overflow-y-auto max-h-[70px] scrollbar-thin">
                    {dayCeremonies.map(c => (
                      <Link key={c.id} href={`/admin/ceremonies/${c.id}`} className="block">
                        <div 
                          className={`text-[9px] font-black px-1.5 py-0.5 rounded border border-black/5 truncate cursor-pointer transition-opacity hover:opacity-80 ${getCeremonyColor(c.type)}`}
                          title={c.type}
                        >
                          {getCeremonyShortLabel(c)}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
