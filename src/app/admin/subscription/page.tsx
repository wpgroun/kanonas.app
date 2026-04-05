import { getMySubscription, getSubscriptionPlans, getStripeInvoices } from '@/actions/subscriptions'
import SubscriptionClient from './SubscriptionClient'

export const metadata = {
  title: 'Διαχείριση Συνδρομής — Κανόνας',
}

export default async function SubscriptionPage({ searchParams }: { searchParams: { success?: string, cancelled?: string } }) {
  const [currentSub, allPlans, invoices] = await Promise.all([
    getMySubscription(),
    getSubscriptionPlans(),
    getStripeInvoices()
  ])

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <SubscriptionClient 
        currentSub={currentSub} 
        allPlans={allPlans}
        invoices={invoices}
        searchParams={searchParams}
      />
    </div>
  )
}
