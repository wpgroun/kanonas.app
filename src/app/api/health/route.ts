import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const startTime = Date.now();
  try {
    // 1. Check basic DB connectivity
    // Using an arbitrary lightweight query instead of queryRaw to avoid any driver limitations
    await prisma.metropolis.findFirst({ select: { id: true } });
    
    const dbTime = Date.now() - startTime;

    return NextResponse.json(
      {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: {
          status: 'connected',
          latencyMs: dbTime
        },
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
