import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const docType = formData.get('docType') as string;
    const nameEl = formData.get('nameEl') as string;
    const context = formData.get('context') as string | null;

    if (!file || !docType || !nameEl) {
      return NextResponse.json({ error: 'Missing required fields (file, docType, nameEl)' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const filename = `${docType.toLowerCase()}_${Date.now()}.docx`;
    const uploadDir = path.resolve(process.cwd(), 'public', 'templates');
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filepath = path.join(uploadDir, filename);
    fs.writeFileSync(filepath, buffer);

    // Upsert or Create logic could go here. For now we just create a new template record.
    const template = await prisma.docTemplate.create({
      data: {
        docType,
        nameEl,
        context,
        fileUrl: filename,
      }
    });

    return NextResponse.json({ success: true, template });
  } catch (err: any) {
    console.error('Upload Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
