import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateDocxCertificate } from '@/lib/documentEngine';
import { getSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    // [SECURITY] Require authenticated session
    const session = await getSession();
    if (!session?.templeId) {
      return NextResponse.json({ error: 'Unauthorized. Login required.' }, { status: 401 });
    }

    const { tokenId, templateName } = await req.json();

    if (!tokenId) {
      return NextResponse.json({ error: 'Missing tokenId' }, { status: 400 });
    }

    const token = await prisma.token.findUnique({
      where: { id: tokenId },
      include: {
        persons: true,
      }
    });

    if (!token) {
      return NextResponse.json({ error: 'Μυστήριο δεν βρέθηκε.' }, { status: 404 });
    }

    // [SECURITY] Tenant isolation — ensure the token belongs to the user's temple
    if (token.templeId !== (session.templeId as string)) {
      return NextResponse.json({ error: 'Forbidden: Access denied.' }, { status: 403 });
    }

    // Determine default templates based on sacrament type
    const fallbackTemplate = token.serviceType === 'GAMOS' ? 'default_gamos.docx' : 'default_vaptisi.docx';
    const fileName = templateName || fallbackTemplate;

    try {
      const buf = generateDocxCertificate(token, token.persons, fileName);

      const filenameOutput = `Πιστοποιητικό_${token.serviceType}_${token.protocolNumber || token.id.slice(-6)}.docx`;

      // Return the word file as a download (Buffer → Uint8Array for NextResponse BodyInit compat)
      return new NextResponse(new Uint8Array(buf), {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filenameOutput)}`,
        },
      });
    } catch (docxError: any) {
      console.error('Docxtemplater error:', docxError);
      return NextResponse.json(
        { error: `Σφάλμα προτύπου: Βεβαιωθείτε ότι υπάρχει το αρχείο ${fileName} στο φάκελο public/templates.` },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Error generating document route:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
