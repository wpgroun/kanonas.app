'use client'

import { useState } from 'react'
import { createDonation } from '../../actions'
import { useRouter } from 'next/navigation'

export default function AddDonationForm({ parishioners }: { parishioners: any[] }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('ΠΑΓΚΑΡΙ');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [parishionerId, setParishionerId] = useState(''); // Empty means anonymous
  
  const [loading, setLoading] = useState(false);

  const PURPOSES = [
    'ΠΑΓΚΑΡΙ',
    'ΔΙΣΚΟΣ ΚΥΡΙΑΚΗΣ',
    'ΔΩΡΕΑ / ΣΥΣΣΙΤΙΟ',
    'ΜΥΣΤΗΡΙΟ / ΙΕΡΟΠΡΑΞΙΑ',
    'ΚΗΔΕΙΑ / ΜΝΗΜΟΣΥΝΟ',
    'ΑΛΛΟ'
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return alert('Εισάγετε έγκυρο ποσό.');
    
    setLoading(true);
    const res = await createDonation({
      amount: Number(amount),
      purpose,
      receiptNumber: receiptNumber || undefined,
      parishionerId: parishionerId || undefined
    });
    setLoading(false);

    if (res.success) {
      setIsOpen(false);
      setAmount('');
      setReceiptNumber('');
      setParishionerId('');
      router.refresh();
    } else {
      alert(res.error);
    }
  }

  if (!isOpen) return (
    <button onClick={() => setIsOpen(true)} className="btn-primary" style={{ padding: '0.6rem 1.2rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <span>💰</span> Νέο Έσοδο
    </button>
  );

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '2rem', animation: 'fadeInDown 0.3s' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0 }}>Καταχώρηση Ταμείου</h2>
          <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: 'var(--text-muted)' }}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem', fontWeight: 600 }}>Ποσό (€) *</label>
            <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '1.2rem' }} placeholder="0.00" />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem', fontWeight: 600 }}>Αιτιολογία Εσόδου</label>
            <select value={purpose} onChange={e => setPurpose(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
              {PURPOSES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div style={{ padding: '1rem', background: 'var(--bg-color)', borderRadius: '6px' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem', fontWeight: 600, color: 'var(--primary-color)' }}>Επώνυμη Δωρεά (Προαιρετικό)</label>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Αν συνδέσετε τον Ενορίτη, το ποσό θα προστεθεί στην Καρτέλα του.</p>
            <select value={parishionerId} onChange={e => setParishionerId(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
              <option value="">-- Ανώνυμο / Παγκάρι --</option>
              {parishioners.map(p => (
                <option key={p.id} value={p.id}>{p.lastName} {p.firstName}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem', fontWeight: 600 }}>Αριθμός Διπλοτύπου (Απόδειξη)</label>
            <input type="text" value={receiptNumber} onChange={e => setReceiptNumber(e.target.value)} placeholder="π.χ. ΑΑ-12345" style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" onClick={() => setIsOpen(false)} className="btn-secondary" style={{ flex: 1 }}>Ακύρωση</button>
            <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 2, background: '#10b981' }}>
              {loading ? 'Αποθήκευση...' : '✔️ Καταχώρηση'}
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}

