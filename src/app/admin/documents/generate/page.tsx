import { getDocTemplates } from '@/actions/documents'
import GenerateClient from './GenerateClient'

export const metadata = { title: 'Συμπλήρωση Εγγράφου' }

export default async function GeneratePage({ searchParams }: { searchParams: any }) {
  const params = await searchParams
  const templateId = params?.templateId as string | undefined
  const templates = await getDocTemplates()

  return <GenerateClient templates={templates} selectedTemplateId={templateId} />
}
