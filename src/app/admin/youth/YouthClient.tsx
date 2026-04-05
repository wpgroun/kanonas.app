'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tent, Users, Plus, Trash2, Calendar, Activity, AlertTriangle, ShieldCheck, HeartPulse, GraduationCap, X } from 'lucide-react';
import { createYouthProgram, deleteYouthProgram, createParticipant, deleteParticipant, updateConsent, enrollParticipant, unenrollParticipant } from '@/actions/youth';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function YouthClient({ initialPrograms, initialParticipants }: any) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'PROGRAMS' | 'CHILDREN'>('CHILDREN');
  const [loading, setLoading] = useState(false);

  // New Program
  const [newProgName, setNewProgName] = useState('');
  const [newProgDesc, setNewProgDesc] = useState('');
  const [newProgStart, setNewProgStart] = useState('');
  const [newProgEnd, setNewProgEnd] = useState('');

  // New Child
  const [newChildFirst, setNewChildFirst] = useState('');
  const [newChildLast, setNewChildLast] = useState('');
  const [newChildAge, setNewChildAge] = useState('');
  const [newParentName, setNewParentName] = useState('');
  const [newParentPhone, setNewParentPhone] = useState('');
  const [newMedicalNotes, setNewMedicalNotes] = useState('');
  const [newConsent, setNewConsent] = useState(false);

  const handleCreateProgram = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    await createYouthProgram({ 
       name: newProgName, 
       description: newProgDesc, 
       startDate: newProgStart ? new Date(newProgStart) : undefined,
       endDate: newProgEnd ? new Date(newProgEnd) : undefined
    });
    setNewProgName(''); setNewProgDesc(''); setNewProgStart(''); setNewProgEnd('');
    setLoading(false);
    router.refresh();
  };

  const handleCreateChild = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    await createParticipant({ 
      firstName: newChildFirst, lastName: newChildLast, 
      birthDate: newChildAge ? new Date(newChildAge) : undefined,
      parentName: newParentName, parentPhone: newParentPhone, 
      medicalNotes: newMedicalNotes, hasConsent: newConsent 
    });
    setNewChildFirst(''); setNewChildLast(''); setNewChildAge('');
    setNewParentName(''); setNewParentPhone(''); setNewMedicalNotes(''); setNewConsent(false);
    setLoading(false);
    router.refresh();
    const closeBtn = document.getElementById('close-child-dialog');
    if(closeBtn) closeBtn.click();
  };

  return (
    <div className="space-y-6">
       {/* Tabs */}
       <div className="flex bg-muted/30 p-1 rounded-xl w-fit border border-border">
          <Button variant={activeTab === 'CHILDREN' ? 'primary' : 'ghost'} className="rounded-lg gap-2" onClick={() => setActiveTab('CHILDREN')}>
             <Users className="w-4 h-4"/> Μητρώο Παιδιών
          </Button>
          <Button variant={activeTab === 'PROGRAMS' ? 'primary' : 'ghost'} className="rounded-lg gap-2" onClick={() => setActiveTab('PROGRAMS')}>
             <Tent className="w-4 h-4"/> Προγράμματα & Δράσεις
          </Button>
       </div>

       {/* CHILDREN TAB */}
       {activeTab === 'CHILDREN' && (
         <div className="space-y-6">
            <div className="flex justify-between items-center">
               <h2 className="text-xl font-bold text-foreground">Λίστα Παιδιών (Νεολαία)</h2>
               <Dialog>
                 <DialogTrigger asChild>
                   <Button variant="primary" className="gap-2"><Plus className="w-4 h-4"/> Εγγραφή Παιδιού</Button>
                 </DialogTrigger>
                 <DialogContent className="max-w-md">
                   <DialogHeader><DialogTitle>Καρτέλα Νέου Παιδιού</DialogTitle></DialogHeader>
                   <form onSubmit={handleCreateChild} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                         <input required type="text" placeholder="Όνομα Παιδιού" className="data-input w-full" value={newChildFirst} onChange={e=>setNewChildFirst(e.target.value)} />
                         <input required type="text" placeholder="Επώνυμο Παιδιού" className="data-input w-full" value={newChildLast} onChange={e=>setNewChildLast(e.target.value)} />
                      </div>
                      <input type="date" className="data-input w-full text-sm" value={newChildAge} onChange={e=>setNewChildAge(e.target.value)} title="Ημερομηνία Γέννησης" />
                      
                      <div className="p-3 bg-slate-50 border rounded-lg space-y-3 mt-4">
                         <p className="text-xs font-bold text-slate-500 uppercase">Στοιχεία Κηδεμόνα</p>
                         <input required type="text" placeholder="Ονοματεπώνυμο Γονέα" className="data-input w-full" value={newParentName} onChange={e=>setNewParentName(e.target.value)} />
                         <input required type="text" placeholder="Τηλέφωνο Επικοινωνίας" className="data-input w-full" value={newParentPhone} onChange={e=>setNewParentPhone(e.target.value)} />
                      </div>

                      <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg space-y-3 mt-4">
                         <p className="text-xs font-bold text-rose-600 uppercase flex items-center gap-1"><HeartPulse className="w-3.5 h-3.5"/> Ιατρικό Ιστορικό</p>
                         <textarea 
                           placeholder="Αλλεργίες, φάρμακα, δυσανεξίες, κλπ (Προαιρετικό)" 
                           className="data-input w-full resize-none text-sm" 
                           rows={3} 
                           value={newMedicalNotes} 
                           onChange={e=>setNewMedicalNotes(e.target.value)} 
                         />
                      </div>

                      <label className="flex items-center gap-2 text-sm p-3 border rounded-lg hover:bg-slate-50 cursor-pointer">
                         <input type="checkbox" className="w-4 h-4 text-primary" checked={newConsent} onChange={e=>setNewConsent(e.target.checked)} />
                         <span>Υπογράφηκε Δήλωση Συναίνεσης Κηδεμόνα (Νομικό)</span>
                      </label>

                      <div className="flex gap-2 justify-end pt-2">
                         <Button type="button" variant="ghost" id="close-child-dialog" onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', {'key': 'Escape'}))}>Ακύρωση</Button>
                         <Button type="submit" disabled={loading}>Αποθήκευση</Button>
                      </div>
                   </form>
                 </DialogContent>
               </Dialog>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {initialParticipants.map((child: any) => (
                  <Card key={child.id} className="shadow-sm border-border hover:shadow-md transition-shadow relative overflow-hidden group">
                     {child.medicalNotes && (
                        <div className="absolute top-0 right-0 p-2 bg-rose-100 text-rose-600 rounded-bl-xl tooltip" title={child.medicalNotes}>
                           <AlertTriangle className="w-4 h-4" />
                        </div>
                     )}
                     <CardHeader className="pb-2">
                        <CardTitle className="text-lg text-foreground flex justify-between items-start">
                           {child.firstName} {child.lastName}
                           <Button variant="ghost" size="icon" className="h-6 w-6 text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={async () => {
                              if(confirm('Διαγραφή παιδιού;')) { await deleteParticipant(child.id); router.refresh(); }
                           }}><Trash2 className="w-3.5 h-3.5"/></Button>
                        </CardTitle>
                        <div className="text-xs text-muted-foreground flex gap-3 mt-1">
                          {child.birthDate && <span>Γενν: {new Date(child.birthDate).getFullYear()}</span>}
                        </div>
                     </CardHeader>
                     <CardContent className="space-y-3">
                        <div className="text-sm bg-muted/40 p-2 rounded-md">
                           <div className="font-semibold">{child.parentName}</div>
                           <div className="text-muted-foreground">{child.parentPhone}</div>
                        </div>

                        <div className="flex items-center justify-between text-xs font-medium">
                           <span className="text-muted-foreground">Συναίνεση:</span>
                           {child.parentConsentDate ? (
                             <span className="text-emerald-600 flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5"/> Υπογεγραμμένη</span>
                           ) : (
                             <button onClick={async() => { await updateConsent(child.id, true); router.refresh(); }} className="text-amber-600 flex items-center gap-1 hover:underline"><AlertTriangle className="w-3.5 h-3.5"/> Εκκρεμεί</button>
                           )}
                        </div>

                        {/* Enrollments */}
                        <div className="pt-2 border-t border-border/50">
                           <p className="text-xs font-bold text-muted-foreground mb-2 flex items-center gap-1"><Tent className="w-3 h-3"/> Εγγραφές:</p>
                           <div className="space-y-1">
                              {child.enrollments.map((enr: any) => (
                                <div key={enr.id} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-md flex justify-between items-center">
                                   <span className="truncate">{enr.program.name}</span>
                                   <button className="text-primary/50 hover:text-rose-500 transition-colors" onClick={async () => {
                                      await unenrollParticipant(enr.programId, child.id); router.refresh();
                                   }}><X className="w-3 h-3"/></button>
                                </div>
                              ))}
                              {child.enrollments.length === 0 && <span className="text-xs text-slate-400 italic">Καμία εγγραφή</span>}
                           </div>
                           <div className="mt-2">
                             <select className="text-xs w-full p-1 border rounded-md bg-transparent" onChange={async (e) => {
                                if(e.target.value) {
                                   await enrollParticipant(e.target.value, child.id);
                                   router.refresh();
                                   e.target.value = '';
                                }
                             }}>
                               <option value="">+ Εγγραφή σε Πρόγραμμα</option>
                               {initialPrograms.map((p: any) => (
                                 !child.enrollments.some((x:any)=>x.programId === p.id) && <option key={p.id} value={p.id}>{p.name}</option>
                               ))}
                             </select>
                           </div>
                        </div>
                     </CardContent>
                  </Card>
               ))}
               {initialParticipants.length === 0 && (
                  <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed rounded-xl">
                     Δεν υπάρχουν εγγεγραμμένα παιδιά.
                  </div>
               )}
            </div>
         </div>
       )}

       {/* PROGRAMS TAB */}
       {activeTab === 'PROGRAMS' && (
          <div className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="col-span-1 shadow-sm h-fit">
                   <CardHeader className="bg-muted/20 border-b border-border/50"><CardTitle className="text-base flex items-center gap-2"><Tent className="w-4 h-4"/> Νέο Πρόγραμμα</CardTitle></CardHeader>
                   <CardContent className="pt-4">
                      <form onSubmit={handleCreateProgram} className="space-y-3">
                         <input required type="text" placeholder="Π.χ. Κατασκήνωση Α' Περιόδου" className="data-input w-full" value={newProgName} onChange={e=>setNewProgName(e.target.value)} />
                         <textarea placeholder="Περιγραφή (Προαιρετικό)" className="data-input w-full resize-none" rows={3} value={newProgDesc} onChange={e=>setNewProgDesc(e.target.value)} />
                         <div className="grid grid-cols-2 gap-2">
                           <div className="space-y-1"><label className="text-xs font-medium text-slate-500">Έναρξη</label><input type="date" className="data-input w-full text-sm" value={newProgStart} onChange={e=>setNewProgStart(e.target.value)} /></div>
                           <div className="space-y-1"><label className="text-xs font-medium text-slate-500">Λήξη</label><input type="date" className="data-input w-full text-sm" value={newProgEnd} onChange={e=>setNewProgEnd(e.target.value)} /></div>
                         </div>
                         <Button type="submit" disabled={loading} className="w-full">Δημιουργία</Button>
                      </form>
                   </CardContent>
                </Card>

                <div className="col-span-1 md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                   {initialPrograms.map((prog: any) => (
                      <Card key={prog.id} className="shadow-sm border-border flex flex-col">
                         <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex justify-between items-start">
                               {prog.name}
                               <Button variant="ghost" size="icon" className="h-6 w-6 text-rose-500" onClick={async () => {
                                  if(confirm('Διαγραφή δράσης;')) { await deleteYouthProgram(prog.id); router.refresh(); }
                               }}><Trash2 className="w-3.5 h-3.5"/></Button>
                            </CardTitle>
                         </CardHeader>
                         <CardContent className="flex-1 flex flex-col">
                            <div className="flex gap-2 text-xs text-muted-foreground mb-3 font-medium">
                               {prog.startDate && <span>Εν: {new Date(prog.startDate).toLocaleDateString('el-GR')}</span>}
                               {prog.endDate && <span>Ληξ: {new Date(prog.endDate).toLocaleDateString('el-GR')}</span>}
                            </div>
                            <p className="text-sm text-muted-foreground mb-4 flex-1">{prog.description || 'Χωρίς περιγραφή'}</p>
                            
                            <div className="bg-primary/5 border border-primary/20 p-3 rounded-lg flex items-center justify-between mt-auto">
                               <div className="text-sm font-semibold text-primary flex items-center gap-2"><Users className="w-4 h-4"/> Εγγεγραμμένα Παιδιά</div>
                               <span className="bg-primary text-primary-foreground font-bold px-2.5 py-0.5 rounded-full text-sm">{prog.enrollments.length}</span>
                            </div>
                         </CardContent>
                      </Card>
                   ))}
                </div>
             </div>
          </div>
       )}
    </div>
  );
}
