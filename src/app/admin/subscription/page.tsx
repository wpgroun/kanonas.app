import { getMySubscription, getSubscriptionPlans, createCheckoutSession, cancelMySubscription } from '@/actions/subscriptions'
import { CheckCircle2, ShieldCheck, Banknote, HelpCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import CheckoutButton from './CheckoutButton'
import CancelButton from './CancelButton'

export const metadata = {
  title: 'Διαχείριση Συνδρομής — Κανόνας',
}

export default async function SubscriptionPage({ searchParams }: { searchParams: { success?: string, cancelled?: string } }) {
  const [currentSub, allPlans] = await Promise.all([
    getMySubscription(),
    getSubscriptionPlans()
  ])

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Συνδρομή & Πλάνα</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Διαχειριστείτε το ενεργό σας πακέτο και αυτοματοποιήστε τον Ναό σας.
        </p>
      </div>

      {searchParams.success === '1' && (
        <div className="p-4 bg-[var(--success-light)] border border-[var(--success)]/20 rounded-xl text-[var(--success)] font-medium text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          Η πληρωμή ολοκληρώθηκε με επιτυχία. Η συνδρομή σας ενεργοποιήθηκε!
        </div>
      )}
      
      {searchParams.cancelled === '1' && (
        <div className="p-4 bg-[var(--warning-light)] border border-[var(--warning)]/20 rounded-xl text-[var(--warning)] font-medium text-sm">
          Η διαδικασία πληρωμής ακυρώθηκε.
        </div>
      )}

      {/* Current Subscription Card */}
      <div className="card p-6 md:p-8 bg-gradient-to-br from-[#7C3AED]/5 to-[#4F46E5]/5 border-[var(--brand)]/20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h2 className="text-sm font-semibold text-[var(--brand)] tracking-widest uppercase mb-1">Τρεχον Πακετο</h2>
            <h3 className="text-3xl font-extrabold text-[var(--foreground)] tracking-tight">
              {currentSub?.plan?.name || 'Κανένα Ενεργό Πακέτο'}
            </h3>
            <div className="flex flex-col gap-1 mt-4 text-sm text-[var(--text-secondary)]">
              <p>
                Κατάσταση:{' '}
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                  currentSub?.status === 'active' ? 'bg-[var(--success-light)] text-[var(--success)]' : 'bg-[var(--danger-light)] text-[var(--danger)]'
                }`}>
                  {currentSub?.status === 'active' ? 'Ενεργό' : currentSub?.status || 'Ανενεργό'}
                </span>
              </p>
              {currentSub && (
                <>
                  <p>Κύκλος Τιμολόγησης: <strong className="text-[var(--foreground)]">{currentSub.billingCycle === 'yearly' ? 'Ετήσιος' : 'Μηνιαίος'}</strong></p>
                  
                  {(currentSub.currentPeriodStart || currentSub.activatedAt) && (
                    <p>Έναρξη: <strong className="text-[var(--foreground)]">{new Date((currentSub.currentPeriodStart || currentSub.activatedAt)!).toLocaleDateString('el-GR')}</strong></p>
                  )}
                  
                  {(currentSub.currentPeriodEnd || currentSub.expiresAt) && (
                    <p>{currentSub.status === 'cancelled' ? 'Λήξη' : 'Επόμενη Χρέωση / Λήξη'}: <strong className="text-[var(--foreground)]">{new Date((currentSub.currentPeriodEnd || currentSub.expiresAt)!).toLocaleDateString('el-GR')}</strong></p>
                  )}

                  {currentSub.stripeSubscriptionId && (
                    <p>Αυτόματη Ανανέωση:{' '}
                      {currentSub.status === 'cancelled' ? (
                        <span className="text-rose-500 font-semibold">Κλειστή (Θα τερματιστεί στη λήξη)</span>
                      ) : (
                        <span className="text-emerald-500 font-semibold">Ενεργή (Stripe)</span>
                      )}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2 text-right">
            {currentSub?.stripeSubscriptionId && currentSub.status !== 'cancelled' ? (
               <CancelButton />
            ) : currentSub?.status === 'active' ? (
               <div className="text-xs font-medium text-[var(--text-muted)] bg-[var(--surface-hover)] px-3 py-1.5 rounded-lg border border-[var(--border)]">
                 Μη αυτοματοποιημένη συνδρομή<br />(Χειροκίνητη διαχείριση)
               </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Available Plans */}
      <div>
        <h3 className="text-lg font-bold text-[var(--foreground)] mb-6">Διαθέσιμα Πακέτα</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {allPlans.map((plan) => {
            const isCurrent = currentSub?.plan?.id === plan.id
            let features: string[] = []
            try { features = JSON.parse(plan.features) } catch(e) {}
            
            return (
              <div key={plan.id} className={`relative card flex flex-col p-6 transition-all duration-300 ${
                isCurrent ? 'ring-2 ring-[var(--brand)] shadow-lg' : 'hover:shadow-md'
              }`}>
                {isCurrent && (
                  <div className="absolute top-0 right-6 -translate-y-1/2 bg-[var(--brand)] text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                    ΤΟ ΠΑΚΕΤΟ ΣΑΣ
                  </div>
                )}
                
                <h4 className="text-lg font-bold text-[var(--foreground)] mb-2">{plan.name}</h4>
                <div className="flex items-end gap-1 mb-6">
                  {plan.isMetropolis || plan.priceMonthly === 0 ? (
                    <span className="text-2xl font-extrabold text-[var(--foreground)] tracking-tight">Κατόπιν Επικοινωνίας</span>
                  ) : (
                    <>
                      <span className="text-4xl font-extrabold text-[var(--foreground)] tracking-tight">{plan.priceMonthly}€</span>
                      <span className="text-sm font-medium text-[var(--text-muted)] mb-1">/Μήνα</span>
                    </>
                  )}
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm text-[var(--text-secondary)]">
                      <CheckCircle2 className="w-4 h-4 text-[var(--success)] flex-shrink-0 mt-0.5" />
                      <span className="leading-tight">{feature}</span>
                    </li>
                  ))}
                </ul>

                {plan.isMetropolis ? (
                  <Link href="/contact" className="w-full">
                    <button className="btn btn-secondary w-full">Επικοινωνία</button>
                  </Link>
                ) : isCurrent ? (
                  <button disabled className="btn btn-secondary w-full opacity-50 cursor-not-allowed">
                    Ενεργό
                  </button>
                ) : (
                  <CheckoutButton planId={plan.id} name={plan.name} />
                )}
              </div>
            )
          })}
        </div>
      </div>
      
      {/* FAQ / Info */}
      <div className="mt-12 bg-[var(--surface-hover)] rounded-xl p-6 border border-[var(--border)]">
        <h4 className="flex items-center gap-2 text-sm font-bold text-[var(--foreground)] mb-2">
          <HelpCircle className="w-4 h-4 text-[var(--text-muted)]" />
          Συχνές Ερωτήσεις
        </h4>
        <p className="text-sm text-[var(--text-secondary)]">
          Οι πληρωμές πραγματοποιούνται με απόλυτη ασφάλεια μέσω της <strong>Stripe</strong>. Μπορείτε να ακυρώσετε τη συνδρομή σας ανά πάσα στιγμή, και αυτή θα παραμείνει ενεργή μέχρι το τέλος της τρέχουσας περιόδου χρέωσης. Για πακέτα Μητρόπολης (Supervisor mode), παρακαλούμε επικοινωνήστε μαζί μας για εξειδικευμένη παραμετροποίηση.
        </p>
      </div>
    </div>
  )
}
