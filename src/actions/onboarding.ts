'use server'

import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// Step 1: Create or find Metropolis
export async function findOrCreateMetropolis(name: string) {
 // @ts-ignore
 let metro = await prisma.metropolis.findFirst({ where: { name } })
 if (!metro) {
 // @ts-ignore
 metro = await prisma.metropolis.create({ data: { name } })
 }
 return metro
}

// Get all metropolises for the dropdown
export async function getMetropolisList() {
 // @ts-ignore
 return prisma.metropolis.findMany({ orderBy: { name: 'asc' } })
}

function generateSlug(text: string): string {
  const translit: Record<string, string> = {
    'α': 'a', 'ά': 'a', 'β': 'v', 'γ': 'g', 'δ': 'd', 'ε': 'e', 'έ': 'e', 'ζ': 'z',
    'η': 'i', 'ή': 'i', 'θ': 'th', 'ι': 'i', 'ί': 'i', 'ϊ': 'i', 'ΐ': 'i', 'κ': 'k',
    'λ': 'l', 'μ': 'm', 'ν': 'n', 'ξ': 'x', 'ο': 'o', 'ό': 'o', 'π': 'p', 'ρ': 'r',
    'σ': 's', 'ς': 's', 'τ': 't', 'υ': 'y', 'ύ': 'y', 'ϋ': 'y', 'ΰ': 'y', 'φ': 'f',
    'χ': 'ch', 'ψ': 'ps', 'ω': 'o', 'ώ': 'o',
    'Α': 'a', 'Ά': 'a', 'Β': 'v', 'Γ': 'g', 'Δ': 'd', 'Ε': 'e', 'Έ': 'e', 'Ζ': 'z',
    'Η': 'i', 'Ή': 'i', 'Θ': 'th', 'Ι': 'i', 'Ί': 'i', 'Ϊ': 'i', 'Κ': 'k',
    'Λ': 'l', 'Μ': 'm', 'Ν': 'n', 'Ξ': 'x', 'Ο': 'o', 'Ό': 'o', 'Π': 'p', 'Ρ': 'r',
    'Σ': 's', 'Τ': 't', 'Υ': 'y', 'Ύ': 'y', 'Ϋ': 'y', 'Φ': 'f',
    'Χ': 'ch', 'Ψ': 'ps', 'Ω': 'o', 'Ώ': 'o'
  };

  let res = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    res += translit[char] || char.toLowerCase();
  }

  return res
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Step 2: Create Temple
export async function createTemple(data: {
 name: string
 city?: string
 address?: string
 email?: string
 metropolisId: string
}) {
  const baseSlug = generateSlug(data.name);
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  const uniqueSlug = `${baseSlug}-${randomSuffix}`;

  // @ts-ignore
  const temple = await prisma.temple.create({
  data: {
  name: data.name,
  city: data.city || null,
  address: data.address || null,
  email: data.email || null,
  metropolisId: data.metropolisId,
  slug: uniqueSlug
  },
  })
  return temple
}

// Step 3: Create first priest (user) and link to temple
export async function createPriestAndLink(data: {
 email: string
 firstName: string
 lastName: string
 password: string
 templeId: string
}) {
 const passwordHash = await bcrypt.hash(data.password, 10)

 // @ts-ignore
 const user = await prisma.user.create({
 data: {
 email: data.email,
 firstName: data.firstName,
 lastName: data.lastName,
 passwordHash,
 isSuperAdmin: false,
 temples: {
 create: {
 templeId: data.templeId,
 isHeadPriest: true,
 status: 'active',
 },
 },
 },
 })

 return user
}

// Step 4: Create default roles for the temple
export async function createDefaultRoles(templeId: string) {
 const defaultRoles = [
 {
 name: 'Εφημέριος',
 canManageRequests: true,
 canManageRegistry: true,
 canManageSchedule: true,
 canViewFinances: false,
 canEditFinances: false,
 canManageAssets: false,
 },
 {
 name: 'Γραμματεία',
 canManageRequests: true,
 canManageRegistry: true,
 canManageSchedule: true,
 canViewFinances: false,
 canEditFinances: false,
 canManageAssets: false,
 },
 {
 name: 'Συμβούλιο / Ταμίας',
 canManageRequests: false,
 canManageRegistry: false,
 canManageSchedule: false,
 canViewFinances: true,
 canEditFinances: true,
 canManageAssets: true,
 },
 ]

 for (const role of defaultRoles) {
 // @ts-ignore
 await prisma.role.upsert({
 where: { templeId_name: { templeId, name: role.name } },
 update: {},
 create: { templeId, ...role },
 })
 }

 return true
}

// Step 5: Create default document templates
export async function createDefaultTemplates(templeId: string) {
 const templates = [
 { docType: 'GAMOS', nameEl: 'Αίτηση Τέλεσης Γάμου' },
 { docType: 'VAPTISI', nameEl: 'Αίτηση Τέλεσης Βάπτισης' },
 { docType: 'KIDEIA', nameEl: 'Αίτηση Τέλεσης Κηδείας' },
 { docType: 'MNIMOSINO', nameEl: 'Αίτηση Τέλεσης Μνημοσύνου' },
 ]

 for (const tpl of templates) {
 // Check if template already exists
 // @ts-ignore
 const exists = await prisma.docTemplate.findFirst({
 where: { templeId, docType: tpl.docType },
 })
 if (!exists) {
 // @ts-ignore
 await prisma.docTemplate.create({
 data: { templeId, docType: tpl.docType, nameEl: tpl.nameEl },
 })
 }
 }

 return true
}

// Full onboarding in one go
export async function completeOnboarding(data: {
 templeName: string
 city: string
 address: string
 templeEmail: string
 metropolisName: string
 priestFirstName: string
 priestLastName: string
 priestEmail: string
 priestPassword: string
}) {
 try {
 // 1. Metropolis
 const metro = await findOrCreateMetropolis(data.metropolisName)

 // 2. Temple
 const temple = await createTemple({
 name: data.templeName,
 city: data.city,
 address: data.address,
 email: data.templeEmail,
 metropolisId: metro.id,
 })

 // 3. Priest
 await createPriestAndLink({
 email: data.priestEmail,
 firstName: data.priestFirstName,
 lastName: data.priestLastName,
 password: data.priestPassword,
 templeId: temple.id,
 })

 // 4. Default roles
 await createDefaultRoles(temple.id)

 // 5. Default templates
 await createDefaultTemplates(temple.id)

 return { success: true, templeId: temple.id }
 } catch (error: any) {
 return { success: false, error: error.message }
 }
}
