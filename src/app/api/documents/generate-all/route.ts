import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateAllGamosDocs, generateAllBaptisiDocs, TokenData } from '@/lib/pdfEngine';
import { getSession } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
 try {
 // [SECURITY] Require authenticated session
 const session = await getSession();
 if (!session?.templeId) {
 return NextResponse.json({ error: 'Unauthorized. Login required.' }, { status: 401 });
 }

 const { tokenId } = await req.json();
 if (!tokenId) return NextResponse.json({ error: 'tokenId required' }, { status: 400 });

 const token = await prisma.token.findUnique({
 where: { id: tokenId },
 include: { temple: true, ceremonyMeta: true, persons: true }
 });

 if (!token) return NextResponse.json({ error: 'Token not found' }, { status: 404 });

 // [SECURITY] Tenant isolation — token must belong to the authenticated user's temple
 if (token.templeId !== (session.templeId as string)) {
 return NextResponse.json({ error: 'Forbidden: Access denied.' }, { status: 403 });
 }

 const customTemplates = await prisma.docTemplate.findMany({
 where: { templeId: token.templeId }
 });

 const tokenData: TokenData = {
 id: token.id,
 serviceType: token.serviceType,
 customerName: token.customerName || 'Οικογένεια',
 ceremonyDate: token.ceremonyDate,
 assignedPriest: token.assignedPriest,
 assignedPsaltis: token.assignedPsaltis,
 protocolNumber: token.protocolNumber,
 bookNumber: token.bookNumber,
 temple: { name: token.temple.name, address: token.temple.address, settings: token.temple.settings },
 ceremonyMeta: token.ceremonyMeta ? { dataJson: token.ceremonyMeta.dataJson } : null,
 persons: token.persons.map(p => ({ role: p.role, firstName: p.firstName, lastName: p.lastName, fathersName: p.fathersName })),
 customTemplates: customTemplates.map(t => ({ docType: t.docType, nameEl: t.nameEl, htmlContent: t.htmlContent })),
 };

 const isGamos = token.serviceType === 'GAMOS';
 const docs = isGamos ? await generateAllGamosDocs(tokenData) : await generateAllBaptisiDocs(tokenData);

 const result = [];
 for (const doc of docs) {
 // Persist to File System
 const baseDir = path.join(process.cwd(), 'public', 'docs', token.templeId);
 if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true });
 
 const safeFilename = `${Date.now()}-${doc.filename.replace(/[^a-zA-Z0-9.\-]/g, '_')}`;
 const filePath = path.join(baseDir, safeFilename);
 fs.writeFileSync(filePath, Buffer.from(doc.buffer));
 
 const storagePath = `/docs/${token.templeId}/${safeFilename}`;

 // Persist to Database Object
 await prisma.document.create({
 data: {
 templeId: token.templeId,
 tokenId: token.id,
 docType: doc.key,
 fileName: doc.label,
 storagePath: storagePath
 }
 });

 result.push({
 key: doc.key,
 label: doc.label,
 filename: doc.filename,
 base64: Buffer.from(doc.buffer).toString('base64'),
 storagePath
 });
 }

 return NextResponse.json({ success: true, docs: result, count: result.length });

 } catch (error: any) {
 console.error('[generate-all] Error:', error);
 return NextResponse.json({ error: error.message }, { status: 500 });
 }
}
