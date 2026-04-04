import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

/**
 * Register a new Temple and an initial Admin User for it.
 * This is intended for the public "Sign Up / Onboarding" flow.
 */
export async function registerTempleAndAdmin(data: {
  templeName: string
  metropolisId: string
  adminEmail: string
  adminPasswordPlain: string
  adminFirstName: string
  adminLastName: string
}) {
  try {
    // 1. Ensure metropolis exists
    const metropolis = await prisma.metropolis.findUnique({
      where: { id: data.metropolisId }
    })
    if (!metropolis) return { success: false, error: 'Η Μητρόπολη που επιλέξατε δεν βρέθηκε.' }

    // 2. Check if user email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.adminEmail }
    })
    if (existingUser) return { success: false, error: 'Το email αυτό χρησιμοποιείται ήδη.' }

    const passwordHash = await bcrypt.hash(data.adminPasswordPlain, 10)

    // 3. Create Temple, User, and link them using a transaction
    await prisma.$transaction(async (tx) => {
      // Create new temple
      const newTemple = await tx.temple.create({
        data: {
          name: data.templeName,
          metropolisId: metropolis.id,
          // create a default basic setting set
          settings: JSON.stringify({
             metropolisName: metropolis.name,
             priests: [{ name: data.adminLastName + ' ' + data.adminFirstName }]
          })
        }
      })

      // Create the user
      const newUser = await tx.user.create({
        data: {
          email: data.adminEmail,
          passwordHash,
          firstName: data.adminFirstName,
          lastName: data.adminLastName,
        }
      })

      // Link user to temple as head priest / admin
      await tx.userTemple.create({
        data: {
          userId: newUser.id,
          templeId: newTemple.id,
          isHeadPriest: true,
          status: 'active'
        }
      })

      // Assign a basic free plan to the new temple
      // First try to find basic plan
      let basicPlan = await tx.subscriptionPlan.findFirst({ where: { slug: 'basic' } })
      if (!basicPlan) {
        // Fallback: create a basic plan if it doesn't exist yet
        basicPlan = await tx.subscriptionPlan.create({
           data: { name: 'Ενορία Basic', slug: 'basic', priceMonthly: 29, priceYearly: 290, features: '[]' }
        })
      }

      await tx.subscription.create({
        data: {
          templeId: newTemple.id,
          planId: basicPlan.id,
          status: 'active',
          billingCycle: 'monthly',
        }
      })
    })

    return { success: true }
  } catch (e: any) {
    console.error('[Register]', e)
    return { success: false, error: e.message || 'Αποτυχία εγγραφής. Παρακαλώ δοκιμάστε ξανά.' }
  }
}
