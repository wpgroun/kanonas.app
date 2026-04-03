'use server'

import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { encrypt } from '@/lib/auth'
import { TEMP_TEMPLE_ID } from './core'

export async function loginAction(email: string, passwordPlain: string) {
  try {
    // @ts-ignore
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !user.passwordHash) {
      return { success: false, error: 'Λάθος στοιχεία (χρήστης δεν βρέθηκε)' }
    }

    const isValid = await bcrypt.compare(passwordPlain, user.passwordHash)
    if (!isValid) return { success: false, error: 'Λάθος κωδικός πρόσβασης' }

    // @ts-ignore
    const userTemple: any = await prisma.userTemple.findFirst({
      where: { userId: user.id },
      include: { role: true }
    })

    const sessionPayload = {
      userId: user.id,
      templeId: userTemple?.templeId || TEMP_TEMPLE_ID,
      isSuperAdmin: user.isSuperAdmin,
      isHeadPriest: userTemple?.isHeadPriest || false,
      canViewFinances: userTemple?.role?.canViewFinances || userTemple?.isHeadPriest || false,
      canEditFinances: userTemple?.role?.canEditFinances || userTemple?.isHeadPriest || false,
      roleName: userTemple?.role?.name || (userTemple?.isHeadPriest ? 'Προϊστάμενος' : 'User')
    }

    const token = await encrypt(sessionPayload)

    ;(await cookies()).set('Kanonas_auth', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7
    })

    return { success: true }
  } catch (e: any) {
    return { success: false, error: e?.message || 'Σφάλμα σύνδεσης' }
  }
}

export async function logoutAction() {
  ;(await cookies()).delete('Kanonas_auth')
  return { success: true }
}

