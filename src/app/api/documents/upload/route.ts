import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';



export async function POST(req: NextRequest) {
 try {
 const formData = await req.formData();
 const file = formData.get('file') as File | null;
 const docType = formData.get('docType') as string;
 const nameEl = formData.get('nameEl') as string;

 if (!file || !docType || !nameEl) {
 return NextResponse.json({ error: 'Ξ›ΞµΞ―Ο€ΞΏΟ…Ξ½ Ο…Ο€ΞΏΟ‡ΟΞµΟ‰Ο„ΞΉΞΊΞ¬ Ο€ΞµΞ΄Ξ―Ξ± (Ξ±ΟΟ‡ΞµΞ―ΞΏ, Ο„ΟΟ€ΞΏΟ‚, ΟΞ½ΞΏΞΌΞ±)' }, { status: 400 });
 }

 // Determine templeId from session
 const session = await getSession();
 const templeId = session?.templeId as string;
 if (!templeId) {
   return NextResponse.json({ error: 'ΞΞ· ΞµΞΎΞΏΟ…ΟƒΞΉΞΏΞ΄ΞΏΟ„Ξ·ΞΌΞ­Ξ½Ξ· Ο€ΟΟΟƒΞ²Ξ±ΟƒΞ·' }, { status: 401 });
 }

 // Read file as text if it's HTML, otherwise read the raw content
 const isHtml = file.name.endsWith('.html') || file.type === 'text/html';
 let htmlContent: string | null = null;
 let fileUrl: string | null = null;

 if (isHtml) {
 // Store HTML directly in DB β€” survives Railway deploys!
 htmlContent = await file.text();
 } else {
 // For .docx β€” store filename reference (legacy support)
 fileUrl = `template_${docType.toLowerCase()}_${Date.now()}.docx`;
 // Note: .docx on Railway filesystem is ephemeral β€” HTML templates are preferred
 }

 // Check if a template of this docType already exists for this temple, update if so
 const existing = await prisma.docTemplate.findFirst({
 where: { templeId, docType }
 });

 let template;
 if (existing) {
 template = await prisma.docTemplate.update({
 where: { id: existing.id },
 data: { nameEl, htmlContent, fileUrl }
 });
 } else {
 template = await prisma.docTemplate.create({
 data: {
 templeId,
 docType,
 nameEl,
 htmlContent,
 fileUrl,
 }
 });
 }

 return NextResponse.json({ success: true, template });
 } catch (err: any) {
 console.error('[upload] Error:', err);
 return NextResponse.json({ error: err.message }, { status: 500 });
 }
}
