import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { PDFDocument, rgb, PageSizes } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const session = await getSession();
  const templeId = session?.templeId;
  if (!templeId) {
    return NextResponse.json({ error: 'ΞΞ· ΞµΞΎΞΏΟ…ΟƒΞΉΞΏΞ΄ΞΏΟ„Ξ·ΞΌΞ­Ξ½Ξ· Ο€ΟΟΟƒΞ²Ξ±ΟƒΞ·.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'MARRIAGE';
    const yearStr = searchParams.get('year') || String(new Date().getFullYear());
    const search = searchParams.get('search');
    const year = parseInt(yearStr);

    // 1. Fetch temple and metropolis details
    const temple = await prisma.temple.findFirst({
      where: { id: templeId },
      include: { metropolis: true }
    });

    const metropolisName = temple?.metropolis?.name || 'Ξ™ΞµΟΞ¬ ΞΞ·Ο„ΟΟΟ€ΞΏΞ»Ξ·';
    const templeName = temple?.name || 'Ξ™ΞµΟΟΟ‚ ΞΞ±ΟΟ‚';

    // 2. Fetch registry data
    const whereClause: any = {
      templeId,
      type,
      date: {
        gte: new Date(year, 0, 1),
        lte: new Date(year, 11, 31, 23, 59, 59, 999),
      }
    };

    if (search && search.trim() !== '') {
      whereClause.OR = [
        { priest: { contains: search, mode: 'insensitive' } },
        { detailsJson: { contains: search, mode: 'insensitive' } },
        { registryNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    const ceremonies = await prisma.ceremony.findMany({
      where: whereClause,
      orderBy: { sequenceNumber: 'asc' }
    });

    // 3. Generate PDF
    const pdfDoc = await PDFDocument.create();
    
    const regularPath = path.join(process.cwd(), 'public', 'fonts', 'Roboto-Regular.ttf');
    const boldPath = path.join(process.cwd(), 'public', 'fonts', 'Roboto-Bold.ttf');
    const [regularBytes, boldBytes] = await Promise.all([
      fs.readFile(regularPath),
      fs.readFile(boldPath)
    ]);

    pdfDoc.registerFontkit(fontkit);
    const font = await pdfDoc.embedFont(regularBytes);
    const fontBold = await pdfDoc.embedFont(boldBytes);

    const typeLabels: Record<string, string> = {
      MARRIAGE: 'Ξ“Ξ‘ΞΞ©Ξ',
      BAPTISM: 'Ξ’Ξ‘Ξ Ξ¤Ξ™Ξ£Ξ•Ξ©Ξ',
      FUNERAL: 'ΞΞ—Ξ”Ξ•Ξ™Ξ©Ξ'
    };
    const titleText = `ΞΞ—Ξ¤Ξ΅Ξ©Ξ ${typeLabels[type] || 'Ξ¤Ξ•Ξ›Ξ•Ξ¤Ξ©Ξ'} - Ξ•Ξ¤ΞΞ£ ${year}`;

    const itemsPerPage = 15;
    const PAGE_WIDTH = PageSizes.A4[0];
    const PAGE_HEIGHT = PageSizes.A4[1];
    const marginX = 40;

    for (let i = 0; i < ceremonies.length; i += itemsPerPage) {
      const page = pdfDoc.addPage(PageSizes.A4);
      const chunk = ceremonies.slice(i, i + itemsPerPage);

      // Header
      page.drawText(metropolisName, { x: marginX, y: PAGE_HEIGHT - 40, size: 9, font, color: rgb(0.4, 0.4, 0.4) });
      page.drawText(templeName, { x: marginX, y: PAGE_HEIGHT - 54, size: 10, font: fontBold, color: rgb(0.1, 0.1, 0.5) });
      
      const titleWidth = fontBold.widthOfTextAtSize(titleText, 14);
      page.drawText(titleText, { x: (PAGE_WIDTH - titleWidth) / 2, y: PAGE_HEIGHT - 90, size: 14, font: fontBold, color: rgb(0, 0, 0) });

      // Table Header
      let y = PAGE_HEIGHT - 130;
      page.drawLine({ start: { x: marginX, y }, end: { x: PAGE_WIDTH - marginX, y }, thickness: 1, color: rgb(0.2, 0.2, 0.2) });
      y -= 15;

      page.drawText('Ξ‘/Ξ‘ ΞΞ·Ο„ΟΟΞΏΟ…', { x: marginX, y, size: 9, font: fontBold });
      page.drawText('Ξ£Ο„ΞΏΞΉΟ‡ΞµΞ―Ξ± Ξ¤ΞµΞ»ΞµΟ„Ξ®Ο‚', { x: marginX + 90, y, size: 9, font: fontBold });
      page.drawText('Ξ—ΞΌΞµΟΞΏΞΌΞ·Ξ½Ξ―Ξ±', { x: marginX + 280, y, size: 9, font: fontBold });
      page.drawText('Ξ™ΞµΟΞ­Ξ±Ο‚', { x: marginX + 360, y, size: 9, font: fontBold });
      page.drawText('ΞΞ±Ο„Ξ¬ΟƒΟ„Ξ±ΟƒΞ·', { x: PAGE_WIDTH - marginX - 60, y, size: 9, font: fontBold });

      y -= 8;
      page.drawLine({ start: { x: marginX, y }, end: { x: PAGE_WIDTH - marginX, y }, thickness: 0.5, color: rgb(0.5, 0.5, 0.5) });
      y -= 20;

      // Draw rows
      chunk.forEach((c) => {
        const regNum = c.registryNumber || '---';
        const dateStr = new Date(c.date).toLocaleDateString('el-GR');
        const priestStr = c.priest || '---';

        let statusStr = 'Ξ•ΞΊΞΊΟΞµΞΌΞµΞ―';
        if (c.status === 'COMPLETED') statusStr = 'ΞΞ»ΞΏΞΊΞ»Ξ·ΟΟΞΈΞ·ΞΊΞµ';
        if (c.status === 'CANCELLED') statusStr = 'Ξ‘ΞΊΟ…ΟΟΞΈΞ·ΞΊΞµ';

        let detailsText = '';
        try {
          const details = JSON.parse(c.detailsJson || '{}');
          if (c.type === 'MARRIAGE') {
            detailsText = `${details.groomLastName || ''} ${details.groomFirstName || ''} & ${details.brideLastName || ''} ${details.brideFirstName || ''}`;
          } else if (c.type === 'BAPTISM') {
            detailsText = `${details.baptizedLastName || ''} ${details.baptizedFirstName || ''}`;
          } else if (c.type === 'FUNERAL') {
            detailsText = `${details.deceasedLastName || ''} ${details.deceasedFirstName || ''}`;
          }
        } catch {
          detailsText = 'Ξ£Ο†Ξ¬Ξ»ΞΌΞ± Ξ±Ξ½Ξ¬Ξ³Ξ½Ο‰ΟƒΞ·Ο‚ ΟƒΟ„ΞΏΞΉΟ‡ΞµΞ―Ο‰Ξ½';
        }

        // Draw row content
        page.drawText(regNum, { x: marginX, y, size: 9, font });
        page.drawText(detailsText.substring(0, 42), { x: marginX + 90, y, size: 9, font });
        page.drawText(dateStr, { x: marginX + 280, y, size: 9, font });
        page.drawText(priestStr.substring(0, 18), { x: marginX + 360, y, size: 9, font });
        page.drawText(statusStr, { x: PAGE_WIDTH - marginX - 60, y, size: 8, font: fontBold });

        y -= 25;
      });

      // Page footer
      const pageNumStr = `Ξ£ΞµΞ»Ξ―Ξ΄Ξ± ${Math.floor(i / itemsPerPage) + 1} Ξ±Ο€Ο ${Math.ceil(ceremonies.length / itemsPerPage)}`;
      const pageNumWidth = font.widthOfTextAtSize(pageNumStr, 8);
      page.drawText(pageNumStr, { x: (PAGE_WIDTH - pageNumWidth) / 2, y: 25, size: 8, font, color: rgb(0.5, 0.5, 0.5) });
    }

    if (ceremonies.length === 0) {
      const page = pdfDoc.addPage(PageSizes.A4);
      page.drawText('Ξ”ΞµΞ½ Ξ²ΟΞ­ΞΈΞ·ΞΊΞ±Ξ½ ΞΊΞ±Ο„Ξ±Ο‡Ο‰ΟΞ®ΟƒΞµΞΉΟ‚ Ξ³ΞΉΞ± Ο„ΞΏ ΞµΟ€ΞΉΞ»ΞµΞ³ΞΌΞ­Ξ½ΞΏ Ξ­Ο„ΞΏΟ‚.', { x: 50, y: PAGE_HEIGHT - 100, size: 12, font });
    }

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(pdfBytes as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Mitroo_${typeLabels[type] || 'Teleton'}_${year}.pdf"`,
      },
    });

  } catch (err: any) {
    console.error('[EXPORT REGISTRY ERROR]', err);
    return NextResponse.json({ error: 'Ξ£Ο†Ξ¬Ξ»ΞΌΞ± ΞΊΞ±Ο„Ξ¬ Ο„Ξ·Ξ½ ΞµΞΎΞ±Ξ³Ο‰Ξ³Ξ® Ο„ΞΏΟ… Ξ±ΟΟ‡ΞµΞ―ΞΏΟ… PDF.' }, { status: 500 });
  }
}
