'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveTempleSettings } from '../../actions'
import { declineGreekName } from '../../../lib/greekDeclension'

export default function SettingsClient({ initialSettings }: { initialSettings: any }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  
  // State from loaded settings
  const [settings, setSettings] = useState({
    metropolisName: initialSettings?.metropolisName || '',
    metropolisAddress: initialSettings?.metropolisAddress || '',
    bishopName: initialSettings?.bishopName || '',
    
    templeName: initialSettings?.templeName || '',
    templeAddress: initialSettings?.templeAddress || '',
    
    priests: initialSettings?.priests || [ { title: '', name: '' } ],

    // Notifications (Email & SMS)
    smtpHost: initialSettings?.smtpHost || '',
    smtpPort: initialSettings?.smtpPort || '',
    smtpUser: initialSettings?.smtpUser || '',
    smtpPass: initialSettings?.smtpPass || '',
    smsApiKey: initialSettings?.smsApiKey || ''
  });

  const handlePriestChange = (index: number, field: string, value: string) => {
    const newPriests = [...settings.priests];
    newPriests[index][field] = value;
    setSettings({ ...settings, priests: newPriests });
  };

  const addPriest = () => setSettings({ ...settings, priests: [...settings.priests, { title: '', name: '' }] });
  
  const removePriest = (idx: number) => {
    const p = [...settings.priests];
    p.splice(idx, 1);
    setSettings({ ...settings, priests: p });
  };

  const saveAll = async () => {
    setSaving(true);
    await saveTempleSettings(settings);
    setSaving(false);
    alert('Ρυθμίσεις αποθηκεύτηκαν επιτυχώς!');
  };

  return (
    <div style={{ animation: 'fadeInUp 0.5s ease', maxWidth: '800px', margin: '0 auto', paddingBottom: '3rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title">Ρυθμίσεις Ναού</h1>
          <p className="text-muted">Καθορίστε τα στοιχεία της Μητρόπολης, του Ναού και τους Εφημέριους.</p>
        </div>
        <button onClick={saveAll} disabled={saving} className="btn-primary" style={{ padding: '0.8rem 2rem' }}>
          {saving ? 'Αποθήκευση...' : '💾 Αποθήκευση Δεδομένων'}
        </button>
      </header>

      {/* ΜΗΤΡΟΠΟΛΗ */}
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
         <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
           <span>🏛️</span> Μητρόπολη
         </h3>
         <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
           <div>
             <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Ονομασία Μητρόπολης</label>
             <input type="text" className="data-input" value={settings.metropolisName} onChange={e => setSettings({...settings, metropolisName: e.target.value})} placeholder="π.χ. Ιερά Μητρόπολις Θεσσαλονίκης" />
           </div>
           <div>
             <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Διεύθυνση Μητρόπολης</label>
             <input type="text" className="data-input" value={settings.metropolisAddress} onChange={e => setSettings({...settings, metropolisAddress: e.target.value})} placeholder="π.χ. Βογατσικού 7, Θεσσαλονίκη" />
           </div>
           
           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'rgba(52, 152, 219, 0.05)', padding: '1rem', borderRadius: '8px' }}>
             <div>
               <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Μητροπολίτης (Ονομαστική)</label>
               <input type="text" className="data-input" value={settings.bishopName} onChange={e => setSettings({...settings, bishopName: e.target.value})} placeholder="π.χ. Φιλόθεος" />
             </div>
             <div>
               <label style={{ display: 'block', fontSize: '0.85rem', color: '#3498db', marginBottom: '0.4rem' }}>✨ Μητροπολίτης (Γενική - AutoDeclension)</label>
               <input type="text" className="data-input" disabled value={settings.bishopName ? 'του κ.κ. ' + declineGreekName(settings.bishopName, 'genitive', 'male') : ''} style={{ background: 'transparent', borderColor: '#3498db' }} />
               <div style={{ fontSize: '0.75rem', marginTop: '0.3rem', color: '#3498db' }}>Αυτόματος υπολογισμός βάσει του αλγορίθμου κλίσης! Δεν χρειάζεται πλέον χειροκίνητη πληκτρολόγηση.</div>
             </div>
           </div>
         </div>
      </div>

      {/* ΝΑΟΣ */}
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
         <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
           <span>⛪</span> Ναός
         </h3>
         <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
           <div>
             <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Όνομα Ναού</label>
             <input type="text" className="data-input" value={settings.templeName} onChange={e => setSettings({...settings, templeName: e.target.value})} placeholder="π.χ. Ιερός Ναός Αγίου Δημητρίου..." />
           </div>
           <div>
             <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Διεύθυνση Ναού</label>
             <input type="text" className="data-input" value={settings.templeAddress} onChange={e => setSettings({...settings, templeAddress: e.target.value})} placeholder="π.χ. Αγίου Δημητρίου 83..." />
           </div>
         </div>
      </div>

      {/* ΙΕΡΕΙΣ */}
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
         <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'space-between' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span>✍️</span> Ιερείς / Εφημέριοι</div>
           <button className="btn-secondary" onClick={addPriest} style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>+ Προσθήκη</button>
         </h3>
         
         <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {settings.priests.map((p: any, idx: number) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr 2fr auto', gap: '1rem', alignItems: 'center', background: 'var(--bg-color)', padding: '1rem', borderRadius: '8px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Τίτλος</label>
                  <input type="text" className="data-input" value={p.title} onChange={e => handlePriestChange(idx, 'title', e.target.value)} placeholder="π.χ. Αρχιμανδρίτης" />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ονοματεπώνυμο</label>
                  <input type="text" className="data-input" value={p.name} onChange={e => handlePriestChange(idx, 'name', e.target.value)} placeholder="π.χ. Δαμασκηνός" />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#10b981' }}>✨ Γενική (Auto)</label>
                  <input type="text" className="data-input" disabled value={p.name ? declineGreekName(p.name, 'genitive', 'male') : ''} style={{ background: 'transparent', borderColor: '#10b981' }} />
                </div>
                <button onClick={() => removePriest(idx)} style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', alignSelf: 'end', marginBottom: '0.6rem', fontSize: '1.2rem' }}>✕</button>
              </div>
            ))}
            {settings.priests.length === 0 && <div className="text-muted" style={{ textAlign: 'center' }}>Δεν υπάρχουν εφημέριοι.</div>}
         </div>
      </div>

      {/* ΕΠΙΚΟΙΝΩΝΙΑ / ΕΙΔΟΠΟΙΗΣΕΙΣ (EMAIL & SMS) */}
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
         <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
           <span>📬</span> Ειδοποιήσεις (Email & SMS)
         </h3>
         
         <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '2rem' }}>
           
           {/* Email SMTP */}
           <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', background: 'var(--bg-color)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.2rem' }}>📧</span>
                <h4 style={{ margin: 0, fontSize: '1rem' }}>Σέρβερ Email (SMTP)</h4>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '-0.5rem 0 0.5rem 0' }}>
                Ρυθμίσεις για αποστολή αυτοματοποιημένων μηνυμάτων e-mail και υπενθυμίσεων.
              </p>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Διακομιστής (Host)</label>
                <input type="text" className="data-input" value={settings.smtpHost} onChange={e => setSettings({...settings, smtpHost: e.target.value})} placeholder="π.χ. smtp.mailgun.org" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Θύρα (Port)</label>
                <input type="text" className="data-input" value={settings.smtpPort} onChange={e => setSettings({...settings, smtpPort: e.target.value})} placeholder="π.χ. 587" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Όνομα Χρήστη (Username)</label>
                <input type="text" className="data-input" value={settings.smtpUser} onChange={e => setSettings({...settings, smtpUser: e.target.value})} placeholder="π.χ. admin@ierinaoi.gr" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Κωδικός Πρόσβασης (Password)</label>
                <input type="password" className="data-input" value={settings.smtpPass} onChange={e => setSettings({...settings, smtpPass: e.target.value})} placeholder="••••••••" />
              </div>
           </div>

           {/* SMS Oktapush/Youboto */}
           <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', background: 'var(--bg-color)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.2rem' }}>📱</span>
                <h4 style={{ margin: 0, fontSize: '1rem' }}>SMS (Oktapush / Youboto)</h4>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '-0.5rem 0 0.5rem 0' }}>
                Ειδοποιήσεις προς τους ενορίτες μέσω κινητού τηλεφώνου.
              </p>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>API Key Σύνδεσης</label>
                <input type="text" className="data-input" value={settings.smsApiKey} onChange={e => setSettings({...settings, smsApiKey: e.target.value})} placeholder="Αντιγράψτε το API Key εδώ" />
              </div>

              <div style={{ marginTop: 'auto', background: 'rgba(52, 152, 219, 0.1)', padding: '1rem', borderRadius: '8px', fontSize: '0.85rem', color: '#3498db' }}>
                💡 Πολύτιμη Συμβουλή: Επικοινωνήστε με τον πάροχο υπηρεσιών για να λάβετε το έγκυρο API Key.
              </div>
           </div>

         </div>
      </div>

    </div>
  )
}
