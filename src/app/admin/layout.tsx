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

 const templeId = (session as any).templeId as string;

 // Fetch subscription expiry warning (null if no warning needed)
 const subscriptionWarning = await getSubscriptionExpiryWarning(templeId)

 // Fetch Temple Settings to see Disabled Modules
 const { prisma } = await import('@/lib/prisma');
 const contextTemple = await prisma.temple.findUnique({
 where: { id: templeId },
 select: { settings: true }
 });

 let disabledModules: string[] = [];
 try {
 const parsedSettings = JSON.parse(contextTemple?.settings ||"{}");
 disabledModules = parsedSettings.disabledModules || [];
 } catch(e) {}

 return (
 <AdminShell
 perms={session as Record<string, any>}
 subscriptionWarning={subscriptionWarning}
 disabledModules={disabledModules}
 >
 {children}
 </AdminShell>
)
}
