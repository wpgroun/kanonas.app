import { getMySubscription, getSubscriptionPlans, getStripeInvoices } from '@/actions/subscriptions'
import SubscriptionClient from './SubscriptionClient'
import { getCurrentTempleId } from '@/actions/core'

export const metadata = {
  title: 'Διαχείριση Συνδρομής — Κανόνας',
}

export default async function SubscriptionPage({ searchParams }: { searchParams: { success?: string, cancelled?: string } }) {
  const [currentSub, allPlans, invoices, templeId] = await Promise.all([
    getMySubscription(),
    getSubscriptionPlans(),
    getStripeInvoices(),
    getCurrentTempleId()
  ])

  const bankDetails = {
    iban: process.env.BANK_IBAN || 'GR00 0000 0000 0000 0000 0000 000',
    beneficiary: process.env.BANK_BENEFICIARY || 'Ieros Naos (Demo)',
    name: process.env.BANK_NAME || 'Εθνική Τράπεζα',
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <SubscriptionClient 
        currentSub={currentSub} 
        allPlans={allPlans}
        invoices={invoices}
        searchParams={searchParams}
        templeId={templeId}
        bankDetails={bankDetails}
      />
    </div>
  )
}
