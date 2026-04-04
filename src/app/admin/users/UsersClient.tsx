'use client'

import { useState } from 'react'
import { addStaffToTemple, removeStaffFromTemple, updateStaffRole } from '@/actions/users'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UserPlus, ShieldAlert, Trash2, KeyRound } from 'lucide-react'
import Link from 'next/link'

export default function UsersClient({ initialStaff, roles }: { initialStaff: any[], roles: any[] }) {
  const [loading, setLoading] = useState(false);

  // Form State
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [pwd, setPwd] = useState('');
  const [roleId, setRoleId] = useState('');

  const handleAdd = async (e: any) => {
    e.preventDefault();
    if(!roleId && roles.length > 0) {
      alert("Επιλέξτε ένα Ρόλο (π.χ. Γραμματεία)"); return;
    }
    setLoading(true);
    const res = await addStaffToTemple({ email, firstName, lastName, roleId, initialPassword: pwd });
    setLoading(false);
    
    if(res.success) {
       window.location.reload(); 
    } else {
       alert(res.error || 'Σφάλμα');
    }
  };

  const handleRemove = async (utId: string, utName: string) => {
    if(!confirm(`Μόνιμη αφαίρεση της πρόσβασης του ${utName || 'υπαλλήλου'} από τον Ναό σας;`)) return;
    setLoading(true);
    const res = await removeStaffFromTemple(utId);
    setLoading(false);
    if(res.success) window.location.reload();
    else alert(res.error || 'Σφάλμα');
  };

  const handleChangeRole = async (utId: string, newRoleId: string) => {
    setLoading(true);
    const res = await updateStaffRole(utId, newRoleId);
    setLoading(false);
    if(res.success) window.location.reload();
    else alert(res.error || 'Σφάλμα');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
      
      {/* FORM: NEW STAFF */}
      <div className="col-span-1">
         <Card className="shadow-sm border-border/50 sticky top-6">
            <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
               <CardTitle className="text-lg flex items-center gap-2">
                 <UserPlus className="w-5 h-5 text-primary" /> Προσθήκη Προσωπικού
               </CardTitle>
               <CardDescription>Δώστε πρόσβαση σε έναν νέο χρήστη, υπάλληλο ή εθελοντή.</CardDescription>
            </CardHeader>
            <CardContent className="pt-5 space-y-4">
               <form onSubmit={handleAdd} className="space-y-4">
                 
                 <div className="space-y-2">
                   <Label>Email (Όνομα Χρήστη)</Label>
                   <Input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="π.χ. maria@gmail.com" />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Όνομα</Label>
                      <Input required value={firstName} onChange={e=>setFirstName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Επώνυμο</Label>
                      <Input value={lastName} onChange={e=>setLastName(e.target.value)} />
                    </div>
                 </div>

                 <div className="space-y-2">
                   <Label className="flex items-center gap-1.5"><KeyRound className="w-3.5 h-3.5 text-muted-foreground"/> Աρχικός Κωδικός</Label>
                   <Input required type="password" value={pwd} onChange={e=>setPwd(e.target.value)} placeholder="Τουλάχιστον 6 χαρακτήρες" />
                   <div className="text-[10px] text-muted-foreground">Δώστε αυτόν τον κωδικό στον υπάλληλο.</div>
                 </div>

                 <div className="space-y-2 bg-muted/50 p-3 rounded-lg border border-border">
                   <Label className="text-primary">Αρμοδιότητα (Ρόλος)</Label>
                   {roles.length === 0 ? (
                     <div className="text-xs text-destructive">
                       Δεν έχετε δημιουργήσει ρόλους. <Link href="/admin/users/roles" className="underline font-bold">Φτιάξτε Ρόλους εδώ</Link>.
                     </div>
                   ) : (
                     <select 
                       required 
                       value={roleId} 
                       onChange={e=>setRoleId(e.target.value)}
                       className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                     >
                       <option value="" disabled>-- Επιλέξτε Ρόλο --</option>
                       {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                     </select>
                   )}
                 </div>

                 <Button type="submit" disabled={loading} className="w-full">
                    {loading ? 'Δημιουργία...' : 'Ενεργοποίηση Πρόσβασης'}
                 </Button>

               </form>
            </CardContent>
         </Card>
      </div>

      {/* LIST: STAFF MEMBERS */}
      <div className="col-span-1 lg:col-span-2 flex flex-col gap-3">
         
         {initialStaff.map(s => (
            <Card key={s.id} className={`shadow-sm overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 ${s.isHeadPriest ? 'border-l-4 border-l-amber-500 bg-amber-500/5' : 'hover:border-primary/50'}`}>
              
              <div className="flex items-center gap-4 mb-4 sm:mb-0">
                 <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${s.isHeadPriest ? 'bg-amber-100 text-amber-700' : 'bg-primary/10 text-primary'}`}>
                    {s.user.firstName?.charAt(0) || s.user.email.charAt(0).toUpperCase()}
                 </div>
                 <div>
                    <h3 className="font-bold flex items-center gap-2">
                      {s.user.firstName} {s.user.lastName} 
                      {s.isHeadPriest && <span title="Προϊστάμενος - Απεριόριστα Δικαιώματα"><ShieldAlert className="w-4 h-4 text-amber-500" /></span>}
                    </h3>
                    <p className="text-xs text-muted-foreground">{s.user.email}</p>
                 </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                 {s.isHeadPriest ? (
                    <div className="text-sm font-semibold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-3 py-1.5 rounded-full border border-amber-200 dark:border-amber-700/50">
                       Προϊστάμενος Ναού
                    </div>
                 ) : (
                    <select 
                      disabled={loading}
                      value={s.roleId || ''} 
                      onChange={e => handleChangeRole(s.id, e.target.value)}
                      className="text-sm border-border bg-background rounded-md px-2 py-1.5 max-w-[150px] shadow-sm"
                    >
                      <option value="" disabled>Χωρίς Ρόλο</option>
                      {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                 )}

                 {!s.isHeadPriest && (
                    <Button variant="ghost" size="icon" onClick={() => handleRemove(s.id, s.user.firstName)} className="text-destructive hover:bg-destructive/10">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                 )}
              </div>
            </Card>
         ))}

      </div>

    </div>
  )
}
