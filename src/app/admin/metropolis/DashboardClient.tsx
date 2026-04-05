'use client'

import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Activity, Banknote, CalendarCheck } from 'lucide-react';

export default function DashboardClient({ initialTemples }: { initialTemples: any[] }) {

 // Aggregate stats
 const totalTemples = initialTemples.length;
 const totalSacraments = initialTemples.reduce((acc, t) => acc + t.sacraments.length, 0);
 const totalDonations = initialTemples.reduce((acc, t) => acc + t.donations.reduce((sum: number, d: any) => sum + d.amount, 0), 0);
 
 // Pending ceremonies (tokens needing approval from metropolis)
 const pendingRequests = initialTemples.flatMap(t => 
 t.tokens.map((tok: any) => ({ ...tok, templeName: t.name }))
).filter((tok: any) => tok.status === 'pending');

 return (
 <div className="space-y-6">
 
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
 <Card className="border-l-4 border-l-primary shadow-sm bg-primary/5">
 <CardContent className="pt-6">
 <div className="flex items-center gap-3">
 <Building2 className="w-8 h-8 text-primary"/>
 <div>
 <p className="text-sm font-semibold text-muted-foreground uppercase">Ενεργοί Ναοί</p>
 <p className="text-3xl font-bold">{totalTemples}</p>
 </div>
 </div>
 </CardContent>
 </Card>
 
 <Card className="border-l-4 border-l-emerald-500 shadow-sm bg-emerald-50">
 <CardContent className="pt-6">
 <div className="flex items-center gap-3">
 <Activity className="w-8 h-8 text-emerald-600"/>
 <div>
 <p className="text-sm font-semibold text-muted-foreground uppercase">Τελεσθέντα Μυστήρια</p>
 <p className="text-3xl font-bold">{totalSacraments}</p>
 </div>
 </div>
 </CardContent>
 </Card>

 <Card className="border-l-4 border-l-amber-500 shadow-sm bg-amber-50">
 <CardContent className="pt-6">
 <div className="flex items-center gap-3">
 <CalendarCheck className="w-8 h-8 text-amber-600"/>
 <div>
 <p className="text-sm font-semibold text-muted-foreground uppercase">Εκκρεμείς Εγκρίσεις</p>
 <p className="text-3xl font-bold">{pendingRequests.length}</p>
 </div>
 </div>
 </CardContent>
 </Card>

 <Card className="border-l-4 border-l-blue-500 shadow-sm bg-blue-50">
 <CardContent className="pt-6">
 <div className="flex items-center gap-3">
 <Banknote className="w-8 h-8 text-blue-600"/>
 <div>
 <p className="text-sm font-semibold text-muted-foreground uppercase">Σύνολο Εσόδων Ταμείων</p>
 <p className="text-2xl font-bold text-blue-700">€{totalDonations.toLocaleString('el-GR', { minimumFractionDigits: 2 })}</p>
 </div>
 </div>
 </CardContent>
 </Card>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 
 <Card className="shadow-sm">
 <CardHeader className="border-b bg-muted/30 pb-4">
 <CardTitle className="text-lg">Ενορίες & Στατιστικά</CardTitle>
 </CardHeader>
 <CardContent className="p-0">
 <table className="w-full text-sm text-left">
 <thead className="bg-muted text-muted-foreground text-xs uppercase">
 <tr>
 <th className="px-6 py-3">Ιερός Ναός</th>
 <th className="px-6 py-3 text-center">Μυστήρια</th>
 <th className="px-6 py-3 text-right">Έσοδα</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border">
 {initialTemples.map(t => (
 <tr key={t.id} className="hover:bg-muted/40 transition-colors">
 <td className="px-6 py-4 font-semibold">{t.name}</td>
 <td className="px-6 py-4 text-center">{t.sacraments.length}</td>
 <td className="px-6 py-4 text-right text-emerald-600 font-bold">
 €{t.donations.reduce((sum: number, d: any) => sum + d.amount, 0).toLocaleString('el-GR', { minimumFractionDigits: 2 })}
 </td>
 </tr>
))}
 {initialTemples.length === 0 && (
 <tr><td colSpan={3} className="px-6 py-8 text-center text-muted-foreground">Δεν υπάρχουν Ναοί.</td></tr>
)}
 </tbody>
 </table>
 </CardContent>
 </Card>

 <Card className="shadow-sm border-l-4 border-l-amber-500">
 <CardHeader className="border-b bg-amber-50/50 pb-4 flex flex-row items-center justify-between">
 <CardTitle className="text-lg text-amber-900">Αιτήματα προς Έγκριση (Κεντρικά)</CardTitle>
 <Badge className="bg-amber-100 text-amber-800">{pendingRequests.length} Νέα</Badge>
 </CardHeader>
 <CardContent className="p-0">
 <div className="flex flex-col">
 {pendingRequests.map((req: any) => (
 <div key={req.id} className="p-4 border-b border-border hover:bg-muted/30 transition-colors flex justify-between items-center">
 <div>
 <div className="font-semibold">{req.templeName}</div>
 <div className="text-sm text-muted-foreground flex gap-2 items-center mt-1">
 <Badge variant="outline"className="text-xs">{req.serviceType === 'GAMOS' ? 'ΓΑΜΟΣ' : 'ΒΑΠΤΙΣΗ'}</Badge> 
 ID: {req.id.slice(-6).toUpperCase()}
 </div>
 </div>
 <button className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors">
 Έλεγχος & Έγκριση
 </button>
 </div>
))}
 {pendingRequests.length === 0 && (
 <div className="p-8 text-center text-muted-foreground">Μηδενικές εκκρεμότητες.</div>
)}
 </div>
 </CardContent>
 </Card>

 </div>

 </div>
);
}

