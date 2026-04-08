'use client';
import { useState, useRef } from 'react';
import { Plus, Settings, FileSignature, Variable, Upload, FileUp, 
         Sparkles, X, PlusCircle, Trash2, ExternalLink, FileText, Eye } from 'lucide-react';
import DocTemplateForm from './DocTemplateForm';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { uploadDocTemplate, deleteDocTemplate, updateTemplateVariables } from '@/actions/documents';
import { useRouter } from 'next/navigation';

const DOC_TYPES = [
  { id: 'vaptisi', label: 'Βαπτίσεως' },
  { id: 'gamos', label: 'Γάμου' },
  { id: 'divorce', label: 'Διαζυγίου' },
  { id: 'funeral', label: 'Κηδείας' },
  { id: 'other', label: 'Λοιπά' },
];

// Common church document variables the AI would suggest
const AI_SUGGESTED_VARIABLES = [
  { name: 'ΙΕΡΕΑΣ_ΟΝΟΜΑ', desc: 'Ονοματεπώνυμο Εφημερίου' },
  { name: 'ΝΑΟΣ_ΟΝΟΜΑ', desc: 'Ονομασία Ναού' },
  { name: 'ΝΑΟΣ_ΔΙΕΥΘΥΝΣΗ', desc: 'Διεύθυνση Ναού' },
  { name: 'ΗΜΕΡΟΜΗΝΙΑ_ΤΕΛΕΤΗΣ', desc: 'Ημερομηνία Τελετής' },
  { name: 'ΑΡΙΘΜ_ΠΡΩΤΟΚΟΛΛΟΥ', desc: 'Αριθμός Πρωτοκόλλου' },
  { name: 'ΒΙΒΛΙΟ_ΑΡΙΘΜΟΣ', desc: 'Αριθμός Βιβλίου' },
  { name: 'ΟΝΟΜΑΤΕΠΩΝΥΜΟ_1', desc: 'Κύριο πρόσωπο (Βαπτιζόμενος ή Νυμφίος)' },
  { name: 'ΟΝΟΜΑΤΕΠΩΝΥΜΟ_2', desc: 'Δεύτερο πρόσωπο (Νύμφη)' },
  { name: 'ΠΑΤΕΡΑΣ_ΟΝΟΜΑ', desc: 'Ονοματεπώνυμο Πατέρα' },
  { name: 'ΜΗΤΕΡΑ_ΟΝΟΜΑ', desc: 'Ονοματεπώνυμο Μητέρας' },
  { name: 'ΑΝΑΔΟΧΟΣ', desc: 'Ονοματεπώνυμο Αναδόχου/Νονού' },
  { name: 'ΠΑΡΑΝΥΜΦΟΣ', desc: 'Ονοματεπώνυμο Κουμπάρου' },
  { name: 'ΤΟΠΟΣ_ΓΕΝΝΗΣΗΣ', desc: 'Τόπος Γέννησης' },
  { name: 'ΗΜΕΡΟΜΗΝΙΑ_ΓΕΝΝΗΣΗΣ', desc: 'Ημερομηνία Γέννησης' },
  { name: 'ΑΔΤ', desc: 'Αριθμός Δελτίου Ταυτότητας' },
  { name: 'ΑΦΜ', desc: 'ΑΦΜ Προσώπου' },
  { name: 'ΜΗΤΡΟΠΟΛΗ', desc: 'Ιερά Μητρόπολη' },
];

