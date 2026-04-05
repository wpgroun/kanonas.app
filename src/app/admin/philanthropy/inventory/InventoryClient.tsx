'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Minus, Search, AlertTriangle, CalendarWarning } from 'lucide-react';
import { adjustStock, addInventoryItem } from '@/actions/inventory';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function InventoryClient({ initialData }: { initialData: any[] }) {
  const [items, setItems] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '', category: '', unit: '', quantity: '0', minThreshold: '10', expiryDate: ''
  });

  const handleAdjust = async (id: string, diff: number) => {
    const reason = diff > 0 ? "Εισερχόμενη Δωρεά" : "Ανάλωση/Μαγειρική";
    const res = await adjustStock(id, diff, reason);
    if(res.success) {
      setItems(prev => prev.map(i => i.id === id ? { ...i, quantity: res.newStock } : i));
    } else {
      alert(res.error);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await addInventoryItem(formData);
    if (res.success) {
      setItems([...items, res.data]);
      setIsAddModalOpen(false);
      setFormData({ name: '', category: '', unit: '', quantity: '0', minThreshold: '10', expiryDate: '' });
    } else {
      alert(res.error);
    }
    setLoading(false);
  };

  const filteredItems = items.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // Expiration Logic helper
  const getExpirationStatus = (dateStr: string | null) => {
    if (!dateStr) return { status: 'ok', txt: '' };
    const diffDays = Math.ceil((new Date(dateStr).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
    if (diffDays < 0) return { status: 'expired', txt: `Έληξε πριν ${Math.abs(diffDays)} μέρες` };
    if (diffDays <= 15) return { status: 'warning', txt: `Λήγει σε ${diffDays} μέρες` };
    return { status: 'ok', txt: `Λήγει σε ${diffDays} μέρες` };
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white p-2 rounded-xl shadow-sm border border-border">
        <div className="flex px-2 text-gray-500">
          <Search className="w-5 h-5 mr-2"/>
          <input 
            type="text"
            placeholder="Αναζήτηση υλικού..."
            className="bg-transparent outline-none border-none text-sm w-64 text-gray-800"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-md border-0 gap-2">
          <Plus className="w-4 h-4 mr-2"/> Προσθήκη Είδους
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredItems.map(item => {
          const isLow = item.quantity <= item.minStock;
          const expStatus = getExpirationStatus(item.expiryDate);
          const isDanger = isLow || expStatus.status === 'expired';

          return (
            <Card key={item.id} className={`p-4 flex flex-col gap-4 border ${isDanger ? 'border-rose-300 bg-rose-50 ' : 'border-border'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-800">{item.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                     <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-lg">{item.category}</span>
                     {expStatus.status !== 'ok' && item.expiryDate && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-lg flex items-center gap-1 font-bold ${expStatus.status === 'expired' ? 'bg-red-200 text-red-800' : 'bg-amber-200 text-amber-800'}`}>
                          <CalendarWarning className="w-3 h-3"/> {expStatus.txt}
                        </span>
                     )}
                  </div>
                </div>
                {isLow && <div title="Χαμηλό Απόθεμα"><AlertTriangle className="w-5 h-5 text-rose-500"/></div>}
              </div>

              <div className="text-center py-4 bg-white rounded-lg shadow-inner">
                <span className={`text-3xl font-black ${isLow ? 'text-rose-600' : 'text-slate-700 '}`}>
                  {item.quantity}
                </span>
                <span className="text-sm text-gray-500 ml-1 block">{item.unit}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-auto">
                <Button 
                  variant="outline"
                  className="text-rose-600 border-rose-200 hover:bg-rose-100"
                  onClick={() => handleAdjust(item.id, -1)}
                >
                  <Minus className="w-4 h-4"/>
                </Button>
                <Button 
                  variant="outline"
                  className="text-emerald-600 border-emerald-200 hover:bg-emerald-100"
                  onClick={() => handleAdjust(item.id, +1)}
                >
                  <Plus className="w-4 h-4"/>
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>Προσθήκη Νέου Υλικού</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label>Όνομα Υλικού</Label>
              <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="π.χ. Μακαρόνια Νο6"/>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Κατηγορία</Label>
                <Input required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="π.χ. Τρόφιμο / Φάρμακο"/>
              </div>
              <div className="space-y-1.5">
                <Label>Μονάδα (Unit)</Label>
                <Input required value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} placeholder="π.χ. Κιλά, Τεμάχια"/>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1.5">
                <Label>Απόθεμα Ασφαλείας</Label>
                <Input type="number" required value={formData.minThreshold} onChange={e => setFormData({...formData, minThreshold: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <Label>Αρχική Ποσότητα</Label>
                <Input type="number" required value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Ημερομηνία Λήξης (Προαιρετικό)</Label>
              <Input type="date" value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} />
              <p className="text-xs text-slate-500">Θα ειδοποιηθείτε 15 μέρες πριν τη λήξη.</p>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Αποθήκευση...' : 'Δημιουργία'}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
