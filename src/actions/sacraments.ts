'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getCurrentTempleId } from './core'
import { requireAuth } from '@/lib/requireAuth'
import { randomBytes } from 'crypto'

export async function createSacramentRequest(formData: {
 type: string
 date: string
 name: string
 email: string
 phone: string
 metaStr?: string
}) {
 await requireAuth()
 const templeId = await getCurrentTempleId()
 const randomHash = randomBytes(32).toString('hex')
 try {
 const token = await prisma.token.create({
 data: {
 templeId,
 tokenStr: randomHash,
 serviceType: formData.type,
 status:"pending",
 customerName: formData.name,
 customerEmail: formData.email,
 ceremonyDate: new Date(formData.date),
 ...(formData.metaStr ? {
 ceremonyMeta: { create: { dataJson: formData.metaStr } }
 } : {})
 }
 })
 revalidatePath('/admin/requests')
 return { success: true, tokenId: token.id, hash: randomHash }
 } catch (error) {
 console.error("Σφάλμα αποθήκευσης:", error)
 return { success: false, error:"Αποτυχία ολοκλήρωσης"}
 }
}

export async function getPendingRequests() {
 const templeId = await getCurrentTempleId()
 try {
 return await prisma.token.findMany({
 where: { templeId, status:"pending"},
 orderBy: { createdAt: 'desc' }
 })
 } catch (e) {
 return []
 }
}

export async function getTokens() {
 const templeId = await getCurrentTempleId()
 try {
 return await prisma.token.findMany({
 where: { templeId },
 orderBy: { createdAt: 'desc' }
 })
 } catch (e) {
 return []
 }
}

export async function getRequestDetails(tokenId: string) {
 try {
 const templeId = await getCurrentTempleId()
 return await prisma.token.findFirst({
 where: { id: tokenId, templeId },
 include: {
 persons: { include: { parishioner: true } },
 ceremonyMeta: true
 }
 })
 } catch (e) {
 return null
 }
}

export async function linkPersonToSacrament(tokenId: string, parishionerId: string, role: string) {
 await requireAuth()
 const templeId = await getCurrentTempleId()
 try {
 const token = await prisma.token.findFirst({ where: { id: tokenId, templeId } })
 if(!token) return { success: false, error:"Μη Εξουσιοδοτημένη Ενέργεια"}

 const p = await prisma.parishioner.findFirst({ where: { id: parishionerId, templeId } })
 if (!p) return { success: false, error:"Ο ενορίτης δεν βρέθηκε στο Μητρώο."}

 await prisma.ceremonyPerson.create({
 data: {
 tokenId,
 parishionerId,
 role,
 firstName: p.firstName,
 lastName: p.lastName,
 fathersName: p.fathersName,
 mothersName: p.mothersName
 }
 })
 revalidatePath(`/admin/requests/${tokenId}`)
 return { success: true }
 } catch (error) {
 console.error("Σφάλμα σύνδεσης προσώπου:", error)
 return { success: false, error:"Αποτυχία σύνδεσης"}
 }
}

export async function markTokenAsDocsGenerated(tokenId: string, assignedPriest: string, bookNumber?: string, protocolNumber?: string) {
 await requireAuth()
 try {
 const templeId = await getCurrentTempleId()
 
 const userToken = await prisma.token.findFirst({ where: { id: tokenId, templeId } })
 if(!userToken) throw new Error("Unauthorized Token");

 // --- PHASE 4: AUTO-ENROLMENT IN PARISHIONER REGISTRY ---
 const unlinkedPersons = await prisma.ceremonyPerson.findMany({
 where: { tokenId, parishionerId: null }
 });

 for (const p of unlinkedPersons) {
 if (!p.firstName || !p.lastName) continue;
 
 const newParishioner = await prisma.parishioner.create({
 data: {
 templeId,
 firstName: p.firstName,
 lastName: p.lastName,
 fathersName: p.fathersName || undefined,
 roles: JSON.stringify(["enoriths"])
 }
 });
 
 await prisma.ceremonyPerson.update({
 where: { id: p.id },
 data: { parishionerId: newParishioner.id }
 });
 }
 // ----------------------------------------------------

 await prisma.token.update({
 where: { id: tokenId },
 data: {
 status: 'docs_generated',
 assignedPriest,
 ...(bookNumber ? { bookNumber } : {}),
 ...(protocolNumber ? { protocolNumber } : {})
 }
 })
 revalidatePath(`/admin/requests/${tokenId}`)
 revalidatePath('/admin/requests')
 return { success: true }
 } catch (e) {
 console.error("Auto enrol or markToken error", e);
 return { success: false }
 }
}

export async function verifyTokenByHash(tokenStr: string) {
 // Public — no auth required (used by end-users filling in the form)
 try {
 return await prisma.token.findUnique({
 where: { tokenStr },
 include: {
 temple: { select: { name: true, city: true } },
 persons: true,
 ceremonyMeta: true
 }
 })
 } catch (e) {
 return null
 }
}

