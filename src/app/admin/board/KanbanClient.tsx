'use client';

import { useState } from 'react';
import { createKanbanTask, updateKanbanTaskStatus, deleteKanbanTask } from '@/actions/kanban';
import { toast } from 'sonner';
import { Plus, Trash2, ArrowRight, ArrowLeft, Clock, CheckCircle2, User, Flame } from 'lucide-react';

export default function KanbanClient({ initialTasks }: { initialTasks: any[] }) {
 const [tasks, setTasks] = useState(initialTasks);
 const [isAdding, setIsAdding] = useState(false);
 const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'NORMAL', assignee: '' });

 const columns = [
 { id: 'TODO', title: 'Εκκρεμότητες', color: 'border-l-slate-400', bg: 'bg-slate-100' },
 { id: 'IN_PROGRESS', title: 'Σε Εξέλιξη', color: 'border-l-blue-500', bg: 'bg-blue-50' },
 { id: 'DONE', title: 'Ολοκληρωμένα', color: 'border-l-green-500', bg: 'bg-green-50' }
 ];

 const handleCreate = async () => {
 if (!newTask.title) return toast.error('Ο τίτλος είναι υποχρεωτικός');
 const res = await createKanbanTask(newTask);
 if (res.success && res.task) {
 setTasks([res.task, ...tasks]);
 setNewTask({ title: '', description: '', priority: 'NORMAL', assignee: '' });
 setIsAdding(false);
 toast.success('Προστέθηκε!');
 } else {
 toast.error(res.error);
 }
 };

 const moveTask = async (taskId: string, newStatus: string) => {
 setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
 await updateKanbanTaskStatus(taskId, newStatus);
 };

 const removeTask = async (taskId: string) => {
 if (!confirm('Διαγραφή εργασίας;')) return;
 setTasks(tasks.filter(t => t.id !== taskId));
 await deleteKanbanTask(taskId);
 };

 return (
 <div className="flex flex-col gap-6 w-full pb-8">
 
 {!isAdding ? (
 <button onClick={() => setIsAdding(true)} className="bg-[var(--surface)] border border-dashed border-gray-300 rounded-xl p-4 flex items-center justify-center gap-2 text-[var(--text-muted)] hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-all font-semibold shadow-sm w-full md:w-64">
 <Plus className="w-5 h-5"/> Νέα Εργασία
 </button>
) : (
 <div className="bg-[var(--surface)] p-6 rounded-xl border border-[var(--border)] shadow-xl max-w-md w-full animate-in fade-in slide-in-from-top-4">
 <h3 className="font-bold text-[var(--foreground)] mb-4">Προσθήκη Εργασίας</h3>
 <div className="space-y-3">
 <input autoFocus placeholder="Τίτλος (π.χ. Αλλαγή Λαμπτήρων Polyelaiou)"className="w-full p-2 border rounded-md"value={newTask.title} onChange={e=>setNewTask({...newTask, title: e.target.value})}/>
 <textarea placeholder="Περιγραφή..."className="w-full p-2 border rounded-md text-sm"rows={2} value={newTask.description} onChange={e=>setNewTask({...newTask, description: e.target.value})}/>
 <div className="flex gap-2">
 <input placeholder="Αρμόδιος / Ομάδα"className="w-1/2 p-2 border rounded-md text-sm"value={newTask.assignee} onChange={e=>setNewTask({...newTask, assignee: e.target.value})}/>
 <select className="w-1/2 p-2 border rounded-md text-sm"value={newTask.priority} onChange={e=>setNewTask({...newTask, priority: e.target.value})}>
 <option value="LOW">Χαμηλή</option>
 <option value="NORMAL">Κανονική</option>
 <option value="HIGH">✅ Υψηλή (Επείγον)</option>
 </select>
 </div>
 <div className="flex gap-2 justify-end pt-2">
 <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-[var(--text-muted)] hover:bg-[var(--surface-hover)] rounded-md text-sm font-semibold">Ακύρωση</button>
 <button onClick={handleCreate} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700">Αποθήκευση</button>
 </div>
 </div>
 </div>
)}

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start mt-2">
 {columns.map(col => {
 const colTasks = tasks.filter(t => t.status === col.id);
 return (
 <div key={col.id} className={`${col.bg} p-4 rounded-xl border-t-4 ${col.color} border-l border-r border-b border-[var(--border)] min-h-[500px]`}>
 <div className="flex items-center justify-between mb-4">
 <h3 className="font-extrabold text-gray-700 uppercase tracking-wider text-sm">{col.title}</h3>
 <span className="bg-[var(--surface)] text-[var(--text-muted)] text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">{colTasks.length}</span>
 </div>

 <div className="flex flex-col gap-3">
 {colTasks.length === 0 && <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-xl text-[var(--text-muted)] text-sm">Καμία εργασία</div>}
 
 {colTasks.map(task => (
 <div key={task.id} className="bg-[var(--surface)] p-4 rounded-xl shadow-sm border border-[var(--border)] group hover:shadow-md transition-all">
 <div className="flex justify-between items-start mb-2">
 <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${task.priority === 'HIGH' ? 'bg-red-100 text-red-700 w-fit flex items-center gap-1' : 'bg-gray-100 text-[var(--text-muted)]'}`}>
 {task.priority === 'HIGH' && <Flame className="w-3 h-3"/>}
 {task.priority === 'HIGH' ? 'ΕΠΕΙΓΟΝ' : task.priority === 'LOW' ? 'ΧΑΜΗΛΗ' : 'ΚΑΝΟΝΙΚΗ'}
 </span>
 <button onClick={() => removeTask(task.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4"/></button>
 </div>
 
 <h4 className="font-bold text-[var(--foreground)] leading-tight mb-1">{task.title}</h4>
 {task.description && <p className="text-xs text-[var(--text-muted)] line-clamp-2 mt-1 mb-3">{task.description}</p>}
 
 <div className="flex items-center justify-between mt-4">
 {task.assignee ? (
 <div className="flex items-center gap-1.5 bg-[var(--brand-50)] text-[var(--brand)] px-2 py-1 rounded-md text-[10px] font-bold">
 <User className="w-3 h-3"/> {task.assignee}
 </div>
) : <div/>}
 
 <div className="flex items-center gap-1">
 {col.id !== 'TODO' && (
 <button onClick={() => moveTask(task.id, col.id === 'DONE' ? 'IN_PROGRESS' : 'TODO')} className="p-1.5 rounded-md hover:bg-[var(--surface-hover)] text-[var(--text-muted)] hover:text-gray-700 transition-colors"title="Πίσω">
 <ArrowLeft className="w-4 h-4"/>
 </button>
)}
 {col.id !== 'DONE' && (
 <button onClick={() => moveTask(task.id, col.id === 'TODO' ? 'IN_PROGRESS' : 'DONE')} className="p-1.5 rounded-md hover:bg-[var(--surface-hover)] text-[var(--text-muted)] hover:text-blue-600 transition-colors"title="Μπροστά">
 <ArrowRight className="w-4 h-4"/>
 </button>
)}
 </div>
 </div>
 </div>
))}
 </div>
 </div>
);
 })}
 </div>
 </div>
);
}
