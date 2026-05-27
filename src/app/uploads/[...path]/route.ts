import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;
    
    // 1. Sanitize the path segments to prevent directory traversal attacks
    const safeSegments = pathSegments.map(segment => segment.replace(/\.\./g, ''));
    
    // Construct the expected file path on disk
    const filePath = path.join(process.cwd(), 'public', 'uploads', ...safeSegments);
    
    // Determine content type based on extension
    const ext = path.extname(filePath).toLowerCase();
    let contentType = 'application/octet-stream';
    if (ext === '.pdf') {
      contentType = 'application/pdf';
    } else if (ext === '.docx') {
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    } else if (ext === '.doc') {
      contentType = 'application/msword';
    } else if (ext === '.png') {
      contentType = 'image/png';
    } else if (ext === '.jpg' || ext === '.jpeg') {
      contentType = 'image/jpeg';
    } else if (ext === '.webp') {
      contentType = 'image/webp';
    }

    // 2. Check if the file already exists on disk
    if (fs.existsSync(filePath)) {
      const stat = fs.statSync(filePath);
      if (!stat.isDirectory()) {
        const fileBuffer = fs.readFileSync(filePath);
        return new NextResponse(fileBuffer, {
          headers: {
            'Content-Type': contentType,
            'Content-Disposition': `inline; filename="${path.basename(filePath)}"`,
            'Cache-Control': 'public, max-age=31536000, immutable',
          },
        });
      }
    }

    // 3. If file is not on disk, check if it's a template we can restore from the database
    // The relative URL path would start with "templates"
    if (safeSegments[0] === 'templates') {
      // Reconstruct the fileUrl as saved in the DB: e.g. /uploads/templates/...
      const fileUrl = `/uploads/${safeSegments.join('/')}`;
      
      const template = await prisma.docTemplate.findFirst({
        where: { fileUrl }
      });

      if (template && template.fileData) {
        // Decode the base64 template file content
        const fileBuffer = Buffer.from(template.fileData, 'base64');

        // Write the file back to disk so we don't have to hit the DB next time
        try {
          fs.mkdirSync(path.dirname(filePath), { recursive: true });
          fs.writeFileSync(filePath, fileBuffer);
        } catch (writeErr) {
          console.error('[Restore file write error]', writeErr);
        }

        // Serve the restored file
        return new NextResponse(fileBuffer, {
          headers: {
            'Content-Type': contentType,
            'Content-Disposition': `inline; filename="${path.basename(filePath)}"`,
            'Cache-Control': 'public, max-age=31536000, immutable',
          },
        });
      }
    }

    // 4. File does not exist and cannot be restored
    return new NextResponse('File Not Found', { status: 404 });
  } catch (err: any) {
    console.error('[Serve Uploaded File Error]', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
