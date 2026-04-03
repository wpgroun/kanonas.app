'use client'

import React, { useState } from 'react'
import { saveDocTemplate } from '../../../actions'

export default function TemplateEditor({ initialTemplates }: { initialTemplates: any[] }) {
  const [templates, setTemplates] = useState(initialTemplates);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Editor State
  const [docType, setDocType] = useState('GAMOS');
  const [nameEl, setNameEl] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const DICTIONARY = [
    { tag: '[ΓΑΜΠΡΟΣ_ΟΝΟΜΑ]', desc: 'Όνομα Γαμπρού (Ονομαστική)', type: 'PUBLIC' },
    { tag: '[ΓΑΜΠΡΟΣ_ΟΝΟΜΑ_ΓΕΝΙΚΗ]', desc: 'Όνομα Γαμπρού (Γενική Πτώση)', type: 'PUBLIC' },
    { tag: '[ΝΥΦΗ_ΟΝΟΜΑ]', desc: 'Όνομα Νύφης (Ονομαστική)', type: 'PUBLIC' },
    { tag: '[ΝΥΦΗ_ΚΑΤΑΣΤΑΣΗ]', desc: 'Άγαμη / Διαζευγμένη', type: 'PUBLIC' },
    { tag: '[ΙΕΡΕΑΣ_ΟΝΟΜΑ]', desc: 'Όνομα Εφημερίου Μυστηρίου', type: 'INTERNAL' },
    { tag: '[ΤΟΜΟΣ_ΒΙΒΛΙΟΥ]', desc: 'Αύξων Αριθμός Τόμου Ναού', type: 'INTERNAL' },
    { tag: '[ΑΡΙΘΜΟΣ_ΒΙΒΛΙΟΥ]', desc: 'Αριθμός Μυστηρίου', type: 'INTERNAL' }
  ];

  function openNew() {
    setEditingId('NEW');
    setDocType('GAMOS');
    setNameEl('');
    setHtmlContent('<div style="text-align: center; font-weight: bold; font-size: 1.5rem; margin-bottom: 2rem;">\n  ΙΕΡΑ ΜΗΤΡΟΠΟΛΙΣ...\n</div>\n\n<p>\n  Βεβαιούται ότι ο <b>[ΓΑΜΠΡΟΣ_ΟΝΟΜΑ_ΓΕΝΙΚΗ]</b> και η <b>[ΝΥΦΗ_ΟΝΟΜΑ]</b>...\n</p>');
  }

  function openEdit(t: any) {
    setEditingId(t.id);
    setDocType(t.docType);
    setNameEl(t.nameEl);
    setHtmlContent(t.htmlContent);
  }

  async function handleSave() {
    if(!nameEl || !htmlContent) return alert('Συμπληρώστε όνομα και περιεχόμενο.');
    setIsSaving(true);
    const res = await saveDocTemplate(editingId === 'NEW' ? null : editingId, docType, nameEl, htmlContent);
    setIsSaving(false);
    if(res.success) {
      window.location.reload(); // Refresh to get updated list
    } else {
      alert("Σφάλμα αποθήκευσης.");
    }
  }

  function insertTag(tag: string) {
    setHtmlContent(prev => prev + ' ' + tag + ' ');
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem' }}>
      
      {/* ΛΙΣΤΑ ΠΡΟΤΥΠΩΝ */}
      <div className="glass-panel" style={{ padding: '1.5rem', alignSelf: 'start' }}>
        <h3 style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Πρότυπα Ναού
          <button onClick={openNew} className="btn-primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>+ Νέο</button>
        </h3>
        
        {templates.length === 0 && <p className="text-muted" style={{ fontSize: '0.9rem' }}>Δεν υπάρχουν πρότυπα.</p>}
        {templates.map(t => (
          <div key={t.id} 
               onClick={() => openEdit(t)}
               style={{ 
                 padding: '0.8rem', border: '1px solid var(--border-color)', borderRadius: '6px', marginBottom: '0.5rem',
                 cursor: 'pointer', background: editingId === t.id ? 'var(--primary-light)' : 'transparent',
                 color: editingId === t.id ? '#fff' : 'inherit'
               }}>
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t.nameEl}</div>
            <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>{t.docType === 'GAMOS' ? 'Γάμος' : 'Βάπτιση'}</div>
          </div>
        ))}
      </div>

      {/* EDITOR */}
      {editingId ? (
        <div className="glass-panel" style={{ padding: '2rem', animation: 'fadeIn 0.3s' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>{editingId === 'NEW' ? 'Δημιουργία Προτύπου' : 'Επεξεργασία Προτύπου'}</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
             <div>
               <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Ονομασία Εγγράφου</label>
               <input type="text" value={nameEl} onChange={e => setNameEl(e.target.value)} placeholder="π.χ. Βεβαίωση Τέλεσης Γάμου" style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
             </div>
             <div>
               <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Ισχύει για:</label>
               <select value={docType} onChange={e => setDocType(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                 <option value="GAMOS">Μυστήριο: Γάμος</option>
                 <option value="VAPTISI">Μυστήριο: Βάπτιση</option>
               </select>
             </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 250px', gap: '1.5rem' }}>
             {/* HTML TEXTAREA */}
             <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600 }}>Περιεχόμενο Εγγράφου (HTML & Μεταβλητές)</label>
                <textarea 
                  value={htmlContent} 
                  onChange={e => setHtmlContent(e.target.value)}
                  style={{ width: '100%', height: '400px', padding: '1rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontFamily: 'monospace', lineHeight: 1.5 }}
                />
             </div>
             
             {/* TAGS DICTIONARY */}
             <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600 }}>Διαθέσιμες Μεταβλητές</label>
                <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '1rem' }}>
                  Κάντε κλικ σε μια μεταβλητή για να τη βάλετε στο κείμενο. Το σύστημα θα καταλάβει αυτόματα αν πρέπει να τη ζητήσει από τον πελάτη (Public) ή από εσάς (Internal).
                </p>

                <div style={{ height: '350px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                  {DICTIONARY.map(tag => (
                    <div key={tag.tag} 
                         onClick={() => insertTag(tag.tag)}
                         style={{ 
                          padding: '0.5rem', background: 'var(--bg-color)', border: '1px dashed var(--border-color)', 
                          borderRadius: '4px', marginBottom: '0.5rem', cursor: 'pointer', fontSize: '0.8rem' 
                         }}>
                      <div style={{ color: 'var(--primary-color)', fontWeight: 'bold', marginBottom: '0.2rem' }}>{tag.tag}</div>
                      <div style={{ color: 'var(--text-muted)' }}>{tag.desc}</div>
                      <span style={{ fontSize: '0.65rem', background: tag.type === 'PUBLIC' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(230, 126, 34, 0.2)', color: tag.type === 'PUBLIC' ? '#10b981' : '#e67e22', padding: '0.1rem 0.3rem', borderRadius: '2px', display: 'inline-block', marginTop: '0.3rem' }}>
                        {tag.type === 'PUBLIC' ? 'Συμπληρώνεται από Πελάτη' : 'Συμπληρώνεται από Ιερέα'}
                      </span>
                    </div>
                  ))}
                </div>
             </div>
          </div>

          <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button onClick={() => setEditingId(null)} className="btn-secondary">Ακύρωση</button>
            <button onClick={handleSave} disabled={isSaving} className="btn-primary">
              {isSaving ? 'Αποθήκευση...' : '✔️ Ήδη Αποθήκευσης'}
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', border: '2px dashed var(--border-color)', borderRadius: '12px' }}>
           Επιλέξτε ή δημιουργήστε ένα πρότυπο.
        </div>
      )}

    </div>
  )
}
