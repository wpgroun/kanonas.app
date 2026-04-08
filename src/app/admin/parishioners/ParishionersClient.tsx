'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Users, Plus, Mail, Phone, UserCircle2, Search } from 'lucide-react'

const ALPHABET = ['Α','Β','Γ','Δ','Ε','Ζ','Η','Θ','Ι','Κ','Λ','Μ','Ν','Ξ','Ο','Π','Ρ','Σ','Τ','Υ','Φ','Χ','Ψ','Ω']

export default function ParishionersClient({ parishioners }: { parishioners: any[] }) {
  const [search, setSearch] = useState('')
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null)

  const activeLetters = new Set(
    parishioners.map(p => {
      const first = (p.lastName || '').trim().charAt(0).toUpperCase()
      return first
    })
  )

  const filtered = parishioners.filter(p => {
    if (selectedLetter) {
      const first = (p.lastName || '').trim().charAt(0).toUpperCase()
      if (first !== selectedLetter) return false
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      const matchesSearch = 
        (p.firstName || '').toLowerCase().includes(q) ||
        (p.lastName || '').toLowerCase().includes(q) ||
        (p.email || '').toLowerCase().includes(q) ||
        (p.phone || '').toLowerCase().includes(q)
      
      if (!matchesSearch) return false
    }

    return true
  })

  // We only show ALPHABET letters that are in activeLetters (or additionally keep English letters if present)
  // But let's safely intersect with ALPHABET, plus any non-greek starters that are active
  const visibleLetters = ALPHABET.filter(L => activeLetters.has(L))

  return (
    <div className="container-fluid mt-6 space-y-6">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Μητρώο Ενοριτών
            <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded-full">
              {filtered.length} ενορίτες
            </span>
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Διαχειριστείτε τους πιστούς, τις οικογένειες και το ποίμνιο της ενορίας σας.
          </p>
        </div>
        <Link href="/admin/parishioners/new">
          <Button className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-md border-0">
            <Plus className="w-4 h-4 mr-2"/> Νέος Ενορίτης
          </Button>
        </Link>
      </div>

      <Card className="p-4 shadow-sm border-border/60 bg-[var(--surface)]">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative w-full md:w-96 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Αναζήτηση ενορίτη..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-background h-10 border-border/60"
            />
          </div>
          <div className="flex-1 w-full overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
            <div className="flex items-center gap-1.5 min-w-max">
              <button 
                onClick={() => setSelectedLetter(null)}
                className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${!selectedLetter ? 'bg-indigo-600 text-white shadow-sm' : 'hover:bg-muted text-muted-foreground'}`}
              >
                Όλοι
              </button>
              {visibleLetters.map(L => (
                <button
                  key={L}
                  onClick={() => setSelectedLetter(L)}
                  className={`min-w-[32px] px-2 py-1.5 rounded-md text-sm font-semibold transition-colors border ${selectedLetter === L ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-background hover:bg-muted text-foreground border-border/50'}`}
                >
                  {L}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card className="shadow-sm border-border/50 border-dashed border-2 bg-muted/20">
          <CardContent className="flex flex-col items-center justify-center p-16 text-center">
            <div className="bg-muted p-4 rounded-full mb-4">
              <Users className="w-12 h-12 text-muted-foreground/50"/>
            </div>
            {search || selectedLetter ? (
              <>
                 <h3 className="text-xl font-semibold text-foreground mb-2">Δεν βρέθηκαν αποτελέσματα</h3>
                 <p className="text-muted-foreground max-w-sm">
                   Δεν βρέθηκαν αποτελέσματα για «{search || selectedLetter}»
                 </p>
              </>
            ) : (
               <>
                 <h3 className="text-xl font-semibold text-foreground mb-2">Δεν υπάρχουν καταχωρημένοι Ενορίτες</h3>
                 <p className="text-muted-foreground max-w-sm">Δημιουργήστε τον πρώτο σας ενορίτη πατώντας το κουμπί Προσθήκης πάνω δεξιά για να ξεκινήσετε να καταγράφετε το ποίμνιό σας.</p>
               </>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
           {filtered.map((p: any) => (
            <Card key={p.id} className="shadow-sm border-border/60 hover:shadow-md hover:border-primary/30 transition-all group overflow-hidden flex flex-col">
              <CardContent className="p-0 flex-1 flex flex-col">
                <div className="p-5 flex items-start gap-4 flex-1">
                  <div className="shrink-0 w-12 h-12 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-lg">
                    {(p.firstName?.[0] || '')}{(p.lastName?.[0] || '')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-foreground truncate">{p.firstName} {p.lastName}</h3>
                    <div className="mt-1 flex flex-col gap-1 text-sm text-muted-foreground">
                      {p.email ? (
                        <div className="flex items-center gap-1.5 truncate">
                          <Mail className="w-3.5 h-3.5 shrink-0"/>
                          <span className="truncate">{p.email}</span>
                        </div>
                      ) : null}
                      {p.phone ? (
                        <div className="flex items-center gap-1.5 truncate">
                          <Phone className="w-3.5 h-3.5 shrink-0"/>
                          <span className="truncate">{p.phone}</span>
                        </div>
                      ) : null}
                      {!p.email && !p.phone && (
                        <span className="italic opacity-60">Κανένα στοιχείο επικοινωνίας</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="bg-muted/30 border-t border-border px-5 py-3 flex items-center justify-between mt-auto">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    Ενεργός
                  </span>
                  <Link href={`/admin/parishioners/${p.id}`}>
                    <Button variant="ghost" size="sm" className="h-8 text-xs font-medium hover:text-indigo-700 bg-white shadow-sm border border-border/50">
                      <UserCircle2 className="w-4 h-4 mr-1.5"/> Προβολή
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
