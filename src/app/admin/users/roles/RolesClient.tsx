'use client'

import { useState } from 'react'
import { createTempleRole, updateTempleRole, deleteTempleRole } from '@/actions/roles'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ShieldCheck, Plus, Trash2, Edit2, Users, Save, X } from 'lucide-react'

// Object containing all available permissions logically grouped
const PERMISSION_GROUPS = [
  {
    title: '🗄️ Διοίκηση & Οικονομικά',
    keys: [
      { id: 'canViewFinances', label: 'Προβολή Οικονομικών', desc: 'Μπορεί να βλέπει εσοδα-έξοδα' },
      { id: 'canEditFinances', label: 'Διαχείριση Οικονομικών', desc: 'Προσθέτει νέες αποδείξεις' },
      { id: 'canManageAssets', label: 'Διαχείριση Περιουσίας', desc: 'Προβολή/Επεξεργασία ακινήτων' },
    ]
  },
  {
    title: '⛪ Μυστήρια & Μητρώο',
    keys: [
      { id: 'canManageRequests', label: 'Έγκριση Μυστηρίων', desc: 'Αποδοχή/Απόρριψη αιτήσεων γάμου κλπ' },
      { id: 'canManageRegistry', label: 'Μητρώο Ενοριτών', desc: 'Πλήρης πρόσβαση στο CRM ενοριτών' },
      { id: 'canManageProtocol', label: 'Βιβλίο Πρωτοκόλλου', desc: 'Έκδοση και προβολή εξερχομένων/εισερχομένων' },
      { id: 'canManageSchedule', label: 'Ημερολόγιο Ναού', desc: 'Προσθήκη ακολουθιών και ωρών' },
    ]
  },
  {
    title: '🍲 Φιλόπτωχο & Εθελοντισμός',
    keys: [
      { id: 'canViewBeneficiaries', label: 'Προβολή Σισσιτίου', desc: 'Βλέπει τα ονόματα των ωφελούμενων' },
      { id: 'canManageBeneficiaries', label: 'Επεξεργασία Ωφελούμενων', desc: 'Προσθήκη νέων ωφελούμενων' },
      { id: 'canViewBeneficiaryDocs', label: 'Προβολή Εγγράφων', desc: 'Μπορεί να βλέπει Ε1 και ταυτότητες στο Vault' },
      { id: 'canViewInventory', label: 'Αποθήκη Τροφίμων (Προβολή)', desc: 'Βλέπει διαθέσιμα τρόφιμα' },
      { id: 'canManageInventory', label: 'Αποθήκη Τροφίμων (Επεξ.)', desc: 'Μπορεί να προσθέτει νέα τρόφιμα/αποθέματα' },
    ]
  }
];

