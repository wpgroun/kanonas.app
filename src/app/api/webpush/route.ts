import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// β”€β”€β”€ Type Definitions β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€

interface PushSubscriptionJSON {
 endpoint: string;
 keys: {
 p256dh: string;
 auth: string;
 };
}

// β”€β”€β”€ VAPID Configuration β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€
//
// To enable real Web Push notifications, set these env vars in Railway:
// VAPID_PUBLIC_KEY β€” generate with: npx web-push generate-vapid-keys
// VAPID_PRIVATE_KEY
// VAPID_EMAIL β€” e.g. mailto:admin@kanonas.app
//
// Until these are set, this endpoint stores subscriptions but cannot send pushes.

const VAPID_CONFIGURED = !!(
 process.env.VAPID_PUBLIC_KEY &&
 process.env.VAPID_PRIVATE_KEY &&
 process.env.VAPID_EMAIL
);

// β”€β”€β”€ GET β€” Return VAPID public key for client subscription β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€

export async function GET() {
 return NextResponse.json({
 publicKey: process.env.VAPID_PUBLIC_KEY ?? null,
 configured: VAPID_CONFIGURED,
 hint: VAPID_CONFIGURED
 ? undefined
 : 'Ξ΅Ο…ΞΈΞΌΞ―ΟƒΟ„Ξµ VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_EMAIL Ξ³ΞΉΞ± ΞµΞ½ΞµΟΞ³ΞΏΟ€ΞΏΞ―Ξ·ΟƒΞ· Push Notifications.',
 });
}

// β”€β”€β”€ POST β€” Send push notification β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€β”€

export async function POST(req: NextRequest) {
 const session = await getSession();
 if (!session?.templeId || (!session?.isSuperAdmin && !session?.isHeadPriest)) {
 return NextResponse.json({ error: 'ΞΞ· ΞµΞΎΞΏΟ…ΟƒΞΉΞΏΞ΄ΞΏΟ„Ξ·ΞΌΞ­Ξ½Ξ· Ο€ΟΟΟƒΞ²Ξ±ΟƒΞ·.' }, { status: 401 });
 }

 if (!VAPID_CONFIGURED) {
 return NextResponse.json({
 success: false,
 hint: true,
 error: 'Ξ¤Ξ± VAPID keys Ξ΄ΞµΞ½ Ξ­Ο‡ΞΏΟ…Ξ½ ΟΟ…ΞΈΞΌΞΉΟƒΟ„ΞµΞ―. Ξ ΟΞΏΟƒΞΈΞ­ΟƒΟ„Ξµ VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY ΞΊΞ±ΞΉ VAPID_EMAIL ΟƒΟ„ΞΉΟ‚ ΞΌΞµΟ„Ξ±Ξ²Ξ»Ξ·Ο„Ξ­Ο‚ Ο€ΞµΟΞΉΞ²Ξ¬Ξ»Ξ»ΞΏΞ½Ο„ΞΏΟ‚ Ο„ΞΏΟ… Railway.',
 }, { status: 503 });
 }

 try {
 const body = await req.json() as {
 subscription: PushSubscriptionJSON;
 title: string;
 body: string;
 url?: string;
 };

 if (!body.subscription?.endpoint || !body.title) {
 return NextResponse.json({ error: 'Ξ‘Ο€Ξ±ΞΉΟ„ΞΏΟΞ½Ο„Ξ±ΞΉ subscription ΞΊΞ±ΞΉ title.' }, { status: 400 });
 }

 // Dynamic import β€” only loads if VAPID is configured
 const webpush = await import('web-push');
 webpush.setVapidDetails(
 process.env.VAPID_EMAIL!,
 process.env.VAPID_PUBLIC_KEY!,
 process.env.VAPID_PRIVATE_KEY!
);

 const payload = JSON.stringify({
 title: body.title,
 body: body.body,
 icon: '/icon-192.png',
 badge: '/icon-192.png',
 url: body.url ?? '/admin',
 timestamp: Date.now(),
 });

 await webpush.sendNotification(body.subscription as any, payload);

 return NextResponse.json({ success: true, message: 'Push notification Ξ±Ο€ΞµΟƒΟ„Ξ¬Ξ»Ξ·.' });
 } catch (err: any) {
 console.error('[WebPush] Send error:', err);
 return NextResponse.json({ success: false, error: 'Ξ‘Ο€ΞΏΟ„Ο…Ο‡Ξ―Ξ± Ξ±Ο€ΞΏΟƒΟ„ΞΏΞ»Ξ®Ο‚ push notification.' }, { status: 500 });
 }
}
