'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { UserX, Loader2 } from 'lucide-react'
import { removePersonFromSacrament } from '@/actions/sacraments'

export default function RemovePersonButton({ ceremonyPersonId }: { ceremonyPersonId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleRemove = async () => {
    if (!confirm('Αφαίρεση προσώπου από το μυστήριο;')) return
    setLoading(true)
    const res = await removePersonFromSacrament(ceremonyPersonId)
    setLoading(false)
    if (res.success) {
      router.refresh()
    } else {
      alert(res.error || 'Σφάλμα διαγραφής')
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleRemove}
      disabled={loading}
      className="text-destructive hover:bg-destructive hover:text-white flex-shrink-0"
      title="Αφαίρεση"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserX className="w-4 h-4" />}
    </Button>
  )
}
