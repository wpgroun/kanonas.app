const fs = require('fs');
let content = fs.readFileSync('src/actions/subscriptions.ts', 'utf8');

const injection = `
/** Fetch Stripe Invoices for the active tenant */
export async function getStripeInvoices() {
  await requireAuth()
  const templeId = await getCurrentTempleId()

  try {
    const sub = await prisma.subscription.findFirst({
      where: { templeId },
      orderBy: { createdAt: 'desc' }
    });
    
    if (!sub || !sub.stripeSubscriptionId) return [];

    const stripe = (await import('stripe')).default;
    const stripeClient = new stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-03-31.basil' });

    const stripeSub = await stripeClient.subscriptions.retrieve(sub.stripeSubscriptionId);
    if (!stripeSub || !stripeSub.customer) return [];

    const invoices = await stripeClient.invoices.list({
      customer: stripeSub.customer,
      limit: 10,
    });

    return invoices.data.map(inv => ({
      id: inv.id,
      number: inv.number,
      amountPaid: inv.amount_paid / 100,
      status: inv.status,
      date: new Date(inv.created * 1000),
      pdfUrl: inv.invoice_pdf
    }));
  } catch (e) {
    console.error('[Stripe Invoices] Error:', e);
    return [];
  }
}

// ─── SUPER ADMIN — Manual plan management ─────────────────────────────────────`;

if (!content.includes('getStripeInvoices')) {
    content = content.replace('// ─── SUPER ADMIN — Manual plan management ─────────────────────────────────────', injection);
    fs.writeFileSync('src/actions/subscriptions.ts', content);
    console.log('patched');
} else {
    console.log('already patched');
}
