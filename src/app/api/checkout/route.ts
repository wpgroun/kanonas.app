import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// This safely initializes stripe ONLY if the key exists, so the dev server won't crash when testing locally without keys
const stripe = process.env.STRIPE_SECRET_KEY 
 ? new Stripe(process.env.STRIPE_SECRET_KEY, {
 apiVersion: '2024-06-20' as any,
 })
 : null;

export async function POST(req: Request) {
 try {
 const formData = await req.formData();
 const lookupKey = formData.get('lookup_key') as string;
 
 // For local development without stripe keys, simulate the route
 if (!stripe) {
 console.log('Stripe is not configured. Simulating checkout for: ' + lookupKey);
 // We can return a fake redirect or tell the UI that it's in demo mode
 return NextResponse.redirect(new URL('/contact?demo_checkout=true', req.url));
 }

 // Standard Stripe Subscription Architecture
 const prices = await stripe.prices.list({
 lookup_keys: [lookupKey],
 expand: ['data.product'],
 });

 if (prices.data.length === 0) {
 return new NextResponse('Pricing tier not configured in Stripe yet', { status: 400 });
 }

 const session = await stripe.checkout.sessions.create({
 billing_address_collection: 'auto',
 line_items: [
 {
 price: prices.data[0].id,
 // For recurring subscriptions
 quantity: 1,
 },
 ],
 mode: 'subscription',
 // We will create a success page later, for now back to contact for demo
 success_url: `${req.headers.get('origin')}/admin/settings?session_id={CHECKOUT_SESSION_ID}`,
 cancel_url: `${req.headers.get('origin')}/?canceled=true`,
 });

 if (!session.url) {
 throw new Error('Failed to create stripe session url');
 }

 return NextResponse.redirect(session.url, 303);
 } catch (err: any) {
 console.error('Checkout error:', err);
 return new NextResponse('Internal Server Error', { status: 500 });
 }
}

