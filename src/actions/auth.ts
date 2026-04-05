'use server'

import { prisma } from '@/lib/prisma'
import { cookies, headers } from 'next/headers'
import bcrypt from 'bcryptjs'
import { encrypt } from '@/lib/auth'
import { TEMP_TEMPLE_ID } from '@/lib/constants'

// [SECURITY LOW-5] Simple in-memory rate limiter — max 10 failed login attempts per IP per 15 minutes.
// For multi-instance deployments, replace with Redis/Upstash-based solution.
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(ip: string): { allowed: boolean; retryAfterSecs?: number } {
  const now = Date.now();
  const entry = loginAttempts.get(ip);
  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true };
  }
  if (entry.count >= RATE_LIMIT_MAX) {
    return { allowed: false, retryAfterSecs: Math.ceil((entry.resetAt - now) / 1000) };
  }
  return { allowed: true };
}

function recordFailedAttempt(ip: string) {
  const now = Date.now();
  const entry = loginAttempts.get(ip);
  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
  } else {
    entry.count += 1;
  }
}

function clearFailedAttempts(ip: string) {
  loginAttempts.delete(ip);
}

export async function loginAction(email: string, passwordPlain: string) {
  try {
    // [SECURITY LOW-5] Rate limiting — get IP from headers
    const headerStore = await headers();
    const ip = headerStore.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rateCheck = checkRateLimit(ip);
    if (!rateCheck.allowed) {
      return {
        success: false,
        error: `Πολλές αποτυχημένες προσπάθειες. Δοκιμάστε ξανά σε ${Math.ceil((rateCheck.retryAfterSecs || 900) / 60)} λεπτά.`
      };
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !user.passwordHash) {
      recordFailedAttempt(ip);
      return { success: false, error: 'Λάθος email ή κωδικός πρόσβασης.' }
    }

    const isValid = await bcrypt.compare(passwordPlain, user.passwordHash)
    if (!isValid) {
      recordFailedAttempt(ip);
      return { success: false, error: 'Λάθος email ή κωδικός πρόσβασης.' }
    }

    // Successful login — clear failed attempts
    clearFailedAttempts(ip);

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
      userEmail: user.email,
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
    // [SECURITY LOW-4] Never expose internal error details (Prisma errors, stack traces) to the client
    console.error('[loginAction] Error:', e);
    return { success: false, error: 'Σφάλμα σύνδεσης. Παρακαλώ δοκιμάστε ξανά.' }
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

    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      const nodemailer = await import('nodemailer');
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
      await transporter.sendMail({
        from: `"Kanonas System" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: user.email,
        subject: 'Επαναφορά Κωδικού Πρόσβασης',
        html: `<p>Γεια σας ${user.firstName || ''},</p><p>Για να επαναφέρετε τον κωδικό σας, πατήστε τον παρακάτω σύνδεσμο:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>Ο σύνδεσμος λήγει σε 1 ώρα.</p>`
      });
    } else if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEV] Password reset link for ${email}: ${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/reset-password?token=${token}`)
    } else {
      console.warn(`[WARN] Password reset requested for ${email} but SMTP is not configured.`);
    }

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
    // [SECURITY LOW-4] Log internally, never expose Prisma error details
    console.error('[resetPasswordAction] Error:', e);
    return { success: false, error: 'Σφάλμα κατά την επαναφορά κωδικού.' }
  }
}
