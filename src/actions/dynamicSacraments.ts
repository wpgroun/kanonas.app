'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getCurrentTempleId } from './core'
import { requireAuth } from '@/lib/requireAuth'
import { randomBytes } from 'crypto'

export async function saveDynamicSacrament({ recordType, primaryName, jsonData }: { recordType: string, primaryName: string, jsonData: any }) {
  await requireAuth();
  const templeId = await getCurrentTempleId();
  const randomHash = randomBytes(32).toString('hex');
  
  try {
    const token = await prisma.token.create({
      data: {
        templeId,
        tokenStr: randomHash,
        serviceType: recordType,
        status: "docs_generated", // Meaning it's an internal entry ready for print
        customerName: primaryName,
        ceremonyDate: new Date(), 
        submissionComplete: true,
        ceremonyMeta: {
          create: {
            dataJson: JSON.stringify(jsonData)
          }
        }
      }
    });

    revalidatePath(`/admin/sacraments`);
    return { success: true, tokenId: token.id }
  } catch(e: any) {
    console.error("Dynamic Sacrament Error", e);
    return { success: false, error: e.message }
  }
}
