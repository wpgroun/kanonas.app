'use client'
import { useState } from 'react'
import { addDiptychNames, deleteDiptychName, clearDiptychs, editDiptychName, approvePrayerRequest } from '@/actions/diptychs'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Leaf, Cross, Printer, Plus, Trash2, Pencil, Trash, Lightbulb, Inbox, Check } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

export default function DiptychClient({ initialDiptychs, pendingRequests = [] }: { initialDiptychs: any[], pendingRequests?: any[] }) {
  const [activeTab, setActiveTab] = useState<'ygeias' | 'anapauseos' | 'electronic'>('ygeias');
  const [quickAdd, setQuickAdd] = useState('');
  const [loading, setLoading] = useState(false);

  const ygeias = initialDiptychs.filter(d => d.type === 'ygeias');
  const anapauseos = initialDiptychs.filter(d => d.type === 'anapauseos');
  const currentList = activeTab === 'ygeias' ? ygeias : anapauseos;

  const handleAdd = async () => {
    if (!quickAdd.trim()) return;
    setLoading(true);
    await addDiptychNames(activeTab === 'electronic' ? 'ygeias' : activeTab, quickAdd);
    setQuickAdd('');
    setLoading(false);
  };

  const handleClear = async () => {
    if (!confirm('Θέλετε να καθαρίσετε τη λίστα έπειτα από την Ιερά Πρόθεση; (Θα αρχειοθετηθούν στο ιστορικό)')) return;
    setLoading(true);
    await clearDiptychs(activeTab === 'electronic' ? 'ygeias' : activeTab);
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

  const handleApproveRequest = async (id: string) => {
    setLoading(true);
    const res = await approvePrayerRequest(id);
    if (!res?.success) alert('Αποτυχία κατά τη μεταφορά στα Δίπτυχα.')
    setLoading(false);
  }

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
        <TabsList className="grid w-full grid-cols-3 max-w-[600px] h-auto p-1 py-1.5">
          <TabsTrigger value="ygeias" className="flex items-center gap-2 py-2">
            <Leaf className="w-4 h-4 text-green-600" /> <span className="hidden sm:inline">Υπέρ Υγείας</span>
            <span className="bg-muted px-2 py-0.5 rounded-full text-xs ml-1">{ygeias.length}</span>
          </TabsTrigger>
          <TabsTrigger value="anapauseos" className="flex items-center gap-2 py-2">
            <Cross className="w-4 h-4 text-red-600" /> <span className="hidden sm:inline">Υπέρ Αναπαύσεως</span>
            <span className="bg-muted px-2 py-0.5 rounded-full text-xs ml-1">{anapauseos.length}</span>
          </TabsTrigger>
          <TabsTrigger value="electronic" className="flex items-center gap-2 font-bold text-blue-700 py-2">
            <Inbox className="w-4 h-4 text-blue-600" /> <span className="hidden sm:inline">Ηλεκτρονικά</span>
            {pendingRequests.length > 0 && (
              <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs ml-1">{pendingRequests.length}</span>
            )}
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
              <Button onClick={handleAdd} disabled={loading || !quickAdd.trim() || activeTab === 'electronic'} className="w-full mt-4">
                <Plus className="w-4 h-4 mr-2" />
                {loading ? 'Καταχώρηση...' : 'Καταχώρηση Ονομάτων'}
              </Button>
              <div className="mt-6 flex items-start gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg border">
                <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <p><strong>Οδηγία:</strong> Αποφύγετε τα επώνυμα. Το σύστημα διαχωρίζει τα ονόματα αυτόματα (με κενό ή Enter) ώστε να είναι ευανάγνωστα στην εκτύπωση.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* LIST OR ELECTRONIC REQUESTS */}
        <div className="col-span-1 lg:col-span-2">
          {activeTab === 'electronic' ? (
            <Card className="shadow-sm border-border/50 p-4 min-h-[400px]">
              <h2 className="text-xl font-bold mb-6 text-slate-800 flex items-center gap-2">
                <Inbox className="w-5 h-5 text-blue-600" />
                Εισερχόμενα από το Kanonas Connect
              </h2>
              {pendingRequests.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground bg-slate-50 rounded-xl border border-dashed border-slate-300">
                  <Inbox className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                  <p className="text-lg">Δεν εκκρεμούν ονόματα προς μνημόνευση.</p>
                  <p className="text-sm">Όσες υποβολές γίνονται από τους πιστούς, θα εμφανίζονται εδώ.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((req) => (
                    <div key={req.id} className="border border-slate-200 bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <div className="bg-slate-50 border-b border-slate-100 p-4 flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-slate-800">Ακολουθία: {req.type}</h3>
                          <div className="flex flex-col sm:flex-row sm:gap-4 text-sm text-slate-500 mt-1">
                             <span><strong>Από:</strong> {req.submitterName || 'Ανώνυμο'}</span>
                             {req.submitterEmail && <span><strong>Email:</strong> {req.submitterEmail}</span>}
                          </div>
                        </div>
                        <Button onClick={() => handleApproveRequest(req.id)} disabled={loading} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0">
                          <Check className="w-4 h-4 mr-2" /> Μεταφορά στα Δίπτυχα
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-200">
                        <div className="p-4 bg-white">
                           <strong className="text-green-700 block mb-2 flex items-center gap-1.5"><Leaf className="w-4 h-4"/> Υπέρ Υγείας</strong>
                           <p className="whitespace-pre-line text-slate-700 leading-relaxed min-h-[40px] italic">
                             {req.livingNames ? req.livingNames.split(/[\n,]+/).join(', ') : <span className="text-slate-400 not-italic">- Κενό -</span>}
                           </p>
                        </div>
                        <div className="p-4 bg-white">
                           <strong className="text-red-700 block mb-2 flex items-center gap-1.5"><Cross className="w-4 h-4"/> Υπέρ Αναπαύσεως</strong>
                           <p className="whitespace-pre-line text-slate-700 leading-relaxed min-h-[40px] italic">
                             {req.fallenNames ? req.fallenNames.split(/[\n,]+/).join(', ') : <span className="text-slate-400 not-italic">- Κενό -</span>}
                           </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ) : (
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
                    <div key={d.id} className="flex items-center p-3 border border-border/60 bg-card rounded-lg hover:border-primary/40 transition-colors shadow-sm gap-2">
                      <div className="text-muted-foreground w-5 text-right font-semibold text-xs">{i + 1}.</div>
                      <div className="text-base font-serif flex-1 flex items-center min-w-0">
                        <span className={`mr-1 font-bold ${activeTab === 'ygeias' ? 'text-green-600' : 'text-red-600'}`}>
                          {activeTab === 'anapauseos' ? '†' : ''}
                        </span>
                        <span className="text-foreground tracking-wide truncate">{d.name}</span>
                        {d.submittedBy && d.submittedBy !== 'Admin' && (
                           <span title={`Ηλεκτρονική υποβολή από: ${d.submittedBy}`} className="ml-2 w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>
                        )}
                      </div>
                      <div className="flex opacity-60 hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="w-7 h-7 hocus:bg-muted" onClick={() => handleEdit(d.id, d.name)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="w-7 h-7 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete(d.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
