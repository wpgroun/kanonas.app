'use client';

import { useState, useEffect } from 'react';
import { Megaphone, Plus, Trash2, Eye, EyeOff, AlertTriangle, Info, Wrench, Sparkles, X, Send, Loader2 } from 'lucide-react';
import { getAllAnnouncements, createAnnouncement, deleteAnnouncement, toggleAnnouncement } from '@/actions/announcements';

const TYPES = [
  { id: 'info', label: 'Πληροφορία', icon: Info, color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { id: 'warning', label: 'Προειδοποίηση', icon: AlertTriangle, color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { id: 'update', label: 'Αναβάθμιση', icon: Sparkles, color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { id: 'maintenance', label: 'Συντήρηση', icon: Wrench, color: 'bg-red-100 text-red-700 border-red-200' },
];

export default function AnnouncementsClient() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', body: '', type: 'info', priority: 'normal', expiresAt: '' });

  const fetchAll = async () => {
    setLoading(true);
    const data = await getAllAnnouncements();
    setItems(data);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleCreate = async () => {
    if (!form.title || !form.body) return;
    setSaving(true);
    await createAnnouncement(form);
    setSaving(false);
    setShowForm(false);
    setForm({ title: '', body: '', type: 'info', priority: 'normal', expiresAt: '' });
    fetchAll();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Διαγραφή ανακοίνωσης;')) return;
    await deleteAnnouncement(id);
    fetchAll();
  };

  const handleToggle = async (id: string, current: boolean) => {
    await toggleAnnouncement(id, !current);
    fetchAll();
  };

  const getTypeInfo = (type: string) => TYPES.find(t => t.id === type) || TYPES[0];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-[var(--brand)]"/> Ανακοινώσεις Συστήματος
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Δημοσιεύστε ανακοινώσεις που θα εμφανίζονται σε <b>όλους τους Ναούς</b> στο Dashboard τους.
          </p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn btn-primary flex items-center gap-2 shadow-lg shadow-indigo-200">
          <Plus className="w-4 h-4"/> Νέα Ανακοίνωση
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="card p-6 space-y-4 border-2 border-[var(--brand)] shadow-lg animate-in slide-in-from-top-2 fade-in duration-300">
          <div className="flex justify-between items-center">
            <h3 className="font-bold flex items-center gap-2"><Send className="w-4 h-4 text-[var(--brand)]"/> Νέα Ανακοίνωση</h3>
            <button onClick={() => setShowForm(false)} className="p-1 rounded hover:bg-[var(--background)]"><X className="w-4 h-4"/></button>
          </div>
          
          <input
            type="text"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            placeholder="Τίτλος ανακοίνωσης..."
            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[var(--brand)]"
          />
          
          <textarea
            value={form.body}
            onChange={e => setForm({ ...form, body: e.target.value })}
            placeholder="Σώμα μηνύματος (υποστηρίζει markdown)..."
            rows={4}
            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[var(--brand)] resize-none"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">Τύπος</label>
              <div className="flex gap-1.5">
                {TYPES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setForm({ ...form, type: t.id })}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${
                      form.type === t.id ? t.color + ' shadow-sm' : 'bg-[var(--background)] border-[var(--border)] text-[var(--text-muted)]'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">Προτεραιότητα</label>
              <select
                value={form.priority}
                onChange={e => setForm({ ...form, priority: e.target.value })}
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm"
              >
                <option value="low">Χαμηλή</option>
                <option value="normal">Κανονική</option>
                <option value="high">Υψηλή</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">Λήξη (προαιρετικό)</label>
              <input
                type="date"
                value={form.expiresAt}
                onChange={e => setForm({ ...form, expiresAt: e.target.value })}
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-sm font-bold text-[var(--text-muted)]">Ακύρωση</button>
            <button onClick={handleCreate} disabled={saving || !form.title || !form.body} className="px-6 py-2 rounded-lg text-sm font-bold bg-[var(--brand)] text-white hover:opacity-90 disabled:opacity-40 flex items-center gap-2 shadow-md">
              {saving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Send className="w-4 h-4"/>} Δημοσίευση
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-[var(--brand)] border-t-[var(--background)] rounded-full"/>
        </div>
      ) : items.length === 0 ? (
        <div className="card p-12 text-center">
          <Megaphone className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3 opacity-30"/>
          <p className="text-[var(--text-muted)] font-medium">Δεν υπάρχουν ανακοινώσεις ακόμα.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item: any) => {
            const typeInfo = getTypeInfo(item.type);
            const TypeIcon = typeInfo.icon;
            return (
              <div key={item.id} className={`card p-5 flex flex-col md:flex-row items-start md:items-center gap-4 transition-opacity ${!item.isActive ? 'opacity-50' : ''}`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 border ${typeInfo.color}`}>
                  <TypeIcon className="w-5 h-5"/>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-[var(--foreground)] truncate">{item.title}</h3>
                    {!item.isActive && <span className="text-[10px] uppercase font-black bg-gray-100 text-gray-500 px-2 py-0.5 rounded">Αδρανή</span>}
                    {item.priority === 'high' && <span className="text-[10px] uppercase font-black bg-red-100 text-red-600 px-2 py-0.5 rounded">Υψηλή</span>}
                  </div>
                  <p className="text-sm text-[var(--text-muted)] line-clamp-2">{item.body}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">{new Date(item.createdAt).toLocaleDateString('el-GR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button onClick={() => handleToggle(item.id, item.isActive)} className={`p-2 rounded-lg transition-colors ${item.isActive ? 'hover:bg-amber-100 text-amber-600' : 'hover:bg-emerald-100 text-emerald-600'}`} title={item.isActive ? 'Απόκρυψη' : 'Εμφάνιση'}>
                    {item.isActive ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg hover:bg-red-100 text-red-500 transition-colors" title="Διαγραφή">
                    <Trash2 className="w-4 h-4"/>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
