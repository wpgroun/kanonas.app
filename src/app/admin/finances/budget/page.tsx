import { getBudgets, getFinancialCategories } from '@/actions/finances'
import BudgetClient from './BudgetClient'

export default async function BudgetPage({ searchParams }: { searchParams: Promise<{ year?: string }> }) {
 const params = await searchParams;
 const currentYear = params?.year ? parseInt(params.year) : new Date().getFullYear();
 
 const budgets = await getBudgets(currentYear);
 const categories = await getFinancialCategories();
 
 return (
 <div className="container-fluid mt-6 space-y-6 animate-in fade-in duration-500">
 <div>
 <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
 Προϋπολογισμός {currentYear}
 </h1>
 <p className="text-muted-foreground mt-1 text-sm">
 Καθορίστε τους οικονομικούς στόχους (Εκτίμηση) για κάθε Κατηγορία. Οποιαδήποτε μεταγενέστερη αλλαγή θεωρείται 'Αναδιαμόρφωση' και καταγράφεται.
 </p>
 </div>

 <BudgetClient year={currentYear} initialBudgets={budgets} categories={categories} />
 </div>
)
}
