import { getKanbanTasks } from '@/actions/kanban';
import KanbanClient from './KanbanClient';

export const metadata = {
  title: 'Δεξαμενή Εργασιών | Kanonas SaaS',
};

export default async function KanbanBoardPage() {
  const tasks = await getKanbanTasks();

  return (
    <div className="max-w-7xl mx-auto space-y-6 h-full flex flex-col">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">📋 Δεξαμενή Εργασιών (Board)</h1>
        <p className="text-sm text-gray-500">Οργανώστε τις εσωτερικές εργασίες του Εκκλησιαστικού Συμβουλίου και του Ναού με ευκολία.</p>
      </div>

      <KanbanClient initialTasks={tasks} />
    </div>
  );
}
