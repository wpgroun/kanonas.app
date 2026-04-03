import { getDonations, getParishioners, getDonationStats } from '../../actions'
import AddDonationForm from './AddDonationForm'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Banknote, Wallet, PieChart, Receipt, ArrowUpRight, BarChart3 } from 'lucide-react';
import FinanceBIClient from './FinanceBIClient'

export default async function FinancesPage() {
  const donations = await getDonations();
  const parishioners = await getParishioners();
  const biStats = await getDonationStats();


  // Aggregate Stats
  const totalIncome = donations.reduce((sum: number, d: any) => sum + d.amount, 0);
  
  const byPurpose = donations.reduce((acc: any, d: any) => {
    acc[d.purpose] = (acc[d.purpose] || 0) + d.amount;
    return acc;
  }, {} as Record<string, number>);

  const anonymousTotal = donations.filter((d: any) => !d.parishionerId).reduce((s: number, d: any) => s + d.amount, 0);
  const namedTotal = totalIncome - anonymousTotal;

  return (
    <div className="container-fluid mt-6 space-y-6">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Οικονομικά & Ταμείο
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Παρακολουθήστε τα έσοδα του Ιερού Ναού. Δισκοπαγκάρια, μυστήρια, και φιλανθρωπικές δωρεές.
          </p>
        </div>
        <AddDonationForm parishioners={parishioners} />
      </div>

      {/* DASHBOARD STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="shadow-sm border-border/50 bg-gradient-to-br from-blue-600 to-blue-800 text-white border-0">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-blue-100 font-medium mb-1">Συνολικά Έσοδα (All Time)</p>
                <h3 className="text-3xl font-bold">{totalIncome.toFixed(2)} €</h3>
              </div>
              <div className="p-3 bg-white/20 rounded-full">
                <Banknote className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4 text-sm text-blue-100 flex items-center">
              <ArrowUpRight className="w-4 h-4 mr-1" /> +100% από την αρχή του έτους
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-border/50 lg:col-span-2">
          <CardContent className="p-6 flex flex-col justify-center h-full">
            <p className="text-muted-foreground font-medium mb-4 text-sm">Κατανομή Εσόδων: Επώνυμα vs Ανώνυμα</p>
            <div className="grid grid-cols-2 gap-6 relative">
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border -translate-x-1/2"></div>
              <div>
                 <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1.5"><Wallet className="w-4 h-4" /> Ανώνυμα (Παγκάρι)</div>
                 <div className="text-2xl font-bold text-foreground">{anonymousTotal.toFixed(2)} €</div>
              </div>
              <div className="pl-6">
                 <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1.5"><Receipt className="w-4 h-4" /> Επώνυμες Δωρεές</div>
                 <div className="text-2xl font-bold text-primary">{namedTotal.toFixed(2)} €</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        
        {/* ΑΝΑΛΥΣΗ ΚΑΤΗΓΟΡΙΩΝ */}
        <div className="col-span-1">
          <Card className="shadow-sm border-border/50">
            <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
              <CardTitle className="text-base flex items-center gap-2"><PieChart className="w-4 h-4" /> Ανάλυση ανά Αιτιολογία</CardTitle>
            </CardHeader>
            <CardContent className="px-0 py-2">
              <div className="divide-y divide-border/50">
                {Object.entries(byPurpose).sort((a: any, b: any) => b[1] - a[1]).map(([purpose, amount]: any) => (
                  <div key={purpose} className="flex justify-between items-center py-3 px-5 hover:bg-muted/30 transition-colors">
                     <span className="text-sm text-muted-foreground">{purpose}</span>
                     <strong className="text-sm font-semibold">{amount.toFixed(2)} €</strong>
                  </div>
                ))}
                {Object.keys(byPurpose).length === 0 && (
                  <div className="py-6 text-center text-muted-foreground text-sm">Καμία κίνηση.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RECENT TRANSACTIONS */}
        <div className="col-span-1 lg:col-span-2 xl:col-span-3">
          <Card className="shadow-sm border-border/50">
            <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
              <CardTitle className="text-base flex items-center gap-2"><Receipt className="w-4 h-4" /> Πρόσφατες Κινήσεις</CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Ημερομηνία</th>
                    <th className="px-6 py-3 font-semibold">Αιτιολογία</th>
                    <th className="px-6 py-3 font-semibold">Ενορίτης / Πηγή</th>
                    <th className="px-6 py-3 font-semibold">Διπλότυπο</th>
                    <th className="px-6 py-3 font-semibold text-right">Ποσό</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {donations.length === 0 && (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Δεν υπάρχουν οικονομικές κινήσεις καταγεγραμμένες.</td></tr>
                  )}
                  {donations.map((d: any) => (
                    <tr key={d.id} className="bg-card hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                        {new Date(d.date).toLocaleDateString('el-GR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2 py-1 rounded bg-secondary text-secondary-foreground text-xs font-medium">
                          {d.purpose}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {d.parishioner ? (
                          <Link href={`/admin/parishioners/${d.parishionerId}`} className="text-primary hover:underline">
                            {d.parishioner.lastName} {d.parishioner.firstName}
                          </Link>
                        ) : (
                          <span className="text-foreground">{d.donorName || 'Ανώνυμος Δημότης'}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                        {d.receiptNumber || '-'}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-foreground whitespace-nowrap">
                        {d.amount.toFixed(2)} €
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

      </div>

      {/* Separator */}
      <div className="border-t border-border/50 pt-8">
        <h2 className="text-xl font-bold tracking-tight flex items-center gap-2 mb-6 text-foreground">
          <BarChart3 className="w-5 h-5 text-primary" />
          Απολογισμός &amp; Στατιστικά
        </h2>
        <FinanceBIClient
          currentYear={biStats.currentYear}
          prevYear={biStats.prevYear}
          byCategory={biStats.byCategory}
          totalCurrentYear={biStats.totalCurrentYear}
          totalPrevYear={biStats.totalPrevYear}
          year={biStats.year}
        />
      </div>

    </div>
  )
}
