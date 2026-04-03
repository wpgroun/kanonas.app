'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { seedDummyTemple, TEMP_TEMPLE_ID } from './core'

export async function getProtocols() {
  await seedDummyTemple()
  try {
    return await prisma.protocol.findMany({
      where: { templeId: TEMP_TEMPLE_ID },
      orderBy: { date: 'desc' },
      include: { temple: { select: { name: true } } }
    })
  } catch (e) {
    return []
  }
}

export async function addProtocolEntry(data: {
  direction: string
  subject: string
  sender?: string
  receiver?: string
  tokenId?: string
}) {
  await seedDummyTemple()
  try {
    const year = new Date().getFullYear()
    const latest = await prisma.protocol.findFirst({
      where: { templeId: TEMP_TEMPLE_ID, year },
      orderBy: { number: 'desc' }
    })
    const nextNumber = latest ? latest.number + 1 : 1
    const entry = await prisma.protocol.create({
      data: {
        templeId: TEMP_TEMPLE_ID,
        number: nextNumber,
        year,
        direction: data.direction,
        subject: data.subject,
        sender: data.sender || null,
        receiver: data.receiver || null,
        tokenId: data.tokenId || null
      }
    })
    revalidatePath('/admin/protocol')
    return { success: true, entry }
  } catch (e) {
    console.error(e)
    return { success: false, error: 'Σφάλμα δημιουργίας πρωτοκόλλου' }
  }
}

