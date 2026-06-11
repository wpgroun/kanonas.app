export const dynamic = 'force-dynamic';

import { ReactNode } from 'react'
import { getSession, type SessionPayload } from '@/lib/auth'
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

 const s = session as SessionPayload;
 const templeId = s.templeId;

 // Fetch subscription expiry warning (null if no warning needed)
 const subscriptionWarning = s.isSuperAdmin ? null : await getSubscriptionExpiryWarning(templeId)

 // Fetch Temple Settings to see Disabled Modules
 const { prisma } = await import('@/lib/prisma');
 const contextTemple = await prisma.temple.findUnique({
 where: { id: templeId },
 select: { settings: true }
 });

  let disabledModules: string[] = [];
  let onboardingCompleted = true;
  try {
    const parsedSettings = JSON.parse(contextTemple?.settings || '{}');
    disabledModules = parsedSettings.disabledModules || [];
    onboardingCompleted = parsedSettings.onboardingCompleted !== false
      ? !!parsedSettings.onboardingCompleted
      : false;
  } catch(e) {}

  return (
    <AdminShell
      perms={session as Record<string, any>}
      subscriptionWarning={subscriptionWarning}
      disabledModules={disabledModules}
      onboardingCompleted={onboardingCompleted}
    >
      {children}
    </AdminShell>
  )
}
