'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, FileText, CheckCircle2, FileCheck, CircleDashed, Calendar, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function RequestsKanban({ tokens }: { tokens: any[] }) {
 // Columns definition based on status
 const columns = [
 { 
 id: 'pending', 
 title: 'Εκκρεμεί / Προετοιμασία', 
 icon: CircleDashed, 
 color: 'bg-amber-50 border-amber-200', 
 headerColor: 'text-amber-700 bg-amber-100/50' 
 },
 { 
 id: 'docs_generated', 
 title: 'Έγγραφα / Πρωτόκολλο', 
 icon: FileCheck, 
 color: 'bg-blue-50 border-blue-200', 
 headerColor: 'text-blue-700 bg-blue-100/50' 
 },
 { 
 id: 'completed', 
 title: 'Ολοκληρωμένα', 
 icon: CheckCircle2, 
 color: 'bg-emerald-50 border-emerald-200', 
 headerColor: 'text-emerald-700 bg-emerald-100/50' 
 }
 ];

 return (
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start mt-6 animate-in fade-in zoom-in-95 duration-500">
 {columns.map(col => {
 // Determine items in column
 const colItems = tokens.filter((t: any) => {
 if(col.id === 'docs_generated') return t.status === 'docs_generated' || (t.status !== 'completed' && t.protocolNumber);
 if(col.id === 'completed') return t.status === 'completed';
 return t.status !== 'docs_generated' && t.status !== 'completed' && !t.protocolNumber; // Pending
 });

 return (
 <div key={col.id} className={`rounded-xl border ${col.color} shadow-sm overflow-hidden flex flex-col h-[65vh]`}>
 <div className={`p-4 border-b border-inherit ${col.headerColor} flex items-center justify-between`}>
 <h3 className="font-bold flex items-center gap-2">
 <col.icon className="w-5 h-5"/> {col.title}
 </h3>
 <span className="bg-white/60 text-inherit px-2 py-0.5 rounded-full text-xs font-black shadow-sm">
 {colItems.length}
 </span>
 </div>
 <div className="p-3 overflow-y-auto space-y-3 flex-1 bg-white/40">
 {colItems.length === 0 && (
 <div className="text-center py-10 text-slate-500 text-sm font-medium border-2 border-dashed border-inherit rounded-lg opacity-50">
 Καμία εγγραφή
 </div>
)}
 {colItems.map(token => (
 <Card key={token.id} className="p-3 shadow-sm hover:shadow-md transition-all border border-slate-200 bg-white group relative">
 <div className="flex justify-between items-start mb-2">
 <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-slate-100 text-slate-600">
 {token.serviceType === 'GAMOS' ? '💍 Γάμος' : '🕊️ Βάπτιση'}
 </span>
 <span className="text-[10px] font-mono text-slate-400">#{token.tokenStr?.slice(-6).toUpperCase()}</span>
 </div>
 
 <div className="font-bold text-sm text-foreground mb-1">
 {token.ceremonyDate ? new Date(token.ceremonyDate).toLocaleDateString('el-GR') : 'Άγνωστη Ημ/νία'}
 </div>
 <div className="text-xs text-slate-500 flex items-center gap-1 mb-3">
 <Calendar className="w-3 h-3"/> Ιερέας: {token.assignedPriest || 'Δεν ορίστηκε'}
 </div>

 {token.protocolNumber && (
 <div className="text-xs font-mono bg-blue-50 text-blue-700 px-2 py-1 rounded inline-block mb-2 border border-blue-100">
 Πρωτ: {token.protocolNumber} / {token.bookNumber || '-'}
 </div>
)}

 <Link href={`/admin/requests/${token.id}`} className="block">
 <Button variant="secondary"size="sm"className="w-full h-7 text-xs gap-1 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
 Άνοιγμα Φακέλου <ArrowRight className="w-3 h-3"/>
 </Button>
 </Link>
 </Card>
))}
 </div>
 </div>
)
 })}
 </div>
);
}
