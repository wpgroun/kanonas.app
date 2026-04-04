'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSacramentRequest } from '@/actions/sacraments'

// --- GREEK AUTO-DECLENSION ENGINE ---
function getGenitive(nom: string, gender: 'M' | 'F'): string {
  if (!nom) return '';
  const tokens = nom.trim().split(' ');
  const result = tokens.map(t => {
    let w = t;
    if (gender === 'M') {
      if (w.endsWith('ος')) return w.slice(0, -2) + 'ου';
      if (w.endsWith('ΟΣ')) return w.slice(0, -2) + 'ΟΥ';
      if (w.endsWith('ης')) return w.slice(0, -1);
      if (w.endsWith('ΗΣ')) return w.slice(0, -1);
      if (w.endsWith('ας')) return w.slice(0, -1);
      if (w.endsWith('ΑΣ')) return w.slice(0, -1);
    } else {
      if (w.endsWith('η')) return w.slice(0, -1) + 'ης';
      if (w.endsWith('Η')) return w.slice(0, -1) + 'ΗΣ';
      if (w.endsWith('α')) return w.slice(0, -1) + 'ας';
      if (w.endsWith('Α')) return w.slice(0, -1) + 'ΑΣ';
    }
    return w; // Default fallback
  });
  return result.join(' ');
}

