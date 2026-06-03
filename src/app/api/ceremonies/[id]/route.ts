import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { 
  CeremonyUpdateSchema, 
  calculateMarriageClass, 
  getRequiredDocuments, 
  MarriageDetailsSchema, 
  BaptismDetailsSchema, 
  FuneralDetailsSchema 
} from '@/lib/ceremonies';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const templeId = session?.templeId;
  if (!templeId) {
    return NextResponse.json({ error: 'Μη εξουσιοδοτημένη πρόσβαση.' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const ceremony = await prisma.ceremony.findFirst({
      where: { id, templeId },
      include: { documents: true }
    });

    if (!ceremony) {
      return NextResponse.json({ error: 'Η τελετή δεν βρέθηκε.' }, { status: 404 });
    }

    return NextResponse.json({ data: ceremony });
  } catch (err: any) {
    console.error('[GET CEREMONY DETAIL ERROR]', err);
    return NextResponse.json({ error: 'Σφάλμα κατά την ανάκτηση της τελετής.' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const templeId = session?.templeId;
  if (!templeId) {
    return NextResponse.json({ error: 'Μη εξουσιοδοτημένη πρόσβαση.' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const parseResult = CeremonyUpdateSchema.safeParse(body);
    if (!parseResult.success) {
      const errorMsg = parseResult.error.issues.map(e => e.message).join(', ');
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { date, priest, status, details } = parseResult.data;

    // 1. Fetch existing ceremony
    const existing = await prisma.ceremony.findFirst({
      where: { id, templeId }
    });

    if (!existing) {
      return NextResponse.json({ error: 'Η τελετή δεν βρέθηκε.' }, { status: 404 });
    }

    // 2. Validate details based on existing type
    let newSubtype = existing.subtype;
    let validatedDetails: any = null;

    if (existing.type === 'MARRIAGE') {
      const detailsParse = MarriageDetailsSchema.safeParse(details);
      if (!detailsParse.success) {
        const errorMsg = detailsParse.error.issues.map(e => e.message).join(', ');
        return NextResponse.json({ error: errorMsg }, { status: 400 });
      }
      validatedDetails = detailsParse.data;
      newSubtype = calculateMarriageClass(validatedDetails.groomPreviousMarriages, validatedDetails.bridePreviousMarriages);
    } else if (existing.type === 'BAPTISM') {
      const detailsParse = BaptismDetailsSchema.safeParse(details);
      if (!detailsParse.success) {
        const errorMsg = detailsParse.error.issues.map(e => e.message).join(', ');
        return NextResponse.json({ error: errorMsg }, { status: 400 });
      }
      validatedDetails = detailsParse.data;
      // In baptism, details object doesn't determine subtype, rather the subtype is defined at creation.
      // But we can let users modify participants.
    } else if (existing.type === 'FUNERAL') {
      const detailsParse = FuneralDetailsSchema.safeParse(details);
      if (!detailsParse.success) {
        const errorMsg = detailsParse.error.issues.map(e => e.message).join(', ');
        return NextResponse.json({ error: errorMsg }, { status: 400 });
      }
      validatedDetails = detailsParse.data;
    }

    const oldYear = new Date(existing.date).getFullYear();
    const newYear = date.getFullYear();

    // 3. Update Ceremony & Sync Documents inside a transaction
    const updated = await prisma.$transaction(async (tx) => {
      let registryNumber = existing.registryNumber;
      let sequenceNumber = existing.sequenceNumber;

      // Recalculate registry sequence if the year changed
      if (oldYear !== newYear) {
        const prefix = existing.type === 'MARRIAGE' ? 'Γ' : existing.type === 'BAPTISM' ? 'Β' : 'Κ';
        const ceremoniesInYear = await tx.ceremony.findMany({
          where: {
            templeId,
            type: existing.type,
            date: {
              gte: new Date(newYear, 0, 1),
              lte: new Date(newYear, 11, 31, 23, 59, 59, 999),
            }
          },
          select: {
            sequenceNumber: true
          }
        });

        const maxSeq = ceremoniesInYear.reduce((max, c) => c.sequenceNumber > max ? c.sequenceNumber : max, 0);
        sequenceNumber = maxSeq + 1;
        registryNumber = `${prefix}-${newYear}-${String(sequenceNumber).padStart(3, '0')}`;
      }

      // Update basic fields
      await tx.ceremony.update({
        where: { id },
        data: {
          date,
          priest,
          status,
          subtype: newSubtype,
          registryNumber,
          sequenceNumber,
          detailsJson: JSON.stringify(validatedDetails)
        }
      });

      // Synchronize documents
      const existingDocs = await tx.ceremonyDocument.findMany({
        where: { ceremonyId: id }
      });
      const requiredDocNames = getRequiredDocuments(existing.type as any, newSubtype, validatedDetails);

      // Delete no longer required
      const docsToDelete = existingDocs.filter(d => !requiredDocNames.includes(d.name));
      if (docsToDelete.length > 0) {
        await tx.ceremonyDocument.deleteMany({
          where: { id: { in: docsToDelete.map(d => d.id) } }
        });
      }

      // Add newly required
      const existingNames = existingDocs.map(d => d.name);
      const docsToAdd = requiredDocNames.filter(name => !existingNames.includes(name));
      if (docsToAdd.length > 0) {
        await tx.ceremonyDocument.createMany({
          data: docsToAdd.map(name => ({
            ceremonyId: id,
            name,
            status: 'PENDING'
          }))
        });
      }

      return tx.ceremony.findUnique({
        where: { id },
        include: { documents: true }
      });
    });

    return NextResponse.json({ data: updated });

  } catch (err: any) {
    console.error('[PUT CEREMONY ERROR]', err);
    return NextResponse.json({ error: 'Σφάλμα κατά την ενημέρωση της τελετής.' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const templeId = session?.templeId;
  if (!templeId) {
    return NextResponse.json({ error: 'Μη εξουσιοδοτημένη πρόσβαση.' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const existing = await prisma.ceremony.findFirst({
      where: { id, templeId }
    });

    if (!existing) {
      return NextResponse.json({ error: 'Η τελετή δεν βρέθηκε.' }, { status: 404 });
    }

    await prisma.ceremony.delete({
      where: { id }
    });

    return NextResponse.json({ data: { success: true } });
  } catch (err: any) {
    console.error('[DELETE CEREMONY ERROR]', err);
    return NextResponse.json({ error: 'Σφάλμα κατά τη διαγραφή της τελετής.' }, { status: 500 });
  }
}
