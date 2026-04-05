'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/requireAuth';
import { getCurrentTempleId } from '@/actions/core';

export async function getTempleSettings() {
 const templeId = await getCurrentTempleId();
 
 const temple = await prisma.temple.findUnique({
 where: { id: templeId },
 include: { metropolis: true }
 });

 if (!temple) throw new Error("Temple not found");

 // Parse JSON settings safely
 let parsedSettings = {};
 try {
 if (temple.settings) {
 parsedSettings = JSON.parse(temple.settings);
 }
 } catch (e) {
 parsedSettings = {};
 }

 return {
 id: temple.id,
 name: temple.name,
 metropolisName: temple.metropolis?.name || '',
 slug: temple.slug || '',
 taxId: temple.taxId || '',
 phoneNumber: temple.phoneNumber || '',
 address: temple.address || '',
 city: temple.city || '',
 email: temple.email || '',
 settings: parsedSettings
 };
}

export async function updateTempleSettings(data: {
 name: string;
 slug?: string;
 taxId?: string;
 phoneNumber?: string;
 address?: string;
 city?: string;
 email?: string;
 settings: any;
}) {
 const session = await requireAuth();
 const templeId = await getCurrentTempleId();

 try {
 // If slug is provided, verify it is unique to avoid Prisma unique constraint failures
 if (data.slug) {
 const existingSlug = await prisma.temple.findFirst({
 where: { slug: data.slug, id: { not: templeId } }
 });
 if (existingSlug) {
 return { success: false, error: 'Το αναγνωριστικό SEO (slug) χρησιμοποιείται ήδη.' };
 }
 }

 const updated = await prisma.temple.update({
 where: { id: templeId },
 data: {
 name: data.name,
 slug: data.slug || null,
 taxId: data.taxId,
 phoneNumber: data.phoneNumber,
 address: data.address,
 city: data.city,
 email: data.email,
 settings: JSON.stringify(data.settings)
 }
 });

 await prisma.auditLog.create({
 data: {
 templeId,
 userId: session.userId,
 userEmail: session.userEmail,
 action: 'UPDATE_SETTINGS',
 detail: 'Ενημερώθηκαν οι Κεντρικές Ρυθμίσεις (Settings & Integrations) του Ναού.'
 }
 });

 return { success: true };
 } catch (e: any) {
 return { success: false, error: e.message || 'Αποτυχία ενημέρωσης ρυθμίσεων.' };
 }
}

export const saveTempleSettings = updateTempleSettings;
