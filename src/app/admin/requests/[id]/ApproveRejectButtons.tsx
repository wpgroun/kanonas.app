'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Check, X, CalendarCheck, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { approveSacramentRequest, rejectSacramentRequest } from '@/actions/sacraments'

export default function ApproveRejectButtons({ tokenId, status, date, title, isAccepted }: { tokenId: string, status: string, date: Date | null, title: string, isAccepted: boolean }) {
 const [loading, setLoading] = useState(false)
 const router = useRouter()

 const handleApprove = async () => {
 if (!confirm('Έγκριση μυστηρίου; Αυτό θα δεσμεύσει την ώρα στο ημερολόγιο και θα στείλει email στο ζευγάρι με το link του έξυπνου ερωτηματολογίου.')) return;
 setLoading(true)
 const res = await approveSacramentRequest(tokenId, date, title);
 setLoading(false)
 if (res.success) {
 router.refresh()
 } else {
 alert(res.error || 'Σφάλμα έγκρισης')
 }
 }

 const handleReject = async () => {
 if (!confirm('Απόρριψη μυστηρίου; Η κράτηση θα ακυρωθεί.')) return;
 setLoading(true)
 const res = await rejectSacramentRequest(tokenId);
 setLoading(false)
 if (res.success) {
 router.push('/admin/requests')
 } else {
 alert(res.error || 'Σφάλμα')
 }
 }

 if (isAccepted || status === 'docs_generated') {
 return (
 <div className="flex bg-[var(--success-light)] text-emerald-800 border border-[var(--success)]/20 px-4 py-3 rounded-lg items-center gap-2 text-sm mt-4">
 <CalendarCheck className="w-5 h-5 text-[var(--success)]"/>
 <div>Το μυστήριο έχει <strong>Εγκριθεί</strong> και η ώρα έχει δεσμευθεί στο πρόγραμμα του Ναού.</div>
 </div>
);
 }

 return (
 <div className="flex gap-2 mt-4 p-4 bg-muted/50 rounded-lg border border-border">
 <div className="flex-1">
 <h3 className="font-semibold text-sm mb-1">Αναμονή Έγκρισης (Νέο Αίτημα)</h3>
 <p className="text-xs text-muted-foreground">Εγκρίνετε το μυστήριο για να το βάλετε στο ημερολόγιο και να σταλεί το έξυπνο ερωτηματολόγιο στους πολίτες.</p>
 </div>
 <div className="flex items-center gap-2">
 <Button onClick={handleReject} disabled={loading} variant="destructive"size="sm">
 <X className="w-4 h-4 mr-1"/> Απόρριψη
 </Button>
 <Button onClick={handleApprove} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white"size="sm">
 {loading ? <Loader2 className="w-4 h-4 mr-1 animate-spin"/> : <Check className="w-4 h-4 mr-1"/>}
 Έγκριση & Δέσμευση
 </Button>
 </div>
 </div>
)
}
