'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createParishioner } from '@/actions/parishioners'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, UserPlus, Loader2, AlertTriangle, ExternalLink } from 'lucide-react'
import Link from 'next/link'

type SoftDuplicateMatch = { id: string; firstName: string; lastName: string; afm?: string | null }

export default function NewParishionerPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [softDuplicates, setSoftDuplicates] = useState<SoftDuplicateMatch[] | null>(null)
  const [pendingFormData, setPendingFormData] = useState<Parameters<typeof createParishioner>[0] | null>(null)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [fathersName, setFathersName] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [afm, setAfm] = useState('')
  const [idNumber, setIdNumber] = useState('')

  async function submitCreate(forceCreate = false) {
    if (!firstName || !lastName) { setError('Συμπληρώστε τουλάχιστον Όνομα και Επώνυμο.'); return }
    setLoading(true)
    setError('')

    const formData = { firstName, lastName, email, phone, fathersName, address, city, afm, idNumber, forceCreate }
    const res = await createParishioner(formData)

    if (res.success) {
      router.push(`/admin/parishioners/${res.id}`)
      return
    }

    setLoading(false)

    if (res.errorType === 'SOFT_DUPLICATE') {
      setSoftDuplicates(res.existing)
      setPendingFormData(formData)
      return
    }

    if (res.errorType === 'DUPLICATE_AFM' || res.errorType === 'DUPLICATE_ID') {
      const field = res.errorType === 'DUPLICATE_AFM' ? 'ΑΦΜ' : 'ΑΔΤ'
      setError(`Υπάρχει ήδη ενορίτης με το ίδιο ${field}: ${(res.existing as any).firstName} ${(res.existing as any).lastName}`)
      return
    }

    setError(res.error || 'Σφάλμα δημιουργίας')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await submitCreate(false)
  }

  async function handleForceCreate() {
    setSoftDuplicates(null)
    setLoading(true)
    const formData = { ...pendingFormData!, forceCreate: true }
    const res = await createParishioner(formData)
    setLoading(false)
    if (res.success) {
      router.push(`/admin/parishioners/${res.id}`)
    } else {
      setError(res.error || 'Σφάλμα δημιουργίας')
    }
  }

  return (
    <div className="container-fluid mt-6 space-y-6 max-w-2xl animate-in fade-in duration-500">
      <div>
        <Link href="/admin/parishioners" className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-1 mb-3 transition-colors">
          <ArrowLeft className="w-4 h-4"/> Πίσω στο Μητρώο
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Νέος Ενορίτης</h1>
        <p className="text-muted-foreground mt-1 text-sm">Καταχωρήστε τα στοιχεία του νέου μέλους του ποιμνίου.</p>
      </div>

      {/* Soft duplicate warning */}
      {softDuplicates && (
        <Card className="border-amber-300 bg-amber-50 shadow-sm">
          <CardContent className="pt-5 pb-4 space-y-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5"/>
              <div>
                <p className="font-semibold text-amber-900">Πιθανός διπλότυπος ενορίτης</p>
                <p className="text-sm text-amber-700 mt-0.5">
                  Βρέθηκ{softDuplicates.length === 1 ? 'ε' : 'αν'} {softDuplicates.length} ενορίτ{softDuplicates.length === 1 ? 'ης' : 'ες'} με το ίδιο όνομα στο μητρώο:
                </p>
              </div>
            </div>
            <div className="ml-8 space-y-1">
              {softDuplicates.map(p => (
                <div key={p.id} className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-amber-900">{p.firstName} {p.lastName}</span>
                  {p.afm && <span className="text-amber-600 text-xs">ΑΦΜ: {p.afm}</span>}
                  <Link href={`/admin/parishioners/${p.id}`} target="_blank"
                    className="text-blue-600 hover:underline text-xs flex items-center gap-0.5">
                    Προβολή <ExternalLink className="w-3 h-3"/>
                  </Link>
                </div>
              ))}
            </div>
            <div className="ml-8 flex gap-2 pt-1">
              <Button size="sm" variant="outline" onClick={() => setSoftDuplicates(null)}
                className="border-amber-300 text-amber-800 hover:bg-amber-100">
                Ακύρωση
              </Button>
              <Button size="sm" onClick={handleForceCreate} disabled={loading}
                className="bg-amber-600 hover:bg-amber-700 text-white">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1"/> : null}
                Καταχώρηση Ούτως ή Άλλως
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-sm border-border/50">
        <CardHeader className="border-b border-border/50 bg-muted/20 pb-4">
          <CardTitle className="flex items-center gap-2 text-lg"><UserPlus className="w-5 h-5 text-primary"/> Στοιχεία Ενορίτη</CardTitle>
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
              <Input value={fathersName} onChange={e => setFathersName(e.target.value)} placeholder="Ιωάννης"/>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com"/>
              </div>
              <div className="space-y-2">
                <Label>Τηλέφωνο</Label>
                <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="210XXXXXXX / 69XXXXXXXX"/>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2 md:col-span-1">
                <Label>Διεύθυνση</Label>
                <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="π.χ. Αθηνάς 12"/>
              </div>
              <div className="space-y-2">
                <Label>Πόλη</Label>
                <Input value={city} onChange={e => setCity(e.target.value)} placeholder="Αθήνα"/>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Α.Φ.Μ.</Label>
                <Input value={afm} onChange={e => setAfm(e.target.value)} placeholder="9 ψηφία" className="font-mono"/>
              </div>
              <div className="space-y-2">
                <Label>Α.Δ.Τ. <span className="text-muted-foreground text-xs">(Αριθμός Δελτίου Ταυτότητας)</span></Label>
                <Input value={idNumber} onChange={e => setIdNumber(e.target.value)} placeholder="π.χ. ΑΒ123456" className="font-mono"/>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={() => router.push('/admin/parishioners')}>Ακύρωση</Button>
              <Button type="submit" disabled={loading} className="min-w-[150px]">
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/>Αποθήκευση...</> : <><UserPlus className="w-4 h-4 mr-2"/>Καταχώρηση</>}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
