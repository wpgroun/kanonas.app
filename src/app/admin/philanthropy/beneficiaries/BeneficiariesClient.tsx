'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Check, X, Star } from 'lucide-react';
import { updateBeneficiaryStatus } from '@/actions/philanthropy';

export default function BeneficiariesClient({ initialData }: { initialData: any[] }) {
  const [beneficiaries, setBeneficiaries] = useState(initialData);

  const handleStatusChange = async (id: string, status: string) => {
    const res = await updateBeneficiaryStatus(id, status);
    if(res.success) {
      setBeneficiaries(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    } else {
      alert(res.error);
    }
  };

  const getStatusColor = (s: string) => {
    switch(s) {
      case 'APPROVED': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'REJECTED': return 'bg-rose-100 text-rose-800 border-rose-200';
      default: return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  const getStatusLabel = (s: string) => {
    switch(s) {
      case 'APPROVED': return 'Ενεργός';
      case 'REJECTED': return 'Απορρίφθηκε';
      default: return 'Σε Έγκριση';
    }
  };

  return (
    <div className="space-y-4">
       <div className="flex justify-end">
          <Button className="gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-md border-0">
            <Plus className="w-4 h-4"/> Νέα Αίτηση Ένταξης
          </Button>
       </div>

       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {beneficiaries.map((b) => (
             <Card key={b.id} className="p-4 flex flex-col gap-4 border border-border shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                   <div>
                     <h3 className="font-bold text-lg">{b.firstName} {b.lastName}</h3>
                     <p className="text-sm text-gray-500">{b.phoneNumber || 'Χωρίς Τηλέφωνο'}</p>
                     <p className="text-xs text-gray-400 mt-1">{b.address || 'Άγνωστη Διεύθυνση'}</p>
                   </div>
                   <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(b.status)}`}>
                     {getStatusLabel(b.status)}
                   </span>
                </div>

                <div className="flex items-center gap-4 text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded-lg">
                   <div className="flex flex-col">
                     <span className="text-gray-500 text-xs">Μέλη Οικογ.</span>
                     <span className="font-semibold text-center">{b.familyMembers}</span>
                   </div>
                   <div className="flex flex-col">
                     <span className="text-gray-500 text-xs truncate">Needs Score</span>
                     <div className="flex items-center justify-center font-semibold text-primary">
                        <Star className="w-3 h-3 mr-1 fill-primary"/> {b.needsScore}/100
                     </div>
                   </div>
                </div>

                <div className="flex gap-2 mt-auto pt-2 border-t border-border">
                  {b.status !== 'APPROVED' && (
                     <Button 
                       variant="outline" 
                       className="w-full text-emerald-600 border-emerald-200 hover:bg-emerald-50 focus:ring-emerald-500"
                       onClick={() => handleStatusChange(b.id, 'APPROVED')}
                     >
                       <Check className="w-4 h-4 mr-1"/> Έγκριση
                     </Button>
                  )}
                  {b.status !== 'REJECTED' && (
                     <Button 
                       variant="outline" 
                       className="w-full text-rose-600 border-rose-200 hover:bg-rose-50 focus:ring-rose-500"
                       onClick={() => handleStatusChange(b.id, 'REJECTED')}
                     >
                       <X className="w-4 h-4 mr-1"/> Απόρριψη
                     </Button>
                  )}
                </div>
             </Card>
          ))}
          
          {beneficiaries.length === 0 && (
             <div className="col-span-full py-12 text-center text-gray-500 bg-white dark:bg-gray-900 border border-dashed rounded-xl">
                Δεν βρέθηκαν αιτήσεις Ωφελουμένων.
             </div>
          )}
       </div>
    </div>
  );
}
