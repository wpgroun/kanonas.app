'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { deleteTransaction } from '@/actions/finances'

export default function DeleteTransactionBtn({ id, type }: { id: string, type: 'INCOME' | 'EXPENSE' }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!window.confirm("Διαγραφή κίνησης;")) return
    
    setLoading(true)
    const res = await deleteTransaction(id, type)
    if (res.success) {
      router.refresh()
    } else {
      alert(res.error || "Σφάλμα κατά τη διαγραφή")
      setLoading(false)
    }
  }

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-1 h-8 w-8 p-0" 
      onClick={handleDelete}
      disabled={loading}
      title="Διαγραφή κίνησης"
    >
      <Trash2 className="w-4 h-4" />
    </Button>
  )
}
