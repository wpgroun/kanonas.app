'use client';
import { useState, useRef, useCallback } from 'react';
import { Plus, Settings, FileSignature, Variable, Upload, FileUp, 
         Sparkles, X, PlusCircle, Trash2, ExternalLink, FileText, Eye,
         ChevronRight, ChevronLeft, CheckCircle2, Loader2, GripVertical,
         HelpCircle, Zap, ArrowRight } from 'lucide-react';
import DocTemplateForm from './DocTemplateForm';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { uploadDocTemplate, deleteDocTemplate, updateTemplateVariables } from '@/actions/documents';
import { useRouter } from 'next/navigation';

const DOC_TYPES = [
  { id: 'vaptisi', label: 'Βαπτίσεως', emoji: '💧' },
  { id: 'gamos', label: 'Γάμου', emoji: '💍' },
  { id: 'divorce', label: 'Διαζυγίου', emoji: '📋' },
  { id: 'funeral', label: 'Κηδείας', emoji: '🕯️' },
  { id: 'other', label: 'Λοιπά', emoji: '📄' },
];

// Predefined variable groups for smart suggestions
const VAR_GROUPS = [
  { 
    group: 'Ναός & Ιερέας', 
    vars: [
      { name: 'ΙΕΡΕΑΣ_ΟΝΟΜΑ', desc: 'Ονοματεπώνυμο Εφημερίου' },
      { name: 'ΝΑΟΣ_ΟΝΟΜΑ', desc: 'Ονομασία Ναού' },
      { name: 'ΝΑΟΣ_ΔΙΕΥΘΥΝΣΗ', desc: 'Διεύθυνση Ναού' },
      { name: 'ΜΗΤΡΟΠΟΛΗ', desc: 'Ιερά Μητρόπολη' },
    ]
  },
  {
    group: 'Έγγραφο',
    vars: [
      { name: 'ΗΜΕΡΟΜΗΝΙΑ_ΤΕΛΕΤΗΣ', desc: 'Ημερομηνία Τελετής' },
      { name: 'ΑΡΙΘΜ_ΠΡΩΤΟΚΟΛΛΟΥ', desc: 'Αριθμός Πρωτοκόλλου' },
      { name: 'ΒΙΒΛΙΟ_ΑΡΙΘΜΟΣ', desc: 'Αριθμός Βιβλίου' },
    ]
  },
  {
    group: 'Πρωταγωνιστές',
    vars: [
      { name: 'ΟΝΟΜΑΤΕΠΩΝΥΜΟ_1', desc: 'Κύριο πρόσωπο' },
      { name: 'ΟΝΟΜΑΤΕΠΩΝΥΜΟ_2', desc: 'Δεύτερο πρόσωπο' },
      { name: 'ΠΑΤΕΡΑΣ_ΟΝΟΜΑ', desc: 'Ονοματεπώνυμο Πατέρα' },
      { name: 'ΜΗΤΕΡΑ_ΟΝΟΜΑ', desc: 'Ονοματεπώνυμο Μητέρας' },
      { name: 'ΑΝΑΔΟΧΟΣ', desc: 'Ονοματεπώνυμο Αναδόχου/Νονού' },
      { name: 'ΠΑΡΑΝΥΜΦΟΣ', desc: 'Ονοματεπώνυμο Κουμπάρου' },
    ]
  },
  {
    group: 'Στοιχεία Ταυτότητας',
    vars: [
      { name: 'ΤΟΠΟΣ_ΓΕΝΝΗΣΗΣ', desc: 'Τόπος Γέννησης' },
      { name: 'ΗΜΕΡΟΜΗΝΙΑ_ΓΕΝΝΗΣΗΣ', desc: 'Ημερομηνία Γέννησης' },
      { name: 'ΑΔΤ', desc: 'Αριθμός Ταυτότητας' },
      { name: 'ΑΦΜ', desc: 'ΑΦΜ' },
      { name: 'ΔΙΕΥΘΥΝΣΗ', desc: 'Διεύθυνση Κατοικίας' },
      { name: 'ΤΗΛΕΦΩΝΟ', desc: 'Τηλέφωνο' },
    ]
  },
];

