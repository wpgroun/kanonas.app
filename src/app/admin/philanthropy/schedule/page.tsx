import { getSchedule } from '@/actions/schedule';
import ScheduleClient from './ScheduleClient';

export const metadata = {
 title: 'Πρόγραμμα & Παρουσιολόγιο | Kanonas',
};

export default async function SchedulePage({ searchParams }: { searchParams: { date?: string } }) {
 const currentDateStr = searchParams.date || new Date().toISOString();
 
 const { schedule, activeBeneficiaries } = await getSchedule(currentDateStr);

 return (
 <div className="max-w-7xl mx-auto space-y-6">
 <div>
 <h1 className="text-2xl font-bold text-gray-900">Πρόγραμμα Συσσιτίου</h1>
 <p className="text-sm text-gray-500">Παρουσιολόγιο Διανομής Γευμάτων & Έλεγχος Απουσιών</p>
 </div>

 <ScheduleClient 
 initialDateStr={currentDateStr} 
 schedule={schedule} 
 beneficiaries={activeBeneficiaries || []} 
 />
 </div>
);
}
