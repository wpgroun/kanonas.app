'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HeartHandshake, Lock, Users, Utensils, Euro, TrendingUp, HandHeart, Package, CheckSquare, Plus, FileSpreadsheet } from 'lucide-react';

export default function PhilanthropyClient({ stats, beneficiaries, inventory }: any) {
  const [activeTab, setActiveTab] = useState('Στατιστικά');
  
  const tabs = [
    { label: 'Στατιστικά', icon: <TrendingUp className="w-4 h-4" />, value: 'Στατιστικά' },
    { label: 'Δικαιούχοι', icon: <Users className="w-4 h-4" />, value: 'Δικαιούχοι' },
    { label: 'Αποθεματικό', icon: <Package className="w-4 h-4" />, value: 'Αποθεματικό' },
    { label: 'Συσσίτιο', icon: <CheckSquare className="w-4 h-4" />, value: 'Συσσίτιο' },
  ];

  return (
    <div className="container-fluid mt-6 space-y-6">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Συσσίτιο & Φιλόπτωχο
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Διαχείριση ωφελουμένων, αποθήκης και καθημερινού συσσιτίου.
          </p>
        </div>
      </div>

      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-lg p-4 flex items-start gap-3">
        <Lock className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-500">Αυστηρά εμπιστευτικά δεδομένα</h4>
          <p className="text-sm text-amber-700/80 dark:text-amber-500/80 mt-0.5">Πρόσβαση στο Φιλόπτωχο έχουν μόνο εξουσιοδοτημένοι διαχειριστές και η Φιλόπτωχος Αδελφότης.</p>
        </div>
      </div>

      <Tabs defaultValue="Στατιστικά" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap h-auto overflow-x-auto justify-start border-b border-border bg-transparent p-0 rounded-none w-full gap-2 mb-6">
          {tabs.map(tab => (
             <TabsTrigger 
               key={tab.value} 
               value={tab.value}
               className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2 font-medium"
             >
               <span className="flex items-center gap-2">{tab.icon} {tab.label}</span>
             </TabsTrigger>
          ))}
        </TabsList>

        {/* DASHBOARD (ΣΤΑΤΙΣΤΙΚΑ) */}
        <TabsContent value="Στατιστικά" className="space-y-4 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="shadow-sm border-border/50">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium mb-1">Επωφελούμενοι</p>
                    <h3 className="text-3xl font-bold text-foreground">{stats?.activeBeneficiaries || 0}</h3>
                  </div>
                  <div className="p-3 bg-green-100 text-green-600 rounded-full">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border/50">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium mb-1">Μερίδες (30 ημέρες)</p>
                    <h3 className="text-3xl font-bold text-foreground">{stats?.portions30Days || 0}</h3>
                  </div>
                  <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                    <Utensils className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border/50">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium mb-1">Εκτιμ. Κόστος / Μήνα</p>
                    <h3 className="text-3xl font-bold text-foreground">{stats?.cost30Days?.toFixed(2) || '0.00'} €</h3>
                  </div>
                  <div className="p-3 bg-amber-100 text-amber-600 rounded-full">
                    <Euro className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border/50">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium mb-1">Αύξηση Μήνα</p>
                    <h3 className="text-3xl font-bold text-foreground">{stats?.monthGrowth || '0%'}</h3>
                  </div>
                  <div className="p-3 bg-purple-100 text-purple-600 rounded-full">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <Card className="shadow-sm border-border/50 min-h-[300px] flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                 <FileSpreadsheet className="w-12 h-12 mx-auto mb-4 opacity-30" />
                 <p>[ Χώρος Γραφήματος Συσσιτίου ]</p>
              </div>
            </Card>
            <Card className="shadow-sm border-border/50 min-h-[300px] flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                 <HandHeart className="w-12 h-12 mx-auto mb-4 opacity-30" />
                 <p>[ Παροχές & Βοηθήματα ]</p>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* ΔΙΚΑΙΟΥΧΟΙ */}
        <TabsContent value="Δικαιούχοι" className="animate-in fade-in duration-500">
          <Card className="shadow-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/50">
              <div>
                <CardTitle>Μητρώο Ωφελουμένων</CardTitle>
                <CardDescription>Λίστα δικαιούχων για βοήθεια</CardDescription>
              </div>
              <Button size="sm"><Plus className="w-4 h-4 mr-2" /> Προσθήκη Ανεξάρτητου</Button>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Ονοματεπώνυμο</th>
                    <th className="px-6 py-3 font-semibold">Σύνδεση με Ενορία</th>
                    <th className="px-6 py-3 font-semibold">Μερίδες</th>
                    <th className="px-6 py-3 font-semibold">Κατάσταση</th>
                    <th className="px-6 py-3 font-semibold text-right">Ενέργειες</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {beneficiaries?.map((b: any) => (
                    <tr key={b.id} className="bg-card hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-semibold text-foreground">{b.lastName} {b.firstName}</td>
                      <td className="px-6 py-4">
                        {b.parishionerId ? (
                          <span className="text-blue-600 dark:text-blue-400 font-medium">Ενορίτης</span>
                        ) : (
                          <span className="text-amber-600 dark:text-amber-400 font-medium">Ανεξάρτητος</span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-medium">{b.portions} 🍲</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${b.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="outline" size="sm" className="h-8">Καρτέλα</Button>
                      </td>
                    </tr>
                  ))}
                  {(!beneficiaries || beneficiaries.length === 0) && (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Κανένας εγγεγραμμένος δικαιούχος.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* ΑΠΟΘΕΜΑΤΙΚΟ (ΙΝVΕΝΤΟRY) */}
        <TabsContent value="Αποθεματικό" className="animate-in fade-in duration-500">
           <Card className="shadow-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/50">
              <div>
                <CardTitle>Αποθήκη & Διαθέσιμα Υλικά</CardTitle>
                <CardDescription>Παρακολουθήστε τα υπόλοιπα πρώτων υλών</CardDescription>
              </div>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white"><Plus className="w-4 h-4 mr-2" /> Εισαγωγή Αγαθών</Button>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Είδος</th>
                    <th className="px-6 py-3 font-semibold">Κατηγορία</th>
                    <th className="px-6 py-3 font-semibold">Τρέχον Υπόλοιπο</th>
                    <th className="px-6 py-3 font-semibold">Μονάδα</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {inventory?.map((item: any) => (
                    <tr key={item.id} className="bg-card hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-semibold text-foreground">{item.name}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2 py-1 rounded bg-secondary text-secondary-foreground text-xs font-medium">
                          {item.category}
                        </span>
                      </td>
                      <td className={`px-6 py-4 font-bold ${item.quantity <= item.minStock ? 'text-red-500' : 'text-foreground'}`}>
                        {item.quantity} {item.quantity <= item.minStock && '⚠️ Χαμηλό'}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{item.unit}</td>
                    </tr>
                  ))}
                  {(!inventory || inventory.length === 0) && (
                    <tr><td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">Η αποθήκη είναι άδεια στο ψηφιακό σύστημα.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* ΣΥΣΣΙΤΙΟ (DAILY LOGS) */}
        <TabsContent value="Συσσίτιο" className="animate-in fade-in duration-500">
           <Card className="shadow-sm border-dashed border-2 py-16">
             <CardContent className="flex flex-col items-center justify-center text-center">
               <Utensils className="w-16 h-16 text-muted-foreground/30 mb-6" />
               <h2 className="text-2xl font-bold mb-2">Ημερήσιο Συσσίτιο (Live)</h2>
               <p className="text-muted-foreground max-w-md mx-auto mb-6">
                 Από εδώ, η εθελόντρια ή ο υπεύθυνος θα μπορεί με ένα tablet να βάλει "V" σε όσους δικαιούχους ήρθαν να πάρουν το φαγητό τους σήμερα.
               </p>
               <Button size="lg"><CheckSquare className="w-5 h-5 mr-2" /> Άνοιγμα Σημερινής Ημέρας</Button>
             </CardContent>
           </Card>
        </TabsContent>

      </Tabs>

    </div>
  )
}
