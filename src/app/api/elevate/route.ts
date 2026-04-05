import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const secret = process.env.SETUP_SECRET;
  const providedSecret = req.nextUrl.searchParams.get('secret');

  if (!secret || providedSecret !== secret) {
    return NextResponse.json({ error: 'Forbidden: Invalid or missing secret' }, { status: 403 });
  }

  const email = req.nextUrl.searchParams.get('email');
  if (!email) {
    return NextResponse.json({ error: 'Please provide an email parameter ?email=...' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
    }

    await prisma.user.update({
      where: { email },
      data: { isSuperAdmin: true }
    });

    return NextResponse.json({ 
      success: true, 
      message: `User ${email} has been successfully elevated to Super Admin (Owner). You may now log in to the system.` 
    });
  } catch (error: any) {
    console.error('Elevation error:', error);
    return NextResponse.json({ error: 'Failed to elevate user', details: error.message }, { status: 500 });
  }
}
