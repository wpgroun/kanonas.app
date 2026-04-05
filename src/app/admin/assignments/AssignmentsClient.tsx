'use client'

import React, { useState } from 'react';
import { format } from 'date-fns';
import { el } from 'date-fns/locale';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { CalendarIcon, UserIcon, UsersIcon, SearchIcon, CheckCircleIcon } from 'lucide-react';
// Usually we use Server Actions to save this:
// import { assignPriestToToken } from '@/app/actions';

export default function AssignmentsClient({ initialTokens, staffMembers }: { initialTokens: any[], staffMembers: any[] }) {
 const [tokens, setTokens] = useState(initialTokens);
 const [searchTerm, setSearchTerm] = useState('');

 const handleAssignPriest = async (tokenId: string, priestName: string) => {
 // Optimistic UI Update
 setTokens(prev => prev.map(t => t.id === tokenId ? { ...t, assignedPriest: priestName } : t));
 
 // In actual implementation: await assignPriestToToken(tokenId, priestName);
 alert(`Ο Ιερέας ${priestName} ανατέθηκε επιτυχώς!`);
 };

 const filteredTokens = tokens.filter(t => {
 const rawDate = t.ceremonyDate ? format(new Date(t.ceremonyDate), 'dd/MM/yyyy') : '';
 const nameMatch = (t.customerName || '').toLowerCase().includes(searchTerm.toLowerCase());
 return nameMatch || rawDate.includes(searchTerm);
 });

 return (
 <div className="space-y-6 pb-20 fade-in">
 
 <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
 <div>
 <h1 className="text-3xl font-bold tracking-tight mb-2">Ημερολόγιο Αναθέσεων Μυστηρίων</h1>
 <p className="text-muted-foreground">Παρακολούθηση προγραμματισμένων μυστηρίων και ανάθεση Ιερέα ή Προσωπικού.</p>
 </div>
 
 <div className="flex flex-col md:flex-row gap-3 md:items-center w-full md:w-auto">
 <a 
 href={`/api/calendar/sync?templeId=cm0testtempleid0000000001`} 
 target="_blank"
 rel="noreferrer"
 className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
 title="Αντιγράψτε το Link για το Google Calendar"
 >
 <CalendarIcon className="w-4 h-4 text-emerald-600"/>
 iCal Feed (Sync)
 </a>

 <div className="relative w-full md:w-64">
 <SearchIcon className="absolute left-3 top-3 w-4 h-4 text-muted-foreground"/>
 <input 
 type="text"
 placeholder="Αναζήτηση Ονόματος/Ημερομηνίας..."
 className="data-input pl-9 w-full"
 value={searchTerm}
 onChange={e => setSearchTerm(e.target.value)}
 />
 </div>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {filteredTokens.length === 0 && (
 <div className="col-span-full py-12 text-center text-muted-foreground">
 Δεν βρέθηκαν προγραμματισμένα μυστήρια.
 </div>
)}
 
 {filteredTokens.map(token => {
 const dDate = token.ceremonyDate ? new Date(token.ceremonyDate) : null;
 const isGamos = token.serviceType === 'GAMOS';
 
 return (
 <Card key={token.id} className="shadow-sm border-t-4"style={{ borderTopColor: isGamos ? '#ec4899' : '#0ea5e9' }}>
 <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
 <div className="flex justify-between items-start">
 <div>
 <span className="text-xs font-bold uppercase tracking-wider mb-1 block"style={{ color: isGamos ? '#ec4899' : '#0ea5e9' }}>
 {isGamos ? 'ΓΑΜΟΣ' : 'ΒΑΠΤΙΣΗ'}
 </span>
 <CardTitle className="text-lg">{token.customerName || 'Άγνωστο Όνομα'}</CardTitle>
 </div>
 {token.assignedPriest && (
 <CheckCircleIcon className="text-emerald-500 w-5 h-5"/>
)}
 </div>
 </CardHeader>
 <CardContent className="pt-4 space-y-4">
 <div className="flex items-center gap-3 text-sm font-medium">
 <div className="bg-muted p-2 rounded-md">
 <CalendarIcon className="w-4 h-4 text-primary"/>
 </div>
 <div>
 {dDate ? format(dDate, 'PPPP', { locale: el }) : 'Εκκρεμεί Ημερομηνία'}
 <br/>
 <span className="text-muted-foreground">
 {dDate ? format(dDate, 'HH:mm') : '-'}
 </span>
 </div>
 </div>

 <div className="pt-2">
 <label className="text-xs font-bold text-muted-foreground mb-1 block flex items-center gap-1">
 <UserIcon className="w-3 h-3"/> Ανάθεση Ιερέα
 </label>
 
 {/* Dropdown for Priest Selection */}
 <select 
 className="data-input w-full text-sm"
 value={token.assignedPriest || ''}
 onChange={(e) => handleAssignPriest(token.id, e.target.value)}
 >
 <option value="">-- Επιλέξτε Ιερέα --</option>
 {staffMembers.map(s => {
 const nameStr = s.user.lastName ? `${s.user.firstName} ${s.user.lastName}` : s.user.email;
 return (
 <option key={s.user.id} value={nameStr}>
 {nameStr} ({s.role?.name || 'Εφημέριος'})
 </option>
)
 })}
 </select>
 </div>
 </CardContent>
 </Card>
)
 })}
 </div>
 </div>
)
}

