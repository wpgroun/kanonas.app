'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/requireAuth';
import { getCurrentTempleId } from '@/actions/core';
import { revalidatePath } from 'next/cache';

export async function toggleModule(moduleLabel: string, enabled: boolean) {
 const session = await requireAuth();
 const templeId = await getCurrentTempleId();
 
 if (!session.isHeadPriest && !session.isSuperAdmin) {
 return { success: false, error: 'Μόνο ο προϊστάμενος μπορεί να απενεργοποιήσει λειτουργίες' };
 }

 try {
 const temple = await prisma.temple.findUnique({ where: { id: templeId } });
 if (!temple) throw new Error("Temple not found");

 let settings: Record<string, any> = {};
 try {
 settings = JSON.parse(temple.settings ||"{}");
 } catch(e) {}

 let disabledModules: string[] = settings.disabledModules || [];

 if (!enabled) {
 if (!disabledModules.includes(moduleLabel)) disabledModules.push(moduleLabel);
 } else {
 disabledModules = disabledModules.filter(m => m !== moduleLabel);
 }

 settings.disabledModules = disabledModules;

 await prisma.temple.update({
 where: { id: templeId },
 data: { settings: JSON.stringify(settings) }
 });

 revalidatePath('/admin', 'layout');
 revalidatePath('/admin/modules');

 return { success: true };
 } catch(e: any) {
 return { success: false, error: 'Αποτυχία ενημέρωσης: ' + e.message };
 }
}
