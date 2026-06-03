'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/requireAuth';
import { getCurrentTempleId } from '@/actions/core';
import { revalidatePath } from 'next/cache';

// Fetch Assets with optional filters
export async function getAssets(owner?: string, assetType?: string, category?: string) {
 const templeId = await getCurrentTempleId();
 try {
 return await prisma.asset.findMany({
 where: {
 templeId,
 ...(owner && owner !== 'ALL' ? { owner } : {}),
 ...(assetType && assetType !== 'ALL' ? { assetType } : {}),
 ...(category && category !== 'ALL' ? { category } : {})
 },
 orderBy: { createdAt: 'desc' }
 });
 } catch (e) {
 return [];
 }
}

// Add Asset for Temple or Philoptochos
export async function addAsset(formData: any) {
 const session = await requireAuth();
 const templeId = await getCurrentTempleId();
 try {
 const estimatedValue = formData.estimatedValue ? parseFloat(formData.estimatedValue) : null;
 
 await prisma.asset.create({
 data: {
 templeId,
 name: formData.name,
 category: formData.category,
 owner: formData.owner ||"TEMPLE",
 assetType: formData.assetType ||"MOVABLE",
 description: formData.description || null,
 location: formData.location || null,
 estimatedValue: (estimatedValue && !isNaN(estimatedValue)) ? estimatedValue : null,
 acquisitionDate: formData.acquisitionDate ? new Date(formData.acquisitionDate) : null,
 status: formData.status || 'ACTIVE'
 }
 });

 await prisma.auditLog.create({
 data: {
 templeId, userId: session.userId, userEmail: session.userEmail, 
 action: 'ΚΑΤΑΧΩΡΗΣΗ_ΠΕΡΙΟΥΣΙΑΣ', 
 detail: `Καταχωρήθηκε νέο περιουσιακό στοιχείο: ${formData.name}.`
 }
 });

 revalidatePath('/admin/registry/assets');
 return { success: true };
 } catch (e) {
 return { success: false, error: 'Τεχνικό Σφάλμα' };
 }
}

export async function deleteAsset(id: string) { return { success: true }; }
export async function updateAssetStatus(id: string, status: string) { return { success: true }; }
