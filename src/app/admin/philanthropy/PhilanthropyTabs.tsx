'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import SissitioModule from './SissitioModule'
import PhilanthropyClient from './PhilanthropyClient'
import { Card, CardContent } from '@/components/ui/card'
import { Users, Utensils, AlertTriangle, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function PhilanthropyTabs({ sissitioData, philanthropyData }: any) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentTab = searchParams.get('tab') || 'overview'

  const setTab = (tab: string) => {
    // If board, don't change tab state, just route
    if (tab === 'board') {
      router.push('/admin/philanthropy/board')
      return;
    }
    router.push(`/admin/philanthropy?tab=${tab}`)
  }

  const { dashboard, recipients, inventory, recipes } = sissitioData

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 mb-6 border-b border-border pb-4">
        {[
          { id: 'overview', label: 'Επισκόπηση' },
          { id: 'beneficiaries', label: 'Δικαιούχοι' },
          { id: 'sissitio', label: 'Συσσίτιο' },
          { id: 'board', label: 'Συμβούλιο ΕΦΤ' }
        ].map(tab => (
           <button
             key={tab.id}
             onClick={() => setTab(tab.id)}
             className={`px-4 py-2 rounded-t-lg font-bold transition-colors ${
               currentTab === tab.id
               ? 'bg-primary text-primary-foreground shadow-sm'
               : 'bg-transparent hover:bg-muted text-muted-foreground'
             }`}
           >
             {tab.label}
           </button>
        ))}
      </div>

      <div className="animate-in fade-in duration-300">
        {currentTab === 'overview' && (
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <Card className="shadow-sm border-border/50">
               <CardContent className="p-6">
                 <div className="flex justify-between items-start">
                   <div>
                     <p className="text-sm text-muted-foreground font-medium mb-1">Δικαιούχοι (Ενεργοί)</p>
                     <h3 className="text-3xl font-bold text-foreground">{dashboard?.totalActive || 0}</h3>
                   </div>
                   <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                     <Users className="w-5 h-5"/>
                   </div>
                 </div>
               </CardContent>
             </Card>

             <Card className="shadow-sm border-border/50">
               <CardContent className="p-6">
                 <div className="flex justify-between items-start">
                   <div>
                     <p className="text-sm text-muted-foreground font-medium mb-1">Σημερινό Συσσίτιο (Παρουσίες)</p>
                     <h3 className="text-3xl font-bold text-emerald-600">{dashboard?.todayPresent || 0}</h3>
                   </div>
                   <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full">
                     <Utensils className="w-5 h-5"/>
                   </div>
                 </div>
               </CardContent>
             </Card>

             <Card className={`shadow-sm border-border/50 ${dashboard?.stockAlerts > 0 ? 'bg-red-50/50 border-red-200' : ''}`}>
               <CardContent className="p-6">
                 <div className="flex justify-between items-start">
                   <div>
                     <p className={`text-sm font-medium mb-1 ${dashboard?.stockAlerts > 0 ? 'text-red-700' : 'text-muted-foreground'}`}>Ελλείψεις Αποθήκης</p>
                     <h3 className={`text-3xl font-bold ${dashboard?.stockAlerts > 0 ? 'text-red-600' : 'text-foreground'}`}>{dashboard?.stockAlerts || 0}</h3>
                   </div>
                   <div className={`p-3 rounded-full ${dashboard?.stockAlerts > 0 ? 'bg-red-200 text-red-700' : 'bg-amber-100 text-amber-600'}`}>
                     <AlertTriangle className="w-5 h-5"/>
                   </div>
                 </div>
               </CardContent>
             </Card>
           </div>
        )}

        {currentTab === 'beneficiaries' && (
           <PhilanthropyClient 
             stats={philanthropyData.stats} 
             beneficiaries={philanthropyData.beneficiaries} 
             inventory={philanthropyData.inventory} 
           />
        )}

        {currentTab === 'sissitio' && (
           <SissitioModule 
             dashboard={dashboard} 
             recipients={recipients} 
             inventory={inventory} 
             recipes={recipes} 
           />
        )}
      </div>
    </div>
  )
}
