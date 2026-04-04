import { getDivorces } from '@/actions/divorces'
import { getParishioners } from '@/actions/parishioners'
import DivorcesClient from './DivorcesClient'

export default async function DivorcesPage() {
  const [divorces, parishionersRes] = await Promise.all([
    getDivorces(),
    getParishioners(1, 1000) // fetch up to 1000 active parishioners for the dropdown
  ])

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Εκκλησιαστικά Διαζύγια</h1>
          <p className="text-sm text-gray-500 mt-1">
            Μητρώο διαζευκτηρίων και λύσεων γάμου
          </p>
        </div>
      </div>

      <DivorcesClient 
        initialData={divorces} 
        parishioners={parishionersRes.data} 
      />
    </div>
  )
}
