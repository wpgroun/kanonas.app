'use server'

import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

/**
 * Register a new Temple and an initial Admin User for it.
 * This is intended for the public"Sign Up / Onboarding"flow.
 */
export async function registerTempleAndAdmin(data: {
 templeName: string
 metropolisName: string
 adminEmail: string
 adminPasswordPlain: string
 adminFirstName: string
 adminLastName: string
}) {
 try {
 // 1. Check if user email already exists
 const existingUser = await prisma.user.findUnique({
 where: { email: data.adminEmail }
 })
 if (existingUser) return { success: false, error: 'Το email αυτό χρησιμοποιείται ήδη.' }

 const passwordHash = await bcrypt.hash(data.adminPasswordPlain, 10)

 // 2. Create Temple, User, and link them using a transaction
 const result = await prisma.$transaction(async (tx) => {
 // Find or Create Metropolis
 let metropolis = await tx.metropolis.findFirst({ where: { name: data.metropolisName } })
 if (!metropolis) {
 metropolis = await tx.metropolis.create({ data: { name: data.metropolisName } })
 }

 const trialEnd = new Date()
 trialEnd.setDate(trialEnd.getDate() + 14)

 // Create new temple
 const newTemple = await tx.temple.create({
 data: {
 name: data.templeName,
 metropolisId: metropolis.id,
 subscriptionStatus: 'trial',
 subscriptionPlan: 'basic',
 subscriptionStartDate: new Date(),
 subscriptionEndDate: trialEnd,
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
 status: 'trial',
 billingCycle: 'monthly',
 }
 })

 // Create a UserSession record for the active session
 await tx.userSession.create({
   data: {
     userId: newUser.id,
     userAgent: 'Registration Flow'
   }
 })

 return { newUser, newTemple }
 })

 // Set the Auth Cookie directly so the user is logged in
 const { encrypt } = await import('@/lib/auth')
 const { cookies } = await import('next/headers')
 
 const token = await encrypt({
   userId: result.newUser.id,
   templeId: result.newTemple.id,
   isSuperAdmin: false,
   isHeadPriest: true,
   canViewFinances: true,
   canEditFinances: true,
   roleName: 'Προϊστάμενος'
 })
 
 ;(await cookies()).set('Kanonas_auth', token, {
   httpOnly: true,
   secure: process.env.NODE_ENV === 'production',
   path: '/',
   maxAge: 60 * 60 * 24 * 7
 })

 return { success: true }
 } catch (e: any) {
 console.error('[Register]', e)
 return { success: false, error: e.message || 'Αποτυχία εγγραφής. Παρακαλώ δοκιμάστε ξανά.' }
 }
}
