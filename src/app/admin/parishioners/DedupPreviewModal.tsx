'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Trash2, Users, CheckCircle } from 'lucide-react'
import type { DedupGroup } from '@/actions/parishioners'
import Link from 'next/link'

interface Props {
  open: boolean
  onClose: () => void
  groups: DedupGroup[]
  onConfirm: () => void
  confirming: boolean
}

export default function DedupPreviewModal({ open, onClose, groups, onConfirm, confirming }: Props) {
  const totalToDelete = groups.reduce((sum, g) => sum + g.parishioners.length - 1, 0)

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose() }}>
      <DialogContent className="flex flex-col p-0 gap-0" style={{ width: '90vw', maxWidth: '760px', maxHeight: '85vh' }}>
        <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Users className="w-4 h-4 text-red-500"/>
            Εκκαθάριση Διπλότυπων Ενοριτών
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {groups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground gap-3">
              <CheckCircle className="w-10 h-10 text-emerald-500"/>
              <p className="font-medium text-foreground">Δεν βρέθηκαν διπλότυποι ενορίτες!</p>
              <p className="text-sm">Το μητρώο σας είναι καθαρό.</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Βρέθηκαν <strong className="text-foreground">{groups.length} ομάδες</strong> με διπλότυπα ονόματα.
                Θα διαγραφούν <strong className="text-red-600">{totalToDelete} αντίγραφα</strong> — διατηρείται πάντα ο παλαιότερος ενορίτης.
              </p>

              <div className="space-y-3">
                {groups.map((group, gi) => (
                  <div key={gi} className="border border-border rounded-lg overflow-hidden">
                    <div className="bg-muted/40 px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      {group.parishioners[0].lastName} {group.parishioners[0].firstName} — {group.parishioners.length} εγγραφές
                    </div>
                    <div className="divide-y divide-border">
                      {group.parishioners.map((p, i) => (
                        <div key={p.id} className={`flex items-center gap-3 px-4 py-2.5 text-sm ${i === 0 ? 'bg-emerald-50' : 'bg-red-50/40'}`}>
                          {i === 0 ? (
                            <Badge variant="outline" className="text-xs shrink-0 bg-emerald-100 text-emerald-700 border-emerald-200">Διατηρείται</Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs shrink-0 bg-red-100 text-red-700 border-red-200">Διαγράφεται</Badge>
                          )}
                          <div className="flex-1 min-w-0">
                            <span className="font-medium">{p.firstName} {p.lastName}</span>
                            {p.afm && <span className="text-muted-foreground ml-2 text-xs">ΑΦΜ: {p.afm}</span>}
                            {p.email && <span className="text-muted-foreground ml-2 text-xs">{p.email}</span>}
                            {p.phone && <span className="text-muted-foreground ml-2 text-xs">{p.phone}</span>}
                          </div>
                          <div className="text-xs text-muted-foreground shrink-0">
                            {new Date(p.createdAt).toLocaleDateString('el-GR')}
                          </div>
                          <Link href={`/admin/parishioners/${p.id}`} target="_blank"
                            className="text-xs text-blue-600 hover:underline shrink-0">
                            Προβολή
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <DialogFooter className="px-6 py-4 border-t flex-shrink-0 flex justify-between gap-3">
          <Button variant="outline" onClick={onClose} disabled={confirming}>Κλείσιμο</Button>
          {groups.length > 0 && (
            <Button
              onClick={onConfirm}
              disabled={confirming}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {confirming
                ? <><Loader2 className="w-4 h-4 animate-spin mr-2"/>Διαγραφή...</>
                : <><Trash2 className="w-4 h-4 mr-2"/>Διαγραφή {totalToDelete} αντιγράφων</>
              }
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
