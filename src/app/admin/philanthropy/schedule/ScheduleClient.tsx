'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Utensils, Save, AlertCircle } from 'lucide-react';
import { createOrUpdateSchedule, markAttendance } from '@/actions/schedule';

export default function ScheduleClient({ initialDateStr, schedule, beneficiaries }: any) {
  const router = useRouter();
  
  const [dateStr, setDateStr] = useState(initialDateStr.split('T')[0]);
  const [mealName, setMealName] = useState(schedule?.mealName || '');
  const [planned, setPlanned] = useState(schedule?.portionsPlanned || 0);

  const handleDateChange = (e: any) => {
    const newDate = e.target.value;
    setDateStr(newDate);
    router.push(`/admin/philanthropy/schedule?date=${newDate}`);
  };

  const saveMenu = async () => {
    const res = await createOrUpdateSchedule(dateStr, mealName, planned);
    if(res.success) alert("Το μενού αποθηκεύτηκε");
  };

  const handleAttendance = async (benId: string, status: string) => {
    if(!schedule?.id) return alert("Αποθηκεύστε πρώτα το μενού της ημέρας!");
    const res = await markAttendance(benId, schedule.id, status);
    if(!res.success) alert(res.error);
  };

  const getAttendanceStatus = (benId: string) => {
     if(!schedule || !schedule.attendances) return 'EXPECTED';
     const att = schedule.attendances.find((a: any) => a.beneficiaryId === benId);
     return att ? (att.wasAbsent ? 'ABSENT' : 'SERVED') : 'EXPECTED';
  };

  return (
    <div className="space-y-6">
       {/* Menu Control Panel */}
       <Card className="p-4 bg-white dark:bg-gray-900 border border-border flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full space-y-2">
             <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Ημερομηνία</label>
             <input type="date" value={dateStr} onChange={handleDateChange} className="w-full p-2 border border-border rounded-md bg-transparent" />
          </div>
          <div className="flex-[2] w-full space-y-2">
             <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Γεύμα Ημέρας</label>
             <div className="relative">
                <Utensils className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  value={mealName} 
                  onChange={(e)=>setMealName(e.target.value)} 
                  placeholder="π.χ. Φακές με ψωμί" 
                  className="w-full pl-9 p-2 border border-border rounded-md bg-transparent" 
                />
             </div>
          </div>
          <div className="flex-1 w-full space-y-2">
             <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Μερίδες</label>
             <input 
               type="number" 
               value={planned} 
               onChange={(e)=>setPlanned(Number(e.target.value))} 
               className="w-full p-2 border border-border rounded-md bg-transparent" 
             />
          </div>
          <Button onClick={saveMenu} className="bg-emerald-600 hover:bg-emerald-700 w-full md:w-auto h-10 gap-2">
             <Save className="w-4 h-4"/> Αποθήκευση
          </Button>
       </Card>

       {/* Attendance Register */}
       <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="p-4 border-b border-border bg-gray-50/50 dark:bg-gray-800/50">
             <h2 className="font-bold">Παρουσιολόγιο Διανομής</h2>
             <p className="text-sm text-gray-500">Καταγράψτε την παραλαβή για να αποφευχθεί η σπατάλη</p>
          </div>
          
          <div className="divide-y divide-border">
             {beneficiaries.map((ben: any) => {
                const status = getAttendanceStatus(ben.id);
                return (
                  <div key={ben.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                     <div>
                        <p className="font-bold">{ben.firstName} {ben.lastName}</p>
                        <p className="text-xs text-gray-500">Δικαιούχες Μερίδες: {ben.familyMembers}</p>
                     </div>
                     <div className="flex gap-2">
                        <Button 
                          variant={status === 'SERVED' ? 'primary' : 'outline'}
                          className={status === 'SERVED' ? 'bg-emerald-600 text-white' : ''}
                          onClick={() => handleAttendance(ben.id, 'SERVED')}
                        >
                           <CheckCircle2 className="w-4 h-4 mr-2"/> Παρέλαβε
                        </Button>
                        <Button 
                          variant={status === 'ABSENT' ? 'destructive' : 'outline'}
                          onClick={() => handleAttendance(ben.id, 'ABSENT')}
                        >
                           <XCircle className="w-4 h-4 mr-2"/> Απουσία
                        </Button>
                     </div>
                  </div>
                );
             })}

             {beneficiaries.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                   Δεν υπάρχουν Ενεργοί Ωφελούμενοι.
                </div>
             )}
          </div>
       </div>
    </div>
  );
}
