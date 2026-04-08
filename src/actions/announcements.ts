'use server'

import { prisma } from '@/lib/prisma'
import { requireSuperAdmin, requireAuth } from '@/lib/requireAuth'
import { revalidatePath } from 'next/cache'

// ─── Super Admin: Create/Update Announcement ──────────────────────────────────

export async function createAnnouncement(data: {
  title: string; body: string; type: string; priority: string; expiresAt?: string;
}) {
  const session = await requireSuperAdmin()
  
  await prisma.systemAnnouncement.create({
    data: {
      title: data.title,
      body: data.body,
      type: data.type,
      priority: data.priority,
      authorId: session.userId,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    }
  })

  revalidatePath('/admin/super/announcements')
  return { success: true }
}

export async function deleteAnnouncement(id: string) {
  await requireSuperAdmin()
  await prisma.systemAnnouncement.delete({ where: { id } })
  revalidatePath('/admin/super/announcements')
  return { success: true }
}

export async function toggleAnnouncement(id: string, isActive: boolean) {
  await requireSuperAdmin()
  await prisma.systemAnnouncement.update({ where: { id }, data: { isActive } })
  revalidatePath('/admin/super/announcements')
  return { success: true }
}

export async function getAllAnnouncements() {
  await requireSuperAdmin()
  return prisma.systemAnnouncement.findMany({ orderBy: { createdAt: 'desc' } })
}

// ─── End User: Get active announcements ───────────────────────────────────────

export async function getActiveAnnouncements() {
  try {
    await requireAuth()
    return prisma.systemAnnouncement.findMany({
      where: {
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    })
  } catch {
    return []
  }
}
