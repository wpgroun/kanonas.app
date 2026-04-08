import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Viva Wallet endpoint verification
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const key = searchParams.get('Key') || searchParams.get('key')
  
  if (key) {
    return NextResponse.json({ Key: key })
  }
  return new NextResponse('Bad Request', { status: 400 })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // EventTypeId 1796 = Transaction Payment Created (Success)
    if (body.EventTypeId === 1796 && body.EventData) {
      const orderCode = body.EventData.OrderCode ? body.EventData.OrderCode.toString() : null
      const transactionId = body.EventData.TransactionId ? body.EventData.TransactionId.toString() : null
      
      const tags = body.EventData.Tags || []
      let templeId, planId, billingCycle = 'monthly'

      if (tags.length >= 2) {
        templeId = tags[0]
        planId = tags[1]
        billingCycle = tags[2] || 'monthly'
      } else if (body.EventData.MerchantTrns) {
        const parts = body.EventData.MerchantTrns.split('-')
        if (parts.length >= 2) {
          templeId = parts[0]
          planId = parts[1]
          billingCycle = parts[2] || 'monthly'
        }
      }

      if (templeId && planId && orderCode) {
        // Cancel old subscriptions
        await prisma.subscription.updateMany({
          where: { templeId, status: 'active' },
          data: { status: 'cancelled' }
        })

        // Create new active subscription
        await prisma.subscription.create({
          data: {
            templeId,
            planId,
            billingCycle,
            status: 'active',
            vivaOrderCode: orderCode,
            vivaTransactionId: transactionId,
          }
        })
        
        await prisma.auditLog.create({
          data: { templeId, action: 'SUBSCRIPTION_UPGRADE', detail: `Viva Wallet checkout complete for ${planId} (Order: ${orderCode})` }
        })
      }
    }

    return NextResponse.json({ success: true, message: 'Webhook processed' }, { status: 200 })
  } catch (error: any) {
    console.error('[Viva Webhook] Error:', error)
    return new NextResponse('Webhook processing failed', { status: 500 })
  }
}
