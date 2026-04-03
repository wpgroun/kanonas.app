import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const templeId = formData.get('templeId') as string;
    const parishionerId = formData.get('parishionerId') as string | null;
    const docType = formData.get('docType') as string;
    const label = formData.get('label') as string;

    if (!file || !templeId) {
      return NextResponse.json({ error: 'Missing required file or templeId' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Create base path if it doesn't exist
    const baseUploadDir = path.join(process.cwd(), 'public', 'uploads', templeId);
    if (!fs.existsSync(baseUploadDir)) {
      fs.mkdirSync(baseUploadDir, { recursive: true });
    }

    // Sanitize filename and create unique path
    const safeFilename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-]/g, '_')}`;
    const filePath = path.join(baseUploadDir, safeFilename);

    // Write file to local storage (In prod, use S3/Supabase Storage)
    fs.writeFileSync(filePath, buffer);

    // Public URL
    const storageUrl = `/uploads/${templeId}/${safeFilename}`;

    // Save to VaultDocument
    const vaultDoc = await prisma.vaultDocument.create({
      data: {
        templeId,
        parishionerId: parishionerId || null,
        docType: docType || 'OTHER',
        label: label || 'Ανέβασμα Αρχείου',
        fileName: file.name,
        filePath: storageUrl,
        fileSize: buffer.length,
        mimeType: file.type
      }
    });

    return NextResponse.json({ success: true, document: vaultDoc }, { status: 201 });
  } catch (err: any) {
    console.error('Vault Upload Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
