'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Baby, 
  Skull, 
  Search, 
  Printer, 
  ArrowRight,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar as CalendarIcon
} from 'lucide-react';

interface Ceremony {
  id: string;
  type: 'MARRIAGE' | 'BAPTISM' | 'FUNERAL';
  subtype: string;
  date: string;
  priest: string | null;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  registryNumber: string | null;
  detailsJson: string;
  sequenceNumber: number | null;
}

export default function RegistryClient({ initialCeremonies }: { initialCeremonies: Ceremony[] }) {
  const [activeTab, setActiveTab] = useState<'MARRIAGE' | 'BAPTISM' | 'FUNERAL'>('MARRIAGE');
  const [search, setSearch] = useState('');
  const [yearFilter, setYearFilter] = useState<string>(String(new Date().getFullYear()));
  const [exportLoading, setExportLoading] = useState(false);

  // Derive unique years for filter (pre-populate with current year if empty)
  const years = useMemo(() => {
    const yrs = new Set<string>([String(new Date().getFullYear())]);
    initialCeremonies.forEach(c => {
      const yr = new Date(c.date).getFullYear().toString();
      yrs.add(yr);
    });
    return Array.from(yrs).sort((a, b) => b.localeCompare(a));
  }, [initialCeremonies]);

  // Filter registry entries
  const filteredEntries = useMemo(() => {
    return initialCeremonies.filter(c => {
      // Type matching
      if (c.type !== activeTab) return false;

      // Year matching
      const yr = new Date(c.date).getFullYear().toString();
      if (yr !== yearFilter) return false;

      // Search query matching
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
  }, [initialCeremonies, activeTab, yearFilter, search]);

  // Format participant names for row display
  const getParticipantNames = (c: Ceremony) => {
    try {
      const details = JSON.parse(c.detailsJson || '{}');
      if (c.type === 'MARRIAGE') {
        return (
          <div className="space-y-0.5">
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              {details.groomLastName} {details.groomFirstName}
            </p>
            <p className="text-xs text-[var(--text-muted)] font-medium">και</p>
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              {details.brideLastName} {details.brideFirstName}
            </p>
          </div>
        );
      } else if (c.type === 'BAPTISM') {
        const name = details.baptizedFirstName ? `${details.baptizedLastName || ''} ${details.baptizedFirstName}` : 'Βρέφος / Ανώνυμο';
        return (
          <div>
            <p className="font-semibold text-slate-800 dark:text-slate-200">{name}</p>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
              Γονείς: {details.fatherFirstName} & {details.motherFirstName}
            </p>
          </div>
        );
      } else {
        return (
          <div>
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              {details.deceasedLastName} {details.deceasedFirstName}
            </p>
            {details.deceasedAge && (
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Ηλικία: {details.deceasedAge} ετών
              </p>
            )}
          </div>
        );
      }
    } catch {
      return <p className="text-sm text-rose-500">Σφάλμα ανάγνωσης στοιχείων</p>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md"><CheckCircle2 className="w-3 h-3" /> Ολοκληρώθηκε</Badge>;
      case 'CANCELLED':
        return <Badge className="bg-rose-500 hover:bg-rose-600 text-white gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md"><XCircle className="w-3 h-3" /> Ακυρώθηκε</Badge>;
      default:
        return <Badge className="bg-amber-500 hover:bg-amber-600 text-white gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md"><Clock className="w-3 h-3" /> Εκκρεμεί</Badge>;
    }
  };

  const handleExportPdf = async () => {
    setExportLoading(true);
    try {
      const query = new URLSearchParams({
        type: activeTab,
        year: yearFilter,
        search: search.trim()
      });

      window.location.href = `/api/ceremonies/export?${query.toString()}`;
    } catch (err) {
      alert('Αποτυχία λήψης του αρχείου PDF.');
    } finally {
      // Delay disabling loader slightly so download has time to trigger
      setTimeout(() => setExportLoading(false), 2000);
    }
  };

  const typeLabels = {
    MARRIAGE: 'Γάμων',
    BAPTISM: 'Βαπτίσεων',
    FUNERAL: 'Κηδειών'
  };

  return (
    <div className="space-y-6">
      {/* Type Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[var(--border)] pb-px">
        <button
          onClick={() => setActiveTab('MARRIAGE')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-bold text-sm transition-colors ${
            activeTab === 'MARRIAGE'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--foreground)]'
          }`}
        >
          <Heart className="w-4 h-4" /> Μητρώο Γάμων
        </button>
        <button
          onClick={() => setActiveTab('BAPTISM')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-bold text-sm transition-colors ${
            activeTab === 'BAPTISM'
              ? 'border-purple-500 text-purple-600'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--foreground)]'
          }`}
        >
          <Baby className="w-4 h-4" /> Μητρώο Βαπτίσεων
        </button>
        <button
          onClick={() => setActiveTab('FUNERAL')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-bold text-sm transition-colors ${
            activeTab === 'FUNERAL'
              ? 'border-rose-500 text-rose-600'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--foreground)]'
          }`}
        >
          <Skull className="w-4 h-4" /> Μητρώο Κηδειών
        </button>
      </div>

      {/* Filter and Print Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--surface)] p-4 rounded-xl border border-[var(--border)]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1">
          {/* Search */}
          <div className="relative col-span-1 md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Αναζήτηση στο μητρώο (όνομα, ιερέα, Α/Α)..."
              className="pl-9 h-10 rounded-lg bg-[var(--background)] border border-[var(--border)] text-sm"
            />
          </div>

          {/* Year Filter */}
          <select
            value={yearFilter}
            onChange={e => setYearFilter(e.target.value)}
            className="h-10 px-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:border-indigo-500 font-bold text-indigo-700 dark:text-indigo-400"
          >
            {years.map(y => (
              <option key={y} value={y}>Έτος {y}</option>
            ))}
          </select>
        </div>

        {/* Export Button */}
        <Button
          onClick={handleExportPdf}
          disabled={exportLoading}
          className="h-10 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 gap-2 rounded-lg w-full md:w-auto text-xs"
        >
          <Printer className="w-4 h-4" /> 
          {exportLoading ? 'Εξαγωγή...' : `Εξαγωγή Βιβλίου ${typeLabels[activeTab]}`}
        </Button>
      </div>

      {/* Registry Table */}
      <Card className="border border-[var(--border)] bg-[var(--surface)] shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/40 border-b border-[var(--border)]">
                  <th className="p-4 text-xs font-black uppercase tracking-wider text-[var(--text-muted)] w-36">Α/Α Μητρώου</th>
                  <th className="p-4 text-xs font-black uppercase tracking-wider text-[var(--text-muted)]">Στοιχεία Τελετής</th>
                  <th className="p-4 text-xs font-black uppercase tracking-wider text-[var(--text-muted)] w-48">Ημερομηνία Τέλεσης</th>
                  <th className="p-4 text-xs font-black uppercase tracking-wider text-[var(--text-muted)] w-48">Ιερέας</th>
                  <th className="p-4 text-xs font-black uppercase tracking-wider text-[var(--text-muted)] w-32">Κατάσταση</th>
                  <th className="p-4 text-xs font-black uppercase tracking-wider text-[var(--text-muted)] w-28 text-center">Ενέργειες</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] text-sm">
                {filteredEntries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-[var(--text-muted)] font-medium">
                      Δεν βρέθηκαν καταχωρήσεις στο μητρώο για το έτος {yearFilter}.
                    </td>
                  </tr>
                ) : (
                  filteredEntries.map(entry => (
                    <tr key={entry.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                      <td className="p-4 font-mono font-bold text-xs text-[var(--foreground)]">
                        {entry.registryNumber ? (
                          <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 px-2 py-0.5 rounded">
                            {entry.registryNumber}
                          </span>
                        ) : (
                          <span className="text-[var(--text-muted)] italic">Εκκρεμεί οριστικοποίηση</span>
                        )}
                      </td>
                      <td className="p-4">
                        {getParticipantNames(entry)}
                      </td>
                      <td className="p-4 font-medium text-[var(--text-secondary)]">
                        <div className="flex items-center gap-1.5">
                          <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(entry.date).toLocaleDateString('el-GR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </td>
                      <td className="p-4 font-medium text-[var(--text-secondary)]">
                        {entry.priest || '---'}
                      </td>
                      <td className="p-4">
                        {getStatusBadge(entry.status)}
                      </td>
                      <td className="p-4 text-center">
                        <Link href={`/admin/ceremonies/${entry.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md" title="Προβολή & Διαχείριση">
                            <ArrowRight className="w-4 h-4 text-indigo-600" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
