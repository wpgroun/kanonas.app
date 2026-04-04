'use client'

import { useState } from 'react'
import { updateParishionerRoles } from '@/actions/parishioners'

interface TagsEditorProps {
  parishionerId: string;
  initialRolesJson: string | null;
}

export default function TagsEditor({ parishionerId, initialRolesJson }: TagsEditorProps) {
  const [roles, setRoles] = useState<string[]>(initialRolesJson ? JSON.parse(initialRolesJson) : []);
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);

  // Common pre-defined tags for a Church CRM
  const PREDEFINED_TAGS = ['Ωφελούμενος Συσσιτίου', 'Ιεροψάλτης', 'Επίτροπος', 'Φιλόπτωχο Ταμείο', 'Κατηχητής'];

  async function handleAddTag(tag: string) {
    if (!tag.trim() || roles.includes(tag.trim())) return;
    
    const updatedRoles = [...roles, tag.trim()];
    setRoles(updatedRoles);
    
    // Save to server
    setLoading(true);
    await updateParishionerRoles(parishionerId, JSON.stringify(updatedRoles));
    setLoading(false);
    setNewTag('');
  }

  async function handleRemoveTag(tagToRemove: string) {
    const updatedRoles = roles.filter(r => r !== tagToRemove);
    setRoles(updatedRoles);
    
    setLoading(true);
    await updateParishionerRoles(parishionerId, JSON.stringify(updatedRoles));
    setLoading(false);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      
      {/* Current Tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {roles.length === 0 && <span className="text-muted" style={{ fontSize: '0.9rem' }}>Καμία ετικέτα.</span>}
        {roles.map(r => (
          <div key={r} style={{ 
            background: 'var(--primary-light)', color: '#fff', 
            padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem',
            display: 'flex', alignItems: 'center', gap: '0.5rem'
           }}>
             {r}
             <button 
               onClick={() => handleRemoveTag(r)}
               style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', opacity: 0.7 }}
             >
               ×
             </button>
          </div>
        ))}
        {loading && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Αποθήκευση...</span>}
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '0.5rem 0' }} />

      {/* Add New Tag */}
      <div>
        <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>
          Προσθήκη Ιδιότητας
        </label>
        
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.8rem' }}>
          <input 
            type="text" 
            value={newTag} 
            onChange={(e) => setNewTag(e.target.value)} 
            placeholder="Γράψτε νέα ετικέτα..." 
            onKeyDown={(e) => { if(e.key === 'Enter') handleAddTag(newTag) }}
            style={{ flex: 1, padding: '0.4rem 0', margin: 0, border: '1px solid var(--border-color)', borderRadius: '4px', paddingLeft: '8px' }}
          />
          <button onClick={() => handleAddTag(newTag)} className="btn-secondary" style={{ padding: '0.4rem 1rem' }}>Προσθήκη</button>
        </div>

        {/* Quick Suggestions */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {PREDEFINED_TAGS.filter(t => !roles.includes(t)).map(t => (
            <button 
              key={t}
              onClick={() => handleAddTag(t)}
              style={{ 
                background: 'var(--bg-color)', border: '1px dashed var(--border-color)', 
                padding: '0.3rem 0.6rem', borderRadius: '15px', fontSize: '0.8rem', cursor: 'pointer',
                color: 'var(--text-muted)'
              }}
            >
              + {t}
            </button>
          ))}
        </div>
      </div>
      
    </div>
  )
}
