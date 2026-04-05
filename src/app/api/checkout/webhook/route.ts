import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
 const body = await req.text()
 
 const headersList = await headers()
 const signature = headersList.get('stripe-signature')

 if (!signature) {
 return new NextResponse('No signature provided', { status: 400 })
 }

 let event;
 try {
 const stripe = (await import('stripe')).default
 const stripeClient = new stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: '2025-03-31.basil' })
 event = stripeClient.webhooks.constructEvent(
 body,
 signature,
 process.env.STRIPE_WEBHOOK_SECRET as string
)
 } catch (error: any) {
 return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
 }

 try {
 if (event.type === 'checkout.session.completed') {
 const session = event.data.object as any
 // Metadata added during createCheckoutSession
 const metadata = session.metadata
 const templeId = metadata?.templeId
 const planId = metadata?.planId
 const billingCycle = metadata?.billingCycle
 
 const stripeSubscriptionId = session.subscription as string
 const customerId = session.customer as string

 if (templeId && planId) {
 // Cancel old ones
 await prisma.subscription.updateMany({
 where: { templeId, status: 'active' },
 data: { status: 'cancelled' }
 })

 // Create new active subscription mapped to Stripe IDs
 await prisma.subscription.create({
 data: {
 templeId,
 planId,
 billingCycle: billingCycle || 'monthly',
 status: 'active',
 stripeSubscriptionId,
 stripeCustomerId: customerId,
 }
 })
 
 await prisma.auditLog.create({
 data: { templeId, action: 'SUBSCRIPTION_UPGRADE', detail: `Paid checkout complete for ${planId}` }
 })
 }
 } 
 
 // Auto-cancel if Stripe subscription is cancelled by a missed payment / manually
 else if (event.type === 'customer.subscription.deleted') {
 const subscription = event.data.object as any
 const stripeSubscriptionId = subscription.id
 
 const sub = await prisma.subscription.findUnique({ where: { stripeSubscriptionId } })
 if (sub) {
 await prisma.subscription.update({
 where: { id: sub.id },
 data: { status: 'cancelled', currentPeriodEnd: new Date() }
 })
 await prisma.auditLog.create({
 data: { templeId: sub.templeId, action: 'SUBSCRIPTION_CANCELLED', detail: `Stripe deleted sub ${stripeSubscriptionId}` }
 })
 }
 }

 return new NextResponse('Webhook processed', { status: 200 })
 } catch (error: any) {
 console.error('Webhook processing error:', error)
 return new NextResponse('Webhook processing failed', { status: 500 })
 }
}
