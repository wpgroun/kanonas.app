import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateAllGamosDocs, generateAllBaptisiDocs, TokenData } from '@/lib/pdfEngine';

export async function POST(req: NextRequest) {
  try {
    const { tokenId } = await req.json();
    if (!tokenId) return NextResponse.json({ error: 'tokenId required' }, { status: 400 });

    const token = await prisma.token.findUnique({
      where: { id: tokenId },
      include: {
        temple: true,
        ceremonyMeta: true,
        persons: true,
      }
    });

    if (!token) return NextResponse.json({ error: 'Token not found' }, { status: 404 });

    const tokenData: TokenData = {
      id: token.id,
      serviceType: token.serviceType,
      customerName: token.customerName || token.customerName || 'Οικογένεια',
      ceremonyDate: token.ceremonyDate,
      assignedPriest: token.assignedPriest,
      assignedPsaltis: token.assignedPsaltis,
      protocolNumber: token.protocolNumber,
      bookNumber: token.bookNumber,
      temple: {
        name: token.temple.name,
        address: token.temple.address,
        settings: token.temple.settings,
      },
      ceremonyMeta: token.ceremonyMeta ? { dataJson: token.ceremonyMeta.dataJson } : null,
      persons: token.persons.map(p => ({
        role: p.role,
        firstName: p.firstName,
        lastName: p.lastName,
        fathersName: p.fathersName,
      })),
    };

    const isGamos = token.serviceType === 'GAMOS';
    const docs = isGamos
      ? await generateAllGamosDocs(tokenData)
      : await generateAllBaptisiDocs(tokenData);

    // Return as JSON array of base64 buffers for the client to download individually
    const result = docs.map(doc => ({
      key: doc.key,
      label: doc.label,
      filename: doc.filename,
      base64: Buffer.from(doc.buffer).toString('base64'),
    }));

    return NextResponse.json({ success: true, docs: result, count: result.length });

  } catch (error: any) {
    console.error('[generate-all] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

