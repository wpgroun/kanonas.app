'use client';
import { useState } from 'react';
import { Plus, Settings, FileText, FileSignature, AlertCircle, Variable } from 'lucide-react';
import DocTemplateForm from './DocTemplateForm';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';

export default function DocumentsClient({ initialTemplates }: any) {
  const [templates, setTemplates] = useState(initialTemplates || []);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="container-fluid mt-6 space-y-6 animate-in fade-in zoom-in-95 duration-500">
      
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Πρότυπα Εγγράφων <span className="text-xs bg-brand-light text-brand font-black px-2 py-0.5 rounded-full uppercase tracking-widest border border-brand/20">Engine</span>
          </h1>
          <p className="text-muted-foreground mt-1 text-sm max-w-2xl">
            Ανεβάστε ή σχεδιάστε HTML πρότυπα για την αυτόματη παραγωγή εγγράφων Μυστηρίων (Γάμοι, Βαπτίσεις). 
            Το σύστημα διαβάζει τα <b>{`{{tags}}`}</b> και τα μετατρέπει σε δυναμικά πεδία.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingTemplate(null);
            setIsModalOpen(true);
          }}
          className="btn btn-primary flex items-center gap-2 shadow-lg shadow-brand/30"
        >
          <Plus className="w-5 h-5"/> Σχεδίαση Νέου
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
        {templates.map((tpl: any) => (
          <div key={tpl.id} className="card hover:border-brand/30 transition-colors p-5 group flex flex-col justify-between h-auto shadow-sm">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[var(--background)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] mb-4 group-hover:text-brand group-hover:bg-brand-light/20 transition-colors">
                <FileSignature className="w-6 h-6"/>
              </div>
              <h3 className="font-bold text-foreground text-lg">{tpl.nameEl}</h3>
              <p className="text-sm font-medium text-[var(--text-muted)] mt-1 uppercase tracking-widest flex items-center gap-1.5"><Settings className="w-3.5 h-3.5"/> MODULE: {tpl.docType}</p>
            </div>
            
            <div className="mt-8 border-t border-[var(--border)] pt-4 flex gap-3">
              <button 
                onClick={() => {
                  setEditingTemplate(tpl);
                  setIsModalOpen(true);
                }} 
                className="flex-1 btn btn-ghost btn-sm bg-[var(--background)] text-slate-700 hover:bg-[var(--surface-hover)] border border-[var(--border)] shadow-sm"
              >
                Επεξεργασία
              </button>
            </div>
          </div>
        ))}
      </div>

      {templates.length === 0 && (
        <Card className="border-dashed border-2 shadow-none py-12 flex flex-col items-center justify-center bg-[var(--background)]/50">
          <Variable className="w-16 h-16 text-slate-300 mb-4" />
          <CardTitle className="text-[var(--text-secondary)] mb-1">Κανένα Πρότυπο</CardTitle>
          <CardDescription className="max-w-md text-center">Δεν έχετε προσθέσει κανένα πρότυπο. Μπορείτε να φτιάξετε το πρώτο σας χρησιμοποιώντας τη Δυναμική Μηχανή.</CardDescription>
        </Card>
      )}

      {isModalOpen && (
        <DocTemplateForm 
          template={editingTemplate} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </div>
  );
}
