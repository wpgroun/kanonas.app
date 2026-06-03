import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { DocumentStatusUpdateSchema } from '@/lib/ceremonies';

export const dynamic = 'force-dynamic';

export async function PUT(req: Request, { params }: { params: Promise<{ documentId: string }> }) {
  const session = await getSession();
  const templeId = session?.templeId;
  if (!templeId) {
    return NextResponse.json({ error: 'Μη εξουσιοδοτημένη πρόσβαση.' }, { status: 401 });
  }

  const { documentId } = await params;

  try {
    const body = await req.json();

    // 1. Zod validation
    const parseResult = DocumentStatusUpdateSchema.safeParse(body);
    if (!parseResult.success) {
      const errorMsg = parseResult.error.issues.map(e => e.message).join(', ');
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { status, rejectionReason } = parseResult.data;

    // 2. Fetch and verify document owner (tenant isolation check)
    const doc = await prisma.ceremonyDocument.findFirst({
      where: {
        id: documentId,
        ceremony: {
          templeId
        }
      }
    });

    if (!doc) {
      return NextResponse.json({ error: 'Το έγγραφο δεν βρέθηκε.' }, { status: 404 });
    }

    // 3. Update document status
    const updated = await prisma.ceremonyDocument.update({
      where: { id: documentId },
      data: {
        status,
        rejectionReason: status === 'NOT_REQUIRED' ? rejectionReason : null
      }
    });

    return NextResponse.json({ data: updated });
  } catch (err: any) {
    console.error('[PUT CEREMONY DOCUMENT STATUS ERROR]', err);
    return NextResponse.json({ error: 'Σφάλμα κατά την ενημέρωση της κατάστασης του εγγράφου.' }, { status: 500 });
  }
}
