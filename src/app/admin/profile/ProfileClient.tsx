'use client'

import { useState } from 'react'
import { updateMyProfile, changeMyPassword } from '@/actions/users'
import { Save, Lock, Loader2, CheckCircle2 } from 'lucide-react'

export default function ProfileClient({ 
  user, 
  sessions, 
  currentSessionId 
}: { 
  user: { firstName: string, lastName: string, email: string },
  sessions?: any[],
  currentSessionId?: string
}) {
  // Profile State
  const [firstName, setFirstName] = useState(user.firstName)
  const [lastName, setLastName] = useState(user.lastName)
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [profileError, setProfileError] = useState('')

  // Password State
  const [currentPass, setCurrentPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [loadingPass, setLoadingPass] = useState(false)
  const [passSuccess, setPassSuccess] = useState(false)
  const [passError, setPassError] = useState('')

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoadingProfile(true)
    setProfileError('')
    setProfileSuccess(false)
    
    const res = await updateMyProfile({ firstName, lastName })
    if (res.success) {
      setProfileSuccess(true)
      setTimeout(() => setProfileSuccess(false), 3000)
    } else {
      setProfileError(res.error || 'Σφάλμα')
    }
    setLoadingProfile(false)
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoadingPass(true)
    setPassError('')
    setPassSuccess(false)

    if (newPass !== confirmPass) {
      setPassError('Οι κωδικοί δεν ταιριάζουν!')
      setLoadingPass(false)
      return
    }

    const res = await changeMyPassword(currentPass, newPass)
    if (res.success) {
      setPassSuccess(true)
      setCurrentPass('')
      setNewPass('')
      setConfirmPass('')
      setTimeout(() => setPassSuccess(false), 3000)
    } else {
      setPassError(res.error || 'Σφάλμα κατά την αλλαγή κωδικού')
    }
    setLoadingPass(false)
  }

  return (
    <div className="space-y-6">
      {/* Προσωπικά Στοιχεία */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Στοιχεία Λογαριασμού</h2>
        
        <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-full mb-2">
            <label className="block text-sm font-bold text-slate-500 mb-1">Email <span className="text-xs font-normal">(Δεν αλλάζει)</span></label>
            <input type="email" value={user.email} disabled className="data-input w-full bg-slate-50 text-slate-400 cursor-not-allowed" />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Όνομα</label>
            <input required type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="data-input w-full" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Επώνυμο</label>
            <input required type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="data-input w-full" />
          </div>

          <div className="col-span-full flex items-center justify-between mt-4">
            <div>
              {profileError && <span className="text-rose-500 text-sm font-medium">{profileError}</span>}
              {profileSuccess && <span className="text-emerald-500 text-sm font-bold flex items-center gap-1"><CheckCircle2 className="w-4 h-4"/>Ενημερώθηκε!</span>}
            </div>
            <button disabled={loadingProfile} type="submit" className="btn btn-primary flex items-center gap-2">
              {loadingProfile ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4"/>}
              Αποθήκευση Στοιχείων
            </button>
          </div>
        </form>
      </div>

      {/* Αλλαγή Κωδικού */}
      <div className="bg-white rounded-2xl border border-rose-100 p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-bl-full -z-10" />
        
        <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
          <Lock className="w-5 h-5 text-rose-500" />
          Αλλαγή Κωδικού Πρόσβασης
        </h2>

        <form onSubmit={handlePasswordUpdate} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Τρέχων Κωδικός</label>
            <input required type="password" value={currentPass} onChange={e => setCurrentPass(e.target.value)} placeholder="••••••••" className="data-input w-full" />
          </div>
          <div className="pt-2 border-t border-slate-50">
            <label className="block text-sm font-bold text-slate-700 mb-1">Νέος Κωδικός</label>
            <input required type="password" minLength={10} value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="Τουλάχιστον 10 χαρακτήρες" className="data-input w-full" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Επιβεβαίωση Νέου Κωδικού</label>
            <input required type="password" minLength={10} value={confirmPass} onChange={e => setConfirmPass(e.target.value)} placeholder="Τουλάχιστον 10 χαρακτήρες" className="data-input w-full" />
          </div>

          <div className="flex items-center justify-between pt-4">
            <div>
              {passError && <span className="text-rose-500 text-sm font-medium">{passError}</span>}
              {passSuccess && <span className="text-emerald-500 text-sm font-bold flex items-center gap-1"><CheckCircle2 className="w-4 h-4"/>Άλλαξε!</span>}
            </div>
            <button disabled={loadingPass} type="submit" className="bg-slate-800 hover:bg-slate-900 text-white font-semibold py-2 px-4 rounded-xl text-sm transition-colors flex items-center gap-2 disabled:opacity-50">
              {loadingPass ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Ενημέρωση Κωδικού'}
            </button>
          </div>
        </form>
      </div>

      {/* Session Management */}
      {sessions && sessions.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Ενεργές Συνεδρίες (Sessions)</h2>
              <p className="text-sm text-slate-500">Οι συσκευές στις οποίες είστε συνδεδεμένοι.</p>
            </div>
            <button 
              onClick={async () => {
                if (!confirm('Θέλετε σίγουρα να αποσυνδεθείτε από όλες τις άλλες συσκευές;')) return;
                const { revokeAllOtherSessions } = await import('@/actions/auth');
                const res = await revokeAllOtherSessions();
                if (res.success) {
                  alert('Επιτυχής αποσύνδεση από άλλες συσκευές.');
                  window.location.reload();
                } else alert(res.error);
              }}
              className="bg-rose-50 text-rose-600 hover:bg-rose-100 px-4 py-2 rounded-xl text-sm font-bold transition-colors"
            >
              Αποσύνδεση Παντού
            </button>
          </div>
          <div className="space-y-3">
            {sessions.map((s) => (
              <div key={s.id} className="flex justify-between items-center bg-slate-50 border border-slate-100 p-4 rounded-xl">
                <div>
                  <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    {s.userAgent?.includes('Mobi') ? '📱 Mobile' : '💻 Desktop'} 
                    <span className="text-xs text-slate-500 font-normal">({s.userAgent})</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1 font-mono">
                    IP: {s.ipAddress} • Τελευταία δραστηριότητα: {new Date(s.lastActive).toLocaleString('el-GR')}
                  </div>
                </div>
                {s.id === currentSessionId && (
                  <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">Αυτή η συσκευή</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
