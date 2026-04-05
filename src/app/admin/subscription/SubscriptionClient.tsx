'use client';

import { CheckCircle2, FileText, Download, LayoutGrid, History, CreditCard, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import CheckoutButton from './CheckoutButton';
import CancelButton from './CancelButton';

export default function SubscriptionClient({ currentSub, allPlans, invoices, searchParams }: any) {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-indigo-600"/> Διαχείριση Συνδρομών
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Κέντρο ελέγχου χρεώσεων, ενεργών υπηρεσιών και αναβαθμίσεων του Ναού.
          </p>
        </div>
      </div>

      {searchParams.success === '1' && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 font-bold text-sm flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-5 h-5"/>
          Η πληρωμή ολοκληρώθηκε με επιτυχία. Η συνδρομή σας είναι πλέον Ενεργή!
        </div>
      )}

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="mb-6 bg-slate-100 p-1.5 rounded-xl border border-slate-200 shadow-inner inline-flex h-12">
          <TabsTrigger value="active" className="rounded-lg gap-2 text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm px-6">
            <LayoutGrid className="w-4 h-4"/> Οι Συνδρομές Μου
          </TabsTrigger>
          <TabsTrigger value="history" className="rounded-lg gap-2 text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm px-6">
            <History className="w-4 h-4"/> Ιστορικό Πληρωμών
          </TabsTrigger>
          <TabsTrigger value="plans" className="rounded-lg gap-2 text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm px-6">
            <CreditCard className="w-4 h-4"/> Πακέτα Αναβάθμισης
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: ACTIVE SUBSCRIPTIONS */}
        <TabsContent value="active" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* The Main Kanonas Card */}
            <Card className="shadow-lg border-0 overflow-hidden relative group transition-all hover:shadow-xl hover:-translate-y-1">
              <div className="h-1 bg-gradient-to-r from-indigo-500 to-purple-600 w-full absolute top-0 left-0"></div>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">ΕΦΑΡΜΟΓΗ</span>
                    <h3 className="text-xl font-bold text-slate-800 mt-1">Kanonas {currentSub?.plan?.name || 'Free'}</h3>
                  </div>
                  <div className={`text-xs font-bold px-2 py-1 flex items-center gap-1 rounded bg-emerald-50 text-emerald-600 border border-emerald-100`}>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> Ενεργή
                  </div>
                </div>

                <div className="space-y-3 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Κύκλος Χρέωσης</span>
                    <span className="font-bold text-slate-700">{currentSub?.billingCycle === 'yearly' ? 'Ετήσιος' : 'Μηνιαίος'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Ημ/νια Έναρξης</span>
                    <span className="font-bold text-slate-700">{currentSub?.activatedAt ? new Date(currentSub.activatedAt).toLocaleDateString('el-GR') : '-'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Επόμενη Χρέωση</span>
                    <span className="font-bold text-indigo-600">{currentSub?.expiresAt ? new Date(currentSub.expiresAt).toLocaleDateString('el-GR') : '-'}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg transition-colors text-sm">
                    Είσοδος
                  </button>
                  {currentSub?.stripeSubscriptionId && currentSub.status !== 'cancelled' && (
                    <div className="flex-1">
                      <CancelButton />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Placeholder for Add-ons / Future modules like Epsilon Modules */}
            <Card className="shadow-sm border-dashed border-2 border-slate-200 bg-slate-50 opacity-60 flex flex-col items-center justify-center min-h-[280px]">
              <LayoutGrid className="w-10 h-10 text-slate-300 mb-3" />
              <p className="font-bold text-slate-500 text-sm">Προσθήκη Νέου Module</p>
              <p className="text-xs text-slate-400 mt-1 max-w-[200px] text-center">Δείτε το Marketplace για νέες λειτουργίες.</p>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 2: INVOICES & BILLING HISTORY */}
        <TabsContent value="history" className="space-y-6">
          <Card className="shadow-sm border-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100 font-extrabold tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Αριθμός - Κωδικός</th>
                    <th className="px-6 py-4">Ημ/νια</th>
                    <th className="px-6 py-4">Κατάσταση</th>
                    <th className="px-6 py-4">Συνολικό Ποσό</th>
                    <th className="px-6 py-4 text-center">Παραστατικό PDF</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices && invoices.length > 0 ? (
                    invoices.map((inv: any) => (
                      <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-mono font-medium text-slate-700">{inv.number}</td>
                        <td className="px-6 py-4 text-slate-600">{new Date(inv.date).toLocaleDateString('el-GR')}</td>
                        <td className="px-6 py-4">
                          <span className={\`text-xs font-bold px-2.5 py-1 rounded-full \${
                            inv.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                          }\`}>
                            {inv.status === 'paid' ? 'Εξοφλημένο' : 'Εκκρεμεί'}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-800">€{inv.amountPaid.toLocaleString('el-GR', {minimumFractionDigits: 2})}</td>
                        <td className="px-6 py-4 text-center">
                          {inv.pdfUrl ? (
                            <a href={inv.pdfUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800">
                              <Download className="w-3.5 h-3.5"/> PDF
                            </a>
                          ) : (
                            <span className="text-slate-400 text-xs">-</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3"/>
                        <p className="text-slate-500 font-medium">Δεν βρέθηκαν συναλλαγές ή τιμολόγια.</p>
                        <p className="text-sm text-slate-400 mt-1">Εάν το πακέτο σας διαχειρίζεται η Μητρόπολη, η τιμολόγηση γίνεται κεντρικά.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* TAB 3: UPGRADE PLANS */}
        <TabsContent value="plans">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {allPlans.map((plan: any) => {
              const isCurrent = currentSub?.plan?.id === plan.id;
              let features: string[] = [];
              try { features = JSON.parse(plan.features); } catch(e) {}
              
              return (
                <Card key={plan.id} className={\`relative flex flex-col p-6 transition-all duration-300 \${
                  isCurrent ? 'ring-2 ring-indigo-600 shadow-xl scale-105 z-10' : 'hover:shadow-lg border-slate-200'
                }\`}>
                  {isCurrent && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] uppercase tracking-widest font-black px-4 py-1 rounded-full shadow-sm">
                      ΤΡΕΧΟΝ ΠΑΚΕΤΟ
                    </div>
                  )}
                  
                  <div className="text-center mb-6">
                    <h4 className="text-lg font-black text-slate-800 uppercase tracking-widest mb-2">{plan.name}</h4>
                    {plan.isMetropolis || plan.priceMonthly === 0 ? (
                      <span className="text-2xl font-black text-slate-800 tracking-tight block">Με Επικοινωνία</span>
                    ) : (
                      <>
                        <span className="text-5xl font-black text-slate-800 tracking-tighter">€{plan.priceMonthly}</span>
                        <span className="text-sm font-bold text-slate-400">/ Μήνα</span>
                      </>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm text-slate-600 font-medium">
                        <CheckCircle2 className="w-5 h-5 text-indigo-500 fill-indigo-50 flex-shrink-0"/>
                        <span className="leading-tight mt-0.5">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {plan.isMetropolis ? (
                    <Link href="/admin/settings" className="w-full">
                      <button className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors">
                        Επικοινωνία
                      </button>
                    </Link>
                  ) : isCurrent ? (
                    <button disabled className="w-full py-3 bg-indigo-50 text-indigo-400 font-bold rounded-xl cursor-not-allowed">
                      ΕΝΕΡΓΟ
                    </button>
                  ) : (
                    <CheckoutButton planId={plan.id} name={plan.name} />
                  )}
                </Card>
              );
            })}
          </div>
        </TabsContent>
        
      </Tabs>
    </div>
  );
}
