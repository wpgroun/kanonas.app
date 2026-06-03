'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  getRequiredDocuments, 
  calculateMarriageClass, 
  MarriageDetailsSchema, 
  BaptismDetailsSchema, 
  FuneralDetailsSchema 
} from '@/lib/ceremonies';
import { 
  Heart, 
  Baby, 
  Skull, 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Calendar as CalendarIcon, 
  User, 
  AlertCircle 
} from 'lucide-react';

interface Priest {
  id: string;
  name: string;
}

export default function CeremonyCreateClient({ priests }: { priests: Priest[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialType = searchParams.get('type') as 'MARRIAGE' | 'BAPTISM' | 'FUNERAL' | null;

  const [step, setStep] = useState(1);
  const [type, setType] = useState<'MARRIAGE' | 'BAPTISM' | 'FUNERAL'>(initialType || 'MARRIAGE');
  const [subtype, setSubtype] = useState<string>('INFANT'); // default for baptism
  const [date, setDate] = useState<string>('');
  const [priestName, setPriestName] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Form Details states
  // Marriage details
  const [marriageDetails, setMarriageDetails] = useState({
    groomFirstName: '',
    groomLastName: '',
    groomFathersName: '',
    groomMothersName: '',
    groomPreviousMarriages: 0,
    groomIsWidowed: false,
    brideFirstName: '',
    brideLastName: '',
    brideFathersName: '',
    brideMothersName: '',
    bridePreviousMarriages: 0,
    brideIsWidowed: false,
    koumbarosFirstName: '',
    koumbarosLastName: '',
  });

  // Baptism details
  const [baptismDetails, setBaptismDetails] = useState({
    baptizedFirstName: '',
    baptizedLastName: '',
    baptizedDateOfBirth: '',
    fatherFirstName: '',
    fatherLastName: '',
    motherFirstName: '',
    motherLastName: '',
    motherMaidenName: '',
    sponsorFirstName: '',
    sponsorLastName: '',
    sponsorIsOrthodox: true,
  });

  // Funeral details
  const [funeralDetails, setFuneralDetails] = useState({
    deceasedFirstName: '',
    deceasedLastName: '',
    deceasedDateOfDeath: '',
    deceasedAge: '',
    relativeFirstName: '',
    relativeLastName: '',
    relativeRelationship: '',
  });

  // Adjust default subtype when type changes
  useEffect(() => {
    if (type === 'MARRIAGE') {
      const computedClass = calculateMarriageClass(
        marriageDetails.groomPreviousMarriages,
        marriageDetails.bridePreviousMarriages
      );
      setSubtype(computedClass);
    } else if (type === 'BAPTISM') {
      setSubtype('INFANT');
    } else if (type === 'FUNERAL') {
      setSubtype('STANDARD');
    }
    setErrors({});
  }, [type]);

  // Adjust marriage class subtype automatically when marriage inputs change
  useEffect(() => {
    if (type === 'MARRIAGE') {
      const computedClass = calculateMarriageClass(
        marriageDetails.groomPreviousMarriages,
        marriageDetails.bridePreviousMarriages
      );
      setSubtype(computedClass);
    }
  }, [marriageDetails.groomPreviousMarriages, marriageDetails.bridePreviousMarriages]);

  const getComputedDocs = () => {
    let details: any = {};
    if (type === 'MARRIAGE') details = marriageDetails;
    else if (type === 'BAPTISM') details = baptismDetails;
    else details = funeralDetails;
    return getRequiredDocuments(type, subtype, details);
  };

  const handleNext = () => {
    setErrors({});
    
    if (step === 1) {
      // Step 1 Validation
      const errs: Record<string, string> = {};
      if (!date) errs.date = 'Η ημερομηνία και ώρα είναι υποχρεωτική.';
      if (Object.keys(errs).length > 0) {
        setErrors(errs);
        return;
      }
      setStep(2);
    } else if (step === 2) {
      // Step 2 Validation: Check Zod schemas
      try {
        if (type === 'MARRIAGE') {
          MarriageDetailsSchema.parse({
            ...marriageDetails,
            groomPreviousMarriages: Number(marriageDetails.groomPreviousMarriages),
            bridePreviousMarriages: Number(marriageDetails.bridePreviousMarriages),
          });
        } else if (type === 'BAPTISM') {
          BaptismDetailsSchema.parse(baptismDetails);
        } else if (type === 'FUNERAL') {
          FuneralDetailsSchema.parse({
            ...funeralDetails,
            deceasedAge: funeralDetails.deceasedAge ? Number(funeralDetails.deceasedAge) : undefined,
          });
        }
        setStep(3);
      } catch (err: any) {
        const errMap: Record<string, string> = {};
        if (err.errors) {
          err.errors.forEach((e: any) => {
            if (e.path && e.path.length > 0) {
              errMap[e.path[0]] = e.message;
            }
          });
        }
        setErrors(errMap);
      }
    } else if (step === 3) {
      setStep(4);
    }
  };

  const handleBack = () => {
    setErrors({});
    setStep(prev => Math.max(1, prev - 1));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setErrors({});

    let details: any = {};
    if (type === 'MARRIAGE') {
      details = {
        ...marriageDetails,
        groomPreviousMarriages: Number(marriageDetails.groomPreviousMarriages),
        bridePreviousMarriages: Number(marriageDetails.bridePreviousMarriages),
      };
    } else if (type === 'BAPTISM') {
      details = baptismDetails;
    } else {
      details = {
        ...funeralDetails,
        deceasedAge: funeralDetails.deceasedAge ? Number(funeralDetails.deceasedAge) : undefined,
      };
    }

    try {
      const response = await fetch('/api/ceremonies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          subtype,
          date,
          priest: priestName || null,
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
          // Go to relevant step if there's a validation error
          if (formatted.date) setStep(1);
          else setStep(2);
        } else {
          setErrors({ global: data.error || 'Παρουσιάστηκε σφάλμα κατά την αποθήκευση.' });
        }
        setLoading(false);
        return;
      }

      router.push(`/admin/ceremonies/${data.id}`);
      router.refresh();
    } catch (err) {
      setErrors({ global: 'Σφάλμα επικοινωνίας με το διακομιστή.' });
      setLoading(false);
    }
  };

  const computedDocs = getComputedDocs();

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Wizard Steps Indicators */}
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-5">
        {[
          { label: 'Βασικά Στοιχεία', num: 1 },
          { label: 'Συμμετέχοντες', num: 2 },
          { label: 'Δικαιολογητικά', num: 3 },
          { label: 'Επιβεβαίωση', num: 4 },
        ].map((s) => (
          <div key={s.num} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                step >= s.num
                  ? 'bg-indigo-600 text-white shadow-sm ring-4 ring-indigo-100 dark:ring-indigo-950/50'
                  : 'bg-slate-100 dark:bg-slate-800 text-[var(--text-muted)]'
              }`}
            >
              {step > s.num ? <Check className="w-4 h-4" /> : s.num}
            </div>
            <span
              className={`hidden sm:inline text-xs font-bold ${
                step === s.num ? 'text-indigo-600' : 'text-[var(--text-muted)]'
              }`}
            >
              {s.label}
            </span>
            {s.num < 4 && <div className="hidden sm:block w-8 md:w-16 h-px bg-[var(--border)] mx-1" />}
          </div>
        ))}
      </div>

      {errors.global && (
        <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 dark:bg-rose-950/20 dark:border-rose-900 text-rose-600 p-4 rounded-xl text-sm font-medium">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errors.global}</span>
        </div>
      )}

      {/* STEP 1: Type, Date, Priest */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Type Cards */}
            <button
              type="button"
              onClick={() => setType('MARRIAGE')}
              className={`flex flex-col items-center gap-3 p-6 rounded-2xl border text-center transition-all ${
                type === 'MARRIAGE'
                  ? 'border-blue-500 bg-blue-50/30 ring-2 ring-blue-500/20 dark:bg-blue-950/20'
                  : 'border-[var(--border)] hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600">
                <Heart className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-[var(--foreground)]">Γάμος</h4>
                <p className="text-xs text-[var(--text-muted)] mt-1">Καταγραφή γάμου & υπολογισμός τάξης</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setType('BAPTISM')}
              className={`flex flex-col items-center gap-3 p-6 rounded-2xl border text-center transition-all ${
                type === 'BAPTISM'
                  ? 'border-purple-500 bg-purple-50/30 ring-2 ring-purple-500/20 dark:bg-purple-950/20'
                  : 'border-[var(--border)] hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-950 flex items-center justify-center text-purple-600">
                <Baby className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-[var(--foreground)]">Βάπτιση</h4>
                <p className="text-xs text-[var(--text-muted)] mt-1">Νήπιο, Ενήλικος ή Χρίσμα</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setType('FUNERAL')}
              className={`flex flex-col items-center gap-3 p-6 rounded-2xl border text-center transition-all ${
                type === 'FUNERAL'
                  ? 'border-rose-500 bg-rose-50/30 ring-2 ring-rose-500/20 dark:bg-rose-950/20'
                  : 'border-[var(--border)] hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950 flex items-center justify-center text-rose-600">
                <Skull className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-[var(--foreground)]">Κηδεία</h4>
                <p className="text-xs text-[var(--text-muted)] mt-1">Καταγραφή εκδημίας & ληξιαρχικά</p>
              </div>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[var(--border)]">
            {/* Subtype for Baptism */}
            {type === 'BAPTISM' && (
              <div className="space-y-2">
                <Label className="font-bold text-xs">Τύπος Βάπτισης</Label>
                <select
                  value={subtype}
                  onChange={(e) => setSubtype(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="INFANT">Νήπιο (Κανονική Βάπτιση)</option>
                  <option value="ADULT">Ενήλικος (Κατήχηση & Βάπτιση)</option>
                  <option value="CHRISMATION">Χρίσμα (Προσέλευση από άλλο δόγμα)</option>
                </select>
              </div>
            )}

            {/* Subtype Display for Marriage */}
            {type === 'MARRIAGE' && (
              <div className="space-y-2 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-950 p-4 rounded-xl">
                <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400 block mb-1">Τάξη Γάμου (Αυτόματος Υπολογισμός)</span>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Η τάξη του γάμου (Α', Β' ή Γ') υπολογίζεται αυτόματα στο επόμενο βήμα βάσει του ιστορικού προηγούμενων γάμων του γαμπρού και της νύφης.
                </p>
              </div>
            )}

            {/* Date Selection */}
            <div className="space-y-2">
              <Label className="font-bold text-xs flex items-center gap-1">
                <CalendarIcon className="w-3.5 h-3.5 text-slate-400" /> Ημερομηνία & Ώρα Τέλεσης
              </Label>
              <Input
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`h-10 border ${errors.date ? 'border-rose-500' : 'border-[var(--border)]'}`}
              />
              {errors.date && <p className="text-xs text-rose-500">{errors.date}</p>}
            </div>

            {/* Priest Selection */}
            <div className="space-y-2">
              <Label className="font-bold text-xs flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" /> Τελετάρχης Ιερέας
              </Label>
              <div className="relative">
                <input
                  list="priests-list"
                  type="text"
                  value={priestName}
                  onChange={(e) => setPriestName(e.target.value)}
                  placeholder="Επιλέξτε ή πληκτρολογήστε όνομα ιερέα..."
                  className="w-full h-10 px-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:border-indigo-500"
                />
                <datalist id="priests-list">
                  {priests.map(p => (
                    <option key={p.id} value={p.name} />
                  ))}
                </datalist>
              </div>
              <p className="text-[10px] text-[var(--text-muted)]">Μπορείτε να επιλέξετε από το προσωπικό ή να πληκτρολογήσετε ελεύθερο κείμενο.</p>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Participant Details */}
      {step === 2 && (
        <div className="space-y-6">
          {/* MARRIAGE DETAILS */}
          {type === 'MARRIAGE' && (
            <div className="space-y-8">
              {/* Groom info */}
              <div className="space-y-4">
                <h3 className="text-sm font-black border-b pb-2 text-blue-600 flex items-center gap-1.5">
                  <Heart className="w-4 h-4" /> Στοιχεία Γαμπρού
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold">Όνομα</Label>
                    <Input
                      value={marriageDetails.groomFirstName}
                      onChange={e => setMarriageDetails(prev => ({ ...prev, groomFirstName: e.target.value }))}
                      className={errors.groomFirstName ? 'border-rose-500' : ''}
                    />
                    {errors.groomFirstName && <p className="text-xs text-rose-500">{errors.groomFirstName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold">Επώνυμο</Label>
                    <Input
                      value={marriageDetails.groomLastName}
                      onChange={e => setMarriageDetails(prev => ({ ...prev, groomLastName: e.target.value }))}
                      className={errors.groomLastName ? 'border-rose-500' : ''}
                    />
                    {errors.groomLastName && <p className="text-xs text-rose-500">{errors.groomLastName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold">Πατρώνυμο</Label>
                    <Input
                      value={marriageDetails.groomFathersName}
                      onChange={e => setMarriageDetails(prev => ({ ...prev, groomFathersName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold">Μητρώνυμο</Label>
                    <Input
                      value={marriageDetails.groomMothersName}
                      onChange={e => setMarriageDetails(prev => ({ ...prev, groomMothersName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold">Αριθμός Προηγούμενων Γάμων</Label>
                    <Input
                      type="number"
                      min="0"
                      value={marriageDetails.groomPreviousMarriages}
                      onChange={e => setMarriageDetails(prev => ({ ...prev, groomPreviousMarriages: Math.max(0, parseInt(e.target.value) || 0) }))}
                      className={errors.groomPreviousMarriages ? 'border-rose-500' : ''}
                    />
                    {errors.groomPreviousMarriages && <p className="text-xs text-rose-500">{errors.groomPreviousMarriages}</p>}
                  </div>
                  {marriageDetails.groomPreviousMarriages > 0 && (
                    <div className="flex items-center gap-2 pt-8">
                      <Checkbox
                        id="groomIsWidowed"
                        checked={marriageDetails.groomIsWidowed}
                        onCheckedChange={checked => setMarriageDetails(prev => ({ ...prev, groomIsWidowed: !!checked }))}
                      />
                      <label htmlFor="groomIsWidowed" className="text-xs font-bold cursor-pointer text-[var(--foreground)]">
                        Λόγω χηρείας (θα ζητηθεί Ληξιαρχική Πράξη Θανάτου αντί για Διαζύγιο)
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Bride info */}
              <div className="space-y-4 pt-4 border-t border-[var(--border)]">
                <h3 className="text-sm font-black border-b pb-2 text-rose-500 flex items-center gap-1.5">
                  <Heart className="w-4 h-4" /> Στοιχεία Νύφης
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold">Όνομα</Label>
                    <Input
                      value={marriageDetails.brideFirstName}
                      onChange={e => setMarriageDetails(prev => ({ ...prev, brideFirstName: e.target.value }))}
                      className={errors.brideFirstName ? 'border-rose-500' : ''}
                    />
                    {errors.brideFirstName && <p className="text-xs text-rose-500">{errors.brideFirstName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold">Επώνυμο</Label>
                    <Input
                      value={marriageDetails.brideLastName}
                      onChange={e => setMarriageDetails(prev => ({ ...prev, brideLastName: e.target.value }))}
                      className={errors.brideLastName ? 'border-rose-500' : ''}
                    />
                    {errors.brideLastName && <p className="text-xs text-rose-500">{errors.brideLastName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold">Πατρώνυμο</Label>
                    <Input
                      value={marriageDetails.brideFathersName}
                      onChange={e => setMarriageDetails(prev => ({ ...prev, brideFathersName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold">Μητρώνυμο</Label>
                    <Input
                      value={marriageDetails.brideMothersName}
                      onChange={e => setMarriageDetails(prev => ({ ...prev, brideMothersName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold">Αριθμός Προηγούμενων Γάμων</Label>
                    <Input
                      type="number"
                      min="0"
                      value={marriageDetails.bridePreviousMarriages}
                      onChange={e => setMarriageDetails(prev => ({ ...prev, bridePreviousMarriages: Math.max(0, parseInt(e.target.value) || 0) }))}
                      className={errors.bridePreviousMarriages ? 'border-rose-500' : ''}
                    />
                    {errors.bridePreviousMarriages && <p className="text-xs text-rose-500">{errors.bridePreviousMarriages}</p>}
                  </div>
                  {marriageDetails.bridePreviousMarriages > 0 && (
                    <div className="flex items-center gap-2 pt-8">
                      <Checkbox
                        id="brideIsWidowed"
                        checked={marriageDetails.brideIsWidowed}
                        onCheckedChange={checked => setMarriageDetails(prev => ({ ...prev, brideIsWidowed: !!checked }))}
                      />
                      <label htmlFor="brideIsWidowed" className="text-xs font-bold cursor-pointer text-[var(--foreground)]">
                        Λόγω χηρείας (θα ζητηθεί Ληξιαρχική Πράξη Θανάτου αντί για Διαζύγιο)
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Koumbaros */}
              <div className="space-y-4 pt-4 border-t border-[var(--border)]">
                <h3 className="text-sm font-black border-b pb-2 text-slate-500">Στοιχεία Παρανύμφου / Κουμπάρου (Προαιρετικά)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold">Όνομα Κουμπάρου</Label>
                    <Input
                      value={marriageDetails.koumbarosFirstName}
                      onChange={e => setMarriageDetails(prev => ({ ...prev, koumbarosFirstName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold">Επώνυμο Κουμπάρου</Label>
                    <Input
                      value={marriageDetails.koumbarosLastName}
                      onChange={e => setMarriageDetails(prev => ({ ...prev, koumbarosLastName: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Auto Calculated Class Display */}
                <div className="mt-4 p-4 rounded-xl border border-indigo-100 bg-indigo-50/30 dark:border-indigo-950 dark:bg-indigo-950/20 text-xs font-bold text-indigo-700 dark:text-indigo-400 flex items-center justify-between">
                  <span>Υπολογισμένη Τάξη Γάμου:</span>
                  <span className="bg-indigo-600 text-white rounded px-2.5 py-0.5 font-black uppercase text-sm">
                    {subtype}' Τάξη
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* BAPTISM DETAILS */}
          {type === 'BAPTISM' && (
            <div className="space-y-6">
              {/* Baptized info */}
              <div className="space-y-4">
                <h3 className="text-sm font-black border-b pb-2 text-purple-600">Στοιχεία Βαπτιζόμενου</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold">Όνομα (εάν έχει αποφασιστεί)</Label>
                    <Input
                      value={baptismDetails.baptizedFirstName}
                      onChange={e => setBaptismDetails(prev => ({ ...prev, baptizedFirstName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold">Επώνυμο</Label>
                    <Input
                      value={baptismDetails.baptizedLastName}
                      onChange={e => setBaptismDetails(prev => ({ ...prev, baptizedLastName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold">Ημερομηνία Γέννησης</Label>
                    <Input
                      type="date"
                      value={baptismDetails.baptizedDateOfBirth}
                      onChange={e => setBaptismDetails(prev => ({ ...prev, baptizedDateOfBirth: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* Parents info */}
              <div className="space-y-4 pt-4 border-t border-[var(--border)]">
                <h3 className="text-sm font-black border-b pb-2 text-slate-500">Στοιχεία Γονέων</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold">Όνομα Πατέρα</Label>
                    <Input
                      value={baptismDetails.fatherFirstName}
                      onChange={e => setBaptismDetails(prev => ({ ...prev, fatherFirstName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold">Επώνυμο Πατέρα</Label>
                    <Input
                      value={baptismDetails.fatherLastName}
                      onChange={e => setBaptismDetails(prev => ({ ...prev, fatherLastName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold">Όνομα Μητέρας</Label>
                    <Input
                      value={baptismDetails.motherFirstName}
                      onChange={e => setBaptismDetails(prev => ({ ...prev, motherFirstName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold">Επώνυμο Μητέρας</Label>
                    <Input
                      value={baptismDetails.motherLastName}
                      onChange={e => setBaptismDetails(prev => ({ ...prev, motherLastName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-xs font-bold">Πατρικό Επώνυμο Μητέρας</Label>
                    <Input
                      value={baptismDetails.motherMaidenName}
                      onChange={e => setBaptismDetails(prev => ({ ...prev, motherMaidenName: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* Sponsor info */}
              <div className="space-y-4 pt-4 border-t border-[var(--border)]">
                <h3 className="text-sm font-black border-b pb-2 text-slate-500">Στοιχεία Αναδόχου (Νονού/Νονάς)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold">Όνομα Αναδόχου</Label>
                    <Input
                      value={baptismDetails.sponsorFirstName}
                      onChange={e => setBaptismDetails(prev => ({ ...prev, sponsorFirstName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold">Επώνυμο Αναδόχου</Label>
                    <Input
                      value={baptismDetails.sponsorLastName}
                      onChange={e => setBaptismDetails(prev => ({ ...prev, sponsorLastName: e.target.value }))}
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-4 md:col-span-2">
                    <Checkbox
                      id="sponsorIsOrthodox"
                      checked={baptismDetails.sponsorIsOrthodox}
                      onCheckedChange={checked => setBaptismDetails(prev => ({ ...prev, sponsorIsOrthodox: !!checked }))}
                    />
                    <label htmlFor="sponsorIsOrthodox" className="text-xs font-bold cursor-pointer text-[var(--foreground)]">
                      Ο Ανάδοχος είναι Ορθόδοξος Χριστιανός (Απαραίτητο για την τέλεση)
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FUNERAL DETAILS */}
          {type === 'FUNERAL' && (
            <div className="space-y-6">
              {/* Deceased info */}
              <div className="space-y-4">
                <h3 className="text-sm font-black border-b pb-2 text-rose-500">Στοιχεία Αποβιώσαντος</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold">Όνομα Αποβιώσαντος</Label>
                    <Input
                      value={funeralDetails.deceasedFirstName}
                      onChange={e => setFuneralDetails(prev => ({ ...prev, deceasedFirstName: e.target.value }))}
                      className={errors.deceasedFirstName ? 'border-rose-500' : ''}
                    />
                    {errors.deceasedFirstName && <p className="text-xs text-rose-500">{errors.deceasedFirstName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold">Επώνυμο Αποβιώσαντος</Label>
                    <Input
                      value={funeralDetails.deceasedLastName}
                      onChange={e => setFuneralDetails(prev => ({ ...prev, deceasedLastName: e.target.value }))}
                      className={errors.deceasedLastName ? 'border-rose-500' : ''}
                    />
                    {errors.deceasedLastName && <p className="text-xs text-rose-500">{errors.deceasedLastName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold">Ημερομηνία Θανάτου</Label>
                    <Input
                      type="date"
                      value={funeralDetails.deceasedDateOfDeath}
                      onChange={e => setFuneralDetails(prev => ({ ...prev, deceasedDateOfDeath: e.target.value }))}
                      className={errors.deceasedDateOfDeath ? 'border-rose-500' : ''}
                    />
                    {errors.deceasedDateOfDeath && <p className="text-xs text-rose-500">{errors.deceasedDateOfDeath}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold">Ηλικία</Label>
                    <Input
                      type="number"
                      min="0"
                      value={funeralDetails.deceasedAge}
                      onChange={e => setFuneralDetails(prev => ({ ...prev, deceasedAge: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* Relative info */}
              <div className="space-y-4 pt-4 border-t border-[var(--border)]">
                <h3 className="text-sm font-black border-b pb-2 text-slate-500">Στοιχεία Πλησιέστερου Συγγενή (Υπεύθυνος Επικοινωνίας)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold">Όνομα</Label>
                    <Input
                      value={funeralDetails.relativeFirstName}
                      onChange={e => setFuneralDetails(prev => ({ ...prev, relativeFirstName: e.target.value }))}
                      className={errors.relativeFirstName ? 'border-rose-500' : ''}
                    />
                    {errors.relativeFirstName && <p className="text-xs text-rose-500">{errors.relativeFirstName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold">Επώνυμο</Label>
                    <Input
                      value={funeralDetails.relativeLastName}
                      onChange={e => setFuneralDetails(prev => ({ ...prev, relativeLastName: e.target.value }))}
                      className={errors.relativeLastName ? 'border-rose-500' : ''}
                    />
                    {errors.relativeLastName && <p className="text-xs text-rose-500">{errors.relativeLastName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold">Σχέση Συγγένειας (π.χ. Υιός, Σύζυγος)</Label>
                    <Input
                      value={funeralDetails.relativeRelationship}
                      onChange={e => setFuneralDetails(prev => ({ ...prev, relativeRelationship: e.target.value }))}
                      className={errors.relativeRelationship ? 'border-rose-500' : ''}
                    />
                    {errors.relativeRelationship && <p className="text-xs text-rose-500">{errors.relativeRelationship}</p>}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 3: Preview Required Documents Checklist */}
      {step === 3 && (
        <div className="space-y-5">
          <div className="bg-indigo-50 border border-indigo-100 dark:bg-indigo-950/20 dark:border-indigo-900 p-4 rounded-xl text-xs leading-relaxed text-indigo-800 dark:text-indigo-300">
            <span className="font-bold block mb-1">Πληροφορία</span>
            Βάσει των στοιχείων που καταχωρήσατε, το σύστημα θα δημιουργήσει αυτόματα την ακόλουθη λίστα απαιτούμενων εγγράφων. Όλα τα έγγραφα θα τεθούν αρχικά σε κατάσταση <strong>"Σε εκκρεμότητα"</strong>.
          </div>

          <div className="border border-[var(--border)] rounded-2xl overflow-hidden bg-[var(--background)]">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 border-b border-[var(--border)] flex justify-between items-center">
              <span className="text-xs font-black uppercase tracking-wider text-[var(--text-muted)]">Απαιτούμενο Δικαιολογητικό</span>
              <span className="text-xs font-black uppercase tracking-wider text-[var(--text-muted)]">Κατάσταση κατά τη δημιουργία</span>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {computedDocs.map((doc, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between text-sm">
                  <span className="font-semibold text-[var(--foreground)]">{doc}</span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200/50">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Σε εκκρεμότητα
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: Confirmation & Submit */}
      {step === 4 && (
        <div className="space-y-6">
          <div className="bg-emerald-50 border border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900 p-4 rounded-xl text-xs leading-relaxed text-emerald-800 dark:text-emerald-300">
            <span className="font-bold block mb-1">Έτοιμο για Καταγραφή</span>
            Παρακαλούμε ελέγξτε τα στοιχεία της τελετής παρακάτω πριν την οριστική υποβολή. Μετά τη δημιουργία, θα μεταφερθείτε στη σελίδα διαχείρισης των δικαιολογητικών.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-850 p-6 rounded-2xl border border-[var(--border)] text-sm">
            <div className="space-y-3">
              <h4 className="font-black text-xs uppercase tracking-wider text-[var(--text-muted)] border-b pb-1">Γενικά Στοιχεία</h4>
              <p className="font-medium text-[var(--foreground)]">
                <span className="text-[var(--text-muted)] mr-2">Τύπος:</span> 
                {type === 'MARRIAGE' ? 'Γάμος' : type === 'BAPTISM' ? 'Βάπτιση' : 'Κηδεία'} 
                {type === 'MARRIAGE' && ` (${subtype}' Τάξη)`}
                {type === 'BAPTISM' && ` (${subtype === 'INFANT' ? 'Νήπιο' : subtype === 'ADULT' ? 'Ενήλικος' : 'Χρίσμα'})`}
              </p>
              <p className="font-medium text-[var(--foreground)]">
                <span className="text-[var(--text-muted)] mr-2">Ημερομηνία & Ώρα:</span>
                {new Date(date).toLocaleString('el-GR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="font-medium text-[var(--foreground)]">
                <span className="text-[var(--text-muted)] mr-2">Ιερέας:</span>
                {priestName || 'Χωρίς Ιερέα (Εκκρεμεί ανάθεση)'}
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-black text-xs uppercase tracking-wider text-[var(--text-muted)] border-b pb-1">Συμμετέχοντες</h4>
              {type === 'MARRIAGE' && (
                <>
                  <p className="font-medium text-[var(--foreground)]"><span className="text-[var(--text-muted)] mr-2">Γαμπρός:</span> {marriageDetails.groomLastName} {marriageDetails.groomFirstName} ({marriageDetails.groomPreviousMarriages}ος γάμος)</p>
                  <p className="font-medium text-[var(--foreground)]"><span className="text-[var(--text-muted)] mr-2">Νύφη:</span> {marriageDetails.brideLastName} {marriageDetails.brideFirstName} ({marriageDetails.bridePreviousMarriages}ος γάμος)</p>
                  {marriageDetails.koumbarosFirstName && <p className="font-medium text-[var(--foreground)]"><span className="text-[var(--text-muted)] mr-2">Κουμπάρος:</span> {marriageDetails.koumbarosLastName} {marriageDetails.koumbarosFirstName}</p>}
                </>
              )}
              {type === 'BAPTISM' && (
                <>
                  <p className="font-medium text-[var(--foreground)]"><span className="text-[var(--text-muted)] mr-2">Βαπτιζόμενος:</span> {baptismDetails.baptizedLastName} {baptismDetails.baptizedFirstName || 'Βρέφος'}</p>
                  <p className="font-medium text-[var(--foreground)]"><span className="text-[var(--text-muted)] mr-2">Γονείς:</span> {baptismDetails.fatherFirstName} & {baptismDetails.motherFirstName}</p>
                  {baptismDetails.sponsorFirstName && <p className="font-medium text-[var(--foreground)]"><span className="text-[var(--text-muted)] mr-2">Ανάδοχος:</span> {baptismDetails.sponsorLastName} {baptismDetails.sponsorFirstName}</p>}
                </>
              )}
              {type === 'FUNERAL' && (
                <>
                  <p className="font-medium text-[var(--foreground)]"><span className="text-[var(--text-muted)] mr-2">Αποβιώσας:</span> {funeralDetails.deceasedLastName} {funeralDetails.deceasedFirstName} ({funeralDetails.deceasedAge || '--'} ετών)</p>
                  <p className="font-medium text-[var(--foreground)]"><span className="text-[var(--text-muted)] mr-2">Συγγενής:</span> {funeralDetails.relativeLastName} {funeralDetails.relativeFirstName} ({funeralDetails.relativeRelationship})</p>
                </>
              )}
            </div>

            <div className="md:col-span-2 pt-2 border-t border-[var(--border)]">
              <p className="font-medium text-xs text-[var(--text-muted)]">
                Σύνολο αυτόματα παραγόμενων δικαιολογητικών: <strong className="text-[var(--foreground)]">{computedDocs.length} έγγραφα</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-[var(--border)]">
        <Button
          variant="outline"
          onClick={step === 1 ? () => router.push('/admin/ceremonies') : handleBack}
          className="h-10 px-5 gap-2 border-[var(--border)] text-xs font-bold rounded-lg hover:bg-[var(--background)]"
          disabled={loading}
        >
          <ArrowLeft className="w-4 h-4" /> {step === 1 ? 'Ακύρωση' : 'Πίσω'}
        </Button>

        {step < 4 ? (
          <Button
            onClick={handleNext}
            className="h-10 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 gap-2 rounded-lg text-xs"
          >
            Επόμενο <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 gap-2 rounded-lg text-xs"
          >
            {loading ? 'Γίνεται καταγραφή...' : 'Καταγραφή & Δημιουργία Λίστας'}
          </Button>
        )}
      </div>
    </div>
  );
}
