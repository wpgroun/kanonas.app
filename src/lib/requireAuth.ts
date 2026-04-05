import { getSession } from './auth';

/**
 * Asserts the request is authenticated.
 * Throws an error (caught by Next.js as a 401-equivalent) if not.
 * Returns the session payload for downstream use.
 */
export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    throw new Error('UNAUTHORIZED: Authentication required.');
  }
  return session as {
    userId: string;
    sessionId?: string;
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
  };
}

/**
 * Like requireAuth() but also ensures the caller is a SuperAdmin.
 */
export async function requireSuperAdmin() {
  const session = await requireAuth();
  if (!session.isSuperAdmin) {
    throw new Error('FORBIDDEN: Super admin access required.');
  }
  return session;
}

/**
 * Like requireAuth() but also checks that canViewFinances is true.
 */
export async function requireFinanceAccess() {
  const session = await requireAuth();
  if (!session.canViewFinances && !session.isHeadPriest && !session.isSuperAdmin) {
    throw new Error('FORBIDDEN: Finance access required.');
  }
  return session;
}

export async function requirePermission(perms: string[]) {
  const session = await requireAuth() as any;
  if (!session.isSuperAdmin) {
    const hasPerm = perms.some(p => session[p] === true);
    if (!hasPerm) {
      throw new Error(`FORBIDDEN: Missing permissions [${perms.join(', ')}].`);
    }
  }
  return session;
}
