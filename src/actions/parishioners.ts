'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getCurrentTempleId } from './core'
import { requireAuth } from '@/lib/requireAuth'

export async function getParishioners(page = 1, pageSize = 100) {
 await requireAuth()
 const templeId = await getCurrentTempleId()
 try {
 return await prisma.parishioner.findMany({
 where: { templeId },
 orderBy: { lastName: 'asc' },
 take: pageSize,
 skip: (page - 1) * pageSize,
 })
 } catch (e) {
 return []
 }
}

export async function createParishioner(formData: {
 firstName: string
 lastName: string
 email?: string
 phone?: string
 fathersName?: string
 address?: string
 city?: string
 afm?: string
}) {
 await requireAuth()
 const templeId = await getCurrentTempleId()
 try {
 const p = await prisma.parishioner.create({
 data: {
 templeId,
 firstName: formData.firstName,
 lastName: formData.lastName,
 email: formData.email || null,
 phone: formData.phone || null,
 fathersName: formData.fathersName || null,
 address: formData.address || null,
 city: formData.city || null,
 afm: formData.afm || null,
 status:"active"
 }
 })
 revalidatePath('/admin/parishioners')
 return { success: true, id: p.id }
 } catch (error) {
 console.error("Σφάλμα δημιουργίας ενορίτη:", error)
 return { success: false, error:"Αποτυχία ολοκλήρωσης"}
 }
}

export async function getParishionerDetails(id: string) {
 await requireAuth()
 const templeId = await getCurrentTempleId()
 try {
 return await prisma.parishioner.findFirst({
 where: { id, templeId },
 include: {
 donations: { orderBy: { date: 'desc' } },
 ceremonyPersons: { include: { token: true } }
 }
 })
 } catch (e) {
 return null
 }
}

export async function updateParishionerDetails(id: string, data: {
 firstName: string
 lastName: string
 email?: string
 phone?: string
 address?: string
 city?: string
 afm?: string
 idNumber?: string
}) {
 const session = await requireAuth()
 const templeId = await getCurrentTempleId()
 try {
 const existing = await prisma.parishioner.findFirst({ where: { id, templeId } })
 if(!existing) return { success: false, error:"Parishioner not found in your temple"}

 // ─── Field-level diff for audit log ─────────────────────────────────────
 const FIELD_LABELS: Record<string, string> = {
 firstName: 'Όνομα', lastName: 'Επώνυμο', email: 'Email',
 phone: 'Τηλέφωνο', address: 'Διεύθυνση', city: 'Πόλη',
 afm: 'ΑΦΜ', idNumber: 'ΑΔΤ'
 }
 const changes: string[] = []
 for (const [key, label] of Object.entries(FIELD_LABELS)) {
 const before = (existing as any)[key] ?? ''
 const after = (data as any)[key] ?? ''
 if (String(before) !== String(after)) {
 changes.push(`${label}:"${before}"→"${after}"`)
 }
 }
 // ─────────────────────────────────────────────────────────────────────────

 await prisma.parishioner.update({
 where: { id },
 data: {
 firstName: data.firstName,
 lastName: data.lastName,
 email: data.email || null,
 phone: data.phone || null,
 address: data.address || null,
 city: data.city || null,
 afm: data.afm || null,
 idNumber: data.idNumber || null,
 }
 })

 // Write audit log with before/after diff
 if (changes.length > 0) {
 await prisma.auditLog.create({
 data: {
 templeId,
 userId: session.userId,
 userEmail: session.userEmail,
 action: 'ΕΝΗΜΕΡΩΣΗ_ΕΝΟΡΙΤΗ',
 entityType: 'Parishioner',
 entityId: id,
 detail: changes.join(' | '),
 }
 })
 }

 revalidatePath(`/admin/parishioners/${id}`)
 revalidatePath('/admin/parishioners')
 return { success: true }
 } catch (error) {
 console.error("Σφάλμα ενημέρωσης ενορίτη:", error)
 return { success: false, error:"Αποτυχία ενημέρωσης"}
 }
}

