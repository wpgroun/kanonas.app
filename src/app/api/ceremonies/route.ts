import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { 


  CeremonyCreateSchema, 
  calculateMarriageClass, 
  getRequiredDocuments, 
  MarriageDetailsSchema, 
  BaptismDetailsSchema, 
  FuneralDetailsSchema 
} from '@/lib/ceremonies';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const session = await getSession();
  const templeId = session?.templeId;
  if (!templeId) {
    return NextResponse.json({ error: 'ΞΞ· ΞµΞΎΞΏΟ…ΟƒΞΉΞΏΞ΄ΞΏΟ„Ξ·ΞΌΞ­Ξ½Ξ· Ο€ΟΟΟƒΞ²Ξ±ΟƒΞ·.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); // "MARRIAGE" | "BAPTISM" | "FUNERAL"
    const status = searchParams.get('status'); // "PENDING" | "COMPLETED" | "CANCELLED"
    const yearStr = searchParams.get('year');
    const search = searchParams.get('search');

    const whereClause: any = {
      templeId,
    };

    if (type) {
      whereClause.type = type;
    }
    if (status) {
      whereClause.status = status;
    }
    if (yearStr) {
      const year = parseInt(yearStr);
      if (!isNaN(year)) {
        whereClause.date = {
          gte: new Date(year, 0, 1),
          lte: new Date(year, 11, 31, 23, 59, 59, 999),
        };
      }
    }

    if (search && search.trim() !== '') {
      whereClause.OR = [
        { priest: { contains: search, mode: 'insensitive' } },
        { detailsJson: { contains: search, mode: 'insensitive' } },
        { registryNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    const ceremonies = await prisma.ceremony.findMany({
      where: whereClause,
      include: {
        documents: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    return NextResponse.json({ data: ceremonies });
  } catch (err: any) {
    console.error('[GET CEREMONIES ERROR]', err);
    return NextResponse.json({ error: 'Ξ£Ο†Ξ¬Ξ»ΞΌΞ± ΞΊΞ±Ο„Ξ¬ Ο„Ξ·Ξ½ Ξ±Ξ½Ξ¬ΞΊΟ„Ξ·ΟƒΞ· Ο„Ο‰Ξ½ Ο„ΞµΞ»ΞµΟ„ΟΞ½.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getSession();
  const templeId = session?.templeId;
  if (!templeId) {
    return NextResponse.json({ error: 'ΞΞ· ΞµΞΎΞΏΟ…ΟƒΞΉΞΏΞ΄ΞΏΟ„Ξ·ΞΌΞ­Ξ½Ξ· Ο€ΟΟΟƒΞ²Ξ±ΟƒΞ·.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    
    // 1. Zod parse basic ceremony data
    const parseResult = CeremonyCreateSchema.safeParse(body);
    if (!parseResult.success) {
      const errorMsg = parseResult.error.issues.map(e => e.message).join(', ');
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { type, subtype: initialSubtype, date, priest, details } = parseResult.data;

    // 2. Validate details based on type
    let finalSubtype = initialSubtype;
    let validatedDetails: any = null;

    if (type === 'MARRIAGE') {
      const detailsParse = MarriageDetailsSchema.safeParse(details);
      if (!detailsParse.success) {
        const errorMsg = detailsParse.error.issues.map(e => e.message).join(', ');
        return NextResponse.json({ error: errorMsg }, { status: 400 });
      }
      validatedDetails = detailsParse.data;
      // Auto-calculate Marriage class
      finalSubtype = calculateMarriageClass(validatedDetails.groomPreviousMarriages, validatedDetails.bridePreviousMarriages);
    } else if (type === 'BAPTISM') {
      const detailsParse = BaptismDetailsSchema.safeParse(details);
      if (!detailsParse.success) {
        const errorMsg = detailsParse.error.issues.map(e => e.message).join(', ');
        return NextResponse.json({ error: errorMsg }, { status: 400 });
      }
      validatedDetails = detailsParse.data;
    } else if (type === 'FUNERAL') {
      const detailsParse = FuneralDetailsSchema.safeParse(details);
      if (!detailsParse.success) {
        const errorMsg = detailsParse.error.issues.map(e => e.message).join(', ');
        return NextResponse.json({ error: errorMsg }, { status: 400 });
      }
      validatedDetails = detailsParse.data;
      finalSubtype = 'STANDARD';
    }

    const year = date.getFullYear();
    const prefix = type === 'MARRIAGE' ? 'Ξ“' : type === 'BAPTISM' ? 'Ξ’' : 'Ξ';

    // 3. Perform Transaction
    const result = await prisma.$transaction(async (tx) => {
      // Find max sequence number for this temple, type and year
      const ceremoniesInYear = await tx.ceremony.findMany({
        where: {
          templeId,
          type,
          date: {
            gte: new Date(year, 0, 1),
            lte: new Date(year, 11, 31, 23, 59, 59, 999),
          }
        },
        select: {
          sequenceNumber: true
        }
      });

      const maxSeq = ceremoniesInYear.reduce((max, c) => c.sequenceNumber > max ? c.sequenceNumber : max, 0);
      const nextSeq = maxSeq + 1;
      const registryNumber = `${prefix}-${year}-${String(nextSeq).padStart(3, '0')}`;

      // Create Ceremony
      const ceremony = await tx.ceremony.create({
        data: {
          templeId,
          type,
          subtype: finalSubtype,
          date,
          priest,
          registryNumber,
          sequenceNumber: nextSeq,
          detailsJson: JSON.stringify(validatedDetails),
          status: 'PENDING',
        }
      });

      // Get required documents list
      const requiredDocs = getRequiredDocuments(type, finalSubtype, validatedDetails);

      // Create documents
      if (requiredDocs.length > 0) {
        await tx.ceremonyDocument.createMany({
          data: requiredDocs.map(name => ({
            ceremonyId: ceremony.id,
            name,
            status: 'PENDING',
          }))
        });
      }

      // Return ceremony with documents
      return tx.ceremony.findUnique({
        where: { id: ceremony.id },
        include: { documents: true }
      });
    });

    return NextResponse.json({ data: result }, { status: 201 });

  } catch (err: any) {
    console.error('[POST CEREMONY ERROR]', err);
    return NextResponse.json({ error: 'Ξ£Ο†Ξ¬Ξ»ΞΌΞ± ΞΊΞ±Ο„Ξ¬ Ο„Ξ· Ξ΄Ξ·ΞΌΞΉΞΏΟ…ΟΞ³Ξ―Ξ± Ο„Ξ·Ο‚ Ο„ΞµΞ»ΞµΟ„Ξ®Ο‚.' }, { status: 500 });
  }
}
