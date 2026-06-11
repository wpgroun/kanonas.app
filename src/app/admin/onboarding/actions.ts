'use server'

import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/requireAuth'
import { getCurrentTempleId } from '@/actions/core'
import { revalidatePath } from 'next/cache'

export async function getOnboardingData() {
  const session = await requireAuth()
  const templeId = await getCurrentTempleId()

  const [temple, templates, users, roles] = await Promise.all([
    prisma.temple.findUnique({
      where: { id: templeId },
      include: { metropolis: true },
    }),
    prisma.docTemplate.findMany({
      where: { templeId },
      select: { id: true, docType: true, nameEl: true },
    }),
    prisma.userTemple.findMany({
      where: { templeId },
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true } }, role: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.role.findMany({
      where: { templeId },
      select: { id: true, name: true },
    }),
  ])

  if (!temple) throw new Error('Temple not found')

  let settings: Record<string, any> = {}
  try { settings = JSON.parse(temple.settings || '{}') } catch {}

  return {
    temple: {
      name: temple.name,
      address: temple.address || '',
      city: temple.city || '',
      phoneNumber: temple.phoneNumber || '',
      email: temple.email || '',
      taxId: temple.taxId || '',
      metropolisName: temple.metropolis?.name || '',
      protocolPrefix: settings.protocolPrefix || 'ΑΠ-',
      protocolStartNumber: settings.protocolStartNumber || '1',
    },
    templates: templates.map(t => ({ id: t.id, docType: t.docType, nameEl: t.nameEl })),
    users: users.map(ut => ({
      id: ut.id,
      isHeadPriest: ut.isHeadPriest,
      name: `${ut.user.firstName} ${ut.user.lastName}`,
      email: ut.user.email,
      role: ut.role?.name || 'Προϊστάμενος',
    })),
    roles: roles.map(r => ({ id: r.id, name: r.name })),
    onboardingCompleted: !!settings.onboardingCompleted,
  }
}

export async function saveTempleProfile(data: {
  address: string
  city: string
  phoneNumber: string
  email: string
  taxId: string
  protocolPrefix: string
  protocolStartNumber: string
}) {
  await requireAuth()
  const templeId = await getCurrentTempleId()

  const existing = await prisma.temple.findUnique({ where: { id: templeId }, select: { name: true, settings: true } })
  if (!existing) return { success: false, error: 'Ναός δεν βρέθηκε' }

  let settings: Record<string, any> = {}
  try { settings = JSON.parse(existing.settings || '{}') } catch {}

  settings.protocolPrefix = data.protocolPrefix || 'ΑΠ-'
  settings.protocolStartNumber = data.protocolStartNumber || '1'

  await prisma.temple.update({
    where: { id: templeId },
    data: {
      address: data.address,
      city: data.city,
      phoneNumber: data.phoneNumber,
      email: data.email,
      taxId: data.taxId,
      settings: JSON.stringify(settings),
    },
  })

  revalidatePath('/admin/settings')
  return { success: true }
}

export async function completeOnboarding() {
  await requireAuth()
  const templeId = await getCurrentTempleId()

  const existing = await prisma.temple.findUnique({ where: { id: templeId }, select: { settings: true } })
  let settings: Record<string, any> = {}
  try { settings = JSON.parse(existing?.settings || '{}') } catch {}

  settings.onboardingCompleted = true

  await prisma.temple.update({
    where: { id: templeId },
    data: { settings: JSON.stringify(settings) },
  })

  revalidatePath('/admin')
  revalidatePath('/admin/onboarding')
  return { success: true }
}
