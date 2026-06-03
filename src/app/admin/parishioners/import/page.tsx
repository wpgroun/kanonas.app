'use client'

import { useState } from 'react'
import * as XLSX from 'xlsx'
import { useRouter } from 'next/navigation'
import { importParishioners } from '@/actions/import'
import Link from 'next/link'

const EXPECTED_FIELDS = [
  { key: 'firstName', label: 'Όνομα (Απαραίτητο)', required: true },
  { key: 'lastName', label: 'Επώνυμο (Απαραίτητο)', required: true },
  { key: 'fathersName', label: 'Πατρώνυμο', required: false },
  { key: 'email', label: 'Email', required: false },
  { key: 'phone', label: 'Τηλέφωνο', required: false },
  { key: 'address', label: 'Διεύθυνση', required: false },
  { key: 'city', label: 'Πόλη', required: false },
  { key: 'afm', label: 'ΑΦΜ', required: false },
  { key: 'birthDate', label: 'Ημ/νια Γέννησης', required: false },
];

export default function ImportPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [fileData, setFileData] = useState<any[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [importing, setImporting] = useState(false)
  const [results, setResults] = useState<any>(null)

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (evt) => {
      const bstr = evt.target?.result
      const wb = XLSX.read(bstr, { type: 'binary' })
      const wsname = wb.SheetNames[0]
      const ws = wb.Sheets[wsname]
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][]
      
      if (data.length > 0) {
        const h = data[0].map((c: any) => String(c).trim())
        setHeaders(h)
        const rows = data.slice(1).filter(r => r.length > 0)
        setFileData(rows)
        
        // Auto-detect mapping
        const initialMapping: Record<string, string> = {}
        h.forEach((headerStr, colIndex) => {
          const lower = headerStr.toLowerCase()
          if (lower.includes('όνομα') || lower.includes('ονομα') || lower === 'name' || lower === 'first name') {
            if (!lower.includes('επώνυμο') && !initialMapping['firstName']) initialMapping['firstName'] = colIndex.toString()
          }
          if (lower.includes('επώνυμο') || lower.includes('επωνυμο') || lower === 'last name' || lower === 'surname') {
            if (!initialMapping['lastName']) initialMapping['lastName'] = colIndex.toString()
          }
          if (lower.includes('πατρώνυμο') || lower.includes('πατρωνυμο')) initialMapping['fathersName'] = colIndex.toString()
          if (lower.includes('email') || lower.includes('e-mail')) initialMapping['email'] = colIndex.toString()
          if (lower.includes('τηλ') || lower.includes('phone') || lower.includes('κιν')) initialMapping['phone'] = colIndex.toString()
          if (lower.includes('διεύθυνση') || lower.includes('διευθυνση') || lower.includes('οδός') || lower.includes('address')) initialMapping['address'] = colIndex.toString()
          if (lower.includes('πόλη') || lower.includes('πολη') || lower.includes('city')) initialMapping['city'] = colIndex.toString()
          if (lower.includes('αφμ') || lower.includes('α.φ.μ')) initialMapping['afm'] = colIndex.toString()
          if (lower.includes('γεν') || lower.includes('birth') || lower.includes('ηλικία')) initialMapping['birthDate'] = colIndex.toString()
        })
        setMapping(initialMapping)
        setStep(2)
      }
    }
    reader.readAsBinaryString(file)
  }

  async function handleImport() {
    setImporting(true)
    
    // Prepare data
    const rowsToImport = fileData.map(row => {
      const obj: any = {}
      for (const key of Object.keys(mapping)) {
        const colIndex = parseInt(mapping[key])
        if (!isNaN(colIndex) && row[colIndex] !== undefined && row[colIndex] !== null) {
          obj[key] = String(row[colIndex])
        }
      }
      return obj
    })

    const res = await importParishioners(rowsToImport)
    setResults(res)
    setImporting(false)
    setStep(3)
  }

  function downloadErrors() {
    if (!results || !results.errors || results.errors.length === 0) return
    const blob = new Blob([results.errors.join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'import_errors.txt'
    a.click()
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-800">Εισαγωγή Ενοριτών (Excel / CSV)</h1>
          <p className="text-slate-500 mt-2">Άμεση προσθήκη πολλαπλών ενοριτών από αρχείο.</p>
        </div>
        <Link href="/admin/parishioners" className="btn bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl">
          Επιστροφή
        </Link>
      </div>

      <div className="flex gap-4 mb-8">
        <div className={`flex-1 p-4 rounded-xl border ${step >= 1 ? 'bg-blue-50 border-blue-200 text-blue-800 font-bold' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
          1. Ανέβασμα Αρχείου
        </div>
        <div className={`flex-1 p-4 rounded-xl border ${step >= 2 ? 'bg-blue-50 border-blue-200 text-blue-800 font-bold' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
          2. Αντιστοίχιση Στηλών
        </div>
        <div className={`flex-1 p-4 rounded-xl border ${step >= 3 ? 'bg-blue-50 border-blue-200 text-blue-800 font-bold' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
          3. Αποτελέσματα
        </div>
      </div>

      {step === 1 && (
        <div className="bg-white border text-center border-slate-200 p-12 rounded-2xl shadow-sm">
          <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Επιλέξτε ένα αρχείο Excel ή CSV</h2>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">Υποστηρίζονται αρχεία .xlsx, .xls, .csv. Η πρώτη γραμμή του αρχείου πρέπει να περιέχει τους τίτλους των στηλών.</p>
          <label className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl cursor-pointer transition-colors shadow-lg shadow-blue-200">
            Αναζήτηση Αρχείου
            <input type="file" className="hidden" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} />
          </label>
        </div>
      )}

      {step === 2 && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-slate-50">
            <h2 className="text-lg font-bold text-slate-800">Αντιστοίχιση Στηλών</h2>
            <p className="text-sm text-slate-500 mt-1">Επιλέξτε σε ποια στήλη του αρχείου σας αντιστοιχεί το κάθε πεδίο.</p>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
               {EXPECTED_FIELDS.map(f => (
                 <div key={f.key} className="flex flex-col gap-2">
                   <label className="text-sm font-bold text-slate-700">{f.label}</label>
                   <select 
                     className="bg-slate-50 border border-slate-300 text-slate-900 rounded-lg p-2.5 w-full outline-none focus:ring-2 ring-blue-500/20 focus:border-blue-500"
                     value={mapping[f.key] || ''}
                     onChange={(e) => setMapping(prev => ({ ...prev, [f.key]: e.target.value }))}
                   >
                     <option value="">-- Αγνοείται --</option>
                     {headers.map((h, i) => (
                       <option key={i} value={i.toString()}>{h || `Στήλη ${i+1}`}</option>
                     ))}
                   </select>
                 </div>
               ))}
          </div>

          {/* Preview Table */}
          <div className="p-6 border-t border-slate-200">
            <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase">Προεπισκόπηση Δεδομένων (Πρώτες 5 γραμμές)</h3>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-100/50 uppercase text-slate-500 text-xs font-bold border-b border-slate-200">
                  <tr>
                    {headers.map((h, i) => <th key={i} className="py-3 px-4">{h || `Στήλη ${i+1}`}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {fileData.slice(0, 5).map((row, rIdx) => (
                    <tr key={rIdx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                      {headers.map((_, i) => (
                         <td key={i} className="py-2 px-4 text-slate-700">{row[i] || '-'}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
             <button onClick={() => setStep(1)} className="btn bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 px-6 py-3 rounded-xl font-bold">
               Ακύρωση
             </button>
             <button 
               onClick={handleImport} 
               disabled={importing || !mapping.firstName || !mapping.lastName}
               className="btn bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-blue-200 flex items-center gap-2"
             >
               {importing ? (
                 <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Εισαγωγή Δεδομένων...
                 </>
               ) : (
                 `Εισαγωγή ${fileData.length} Εγγραφών`
               )}
             </button>
          </div>
        </div>
      )}

      {step === 3 && results && (
        <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm text-center">
           <div className={`w-20 h-20 ${results.success ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'} rounded-full flex items-center justify-center mx-auto mb-6`}>
              {results.success ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
              )}
           </div>
           
           <h2 className="text-2xl font-black text-slate-800 mb-2">
             {results.success ? 'Η Εισαγωγή Ολοκληρώθηκε' : 'Αποτυχία Εισαγωγής'}
           </h2>
           <p className="text-slate-600 mb-8 max-w-md mx-auto">Η διαδικασία ολοκληρώθηκε. Δείτε παρακάτω τα αποτελέσματα της εισαγωγής στο Μητρώο.</p>

           <div className="flex justify-center gap-6 mb-8">
              <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl min-w-[150px]">
                 <span className="block text-4xl font-black text-emerald-600">{results.imported}</span>
                 <span className="uppercase text-xs font-bold text-emerald-800 mt-2 block">Εισήχθησαν</span>
              </div>
              <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl min-w-[150px]">
                 <span className="block text-4xl font-black text-amber-600">{results.skipped}</span>
                 <span className="uppercase text-xs font-bold text-amber-800 mt-2 block">Παραλείφθηκαν</span>
              </div>
           </div>

           {results.errors?.length > 0 && (
             <div className="bg-red-50 border border-red-200 p-6 rounded-2xl mb-8 max-w-xl mx-auto">
               <h3 className="text-red-800 font-bold mb-2 flex items-center justify-center gap-2">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                 Βρέθηκαν Σφάλματα
               </h3>
               <p className="text-sm text-red-700 mb-4">Ορισμένες εγγραφές είχαν ελλιπή στοιχεία ή σφάλματα.</p>
               <button onClick={downloadErrors} className="bg-white border border-red-300 text-red-700 hover:bg-red-100 font-bold px-4 py-2 rounded-lg text-sm transition-colors">
                  Λήψη Αναφοράς Σφαλμάτων (TXT)
               </button>
             </div>
           )}

           <button onClick={() => router.push('/admin/parishioners')} className="btn bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg">
             Ολοκλήρωση & Επιστροφή στο Μητρώο
           </button>
        </div>
      )}
    </div>
  )
}
