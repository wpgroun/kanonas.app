import { getSchedule } from '@/actions/schedule';
import ScheduleClient from './ScheduleClient';

export const metadata = {
  title: 'Πρόγραμμα & Παρουσιολόγιο | Kanonas',
};

export default async function SchedulePage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const params = await searchParams;
  const currentDateStr = params.date || new Date().toISOString();
  
  const result = await getSchedule(currentDateStr);
  const schedule = result.success ? result.schedule : null;
  const activeBeneficiaries = result.success ? (result as any).activeBeneficiaries || [] : [];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Πρόγραμμα Συσσιτίου</h1>
        <p className="text-sm text-[var(--text-muted)]">Παρουσιολόγιο Διανομής Γευμάτων & Έλεγχος Απουσιών</p>
      </div>

      <ScheduleClient 
        initialDateStr={currentDateStr} 
        schedule={schedule} 
        beneficiaries={activeBeneficiaries} 
      />
    </div>
  );
}