export default function RolesClient({ initialRoles }: { initialRoles: any[] }) {
  const [roles, setRoles] = useState(initialRoles);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [roleName, setRoleName] = useState('');
  const [perms, setPerms] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  const startNewRole = () => {
    setEditingId('NEW');
    setRoleName('');
    setPerms({});
  };

  const startEditRole = (role: any) => {
    setEditingId(role.id);
    setRoleName(role.name);
    
    // Extract only the boolean permissions into our state
    const currentPerms: Record<string, boolean> = {};
    PERMISSION_GROUPS.forEach(g => {
      g.keys.forEach(k => {
        currentPerms[k.id] = role[k.id] === true;
      });
    });
    setPerms(currentPerms);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setRoleName('');
    setPerms({});
  };

  const togglePerm = (id: string) => {
    setPerms(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const selectGroup = (groupKeys: any[], state: boolean) => {
    const newPerms = { ...perms };
    groupKeys.forEach(k => {
       newPerms[k.id] = state;
    });
    setPerms(newPerms);
  };

  const handleSave = async () => {
    if(!roleName.trim()) { alert('Το όνομα του Ρόλου είναι υποχρεωτικό.'); return; }
    
    setLoading(true);
    let res;
    if (editingId === 'NEW') {
      res = await createTempleRole({ name: roleName, permissions: perms });
    } else {
      res = await updateTempleRole(editingId as string, { name: roleName, permissions: perms });
    }
    
    setLoading(false);
    
    if(res.success) {
       window.location.reload(); 
    } else {
       alert(res.error || 'Σφάλμα');
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Είστε σίγουροι ότι θέλετε να διαγράψετε αυτόν τον Ρόλο;")) return;
    setLoading(true);
    const res = await deleteTempleRole(id);
    setLoading(false);
    if(res.success) {
      window.location.reload(); 
    } else {
      alert(res.error || 'Σφάλμα κατά τη διαγραφή');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">
      
      {/* ΛΙΣΤΑ ΡΟΛΩΝ */}
      <div className={`col-span-1 lg:col-span-4 flex flex-col gap-4 ${editingId ? 'opacity-50 pointer-events-none' : ''}`}>
         <Button onClick={startNewRole} className="w-full h-12 shadow-md mb-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white border-0">
           <Plus className="w-4 h-4 mr-2" /> Δημιουργία Νέου Ρόλου
         </Button>

         {roles.map(r => (
           <Card key={r.id} className="shadow-sm border-border/50 hover:border-primary/50 transition-colors cursor-pointer group">
             <CardContent className="p-4 flex items-center justify-between">
                <div onClick={() => startEditRole(r)} className="flex-1">
                  <h3 className="font-bold text-foreground flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary" /> {r.name}
                  </h3>
                  <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                     <Users className="w-3 h-3" /> {r._count?.users || 0} Προσωπικό
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDelete(r.id); }} className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="w-4 h-4" />
                </Button>
             </CardContent>
           </Card>
         ))}

         {roles.length === 0 && (
            <div className="text-center p-8 border border-dashed rounded-lg bg-muted/20 text-muted-foreground text-sm">
               Δεν έχετε δημιουργήσει ρόλους.
            </div>
         )}
      </div>

      {/* ΦΟΡΜΑ ΕΠΕΞΕΡΓΑΣΙΑΣ / ΔΗΜΙΟΥΡΓΙΑΣ */}
      <div className="col-span-1 lg:col-span-8">
         {editingId ? (
            <Card className="shadow-lg border-primary/20 sticky top-6">
              <CardHeader className="bg-muted/30 pb-4 border-b border-border/50 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl">
                    {editingId === 'NEW' ? 'Δημιουργία Νέου Ρόλου' : `Τροποποίηση: ${roleName}`}
                  </CardTitle>
                  <CardDescription>Ορίστε τα δικαιώματα πρόσβασης για αυτό το γκρουπ υπαλλήλων.</CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={cancelEdit}><X className="w-5 h-5"/></Button>
              </CardHeader>
              
              <CardContent className="pt-6 space-y-8">
                <div className="space-y-2">
                  <Label className="text-base">Όνομα Ρόλου</Label>
                  <Input 
                    placeholder="π.χ. Γραμματεία, Εθελοντής Σισσιτίου" 
                    value={roleName} 
                    onChange={e => setRoleName(e.target.value)}
                    className="max-w-md text-lg h-12"
                  />
                </div>

                <div className="space-y-6">
                   {PERMISSION_GROUPS.map((group, gIdx) => (
                      <div key={gIdx} className="bg-card border border-border/50 rounded-xl overflow-hidden">
                         <div className="bg-muted/50 p-3 px-4 border-b border-border flex justify-between items-center">
                           <h4 className="font-semibold text-sm text-primary">{group.title}</h4>
                           <div className="flex gap-2">
                             <button onClick={() => selectGroup(group.keys, true)} className="text-[10px] uppercase font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">Όλα</button>
                             <button onClick={() => selectGroup(group.keys, false)} className="text-[10px] uppercase font-bold text-destructive hover:text-red-700 bg-red-100 px-2 py-0.5 rounded">Κανένα</button>
                           </div>
                         </div>
                         <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {group.keys.map(k => (
                               <div 
                                 key={k.id} 
                                 onClick={() => togglePerm(k.id)}
                                 className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${perms[k.id] ? 'bg-primary/5 border-primary/30' : 'bg-transparent border-transparent hover:bg-muted'}`}
                               >
                                 <div className={`w-5 h-5 mt-0.5 rounded flex items-center justify-center shrink-0 border ${perms[k.id] ? 'bg-primary border-primary' : 'bg-background border-input'}`}>
                                    {perms[k.id] && <CheckIcon className="w-3.5 h-3.5 text-primary-foreground" />}
                                 </div>
                                 <div>
                                   <div className={`text-sm font-semibold ${perms[k.id] ? 'text-foreground' : 'text-muted-foreground'}`}>{k.label}</div>
                                   <div className="text-xs text-muted-foreground mt-0.5">{k.desc}</div>
                                 </div>
                               </div>
                            ))}
                         </div>
                      </div>
                   ))}
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-border">
                  <Button variant="outline" onClick={cancelEdit}>Ακύρωση</Button>
                  <Button onClick={handleSave} disabled={loading || !roleName.trim()}>
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? 'Αποθήκευση...' : 'Αποθήκευση Ρόλου'}
                  </Button>
                </div>

              </CardContent>
            </Card>
         ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border/60 rounded-xl bg-card/50">
               <ShieldCheck className="w-16 h-16 text-muted-foreground/30 mb-4" />
               <h3 className="text-lg font-medium">Διαχείριση Δικαιωμάτων</h3>
               <p className="text-sm max-w-sm text-center mt-2">Επιλέξτε έναν ρόλο από τα αριστερά για επεξεργασία, ή δημιουργήστε έναν εντελώς νέο προσαρμοσμένο ρόλο.</p>
            </div>
         )}
      </div>

    </div>
  )
}

function CheckIcon(props: any) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}
