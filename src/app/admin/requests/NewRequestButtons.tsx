'use client'

import { useState } from 'react'
import { createSacramentRequest } from '../../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Copy, Check, ExternalLink, Loader2 } from 'lucide-react'

type ServiceType = 'GAMOS' | 'VAPTISI'

function NewRequestModal({ open, onClose, serviceType }: { open: boolean, onClose: () => void, serviceType: ServiceType }) {
  const [step, setStep] = useState<'form' | 'success'>('form')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [generatedHash, setGeneratedHash] = useState('')
  const [copied, setCopied] = useState(false)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [date, setDate] = useState('')

  const label = serviceType === 'GAMOS' ? 'Γάμου' : 'Βάπτισης'
  const icon = serviceType === 'GAMOS' ? '💍' : '🕊️'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !date) { setError('Συμπληρώστε Οικογένεια και Ημερομηνία'); return }
    setLoading(true)
    setError('')
    const res = await createSacramentRequest({ type: serviceType, name, email, phone, date })
    if (res.success) {
      setGeneratedHash(res.hash!)
      setStep('success')
    } else {
      setError(res.error || 'Σφάλμα δημιουργίας')
    }
    setLoading(false)
  }

  const publicUrl = typeof window !== 'undefined' ? `${window.location.origin}/request/${generatedHash}` : ''

  function handleCopy() {
    navigator.clipboard.writeText(publicUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  function handleClose() {
    setStep('form')
    setName(''); setEmail(''); setPhone(''); setDate('')
    setError(''); setGeneratedHash(''); setCopied(false)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {step === 'form' ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">{icon} Νέα Αίτηση {label}</DialogTitle>
              <DialogDescription>
                Συμπληρώστε τα βασικά στοιχεία. Θα δημιουργηθεί ένα μοναδικό link για την οικογένεια.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">{error}</div>
              )}
              <div className="space-y-2">
                <Label>Οικογένεια / Επωνυμία *</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder={serviceType === 'GAMOS' ? 'π.χ. Παπαδόπουλος - Στεφάνου' : 'π.χ. Οικ. Γεωργίου Παππά'} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email Επικοινωνίας</Label>
                  <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" />
                </div>
                <div className="space-y-2">
                  <Label>Τηλέφωνο</Label>
                  <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="69XXXXXXXX" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Ημερομηνία Τέλεσης *</Label>
                <Input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} required />
              </div>
              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={handleClose}>Ακύρωση</Button>
                <Button type="submit" disabled={loading}>
                  {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Δημιουργία...</> : 'Δημιουργία Token'}
                </Button>
              </DialogFooter>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl text-emerald-600">✅ Αίτηση Δημιουργήθηκε!</DialogTitle>
              <DialogDescription>
                Στείλτε το παρακάτω link στην οικογένεια για να συμπληρώσει τα στοιχεία της.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 space-y-4">
              <div className="bg-muted/50 rounded-lg p-4 border border-border/80 space-y-3">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Δημόσιο Link Οικογένειας</p>
                <p className="font-mono text-sm break-all text-foreground">{publicUrl}</p>
                <div className="flex gap-2">
                  <Button onClick={handleCopy} variant="outline" size="sm" className="flex-1">
                    {copied ? <><Check className="w-4 h-4 mr-2 text-emerald-500" />Αντιγράφηκε!</> : <><Copy className="w-4 h-4 mr-2" />Αντιγραφή</>}
                  </Button>
                  <Button onClick={() => window.open(publicUrl, '_blank')} variant="outline" size="sm">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center">Το link είναι μοναδικό για αυτή την αίτηση. Μπορείτε επίσης να το βρείτε στη σελίδα του Μυστηρίου.</p>
            </div>
            <DialogFooter className="pt-2">
              <Button onClick={handleClose} className="w-full">Κλείσιμο</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default function NewRequestButtons() {
  const [open, setOpen] = useState(false)
  const [serviceType, setServiceType] = useState<ServiceType>('GAMOS')

  function openFor(type: ServiceType) {
    setServiceType(type)
    setOpen(true)
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button
          size="lg"
          onClick={() => openFor('GAMOS')}
          className="h-auto py-4 flex flex-col items-start gap-1 justify-center bg-blue-600 hover:bg-blue-700 text-white"
        >
          <span className="text-lg font-bold flex items-center gap-2">💍 Νέα Αίτηση Γάμου</span>
          <span className="text-xs font-normal opacity-80">Δημιουργία token & αποστολή link</span>
        </Button>
        <Button
          size="lg"
          onClick={() => openFor('VAPTISI')}
          className="h-auto py-4 flex flex-col items-start gap-1 justify-center bg-blue-100/50 hover:bg-blue-100 text-blue-900 border border-blue-200"
        >
          <span className="text-lg font-bold flex items-center gap-2">🕊️ Νέα Αίτηση Βάπτισης</span>
          <span className="text-xs font-normal opacity-80">Δημιουργία token & αποστολή link</span>
        </Button>
        <Button size="lg" variant="outline" className="h-auto py-4 flex flex-col items-start gap-1 justify-center" disabled>
          <span className="text-lg font-bold flex items-center gap-2">🖨️ Μαζική Έκδοση PDF</span>
          <span className="text-xs font-normal text-muted-foreground">Για όλες τις έτοιμες αιτήσεις</span>
        </Button>
      </div>

      <NewRequestModal open={open} onClose={() => setOpen(false)} serviceType={serviceType} />
    </>
  )
}

