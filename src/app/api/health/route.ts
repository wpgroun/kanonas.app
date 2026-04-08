import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  const startTime = Date.now();
  try {
    // 1. Check basic DB connectivity
    // Using an arbitrary lightweight query instead of queryRaw to avoid any driver limitations
    await prisma.metropolis.findFirst({ select: { id: true } });
    
    const dbTime = Date.now() - startTime;

    // 2. Check storage accessibility
    let storageStatus: any = { status: 'ok' };
    try {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      await fs.mkdir(uploadDir, { recursive: true });
      await fs.access(uploadDir, fs.constants.W_OK);
    } catch (e: any) {
      storageStatus = { status: 'error', reason: e.message };
    }

    return NextResponse.json(
      {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: {
          status: 'connected',
          latencyMs: dbTime
        },
        storage: storageStatus,
        environment: process.env.NODE_ENV
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Healthcheck Error:', error);
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        message: 'Database connection failed',
        error: error.message
      },
      { status: 503 } // Service Unavailable
    );
  }
}
