'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { TEMP_TEMPLE_ID } from '@/lib/constants'
import { seedDummyTemple } from './core'

export async function createSacramentRequest(formData: {
  type: string
  date: string
  name: string
  email: string
  phone: string
  metaStr?: string
}) {
  await seedDummyTemple()
  const randomHash = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  try {
    const token = await prisma.token.create({
      data: {
        templeId: TEMP_TEMPLE_ID,
        tokenStr: randomHash,
        serviceType: formData.type,
        status: "pending",
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
    return { success: false, error: "Αποτυχία ολοκλήρωσης" }
  }
}

export async function getPendingRequests() {
  try {
    return await prisma.token.findMany({
      where: { templeId: TEMP_TEMPLE_ID, status: "pending" },
      orderBy: { createdAt: 'desc' }
    })
  } catch (e) {
    return []
  }
}

export async function getTokens() {
  await seedDummyTemple()
  try {
    return await prisma.token.findMany({
      where: { templeId: TEMP_TEMPLE_ID },
      orderBy: { createdAt: 'desc' }
    })
  } catch (e) {
    return []
  }
}

export async function getRequestDetails(tokenId: string) {
  try {
    return await prisma.token.findUnique({
      where: { id: tokenId },
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
  try {
    const p = await prisma.parishioner.findUnique({ where: { id: parishionerId } })
    if (!p) return { success: false, error: "Ο ενορίτης δεν βρέθηκε στο Μητρώο." }

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
    return { success: false, error: "Αποτυχία σύνδεσης" }
  }
}

export async function markTokenAsDocsGenerated(tokenId: string, assignedPriest: string, bookNumber?: string) {
  try {
    await prisma.token.update({
      where: { id: tokenId },
      data: {
        status: 'docs_generated',
        assignedPriest,
        ...(bookNumber ? { bookNumber } : {})
      }
    })
    revalidatePath(`/admin/requests/${tokenId}`)
    revalidatePath('/admin/requests')
    return { success: true }
  } catch (e) {
    return { success: false }
  }
}

export async function verifyTokenByHash(tokenStr: string) {
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

export async function savePublicTokenAnswers(tokenStr: string, answersStr: string) {
  try {
    const token = await prisma.token.findUnique({ where: { tokenStr } })
    if (!token) return { success: false, error: 'Το αίτημα δεν υπάρχει πλέον.' }

    await prisma.ceremonyMeta.upsert({
      where: { tokenId: token.id },
      create: { tokenId: token.id, dataJson: answersStr },
      update: { dataJson: answersStr }
    })
    return { success: true }
  } catch (error) {
    console.error("Σφάλμα αποθήκευσης questionnaire:", error)
    return { success: false, error: "Αποτυχία υποβολής." }
  }
}

export async function sendFormLinkAction(tokenId: string) {
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

