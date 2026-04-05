'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Minus, Search, AlertTriangle } from 'lucide-react';
import { adjustStock } from '@/actions/inventory';

export default function InventoryClient({ initialData }: { initialData: any[] }) {
  const [items, setItems] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState('');

  const handleAdjust = async (id: string, diff: number) => {
    const reason = diff > 0 ? "Εισερχόμενη Δωρεά" : "Ανάλωση/Μαγειρική";
    const res = await adjustStock(id, diff, reason);
    if(res.success) {
       setItems(prev => prev.map(i => i.id === id ? { ...i, quantity: res.newStock } : i));
    } else {
       alert(res.error);
    }
  };

  const filteredItems = items.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-4">
       <div className="flex justify-between items-center bg-white dark:bg-gray-900 p-2 rounded-xl shadow-sm border border-border">
          <div className="flex px-2 text-gray-500">
             <Search className="w-5 h-5 mr-2" />
             <input 
               type="text" 
               placeholder="Αναζήτηση υλικού..." 
               className="bg-transparent outline-none border-none text-sm w-64 text-gray-800 dark:text-gray-200"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
          <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg">
            <Plus className="w-4 h-4 mr-2"/> Προσθήκη Είδους
          </Button>
       </div>

       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredItems.map(item => {
             const isLow = item.quantity <= item.minStock;
             return (
               <Card key={item.id} className={`p-4 flex flex-col gap-4 border ${isLow ? 'border-rose-300 bg-rose-50 dark:bg-rose-950/20' : 'border-border'}`}>
                  <div className="flex justify-between items-start">
                     <div>
                       <h3 className="font-bold text-gray-800 dark:text-white">{item.name}</h3>
                       <p className="text-xs text-gray-500">{item.category}</p>
                     </div>
                     {isLow && <div title="Χαμηλό Απόθεμα"><AlertTriangle className="w-5 h-5 text-rose-500" /></div>}
                  </div>

                  <div className="text-center py-4 bg-white dark:bg-gray-800 rounded-lg shadow-inner">
                     <span className={`text-3xl font-black ${isLow ? 'text-rose-600' : 'text-slate-700 dark:text-slate-200'}`}>
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
    </div>
  );
}
