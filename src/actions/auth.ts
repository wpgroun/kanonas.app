'use server'

import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { encrypt } from '@/lib/auth'
import { TEMP_TEMPLE_ID } from '@/lib/constants'

export async function loginAction(email: string, passwordPlain: string) {
  try {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !user.passwordHash) {
      return { success: false, error: 'Λάθος στοιχεία (χρήστης δεν βρέθηκε)' }
    }

    const isValid = await bcrypt.compare(passwordPlain, user.passwordHash)
    if (!isValid) return { success: false, error: 'Λάθος κωδικός πρόσβασης' }

    // Log the event silently
    const { logAction } = await import('@/lib/audit')

    // Find if user is a MetropolisUser
    const metropolisUser = await prisma.metropolisUser.findFirst({
      where: { userId: user.id },
      include: { metropolis: true }
    })

    // Find their primary temple
    const userTemple = await prisma.userTemple.findFirst({
      where: { userId: user.id, status: 'active' },
      include: { role: true, temple: true }
    })

    if (!userTemple && !user.isSuperAdmin && !metropolisUser) {
      return { success: false, error: 'Ο λογαριασμός σας δεν έχει ανατεθεί σε κάποιον ναό ή Μητρόπολη. Επικοινωνήστε με τη διαχείριση.' }
    }

    let resolvedTempleId = '';
    if (userTemple) resolvedTempleId = userTemple.templeId;
    else if (metropolisUser) {
      // If they are a metropolis user but have no specific temple assigned,
      // they need a context. Fetch the first temple of that metropolis, or leave blank if none.
      const firstTemple = await prisma.temple.findFirst({ where: { metropolisId: metropolisUser.metropolisId } });
      resolvedTempleId = firstTemple?.id || '';
    }

    const isSuperOrHead = userTemple?.isHeadPriest || user.isSuperAdmin || !!metropolisUser;

    const sessionPayload = {
      userId: user.id,
      templeId: resolvedTempleId,
      isSuperAdmin: user.isSuperAdmin,
      isHeadPriest: userTemple?.isHeadPriest || false,
      canViewFinances: userTemple?.role?.canViewFinances || isSuperOrHead,
      canEditFinances: userTemple?.role?.canEditFinances || isSuperOrHead,
      canManageRequests: userTemple?.role?.canManageRequests || isSuperOrHead,
      canManageProtocol: userTemple?.role?.canManageProtocol || isSuperOrHead,
      canManageRegistry: userTemple?.role?.canManageRegistry || isSuperOrHead,
      canManageSchedule: userTemple?.role?.canManageSchedule || isSuperOrHead,
      canManageAssets: userTemple?.role?.canManageAssets || isSuperOrHead,
      canViewBeneficiaries: userTemple?.role?.canViewBeneficiaries || isSuperOrHead,
      canViewBeneficiaryDocs: userTemple?.role?.canViewBeneficiaryDocs || isSuperOrHead,
      canManageBeneficiaries: userTemple?.role?.canManageBeneficiaries || isSuperOrHead,
      canViewInventory: userTemple?.role?.canViewInventory || isSuperOrHead,
      canManageInventory: userTemple?.role?.canManageInventory || isSuperOrHead,
      roleName: user.isSuperAdmin ? 'Platform Admin' : 
                metropolisUser ? `Μητρόπολη: ${metropolisUser.metropolis.name}` :
                (userTemple?.role?.name || (userTemple?.isHeadPriest ? 'Προϊστάμενος' : 'Γραμματεία'))
    }

    const token = await encrypt(sessionPayload)
    const cookieStore = await cookies();
    cookieStore.set('Kanonas_auth', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7
    })
    
    // Attempt audit log, ignoring errors if templeId is empty
    if (resolvedTempleId) {
       await prisma.auditLog.create({
         data: { templeId: resolvedTempleId, userId: user.id, userEmail: user.email, action: 'LOGIN' }
       }).catch(() => {})
    }

    return { success: true }
  } catch (e: any) {
    return { success: false, error: e?.message || 'Σφάλμα σύνδεσης' }
  }
}

export async function logoutAction() {
  ;(await cookies()).delete('Kanonas_auth')
  return { success: true }
}

export async function forgotPasswordAction(email: string) {
  try {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return { success: true, message: 'Αν το email υπάρχει, στάλθηκε σύνδεσμος.' }
    }

    const { randomBytes } = await import('crypto')
    const token = randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 1000 * 60 * 60) // 1 Hour

    // @ts-ignore
    await prisma.passwordResetToken.create({
      data: { email: user.email, token, expires }
    })

    console.log(`[DEV] Password reset link for ${email}: ${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/reset-password?token=${token}`)

    return { success: true, message: 'Σας έχει σταλεί email με οδηγίες ανάκτησης.' }
  } catch (e: any) {
    return { success: false, error: 'Σφάλμα κατά την αποστολή email ανάκτησης.' }
  }
}

export async function resetPasswordAction(token: string, newPasswordPlain: string) {
  try {
    // @ts-ignore
    const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } })

    if (!resetToken || resetToken.expires < new Date()) {
      return { success: false, error: 'Ο σύνδεσμος έχει λήξει ή είναι άκυρος.' }
    }

    const passwordHash = await bcrypt.hash(newPasswordPlain, 10)

    await prisma.user.update({
      where: { email: resetToken.email },
      data: { passwordHash }
    })

    // @ts-ignore
    await prisma.passwordResetToken.delete({ where: { id: resetToken.id } })

    return { success: true }
  } catch (e: any) {
    return { success: false, error: 'Σφάλμα κατά την επαναφορά κωδικού.' }
  }
}
