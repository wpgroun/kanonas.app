'use client'

import { useState } from 'react'
import { cancelMySubscription } from '@/actions/subscriptions'
import { Loader2, XCircle } from 'lucide-react'

export default function CancelButton() {
  const [loading, setLoading] = useState(false)

  const handleCancel = async () => {
    if (!confirm('Είστε βέβαιοι ότι θέλετε να ακυρώσετε τη συνδρομή σας;\n\nΟι υπηρεσίες θα συνεχίσουν να είναι ενεργές μέχρι το τέλος της τρέχουσας περιόδου χρέωσης.')) return

    setLoading(true)
    try {
      const res = await cancelMySubscription()
      if (!res.success) alert(res.error)
      else alert('Η συνδρομή σας θα ακυρωθεί στο τέλος της περιόδου χρέωσης.')
    } catch (e: any) {
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button 
      onClick={handleCancel} 
      disabled={loading} 
      className="btn btn-sm hover:bg-[var(--danger-light)] text-[var(--danger)] border border-[var(--danger)]/20 disabled:opacity-50"
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><XCircle className="w-3.5 h-3.5 mr-1"/> Ακύρωση Ανανέωσης</>}
    </button>
  )
}
