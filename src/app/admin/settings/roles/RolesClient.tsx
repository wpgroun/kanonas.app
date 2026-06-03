'use client'

import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, ShieldAlert, MailPlus, UserCog, UserX } from 'lucide-react';

interface RolesClientProps {
 templeId: string;
 initialRoles: any[];
 initialUsers: any[];
}

export default function RolesClient({ templeId, initialRoles, initialUsers }: RolesClientProps) {
 const [users, setUsers] = useState(initialUsers);
 const [inviteEmail, setInviteEmail] = useState('');
 const [inviteRole, setInviteRole] = useState(initialRoles[0]?.id || '');

 const handleInvite = async () => {
 alert('Email πρόσκλησης στάλθηκε επιτυχώς (mock)!');
 setInviteEmail('');
 };

 return (
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 
 {/* 1. Invited / Active Users */}
 <div className="lg:col-span-2 space-y-6">
 <Card className="shadow-sm">
 <CardHeader className="border-b bg-muted/30 pb-4 flex flex-row items-center justify-between">
 <CardTitle className="text-lg flex items-center gap-2">
 <UserCog className="w-5 h-5"/> Ενεργοί Χρήστες Ναού
 </CardTitle>
 </CardHeader>
 <CardContent className="p-0">
 <table className="w-full text-sm text-left">
 <thead className="text-xs uppercase bg-muted text-muted-foreground">
 <tr>
 <th className="px-6 py-3">Χρήστης</th>
 <th className="px-6 py-3">Ρόλος / Δικαιώματα</th>
 <th className="px-6 py-3 text-right">Ενέργειες</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border">
 {users.map((u) => (
 <tr key={u.id} className="hover:bg-muted/40 transition-colors">
 <td className="px-6 py-4">
 <div className="font-semibold text-foreground">{u.user.firstName} {u.user.lastName}</div>
 <div className="text-xs text-muted-foreground">{u.user.email}</div>
 </td>
 <td className="px-6 py-4">
 <Badge variant="outline"className={u.role?.permissions.includes('ADMIN') ? 'bg-primary/10 text-primary border-primary' : 'bg-muted'}>
 {u.role?.name || 'Απλό Μέλος'}
 </Badge>
 </td>
 <td className="px-6 py-4 text-right">
 <Button variant="ghost"size="sm"className="text-destructive hover:bg-destructive/10"><UserX className="w-4 h-4 mr-2"/> Αφαίρεση</Button>
 </td>
 </tr>
))}
 {users.length === 0 && (
 <tr><td colSpan={3} className="px-6 py-8 text-center text-muted-foreground">Μητρώο κενό.</td></tr>
)}
 </tbody>
 </table>
 </CardContent>
 </Card>
 </div>

 {/* 2. Invite Form & Role List */}
 <div className="space-y-6">
 
 <Card className="shadow-sm">
 <CardHeader className="border-b bg-muted/30 pb-4">
 <CardTitle className="text-lg flex items-center gap-2">
 <MailPlus className="w-5 h-5"/> Πρόσκληση Νέου Συνεργάτη
 </CardTitle>
 </CardHeader>
 <CardContent className="pt-6 flex flex-col gap-4">
 <div>
 <label className="text-xs font-semibold text-muted-foreground mb-1 block">Email Συνεργάτη</label>
 <input 
 type="email"
 placeholder="πχ. neokoros@gmail.com"
 className="data-input w-full"
 value={inviteEmail}
 onChange={e => setInviteEmail(e.target.value)}
 />
 </div>
 <div>
 <label className="text-xs font-semibold text-muted-foreground mb-1 block">Επιλογή Ρόλου</label>
 <select className="data-input w-full"value={inviteRole} onChange={e => setInviteRole(e.target.value)}>
 {initialRoles.map(r => (
 <option key={r.id} value={r.id}>{r.name}</option>
))}
 </select>
 </div>
 <Button className="w-full mt-2"onClick={handleInvite} disabled={!inviteEmail}>
 Αποστολή Πρόσκλησης
 </Button>
 </CardContent>
 </Card>

 <Card className="shadow-sm">
 <CardHeader className="border-b bg-muted/30 pb-4">
 <CardTitle className="text-lg flex items-center gap-2 text-amber-600">
 <ShieldAlert className="w-5 h-5"/> Διαθέσιμοι Ρόλοι Ναού
 </CardTitle>
 </CardHeader>
 <CardContent className="pt-6">
 <div className="flex flex-col gap-3 text-sm">
 {initialRoles.map(r => (
 <div key={r.id} className="p-3 border border-border rounded-lg bg-card">
 <div className="font-semibold">{r.name}</div>
 <div className="text-xs text-muted-foreground font-mono mt-1 w-full overflow-hidden text-ellipsis whitespace-nowrap"title={Object.keys(r).filter(k => k.startsWith('can') && r[k] === true).join(', ')}>
 {Object.keys(r).filter(k => k.startsWith('can') && r[k] === true).join(', ') || 'Χωρίς ειδικά δικαιώματα'}
 </div>
 </div>
))}
 {initialRoles.length === 0 && (
 <div className="text-muted-foreground">Δεν έχουν οριστεί προσαρμοσμένοι ρόλοι.</div>
)}
 </div>
 </CardContent>
 </Card>

 </div>
 </div>
);
}

