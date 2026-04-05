import { ReactNode } from 'react'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getSubscriptionExpiryWarning } from '@/actions/subscriptions'
import AdminShell from './AdminShell'

/**
 * Admin Layout — Server Component
 *
 * Fetches session + subscription expiry data server-side and passes them
 * to the AdminShell client component. This removes the need for client-side
 * session fetching (previously done via fetchSessionClient() useEffect).
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getSession()

  // Redirect to login if not authenticated
  if (!session) {
    redirect('/login')
  }

  // Fetch subscription expiry warning (null if no warning needed)
  const subscriptionWarning = await getSubscriptionExpiryWarning(
    (session as any).templeId as string
  )

  return (
    <AdminShell
      perms={session as Record<string, any>}
      subscriptionWarning={subscriptionWarning}
    >
      {children}
    </AdminShell>
  )
}
