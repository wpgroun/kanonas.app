import { getElectoralRoll } from '@/actions/registry'
import ElectionsClient from './ElectionsClient'

export default async function ElectionsPage({ searchParams }: { searchParams: Promise<{ year?: string }> }) {
 const params = await searchParams
 const currentYear = new Date().getFullYear()
 const year = params.year ? parseInt(params.year, 10) : currentYear

 const electoralRoll = await getElectoralRoll(year)

 return (
 <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl">
 <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
 <div>
 <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Εκλογικοί Κατάλογοι</h1>
 <p className="text-sm text-gray-500 mt-1">
 Ενορίτες που είναι ταμειακώς εντάξει για το έτος {year}
 </p>
 </div>
 </div>

 <ElectionsClient initialData={electoralRoll} selectedYear={year} />
 </div>
)
}
