'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HeartPulse, Plus, Search, Calendar, Phone, Activity } from 'lucide-react';
import { addBloodDonor, recordDonation } from '@/actions/bloodbank';
import { toast } from 'sonner';

export default function BloodBankClient({ initialDonors }: any) {
  const [search, setSearch] = useState('');
  const [bloodTypeFilter, setBloodTypeFilter] = useState('ALL');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  const filteredDonors = initialDonors.filter((d: any) => {
     const matchSearch = d.lastName.toLowerCase().includes(search.toLowerCase()) || d.firstName.toLowerCase().includes(search.toLowerCase());
     const matchType = bloodTypeFilter === 'ALL' || d.bloodType === bloodTypeFilter;
     return matchSearch && matchType;
  });

  // A donor is ready if last donation was more than 90 days ago
  const isDonorReady = (lastDateStr: string | null) => {
     if (!lastDateStr) return true;
     const lastDate = new Date(lastDateStr);
     const diffTime = Math.abs(new Date().getTime() - lastDate.getTime());
     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
     return diffDays >= 90;
  };

  const handleCreateDonor = async (e: React.FormEvent<HTMLFormElement>) => {
     e.preventDefault();
     const fd = new FormData(e.currentTarget);
     const payload = {
        firstName: fd.get('firstName'),
        lastName: fd.get('lastName'),
        phone: fd.get('phone'),
        bloodType: fd.get('bloodType')
     };
     
     toast.promise(addBloodDonor(payload), {
        loading: 'Εγγραφή Αιμοδότη...',
        success: (res) => {
           if(!res.success) throw new Error(res.error);
           setIsNewModalOpen(false);
           return 'Ο Αιμοδότης προστέθηκε στο Μητρώο!';
        },
        error: (err) => err.message
     });
  };

  const handleRecordDonation = async (donorId: string) => {
     const date = prompt('Ημερομηνία Αιμοδοσίας (YYYY-MM-DD):', new Date().toISOString().split('T')[0]);
     if (!date) return;
     const hospital = prompt('Νοσοκομείο / Κέντρο Αιμοδοσίας (Προαιρετικό):');
     
     toast.promise(recordDonation(donorId, { date, hospital }), {
        loading: 'Καταγραφή...',
        success: (res) => {
           if(!res.success) throw new Error(res.error);
           return 'Το ιστορικό ενημερώθηκε!';
        },
        error: 'Αποτυχία'
     });
  };

  return (
    <div className="space-y-6">
       
       <div className="flex flex-col md:flex-row justify-between bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-border gap-4">
          <div className="flex flex-1 gap-4 items-center max-w-2xl">
             <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Αναζήτηση Αιμοδότη..." className="pl-9" />
             </div>
             <Select value={bloodTypeFilter} onValueChange={setBloodTypeFilter}>
                <SelectTrigger className="w-32"><SelectValue placeholder="Ομάδα" /></SelectTrigger>
                <SelectContent>
                   <SelectItem value="ALL">Όλες</SelectItem>
                   <SelectItem value="A+">A+</SelectItem><SelectItem value="A-">A-</SelectItem>
                   <SelectItem value="B+">B+</SelectItem><SelectItem value="B-">B-</SelectItem>
                   <SelectItem value="O+">O+</SelectItem><SelectItem value="O-">O-</SelectItem>
                   <SelectItem value="AB+">AB+</SelectItem><SelectItem value="AB-">AB-</SelectItem>
                </SelectContent>
             </Select>
          </div>
          <Button onClick={() => setIsNewModalOpen(true)} className="bg-red-600 hover:bg-red-700 text-white gap-2">
             <HeartPulse className="w-5 h-5" /> Εγγραφή Αιμοδότη
          </Button>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredDonors.map((d: any) => {
             const ready = isDonorReady(d.lastDonation);
             return (
               <Card key={d.id} className="p-0 border-border overflow-hidden flex flex-col group">
                  <div className={`h-2 w-full ${ready ? 'bg-green-500' : 'bg-amber-500'}`} />
                  <div className="p-5 flex-1 flex flex-col">
                     <div className="flex justify-between items-start mb-3">
                        <div>
                           <h3 className="font-bold text-lg">{d.lastName} {d.firstName}</h3>
                           <p className="text-sm text-gray-500 flex items-center gap-1 mt-1"><Phone className="w-3 h-3"/> {d.phone || 'Χωρίς Τηλέφωνο'}</p>
                        </div>
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-600 font-black text-xl border-2 border-red-200 shadow-sm shrink-0">
                           {d.bloodType}
                        </div>
                     </div>

                     <div className="mt-4 bg-slate-50 dark:bg-slate-900 p-3 rounded-lg flex flex-col gap-2 text-sm border border-border/50">
                        <div className="flex justify-between">
                           <span className="text-gray-500">Προσφορές:</span>
                           <span className="font-bold">{d.donations.length} φορές</span>
                        </div>
                        <div className="flex justify-between">
                           <span className="text-gray-500">Τελευταία Αιμοδοσία:</span>
                           <span className="font-medium">{d.lastDonation ? new Date(d.lastDonation).toLocaleDateString("el-GR") : 'Ποτέ'}</span>
                        </div>
                        <div className={`mt-2 py-1 px-2 rounded-md text-center text-xs font-bold ${ready ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                           {ready ? '✓ ΕΓΚΕΚΡΙΜΕΝΟΣ ΓΙΑ ΑΙΜΟΔΟΣΙΑ' : '❌ ΣΕ ΠΕΡΙΟΔΟ ΑΝΑΜΟΝΗΣ (90 Ημέρες)'}
                        </div>
                     </div>

                     <Button variant="outline" className="w-full mt-4 gap-2 hover:border-red-400 hover:text-red-600 transition-colors" onClick={() => handleRecordDonation(d.id)}>
                        <Activity className="w-4 h-4" /> Καταγραφή Νέας Προσφοράς
                     </Button>
                  </div>
               </Card>
             );
          })}
          {filteredDonors.length === 0 && (
             <div className="col-span-full py-16 text-center border-2 border-dashed border-border rounded-xl">
                 <HeartPulse className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                 <p className="text-gray-500 font-medium">Δεν βρέθηκαν αιμοδότες.</p>
             </div>
          )}
       </div>

       {isNewModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
             <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="p-5 border-b border-border bg-slate-50 dark:bg-slate-800/50">
                   <h2 className="text-lg font-bold flex items-center gap-2"><HeartPulse className="text-red-500 w-5 h-5"/> Νέος Εθελοντής Αιμοδότης</h2>
                </div>
                <form onSubmit={handleCreateDonor} className="p-5 space-y-4">
                   <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1"><label className="text-sm font-semibold">Όνομα</label><Input name="firstName" required /></div>
                     <div className="space-y-1"><label className="text-sm font-semibold">Επώνυμο</label><Input name="lastName" required /></div>
                   </div>
                   <div className="space-y-1">
                      <label className="text-sm font-semibold">Τηλέφωνο Επικοινωνίας (Για Έκτακτη Ανάγκη)</label>
                      <Input name="phone" required placeholder="π.χ. 6900000000" />
                   </div>
                   <div className="space-y-1">
                      <label className="text-sm font-semibold">Ομάδα Αίματος</label>
                      <Select name="bloodType" defaultValue="O+">
                         <SelectTrigger><SelectValue/></SelectTrigger>
                         <SelectContent>
                            <SelectItem value="A+">A+</SelectItem><SelectItem value="A-">A-</SelectItem>
                            <SelectItem value="B+">B+</SelectItem><SelectItem value="B-">B-</SelectItem>
                            <SelectItem value="O+">O+</SelectItem><SelectItem value="O-">O-</SelectItem>
                            <SelectItem value="AB+">AB+</SelectItem><SelectItem value="AB-">AB-</SelectItem>
                         </SelectContent>
                      </Select>
                   </div>
                   <div className="flex gap-3 pt-4">
                      <Button type="button" onClick={()=>setIsNewModalOpen(false)} variant="outline" className="flex-1">Ακύρωση</Button>
                      <Button type="submit" className="flex-1 bg-red-600 hover:bg-red-700 text-white">Καταχώρηση</Button>
                   </div>
                </form>
             </div>
          </div>
       )}

    </div>
  );
}