export async function savePublicTokenAnswers(tokenStr: string, answersStr: string, personsArr?: {role: string, firstName: string, lastName: string, fathersName?: string, mothersName?: string}[]) {
 // Public — no auth required (used by end-users filling in the form)
 try {
 const token = await prisma.token.findUnique({ where: { tokenStr } })
 if (!token) return { success: false, error: 'Το αίτημα δεν υπάρχει πλέον.' }
 if (token.submissionComplete) return { success: false, error: 'Το ερωτηματολόγιο έχει ήδη συμπληρωθεί. Αν θέλετε αλλαγές, καλέστε την Ενορία.' }

 await prisma.ceremonyMeta.upsert({
 where: { tokenId: token.id },
 create: { tokenId: token.id, dataJson: answersStr },
 update: { dataJson: answersStr }
 })

 if (personsArr && personsArr.length > 0) {
 // Clear old
 await prisma.ceremonyPerson.deleteMany({ where: { tokenId: token.id } });
 // Create new
 await prisma.ceremonyPerson.createMany({
 data: personsArr.map(p => ({
 tokenId: token.id,
 role: p.role,
 firstName: p.firstName,
 lastName: p.lastName,
 fathersName: p.fathersName || null,
 mothersName: p.mothersName || null
 }))
 });
 }

 // Mark as complete for priest to review
 await prisma.token.update({
 where: { id: token.id },
 data: { submissionComplete: true, status: 'pending' /* priest needs to generate */ }
 });

 return { success: true }
 } catch (error) {
 console.error("Σφάλμα αποθήκευσης questionnaire:", error)
 return { success: false, error:"Αποτυχία υποβολής."}
 }
}

import { addServiceSchedule } from './schedule'

export async function approveSacramentRequest(tokenId: string, date: Date | null, title: string) {
 await requireAuth()
 const templeId = await getCurrentTempleId()
 try {
 const token = await prisma.token.findFirst({ where: { id: tokenId, templeId } })
 if (!token) return { success: false, error: 'Δεν βρέθηκε' }

 // 1. Send Email with the link (using existing function sendFormLinkAction logic)
 const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
 const tokenUrl = `${baseUrl}/request/${token.tokenStr}`
 const { sendFormLinkEmail } = await import('@/lib/emailService')
 const temple = await prisma.temple.findUnique({ where: { id: token.templeId } })
 
 if (temple && token.customerEmail) {
 await sendFormLinkEmail({
 to: token.customerEmail,
 familyName: token.customerName || 'Οικογένεια',
 serviceType: token.serviceType as 'GAMOS' | 'VAPTISI',
 tokenUrl,
 ceremonyDate: token.ceremonyDate?.toLocaleDateString('el-GR'),
 templeName: temple.name,
 }).catch(console.error)
 }

 // 2. Add to Schedule
 if (date) {
 await addServiceSchedule({
 date: date.toISOString(),
 title: title,
 description: `Δεσμευμένο από αίτηση #${tokenId.slice(-6).toUpperCase()}`,
 isMajor: false
 });
 }

 // 3. Mark as accepted
 await prisma.token.update({
 where: { id: tokenId },
 data: { status: 'accepted' }
 });

 revalidatePath(`/admin/requests/${tokenId}`)
 revalidatePath('/admin/requests')
 revalidatePath('/admin/schedule')
 return { success: true }
 } catch (e: any) {
 return { success: false, error: e.message }
 }
}

export async function rejectSacramentRequest(tokenId: string) {
 await requireAuth()
 const templeId = await getCurrentTempleId()
 try {
 const token = await prisma.token.findFirst({ where: { id: tokenId, templeId } })
 if (!token) return { success: false, error: 'Not found' }
 
 await prisma.token.delete({
 where: { id: tokenId }
 });
 revalidatePath('/admin/requests')
 return { success: true }
 } catch (e: any) {
 return { success: false, error: e.message }
 }
}

export async function sendFormLinkAction(tokenId: string) {
 // Keeping this for backwards compatibility if needed
 await requireAuth()
 try {
 const token = await prisma.token.findUnique({
 where: { id: tokenId },
 include: { temple: true }
 })
 if (!token || !token.customerName) return { success: false, error: 'Token ή email δεν βρέθηκε' }

 const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
 const tokenUrl = `${baseUrl}/request/${token.tokenStr}`

 const { sendFormLinkEmail } = await import('@/lib/emailService')
 await sendFormLinkEmail({
 to: token.customerEmail || '',
 familyName: token.customerName,
 serviceType: token.serviceType as 'GAMOS' | 'VAPTISI',
 tokenUrl,
 ceremonyDate: token.ceremonyDate?.toLocaleDateString('el-GR'),
 templeName: token.temple.name,
 })
 return { success: true }
 } catch (e: any) {
 return { success: false, error: e.message }
 }
}
