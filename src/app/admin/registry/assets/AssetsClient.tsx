'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Coins, Plus, MoreVertical, Building2, Gem, Church } from 'lucide-react';

export default function AssetsClient({ initialAssets, currentOwner, currentType }: any) {
 const router = useRouter();

 const handleFilter = (key: string, val: string) => {
 const params = new URLSearchParams(window.location.search);
 params.set(key, val);
 router.push(`?${params.toString()}`);
 };

 const getAssetIcon = (cat: string) => {
 switch(cat) {
 case 'APARTMENT': case 'LAND': return <Building2 className="w-8 h-8 opacity-20 absolute right-4 top-4"/>;
 case 'RELIC': return <Church className="w-8 h-8 opacity-20 absolute right-4 top-4"/>;
 default: return <Gem className="w-8 h-8 opacity-20 absolute right-4 top-4"/>;
 }
 };

 return (
 <div className="space-y-6">
 {/* Filters */}
 <div className="flex flex-col md:flex-row justify-between bg-[var(--surface)] p-4 rounded-xl border border-border shadow-sm gap-4">
 <div className="flex gap-4">
 <div className="space-y-1">
 <label className="text-xs font-semibold text-[var(--text-muted)]">Ιδιοκτησία</label>
 <select 
 className="w-full text-sm p-2 border border-border rounded-lg bg-transparent"
 value={currentOwner}
 onChange={(e) => handleFilter('owner', e.target.value)}
 >
 <option value="ALL">Όλα (Ναός + Φιλόπτωχο)</option>
 <option value="TEMPLE">Ιερός Ναός</option>
 <option value="PHILOPTOCHOS">Φιλόπτωχο Ταμείο (Ε.Φ.Τ.)</option>
 </select>
 </div>
 
 <div className="space-y-1">
 <label className="text-xs font-semibold text-[var(--text-muted)]">Κατηγορία</label>
 <select 
 className="w-full text-sm p-2 border border-border rounded-lg bg-transparent"
 value={currentType}
 onChange={(e) => handleFilter('type', e.target.value)}
 >
 <option value="ALL">Συνολικά</option>
 <option value="IMMOVABLE">Ακίνητη Περιουσία</option>
 <option value="MOVABLE">Κινητή, Λείψανα & Σκεύη</option>
 </select>
 </div>
 </div>
 
 <div className="flex items-end">
 <Button className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-md border-0 gap-2 h-[38px]">
 <Plus className="w-4 h-4"/> Πάγιο / Κειμήλιο
 </Button>
 </div>
 </div>

 {/* Grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 {initialAssets.map((ast: any) => (
 <Card key={ast.id} className="relative overflow-hidden p-0 border border-border hover:shadow-md transition-shadow group flex flex-col h-full">
 {ast.imageUrl ? (
 <div className="h-32 w-full bg-cover bg-center"style={{backgroundImage: `url(${ast.imageUrl})`}} />
) : (
 <div className="h-32 w-full bg-slate-100 flex items-center justify-center text-slate-300">
 {getAssetIcon(ast.category)}
 </div>
)}
 
 <div className="p-4 flex flex-col flex-grow">
 <div className="flex justify-between items-start mb-2">
 <div>
 <h3 className="font-bold text-lg">{ast.name}</h3>
 <span className={`text-xs font-semibold border px-2 py-0.5 rounded-full ${ast.owner === 'TEMPLE' ? 'bg-[var(--brand-50)] text-[var(--brand)]' : 'bg-red-50 text-red-700'}`}>
 {ast.owner === 'TEMPLE' ? 'Ι. Ναός' : 'Ε.Φ.Τ.'}
 </span>
 </div>
 <button className="text-[var(--text-muted)] hover:text-primary"><MoreVertical className="w-5 h-5"/></button>
 </div>
 
 <p className="text-xs text-[var(--text-muted)] mb-4 line-clamp-2">{ast.description || 'Χωρίς περιγραφή'}</p>
 
 <div className="mt-auto space-y-2 bg-[var(--background)] p-3 rounded-lg border border-border/50">
 {ast.location && (
 <div className="flex items-center text-sm text-[var(--text-secondary)]">
 <MapPin className="w-4 h-4 mr-2"/> {ast.location}
 </div>
)}
 
 {ast.estimatedValue !== null && (
 <div className="flex items-center text-sm font-semibold text-[var(--success)]">
 <Coins className="w-4 h-4 mr-2"/> 
 {new Intl.NumberFormat('el-GR', { style: 'currency', currency: 'EUR' }).format(ast.estimatedValue)}
 </div>
)}
 
 <div className="flex justify-between items-center text-xs text-[var(--text-muted)] pt-2 mt-2 border-t border-border/50">
 <span>Κατηγορία: {ast.category}</span>
 <span>{ast.status === 'ACTIVE' ? 'Ενεργό' : ast.status}</span>
 </div>
 </div>
 </div>
 </Card>
))}

 {initialAssets.length === 0 && (
 <div className="col-span-full py-16 text-center border-2 border-dashed border-border rounded-xl">
 <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3"/>
 <h3 className="text-lg font-bold text-[var(--text-muted)]">Κενό Περιουσιολόγιο</h3>
 <p className="text-sm text-[var(--text-muted)]">Δεν βρέθηκαν περιουσιακά στοιχεία για τα επιλεγμένα φίλτρα.</p>
 </div>
)}
 </div>
 </div>
);
}
