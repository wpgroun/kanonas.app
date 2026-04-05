import { getMinistries, getVolunteers, getRecentShifts } from '@/actions/ministries'
import MinistriesClient from './MinistriesClient'

export const metadata = {
 title: 'Διακονίες & Εθελοντές - Kanonas'
}

export default async function MinistriesPage() {
 const ministries = await getMinistries()
 const volunteers = await getVolunteers()
 const shifts = await getRecentShifts()

 return (
 <div className="container-fluid mt-6 animate-in fade-in duration-500">
 <div className="mb-6">
 <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
 Διακονίες & Εθελοντές
 </h1>
 <p className="text-muted-foreground mt-1 text-sm">
 Οργάνωση ομάδων εργασίας και προγραμματισμός βαρδιών του Ναού.
 </p>
 </div>
 
 <MinistriesClient 
 initialMinistries={ministries} 
 initialVolunteers={volunteers} 
 initialShifts={shifts} 
 />
 </div>
)
}
