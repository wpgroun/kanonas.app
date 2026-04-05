import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

// ─── Type Definitions ──────────────────────────────────────────────────────────

interface PushSubscriptionJSON {
 endpoint: string;
 keys: {
 p256dh: string;
 auth: string;
 };
}

// ─── VAPID Configuration ───────────────────────────────────────────────────────
//
// To enable real Web Push notifications, set these env vars in Railway:
// VAPID_PUBLIC_KEY — generate with: npx web-push generate-vapid-keys
// VAPID_PRIVATE_KEY
// VAPID_EMAIL — e.g. mailto:admin@kanonas.app
//
// Until these are set, this endpoint stores subscriptions but cannot send pushes.

const VAPID_CONFIGURED = !!(
 process.env.VAPID_PUBLIC_KEY &&
 process.env.VAPID_PRIVATE_KEY &&
 process.env.VAPID_EMAIL
);

// ─── GET — Return VAPID public key for client subscription ─────────────────────

export async function GET() {
 return NextResponse.json({
 publicKey: process.env.VAPID_PUBLIC_KEY ?? null,
 configured: VAPID_CONFIGURED,
 hint: VAPID_CONFIGURED
 ? undefined
 : 'Ρυθμίστε VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_EMAIL για ενεργοποίηση Push Notifications.',
 });
}

// ─── POST — Send push notification ────────────────────────────────────────────

export async function POST(req: NextRequest) {
 const session = await getSession();
 if (!session?.templeId || (!session?.isSuperAdmin && !session?.isHeadPriest)) {
 return NextResponse.json({ error: 'Μη εξουσιοδοτημένη πρόσβαση.' }, { status: 401 });
 }

 if (!VAPID_CONFIGURED) {
 return NextResponse.json({
 success: false,
 hint: true,
 error: 'Τα VAPID keys δεν έχουν ρυθμιστεί. Προσθέστε VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY και VAPID_EMAIL στις μεταβλητές περιβάλλοντος του Railway.',
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
 return NextResponse.json({ error: 'Απαιτούνται subscription και title.' }, { status: 400 });
 }

 // Dynamic import — only loads if VAPID is configured
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

 return NextResponse.json({ success: true, message: 'Push notification απεστάλη.' });
 } catch (err: any) {
 console.error('[WebPush] Send error:', err);
 return NextResponse.json({ success: false, error: 'Αποτυχία αποστολής push notification.' }, { status: 500 });
 }
}
