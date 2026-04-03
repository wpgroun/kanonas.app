import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendSMS } from '@/lib/sms';

// Vercel CRON Jobs or external services (cron-job.org) can hit this endpoint daily.
// Protect it using an Authorization header to avoid spam
export async function GET(req: Request) {
  try {
    // 1. Authorization check
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET || 'secret_cron_key_123'}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // 2. Compute date for "3 days from now"
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 3);
    
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    // 3. Find all Memorials (Μνημόσυνα) booked on that date
    const upcomingMemorials = await prisma.sacrament.findMany({
      where: {
        sacramentType: {
          contains: 'μνημόσυνο'
        },
        sacramentDate: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      include: {
        parishioner: true,
        temple: true
      }
    });

    const logs = [];

    // 4. Dispatch SMS
    for (const memorial of upcomingMemorials) {
      if (memorial.parishioner.mobile) {
        const dateStr = memorial.sacramentDate?.toLocaleDateString('el-GR');
        const timeStr = memorial.sacramentDate?.toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' });
        
        const message = `ΕΝΟΡΙΑ: Σας υπενθυμίζουμε ότι το Μνημόσυνο που έχετε προγραμματίσει έχει οριστεί για τις ${dateStr} ώρα ${timeStr}.`;
        
        await sendSMS([memorial.parishioner.mobile], message);
        logs.push(`Sent SMS directly to ${memorial.parishioner.mobile} for Memorial ID ${memorial.id}`);
      } else {
        logs.push(`Skipped Memorial ID ${memorial.id}: No mobile number on file for ${memorial.parishioner.firstName}`);
      }
    }

    return NextResponse.json({ 
      success: true, 
      processed: upcomingMemorials.length, 
      logs 
    });

  } catch (error: any) {
    console.error('CRON Memorials error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
