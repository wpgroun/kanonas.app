'use client'
import { useState } from 'react'
import { addServiceSchedule, deleteServiceSchedule } from '@/actions/schedule'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarDays, ExternalLink, Printer, Plus, Trash2, Clock } from 'lucide-react';

import PageHeader from '@/components/PageHeader';

export default function ScheduleClient({ initialSchedules }: { initialSchedules: any[] }) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('07:00');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isMajor, setIsMajor] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e: any) => {
    e.preventDefault();
    if (!date || !time || !title) return;
    setLoading(true);
    
    // Combine Date and Time
    const combinedDate = `${date}T${time}:00`;
    
    await addServiceSchedule({ date: combinedDate, title, description, isMajor });
    
    setTitle('');
    setDescription('');
    setIsMajor(false);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Διαγραφή ακολουθίας;')) return;
    setLoading(true);
    await deleteServiceSchedule(id);
    setLoading(false);
  };

  return (
    <div className="container-fluid mt-6 space-y-6">
      <PageHeader 
        title="Πρόγραμμα Ακολουθιών" 
        description="Καταχωρήστε τις Ιερές Ακολουθίες για τη δημιουργία της Εβδομαδιαίας Ανακοίνωσης."
        actions={
          <>
            <Link href="/schedule" target="_blank">
              <Button variant="outline" className="shadow-sm">
                <ExternalLink className="w-4 h-4 mr-2" /> Δημόσια Προβολή
              </Button>
            </Link>
            <Link href="/admin/schedule/print" target="_blank">
               <Button className="shadow-sm">
                 <Printer className="w-4 h-4 mr-2" /> Εκτύπωση Εβδομάδας
               </Button>
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
        
        {/* Form Container */}
        <div className="col-span-1">
          <Card className="shadow-sm border-border/50 sticky top-6">
            <CardHeader>
              <CardTitle>Νέα Ακολουθία</CardTitle>
              <CardDescription>Προσθήκη ακολουθίας στο ημερολόγιο</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAdd} className="space-y-4">
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Ημερομηνία</Label>
                    <Input type="date" required value={date} onChange={e => setDate(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Ώρα</Label>
                    <Input type="time" required value={time} onChange={e => setTime(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Τίτλος Ακολουθίας</Label>
                  <Input required value={title} onChange={e => setTitle(e.target.value)} placeholder="π.χ. Όρθρος & Θεία Λειτουργία" />
                </div>

                <div className="space-y-2">
                  <Label>Λεπτομέρειες / Εορτή (Προαιρετικό)</Label>
                  <Textarea value={description} onChange={e => setDescription(e.target.value)} className="resize-y" placeholder="Αγίου Δημητρίου του Μυροβλύτου..." />
                </div>

                <div className="flex items-center space-x-2 bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-400 p-3 rounded-lg border border-red-200 dark:border-red-900/40">
                  <Checkbox 
                    id="isMajor" 
                    checked={isMajor} 
                    onCheckedChange={(c) => setIsMajor(c as boolean)} 
                    className="border-red-500 data-[state=checked]:bg-red-600"
                  />
                  <Label htmlFor="isMajor" className="font-semibold text-sm cursor-pointer leading-none">
                    Μεγάλη Δεσποτική Εορτή (Κόκκινο)
                  </Label>
                </div>

                <Button type="submit" disabled={loading} className="w-full mt-2">
                  <Plus className="w-4 h-4 mr-2" />
                  {loading ? 'Αποθήκευση...' : 'Προσθήκη στο Πρόγραμμα'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* List Container */}
        <div className="col-span-1 lg:col-span-2">
          {initialSchedules.length === 0 && (
            <Card className="shadow-sm border-dashed border-2 bg-transparent text-center py-16">
               <CalendarDays className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
               <p className="text-muted-foreground">Το πρόγραμμα είναι κενό. Προσθέστε τις πρώτες ακολουθίες!</p>
            </Card>
          )}
          
          <div className="flex flex-col gap-3">
            {initialSchedules.map(srv => {
              const dDate = new Date(srv.date);
              return (
                <Card key={srv.id} className={`shadow-sm overflow-hidden flex border-l-4 ${srv.isMajor ? 'border-l-red-600 dark:border-l-red-500 bg-red-50/30 dark:bg-red-950/10' : 'border-l-primary'}`}>
                  
                  {/* Date Box */}
                  <div className={`p-4 min-w-[90px] flex flex-col items-center justify-center border-r border-border/50 ${srv.isMajor ? 'bg-red-600 text-white' : 'bg-muted/50 text-foreground'}`}>
                     <span className="text-xs uppercase tracking-wider font-medium opacity-80">{dDate.toLocaleDateString('el-GR', { weekday: 'short' })}</span>
                     <span className="text-2xl font-bold leading-none my-1">{dDate.getDate()}</span>
                     <span className="text-xs font-semibold uppercase">{dDate.toLocaleDateString('el-GR', { month: 'short' })}</span>
                  </div>

                  {/* Content */}
                  <div className="p-4 flex-1 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                     <div>
                       <div className="text-primary font-bold text-xs mb-1.5 flex items-center gap-1.5">
                         <Clock className="w-3.5 h-3.5" /> {dDate.toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' })}
                       </div>
                       <h3 className={`text-lg font-bold flex items-center gap-2 ${srv.isMajor ? 'text-red-700 dark:text-red-400' : 'text-foreground'}`}>
                         {srv.title}
                       </h3>
                       {srv.description && (
                         <p className="mt-1 text-sm text-muted-foreground">{srv.description}</p>
                       )}
                     </div>

                     <Button variant="ghost" size="icon" className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete(srv.id)}>
                       <Trash2 className="w-4 h-4" />
                     </Button>
                  </div>

                </Card>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}

