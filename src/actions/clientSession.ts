'use server'

import { getSession } from '@/lib/auth'

export async function fetchSessionClient() {
 const session = await getSession();
 return session;
}
