'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import fs from 'fs/promises'
import path from 'path'
import { TEMP_TEMPLE_ID } from '@/lib/constants'
import { seedDummyTemple } from './core'

export async function getAssets(category?: string) {
  await seedDummyTemple()
  try {
    const whereClause: any = { templeId: TEMP_TEMPLE_ID }
    if (category && category !== 'ALL') whereClause.category = category
    return await prisma.asset.findMany({ where: whereClause, orderBy: { createdAt: 'desc' } })
  } catch (e) {
    return []
  }
}

export async function addAsset(formData: FormData) {
  await seedDummyTemple()
  try {
    const name = formData.get('name') as string
    const category = formData.get('category') as string
    const description = formData.get('description') as string
    const location = formData.get('location') as string
    const estimatedValueStr = formData.get('estimatedValue') as string
    const estimatedValue = estimatedValueStr ? parseFloat(estimatedValueStr) : null
    const acquisitionDateStr = formData.get('acquisitionDate') as string
    const status = (formData.get('status') as string) || 'ACTIVE'

    let imageUrl = null
    const imageFile = formData.get('image') as File | null
    if (imageFile && imageFile.name && imageFile.size > 0) {
      const arrayBuffer = await imageFile.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'assets')
      try { await fs.mkdir(uploadDir, { recursive: true }) } catch (e) {}
      const filename = `${Date.now()}-${imageFile.name.replace(/[^a-zA-Z0-9_\.-]/g, '_')}`
      await fs.writeFile(path.join(uploadDir, filename), buffer)
      imageUrl = `/uploads/assets/${filename}`
    }

    await prisma.asset.create({
      data: {
        templeId: TEMP_TEMPLE_ID, name, category,
        description: description || null,
        location: location || null,
        estimatedValue: (estimatedValue && !isNaN(estimatedValue)) ? estimatedValue : null,
        acquisitionDate: acquisitionDateStr ? new Date(acquisitionDateStr) : null,
        status, imageUrl
      }
    })
    revalidatePath('/admin/assets')
    return { success: true }
  } catch (e) {
    console.error(e)
    return { success: false, error: String(e) }
  }
}

export async function updateAssetStatus(id: string, newStatus: string) {
  try {
    await prisma.asset.update({ where: { id }, data: { status: newStatus } })
    revalidatePath('/admin/assets')
    return { success: true }
  } catch (e) {
    return { success: false }
  }
}

export async function deleteAsset(id: string) {
  try {
    await prisma.asset.delete({ where: { id } })
    revalidatePath('/admin/assets')
    return { success: true }
  } catch (e) {
    return { success: false }
  }
}

