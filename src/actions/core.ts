'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

/**
 * Returns the templeId for the currently authenticated user.
 * Falls back to null if there is no session (should not happen in guarded actions).
 */
export async function getCurrentTempleId(): Promise<string> {
 const session = await getSession()
 if (session?.templeId) return session.templeId as string
 throw new Error('UNAUTHORIZED: No active session / templeId not found.')
}

/**
 * Seed a real temple during development/demo (kept for onboarding use only).
 * Do NOT call this from any action — use only in seed scripts.
 * @deprecated Use proper onboarding flow instead.
 */
export async function seedDummyTemple() {
 // This function is intentionally a no-op in production.
 // For local dev seed, run: node seed.mjs
 if (process.env.NODE_ENV === 'production') return;

 const TEMP_TEMPLE_ID ="cm0testtempleid0000000001";
 try {
 const existing = await prisma.temple.findUnique({ where: { id: TEMP_TEMPLE_ID } })
 if (!existing) {
 await prisma.temple.create({
 data: {
 id: TEMP_TEMPLE_ID,
 name:"Ιερός Ναός Αγίου Δημητρίου (Δοκιμαστικός)",
 city:"Αθήνα", metropolisId:"cm0testmetropolis"
 }
 })
 }
 } catch (e) {
 console.error("Η βάση δεν έχει συγχρονιστεί ακόμα.", e)
 }
}
