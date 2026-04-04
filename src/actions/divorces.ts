'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function getDivorces() {
  const session = await getSession()
  const templeId = session?.templeId
  if (!templeId) return []

  return prisma.ecclesiasticalDivorce.findMany({
    where: { templeId },
    include: {
      parishioner: {
        select: { firstName: true, lastName: true, id: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
}

export async function addDivorce(data: {
  parishionerId: string
  protocolNumber?: string
  civilDivorceDecision?: string
  civilDivorceDate?: Date
  exSpouseName: string
  issuedDate: Date
  reason?: string
}) {
  const session = await getSession()
  const templeId = session?.templeId
  if (!templeId) throw new Error('Unauthorized')

  return prisma.ecclesiasticalDivorce.create({
    data: {
      templeId,
      parishionerId: data.parishionerId,
      protocolNumber: data.protocolNumber,
      civilDivorceDecision: data.civilDivorceDecision,
      civilDivorceDate: data.civilDivorceDate,
      exSpouseName: data.exSpouseName,
      issuedDate: data.issuedDate,
      reason: data.reason
    }
  })
}

export async function deleteDivorce(id: string) {
  const session = await getSession()
  if (!session?.templeId) throw new Error('Unauthorized')

  return prisma.ecclesiasticalDivorce.delete({
    where: { id, templeId: session.templeId }
  })
}
