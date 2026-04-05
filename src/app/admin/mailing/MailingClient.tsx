'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Printer, Search, Users, Mail, CheckCircle2, MapPin } from 'lucide-react';
import { exportLabelsPdf } from '@/actions/mailing';
import { toast } from 'sonner';

export default function MailingClient({ contacts }: { contacts: any[] }) {
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  const filteredContacts = contacts.filter((c: any) => 
     c.lastName.toLowerCase().includes(search.toLowerCase()) || 
     c.firstName.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelectAll = () => {
      if (selectedIds.length === filteredContacts.length) {
          setSelectedIds([]);
      } else {
          setSelectedIds(filteredContacts.map(c => c.id));
      }
  };

  const toggleSelect = (id: string) => {
      if (selectedIds.includes(id)) {
          setSelectedIds(selectedIds.filter(x => x !== id));
      } else {
          setSelectedIds([...selectedIds, id]);
      }
  };

  const handleExport = async () => {
      if (selectedIds.length === 0) return toast.error('Επιλέξτε τουλάχιστον έναν παραλήπτη.');
      setIsExporting(true);
      
      try {
         const res = await exportLabelsPdf(selectedIds);
         if (!res.success || !res.pdfBase64) throw new Error(res.error);
         
         const linkSource = `data:application/pdf;base64,${res.pdfBase64}`;
         const downloadLink = document.createElement("a");
         downloadLink.href = linkSource;
         downloadLink.download = `Ετικέτες_Αλληλογραφίας_${selectedIds.length}_Ατόμων.pdf`;
         downloadLink.click();
         toast.success('Το αρχείο ετικετών κατέβηκε!');
      } catch (e: any) {
         toast.error(e.message || 'Αποτυχία παραγωγής PDF.');
      } finally {
         setIsExporting(false);
      }
  };

  return (
    <div className="flex flex-col gap-6">
       
       <div className="bg-white dark:bg-gray-900 border border-border p-4 rounded-xl flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
           <div className="flex items-center gap-4 w-full max-w-md">
               <div className="relative flex-1">
                   <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                   <Input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Αναζήτηση Ενορίτη..." className="pl-9 bg-slate-50" />
               </div>
           </div>
           <div className="flex items-center gap-4 w-full md:w-auto">
               <div className="text-sm font-semibold text-gray-500 bg-slate-100 px-3 py-2 rounded-lg">
                   Επιλεγμένοι: <span className="text-blue-600 font-bold">{selectedIds.length}</span>
               </div>
               <Button onClick={handleExport} disabled={selectedIds.length === 0 || isExporting} className="bg-blue-600 hover:bg-blue-700 text-white gap-2 flex-1 md:flex-none">
                   <Printer className="w-4 h-4" /> 
                   {isExporting ? 'Εκτύπωση...' : 'Παραγωγή Ετικετών A4'}
               </Button>
           </div>
       </div>

       <Card className="rounded-xl border-border shadow-sm overflow-hidden">
           <div className="overflow-x-auto">
               <table className="w-full text-sm text-left">
                   <thead className="bg-slate-50 dark:bg-gray-800 text-gray-600 border-b border-border">
                       <tr>
                           <th className="p-4 w-12">
                               <Checkbox 
                                  checked={selectedIds.length === filteredContacts.length && filteredContacts.length > 0} 
                                  onCheckedChange={toggleSelectAll} 
                               />
                           </th>
                           <th className="p-4 font-semibold">Ονοματεπώνυμο</th>
                           <th className="p-4 font-semibold"><MapPin className="w-4 h-4 inline-block mr-1"/> Διεύθυνση Αποστολής</th>
                           <th className="p-4 font-semibold">Τηλέφωνο</th>
                           <th className="p-4 font-semibold text-center">Κατάσταση</th>
                       </tr>
                   </thead>
                   <tbody className="divide-y divide-border">
                       {filteredContacts.length === 0 ? (
                           <tr><td colSpan={5} className="p-12 text-center text-gray-500">Δεν βρέθηκαν επαφές με έγκυρη ταχυδρομική διεύθυνση.</td></tr>
                       ) : filteredContacts.map((contact: any) => (
                           <tr key={contact.id} className="hover:bg-blue-50/50 dark:hover:bg-slate-800 transition-colors">
                               <td className="p-4">
                                   <Checkbox 
                                      checked={selectedIds.includes(contact.id)}
                                      onCheckedChange={() => toggleSelect(contact.id)} 
                                   />
                               </td>
                               <td className="p-4 font-bold text-gray-900 dark:text-white">
                                   {contact.lastName} {contact.firstName}
                               </td>
                               <td className="p-4">
                                   <div className="font-medium">{contact.address}</div>
                                   <div className="text-xs text-gray-500">Τ.Κ. {contact.postalCode || '---'}</div>
                               </td>
                               <td className="p-4 text-gray-500">{contact.phone || contact.mobile || '-'}</td>
                               <td className="p-4 text-center">
                                   <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-semibold flex items-center justify-center gap-1 w-fit mx-auto">
                                      <CheckCircle2 className="w-3 h-3"/> Έτοιμο
                                   </span>
                               </td>
                           </tr>
                       ))}
                   </tbody>
               </table>
           </div>
       </Card>
    </div>
  );
}
