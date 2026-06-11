'use server'

import { logger } from '@/lib/logger';

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
  idNumber?: string
  forceCreate?: boolean
}) {
  await requireAuth()
  const templeId = await getCurrentTempleId()

  // Hard block: ΑΦΜ uniqueness per temple
  if (formData.afm?.trim()) {
    const existing = await prisma.parishioner.findFirst({
      where: { templeId, afm: formData.afm.trim() },
      select: { id: true, firstName: true, lastName: true },
    })
    if (existing) {
      return {
        success: false as const,
        errorType: 'DUPLICATE_AFM' as const,
        existing,
        error: `Υπάρχει ήδη ενορίτης με αυτό το ΑΦΜ: ${existing.firstName} ${existing.lastName}`,
      }
    }
  }

  // Hard block: ΑΔΤ uniqueness per temple
  if (formData.idNumber?.trim()) {
    const existing = await prisma.parishioner.findFirst({
      where: { templeId, idNumber: formData.idNumber.trim() },
      select: { id: true, firstName: true, lastName: true },
    })
    if (existing) {
      return {
        success: false as const,
        errorType: 'DUPLICATE_ID' as const,
        existing,
        error: `Υπάρχει ήδη ενορίτης με αυτό το ΑΔΤ: ${existing.firstName} ${existing.lastName}`,
      }
    }
  }

  // Soft check: same name (skipped if admin chose to force-create)
  if (!formData.forceCreate) {
    const sameNameMatches = await prisma.parishioner.findMany({
      where: {
        templeId,
        firstName: { equals: formData.firstName.trim(), mode: 'insensitive' },
        lastName: { equals: formData.lastName.trim(), mode: 'insensitive' },
      },
      select: { id: true, firstName: true, lastName: true, afm: true },
    })
    if (sameNameMatches.length > 0) {
      return {
        success: false as const,
        errorType: 'SOFT_DUPLICATE' as const,
        existing: sameNameMatches,
        error: `Βρέθηκαν ${sameNameMatches.length} ενορίτες με το ίδιο όνομα.`,
      }
    }
  }

  try {
    const p = await prisma.parishioner.create({
      data: {
        templeId,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email || null,
        phone: formData.phone || null,
        fathersName: formData.fathersName || null,
        address: formData.address || null,
        city: formData.city || null,
        afm: formData.afm?.trim() || null,
        idNumber: formData.idNumber?.trim() || null,
        status: 'active',
      },
    })
    revalidatePath('/admin/parishioners')
    return { success: true as const, id: p.id }
  } catch (error) {
    logger.error('Σφάλμα δημιουργίας ενορίτη:', error)
    return { success: false as const, errorType: 'SERVER_ERROR' as const, error: 'Αποτυχία ολοκλήρωσης' }
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
 logger.error("Σφάλμα ενημέρωσης ενορίτη:", error)
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
 logger.error("Σφάλμα ενημέρωσης ρόλων:", error)
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
 logger.error('[GDPR] Anonymization error:', error)
 return { success: false, error: 'Αποτυχία ανωνυμοποίησης.' }
 }
}

export type DedupGroup = {
  key: string
  parishioners: Array<{
    id: string
    firstName: string
    lastName: string
    email: string | null
    phone: string | null
    afm: string | null
    createdAt: Date
  }>
}

export async function getDeduplicatePreview(): Promise<{
  success: boolean
  groups: DedupGroup[]
  error?: string
}> {
  await requireAuth()
  const templeId = await getCurrentTempleId()
  try {
    const all = await prisma.parishioner.findMany({
      where: { templeId },
      orderBy: { createdAt: 'asc' },
      select: { id: true, firstName: true, lastName: true, email: true, phone: true, afm: true, createdAt: true },
    })

    const groupMap = new Map<string, typeof all>()
    for (const p of all) {
      const key = `${p.firstName.trim().toLowerCase()}|${p.lastName.trim().toLowerCase()}`
      if (!groupMap.has(key)) groupMap.set(key, [])
      groupMap.get(key)!.push(p)
    }

    const groups: DedupGroup[] = []
    for (const [key, parishioners] of groupMap) {
      if (parishioners.length > 1) groups.push({ key, parishioners })
    }

    return { success: true, groups }
  } catch (error: any) {
    return { success: false, groups: [], error: error.message }
  }
}

/**
 * Find duplicate parishioners (same firstName + lastName, case-insensitive)
 * and delete all but the OLDEST one (keep original, delete copies).
 * Returns the count of deleted duplicates.
 */
export async function deduplicateParishioners(): Promise<{ success: boolean; deleted: number; groups: number; error?: string }> {
  await requireAuth()
  const templeId = await getCurrentTempleId()
  try {
    // Load all parishioners for this temple
    const all = await prisma.parishioner.findMany({
      where: { templeId },
      orderBy: { createdAt: 'asc' }, // oldest first → keep oldest
      select: { id: true, firstName: true, lastName: true, createdAt: true },
    })

    // Group by normalized (lowercase, trimmed) firstName + lastName
    const groups = new Map<string, string[]>() // key → [id1, id2, ...]
    for (const p of all) {
      const key = `${(p.firstName || '').trim().toLowerCase()}|${(p.lastName || '').trim().toLowerCase()}`
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key)!.push(p.id)
    }

    // Collect IDs to delete (all but the first/oldest in each duplicate group)
    const toDelete: string[] = []
    let dupGroups = 0
    for (const [, ids] of groups) {
      if (ids.length > 1) {
        dupGroups++
        // Keep ids[0] (oldest), delete the rest
        toDelete.push(...ids.slice(1))
      }
    }

    if (toDelete.length === 0) {
      return { success: true, deleted: 0, groups: 0 }
    }

    // Delete duplicates (only if they have no related data)
    // For safety: delete one by one, skip any that have relations
    let deletedCount = 0
    for (const id of toDelete) {
      try {
        await prisma.parishioner.delete({ where: { id } })
        deletedCount++
      } catch (e) {
        // Has relations (tokens, donations etc.) — skip, can't safely delete
        logger.warn(`[dedup] Skipped parishioner ${id} (has relations)`)
      }
    }

    revalidatePath('/admin/parishioners')
    revalidatePath('/admin/registry')
    return { success: true, deleted: deletedCount, groups: dupGroups }
  } catch (error: any) {
    logger.error('[dedup] Error:', error)
    return { success: false, deleted: 0, groups: 0, error: error.message }
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
    logger.error('[SMS] Send error:', error)
    return { success: false, error: error.message || 'Σφάλμα συστήματος κατά την αποστολή SMS.' }
  }
}
