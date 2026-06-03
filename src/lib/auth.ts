import { SignJWT, jwtVerify } from 'jose'

export interface SessionPayload {
  userId: string;
  sessionId: string;
  userEmail: string;
  templeId: string;
  isSuperAdmin: boolean;
  isHeadPriest: boolean;
  canViewFinances: boolean;
  canEditFinances: boolean;
  canManageRequests: boolean;
  canManageProtocol: boolean;
  canManageRegistry: boolean;
  canManageSchedule: boolean;
  canManageAssets: boolean;
  canViewBeneficiaries: boolean;
  canViewBeneficiaryDocs: boolean;
  canManageBeneficiaries: boolean;
  canViewInventory: boolean;
  canManageInventory: boolean;
  roleName: string;
  metropolisName?: string | null;
  // JWT standard fields
  iat?: number;
  exp?: number;
}

// In production, JWT_SECRET MUST be set in environment variables.
// A missing secret would allow anyone to forge admin sessions.
if (
  process.env.NODE_ENV === 'production' &&
  process.env.NEXT_PHASE !== 'phase-production-build' &&
  !process.env.JWT_SECRET
) {
 throw new Error('[Kanonas] FATAL: JWT_SECRET environment variable is not set. Aborting startup.');
}
const secretKey = process.env.JWT_SECRET ?? 'kanonas_dev_only_fallback_do_not_use_in_prod';
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: any) {
 return await new SignJWT(payload)
 .setProtectedHeader({ alg: 'HS256' })
 .setIssuedAt()
 .setExpirationTime('7d')
 .sign(key);
}

export async function decrypt(input: string): Promise<SessionPayload | null> {
 try {
 const { payload } = await jwtVerify(input, key, {
 algorithms: ['HS256'],
 });
 return payload as unknown as SessionPayload;
 } catch(e) {
 return null;
 }
}

import { cookies } from 'next/headers';

export async function getSession() {
 const cookieStore = await cookies();
 const token = cookieStore.get('Kanonas_auth')?.value;
 if (!token) return null;
 const payload = await decrypt(token);
 if (!payload || !payload.sessionId) return payload;

 // Real-time Session Validation (Check if revoked from DB)
 try {
 const { prisma } = await import('@/lib/prisma');
 const sessionRecord = await prisma.userSession.findUnique({
 where: { id: payload.sessionId }
 });
 if (!sessionRecord) return null; // Session revoked or invalid
 await prisma.userSession.update({ where: { id: payload.sessionId }, data: { lastActive: new Date() } });
 } catch (e) {
 // If DB isn't reachable, fail open for stateless mode
 }

 return payload;
}

export async function requireAuth() {
 const session = await getSession();
 if (!session || !session.userId) {
 throw new Error('Unauthorized');
 }
 return session;
}

export async function requireSuperAdmin() {
 const session = await requireAuth();
 if (!session.isSuperAdmin) {
 throw new Error('Forbidden: Superadmin access required');
 }
 return session;
}


