import { getTokens } from '@/actions/sacraments'
import Link from 'next/link'
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, FileText } from 'lucide-react';
import NewRequestButtons from './NewRequestButtons'

export default async function RequestsPage() {
  const tokens = await getTokens();

  return (
    <div className="container-fluid mt-6 space-y-6">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Μυστήρια & Αιτήματα
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Διαχείριση μυστηρίων, ερωτηματολόγια ζευγαριών και αυτόματη έκδοση πιστοποιητικών.
          </p>
        </div>
      </div>

      <NewRequestButtons />

      <Card className="shadow-sm border-border/50">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-semibold">Κωδικός Αίτησης</th>
                <th className="px-6 py-4 font-semibold">Τύπος</th>
                <th className="px-6 py-4 font-semibold">Ημ. Τελετής</th>
                <th className="px-6 py-4 font-semibold">Ιερέας</th>
                <th className="px-6 py-4 font-semibold">Πρωτ./Βιβλ.</th>
                <th className="px-6 py-4 font-semibold">Κατάσταση</th>
                <th className="px-6 py-4 font-semibold text-right">Ενέργειες</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {tokens.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                    Δεν βρέθηκαν αιτήσεις καταχωρημένες στο σύστημα.
                  </td>
                </tr>
              )}
              {tokens.map((token: any) => (
                <tr key={token.id} className="bg-card hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-primary font-medium">
                    #{token.tokenStr?.slice(-8).toUpperCase()}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                      {token.serviceType === 'GAMOS' ? '💍 Γάμος' : '🕊️ Βάπτιση'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-foreground font-medium">
                    {token.ceremonyDate ? new Date(token.ceremonyDate).toLocaleDateString('el-GR') : 'Εκκρεμεί'}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {token.assignedPriest || '-'}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground text-xs">
                    {token.protocolNumber ? `${token.protocolNumber} / ${token.bookNumber || '-'}` : '-'}
                  </td>
                  <td className="px-6 py-4">
                    {token.status === 'docs_generated' || token.protocolNumber ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                        ✅ Εκδόθηκε
                      </span>
                    ) : token.status === 'completed' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        ☑️ Ολοκληρώθηκε
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                        <Loader2 className="w-3 h-3 animate-spin" /> Αναμονή
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/admin/requests/${token.id}`}>
                      <Button variant="outline" size="sm" className="h-8">
                        Άνοιγμα
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  )
}

