'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Camera, Upload, ArrowRight, ArrowLeft, Search, PlusCircle, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export default function ProtocolClient({ initialRecords, currentOwner, currentPage, totalPages }: any) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [direction, setDirection] = useState('IN');

  const handleFilter = (ownerType: string) => {
     const params = new URLSearchParams(window.location.search);
     params.set('owner', ownerType);
     params.set('page', '1');
     router.push(`?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
     e.preventDefault();
     const query = new FormData(e.currentTarget).get('query') as string;
     const params = new URLSearchParams(window.location.search);
     if (query) params.set('q', query);
     else params.delete('q');
     router.push(`?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
       
       {/* Toolbar */}
       <div className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-border gap-4">
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
             <button 
                onClick={() => handleFilter('TEMPLE')}
                className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${currentOwner === 'TEMPLE' ? 'bg-white shadow text-primary' : 'text-gray-500 hover:text-gray-900'}`}>
                Ιερός Ναός
             </button>
             <button 
                onClick={() => handleFilter('PHILOPTOCHOS')}
                className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${currentOwner === 'PHILOPTOCHOS' ? 'bg-white shadow text-primary' : 'text-gray-500 hover:text-gray-900'}`}>
                Φιλόπτωχο Ταμείο
             </button>
          </div>

          <form onSubmit={handleSearch} className="flex-1 max-w-sm flex">
             <div className="relative w-full">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                   name="query"
                   placeholder="Αναζήτηση Αποστολέα ή Θέματος..."
                   className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-slate-50 dark:bg-gray-950 focus:ring-1 focus:ring-primary outline-none"
                />
             </div>
          </form>

          <Button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-primary/90 text-white gap-2">
             <PlusCircle className="w-5 h-5" /> Νέο Έγγραφο
          </Button>
       </div>

       {/* Protocol Matrix */}
       <Card className="rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
             <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 border-b border-border">
                   <tr>
                      <th className="p-4 font-bold text-center w-24">Αριθμός</th>
                      <th className="p-4 font-bold w-12">Τύπος</th>
                      <th className="p-4 font-bold min-w-[200px]">Θέμα</th>
                      <th className="p-4 font-bold">Αποστολέας / Παραλήπτης</th>
                      <th className="p-4 font-bold">Ημερομηνία</th>
                      <th className="p-4 font-bold text-center">Αρχείο</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-border">
                   {initialRecords.length === 0 ? (
                      <tr><td colSpan={6} className="p-12 text-center text-gray-500">Δεν βρέθηκαν έγγραφα στο πρωτόκολλο αυτού του βιβλίου.</td></tr>
                   ) : initialRecords.map((doc: any) => (
                      <tr key={doc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                         <td className="p-4 text-center">
                            <span className="font-mono bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg font-bold text-gray-700 dark:text-gray-300">
                               {doc.number}/{doc.year}
                            </span>
                         </td>
                         <td className="p-4 flex items-center justify-center">
                            {doc.direction === 'IN' ? (
                               <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center" title="Εισερχόμενο"><ArrowRight className="w-4 h-4"/></div>
                            ) : (
                               <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center" title="Εξερχόμενο"><ArrowLeft className="w-4 h-4"/></div>
                            )}
                         </td>
                         <td className="p-4 font-semibold text-gray-800 dark:text-gray-100">
                            {doc.subject}
                         </td>
                         <td className="p-4 text-gray-600">
                            {doc.direction === 'IN' ? doc.sender || '-' : doc.receiver || '-'}
                         </td>
                         <td className="p-4 text-gray-500 tabular-nums">
                            {new Date(doc.date).toLocaleDateString("el-GR")}
                         </td>
                         <td className="p-4 flex items-center justify-center">
                            {doc.fileUrl ? (
                               <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-primary transition-colors hover:bg-slate-100 p-2 rounded-md">
                                  <FileText className="w-5 h-5"/>
                               </a>
                            ) : (
                               <span className="text-gray-300">-</span>
                            )}
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
       </Card>

       {/* Slide-over / Modal for New Document */}
       {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
             <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-border flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                   <div>
                     <h2 className="text-xl font-bold">Πρωτοκόλληση Εγγράφου</h2>
                     <p className="text-sm text-gray-500">Βιβλίο: <span className="font-semibold text-primary">{currentOwner === 'TEMPLE' ? 'Ιερού Ναού' : 'Φιλοπτώχου'}</span></p>
                   </div>
                   <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 text-2xl leading-none">&times;</button>
                </div>
                
                <form action={async (formData) => {
                   formData.append('owner', currentOwner);
                   const { addProtocolEntry } = await import('@/actions/protocol');
                   toast.promise(addProtocolEntry(formData), {
                      loading: 'Πρωτοκόλληση...',
                      success: (res) => {
                        if(!res.success) throw new Error(res.error);
                        setIsModalOpen(false);
                        return `Επιτυχία! Το έγγραφο έλαβε αριθμό ${res.protocolNumber}`;
                      },
                      error: (err) => err.message
                   });
                }} className="p-6 overflow-y-auto space-y-6">
                   
                   <div className="flex gap-4 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                      <button type="button" onClick={() => setDirection('IN')} className={`flex-1 flex justify-center items-center gap-2 py-3 rounded-md font-semibold transition ${direction==='IN'?'bg-white shadow text-blue-600':'text-gray-500 hover:text-gray-800'}`}>
                         <ArrowRight className="w-4 h-4"/> Εισερχόμενο
                      </button>
                      <button type="button" onClick={() => setDirection('OUT')} className={`flex-1 flex justify-center items-center gap-2 py-3 rounded-md font-semibold transition ${direction==='OUT'?'bg-white shadow text-amber-600':'text-gray-500 hover:text-gray-800'}`}>
                         <ArrowLeft className="w-4 h-4"/> Εξερχόμενο
                      </button>
                   </div>
                   <input type="hidden" name="direction" value={direction} />

                   <div className="space-y-4">
                      <div>
                         <label className="block text-sm font-semibold mb-1">Θέμα (Περιεχόμενο)</label>
                         <input required name="subject" className="w-full p-3 border border-border rounded-lg" placeholder="π.χ. Αίτηση αποδεικτικού στοιχείου..." />
                      </div>

                      {direction === 'IN' ? (
                         <div>
                            <label className="block text-sm font-semibold mb-1">Αποστολέας (Αρχή ή Συγγενής)</label>
                            <input name="sender" className="w-full p-3 border border-border rounded-lg" placeholder="π.χ. Ιερά Μητρόπολις" />
                         </div>
                      ) : (
                         <div>
                            <label className="block text-sm font-semibold mb-1">Παραλήπτης (Προς)</label>
                            <input name="receiver" className="w-full p-3 border border-border rounded-lg" placeholder="π.χ. Δήμος Αθηναίων" />
                         </div>
                      )}

                      <div>
                         <label className="block text-sm font-semibold mb-1">Ημερομηνία</label>
                         <input required name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full p-3 border border-border rounded-lg" />
                      </div>

                      {/* Native HTML5 Web Scanner (capture="environment") */}
                      <div className="pt-4 border-t border-border border-dashed">
                         <label className="block text-sm font-semibold mb-2">Web Scanner (Επισύναψη)</label>
                         <div className="relative group cursor-pointer w-full h-32 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 flex flex-col items-center justify-center hover:bg-primary/10 transition-colors">
                            <input type="file" name="document" accept="image/*,application/pdf" capture="environment" className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                            <Camera className="w-8 h-8 text-primary mb-2 opacity-80 group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-semibold text-primary">Λήψη Φωτογραφίας ή Επιλογή Αρχείου</span>
                            <span className="text-xs text-primary/60 mt-1">Αν ανοιχτεί από κινητό, θα ανοίξει την κάμερα!</span>
                         </div>
                      </div>
                   </div>

                   <div className="flex gap-4 pt-4">
                      <Button type="button" onClick={() => setIsModalOpen(false)} variant="outline" className="flex-1 py-6">Ακύρωση</Button>
                      <Button type="submit" className="flex-1 py-6 text-lg font-bold">Πρωτοκόλληση</Button>
                   </div>
                </form>
             </div>
          </div>
       )}
    </div>
  );
}
