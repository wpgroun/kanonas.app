'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Heart, 
  Baby, 
  Skull, 
  ArrowLeft, 
  Edit2, 
  Check, 
  X, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Calendar as CalendarIcon, 
  User, 
  AlertCircle,
  HelpCircle,
  AlertTriangle
} from 'lucide-react';
import { calculateMarriageClass } from '@/lib/ceremonies';

interface Document {
  id: string;
  name: string;
  status: 'PENDING' | 'RECEIVED' | 'NOT_REQUIRED';
  rejectionReason: string | null;
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

interface Priest {
  id: string;
  name: string;
}

export default function CeremonyDetailsClient({ 
  initialCeremony, 
  priests 
}: { 
  initialCeremony: Ceremony; 
  priests: Priest[];
}) {
  const router = useRouter();
  const [ceremony, setCeremony] = useState<Ceremony>(initialCeremony);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Editing states
  const [editDate, setEditDate] = useState<string>(
    new Date(ceremony.date).toISOString().substring(0, 16)
  );
  const [editPriest, setEditPriest] = useState<string>(ceremony.priest || '');

  // Form Details states
  const parsedDetails = useMemo(() => {
    try {
      return JSON.parse(ceremony.detailsJson || '{}');
    } catch {
      return {};
    }
  }, [ceremony.detailsJson]);

  // Marriage editing state
  const [marriageDetails, setMarriageDetails] = useState({
    groomFirstName: parsedDetails.groomFirstName || '',
    groomLastName: parsedDetails.groomLastName || '',
    groomFathersName: parsedDetails.groomFathersName || '',
    groomMothersName: parsedDetails.groomMothersName || '',
    groomPreviousMarriages: parsedDetails.groomPreviousMarriages || 0,
    groomIsWidowed: parsedDetails.groomIsWidowed || false,
    brideFirstName: parsedDetails.brideFirstName || '',
    brideLastName: parsedDetails.brideLastName || '',
    brideFathersName: parsedDetails.brideFathersName || '',
    brideMothersName: parsedDetails.brideMothersName || '',
    bridePreviousMarriages: parsedDetails.bridePreviousMarriages || 0,
    brideIsWidowed: parsedDetails.brideIsWidowed || false,
    koumbarosFirstName: parsedDetails.koumbarosFirstName || '',
    koumbarosLastName: parsedDetails.koumbarosLastName || '',
  });

  // Baptism editing state
  const [baptismDetails, setBaptismDetails] = useState({
    baptizedFirstName: parsedDetails.baptizedFirstName || '',
    baptizedLastName: parsedDetails.baptizedLastName || '',
    baptizedDateOfBirth: parsedDetails.baptizedDateOfBirth || '',
    fatherFirstName: parsedDetails.fatherFirstName || '',
    fatherLastName: parsedDetails.fatherLastName || '',
    motherFirstName: parsedDetails.motherFirstName || '',
    motherLastName: parsedDetails.motherLastName || '',
    motherMaidenName: parsedDetails.motherMaidenName || '',
    sponsorFirstName: parsedDetails.sponsorFirstName || '',
    sponsorLastName: parsedDetails.sponsorLastName || '',
    sponsorIsOrthodox: parsedDetails.sponsorIsOrthodox !== false,
  });

  // Funeral editing state
  const [funeralDetails, setFuneralDetails] = useState({
    deceasedFirstName: parsedDetails.deceasedFirstName || '',
    deceasedLastName: parsedDetails.deceasedLastName || '',
    deceasedDateOfDeath: parsedDetails.deceasedDateOfDeath || '',
    deceasedAge: parsedDetails.deceasedAge || '',
    relativeFirstName: parsedDetails.relativeFirstName || '',
    relativeLastName: parsedDetails.relativeLastName || '',
    relativeRelationship: parsedDetails.relativeRelationship || '',
  });

  // Document Rejection Reason Modal
  const [activeDocForReason, setActiveDocForReason] = useState<Document | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [reasonError, setReasonError] = useState('');

  // Calculations
  const progress = useMemo(() => {
    if (ceremony.documents.length === 0) return { received: 0, total: 0, percent: 0 };
    const total = ceremony.documents.length;
    const received = ceremony.documents.filter(d => d.status === 'RECEIVED' || d.status === 'NOT_REQUIRED').length;
    const percent = Math.round((received / total) * 100);
    return { received, total, percent };
  }, [ceremony.documents]);

  const allDocumentsCompleted = progress.received === progress.total;

  const handleUpdateDetails = async () => {
    setLoading(true);
    setErrors({});

    let details: any = {};
    if (ceremony.type === 'MARRIAGE') {
      details = {
        ...marriageDetails,
        groomPreviousMarriages: Number(marriageDetails.groomPreviousMarriages),
        bridePreviousMarriages: Number(marriageDetails.bridePreviousMarriages),
      };
    } else if (ceremony.type === 'BAPTISM') {
      details = baptismDetails;
    } else {
      details = {
        ...funeralDetails,
        deceasedAge: funeralDetails.deceasedAge ? Number(funeralDetails.deceasedAge) : undefined,
      };
    }

    try {
      const response = await fetch(`/api/ceremonies/${ceremony.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: editDate,
          priest: editPriest || null,
          status: ceremony.status,
          details,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          const formatted: Record<string, string> = {};
          data.errors.forEach((e: any) => {
            if (e.path && e.path.length > 0) formatted[e.path[0]] = e.message;
          });
          setErrors(formatted);
        } else {
          setErrors({ global: data.error || 'Αποτυχία ενημέρωσης στοιχείων.' });
        }
        setLoading(false);
        return;
      }

      setCeremony(data);
      setIsEditing(false);
      router.refresh();
    } catch (err) {
      setErrors({ global: 'Σφάλμα επικοινωνίας με το διακομιστή.' });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (doc: Document, newStatus: 'PENDING' | 'RECEIVED' | 'NOT_REQUIRED') => {
    if (newStatus === 'NOT_REQUIRED') {
      // Open modal for justification
      setActiveDocForReason(doc);
      setRejectionReasonInput(doc.rejectionReason || '');
      setReasonError('');
      return;
    }

    try {
      const response = await fetch(`/api/ceremonies/documents/${doc.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          rejectionReason: null,
        }),
      });

      if (!response.ok) {
        alert('Σφάλμα κατά την ενημέρωση της κατάστασης του εγγράφου.');
        return;
      }

      const updatedDoc = await response.json();
      setCeremony(prev => ({
        ...prev,
        documents: prev.documents.map(d => d.id === doc.id ? updatedDoc : d),
      }));
    } catch (err) {
      alert('Σφάλμα επικοινωνίας με το διακομιστή.');
    }
  };

  const handleSubmitRejectionReason = async () => {
    if (!activeDocForReason) return;
    if (!rejectionReasonInput.trim()) {
      setReasonError('Η αιτιολογία είναι υποχρεωτική.');
      return;
    }

    try {
      const response = await fetch(`/api/ceremonies/documents/${activeDocForReason.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'NOT_REQUIRED',
          rejectionReason: rejectionReasonInput.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setReasonError(data.error || 'Σφάλμα κατά την ενημέρωση.');
        return;
      }

      setCeremony(prev => ({
        ...prev,
        documents: prev.documents.map(d => d.id === activeDocForReason.id ? data : d),
      }));
      setActiveDocForReason(null);
    } catch (err) {
      setReasonError('Σφάλμα επικοινωνίας με το διακομιστή.');
    }
  };

  const handleCeremonyStatusTransition = async (newStatus: 'COMPLETED' | 'CANCELLED') => {
    if (newStatus === 'COMPLETED' && !allDocumentsCompleted) {
      alert('Δεν μπορείτε να ολοκληρώσετε την τελετή αν εκκρεμούν δικαιολογητικά.');
      return;
    }

    const confirmMsg = newStatus === 'COMPLETED' 
      ? 'Είστε σίγουροι ότι θέλετε να ΟΛΟΚΛΗΡΩΣΕΤΕ την τελετή; Αυτή η ενέργεια θα εκδώσει Αύξοντα Αριθμό Μητρώου και θα οριστικοποιήσει την τελετή.'
      : 'Είστε σίγουροι ότι θέλετε να ΑΚΥΡΩΣΕΤΕ την τελετή;';
    
    if (!window.confirm(confirmMsg)) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/ceremonies/${ceremony.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: ceremony.date,
          priest: ceremony.priest,
          status: newStatus,
          details: parsedDetails,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Αποτυχία αλλαγής κατάστασης τελετής.');
        setActionLoading(false);
        return;
      }

      setCeremony(data);
      router.refresh();
    } catch (err) {
      alert('Σφάλμα επικοινωνίας με το διακομιστή.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCeremony = async () => {
    if (!window.confirm('ΠΡΟΣΟΧΗ: Είστε σίγουροι ότι θέλετε να ΔΙΑΓΡΑΨΕΤΕ οριστικά αυτή την τελετή και όλα τα δικαιολογητικά της; Αυτή η ενέργεια δεν αναιρείται.')) {
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch(`/api/ceremonies/${ceremony.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || 'Αποτυχία διαγραφής τελετής.');
        setActionLoading(false);
        return;
      }

      router.push('/admin/ceremonies');
      router.refresh();
    } catch (err) {
      alert('Σφάλμα επικοινωνίας με το διακομιστή.');
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white gap-1 py-1 px-3 rounded-full text-xs font-bold"><CheckCircle2 className="w-3.5 h-3.5" /> Ολοκληρώθηκε</Badge>;
      case 'CANCELLED':
        return <Badge className="bg-rose-500 hover:bg-rose-600 text-white gap-1 py-1 px-3 rounded-full text-xs font-bold"><XCircle className="w-3.5 h-3.5" /> Ακυρώθηκε</Badge>;
      default:
        return <Badge className="bg-amber-500 hover:bg-amber-600 text-white gap-1 py-1 px-3 rounded-full text-xs font-bold"><Clock className="w-3.5 h-3.5" /> Σε εκκρεμότητα</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
        <Link href="/admin/ceremonies">
          <Button variant="outline" className="h-9 px-4 text-xs font-bold gap-2 border-[var(--border)] rounded-lg hover:bg-[var(--background)]">
            <ArrowLeft className="w-4 h-4" /> Επιστροφή στις Τελετές
          </Button>
        </Link>

        <div className="flex items-center gap-2">
          {ceremony.status === 'PENDING' && (
            <>
              <Button
                onClick={() => handleCeremonyStatusTransition('COMPLETED')}
                disabled={!allDocumentsCompleted || actionLoading}
                className={`h-9 px-4 text-xs font-bold gap-1.5 rounded-lg ${
                  allDocumentsCompleted 
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                    : 'bg-slate-100 dark:bg-slate-800 text-[var(--text-muted)] cursor-not-allowed'
                }`}
                title={!allDocumentsCompleted ? 'Πρέπει να παραληφθούν όλα τα έγγραφα για να ολοκληρωθεί η τελετή' : ''}
              >
                <CheckCircle2 className="w-4 h-4" /> Ολοκλήρωση Τελετής
              </Button>
              <Button
                variant="outline"
                onClick={() => handleCeremonyStatusTransition('CANCELLED')}
                disabled={actionLoading}
                className="h-9 px-4 text-xs font-bold border-rose-200 dark:border-rose-950 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg"
              >
                <XCircle className="w-4 h-4" /> Ακύρωση
              </Button>
            </>
          )}

          <Button
            variant="outline"
            onClick={handleDeleteCeremony}
            disabled={actionLoading}
            className="h-9 w-9 p-0 border-rose-200 dark:border-rose-950 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg"
            title="Οριστική Διαγραφή"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {errors.global && (
        <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 dark:bg-rose-950/20 dark:border-rose-900 text-rose-600 p-4 rounded-xl text-sm font-medium">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errors.global}</span>
        </div>
      )}

      {/* Main Grid: Details vs Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Ceremony Details */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border border-[var(--border)] bg-[var(--surface)] shadow-sm rounded-2xl overflow-hidden">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 border-b border-[var(--border)] flex items-center justify-between">
              <h3 className="text-sm font-black text-[var(--foreground)] flex items-center gap-2">
                {ceremony.type === 'MARRIAGE' && <Heart className="w-4 h-4 text-blue-500" />}
                {ceremony.type === 'BAPTISM' && <Baby className="w-4 h-4 text-purple-500" />}
                {ceremony.type === 'FUNERAL' && <Skull className="w-4 h-4 text-rose-500" />}
                Στοιχεία Τελετής
              </h3>
              <div className="flex items-center gap-2">
                {getStatusBadge(ceremony.status)}
                {ceremony.status === 'PENDING' && !isEditing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="h-7 px-2.5 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 gap-1 rounded-md"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Επεξεργασία
                  </Button>
                )}
              </div>
            </div>

            <CardContent className="p-5 space-y-5">
              {!isEditing ? (
                // View Mode
                <div className="space-y-4 text-sm">
                  {/* Registry Booklet Badge if set */}
                  {ceremony.registryNumber && (
                    <div className="bg-indigo-50 border border-indigo-100 dark:bg-indigo-950/20 dark:border-indigo-900 p-3.5 rounded-xl flex items-center justify-between text-xs font-bold text-indigo-700 dark:text-indigo-400">
                      <span>Αριθμός Μητρώου:</span>
                      <span className="font-mono text-sm font-black bg-indigo-600 text-white px-2.5 py-0.5 rounded">
                        {ceremony.registryNumber}
                      </span>
                    </div>
                  )}

                  <div className="space-y-3">
                    <p className="font-medium text-[var(--foreground)] flex items-center gap-2">
                      <span className="text-[var(--text-muted)] w-28">Τύπος:</span> 
                      <span>
                        {ceremony.type === 'MARRIAGE' ? 'Γάμος' : ceremony.type === 'BAPTISM' ? 'Βάπτιση' : 'Κηδεία'} 
                        {ceremony.type === 'MARRIAGE' && ` (${ceremony.subtype}' Τάξη)`}
                        {ceremony.type === 'BAPTISM' && ` (${ceremony.subtype === 'INFANT' ? 'Νήπιο' : ceremony.subtype === 'ADULT' ? 'Ενήλικος' : 'Χρίσμα'})`}
                      </span>
                    </p>
                    <p className="font-medium text-[var(--foreground)] flex items-center gap-2">
                      <span className="text-[var(--text-muted)] w-28 flex items-center gap-1">
                        <CalendarIcon className="w-3.5 h-3.5 text-slate-400" /> Ημερομηνία:
                      </span>
                      <span>
                        {new Date(ceremony.date).toLocaleString('el-GR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </p>
                    <p className="font-medium text-[var(--foreground)] flex items-center gap-2">
                      <span className="text-[var(--text-muted)] w-28 flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" /> Ιερέας:
                      </span>
                      <span>{ceremony.priest || 'Χωρίς Ιερέα (Εκκρεμεί)'}</span>
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[var(--border)] space-y-4">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-[var(--text-muted)]">Συμμετέχοντες & Λεπτομέρειες</h4>
                    
                    {ceremony.type === 'MARRIAGE' && (
                      <div className="space-y-4">
                        <div className="bg-blue-50/20 dark:bg-blue-950/10 p-3 rounded-xl border border-blue-100/50">
                          <p className="font-bold text-xs text-blue-600 mb-1">Γαμπρός</p>
                          <p className="font-semibold">{marriageDetails.groomLastName} {marriageDetails.groomFirstName}</p>
                          <p className="text-xs text-[var(--text-muted)] mt-0.5">
                            Γονείς: {marriageDetails.groomFathersName || '--'} & {marriageDetails.groomMothersName || '--'}
                          </p>
                          <p className="text-xs font-medium text-[var(--text-muted)]">
                            Γάμος: {marriageDetails.groomPreviousMarriages + 1}ος {marriageDetails.groomIsWidowed && '(Σε Χηρεία)'}
                          </p>
                        </div>

                        <div className="bg-rose-50/20 dark:bg-rose-950/10 p-3 rounded-xl border border-rose-100/50">
                          <p className="font-bold text-xs text-rose-600 mb-1">Νύφη</p>
                          <p className="font-semibold">{marriageDetails.brideLastName} {marriageDetails.brideFirstName}</p>
                          <p className="text-xs text-[var(--text-muted)] mt-0.5">
                            Γονείς: {marriageDetails.brideFathersName || '--'} & {marriageDetails.brideMothersName || '--'}
                          </p>
                          <p className="text-xs font-medium text-[var(--text-muted)]">
                            Γάμος: {marriageDetails.bridePreviousMarriages + 1}ος {marriageDetails.brideIsWidowed && '(Σε Χηρεία)'}
                          </p>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-[var(--border)]">
                          <p className="font-bold text-xs text-slate-500 mb-1">Κουμπάρος</p>
                          <p className="font-semibold">
                            {marriageDetails.koumbarosFirstName || marriageDetails.koumbarosLastName 
                              ? `${marriageDetails.koumbarosLastName} ${marriageDetails.koumbarosFirstName}`
                              : 'Δεν έχει καταχωρηθεί'
                            }
                          </p>
                        </div>
                      </div>
                    )}

                    {ceremony.type === 'BAPTISM' && (
                      <div className="space-y-4">
                        <div className="bg-purple-50/20 dark:bg-purple-950/10 p-3 rounded-xl border border-purple-100/50">
                          <p className="font-bold text-xs text-purple-600 mb-1">Βαπτιζόμενος</p>
                          <p className="font-semibold">
                            {baptismDetails.baptizedFirstName || baptismDetails.baptizedLastName
                              ? `${baptismDetails.baptizedLastName} ${baptismDetails.baptizedFirstName || 'Βρέφος'}`
                              : 'Βρέφος (Ανώνυμο)'
                            }
                          </p>
                          {baptismDetails.baptizedDateOfBirth && (
                            <p className="text-xs text-[var(--text-muted)] mt-0.5">
                              Ημ. Γέννησης: {new Date(baptismDetails.baptizedDateOfBirth).toLocaleDateString('el-GR')}
                            </p>
                          )}
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-[var(--border)]">
                          <p className="font-bold text-xs text-slate-500 mb-1">Γονείς</p>
                          <p className="font-semibold">Πατέρας: {baptismDetails.fatherLastName} {baptismDetails.fatherFirstName}</p>
                          <p className="font-semibold">Μητέρα: {baptismDetails.motherLastName} {baptismDetails.motherFirstName} {baptismDetails.motherMaidenName && `(το γένος ${baptismDetails.motherMaidenName})`}</p>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-[var(--border)]">
                          <p className="font-bold text-xs text-slate-500 mb-1">Ανάδοχος (Νονός)</p>
                          <p className="font-semibold">
                            {baptismDetails.sponsorFirstName || baptismDetails.sponsorLastName 
                              ? `${baptismDetails.sponsorLastName} ${baptismDetails.sponsorFirstName}`
                              : 'Δεν έχει οριστεί'
                            }
                          </p>
                          <p className="text-xs text-[var(--text-muted)] font-medium">
                            {baptismDetails.sponsorIsOrthodox ? 'Ορθόδοξος' : 'Μη Ορθόδοξος'}
                          </p>
                        </div>
                      </div>
                    )}

                    {ceremony.type === 'FUNERAL' && (
                      <div className="space-y-4">
                        <div className="bg-rose-50/20 dark:bg-rose-950/10 p-3 rounded-xl border border-rose-100/50">
                          <p className="font-bold text-xs text-rose-600 mb-1">Αποβιώσας</p>
                          <p className="font-semibold">{funeralDetails.deceasedLastName} {funeralDetails.deceasedFirstName}</p>
                          <p className="text-xs text-[var(--text-muted)] mt-0.5">
                            Ηλικία: {funeralDetails.deceasedAge ? `${funeralDetails.deceasedAge} ετών` : 'Μη διαθέσιμη'}
                          </p>
                          {funeralDetails.deceasedDateOfDeath && (
                            <p className="text-xs text-[var(--text-muted)]">
                              Ημ. Θανάτου: {new Date(funeralDetails.deceasedDateOfDeath).toLocaleDateString('el-GR')}
                            </p>
                          )}
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-[var(--border)]">
                          <p className="font-bold text-xs text-slate-500 mb-1">Πλησιέστερος Συγγενής</p>
                          <p className="font-semibold">{funeralDetails.relativeLastName} {funeralDetails.relativeFirstName}</p>
                          <p className="text-xs text-[var(--text-muted)] mt-0.5">
                            Σχέση Συγγένειας: {funeralDetails.relativeRelationship}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // Edit Mode
                <div className="space-y-5 text-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold flex items-center gap-1">
                        <CalendarIcon className="w-3.5 h-3.5 text-slate-400" /> Ημερομηνία & Ώρα
                      </Label>
                      <Input
                        type="datetime-local"
                        value={editDate}
                        onChange={e => setEditDate(e.target.value)}
                        className={`h-9 border ${errors.date ? 'border-rose-500' : 'border-[var(--border)]'}`}
                      />
                      {errors.date && <p className="text-xs text-rose-500">{errors.date}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" /> Ιερέας
                      </Label>
                      <input
                        list="edit-priests-list"
                        type="text"
                        value={editPriest}
                        onChange={e => setEditPriest(e.target.value)}
                        className="w-full h-9 px-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:border-indigo-500"
                        placeholder="Επιλέξτε ή πληκτρολογήστε..."
                      />
                      <datalist id="edit-priests-list">
                        {priests.map(p => (
                          <option key={p.id} value={p.name} />
                        ))}
                      </datalist>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[var(--border)] space-y-4">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-[var(--text-muted)]">Στοιχεία Συμμετεχόντων</h4>

                    {ceremony.type === 'MARRIAGE' && (
                      <div className="space-y-4">
                        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border rounded-xl space-y-3">
                          <p className="text-xs font-bold text-blue-600">Γαμπρός</p>
                          <div className="grid grid-cols-2 gap-2">
                            <Input placeholder="Όνομα" value={marriageDetails.groomFirstName} onChange={e => setMarriageDetails(prev => ({ ...prev, groomFirstName: e.target.value }))} className="h-8 text-xs" />
                            <Input placeholder="Επώνυμο" value={marriageDetails.groomLastName} onChange={e => setMarriageDetails(prev => ({ ...prev, groomLastName: e.target.value }))} className="h-8 text-xs" />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Input placeholder="Πατρώνυμο" value={marriageDetails.groomFathersName} onChange={e => setMarriageDetails(prev => ({ ...prev, groomFathersName: e.target.value }))} className="h-8 text-xs" />
                            <Input placeholder="Μητρώνυμο" value={marriageDetails.groomMothersName} onChange={e => setMarriageDetails(prev => ({ ...prev, groomMothersName: e.target.value }))} className="h-8 text-xs" />
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-medium text-[var(--text-muted)]">Προηγούμενοι Γάμοι:</span>
                            <Input type="number" min="0" value={marriageDetails.groomPreviousMarriages} onChange={e => setMarriageDetails(prev => ({ ...prev, groomPreviousMarriages: Math.max(0, parseInt(e.target.value) || 0) }))} className="h-8 w-20 text-xs text-center" />
                          </div>
                          {marriageDetails.groomPreviousMarriages > 0 && (
                            <div className="flex items-center gap-2">
                              <Checkbox id="edit-groomIsWidowed" checked={marriageDetails.groomIsWidowed} onCheckedChange={c => setMarriageDetails(prev => ({ ...prev, groomIsWidowed: !!c }))} />
                              <label htmlFor="edit-groomIsWidowed" className="text-[10px] font-bold cursor-pointer text-[var(--foreground)]">Λόγω χηρείας</label>
                            </div>
                          )}
                        </div>

                        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border rounded-xl space-y-3">
                          <p className="text-xs font-bold text-rose-500">Νύφη</p>
                          <div className="grid grid-cols-2 gap-2">
                            <Input placeholder="Όνομα" value={marriageDetails.brideFirstName} onChange={e => setMarriageDetails(prev => ({ ...prev, brideFirstName: e.target.value }))} className="h-8 text-xs" />
                            <Input placeholder="Επώνυμο" value={marriageDetails.brideLastName} onChange={e => setMarriageDetails(prev => ({ ...prev, brideLastName: e.target.value }))} className="h-8 text-xs" />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Input placeholder="Πατρώνυμο" value={marriageDetails.brideFathersName} onChange={e => setMarriageDetails(prev => ({ ...prev, brideFathersName: e.target.value }))} className="h-8 text-xs" />
                            <Input placeholder="Μητρώνυμο" value={marriageDetails.brideMothersName} onChange={e => setMarriageDetails(prev => ({ ...prev, brideMothersName: e.target.value }))} className="h-8 text-xs" />
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-medium text-[var(--text-muted)]">Προηγούμενοι Γάμοι:</span>
                            <Input type="number" min="0" value={marriageDetails.bridePreviousMarriages} onChange={e => setMarriageDetails(prev => ({ ...prev, bridePreviousMarriages: Math.max(0, parseInt(e.target.value) || 0) }))} className="h-8 w-20 text-xs text-center" />
                          </div>
                          {marriageDetails.bridePreviousMarriages > 0 && (
                            <div className="flex items-center gap-2">
                              <Checkbox id="edit-brideIsWidowed" checked={marriageDetails.brideIsWidowed} onCheckedChange={c => setMarriageDetails(prev => ({ ...prev, brideIsWidowed: !!c }))} />
                              <label htmlFor="edit-brideIsWidowed" className="text-[10px] font-bold cursor-pointer text-[var(--foreground)]">Λόγω χηρείας</label>
                            </div>
                          )}
                        </div>

                        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border rounded-xl space-y-2">
                          <p className="text-xs font-bold text-slate-500">Κουμπάρος</p>
                          <div className="grid grid-cols-2 gap-2">
                            <Input placeholder="Όνομα" value={marriageDetails.koumbarosFirstName} onChange={e => setMarriageDetails(prev => ({ ...prev, koumbarosFirstName: e.target.value }))} className="h-8 text-xs" />
                            <Input placeholder="Επώνυμο" value={marriageDetails.koumbarosLastName} onChange={e => setMarriageDetails(prev => ({ ...prev, koumbarosLastName: e.target.value }))} className="h-8 text-xs" />
                          </div>
                        </div>

                        {/* Marriage class warning */}
                        <div className="p-3.5 bg-amber-50 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-900 rounded-xl text-[11px] leading-relaxed text-amber-800 dark:text-amber-300">
                          <div className="flex items-start gap-1.5 font-bold mb-1">
                            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                            <span>ΠΡΟΣΟΧΗ ΣΤΗΝ ΑΛΛΑΓΗ ΓΑΜΩΝ:</span>
                          </div>
                          Εάν αλλάξετε τον αριθμό προηγούμενων γάμων, η τάξη του γάμου θα επανυπολογιστεί και η λίστα δικαιολογητικών θα ενημερωθεί αυτόματα (τυχόν νέα έγγραφα θα προστεθούν, ενώ έγγραφα που δεν απαιτούνται πλέον θα διαγραφούν).
                        </div>
                      </div>
                    )}

                    {ceremony.type === 'BAPTISM' && (
                      <div className="space-y-4">
                        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border rounded-xl space-y-2">
                          <p className="text-xs font-bold text-purple-600">Βαπτιζόμενος</p>
                          <div className="grid grid-cols-2 gap-2">
                            <Input placeholder="Όνομα" value={baptismDetails.baptizedFirstName} onChange={e => setBaptismDetails(prev => ({ ...prev, baptizedFirstName: e.target.value }))} className="h-8 text-xs" />
                            <Input placeholder="Επώνυμο" value={baptismDetails.baptizedLastName} onChange={e => setBaptismDetails(prev => ({ ...prev, baptizedLastName: e.target.value }))} className="h-8 text-xs" />
                          </div>
                          <Input type="date" value={baptismDetails.baptizedDateOfBirth} onChange={e => setBaptismDetails(prev => ({ ...prev, baptizedDateOfBirth: e.target.value }))} className="h-8 text-xs" />
                        </div>

                        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border rounded-xl space-y-2">
                          <p className="text-xs font-bold text-slate-500">Γονείς</p>
                          <div className="grid grid-cols-2 gap-2">
                            <Input placeholder="Όνομα Πατέρα" value={baptismDetails.fatherFirstName} onChange={e => setBaptismDetails(prev => ({ ...prev, fatherFirstName: e.target.value }))} className="h-8 text-xs" />
                            <Input placeholder="Επώνυμο Πατέρα" value={baptismDetails.fatherLastName} onChange={e => setBaptismDetails(prev => ({ ...prev, fatherLastName: e.target.value }))} className="h-8 text-xs" />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Input placeholder="Όνομα Μητέρας" value={baptismDetails.motherFirstName} onChange={e => setBaptismDetails(prev => ({ ...prev, motherFirstName: e.target.value }))} className="h-8 text-xs" />
                            <Input placeholder="Επώνυμο Μητέρας" value={baptismDetails.motherLastName} onChange={e => setBaptismDetails(prev => ({ ...prev, motherLastName: e.target.value }))} className="h-8 text-xs" />
                          </div>
                          <Input placeholder="Πατρικό Επώνυμο Μητέρας" value={baptismDetails.motherMaidenName} onChange={e => setBaptismDetails(prev => ({ ...prev, motherMaidenName: e.target.value }))} className="h-8 text-xs" />
                        </div>

                        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border rounded-xl space-y-2">
                          <p className="text-xs font-bold text-slate-500">Ανάδοχος</p>
                          <div className="grid grid-cols-2 gap-2">
                            <Input placeholder="Όνομα" value={baptismDetails.sponsorFirstName} onChange={e => setBaptismDetails(prev => ({ ...prev, sponsorFirstName: e.target.value }))} className="h-8 text-xs" />
                            <Input placeholder="Επώνυμο" value={baptismDetails.sponsorLastName} onChange={e => setBaptismDetails(prev => ({ ...prev, sponsorLastName: e.target.value }))} className="h-8 text-xs" />
                          </div>
                          <div className="flex items-center gap-2 pt-1">
                            <Checkbox id="edit-sponsorIsOrthodox" checked={baptismDetails.sponsorIsOrthodox} onCheckedChange={c => setBaptismDetails(prev => ({ ...prev, sponsorIsOrthodox: !!c }))} />
                            <label htmlFor="edit-sponsorIsOrthodox" className="text-[10px] font-bold cursor-pointer text-[var(--foreground)]">Είναι Ορθόδοξος</label>
                          </div>
                        </div>
                      </div>
                    )}

                    {ceremony.type === 'FUNERAL' && (
                      <div className="space-y-4">
                        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border rounded-xl space-y-2">
                          <p className="text-xs font-bold text-rose-500">Αποβιώσας</p>
                          <div className="grid grid-cols-2 gap-2">
                            <Input placeholder="Όνομα" value={funeralDetails.deceasedFirstName} onChange={e => setFuneralDetails(prev => ({ ...prev, deceasedFirstName: e.target.value }))} className="h-8 text-xs" />
                            <Input placeholder="Επώνυμο" value={funeralDetails.deceasedLastName} onChange={e => setFuneralDetails(prev => ({ ...prev, deceasedLastName: e.target.value }))} className="h-8 text-xs" />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Input type="date" value={funeralDetails.deceasedDateOfDeath} onChange={e => setFuneralDetails(prev => ({ ...prev, deceasedDateOfDeath: e.target.value }))} className="h-8 text-xs" />
                            <Input placeholder="Ηλικία" type="number" min="0" value={funeralDetails.deceasedAge} onChange={e => setFuneralDetails(prev => ({ ...prev, deceasedAge: e.target.value }))} className="h-8 text-xs" />
                          </div>
                        </div>

                        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border rounded-xl space-y-2">
                          <p className="text-xs font-bold text-slate-500">Πλησιέστερος Συγγενής</p>
                          <div className="grid grid-cols-2 gap-2">
                            <Input placeholder="Όνομα" value={funeralDetails.relativeFirstName} onChange={e => setFuneralDetails(prev => ({ ...prev, relativeFirstName: e.target.value }))} className="h-8 text-xs" />
                            <Input placeholder="Επώνυμο" value={funeralDetails.relativeLastName} onChange={e => setFuneralDetails(prev => ({ ...prev, relativeLastName: e.target.value }))} className="h-8 text-xs" />
                          </div>
                          <Input placeholder="Σχέση Συγγένειας" value={funeralDetails.relativeRelationship} onChange={e => setFuneralDetails(prev => ({ ...prev, relativeRelationship: e.target.value }))} className="h-8 text-xs" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 justify-end pt-3 border-t border-[var(--border)]">
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      disabled={loading}
                      className="h-8 text-xs font-bold px-3 border-[var(--border)] rounded-md hover:bg-[var(--background)]"
                    >
                      Ακύρωση
                    </Button>
                    <Button
                      onClick={handleUpdateDetails}
                      disabled={loading}
                      className="h-8 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 rounded-md"
                    >
                      {loading ? 'Αποθήκευση...' : 'Αποθήκευση'}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Documents Checklist tracker */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border border-[var(--border)] bg-[var(--surface)] shadow-sm rounded-2xl overflow-hidden">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 border-b border-[var(--border)] space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-[var(--foreground)]">Έλεγχος Δικαιολογητικών</h3>
                <span className="text-xs font-black text-[var(--foreground)]">
                  {progress.received} / {progress.total} Παραλήφθηκαν
                </span>
              </div>
              <div className="space-y-1">
                <Progress value={progress.percent} className="h-2 bg-slate-100" />
                <div className="flex justify-between text-[10px] text-[var(--text-muted)] font-medium">
                  <span>Έναρξη</span>
                  <span>{progress.percent}% Ολοκληρώθηκε</span>
                </div>
              </div>
            </div>

            <CardContent className="p-0">
              <div className="divide-y divide-[var(--border)]">
                {ceremony.documents.map((doc) => {
                  return (
                    <div key={doc.id} className="p-4 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-0.5">
                          <span className="text-sm font-bold text-[var(--foreground)]">{doc.name}</span>
                          {doc.status === 'NOT_REQUIRED' && doc.rejectionReason && (
                            <p className="text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900 rounded px-2 py-1 italic">
                              Αιτιολογία: {doc.rejectionReason}
                            </p>
                          )}
                        </div>

                        {/* Status selection buttons */}
                        <div className="flex items-center bg-slate-50 dark:bg-slate-850 p-0.5 rounded-lg border border-[var(--border)] self-start sm:self-auto">
                          <button
                            onClick={() => handleStatusChange(doc, 'PENDING')}
                            disabled={ceremony.status !== 'PENDING'}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                              doc.status === 'PENDING'
                                ? 'bg-amber-500 text-white shadow-sm'
                                : 'text-[var(--text-muted)] hover:text-[var(--foreground)] disabled:opacity-50'
                            }`}
                          >
                            Εκκρεμεί
                          </button>
                          <button
                            onClick={() => handleStatusChange(doc, 'RECEIVED')}
                            disabled={ceremony.status !== 'PENDING'}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                              doc.status === 'RECEIVED'
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'text-[var(--text-muted)] hover:text-[var(--foreground)] disabled:opacity-50'
                            }`}
                          >
                            Ελήφθη
                          </button>
                          <button
                            onClick={() => handleStatusChange(doc, 'NOT_REQUIRED')}
                            disabled={ceremony.status !== 'PENDING'}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                              doc.status === 'NOT_REQUIRED'
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'text-[var(--text-muted)] hover:text-[var(--foreground)] disabled:opacity-50'
                            }`}
                          >
                            Δεν απαιτείται
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Justification Dialog Modal for NOT_REQUIRED */}
      {activeDocForReason && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-start">
              <h3 className="text-sm font-black text-[var(--foreground)]">Αιτιολόγηση Παράλειψης Εγγράφου</h3>
              <button onClick={() => setActiveDocForReason(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Εισάγετε την αιτιολογία για την οποία το έγγραφο <strong className="text-[var(--foreground)]">"{activeDocForReason.name}"</strong> σημειώνεται ως "Δεν απαιτείται" (π.χ. «Είναι διαζευγμένος και όχι χήρος»).
            </p>

            <div className="space-y-2">
              <Label className="text-xs font-bold">Αιτιολογία</Label>
              <Input
                value={rejectionReasonInput}
                onChange={e => {
                  setRejectionReasonInput(e.target.value);
                  setReasonError('');
                }}
                placeholder="π.χ. Δεν εφαρμόζεται λόγω..."
                className={`h-10 ${reasonError ? 'border-rose-500' : ''}`}
                autoFocus
              />
              {reasonError && <p className="text-xs text-rose-500">{reasonError}</p>}
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button
                variant="outline"
                onClick={() => setActiveDocForReason(null)}
                className="h-9 text-xs font-bold px-4 border-[var(--border)] rounded-lg hover:bg-[var(--background)]"
              >
                Ακύρωση
              </Button>
              <Button
                onClick={handleSubmitRejectionReason}
                className="h-9 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 rounded-lg"
              >
                Αποθήκευση
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