export default function SmartBookingWizard() {
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Base Data
  const [type, setType] = useState('GAMOS');
  const [date, setDate] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Contact Name (General)
  const [customerName, setCustomerName] = useState('');

  // Names for Grammar
  const [groomName, setGroomName] = useState('');
  const [groomGenitive, setGroomGenitive] = useState('');
  const [brideName, setBrideName] = useState('');
  const [brideGenitive, setBrideGenitive] = useState('');

  // Meta (Smart Questions)
  const [groomStatus, setGroomStatus] = useState('agamos');
  const [groomDivorceRef, setGroomDivorceRef] = useState('');
  const [brideStatus, setBrideStatus] = useState('agami');
  const [brideDivorceRef, setBrideDivorceRef] = useState('');
  const [koumparosIsOrthodox, setKoumparosIsOrthodox] = useState('yes');
  const [parentsMarriage, setParentsMarriage] = useState('thriskeftikos');

  // Trigger Grammar Engine on move to Step 3
  function handleGoToStep3() {
    if (type === 'GAMOS') {
       if (!groomName || !brideName) {
         alert('Συμπληρώστε τα ονόματα του ζεύγους!');
         return;
       }
       setGroomGenitive(getGenitive(groomName, 'M'));
       setBrideGenitive(getGenitive(brideName, 'F'));
       setCustomerName(`${groomName} & ${brideName}`);
    }
    setStep(3);
  }

  async function handleSubmit() {
    setLoading(true);

    const metaData: any = {};
    if (type === 'GAMOS') {
      metaData.groomStatus = groomStatus;
      if (groomStatus === 'diazeugmenos') metaData.groomDivorceRef = groomDivorceRef;
      metaData.brideStatus = brideStatus;
      if (brideStatus === 'diazeugmeni') metaData.brideDivorceRef = brideDivorceRef;
      metaData.koumparosIsOrthodox = koumparosIsOrthodox;
      
      // PUBLIC VARIABLES DEFINITION
      metaData['[ΓΑΜΠΡΟΣ_ΟΝΟΜΑ]'] = groomName;
      metaData['[ΓΑΜΠΡΟΣ_ΟΝΟΜΑ_ΓΕΝΙΚΗ]'] = groomGenitive;
      metaData['[ΝΥΦΗ_ΟΝΟΜΑ]'] = brideName;
      metaData['[ΝΥΦΗ_ΟΝΟΜΑ_ΓΕΝΙΚΗ]'] = brideGenitive;
    } else {
      metaData.parentsMarriage = parentsMarriage;
      metaData.anadoxosIsOrthodox = koumparosIsOrthodox; 
    }

    const res = await createSacramentRequest({
      type,
      date,
      name: customerName,
      email,
      phone,
      metaStr: JSON.stringify(metaData) // Saving the whole dictionary mapping and answers
    });

    setLoading(false);
    if (res.success) {
      setSuccess(true);
    } else {
      alert("Κάτι πήγε στραβά, δοκιμάστε ξανά.");
    }
  }

  if (success) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto', animation: 'fadeInUp 0.6s ease' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
        <h1>Το Αίτημα Εστάλη με επιτυχία!</h1>
        <p className="text-muted" style={{ marginTop: '1rem', lineHeight: '1.6' }}>
          Όλα τα απαραίτητα στοιχεία για την έκδοση των αδειών καταχωρήθηκαν ασφαλώς στο σύστημα. Η γραμματεία του Ιερού Ναού θα τα ελέγξει και θα επικοινωνήσει μαζί σας!
        </p>
        <button onClick={() => window.location.reload()} className="btn-secondary" style={{ marginTop: '2rem' }}>Νέα Κράτηση</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '700px', margin: '2rem auto', animation: 'fadeInUp 0.6s ease' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
         <h1 className="page-title">Φόρμα Αιτήματος Μυστηρίου</h1>
         <p className="text-muted">Βήμα {step} από 3</p>
         
         <div style={{ display: 'flex', gap: '5px', marginTop: '1rem', height: '6px' }}>
           <div style={{ flex: 1, background: step >= 1 ? 'var(--primary-color)' : 'var(--border-color)', borderRadius: '3px', transition: '0.3s' }} />
           <div style={{ flex: 1, background: step >= 2 ? 'var(--primary-color)' : 'var(--border-color)', borderRadius: '3px', transition: '0.3s' }} />
           <div style={{ flex: 1, background: step >= 3 ? 'var(--primary-color)' : 'var(--border-color)', borderRadius: '3px', transition: '0.3s' }} />
         </div>
      </div>

      <div className="glass-panel">
        
        {/* ΒΗΜΑ 1: ΒΑΣΙΚΑ ΣΤΟΙΧΕΙΑ */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.4s' }}>
            <h2>Βασικά Στοιχεία</h2>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>Είδος Μυστηρίου</label>
              <select value={type} onChange={e => setType(e.target.value)} style={{ padding: '0.8rem', border: '1px solid var(--border-color)', borderRadius: '6px', width: '100%' }}>
                <option value="GAMOS">Γάμος</option>
                <option value="VAPTISI">Βάπτιση</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>Επιθυμητή Ημερομηνία</label>
              <input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} required style={{ padding: '0.8rem', border: '1px solid var(--border-color)', borderRadius: '6px', width: '100%' }} />
            </div>

            <button onClick={() => { if(date) setStep(2); else alert('Παρακαλώ επιλέξτε ημερομηνία'); }} className="btn-primary" style={{ alignSelf: 'flex-end', marginTop: '1rem' }}>
              Συνέχεια &rarr;
            </button>
          </div>
        )}

        {/* ΒΗΜΑ 2: ΔΥΝΑΜΙΚΟ ΕΡΩΤΗΜΑΤΟΛΟΓΙΟ & ΟΝΟΜΑΤΑ */}
        {step === 2 && type === 'GAMOS' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem', animation: 'fadeIn 0.4s' }}>
             <h2>Στοιχεία Γάμου</h2>
             
             {/* Names */}
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
               <div>
                 <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Όνομα & Επώνυμο Γαμπρού</label>
                 <input type="text" value={groomName} onChange={e => setGroomName(e.target.value)} placeholder="π.χ. Γεώργιος" required style={{ width: '100%', padding: '0.6rem', // ...
                 border: '1px solid var(--border-color)', borderRadius: '4px', marginTop: '0.3rem' }} />
               </div>
               <div>
                 <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Όνομα & Επώνυμο Νύφης</label>
                 <input type="text" value={brideName} onChange={e => setBrideName(e.target.value)} placeholder="π.χ. Μαρία" required style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border-color)', borderRadius: '4px', marginTop: '0.3rem' }} />
               </div>
             </div>

             <div style={{ padding: '1.5rem', background: 'var(--bg-color)', borderRadius: '8px' }}>
                <h4 style={{ marginBottom: '1rem' }}>Οικογενειακή Κατάσταση Γαμπρού</h4>
                <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem' }}>
                  <label><input type="radio" checked={groomStatus === 'agamos'} onChange={() => setGroomStatus('agamos')} /> Άγαμος</label>
                  <label><input type="radio" checked={groomStatus === 'diazeugmenos'} onChange={() => setGroomStatus('diazeugmenos')} /> Διαζευγμένος</label>
                </div>
             </div>

             <div style={{ padding: '1.5rem', border: '1px solid rgba(241, 90, 90, 0.3)', borderRadius: '8px', background: 'rgba(241, 90, 90, 0.05)' }}>
                <h4 style={{ marginBottom: '0.8rem', color: 'var(--secondary-color)' }}>Προϋπόθεση Κουμπάρου</h4>
                <select value={koumparosIsOrthodox} onChange={e => setKoumparosIsOrthodox(e.target.value)} style={{ padding: '0.6rem', width: '100%', borderRadius: '4px' }}>
                  <option value="yes">Ναι, είναι Ορθόδοξος</option>
                  <option value="no">Όχι (Μη επιτρεπτό)</option>
                </select>
             </div>

             <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
               <button onClick={() => setStep(1)} className="btn-secondary">Πίσω</button>
               <button onClick={handleGoToStep3} className="btn-primary">Συνέχεια &rarr;</button>
             </div>
          </div>
        )}

        {step === 2 && type === 'VAPTISI' && (
           <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem', animation: 'fadeIn 0.4s' }}>
             <h2>Στοιχεία Βάπτισης</h2>
             {/* Vaptisi Logic Here... */}
             <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
               <button onClick={() => setStep(1)} className="btn-secondary">Πίσω</button>
               <button onClick={() => setStep(3)} className="btn-primary">Συνέχεια &rarr;</button>
             </div>
           </div>
        )}

        {/* ΒΗΜΑ 3: ΕΠΙΚΟΙΝΩΝΙΑ ΟΙΚΟΓΕΝΕΙΑΣ ΚΑΙ ΕΠΑΛΗΘΕΥΣΗ ΚΛΙΣΕΩΝ */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.4s' }}>
             
             {type === 'GAMOS' && (
               <div style={{ background: '#e0f2fe', padding: '1.5rem', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                 <h3 style={{ color: '#0369a1', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                   <span>🤖</span> Μηχανισμός Νομικών Εγγράφων
                 </h3>
                 <p style={{ fontSize: '0.85rem', color: '#0c4a6e', marginBottom: '1rem' }}>
                   Ελέγξτε αν τα παρακάτω ονόματα προσαρμόστηκαν ορθά στην πτώση της Γενικής (π.χ. "Του...). Αν δε συμφωνείτε, διορθώστε τα με το χέρι!
                 </p>
                 
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                   <div>
                     <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Το όνομα του Γαμπρού <b>(Γενική)</b></label>
                     <input type="text" value={groomGenitive} onChange={e => setGroomGenitive(e.target.value)} style={{ width: '100%', padding: '0.6rem', border: '2px dashed #0ea5e9', borderRadius: '4px' }} />
                   </div>
                   <div>
                     <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Το όνομα της Νύφης <b>(Γενική)</b></label>
                     <input type="text" value={brideGenitive} onChange={e => setBrideGenitive(e.target.value)} style={{ width: '100%', padding: '0.6rem', border: '2px dashed #0ea5e9', borderRadius: '4px' }} />
                   </div>
                 </div>
               </div>
             )}

             <h2>Στοιχεία Επικοινωνίας</h2>
             <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email επικοινωνίας" required style={{ padding: '0.8rem', border: '1px solid var(--border-color)', borderRadius: '6px' }} />
             <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Τηλέφωνο" required style={{ padding: '0.8rem', border: '1px solid var(--border-color)', borderRadius: '6px' }} />

             <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
               <button onClick={() => setStep(2)} className="btn-secondary">Πίσω</button>
               <button onClick={handleSubmit} disabled={loading} className="btn-primary" style={{ padding: '0.8rem 2rem', fontSize: '1rem', background: '#10b981' }}>
                 {loading ? 'Αποστολή...' : '✔️ Ολοκλήρωση Κράτησης'}
               </button>
             </div>
          </div>
        )}

      </div>
    </div>
  )
}


