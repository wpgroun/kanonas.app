'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/requireAuth';
import { getCurrentTempleId } from '@/actions/core';
import { revalidatePath } from 'next/cache';
import fs from 'fs/promises';
import path from 'path';

// Get paginated/filtered protocols
export async function getProtocols(owner: string = 'TEMPLE', page: number = 1, searchQuery?: string) {
 const templeId = await getCurrentTempleId();
 const limit = 50;
 try {
 const protocols = await prisma.protocol.findMany({
 where: {
 templeId,
 owner,
 ...(searchQuery ? {
 OR: [
 { subject: { contains: searchQuery, mode: 'insensitive' } },
 { sender: { contains: searchQuery, mode: 'insensitive' } },
 { receiver: { contains: searchQuery, mode: 'insensitive' } }
 ]
 } : {})
 },
 orderBy: [{ year: 'desc' }, { number: 'desc' }],
 take: limit,
 skip: (page - 1) * limit
 });
 
 const total = await prisma.protocol.count({ where: { templeId, owner } });
 return { success: true, data: protocols, total, pages: Math.ceil(total / limit) };
 } catch (e) {
 return { success: false, error: 'Σφάλμα ανάκτησης πρωτοκόλλου.' };
 }
}

// Add a new Protocol Entry (Auto-increment per Owner and Year!)
export async function addProtocolEntry(formData: FormData) {
 const session = await requireAuth();
 const templeId = await getCurrentTempleId();
 
 try {
 const owner = formData.get('owner') as string || 'TEMPLE';
 const direction = formData.get('direction') as string || 'IN';
 const subject = formData.get('subject') as string;
 const sender = formData.get('sender') as string;
 const receiver = formData.get('receiver') as string;
 const dateStr = formData.get('date') as string;
 const dateObj = dateStr ? new Date(dateStr) : new Date();
 const year = dateObj.getFullYear();

 // Determine the next number automatically!
 const highestRecord = await prisma.protocol.findFirst({
 where: { templeId, owner, year },
 orderBy: { number: 'desc' }
 });
 const nextNumber = highestRecord ? highestRecord.number + 1 : 1;

 // Handle Scanner file attachment
 let fileUrl = null;
 let fileName = null;
 const docFile = formData.get('document') as File | null;
 if (docFile && docFile.name && docFile.size > 0) {
 const arrayBuffer = await docFile.arrayBuffer();
 const buffer = Buffer.from(arrayBuffer);
 const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'protocol');
 try { await fs.mkdir(uploadDir, { recursive: true }); } catch(e) {}
 const safeName = docFile.name.replace(/[^a-zA-Z0-9_\.-]/g, '_');
 const internalFilename = `${Date.now()}-${safeName}`;
 await fs.writeFile(path.join(uploadDir, internalFilename), buffer);
 fileUrl = `/uploads/protocol/${internalFilename}`;
 fileName = safeName;
 }

 const newProtocol = await prisma.protocol.create({
 data: {
 templeId,
 owner,
 year,
 number: nextNumber,
 direction,
 subject,
 sender: sender || null,
 receiver: receiver || null,
 date: dateObj,
 fileUrl,
 fileName
 }
 });

 await prisma.auditLog.create({
 data: {
 templeId, userId: session.userId, userEmail: session.userEmail,
 action: `ΠΡΩΤΟΚΟΛΛΟ_${direction}`,
 detail: `Νέο έγγραφο Αρ. Πρωτ: ${nextNumber}/${year} (${owner}).`
 }
 });

 revalidatePath('/admin/protocol');
 return { success: true, protocolNumber: `${nextNumber}/${year}` };
 } catch (e: any) {
 return { success: false, error: e.message || 'Αποτυχία Καταχώρησης' };
 }
}