export async function updateParishionerRoles(id: string, newRolesStr: string) {
 await requireAuth()
 const templeId = await getCurrentTempleId()
 try {
 const existing = await prisma.parishioner.findFirst({ where: { id, templeId } })
 if(!existing) return { success: false, error:"Not authorized"}

 await prisma.parishioner.update({
 where: { id },
 data: { roles: newRolesStr }
 })
 revalidatePath(`/admin/parishioners/${id}`)
 return { success: true }
 } catch (error) {
 console.error("Σφάλμα ενημέρωσης ρόλων:", error)
 return { success: false, error:"Αποτυχία ενημέρωσης"}
 }
}

// ─── GDPR — Right to Erasure ───────────────────────────────────────────────────

/**
 * Anonymize all PII for a parishioner (GDPR Art. 17 — Right to Erasure).
 * Preserves the record skeleton for referential integrity (donations, sacraments counts)
 * but replaces all identifying data with anonymous placeholders.
 *
 * Requires: head priest or super admin.
 */
export async function anonymizeParishioner(id: string): Promise<{ success: boolean; error?: string }> {
 const session = await requireAuth()
 if (!session.isHeadPriest && !session.isSuperAdmin) {
 return { success: false, error: 'Απαιτούνται δικαιώματα Προϊστάμενου.' }
 }
 const templeId = await getCurrentTempleId()

 try {
 const existing = await prisma.parishioner.findFirst({ where: { id, templeId } })
 if (!existing) return { success: false, error: 'Ο ενορίτης δεν βρέθηκε.' }

 const anonId = `ANON_${id.slice(-6).toUpperCase()}`

 await prisma.parishioner.update({
 where: { id },
 data: {
 firstName: 'Ανώνυμος',
 lastName: anonId,
 email: null,
 phone: null,
 address: null,
 city: null,
 afm: null,
 idNumber: null,
 // Fields not in schema (mobile, notes, roles, status) handled via cast
 ...(({ mobile: null, fathersName: null, mothersName: null } as any)),
 }
 })

 // Audit log this critical action
 const { logAction } = await import('@/lib/audit')
 await logAction({
 action: 'GDPR_ANONYMIZATION',
 entityType: 'Parishioner',
 entityId: id,
 detail: `Ενορίτης ανωνυμοποιήθηκε (GDPR Art. 17). ID: ${anonId}`,
 })

 revalidatePath('/admin/parishioners')
 revalidatePath(`/admin/parishioners/${id}`)
 return { success: true }
 } catch (error) {
 console.error('[GDPR] Anonymization error:', error)
 return { success: false, error: 'Αποτυχία ανωνυμοποίησης.' }
 }
}

export async function sendParishionerSMS(parishionerId: string, message: string): Promise<{ success: boolean; error?: string }> {
  const session = await requireAuth()
  const templeId = await getCurrentTempleId()

  try {
    const parishioner = await prisma.parishioner.findFirst({
      where: { id: parishionerId, templeId }
    })

    if (!parishioner || !parishioner.phone) {
      return { success: false, error: 'Ο ενορίτης δεν βρέθηκε ή δεν έχει δηλωμένο τηλέφωνο.' }
    }

    const temple = await prisma.temple.findUnique({
      where: { id: templeId }
    })

    if (!temple) {
      return { success: false, error: 'Ο Ναός δεν βρέθηκε.' }
    }

    const settings = (temple as any).settings as any
    const { sendSMS } = await import('@/lib/sms')

    const res = await sendSMS([parishioner.phone], message, {
      smsSenderId: settings?.smsSenderId
    })

    if (res.success) {
      await prisma.auditLog.create({
        data: {
          templeId,
          userId: session.userId,
          userEmail: session.userEmail,
          action: 'SMS_SENT',
          entityType: 'Parishioner',
          entityId: parishionerId,
          detail: `Αποστολή SMS: "${message.length > 60 ? message.slice(0, 57) + '...' : message}"`
        }
      })
      
      revalidatePath(`/admin/parishioners/${parishionerId}`)
      return { success: true }
    } else {
      return { success: false, error: res.error || 'Αποτυχία αποστολής SMS.' }
    }
  } catch (error: any) {
    console.error('[SMS] Send error:', error)
    return { success: false, error: error.message || 'Σφάλμα συστήματος κατά την αποστολή SMS.' }
  }
}
