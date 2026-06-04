import { prisma } from '@/lib/prisma'
import { getCurrentTempleId } from '@/actions/core'
import { notFound, redirect } from 'next/navigation'
import VariablesClient from './VariablesClient'
import { STANDARD_FIELDS } from '@/lib/greekDeclension'

export default async function VariablesPage({ params }: { params: { id: string } }) {
  const templeId = await getCurrentTempleId()

  const template = await prisma.docTemplate.findFirst({
    where: { id: params.id, templeId }
  })

  if (!template) notFound()
  // Allow templates with fileData (stored in DB) even if fileUrl is absent
  if (!template.fileUrl && !(template as any).fileData) redirect('/admin/documents')

  // Parse the context to get detected vars + format
  let detectedVars: string[] = []
  let detectedFormat = 'brackets'
  try {
    if (template.context) {
      const ctx = JSON.parse(template.context)
      detectedVars = Array.isArray(ctx) ? ctx : (ctx.vars || [])
      detectedFormat = ctx.format || 'brackets'
    }
  } catch {}

  const currentMap = (template.variableMap || {}) as Record<string, string>

  return (
    <VariablesClient
      template={{ id: template.id, nameEl: template.nameEl, needsMapping: template.needsMapping }}
      detectedVars={detectedVars}
      detectedFormat={detectedFormat}
      currentMap={currentMap}
      standardFields={STANDARD_FIELDS}
    />
  )
}
