import { getParishioners } from '../../actions'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Plus, Mail, Phone, UserCircle2 } from 'lucide-react';

export default async function ParishionersList() {
  const rs = await getParishioners();
  
  return (
    <div className="container-fluid mt-6 space-y-6">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Μητρώο Ενοριτών
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Διαχειριστείτε τους πιστούς, τις οικογένειες και το ποίμνιο της ενορίας σας.
          </p>
        </div>
        <Link href="/admin/parishioners/new">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
            <Plus className="w-4 h-4 mr-2" /> Νέος Ενορίτης
          </Button>
        </Link>
      </div>

      {rs.length === 0 ? (
        <Card className="shadow-sm border-border/50 border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center p-16 text-center">
            <div className="bg-muted/50 p-4 rounded-full mb-4">
              <Users className="w-12 h-12 text-muted-foreground/50" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Δεν υπάρχουν καταχωρημένοι Ενορίτες</h3>
            <p className="text-muted-foreground max-w-sm">Δημιουργήστε τον πρώτο σας ενορίτη πατώντας το κουμπί Προσθήκης πάνω δεξιά για να ξεκινήσετε να καταγράφετε το ποίμνιό σας.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {rs.map((p: any) => (
            <Card key={p.id} className="shadow-sm border-border/60 hover:shadow-md hover:border-primary/30 transition-all group overflow-hidden">
              <CardContent className="p-0">
                <div className="p-5 flex items-start gap-4">
                  <div className="shrink-0 w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-lg">
                    {p.firstName[0]}{p.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-foreground truncate">{p.firstName} {p.lastName}</h3>
                    <div className="mt-1 flex flex-col gap-1 text-sm text-muted-foreground">
                      {p.email ? (
                        <div className="flex items-center gap-1.5 truncate">
                          <Mail className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{p.email}</span>
                        </div>
                      ) : null}
                      {p.phone ? (
                        <div className="flex items-center gap-1.5 truncate">
                          <Phone className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{p.phone}</span>
                        </div>
                      ) : null}
                      {!p.email && !p.phone && (
                        <span className="italic opacity-60">Κανένα στοιχείο επικοινωνίας</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="bg-muted/30 border-t border-border px-5 py-3 flex items-center justify-between">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    Ενεργός
                  </span>
                  <Link href={`/admin/parishioners/${p.id}`}>
                    <Button variant="ghost" size="sm" className="h-8 text-xs font-medium hover:text-primary">
                      <UserCircle2 className="w-4 h-4 mr-1.5" /> Προβολή
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

