'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function getParishionerRelationships(parishionerId: string) {
  const session = await getSession()
  if (!session?.templeId) return []

  const sources = await prisma.parishionerRelationship.findMany({
    where: { targetId: parishionerId, templeId: session.templeId },
    include: { source: { select: { id: true, firstName: true, lastName: true } } }
  })

  const targets = await prisma.parishionerRelationship.findMany({
    where: { sourceId: parishionerId, templeId: session.templeId },
    include: { target: { select: { id: true, firstName: true, lastName: true } } }
  })

  return { sources, targets }
}

export async function addRelationship(sourceId: string, targetId: string, type: string) {
  const session = await getSession()
  if (!session?.templeId) throw new Error('Unauthorized')

  return prisma.parishionerRelationship.create({
    data: {
      templeId: session.templeId,
      sourceId,
      targetId,
      relationshipType: type
    }
  })
}

export async function deleteRelationship(id: string) {
  const session = await getSession()
  if (!session?.templeId) throw new Error('Unauthorized')

  return prisma.parishionerRelationship.delete({
    where: { id, templeId: session.templeId }
  })
}
