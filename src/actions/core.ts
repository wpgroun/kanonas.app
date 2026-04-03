'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export const TEMP_TEMPLE_ID = "cm0testtempleid0000000001"

export async function getCurrentTempleId() {
  const session = await getSession()
  if (session?.templeId) return session.templeId as string
  return TEMP_TEMPLE_ID
}

export async function seedDummyTemple() {
  try {
    const existing = await prisma.temple.findUnique({ where: { id: TEMP_TEMPLE_ID } })
    if (!existing) {
      await prisma.temple.create({
        data: {
          id: TEMP_TEMPLE_ID,
          name: "Ιερός Ναός Αγίου Δημητρίου (Δοκιμαστικός)",
          city: "Αθήνα"
        }
      })
    }
  } catch (e) {
    console.error("Η βάση δεν έχει συγχρονιστεί ακόμα.", e)
  }
}
