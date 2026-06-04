'use client';
import { useState, useRef, useCallback } from 'react';
import { Plus, FileSignature, Upload, FileUp,
 Sparkles, X, Trash2, ExternalLink, FileText,
 ChevronRight, ChevronLeft, CheckCircle2, Loader2,
 HelpCircle, AlertTriangle, Wand2, Tag } from 'lucide-react';
import DocTemplateForm from './DocTemplateForm';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { uploadDocTemplate, deleteDocTemplate, updateDocTemplateType } from '@/actions/documents';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const DOC_TYPES = [
 { id: 'vaptisi', label: 'Βαπτίσεως', emoji: '💧' },
 { id: 'gamos', label: 'Γάμου', emoji: '💍' },
 { id: 'divorce', label: 'Διαζυγίου', emoji: '📋' },
 { id: 'funeral', label: 'Κηδείας', emoji: '🕯️' },
 { id: 'other', label: 'Λοιπά', emoji: '📄' },
];

export default function DocumentsClient({ initialTemplates }: any) {
 const router = useRouter();
 const templates = initialTemplates || [];
 const [editingTemplate, setEditingTemplate] = useState<any>(null);
 const [isModalOpen, setIsModalOpen] = useState(false);

 // Upload wizard state
 const [wizardOpen, setWizardOpen] = useState(false);
 const [wizardStep, setWizardStep] = useState(0); // 0=file, 1=info
 const [uploadFile, setUploadFile] = useState<File | null>(null);
 const [uploadName, setUploadName] = useState('');
 const [uploadType, setUploadType] = useState('');
 const [uploadVisibility, setUploadVisibility] = useState('internal');
 const [uploading, setUploading] = useState(false);
 const [dragActive, setDragActive] = useState(false);
 const fileRef = useRef<HTMLInputElement>(null);

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

 const handleUpload = async () => {
 if (!uploadFile || !uploadName || !uploadType) return;
 setUploading(true);
 const fd = new FormData();
 fd.append('file', uploadFile);
 fd.append('nameEl', uploadName);
 fd.append('docType', uploadType);
 fd.append('visibility', uploadVisibility);
 const res = await uploadDocTemplate(fd);
 setUploading(false);
 alert(`DEBUG upload result:\nsuccess=${res.success}\ntemplatId=${res.templateId}\nerror=${res.error}`);
 if (res.success) {
   resetWizard();
   if (res.templateId) {
     router.push(`/admin/documents/${res.templateId}/variables`);
   } else {
     router.refresh();
   }
 } else {
   alert(res.error || 'Αποτυχία ανεβάσματος');
 }
 };

 const resetWizard = () => {
 setWizardOpen(false); setWizardStep(0);
 setUploadFile(null); setUploadName('');
 setUploadType(''); setUploadVisibility('internal');
 };

 const handleDelete = async (id: string) => {
 if (!confirm('Διαγραφή προτύπου;')) return;
 await deleteDocTemplate(id); router.refresh();
 };

 const handleChangeType = async (id: string, currentType: string) => {
   const newType = prompt(
     `Αλλαγή κατηγορίας (τρέχουσα: ${currentType}):\nvaptisi / gamos / divorce / funeral / other`,
     currentType
   );
   if (!newType || newType === currentType) return;
   const valid = ['vaptisi','gamos','divorce','funeral','other'];
   if (!valid.includes(newType)) { alert('Μη έγκυρη κατηγορία'); return; }
   await updateDocTemplateType(id, newType);
   router.refresh();
 };

 const getVarsFromTemplate = (tpl: any): string[] => {
 try {
 if (tpl.context) {
 const parsed = JSON.parse(tpl.context);
 if (Array.isArray(parsed)) return parsed;
 return parsed.vars || [];
 }
 } catch {}
 if (tpl.htmlContent) {
 const regex = /\{\{([^}]+)\}\}/g;
 const found = new Set<string>(); let m;
 while ((m = regex.exec(tpl.htmlContent)) !== null) found.add(m[1].trim());
 return Array.from(found);
 }
 return [];
 };

 const WIZARD_STEPS = ['Αρχείο', 'Στοιχεία'];

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
 <div className="flex gap-2 flex-wrap">
 <Link href="/admin/documents/generate" className="btn btn-secondary flex items-center gap-2 shadow-sm border border-emerald-300 badge badge-success hover:bg-emerald-100 font-bold">
 <Sparkles className="w-4 h-4"/> Δημιουργία Εγγράφου
 </Link>
 <button onClick={() => { resetWizard(); setWizardOpen(true); }} className="btn btn-secondary flex items-center gap-2 shadow-sm border border-amber-300 badge badge-warning hover:bg-amber-100 font-bold">
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
 {isUpload && (
 <div className="absolute top-3 right-3 flex gap-1.5 items-center">
 {tpl.needsMapping && (
 <Link href={`/admin/documents/${tpl.id}/variables`} onClick={e => e.stopPropagation()} title="Ορισμένες μεταβλητές χρειάζονται αντιστοίχηση">
 <span className="text-[10px] uppercase font-black bg-amber-500 text-white px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm hover:bg-amber-600 transition-colors cursor-pointer">
 <AlertTriangle className="w-2.5 h-2.5 inline" /> Αντιστ.
 </span>
 </Link>
 )}
 <span className="text-[10px] uppercase font-black badge badge-warning px-2 py-0.5 rounded-full border border-amber-200">PDF</span>
 </div>
 )}
 <div>
 <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-4 transition-colors ${isUpload ? 'bg-amber-50 border-amber-200 text-amber-500 group-hover:bg-amber-100' : 'bg-[var(--background)] border-[var(--border)] text-[var(--text-muted)] group-hover:text-brand group-hover:bg-brand-light/20'}`}>
 {isUpload ? <FileUp className="w-6 h-6"/> : <FileSignature className="w-6 h-6"/>}
 </div>
 <h3 className="font-bold text-foreground text-lg">{tpl.nameEl}</h3>
 <p className="text-sm font-medium text-[var(--text-muted)] mt-1 flex items-center gap-1.5 flex-wrap">
 <span className="flex items-center gap-1">{DOC_TYPES.find(d => d.id === tpl.docType)?.emoji || '📄'} {DOC_TYPES.find(d => d.id === tpl.docType)?.label || tpl.docType}</span>
 {tpl.visibility === 'citizen' && <span className="ml-1 text-[10px] uppercase font-bold badge badge-info px-2 py-0.5 rounded-md">👤 Προς Ενορίτη</span>}
 {tpl.visibility === 'metropolis' && <span className="ml-1 text-[10px] uppercase font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-md">⛪ Προς Μητρόπολη</span>}
 {(!tpl.visibility || tpl.visibility === 'internal') && <span className="ml-1 text-[10px] uppercase font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">🏠 Εσωτερικό</span>}
 </p>
 {vars.length > 0 && (
 <div className="mt-3 flex flex-wrap gap-1">
 {vars.slice(0, 4).map(v => <span key={v} className="text-[10px] font-mono bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded border border-indigo-100">{`{{${v}}}`}</span>)}
 {vars.length > 4 && <span className="text-[10px] font-bold text-[var(--text-muted)]">+{vars.length - 4}</span>}
 </div>
 )}
 </div>
 <div className="mt-6 border-t border-[var(--border)] pt-4 flex flex-col gap-2">
 <Link href={`/admin/documents/generate?templateId=${tpl.id}`} className="w-full py-2 rounded-xl text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 flex items-center justify-center gap-2 shadow-md transition-all active:scale-95">
 <FileSignature className="w-4 h-4"/> Δημιουργία
 </Link>
 <div className="flex gap-2">
 {isUpload ? (
 <>
 <a href={tpl.fileUrl} target="_blank" rel="noreferrer" className="py-1.5 px-2 rounded-lg text-xs font-bold bg-[var(--background)] text-slate-700 hover:bg-[var(--surface-hover)] border border-[var(--border)] shadow-sm flex items-center justify-center gap-1.5"><ExternalLink className="w-3.5 h-3.5"/> Αρχείο</a>
 <button onClick={() => handleChangeType(tpl.id, tpl.docType)} title="Αλλαγή κατηγορίας μυστηρίου" className={`px-2 py-1.5 rounded-lg text-xs font-bold border shadow-sm flex items-center justify-center gap-1 ${tpl.docType === 'other' ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' : 'bg-[var(--background)] text-slate-500 border-[var(--border)] hover:bg-[var(--surface-hover)]'}`}><Tag className="w-3 h-3"/>{tpl.docType === 'other' ? '!' : ''}</button>
 <Link href={`/admin/documents/${tpl.id}/variables`} className={`flex-1 py-1.5 rounded-lg text-xs font-bold border shadow-sm flex items-center justify-center gap-1.5 ${tpl.needsMapping ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-300' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200'}`}>
 {tpl.needsMapping ? <AlertTriangle className="w-3.5 h-3.5"/> : <Wand2 className="w-3.5 h-3.5"/>} Αντιστοίχηση
 </Link>
 </>
 ) : (
 <button onClick={() => { setEditingTemplate(tpl); setIsModalOpen(true); }} className="flex-1 py-1.5 rounded-lg text-xs font-bold bg-[var(--background)] text-slate-700 hover:bg-[var(--surface-hover)] border border-[var(--border)] shadow-sm">Επεξεργασία</button>
 )}
 <button onClick={() => handleDelete(tpl.id)} className="px-3 py-1.5 rounded-lg text-sm font-bold text-red-500 hover:bg-red-50 border border-red-200 flex items-center justify-center"><Trash2 className="w-4 h-4"/></button>
 </div>
 </div>
 </div>
 );
 })}
 </div>

 {templates.length === 0 && (
 <Card className="border-dashed border-2 shadow-none py-12 flex flex-col items-center justify-center bg-[var(--background)]/50">
 <FileUp className="w-16 h-16 text-slate-300 mb-4" />
 <CardTitle className="text-[var(--text-secondary)] mb-1">Ξεκινήστε!</CardTitle>
 <CardDescription className="max-w-md text-center">
 <b>Ανεβάστε ένα PDF</b> που ήδη χρησιμοποιείτε ή <b>σχεδιάστε ένα HTML πρότυπο</b> με τη μηχανή μας.
 </CardDescription>
 <div className="flex gap-3 mt-6">
 <button onClick={() => { resetWizard(); setWizardOpen(true); }} className="btn btn-secondary flex items-center gap-2 border-amber-300 badge badge-warning"><Upload className="w-4 h-4"/> Ανέβασμα</button>
 <button onClick={() => { setEditingTemplate(null); setIsModalOpen(true); }} className="btn btn-primary flex items-center gap-2"><Plus className="w-4 h-4"/> Σχεδίαση</button>
 </div>
 </Card>
 )}

 {/* ═══════════════ HTML Editor Modal ═══════════════ */}
 {isModalOpen && <DocTemplateForm template={editingTemplate} onClose={() => setIsModalOpen(false)} />}

 {/* ═══════════════ UPLOAD WIZARD ═══════════════ */}
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
 <div key={i} className={`flex-1 text-center py-1.5 rounded-lg text-xs font-bold transition-all ${i === wizardStep ? 'bg-amber-500 text-white shadow-md' : i < wizardStep ? 'badge badge-success' : 'bg-[var(--surface)] text-[var(--text-muted)]'}`}>
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
 <p>Ανεβάστε τα εκκλησιαστικά έγγραφα που ήδη χρησιμοποιείτε (PDF / Word). Το Kanonas θα αναγνωρίσει αυτόματα τις μεταβλητές και θα τις συμπληρώνει με τα δεδομένα της τελετής!</p>
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
 <label className="block text-sm font-bold text-[var(--foreground)] mb-2">
   Κατηγορία Μυστηρίου <span className="text-red-500">*</span>
   {!uploadType && <span className="ml-2 text-xs font-normal text-amber-600">(απαραίτητο)</span>}
 </label>
 <div className="grid grid-cols-5 gap-2">
 {DOC_TYPES.map(t => (
 <button key={t.id} onClick={() => setUploadType(t.id)}
 className={`py-3 rounded-xl text-center transition-all border-2 ${uploadType === t.id ? 'border-amber-500 bg-amber-50 shadow-sm' : !uploadType ? 'border-amber-200 hover:border-amber-400 animate-pulse' : 'border-[var(--border)] hover:border-amber-300'}`}>
 <span className="text-xl block mb-0.5">{t.emoji}</span>
 <span className="text-[11px] font-bold block">{t.label}</span>
 </button>
 ))}
 </div>
 </div>
 <div>
 <label className="block text-sm font-bold text-[var(--foreground)] mb-2">Ορατότητα (Χρήση Εγγράφου)</label>
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
 <label className={`cursor-pointer p-3 rounded-xl border transition-all ${uploadVisibility === 'internal' ? 'border-amber-500 bg-amber-50 shadow-sm' : 'border-[var(--border)] hover:border-amber-300'}`}>
 <input type="radio" value="internal" checked={uploadVisibility === 'internal'} onChange={e => setUploadVisibility(e.target.value)} className="hidden"/>
 <span className="flex items-center justify-center font-bold mt-1 text-sm"><span className="text-xl inline-block mr-1">🏠</span> Εσωτερικό</span>
 <span className="block text-[10px] text-center text-[var(--text-muted)] mt-1">(Αρχείο ναού)</span>
 </label>
 <label className={`cursor-pointer p-3 rounded-xl border transition-all ${uploadVisibility === 'citizen' ? 'border-amber-500 bg-amber-50 shadow-sm' : 'border-[var(--border)] hover:border-amber-300'}`}>
 <input type="radio" value="citizen" checked={uploadVisibility === 'citizen'} onChange={e => setUploadVisibility(e.target.value)} className="hidden"/>
 <span className="flex items-center justify-center font-bold mt-1 text-sm"><span className="text-xl inline-block mr-1">👤</span> Προς Ενορίτη</span>
 <span className="block text-[10px] text-center text-[var(--text-muted)] mt-1">(Αποστολή στον πολίτη)</span>
 </label>
 <label className={`cursor-pointer p-3 rounded-xl border transition-all ${uploadVisibility === 'metropolis' ? 'border-amber-500 bg-amber-50 shadow-sm' : 'border-[var(--border)] hover:border-amber-300'}`}>
 <input type="radio" value="metropolis" checked={uploadVisibility === 'metropolis'} onChange={e => setUploadVisibility(e.target.value)} className="hidden"/>
 <span className="flex items-center justify-center font-bold mt-1 text-sm"><span className="text-xl inline-block mr-1">⛪</span> Προς Μητρόπολη</span>
 <span className="block text-[10px] text-center text-[var(--text-muted)] mt-1">(Αποστολή στη Μητρόπολη)</span>
 </label>
 </div>
 </div>
 </div>
 )}

 </div>

 {/* Footer Navigation */}
 <div className="p-5 border-t border-[var(--border)] bg-[var(--background)] flex justify-between items-center">
 <button
 onClick={() => wizardStep === 0 ? resetWizard() : setWizardStep(wizardStep - 1)}
 disabled={uploading}
 className="px-4 py-2 rounded-xl text-sm font-bold text-[var(--text-muted)] hover:bg-[var(--surface)] flex items-center gap-1 disabled:opacity-50">
 <ChevronLeft className="w-4 h-4"/> {wizardStep === 0 ? 'Ακύρωση' : 'Πίσω'}
 </button>

 {wizardStep === 0 ? (
 <button onClick={() => setWizardStep(1)} disabled={!uploadFile}
 className="px-6 py-2 rounded-xl text-sm font-bold bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-40 flex items-center gap-1.5 shadow-md">
 Επόμενο <ChevronRight className="w-4 h-4"/>
 </button>
 ) : (
 <button onClick={handleUpload} disabled={!uploadName || !uploadType || uploading}
 className="px-8 py-2 rounded-xl text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-emerald-200">
 {uploading ? <Loader2 className="w-4 h-4 animate-spin"/> : <CheckCircle2 className="w-4 h-4"/>}
 {uploading ? 'Ανέβασμα...' : 'Αποθήκευση'}
 </button>
 )}
 </div>

 </div>
 </div>
 )}

 </div>
 );
}