export default function DocumentsClient({ initialTemplates }: any) {
  const router = useRouter();
  const [templates, setTemplates] = useState(initialTemplates || []);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Upload wizard state
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(0); // 0=file, 1=info, 2=variables, 3=confirm
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadName, setUploadName] = useState('');
  const [uploadType, setUploadType] = useState('other');
  const [uploadVars, setUploadVars] = useState<string[]>([]);
  const [newVarName, setNewVarName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Vars editor modal
  const [varsModal, setVarsModal] = useState<any>(null);
  const [editVars, setEditVars] = useState<string[]>([]);
  const [editNewVar, setEditNewVar] = useState('');

  // ── Drag & Drop ──
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      const f = e.dataTransfer.files[0];
      setUploadFile(f);
      setUploadName(f.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));
      setWizardStep(1);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setUploadFile(f);
      setUploadName(f.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));
      setWizardStep(1);
    }
  };

  const addVariable = (name: string) => {
    const clean = name.trim().toUpperCase().replace(/\s+/g, '_');
    if (clean && !uploadVars.includes(clean)) setUploadVars([...uploadVars, clean]);
    setNewVarName('');
  };

  const handleUpload = async () => {
    if (!uploadFile || !uploadName) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', uploadFile);
    fd.append('nameEl', uploadName);
    fd.append('docType', uploadType);
    fd.append('variables', JSON.stringify(uploadVars));
    const res = await uploadDocTemplate(fd);
    setUploading(false);
    if (res.success) {
      resetWizard();
      router.refresh();
    } else alert(res.error || 'Αποτυχία');
  };

  const resetWizard = () => {
    setWizardOpen(false); setWizardStep(0);
    setUploadFile(null); setUploadName(''); setUploadVars([]); setUploadType('other');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Διαγραφή προτύπου;')) return;
    await deleteDocTemplate(id); router.refresh();
  };

  const handleSaveVars = async () => {
    if (!varsModal) return;
    await updateTemplateVariables(varsModal.id, editVars);
    setVarsModal(null); router.refresh();
  };

  const addEditVar = (name: string) => {
    const clean = name.trim().toUpperCase().replace(/\s+/g, '_');
    if (clean && !editVars.includes(clean)) setEditVars([...editVars, clean]);
    setEditNewVar('');
  };

  const getVarsFromTemplate = (tpl: any): string[] => {
    try { if (tpl.context) return JSON.parse(tpl.context); } catch {}
    if (tpl.htmlContent) {
      const regex = /\{\{([^}]+)\}\}/g;
      const found = new Set<string>(); let m;
      while ((m = regex.exec(tpl.htmlContent)) !== null) found.add(m[1].trim());
      return Array.from(found);
    }
    return [];
  };

  const WIZARD_STEPS = ['Αρχείο', 'Στοιχεία', 'Μεταβλητές', 'Επιβεβαίωση'];

  return (
    <div className="container-fluid mt-6 space-y-6 animate-in fade-in zoom-in-95 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Πρότυπα Εγγράφων <span className="text-xs bg-brand-light text-brand font-black px-2 py-0.5 rounded-full uppercase tracking-widest border border-brand/20">Μηχανή v2</span>
          </h1>
          <p className="text-muted-foreground mt-1 text-sm max-w-2xl">
            Σχεδιάστε HTML πρότυπα <b>ή ανεβάστε τα υπάρχοντα PDF/DOCX</b> σας. Ο οδηγός σας καθοδηγεί βήμα-βήμα!
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { resetWizard(); setWizardOpen(true); }} className="btn btn-secondary flex items-center gap-2 shadow-sm border border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 font-bold">
            <Upload className="w-4 h-4"/> Ανέβασμα PDF
          </button>
          <button onClick={() => { setEditingTemplate(null); setIsModalOpen(true); }} className="btn btn-primary flex items-center gap-2 shadow-lg shadow-brand/30">
            <Plus className="w-5 h-5"/> Σχεδίαση Νέου
          </button>
        </div>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
        {templates.map((tpl: any) => {
          const vars = getVarsFromTemplate(tpl);
          const isUpload = !!tpl.fileUrl && !tpl.htmlContent;
          return (
            <div key={tpl.id} className="card hover:border-brand/30 transition-all p-5 group flex flex-col justify-between h-auto shadow-sm relative">
              {isUpload && <div className="absolute top-3 right-3"><span className="text-[10px] uppercase font-black bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">PDF</span></div>}
              <div>
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-4 transition-colors ${isUpload ? 'bg-amber-50 border-amber-200 text-amber-500 group-hover:bg-amber-100' : 'bg-[var(--background)] border-[var(--border)] text-[var(--text-muted)] group-hover:text-brand group-hover:bg-brand-light/20'}`}>
                  {isUpload ? <FileUp className="w-6 h-6"/> : <FileSignature className="w-6 h-6"/>}
                </div>
                <h3 className="font-bold text-foreground text-lg">{tpl.nameEl}</h3>
                <p className="text-sm font-medium text-[var(--text-muted)] mt-1 flex items-center gap-1.5">
                  {DOC_TYPES.find(d => d.id === tpl.docType)?.emoji || '📄'} {DOC_TYPES.find(d => d.id === tpl.docType)?.label || tpl.docType}
                </p>
                {vars.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {vars.slice(0, 4).map(v => <span key={v} className="text-[10px] font-mono bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded border border-indigo-100">{`{{${v}}}`}</span>)}
                    {vars.length > 4 && <span className="text-[10px] font-bold text-[var(--text-muted)]">+{vars.length - 4}</span>}
                  </div>
                )}
              </div>
              <div className="mt-6 border-t border-[var(--border)] pt-4 flex gap-2">
                {isUpload ? (
                  <>
                    <a href={tpl.fileUrl} target="_blank" rel="noreferrer" className="flex-1 btn btn-ghost btn-sm bg-[var(--background)] text-slate-700 hover:bg-[var(--surface-hover)] border border-[var(--border)] shadow-sm flex items-center justify-center gap-1"><ExternalLink className="w-3.5 h-3.5"/> Προβολή</a>
                    <button onClick={() => { setVarsModal(tpl); setEditVars(vars); setEditNewVar(''); }} className="flex-1 btn btn-ghost btn-sm bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 shadow-sm flex items-center justify-center gap-1"><Variable className="w-3.5 h-3.5"/> ({vars.length})</button>
                  </>
                ) : (
                  <button onClick={() => { setEditingTemplate(tpl); setIsModalOpen(true); }} className="flex-1 btn btn-ghost btn-sm bg-[var(--background)] text-slate-700 hover:bg-[var(--surface-hover)] border border-[var(--border)] shadow-sm">Επεξεργασία</button>
                )}
                <button onClick={() => handleDelete(tpl.id)} className="btn btn-ghost btn-sm text-red-500 hover:bg-red-50 border border-red-200"><Trash2 className="w-3.5 h-3.5"/></button>
              </div>
            </div>
          );
        })}
      </div>

      {templates.length === 0 && (
        <Card className="border-dashed border-2 shadow-none py-12 flex flex-col items-center justify-center bg-[var(--background)]/50">
          <Variable className="w-16 h-16 text-slate-300 mb-4" />
          <CardTitle className="text-[var(--text-secondary)] mb-1">Ξεκινήστε!</CardTitle>
          <CardDescription className="max-w-md text-center">
            <b>Ανεβάστε ένα PDF</b> που ήδη χρησιμοποιείτε ή <b>σχεδιάστε ένα HTML πρότυπο</b> με τη μηχανή μας.
          </CardDescription>
          <div className="flex gap-3 mt-6">
            <button onClick={() => { resetWizard(); setWizardOpen(true); }} className="btn btn-secondary flex items-center gap-2 border-amber-300 bg-amber-50 text-amber-700"><Upload className="w-4 h-4"/> Ανέβασμα</button>
            <button onClick={() => { setEditingTemplate(null); setIsModalOpen(true); }} className="btn btn-primary flex items-center gap-2"><Plus className="w-4 h-4"/> Σχεδίαση</button>
          </div>
        </Card>
      )}

      {/* ═══════════════ HTML Editor Modal ═══════════════ */}
      {isModalOpen && <DocTemplateForm template={editingTemplate} onClose={() => setIsModalOpen(false)} />}

      {/* ═══════════════ UPLOAD WIZARD (Step-by-Step) ═══════════════ */}
      {wizardOpen && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4" onClick={resetWizard}>
          <div className="bg-[var(--surface)] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 fade-in duration-200" onClick={e => e.stopPropagation()}>
            
            {/* Stepper Header */}
            <div className="p-5 border-b border-[var(--border)] bg-[var(--background)]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-black flex items-center gap-2"><FileUp className="w-5 h-5 text-amber-600"/> Οδηγός Ανεβάσματος</h3>
                <button onClick={resetWizard} className="p-1 rounded hover:bg-[var(--surface)]"><X className="w-5 h-5"/></button>
              </div>
              <div className="flex gap-1">
                {WIZARD_STEPS.map((step, i) => (
                  <div key={i} className={`flex-1 text-center py-1.5 rounded-lg text-xs font-bold transition-all ${i === wizardStep ? 'bg-amber-500 text-white shadow-md' : i < wizardStep ? 'bg-emerald-100 text-emerald-700' : 'bg-[var(--surface)] text-[var(--text-muted)]'}`}>
                    {i < wizardStep ? '✓' : i + 1}. {step}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {/* ── Step 0: File Upload ── */}
              {wizardStep === 0 && (
                <div className="space-y-4">
                  <div 
                    onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                    onClick={() => fileRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${dragActive ? 'border-amber-400 bg-amber-50 scale-[1.02]' : 'border-slate-300 hover:border-amber-400 hover:bg-amber-50/30'}`}
                  >
                    <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleFileSelect} />
                    <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4"/>
                    <p className="font-bold text-slate-600 text-lg">Σύρετε το αρχείο εδώ ή κάντε κλικ</p>
                    <p className="text-sm text-slate-400 mt-2">PDF, DOC, DOCX — Μέγιστο 10MB</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3 items-start">
                    <HelpCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0"/>
                    <div className="text-xs text-blue-800">
                      <p className="font-bold mb-1">Τι είναι αυτό;</p>
                      <p>Ανεβάστε τα εκκλησιαστικά έγγραφα που ήδη χρησιμοποιείτε (PDF / Word). Στο επόμενο βήμα θα μαρκάρετε ποια πεδία αλλάζουν κάθε φορά (π.χ. Ονοματεπώνυμο, Ημερομηνία) και το Kanonas θα τα συμπληρώνει αυτόματα!</p>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Step 1: Document Info ── */}
              {wizardStep === 1 && (
                <div className="space-y-5">
                  {uploadFile && (
                    <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                      <FileText className="w-8 h-8 text-emerald-600"/>
                      <div>
                        <p className="font-bold text-emerald-800">{uploadFile.name}</p>
                        <p className="text-xs text-emerald-600">{(uploadFile.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-bold text-[var(--foreground)] mb-2">Ονομασία Εγγράφου *</label>
                    <input type="text" value={uploadName} onChange={e => setUploadName(e.target.value)}
                      className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-amber-400" placeholder="π.χ. Πιστοποιητικό Αγαμίας"/>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[var(--foreground)] mb-2">Κατηγορία Μυστηρίου</label>
                    <div className="grid grid-cols-5 gap-2">
                      {DOC_TYPES.map(t => (
                        <button key={t.id} onClick={() => setUploadType(t.id)}
                          className={`py-3 rounded-xl text-center transition-all border-2 ${uploadType === t.id ? 'border-amber-500 bg-amber-50 shadow-sm' : 'border-[var(--border)] hover:border-amber-300'}`}>
                          <span className="text-xl block mb-0.5">{t.emoji}</span>
                          <span className="text-[11px] font-bold block">{t.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Step 2: Variables ── */}
              {wizardStep === 2 && (
                <div className="space-y-5">
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex gap-3 items-start">
                    <Sparkles className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0"/>
                    <div className="text-xs text-purple-800">
                      <p className="font-bold mb-1">Ποιες πληροφορίες αλλάζουν;</p>
                      <p>Επιλέξτε τα πεδία που αλλάζουν κάθε φορά. Π.χ. σε ένα Πιστοποιητικό Βάπτισης, αλλάζει το όνομα του βαπτιζομένου, του νονού, η ημερομηνία κλπ. Κλικ σε κάθε ομάδα για να προσθέσετε!</p>
                    </div>
                  </div>

                  {/* Variable Groups */}
                  {VAR_GROUPS.map(group => (
                    <div key={group.group}>
                      <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">{group.group}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {group.vars.map(v => {
                          const selected = uploadVars.includes(v.name);
                          return (
                            <button key={v.name} onClick={() => selected ? setUploadVars(uploadVars.filter(x => x !== v.name)) : addVariable(v.name)}
                              className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border transition-all ${selected ? 'bg-emerald-100 text-emerald-700 border-emerald-300 shadow-sm' : 'bg-[var(--background)] text-[var(--text-muted)] border-[var(--border)] hover:border-purple-300 hover:text-purple-700'}`}
                              title={v.desc}>
                              {selected ? '✓ ' : '+ '}{v.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {/* Manual Add */}
                  <div className="border-t border-[var(--border)] pt-4">
                    <p className="text-xs font-bold text-[var(--text-muted)] mb-2">Δική σας μεταβλητή:</p>
                    <div className="flex gap-2">
                      <input type="text" value={newVarName} onChange={e => setNewVarName(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addVariable(newVarName); } }}
                        placeholder="π.χ. ΤΟΠΟΣ_ΓΕΝΝΗΣΗΣ" className="flex-1 bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-purple-400"/>
                      <button onClick={() => addVariable(newVarName)} disabled={!newVarName.trim()} className="px-4 py-2 bg-purple-600 text-white rounded-lg font-bold text-sm hover:bg-purple-700 disabled:opacity-30">
                        <PlusCircle className="w-4 h-4"/>
                      </button>
                    </div>
                  </div>

                  {/* Selected Summary */}
                  {uploadVars.length > 0 && (
                    <div className="bg-[var(--background)] rounded-xl p-4 border border-[var(--border)]">
                      <p className="text-xs font-bold text-[var(--text-muted)] mb-2">{uploadVars.length} μεταβλητές επιλεγμένες:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {uploadVars.map(v => (
                          <span key={v} className="inline-flex items-center gap-1 bg-white border border-indigo-200 rounded-lg px-2 py-1 text-[11px] font-mono font-bold text-indigo-700 shadow-sm">
                            {`{{${v}}}`}
                            <button onClick={() => setUploadVars(uploadVars.filter(x => x !== v))} className="text-red-400 hover:text-red-600"><X className="w-2.5 h-2.5"/></button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── Step 3: Confirmation ── */}
              {wizardStep === 3 && (
                <div className="space-y-5">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center">
                    <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3"/>
                    <h3 className="text-lg font-black text-emerald-800">Έτοιμο για Ανέβασμα!</h3>
                    <p className="text-sm text-emerald-600 mt-1">Ελέγξτε τα στοιχεία και πατήστε "Ολοκλήρωση"</p>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center py-2 border-b border-[var(--border)]">
                      <span className="text-[var(--text-muted)] font-medium">Αρχείο</span>
                      <span className="font-bold">{uploadFile?.name}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-[var(--border)]">
                      <span className="text-[var(--text-muted)] font-medium">Ονομασία</span>
                      <span className="font-bold">{uploadName}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-[var(--border)]">
                      <span className="text-[var(--text-muted)] font-medium">Κατηγορία</span>
                      <span className="font-bold">{DOC_TYPES.find(d => d.id === uploadType)?.emoji} {DOC_TYPES.find(d => d.id === uploadType)?.label}</span>
                    </div>
                    <div className="flex justify-between items-start py-2">
                      <span className="text-[var(--text-muted)] font-medium">Μεταβλητές</span>
                      <div className="text-right">
                        {uploadVars.length === 0 ? <span className="text-[var(--text-muted)] italic">Καμία (θα τις προσθέσετε αργότερα)</span> : (
                          <div className="flex flex-wrap justify-end gap-1">{uploadVars.map(v => <span key={v} className="text-[10px] font-mono bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">{v}</span>)}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Navigation */}
            <div className="p-5 border-t border-[var(--border)] bg-[var(--background)] flex justify-between items-center">
              <button onClick={() => wizardStep === 0 ? resetWizard() : setWizardStep(wizardStep - 1)} className="px-4 py-2 rounded-xl text-sm font-bold text-[var(--text-muted)] hover:bg-[var(--surface)] flex items-center gap-1">
                <ChevronLeft className="w-4 h-4"/> {wizardStep === 0 ? 'Ακύρωση' : 'Πίσω'}
              </button>
              {wizardStep < 3 ? (
                <button onClick={() => setWizardStep(wizardStep + 1)} disabled={wizardStep === 0 && !uploadFile || wizardStep === 1 && !uploadName}
                  className="px-6 py-2 rounded-xl text-sm font-bold bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-40 flex items-center gap-1.5 shadow-md">
                  Επόμενο <ChevronRight className="w-4 h-4"/>
                </button>
              ) : (
                <button onClick={handleUpload} disabled={uploading}
                  className="px-8 py-2 rounded-xl text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-emerald-200">
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin"/> : <CheckCircle2 className="w-4 h-4"/>} Ολοκλήρωση
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ VARIABLE EDIT MODAL ═══════════════ */}
      {varsModal && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4" onClick={() => setVarsModal(null)}>
          <div className="bg-[var(--surface)] rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5 animate-in zoom-in-95 fade-in duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-black flex items-center gap-2"><Variable className="w-5 h-5 text-indigo-600"/> {varsModal.nameEl}</h3>
              <button onClick={() => setVarsModal(null)} className="p-1 rounded hover:bg-[var(--background)]"><X className="w-5 h-5"/></button>
            </div>
            <div className="space-y-3">
              <div className="flex gap-2">
                <input type="text" value={editNewVar} onChange={e => setEditNewVar(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addEditVar(editNewVar); } }}
                  placeholder="Νέα μεταβλητή..." className="flex-1 bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-indigo-400"/>
                <button onClick={() => addEditVar(editNewVar)} disabled={!editNewVar.trim()} className="px-3 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm disabled:opacity-30"><PlusCircle className="w-4 h-4"/></button>
              </div>
              <div className="flex flex-wrap gap-1">
                {VAR_GROUPS.flatMap(g => g.vars).slice(0, 10).map(v => (
                  <button key={v.name} onClick={() => addEditVar(v.name)} disabled={editVars.includes(v.name)}
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${editVars.includes(v.name) ? 'bg-gray-50 text-gray-300 border-gray-100' : 'bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100'}`}>
                    +{v.name}
                  </button>
                ))}
              </div>
              <div className="space-y-1.5 max-h-[250px] overflow-y-auto">
                {editVars.map(v => (
                  <div key={v} className="flex items-center justify-between bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2">
                    <code className="text-xs font-bold text-indigo-700">{`{{${v}}}`}</code>
                    <button onClick={() => setEditVars(editVars.filter(x => x !== v))} className="text-red-400 hover:text-red-600"><X className="w-3.5 h-3.5"/></button>
                  </div>
                ))}
                {editVars.length === 0 && <p className="text-xs text-[var(--text-muted)] text-center py-4">Χωρίς μεταβλητές</p>}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setVarsModal(null)} className="px-4 py-2 rounded-lg text-sm font-bold text-[var(--text-muted)]">Ακύρωση</button>
              <button onClick={handleSaveVars} className="px-5 py-2 rounded-lg text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700">Αποθήκευση ({editVars.length})</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