export default function DocumentsClient({ initialTemplates }: any) {
  const router = useRouter();
  const [templates, setTemplates] = useState(initialTemplates || []);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Upload state
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadName, setUploadName] = useState('');
  const [uploadType, setUploadType] = useState('other');
  const [uploadVars, setUploadVars] = useState<string[]>([]);
  const [newVarName, setNewVarName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Variables detail modal
  const [varsModal, setVarsModal] = useState<any>(null);
  const [editVars, setEditVars] = useState<string[]>([]);
  const [editNewVar, setEditNewVar] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setUploadFile(f);
      // Auto-set name from filename
      const baseName = f.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
      setUploadName(baseName);
    }
  };

  const addVariable = (name: string) => {
    const clean = name.trim().toUpperCase().replace(/\s+/g, '_');
    if (clean && !uploadVars.includes(clean)) {
      setUploadVars([...uploadVars, clean]);
    }
    setNewVarName('');
  };

  const removeVariable = (name: string) => {
    setUploadVars(uploadVars.filter(v => v !== name));
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
      setUploadOpen(false);
      setUploadFile(null);
      setUploadName('');
      setUploadVars([]);
      router.refresh();
    } else {
      alert(res.error || 'Αποτυχία ανεβάσματος');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Διαγραφή προτύπου;')) return;
    await deleteDocTemplate(id);
    router.refresh();
  };

  const handleSaveVars = async () => {
    if (!varsModal) return;
    await updateTemplateVariables(varsModal.id, editVars);
    setVarsModal(null);
    router.refresh();
  };

  const addEditVar = (name: string) => {
    const clean = name.trim().toUpperCase().replace(/\s+/g, '_');
    if (clean && !editVars.includes(clean)) {
      setEditVars([...editVars, clean]);
    }
    setEditNewVar('');
  };

  const getVarsFromTemplate = (tpl: any): string[] => {
    try {
      if (tpl.context) return JSON.parse(tpl.context);
    } catch {}
    // If HTML template, extract from content
    if (tpl.htmlContent) {
      const regex = /\{\{([^}]+)\}\}/g;
      const found = new Set<string>();
      let m;
      while ((m = regex.exec(tpl.htmlContent)) !== null) found.add(m[1].trim());
      return Array.from(found);
    }
    return [];
  };

  return (
    <div className="container-fluid mt-6 space-y-6 animate-in fade-in zoom-in-95 duration-500">
      
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Πρότυπα Εγγράφων <span className="text-xs bg-brand-light text-brand font-black px-2 py-0.5 rounded-full uppercase tracking-widest border border-brand/20">Engine v2</span>
          </h1>
          <p className="text-muted-foreground mt-1 text-sm max-w-2xl">
            Σχεδιάστε HTML πρότυπα <b>ή ανεβάστε τα έτοιμα PDF/DOCX</b> σας. Μαρκάρετε τις μεταβλητές <code className="bg-slate-200 px-1 rounded text-xs">{`{{ΜΕΤΑΒΛΗΤΗ}}`}</code> και το σύστημα θα τις συμπληρώνει αυτόματα!
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setUploadOpen(true)}
            className="btn btn-secondary flex items-center gap-2 shadow-sm border border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 font-bold"
          >
            <Upload className="w-4 h-4"/> Ανέβασμα PDF
          </button>
          <button
            onClick={() => { setEditingTemplate(null); setIsModalOpen(true); }}
            className="btn btn-primary flex items-center gap-2 shadow-lg shadow-brand/30"
          >
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
              {/* Type Badge */}
              {isUpload && (
                <div className="absolute top-3 right-3">
                  <span className="text-[10px] uppercase font-black bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
                    PDF Uploaded
                  </span>
                </div>
              )}
              
              <div>
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-4 transition-colors ${
                  isUpload 
                    ? 'bg-amber-50 border-amber-200 text-amber-500 group-hover:bg-amber-100' 
                    : 'bg-[var(--background)] border-[var(--border)] text-[var(--text-muted)] group-hover:text-brand group-hover:bg-brand-light/20'
                }`}>
                  {isUpload ? <FileUp className="w-6 h-6"/> : <FileSignature className="w-6 h-6"/>}
                </div>
                <h3 className="font-bold text-foreground text-lg">{tpl.nameEl}</h3>
                <p className="text-sm font-medium text-[var(--text-muted)] mt-1 uppercase tracking-widest flex items-center gap-1.5">
                  <Settings className="w-3.5 h-3.5"/> {tpl.docType}
                </p>
                
                {/* Variables Preview */}
                {vars.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {vars.slice(0, 4).map(v => (
                      <span key={v} className="text-[10px] font-mono bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded border border-indigo-100">{`{{${v}}}`}</span>
                    ))}
                    {vars.length > 4 && (
                      <span className="text-[10px] font-bold text-[var(--text-muted)]">+{vars.length - 4} ακόμα</span>
                    )}
                  </div>
                )}
              </div>
              
              <div className="mt-6 border-t border-[var(--border)] pt-4 flex gap-2">
                {isUpload ? (
                  <>
                    <a href={tpl.fileUrl} target="_blank" rel="noreferrer" className="flex-1 btn btn-ghost btn-sm bg-[var(--background)] text-slate-700 hover:bg-[var(--surface-hover)] border border-[var(--border)] shadow-sm flex items-center justify-center gap-1">
                      <ExternalLink className="w-3.5 h-3.5"/> Προβολή
                    </a>
                    <button 
                      onClick={() => { setVarsModal(tpl); setEditVars(vars); setEditNewVar(''); }}
                      className="flex-1 btn btn-ghost btn-sm bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 shadow-sm flex items-center justify-center gap-1"
                    >
                      <Variable className="w-3.5 h-3.5"/> Μεταβλητές ({vars.length})
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => { setEditingTemplate(tpl); setIsModalOpen(true); }} 
                    className="flex-1 btn btn-ghost btn-sm bg-[var(--background)] text-slate-700 hover:bg-[var(--surface-hover)] border border-[var(--border)] shadow-sm"
                  >
                    Επεξεργασία
                  </button>
                )}
                <button 
                  onClick={() => handleDelete(tpl.id)}
                  className="btn btn-ghost btn-sm text-red-500 hover:bg-red-50 border border-red-200"
                >
                  <Trash2 className="w-3.5 h-3.5"/>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {templates.length === 0 && (
        <Card className="border-dashed border-2 shadow-none py-12 flex flex-col items-center justify-center bg-[var(--background)]/50">
          <Variable className="w-16 h-16 text-slate-300 mb-4" />
          <CardTitle className="text-[var(--text-secondary)] mb-1">Κανένα Πρότυπο</CardTitle>
          <CardDescription className="max-w-md text-center">
            Μπορείτε να <b>ανεβάσετε ένα PDF</b> ή να <b>σχεδιάσετε ένα HTML πρότυπο</b> από το μηδέν.
          </CardDescription>
        </Card>
      )}

      {/* ═══════════════════ HTML Template Editor (existing) ═══════════════════ */}
      {isModalOpen && (
        <DocTemplateForm 
          template={editingTemplate} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}

      {/* ═══════════════════ UPLOAD PDF MODAL ═══════════════════ */}
      {uploadOpen && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4" onClick={() => setUploadOpen(false)}>
          <div className="bg-[var(--surface)] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-0 animate-in zoom-in-95 fade-in duration-200" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="p-6 border-b border-[var(--border)] bg-gradient-to-r from-amber-50 to-orange-50">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-black flex items-center gap-2 text-slate-800">
                    <FileUp className="w-6 h-6 text-amber-600"/> Ανέβασμα Υπάρχοντος Εγγράφου
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Ανεβάστε το PDF/DOCX σας και μαρκάρετε τα πεδία που αλλάζουν κάθε φορά.
                  </p>
                </div>
                <button onClick={() => setUploadOpen(false)} className="p-1 rounded hover:bg-white/50"><X className="w-5 h-5"/></button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* File Drop */}
              <div 
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  uploadFile ? 'border-emerald-300 bg-emerald-50' : 'border-slate-300 hover:border-amber-400 hover:bg-amber-50/50'
                }`}
              >
                <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleFileSelect} />
                {uploadFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileText className="w-8 h-8 text-emerald-600"/>
                    <div className="text-left">
                      <p className="font-bold text-emerald-800">{uploadFile.name}</p>
                      <p className="text-xs text-emerald-600">{(uploadFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3"/>
                    <p className="font-bold text-slate-600">Κάντε κλικ ή σύρετε το αρχείο PDF/DOCX</p>
                    <p className="text-xs text-slate-400 mt-1">Μέγιστο μέγεθος: 10MB</p>
                  </>
                )}
              </div>

              {/* Name + Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">Ονομασία Εγγράφου *</label>
                  <input 
                    type="text" 
                    value={uploadName} 
                    onChange={e => setUploadName(e.target.value)}
                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-400"
                    placeholder="π.χ. Πιστοποιητικό Αγαμίας"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">Κατηγορία</label>
                  <select 
                    value={uploadType} 
                    onChange={e => setUploadType(e.target.value)}
                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm"
                  >
                    {DOC_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Variables Section */}
              <div className="bg-indigo-50/50 border border-indigo-200 rounded-xl p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-indigo-900 flex items-center gap-2">
                    <Variable className="w-5 h-5"/> Μεταβλητές Εγγράφου
                  </h4>
                  <button 
                    onClick={() => setShowAISuggestions(!showAISuggestions)}
                    className="text-xs font-bold flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:opacity-90 transition-opacity shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5"/> {showAISuggestions ? 'Κλείσιμο' : 'AI Πρόταση'}
                  </button>
                </div>
                <p className="text-xs text-indigo-700">
                  Προσθέστε τα πεδία που αλλάζουν σε κάθε εκτύπωση (π.χ. Ονοματεπώνυμο, Ημ/νια). 
                  Κάθε μεταβλητή θα γίνει πεδίο φόρμας κατά τη δημιουργία του εγγράφου.
                </p>

                {/* AI Suggestions */}
                {showAISuggestions && (
                  <div className="bg-white rounded-lg border border-purple-200 p-4 space-y-2 animate-in slide-in-from-top-2 fade-in duration-300">
                    <p className="text-xs font-bold text-purple-700 flex items-center gap-1 mb-2">
                      <Sparkles className="w-3.5 h-3.5"/> Προτεινόμενα Πεδία (κλικ για προσθήκη)
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {AI_SUGGESTED_VARIABLES.map(v => (
                        <button
                          key={v.name}
                          onClick={() => addVariable(v.name)}
                          disabled={uploadVars.includes(v.name)}
                          className={`text-[11px] font-bold px-2 py-1 rounded-lg border transition-all ${
                            uploadVars.includes(v.name) 
                              ? 'bg-emerald-50 text-emerald-400 border-emerald-200 cursor-not-allowed' 
                              : 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 hover:scale-105'
                          }`}
                          title={v.desc}
                        >
                          {uploadVars.includes(v.name) ? '✓ ' : '+ '}{v.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Manual Add */}
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newVarName}
                    onChange={e => setNewVarName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addVariable(newVarName); } }}
                    placeholder="π.χ. ΕΠΩΝΥΜΟ_ΓΑΜΠΡΟΥ"
                    className="flex-1 bg-white border border-indigo-200 rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-indigo-400"
                  />
                  <button 
                    onClick={() => addVariable(newVarName)}
                    disabled={!newVarName.trim()}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 disabled:opacity-30 flex items-center gap-1"
                  >
                    <PlusCircle className="w-4 h-4"/> Προσθήκη
                  </button>
                </div>

                {/* Added Variables */}
                {uploadVars.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {uploadVars.map(v => (
                      <span key={v} className="inline-flex items-center gap-1.5 bg-white border border-indigo-200 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-indigo-700 shadow-sm animate-in zoom-in-95 fade-in">
                        {`{{${v}}}`}
                        <button onClick={() => removeVariable(v)} className="text-red-400 hover:text-red-600 transition-colors">
                          <X className="w-3 h-3"/>
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                {uploadVars.length === 0 && !showAISuggestions && (
                  <p className="text-xs text-indigo-400 italic text-center py-2">
                    Δεν έχετε προσθέσει μεταβλητές ακόμα. Πατήστε "AI Πρόταση" για αυτόματες προτάσεις!
                  </p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-[var(--border)] bg-[var(--background)]/50 flex justify-between items-center">
              <p className="text-xs text-[var(--text-muted)]">{uploadVars.length} μεταβλητές μαρκαρισμένες</p>
              <div className="flex gap-2">
                <button onClick={() => setUploadOpen(false)} className="px-4 py-2 rounded-lg text-sm font-bold text-[var(--text-muted)] hover:bg-[var(--background)]">Ακύρωση</button>
                <button 
                  onClick={handleUpload}
                  disabled={uploading || !uploadFile || !uploadName}
                  className="px-6 py-2 rounded-lg text-sm font-bold bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-40 flex items-center gap-2 shadow-lg shadow-amber-200"
                >
                  {uploading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> : <Upload className="w-4 h-4"/>}
                  Ανέβασμα & Αποθήκευση
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════ VARIABLE EDIT MODAL (for existing uploaded templates) ═══════════════════ */}
      {varsModal && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4" onClick={() => setVarsModal(null)}>
          <div className="bg-[var(--surface)] rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5 animate-in zoom-in-95 fade-in duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-black flex items-center gap-2"><Variable className="w-5 h-5 text-indigo-600"/> Μεταβλητές: {varsModal.nameEl}</h3>
              <button onClick={() => setVarsModal(null)} className="p-1 rounded hover:bg-[var(--background)]"><X className="w-5 h-5"/></button>
            </div>
            
            <div className="space-y-3">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={editNewVar}
                  onChange={e => setEditNewVar(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addEditVar(editNewVar); } }}
                  placeholder="Νέα μεταβλητή..."
                  className="flex-1 bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-indigo-400"
                />
                <button onClick={() => addEditVar(editNewVar)} disabled={!editNewVar.trim()} className="px-3 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm disabled:opacity-30">
                  <PlusCircle className="w-4 h-4"/>
                </button>
              </div>

              {/* Quick AI add */}
              <div className="flex flex-wrap gap-1">
                {AI_SUGGESTED_VARIABLES.slice(0, 8).map(v => (
                  <button
                    key={v.name}
                    onClick={() => addEditVar(v.name)}
                    disabled={editVars.includes(v.name)}
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${editVars.includes(v.name) ? 'bg-gray-50 text-gray-300 border-gray-100' : 'bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100'}`}
                    title={v.desc}
                  >
                    +{v.name}
                  </button>
                ))}
              </div>

              <div className="space-y-1.5 max-h-[250px] overflow-y-auto">
                {editVars.map(v => (
                  <div key={v} className="flex items-center justify-between bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2">
                    <code className="text-xs font-bold text-indigo-700">{`{{${v}}}`}</code>
                    <button onClick={() => setEditVars(editVars.filter(x => x !== v))} className="text-red-400 hover:text-red-600">
                      <X className="w-3.5 h-3.5"/>
                    </button>
                  </div>
                ))}
                {editVars.length === 0 && <p className="text-xs text-[var(--text-muted)] text-center py-4">Χωρίς μεταβλητές</p>}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setVarsModal(null)} className="px-4 py-2 rounded-lg text-sm font-bold text-[var(--text-muted)]">Ακύρωση</button>
              <button onClick={handleSaveVars} className="px-5 py-2 rounded-lg text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700">
                Αποθήκευση ({editVars.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
