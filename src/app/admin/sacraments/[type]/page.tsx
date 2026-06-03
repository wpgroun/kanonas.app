import { requireAuth } from '@/lib/requireAuth';
import { getCurrentTempleId } from '@/actions/core';
import { getDocTemplates } from '@/actions/documents';
import { prisma } from '@/lib/prisma';
import SacramentClient from './SacramentClient';

export default async function SacramentPage({ params }: { params: { type: string } }) {
  await requireAuth();
  const templeId = await getCurrentTempleId();
  
  // Map URL types to internal DB type
  const typeMap: Record<string, string> = {
    'baptisms': 'vaptisi',
    'marriages': 'gamos',
    'funerals': 'funeral'
  };
  
  const internalDocType = typeMap[params.type] || 'other';

  // 1. Fetch available dynamic templates for this subset
  const templates = await getDocTemplates(internalDocType);

  // 2. Fetch already executed tokens of this type to build the table
  const records = await prisma.token.findMany({
    where: { templeId, serviceType: internalDocType },
    include: { ceremonyMeta: true, persons: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <SacramentClient 
      urlType={params.type} 
      internalDocType={internalDocType} 
      templates={templates} 
      initialRecords={records} 
    />
  );
}
