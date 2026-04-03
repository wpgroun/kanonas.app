'use client'
import { useState } from 'react'
import { addDiptychNames, deleteDiptychName, clearDiptychs, editDiptychName } from '../../actions'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Leaf, Cross, Printer, Plus, Trash2, Pencil, Trash, Lightbulb } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

export default function DiptychClient({ initialDiptychs }: { initialDiptychs: any[] }) {
  const [activeTab, setActiveTab] = useState<'ygeias' | 'anapauseos'>('ygeias');
  const [quickAdd, setQuickAdd] = useState('');
  const [loading, setLoading] = useState(false);

  const ygeias = initialDiptychs.filter(d => d.type === 'ygeias');
  const anapauseos = initialDiptychs.filter(d => d.type === 'anapauseos');
  const currentList = activeTab === 'ygeias' ? ygeias : anapauseos;

  const handleAdd = async () => {
    if (!quickAdd.trim()) return;
    setLoading(true);
    await addDiptychNames(activeTab, quickAdd);
    setQuickAdd('');
    setLoading(false);
  };

  const handleClear = async () => {
    if (!confirm('Θέλετε να καθαρίσετε τη λίστα έπειτα από την Ιερά Πρόθεση; (Θα αρχειοθετηθούν στο ιστορικό, δεν διαγράφονται μόνιμα)')) return;
    setLoading(true);
    await clearDiptychs(activeTab);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Διαγραφή του ονόματος;')) return;
    setLoading(true);
    await deleteDiptychName(id);
    setLoading(false);
  };

  const handleEdit = async (id: string, oldName: string) => {
    const newName = prompt('Αλλαγή ονόματος:', oldName);
    if (!newName || newName.trim() === '') return;
    setLoading(true);
    await editDiptychName(id, newName.trim());
    setLoading(false);
  };

  return (
    <div className="container-fluid mt-6 space-y-6">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Ιερά Δίπτυχα
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Ψηφιακό Μητρώο Μνημόνευσης για την Αγία Πρόθεση.
          </p>
        </div>
        <Link href="/admin/diptychs/print" target="_blank">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Printer className="w-4 h-4 mr-2" /> Εκτύπωση Διπτύχων
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="ygeias" className="w-full" onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="ygeias" className="flex items-center gap-2">
            <Leaf className="w-4 h-4 text-green-600" />
            Υπέρ Υγείας
            <span className="bg-muted px-2 py-0.5 rounded-full text-xs ml-1">{ygeias.length}</span>
          </TabsTrigger>
          <TabsTrigger value="anapauseos" className="flex items-center gap-2">
            <Cross className="w-4 h-4 text-red-600" />
            Υπέρ Αναπαύσεως
            <span className="bg-muted px-2 py-0.5 rounded-full text-xs ml-1">{anapauseos.length}</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
        
        {/* QUICK ADD FORM */}
        <div className="col-span-1">
          <Card className="shadow-sm border-border/50 sticky top-6">
            <CardHeader>
              <CardTitle>Χειροκίνητη Εισαγωγή</CardTitle>
              <CardDescription>Πολύπλοκη ή γρήγορη εισαγωγή</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea 
                className="min-h-[180px] text-base resize-y"
                placeholder={"Αρσένιος\nΠαΐσιος\nΠορφύριος\n(Ένα όνομα ανά γραμμή)"}
                value={quickAdd}
                onChange={e => setQuickAdd(e.target.value)}
              />
              <Button onClick={handleAdd} disabled={loading || !quickAdd.trim()} className="w-full mt-4">
                <Plus className="w-4 h-4 mr-2" />
                {loading ? 'Καταχώρηση...' : 'Καταχώρηση Ονομάτων'}
              </Button>
              <div className="mt-6 flex items-start gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg border">
                <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <p><strong>Οδηγία:</strong> Αποφύγετε τα επώνυμα. Το σύστημα διαχωρίζει και ταυτοποιεί τα ονόματα ώστε κατά την εκτύπωση να είναι απολύτως ευανάγνωστα.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* LIST */}
        <div className="col-span-1 lg:col-span-2">
          <Card className="shadow-sm border-border/50">
            <div className="flex justify-between items-center p-4 border-b border-border bg-muted/30">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                {activeTab === 'ygeias' ? 'Κατάλογος Υπέρ Υγείας' : 'Κατάλογος Υπέρ Αναπαύσεως'}
              </h2>
              <Button variant="destructive" size="sm" onClick={handleClear} disabled={loading || currentList.length === 0} className="shadow-sm">
                <Trash className="w-4 h-4 mr-2" /> Καθαρισμός λίστας
              </Button>
            </div>

            <div className="p-4">
              {currentList.length === 0 && (
                <div className="py-16 text-center text-muted-foreground flex flex-col items-center">
                  <div className="text-4xl mb-4 opacity-50">
                     {activeTab === 'ygeias' ? <Leaf className="w-12 h-12" /> : <Cross className="w-12 h-12" />}
                  </div>
                  <p>Το μητρώο είναι άδειο αυτή τη στιγμή.</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {currentList.map((d, i) => (
                  <div key={d.id} className="flex items-center p-3 border border-border/60 bg-card rounded-lg hover:border-primary/40 transition-colors shadow-sm">
                    <div className="text-muted-foreground w-6 font-semibold text-xs">{i + 1}.</div>
                    <div className="text-base font-serif flex-1 flex items-center">
                      <span className={`mr-1.5 font-bold ${activeTab === 'ygeias' ? 'text-green-600' : 'text-red-600'}`}>
                        {activeTab === 'anapauseos' ? '†' : ''}
                      </span>
                      <span className="text-foreground tracking-wide">{d.name}</span>
                    </div>
                    <div className="flex gap-1 opacity-60 hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="w-8 h-8 hocus:bg-muted" onClick={() => handleEdit(d.id, d.name)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="w-8 h-8 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete(d.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

      </div>

    </div>
  )
}

