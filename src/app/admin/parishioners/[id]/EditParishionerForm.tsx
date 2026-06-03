'use client'

import { useState } from 'react'
import { updateParishionerDetails } from '@/actions/parishioners'
import { useRouter } from 'next/navigation'

export default function EditParishionerForm({ parishioner }: { parishioner: any }) {
 const router = useRouter();
 const [isOpen, setIsOpen] = useState(false);
 
 const [formData, setFormData] = useState({
 firstName: parishioner.firstName || '',
 lastName: parishioner.lastName || '',
 email: parishioner.email || '',
 phone: parishioner.phone || '',
 address: parishioner.address || '',
 city: parishioner.city || '',
 afm: parishioner.afm || '',
 idNumber: parishioner.idNumber || ''
 });

 const [loading, setLoading] = useState(false);

 const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
 };

 async function handleSubmit(e: React.FormEvent) {
 e.preventDefault();
 setLoading(true);
 const res = await updateParishionerDetails(parishioner.id, formData);
 setLoading(false);

 if (res.success) {
 setIsOpen(false);
 router.refresh();
 } else {
 alert("Υπήρξε σφάλμα κατά την αποθήκευση.");
 }
 }

 if (!isOpen) return (
 <button onClick={() => setIsOpen(true)} className="btn-secondary"style={{ padding: '0.5rem 1rem', display: 'inline-flex', gap: '0.4rem', alignItems: 'center', fontSize: '0.9rem' }}>
 ✏️ Επεξεργασία Στοιχείων
 </button>
);

 return (
 <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
 <div className="glass-panel"style={{ width: '100%', maxWidth: '600px', padding: '2rem', animation: 'fadeInDown 0.3s' }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
 <h2 style={{ margin: 0 }}>Επεξεργασία Στοιχείων Ενορίτη</h2>
 <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: 'var(--text-muted)' }}>&times;</button>
 </div>

 <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
 
 <div><label className="form-label">Όνομα</label><input name="firstName"value={formData.firstName} onChange={handleChange} required className="form-input"/></div>
 <div><label className="form-label">Επώνυμο</label><input name="lastName"value={formData.lastName} onChange={handleChange} required className="form-input"/></div>
 
 <div><label className="form-label">Τηλέφωνο</label><input name="phone"value={formData.phone} onChange={handleChange} className="form-input"/></div>
 <div><label className="form-label">Email</label><input name="email"type="email"value={formData.email} onChange={handleChange} className="form-input"/></div>
 
 <div style={{ gridColumn: 'span 2' }}>
 <label className="form-label">Διεύθυνση</label><input name="address"value={formData.address} onChange={handleChange} className="form-input"/>
 </div>
 
 <div><label className="form-label">Πόλη (Περιοχή)</label><input name="city"value={formData.city} onChange={handleChange} className="form-input"/></div>
 <div><label className="form-label">Α.Φ.Μ.</label><input name="afm"value={formData.afm} onChange={handleChange} className="form-input"/></div>
 
 <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', marginTop: '1rem' }}>
 <button type="button"onClick={() => setIsOpen(false)} className="btn-secondary"style={{ flex: 1 }}>Ακύρωση</button>
 <button type="submit"disabled={loading} className="btn-primary"style={{ flex: 2, background: '#10b981' }}>
 {loading ? 'Αποθήκευση...' : '✔️ Ενημέρωση'}
 </button>
 </div>
 </form>

 </div>
 </div>
)
}
