'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createParishioner } from '../../../actions'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, UserPlus, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function NewParishionerPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [fathersName, setFathersName] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [afm, setAfm] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!firstName || !lastName) { setError('Συμπληρώστε τουλάχιστον Όνομα και Επώνυμο.'); return }
    setLoading(true)
    setError('')
    const res = await createParishioner({ firstName, lastName, email, phone })
    if (res.success) {
      router.push(`/admin/parishioners/${res.id}`)
    } else {
      setError(res.error || 'Σφάλμα δημιουργίας')
      setLoading(false)
    }
  }

  return (
    <div className="container-fluid mt-6 space-y-6 max-w-2xl animate-in fade-in duration-500">
      <div>
        <Link href="/admin/parishioners" className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-1 mb-3 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Πίσω στο Μητρώο
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Νέος Ενορίτης</h1>
        <p className="text-muted-foreground mt-1 text-sm">Καταχωρήστε τα στοιχεία του νέου μέλους του ποιμνίου.</p>
      </div>

      <Card className="shadow-sm border-border/50">
        <CardHeader className="border-b border-border/50 bg-muted/20 pb-4">
          <CardTitle className="flex items-center gap-2 text-lg"><UserPlus className="w-5 h-5 text-primary" /> Στοιχεία Ενορίτη</CardTitle>
          <CardDescription>Συμπληρώστε τα παρακάτω πεδία. Τα πεδία με * είναι υποχρεωτικά.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md font-medium">{error}</div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Επώνυμο *</Label>
                <Input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Παπαδόπουλος" required autoFocus />
              </div>
              <div className="space-y-2">
                <Label>Όνομα *</Label>
                <Input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Γεώργιος" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Πατρώνυμο</Label>
              <Input value={fathersName} onChange={e => setFathersName(e.target.value)} placeholder="Ιωάννης" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" />
              </div>
              <div className="space-y-2">
                <Label>Τηλέφωνο</Label>
                <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="210XXXXXXX / 69XXXXXXXX" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2 md:col-span-1">
                <Label>Διεύθυνση</Label>
                <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="π.χ. Αθηνάς 12" />
              </div>
              <div className="space-y-2">
                <Label>Πόλη</Label>
                <Input value={city} onChange={e => setCity(e.target.value)} placeholder="Αθήνα" />
              </div>
            </div>

            <div className="space-y-2 max-w-xs">
              <Label>Α.Φ.Μ.</Label>
              <Input value={afm} onChange={e => setAfm(e.target.value)} placeholder="9 ψηφία" className="font-mono" />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={() => router.push('/admin/parishioners')}>Ακύρωση</Button>
              <Button type="submit" disabled={loading} className="min-w-[150px]">
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Αποθήκευση...</> : <><UserPlus className="w-4 h-4 mr-2" />Καταχώρηση</>}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

