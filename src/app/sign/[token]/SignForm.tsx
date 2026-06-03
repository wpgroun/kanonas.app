'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signDocuments } from '@/actions/connect'

export default function SignForm({ token, applicantName, protocol, docs }: { token: string, applicantName: string, protocol?: string | null, docs: any[] }) {
  const router = useRouter()
  const [checked, setChecked] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSign() {
    if (!checked) return
    setLoading(true)
    setError(null)
    
    try {
      const res = await signDocuments(token)
      if (res.success) {
        router.refresh()
      } else {
         setError('Σφάλμα κατά την υπογραφή. Παρακαλούμε προσπαθήστε ξανά.')
      }
    } catch(e) {
      setError('Προέκυψε άγνωστο σφάλμα.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">Στοιχεία Αιτούντος</h3>
        <p className="text-lg font-bold text-slate-900 border-l-4 border-blue-500 pl-3">{applicantName}</p>
        {protocol && <p className="text-xs text-slate-500 mt-1">Αριθμός Πρωτοκόλλου: {protocol}</p>}
      </div>

      <div className="mb-8">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">Προς Υπογραφή Έγγραφα</h3>
        {docs.length === 0 ? (
          <p className="text-sm text-slate-500 italic">Δεν βρέθηκαν έγγραφα προς υπογραφή.</p>
        ) : (
          <ul className="space-y-2">
            {docs.map((d, i) => (
              <li key={i} className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm font-medium text-slate-700">{d.name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mb-8 bg-amber-50 border border-amber-200 p-4 rounded-xl">
        <label className="flex items-start gap-3 cursor-pointer">
          <input 
            type="checkbox" 
            checked={checked} 
            onChange={(e) => setChecked(e.target.checked)} 
            className="mt-1 w-5 h-5 rounded border-amber-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
          />
          <span className="text-sm text-amber-900 font-medium">
            Επιβεβαιώνω ότι τα παραπάνω στοιχεία είναι ακριβή και συναινώ ρητά στην υποβολή και επεξεργασία τους.
          </span>
        </label>
      </div>

      {error && <div className="mb-4 text-xs font-bold text-red-600 bg-red-50 p-3 rounded">{error}</div>}

      <button 
        onClick={handleSign}
        disabled={!checked || loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg transition-all flex justify-center items-center gap-2"
      >
        {loading ? (
           <span className="animate-pulse">Υπογραφή...</span>
        ) : (
           <>
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
             </svg>
             Ψηφιακή Υπογραφή & Αποδοχή
           </>
        )}
      </button>
    </div>
  )
}
