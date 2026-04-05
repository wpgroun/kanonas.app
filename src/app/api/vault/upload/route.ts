import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const parishionerId = formData.get('parishionerId') as string | null;
    const tokenId = formData.get('tokenId') as string | null;
    const docType = formData.get('docType') as string;
    const label = formData.get('label') as string;

    const session = await getSession();
    if (!session || !session.templeId) {
      return NextResponse.json({ error: 'Unauthorized. Login required.' }, { status: 401 });
    }
    const templeId = session.templeId;

    if (!file) {
      return NextResponse.json({ error: 'Missing required file' }, { status: 400 });
    }

    const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Μη επιτρεπτός τύπος αρχείου. Δεχόμαστε μόνο PDF, JPG, PNG, WEBP.' }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Το αρχείο υπερβαίνει το μέγιστο όριο των 10MB.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Create base path if it doesn't exist
    const baseUploadDir = path.join(process.cwd(), 'public', 'uploads', templeId);
    if (!fs.existsSync(baseUploadDir)) {
      fs.mkdirSync(baseUploadDir, { recursive: true });
    }

    // [SECURITY MED-5] Strict filename sanitization:
    // - Strip leading dots/dashes to prevent .htaccess, .env etc.
    // - Whitelist only safe characters
    // - Block dangerous extensions regardless of MIME type
    const DANGEROUS_EXTENSIONS = /\.(html|htm|php|phtml|php3|php4|php5|js|jsx|ts|tsx|sh|bash|exe|bat|cmd|py|rb)$/i;
    const originalName = file.name.replace(/^[.\-]+/, ''); // strip leading dots/dashes
    if (DANGEROUS_EXTENSIONS.test(originalName)) {
      return NextResponse.json({ error: 'Μη επιτρεπτό είδος αρχείου.' }, { status: 400 });
    }
    const safeBasename = originalName.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const safeFilename = `${Date.now()}-${safeBasename}`;
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
        tokenId: tokenId || null,
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

