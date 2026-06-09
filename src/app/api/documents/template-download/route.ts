import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    const templeId = session?.templeId as string;
    if (!templeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const templateId = searchParams.get('id');
    if (!templateId) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const template = await prisma.docTemplate.findFirst({
      where: { id: templateId, templeId },
    });
    if (!template) {
      return NextResponse.json({ error: 'Δεν βρέθηκε το πρότυπο' }, { status: 404 });
    }

    let fileBuffer: Buffer | null = null;
    let filename = template.fileUrl || `template_${template.docType}.docx`;

    if (template.fileData) {
      fileBuffer = Buffer.from(template.fileData, 'base64');
    } else if (template.fileUrl) {
      const filePath = path.join(process.cwd(), 'public', template.fileUrl);
      if (fs.existsSync(filePath)) {
        fileBuffer = fs.readFileSync(filePath);
      }
    }

    if (!fileBuffer) {
      return NextResponse.json({ error: 'Το αρχείο δεν βρέθηκε (ίσως διαγράφηκε από το filesystem)' }, { status: 404 });
    }

    const ext = (filename.split('.').pop() || 'docx').toLowerCase();
    const mime = ext === 'docx'
      ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      : ext === 'pdf'
      ? 'application/pdf'
      : 'application/octet-stream';

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': mime,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
      },
    });
  } catch (err: any) {
    logger.error('[template-download] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
