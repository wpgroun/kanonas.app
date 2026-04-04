import { getFinancialCategories } from '@/actions/finances'
import CategoriesClient from './CategoriesClient'

export default async function FinancialCategoriesPage() {
  const categories = await getFinancialCategories();
  
  return (
    <div className="container-fluid mt-6 space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          Λογιστικό Σχέδιο (Κατηγορίες)
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Δημιουργήστε τις κατηγορίες (Funds) στα οποία θα κατανέμονται τα Έσοδα και τα Έξοδα του Ναού.
        </p>
      </div>

      <CategoriesClient initialCategories={categories} />
    </div>
  )
}
