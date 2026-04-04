'use client'

import { useState } from 'react'
import { createCheckoutSession } from '@/actions/subscriptions'
import { Loader2 } from 'lucide-react'

export default function CheckoutButton({ planId, name }: { planId: string, name: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCheckout = async () => {
    setLoading(true)
    setError('')
    
    try {
      const res = await createCheckoutSession(planId, 'monthly')
      if (!res.success) throw new Error(res.error)
      if (res.url) window.location.href = res.url
    } catch (e: any) {
      setError(e.message)
      setLoading(false)
    }
  }

  return (
    <>
      {error && <div className="text-[var(--danger)] text-xs mb-2 text-center font-medium">{error}</div>}
      <button 
        onClick={handleCheckout} 
        disabled={loading} 
        className="btn btn-primary w-full disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : `Επιλογή ${name}`}
      </button>
    </>
  )
}
