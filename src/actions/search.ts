'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/requireAuth';

export interface SearchResult {
 id: string;
 type: 'PARISHIONER' | 'PROTOCOL' | 'BENEFICIARY' | 'ASSET';
 title: string;
 subtitle?: string;
 url: string;
}

export async function globalAdminSearch(query: string): Promise<{ success: boolean; results?: SearchResult[]; error?: string }> {
 try {
 const session = await requireAuth();
 if (!session || !session.templeId) {
 return { success: false, error: 'Unauthorized' };
 }

 const { templeId } = session;
 const q = query.trim();

 if (q.length < 2) {
 return { success: true, results: [] };
 }

 // Prepare search conditions
 // Parishioners
 const parSearch = prisma.parishioner.findMany({
 where: {
 templeId,
 OR: [
 { firstName: { contains: q } },
 { lastName: { contains: q } },
 { email: { contains: q } },
 { phone: { contains: q } },
 { afm: { contains: q } },
 { idNumber: { contains: q } }
 ]
 },
 take: 5
 });

 // Protocol: Search in subject, sender, receiver
 const protocolSearch = prisma.protocol.findMany({
 where: {
 templeId,
 OR: [
 { subject: { contains: q } },
 { sender: { contains: q } },
 { receiver: { contains: q } }
 ]
 },
 take: 5
 });

 // Beneficiaries: Search in name, phone
 const benSearch = prisma.beneficiary.findMany({
 where: {
 templeId,
 OR: [
 { firstName: { contains: q } },
 { lastName: { contains: q } },
 { phone: { contains: q } }
 ]
 },
 take: 5
 });

 // Assets: Search in name, description
 const assetSearch = prisma.asset.findMany({
 where: {
 templeId,
 OR: [
 { name: { contains: q } },
 { description: { contains: q } }
 ]
 },
 take: 5
 });

 const [parishioners, protocols, beneficiaries, assets] = await Promise.all([
 parSearch, protocolSearch, benSearch, assetSearch
 ]);

 const results: SearchResult[] = [];

 // Map Parishioners
 parishioners.forEach(p => {
 results.push({
 id: p.id,
 type: 'PARISHIONER',
 title: `${p.lastName} ${p.firstName}`,
 subtitle: [p.phone, p.email, p.afm].filter(Boolean).join(' • '),
 url: `/admin/parishioners/${p.id}`
 });
 });

 // Map Protocols
 protocols.forEach(p => {
 results.push({
 id: p.id,
 type: 'PROTOCOL',
 title: `Πρωτόκολλο ${p.number}/${p.year}: ${p.subject}`,
 subtitle: p.direction === 'IN' ? `Από: ${p.sender}` : `Προς: ${p.receiver}`,
 url: `/admin/protocol` // The protocol view is single-page right now or expandable
 });
 });

 // Map Beneficiaries
 beneficiaries.forEach(b => {
 results.push({
 id: b.id,
 type: 'BENEFICIARY',
 title: `${b.lastName} ${b.firstName}`,
 subtitle: `Συσσίτιο (Τηλ: ${b.phone || '-'})`,
 url: `/admin/philanthropy/beneficiaries`
 });
 });

 // Map Assets
 assets.forEach(a => {
 results.push({
 id: a.id,
 type: 'ASSET',
 title: a.name,
 subtitle: a.category,
 url: `/admin/assets`
 });
 });

 return { success: true, results };
 } catch (error: any) {
 console.error('Global Search Error:', error);
 return { success: false, error: error.message };
 }
}
