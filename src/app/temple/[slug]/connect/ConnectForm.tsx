'use client';

import { useState } from 'react';
import { submitCitizenRequest } from '@/actions/connect';
import { CheckCircle2, FileText, Send, User, Phone, Mail, FileSignature, ChevronRight, ChevronLeft, Calendar } from 'lucide-react';

const SYSTEM_VARS = ['ΝΑΟΣ_ΟΝΟΜΑ', 'ΝΑΟΣ_ΔΙΕΥΘΥΝΣΗ', 'ΜΗΤΡΟΠΟΛΗ', 'ΗΜΕΡΟΜΗΝΙΑ', 'ΗΜΕΡΟΜΗΝΙΑ_ΤΕΛΕΤΗΣ']; // System or standard overridden vars.

const DOC_TYPES_EXT = [
  { id: 'vaptisi', label: 'Βαπτίσεις', emoji: '💧' },
  { id: 'gamos', label: 'Γάμοι', emoji: '💍' },
  { id: 'divorce', label: 'Διαζύγια', emoji: '📋' },
  { id: 'funeral', label: 'Κηδείες', emoji: '🕯️' },
  { id: 'other', label: 'Λοιπά Πιστοποιητικά & Δράσεις', emoji: '📄' }
];

export default function ConnectForm({ slug, docTypes }: { slug: string, docTypes: any[] }) {
  const [step, setStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [status, setStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS'>('IDLE');
  const [trackingId, setTrackingId] = useState<string>('');

  // Form Fields State
  const [applicantName, setApplicantName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [dynamicVars, setDynamicVars] = useState<Record<string, string>>({});

  const handleTemplateSelect = (tpl: any) => {
    setSelectedTemplate(tpl);
    setDynamicVars({}); // Reset
    setStep(1);
  };

  const handleDynamicChange = (key: string, value: string) => {
    setDynamicVars(prev => ({ ...prev, [key]: value }));
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('LOADING');

    const data = {
      templeSlug: slug,
      type: selectedTemplate.docType,
      applicantName,
      applicantEmail,
      applicantPhone,
      payload: {
        templateId: selectedTemplate.id,
        variables: dynamicVars
      }
    };

    try {
      const id = await submitCitizenRequest(data);
      setTrackingId(id);
      setStatus('SUCCESS');
      setStep(3);
    } catch (err) {
      console.error(err);
      setStatus('IDLE');
      alert('Υπήρξε ένα πρόβλημα. Επικοινωνήστε με τον Ναό.');
    }
  }

  // Derived arrays
  const filteredVars = selectedTemplate?.vars.filter((v: string) => !SYSTEM_VARS.includes(v)) || [];

  if (step === 3) {
    return (
      <div className="text-center py-10 animate-in zoom-in-95 fade-in duration-500">
        <div className="mx-auto bg-emerald-100 w-20 h-20 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-emerald-600"/>
        </div>
        <h3 className="text-2xl font-bold text-slate-800 mb-2">Το Αίτημά σας Υποβλήθηκε!</h3>
        <p className="text-slate-500 max-w-md mx-auto mb-6">
          Το αίτημα καταχωρήθηκε επιτυχώς στη γραμματεία του Ναού. Μπορείτε να παρακολουθήσετε την εξέλιξή του ανά πάσα στιγμή με τον παρακάτω Αριθμό Αναζήτησης:
        </p>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 inline-block font-mono text-lg font-bold text-slate-800 shadow-inner">
          {trackingId}
        </div>
        <div className="mt-8">
          <a href={`/temple/${slug}/connect/track?id=${trackingId}`} className="text-blue-600 font-bold hover:underline text-sm">
            Μετάβαση στην Αναζήτηση Πορείας
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* ── STEP 0: Selection ── */}
      {step === 0 && (
        <div className="animate-in fade-in duration-300">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Επιλέξτε Κατηγορία Αιτήματος</h3>
          {docTypes.length === 0 ? (
             <div className="text-center py-12 bg-slate-50 border border-slate-200 rounded-2xl">
               <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3"/>
               <p className="text-slate-500 font-medium">Η Ενορία δεν έχει ενεργοποιήσει ακόμα ψηφιακά έγγραφα.</p>
             </div>
          ) : (
            <div className="space-y-6">
              {DOC_TYPES_EXT.map(group => {
                const groupDocs = docTypes.filter(d => (d.docType === group.id) || (group.id === 'other' && !DOC_TYPES_EXT.find(x => x.id === d.docType && x.id !== 'other')));
                if (groupDocs.length === 0) return null;
                
                return (
                  <div key={group.id}>
                    <h4 className="text-sm font-black uppercase text-slate-400 tracking-wider mb-3 flex items-center gap-2">
                       {group.emoji} {group.label}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {groupDocs.map(doc => (
                        <button
                          key={doc.id}
                          onClick={() => handleTemplateSelect(doc)}
                          className="text-left bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md p-4 rounded-xl flex items-center gap-3 transition-all group"
                        >
                          <div className="bg-blue-50 p-2.5 rounded-lg group-hover:bg-blue-100 text-blue-600 transition-colors">
                            <FileSignature className="w-5 h-5"/>
                          </div>
                          <div>
                            <p className="font-bold text-slate-700 text-sm group-hover:text-blue-700 transition-colors">{doc.nameEl}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{doc.vars.length} Πεδία Συμπλήρωσης</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── STEP 1: Form Fill ── */}
      {step === 1 && selectedTemplate && (
        <form id="dynamicForm" onSubmit={() => setStep(2)} className="animate-in slide-in-from-right-4 fade-in duration-300 space-y-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <button type="button" onClick={() => setStep(0)} className="p-2 bg-slate-100 text-slate-500 hover:bg-slate-200 rounded-full transition-colors">
              <ChevronLeft className="w-5 h-5"/>
            </button>
            <div>
              <h3 className="text-lg font-bold text-slate-800">{selectedTemplate.nameEl}</h3>
              <p className="text-xs text-slate-500">Συμπληρώστε τα παρακάτω στοιχεία</p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 space-y-5">
            <h4 className="text-sm font-black uppercase tracking-wider text-blue-800">Στοιχεία Αιτούντος</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5"><User className="inline w-3.5 h-3.5 mr-1"/> Ονοματεπώνυμο *</label>
                <input required value={applicantName} onChange={e => setApplicantName(e.target.value)} type="text" className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="π.χ. Γεώργιος Παπαδόπουλος"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5"><Phone className="inline w-3.5 h-3.5 mr-1"/> Τηλέφωνο *</label>
                <input required value={applicantPhone} onChange={e => setApplicantPhone(e.target.value)} type="tel" className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="π.χ. 6900000000"/>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5"><Mail className="inline w-3.5 h-3.5 mr-1"/> Email (Προαιρετικό)</label>
                <input value={applicantEmail} onChange={e => setApplicantEmail(e.target.value)} type="email" className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="π.χ. email@example.com"/>
              </div>
            </div>
          </div>

          {filteredVars.length > 0 && (
            <div className="pt-2 space-y-5">
              <h4 className="text-sm font-black uppercase tracking-wider text-slate-700 mb-4 border-b border-slate-100 pb-2">Δυναμικά Πεδία Εγγράφου</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-6">
                {filteredVars.map((v: string) => {
                  const isGender = v.toLowerCase().includes('φύλο') || v.toLowerCase().includes('γένος');
                  const label = v.replace(/_/g, ' ');

                  if (isGender) {
                    return (
                      <div key={v} className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-2">{label} *</label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 cursor-pointer bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-lg hover:bg-slate-100 transition-colors">
                            <input type="radio" required name={`dyn_${v}`} value="ΑΡΡΕΝ" onChange={(e) => handleDynamicChange(v, e.target.value)} checked={dynamicVars[v] === 'ΑΡΡΕΝ'} className="w-4 h-4 text-blue-600"/>
                            <span className="text-sm font-medium">Άρρεν (Αρσενικό)</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-lg hover:bg-slate-100 transition-colors">
                            <input type="radio" required name={`dyn_${v}`} value="ΘΗΛΥ" onChange={(e) => handleDynamicChange(v, e.target.value)} checked={dynamicVars[v] === 'ΘΗΛΥ'} className="w-4 h-4 text-pink-600"/>
                            <span className="text-sm font-medium">Θήλυ (Θηλυκό)</span>
                          </label>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={v}>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">{label} *</label>
                      <input 
                        required 
                        value={dynamicVars[v] || ''} 
                        onChange={(e) => handleDynamicChange(v, e.target.value)} 
                        type="text" 
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        placeholder="..."
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="pt-6">
            <button type="submit" className="w-full md:w-auto px-8 py-3.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg">
              Συνέχεια <ChevronRight className="w-5 h-5"/>
            </button>
          </div>
        </form>
      )}

      {/* ── STEP 2: Review & Submit ── */}
      {step === 2 && selectedTemplate && (
         <div className="animate-in slide-in-from-right-4 fade-in duration-300 space-y-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <button type="button" onClick={() => setStep(1)} className="p-2 bg-slate-100 text-slate-500 hover:bg-slate-200 rounded-full transition-colors">
                <ChevronLeft className="w-5 h-5"/>
              </button>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Επιβεβαίωση</h3>
                <p className="text-xs text-slate-500">Ελέγξτε τα στοιχεία πριν την τελική υποβολή</p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-3">
              <div className="flex justify-between py-2 border-b border-slate-200">
                <span className="text-slate-500 text-sm font-medium">Αίτημα:</span>
                <span className="font-bold text-slate-800 text-sm whitespace-pre-wrap text-right">{selectedTemplate.nameEl}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-200">
                <span className="text-slate-500 text-sm font-medium">Αιτών:</span>
                <span className="font-bold text-slate-800 text-sm">{applicantName}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-200">
                <span className="text-slate-500 text-sm font-medium">Τηλέφωνο:</span>
                <span className="font-bold text-slate-800 text-sm">{applicantPhone}</span>
              </div>
              
              {filteredVars.map((v: string) => (
                <div key={v} className="flex justify-between py-2 border-b border-slate-100 last:border-0 items-start gap-4">
                  <span className="text-slate-500 text-xs font-medium">{v.replace(/_/g, ' ')}:</span>
                  <span className="font-bold text-slate-800 text-sm text-right">{dynamicVars[v]}</span>
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="pt-4">
              <button 
                type="submit"
                disabled={status === 'LOADING'}
                className="w-full px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-200 disabled:opacity-50"
              >
                {status === 'LOADING' ? 'Αποστολή...' : <> <Send className="w-5 h-5"/> Υποβολή Αιτήματος </>}
              </button>
            </form>
         </div>
      )}
    </div>
  );
}
