import { notFound } from 'next/navigation'
import { getTemplateById } from '@/actions/documents'
import VariablesClient from './VariablesClient'

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>
}

export default async function VariablesMappingPage({ params }: Props) {
  const { id } = await params
  const template = await getTemplateById(id)
  if (!template) notFound()

  return <VariablesClient template={template as any} />
}
