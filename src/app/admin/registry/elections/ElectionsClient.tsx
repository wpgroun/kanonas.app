'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Printer, Users, UserCheck } from 'lucide-react'

type ElectoralParishioner = {
 id: string
 firstName: string
 lastName: string
 phone: string
 profession: string
 registeredAt: Date
 totalContributedThisYear: number
}

export default function ElectionsClient({
 initialData, selectedYear
}: {
 initialData: ElectoralParishioner[], selectedYear: number
}) {
 const router = useRouter()
 const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)

 return (
 <div className="space-y-6">
 {/* Filters Bar */}
 <div className="card p-4 flex flex-col sm:flex-row gap-4 justify-between items-center bg-[var(--surface)] shadow-sm rounded-xl">
 <div className="flex items-center gap-3 w-full sm:w-auto">
 <label className="text-sm font-semibold text-gray-700">Έτος Ενημερότητας:</label>
 <select 
 value={selectedYear}
 onChange={(e) => router.push(`/admin/registry/elections?year=${e.target.value}`)}
 className="input-field w-32"
 >
 {years.map(y => (
 <option key={y} value={y}>{y}</option>
))}
 </select>
 </div>
 
 <button 
 onClick={() => window.print()}
 className="btn btn-secondary w-full sm:w-auto"
 >
 <Printer className="w-4 h-4"/> Εκτύπωση Καταλόγου
 </button>
 </div>

 {/* Summary KPI */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="card p-5 flex items-center justify-between border-l-4 border-l-emerald-500 bg-[var(--success-light)]/30">
 <div>
 <p className="text-sm font-bold text-[var(--text-secondary)] mb-1">Δικαίωμα Ψήφου</p>
 <h3 className="text-2xl font-black text-[var(--foreground)]">{initialData.length} Ενορίτες</h3>
 </div>
 <div className="w-12 h-12 rounded-full bg-[var(--success-light)] flex items-center justify-center">
 <UserCheck className="w-6 h-6 text-[var(--success)]"/>
 </div>
 </div>
 </div>

 {/* Table */}
 <div className="card overflow-hidden">
 {initialData.length > 0 ? (
 <div className="overflow-x-auto">
 <table className="w-full text-sm text-left">
 <thead className="text-xs text-[var(--text-secondary)] uppercase bg-[var(--background)]/80 border-b border-[var(--border)]">
 <tr>
 <th className="px-6 py-4 font-bold">Ονοματεπώνυμο</th>
 <th className="px-6 py-4 font-bold hidden sm:table-cell">Τηλέφωνο</th>
 <th className="px-6 py-4 font-bold hidden md:table-cell">Συνδρομή Έτους</th>
 <th className="px-6 py-4 font-bold text-right">Εγγραφή</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-50">
 {initialData.map((person) => (
 <tr key={person.id} className="hover:bg-[var(--background)]/50 transition-colors">
 <td className="px-6 py-4">
 <p className="font-bold text-[var(--foreground)]">{person.lastName} {person.firstName}</p>
 <p className="text-xs text-[var(--text-muted)]">{person.profession}</p>
 </td>
 <td className="px-6 py-4 hidden sm:table-cell text-gray-700">
 {person.phone}
 </td>
 <td className="px-6 py-4 hidden md:table-cell">
 <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
 €{person.totalContributedThisYear.toFixed(2)}
 </span>
 </td>
 <td className="px-6 py-4 text-right text-[var(--text-muted)]">
 {new Date(person.registeredAt).toLocaleDateString('el-GR')}
 </td>
 </tr>
))}
 </tbody>
 </table>
 </div>
) : (
 <div className="py-12 flex flex-col items-center justify-center text-center">
 <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
 <Users className="w-8 h-8 text-[var(--text-muted)]"/>
 </div>
 <h3 className="text-lg font-bold text-[var(--foreground)] mb-1">Κανένας ενορίτης</h3>
 <p className="text-sm text-[var(--text-muted)] max-w-md">
 Δεν βρέθηκαν μέλη που να έχουν καταβάλει συνδρομή (Donation) 
 κατά το έτος {selectedYear}. Ως εκ τούτου, κανείς δεν έχει δικαίωμα ψήφου (Good Standing).
 </p>
 </div>
)}
 </div>
 
 {/* CSS for printing hidden elements */}
 <style dangerouslySetInnerHTML={{__html: `
 @media print {
 body * { visibility: hidden; }
 .card * { visibility: visible; }
 .card { position: absolute; left: 0; top: 0; w-full; padding: 0;}
 .btn, .input-field { display: none !important; }
 }
 `}} />
 </div>
)
}
