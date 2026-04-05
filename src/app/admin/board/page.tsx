import { getKanbanTasks } from '@/actions/kanban';
import KanbanClient from './KanbanClient';
import PageHeader from '@/components/PageHeader';
import { ClipboardList } from 'lucide-react';

export const metadata = {
 title: 'Δεξαμενή Εργασιών | Kanonas SaaS',
};

export default async function KanbanBoardPage() {
 const tasks = await getKanbanTasks();

 return (
 <div className="max-w-[1400px] mx-auto space-y-6 h-full flex flex-col mt-6 px-4 sm:px-6 lg:px-8">
 <PageHeader 
 title="Δεξαμενή Εργασιών (Board)"
 description="Οργανώστε τις εσωτερικές εργασίες του Εκκλησιαστικού Συμβουλίου και του Ναού με ευκολία."
 icon={ClipboardList}
 />

 <KanbanClient initialTasks={tasks} />
 </div>
);
}
