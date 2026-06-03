'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getCurrentTempleId } from './core'
import { requireAuth } from '@/lib/requireAuth'

export interface ImportedParishioner {
 firstName: string
 lastName: string
 fathersName?: string
 email?: string
 phone?: string
 address?: string
 city?: string
 afm?: string
}

export interface ImportResult {
 created: number
 skipped: number
 errors: { row: number; reason: string }[]
}

/**
 * Parses a CSV string (with Greek headers) into ImportedParishioner objects.
 * Supports both comma and semicolon delimiters.
 */
export async function parseCSVParishioners(csvContent: string): Promise<ImportedParishioner[]> {
 // [SECURITY MED-7] Reject oversized payloads to prevent DoS
 const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2MB
 if (Buffer.byteLength(csvContent, 'utf8') > MAX_SIZE_BYTES) {
 throw new Error('Το αρχείο CSV υπερβαίνει το μέγιστο επιτρεπτό μέγεθος (2MB).');
 }

 const lines = csvContent.trim().split(/\r?\n/)
 if (lines.length < 2) return []

 // Auto-detect delimiter
 const delimiter = lines[0].includes(';') ? ';' : ','
 const headers = lines[0].split(delimiter).map(h => h.trim().toLowerCase()
 .replace('επώνυμο', 'lastName')
 .replace('επωνυμο', 'lastName')
 .replace('όνομα', 'firstName')
 .replace('ονομα', 'firstName')
 .replace('πατρώνυμο', 'fathersName')
 .replace('πατρωνυμο', 'fathersName')
 .replace('email', 'email')
 .replace('τηλέφωνο', 'phone')
 .replace('τηλεφωνο', 'phone')
 .replace('διεύθυνση', 'address')
 .replace('διευθυνση', 'address')
 .replace('πόλη', 'city')
 .replace('πολη', 'city')
 .replace('αφμ', 'afm')
 .replace('α.φ.μ.', 'afm')
)

 const result: ImportedParishioner[] = []

 for (let i = 1; i < lines.length; i++) {
 const line = lines[i].trim()
 if (!line) continue

 const values = line.split(delimiter).map(v => v.trim().replace(/^"|"$/g, ''))
 const obj: Record<string, string> = {}
 headers.forEach((h, idx) => { obj[h] = values[idx] || '' })

 if (!obj.lastName || !obj.firstName) continue

 result.push({
 firstName: obj.firstName,
 lastName: obj.lastName,
 fathersName: obj.fathersName || undefined,
 email: obj.email || undefined,
 phone: obj.phone || undefined,
 address: obj.address || undefined,
 city: obj.city || undefined,
 afm: obj.afm || undefined,
 })
 }

 return result
}

/**
 * Batch-imports parishioners from the parsed list.
 * Skips duplicates (same email within the temple, or same firstName+lastName if no email).
 */
export async function batchImportParishioners(
 rows: ImportedParishioner[]
): Promise<ImportResult> {
 await requireAuth()
 const templeId = await getCurrentTempleId()

 let created = 0
 let skipped = 0
 const errors: ImportResult['errors'] = []

 for (let i = 0; i < rows.length; i++) {
 const row = rows[i]

 try {
 // Check for duplicate by email (if provided)
 if (row.email) {
 const existing = await prisma.parishioner.findUnique({
 where: { email_templeId: { email: row.email, templeId } }
 })
 if (existing) {
 skipped++
 continue
 }
 }

 await prisma.parishioner.create({
 data: {
 templeId,
 firstName: row.firstName,
 lastName: row.lastName,
 fathersName: row.fathersName || null,
 email: row.email || null,
 phone: row.phone || null,
 address: row.address || null,
 city: row.city || null,
 afm: row.afm || null,
 status: 'active',
 }
 })
 created++
 } catch (e: any) {
 // P2002 = unique constraint violation
 if (e?.code === 'P2002') {
 skipped++
 } else {
 errors.push({ row: i + 2, reason: e?.message || 'Unknown error' })
 }
 }
 }

 revalidatePath('/admin/parishioners')
 return { created, skipped, errors }
}

export async function importParishioners(rows: any[]) {
  const session = await requireAuth();
  const templeId = await getCurrentTempleId();

  let imported = 0;
  let skipped = 0;
  const errors: any[] = [];
  
  // We fetch existing parishioners to check duplicates by firstName + lastName + phone
  const existing = await prisma.parishioner.findMany({
    where: { templeId },
    select: { firstName: true, lastName: true, phone: true }
  });
  
  const existingSet = new Set(
    existing.map(p => `${p.firstName?.trim().toLowerCase()}|${p.lastName?.trim().toLowerCase()}|${p.phone?.trim() || ''}`)
  );

  const toCreate = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row.firstName || !row.lastName) {
      errors.push(`Γραμμή ${i + 1}: Λείπει το όνομα ή το επώνυμο.`);
      skipped++;
      continue;
    }

    const key = `${row.firstName.trim().toLowerCase()}|${row.lastName.trim().toLowerCase()}|${row.phone?.trim() || ''}`;
    if (existingSet.has(key)) {
      skipped++;
      continue;
    }

    // Add to set to prevent duplicates within the import itself
    existingSet.add(key);

    toCreate.push({
      templeId,
      firstName: row.firstName.trim(),
      lastName: row.lastName.trim(),
      fathersName: row.fathersName || null,
      email: row.email || null,
      phone: row.phone || null,
      address: row.address || null,
      city: row.city || null,
      afm: row.afm || null,
      birthDate: row.birthDate ? new Date(row.birthDate) : null,
      status: 'active'
    });
  }

  if (toCreate.length > 0) {
     try {
       const res = await prisma.parishioner.createMany({
         data: toCreate,
         skipDuplicates: true
       });
       imported = res.count;
     } catch(e: any) {
       return { success: false, imported: 0, skipped: rows.length, errors: [e.message] };
     }
  }

  revalidatePath('/admin/parishioners');
  return { success: true, imported, skipped, errors };
}
