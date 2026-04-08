import { NextResponse } from 'next/server'
import { cronCheckSubscriptionExpiry } from '@/actions/notifications'

/**
 * CRON endpoint to check subscription expiry and send notifications.
 * Should be called daily (e.g., via Railway cron, Vercel cron, or external service).
 * 
 * GET /api/cron/subscription-check?key=YOUR_CRON_SECRET
 */
export async function GET(request: Request) {
  // Security: require a secret key
  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key')

  if (key !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Μη εξουσιοδοτημένο' }, { status: 401 })
  }

  try {
    const result = await cronCheckSubscriptionExpiry()
    return NextResponse.json({ success: true, ...result })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
