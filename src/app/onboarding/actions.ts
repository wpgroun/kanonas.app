'use server'

import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { encrypt } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function setupTemple(data: {
  templeName: string
  metropolisName: string
  city: string
  phone?: string
  email?: string
  adminFirstName: string
  adminLastName: string
  adminEmail: string
  adminPassword: string
  protocolStart?: number
}) {
  try {
    // Check if admin email already exists
    const existingUser = await prisma.user.findUnique({ where: { email: data.adminEmail } })
    if (existingUser) {
      return { success: false, error: 'Αυτό το email χρησιμοποιείται ήδη.' }
    }

    const passwordHash = await bcrypt.hash(data.adminPassword, 12)

    // Create all in one transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create or find Metropolis
      let metropolis = await tx.metropolis.findFirst({ where: { name: data.metropolisName } })
      if (!metropolis) {
        metropolis = await tx.metropolis.create({ data: { name: data.metropolisName } })
      }

      // 2. Create Temple
      const temple = await tx.temple.create({
        data: {
          metropolisId: metropolis.id,
          name: data.templeName,
          city: data.city || '',
          email: data.email || null,
          settings: JSON.stringify({
            phone: data.phone || '',
            protocolStart: data.protocolStart || 1,
            currentProtocolNumber: data.protocolStart || 1,
          })
        }
      })

      // 3. Create Admin User
      const user = await tx.user.create({
        data: {
          email: data.adminEmail,
          passwordHash,
          firstName: data.adminFirstName,
          lastName: data.adminLastName,
          isSuperAdmin: false,
        }
      })

      // 4. Create a HeadPriest role for this temple
      const headPriestRole = await tx.role.create({
        data: {
          templeId: temple.id,
          name: 'Προϊστάμενος',
          canViewFinances: true,
          canEditFinances: true,
          canManageRequests: true,
          canManageRegistry: true,
          canManageSchedule: true,
          canManageAssets: true,
        }
      })

      // 5. Link User to Temple as Head Priest
      await tx.userTemple.create({
        data: {
          userId: user.id,
          templeId: temple.id,
          roleId: headPriestRole.id,
          isHeadPriest: true,
          status: 'active'
        }
      })

      return { user, temple, metropolis }
    })

    // 6. Auto-login the new user
    const sessionPayload = {
      userId: result.user.id,
      templeId: result.temple.id,
      isSuperAdmin: false,
      isHeadPriest: true,
      canViewFinances: true,
      canEditFinances: true,
      roleName: 'Προϊστάμενος'
    }
    const token = await encrypt(sessionPayload)
    ;(await cookies()).set('Kanonas_auth', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7
    })

    return { success: true, templeId: result.temple.id }
  } catch (e: any) {
    console.error('Onboarding error:', e)
    return { success: false, error: e.message || 'Σφάλμα κατά τη ρύθμιση.' }
  }
}

export async function checkTempleSlug(name: string) {
  const count = await prisma.temple.count({ where: { name } })
  return count === 0
}
