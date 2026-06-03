'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { addDivorce, deleteDivorce } from '@/actions/divorces'
import { FileHeart, Trash2, Plus, Calendar, FileText } from 'lucide-react'

export default function DivorcesClient({ initialData, parishioners }: { initialData: any[], parishioners: any[] }) {
 const router = useRouter()
 const [data, setData] = useState(initialData)
 const [isAdding, setIsAdding] = useState(false)
 
 const [form, setForm] = useState({
 parishionerId: '',
 protocolNumber: '',
 civilDivorceDecision: '',
 civilDivorceDate: '',
 exSpouseName: '',
 issuedDate: new Date().toISOString().split('T')[0],
 reason: ''
 })
 
 const [loading, setLoading] = useState(false)

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault()
 if (!form.parishionerId || !form.exSpouseName) return
 setLoading(true)
 try {
 await addDivorce({
 parishionerId: form.parishionerId,
 exSpouseName: form.exSpouseName,
 civilDivorceDecision: form.civilDivorceDecision || undefined,
 protocolNumber: form.protocolNumber || undefined,
 civilDivorceDate: form.civilDivorceDate ? new Date(form.civilDivorceDate) : undefined,
 issuedDate: new Date(form.issuedDate),
 reason: form.reason || undefined
 })
 alert('Το διαζύγιο καταχωρήθηκε επιτυχώς!')
 window.location.reload()
 } catch(err: any) {
 alert('Σφάλμα: ' + err.message)
 }
 setLoading(false)
 }

 const handleDelete = async (id: string) => {
 if(!confirm('Είστε βέβαιοι για τη διαγραφή;')) return
 await deleteDivorce(id)
 setData(v => v.filter(d => d.id !== id))
 }

 return (
 <div className="space-y-6">
 
 {!isAdding && (
 <div className="flex justify-end">
 <button onClick={() => setIsAdding(true)} className="btn btn-primary">
 <Plus className="w-4 h-4"/> Νέα Καταχώρηση Διαζυγίου
 </button>
 </div>
)}

 {isAdding && (
 <form onSubmit={handleSubmit} className="card p-6 border-l-4 border-l-purple-600 bg-purple-50/10">
 <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
 <FileHeart className="w-5 h-5 text-purple-600"/>
 Στοιχεία Λύσης Γάμου
 </h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <label className="text-sm font-semibold">Ενορίτης (Αιτών)</label>
 <select className="input-field"value={form.parishionerId} onChange={e => setForm({...form, parishionerId: e.target.value})} required>
 <option value="">Επιλέξτε Ενορίτη...</option>
 {parishioners.map(p => (
 <option key={p.id} value={p.id}>{p.lastName} {p.firstName}</option>
))}
 </select>
 </div>
 
 <div>
 <label className="text-sm font-semibold">Ξεζευγνυόμενος (Πρώην Σύζυγος)</label>
 <input type="text"className="input-field"required value={form.exSpouseName} onChange={e => setForm({...form, exSpouseName: e.target.value})} placeholder="Ονοματεπώνυμο"/>
 </div>

 <div>
 <label className="text-sm font-semibold">Αριθμός Αστικού Διαζυγίου (Πρωτοδικείο)</label>
 <input type="text"className="input-field"value={form.civilDivorceDecision} onChange={e => setForm({...form, civilDivorceDecision: e.target.value})} placeholder="π.χ. 450/2023"/>
 </div>

 <div>
 <label className="text-sm font-semibold">Ημερομηνία Αστικού Διαζυγίου</label>
 <input type="date"className="input-field"value={form.civilDivorceDate} onChange={e => setForm({...form, civilDivorceDate: e.target.value})} />
 </div>

 <div>
 <label className="text-sm font-semibold">Αριθμός Πρωτοκόλλου Διαζευκτηρίου</label>
 <input type="text"className="input-field"value={form.protocolNumber} onChange={e => setForm({...form, protocolNumber: e.target.value})} placeholder="Αριθμός Μητροπόλεως"/>
 </div>

 <div>
 <label className="text-sm font-semibold">Ημερομηνία Έκδοσης Εκκλησιαστικού</label>
 <input type="date"className="input-field"required value={form.issuedDate} onChange={e => setForm({...form, issuedDate: e.target.value})} />
 </div>

 <div className="md:col-span-2">
 <label className="text-sm font-semibold">Αιτιολογία / Παρατηρήσεις</label>
 <textarea className="input-field h-24"value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} placeholder="Λόγοι λύσης υφισταμένου Γάμου..."></textarea>
 </div>
 </div>
 <div className="mt-6 flex justify-end gap-3">
 <button type="button"onClick={() => setIsAdding(false)} className="btn btn-secondary">Ακύρωση</button>
 <button type="submit"disabled={loading} className="btn btn-primary">{loading ? 'Αποθήκευση...' : 'Αποθήκευση Λύσης'}</button>
 </div>
 </form>
)}

 <div className="card overflow-hidden">
 {data.length > 0 ? (
 <div className="overflow-x-auto">
 <table className="w-full text-sm text-left">
 <thead className="text-xs text-[var(--text-secondary)] uppercase bg-[var(--background)] border-b">
 <tr>
 <th className="px-6 py-4 font-bold">Αιτών / Ενορίτης</th>
 <th className="px-6 py-4 font-bold">Ξεζευγνυόμενος</th>
 <th className="px-6 py-4 font-bold">Έκδοση</th>
 <th className="px-6 py-4 font-bold text-center">Αρ. Πρωτοκόλλου</th>
 <th className="px-6 py-4 text-right">Ενέργειες</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-50">
 {data.map((item) => (
 <tr key={item.id} className="hover:bg-[var(--background)]">
 <td className="px-6 py-4 font-bold text-[var(--foreground)]">
 {item.parishioner.lastName} {item.parishioner.firstName}
 </td>
 <td className="px-6 py-4 text-[var(--text-secondary)]">{item.exSpouseName}</td>
 <td className="px-6 py-4 text-[var(--text-muted)]">
 <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> {new Date(item.issuedDate).toLocaleDateString('el-GR')}</span>
 </td>
 <td className="px-6 py-4 text-center">
 {item.protocolNumber ? (
 <span className="badge badge-success">#{item.protocolNumber}</span>
) : (
 <span className="text-xs text-[var(--text-muted)]">—</span>
)}
 </td>
 <td className="px-6 py-4 text-right">
 <button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
 <Trash2 className="w-4 h-4"/>
 </button>
 </td>
 </tr>
))}
 </tbody>
 </table>
 </div>
) : (
 <div className="py-12 flex flex-col items-center justify-center text-center">
 <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
 <FileHeart className="w-8 h-8 text-[var(--text-muted)]"/>
 </div>
 <h3 className="text-lg font-bold text-[var(--foreground)]">Δεν βρέθηκαν Διαζύγια</h3>
 <p className="text-sm text-[var(--text-muted)] max-w-sm mt-1">Η ενορία δεν έχει καταχωρημένα διαζευκτήρια στο ηλεκτρονικό αρχείο.</p>
 </div>
)}
 </div>

 </div>
)
}
