'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getCurrentTempleId } from './core'
import { requireAuth } from '@/lib/requireAuth'

export async function upsertAssignment(data: {
 date: string
 serviceType: string
 priest?: string
 psaltis?: string
 neokomos?: string
 notes?: string
 tokenId?: string
}) {
 await requireAuth()
 const templeId = await getCurrentTempleId()
 const date = new Date(data.date)
 const startOfDay = new Date(date); startOfDay.setHours(0, 0, 0, 0)
 const endOfDay = new Date(date); endOfDay.setHours(23, 59, 59, 999)

 try {
 const existing = await prisma.assignment.findFirst({
 where: { templeId, date: { gte: startOfDay, lte: endOfDay }, serviceType: data.serviceType }
 })

 if (existing) {
 await prisma.assignment.update({
 where: { id: existing.id },
 data: {
 priest: data.priest || null, psaltis: data.psaltis || null,
 neokomos: data.neokomos || null, notes: data.notes || null,
 tokenId: data.tokenId || null,
 }
 })
 } else {
 await prisma.assignment.create({
 data: {
 templeId, date, serviceType: data.serviceType,
 priest: data.priest || null, psaltis: data.psaltis || null,
 neokomos: data.neokomos || null, notes: data.notes || null,
 tokenId: data.tokenId || null,
 }
 })
 }
 revalidatePath('/admin/assignments')
 return { success: true }
 } catch (e: any) {
 return { success: false, error: e.message }
 }
}
