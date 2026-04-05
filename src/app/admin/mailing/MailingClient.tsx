'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Printer, Search, Users, Mail, CheckCircle2, MapPin, Send, Info, AlertCircle } from 'lucide-react';
import { exportLabelsPdf } from '@/actions/mailing';
import { sendBulkEmail } from '@/actions/mailing';
import { toast } from 'sonner';

type Tab = 'labels' | 'email'

interface MailingClientProps {
 contacts: any[]
 smtpConfigured: boolean
}

export default function MailingClient({ contacts, smtpConfigured }: MailingClientProps) {
 const [tab, setTab] = useState<Tab>('labels');
 const [search, setSearch] = useState('');
 const [selectedIds, setSelectedIds] = useState<string[]>([]);
 const [isExporting, setIsExporting] = useState(false);
 const [isSending, setIsSending] = useState(false);

 // Email compose state
 const [emailSubject, setEmailSubject] = useState('');
 const [emailBody, setEmailBody] = useState('');

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
 setSelectedIds(prev =>
 prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
);
 };

 const handleExportLabels = async () => {
 if (selectedIds.length === 0) return toast.error('Επιλέξτε τουλάχιστον έναν παραλήπτη.');
 setIsExporting(true);
 try {
 const res = await exportLabelsPdf(selectedIds);
 if (!res.success || !res.pdfBase64) throw new Error(res.error);
 const linkSource = `data:application/pdf;base64,${res.pdfBase64}`;
 const a = document.createElement('a');
 a.href = linkSource;
 a.download = `Ετικέτες_Αλληλογραφίας_${selectedIds.length}_Ατόμων.pdf`;
 a.click();
 toast.success('Το αρχείο ετικετών κατέβηκε!');
 } catch (e: any) {
 toast.error(e.message || 'Αποτυχία παραγωγής PDF.');
 } finally {
 setIsExporting(false);
 }
 };

 const handleSendEmail = async () => {
 if (selectedIds.length === 0) return toast.error('Επιλέξτε τουλάχιστον έναν παραλήπτη.');
 if (!emailSubject.trim()) return toast.error('Το θέμα είναι υποχρεωτικό.');
 if (!emailBody.trim()) return toast.error('Το κείμενο email είναι υποχρεωτικό.');
 setIsSending(true);
 try {
 const res = await sendBulkEmail(selectedIds, emailSubject, emailBody);
 if (!res.success) {
 if ((res as any).smtpHint) {
 toast.error('SMTP δεν ρυθμίστηκε', { description: res.error, duration: 8000 });
 } else {
 toast.error(res.error);
 }
 return;
 }
 toast.success(`Εστάλησαν ${(res as any).sent} emails με επιτυχία!`);
 setEmailSubject('');
 setEmailBody('');
 setSelectedIds([]);
 } catch (e: any) {
 toast.error('Αποτυχία αποστολής: ' + e.message);
 } finally {
 setIsSending(false);
 }
 };

 return (
 <div className="flex flex-col gap-6">
 {/* Tab Bar */}
 <div className="flex gap-1 bg-[var(--surface-hover)] p-1 rounded-xl w-fit">
 <button
 onClick={() => setTab('labels')}
 className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
 tab === 'labels'
 ? 'bg-white (--surface)] text-[var(--foreground)] shadow-sm'
 : 'text-[var(--text-muted)] hover:text-[var(--foreground)]'
 }`}
 >
 <Printer className="w-4 h-4"/>
 Ετικέτες A4
 </button>
 <button
 onClick={() => setTab('email')}
 className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
 tab === 'email'
 ? 'bg-white (--surface)] text-[var(--foreground)] shadow-sm'
 : 'text-[var(--text-muted)] hover:text-[var(--foreground)]'
 }`}
 >
 <Mail className="w-4 h-4"/>
 Email Αποστολή
 {!smtpConfigured && (
 <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
 SETUP
 </span>
)}
 </button>
 </div>

 {/* SMTP hint banner — shown in email tab when SMTP is not configured */}
 {tab === 'email' && !smtpConfigured && (
 <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
 <Info className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-600"/>
 <div>
 <p className="font-semibold mb-1">Η αποστολή email δεν είναι ακόμα ενεργοποιημένη</p>
 <p className="leading-relaxed">
 Για να ενεργοποιήσετε τη μαζική αποστολή email, ρυθμίστε τις εξής μεταβλητές
 περιβάλλοντος στο Railway:{' '}
 <code className="font-mono bg-amber-100 px-1 rounded text-xs">SMTP_HOST</code>,{' '}
 <code className="font-mono bg-amber-100 px-1 rounded text-xs">SMTP_USER</code>,{' '}
 <code className="font-mono bg-amber-100 px-1 rounded text-xs">SMTP_PASS</code>,{' '}
 <code className="font-mono bg-amber-100 px-1 rounded text-xs">SMTP_PORT</code>,{' '}
 <code className="font-mono bg-amber-100 px-1 rounded text-xs">SMTP_FROM</code>.
 Συνιστώμενοι πάροχοι: <strong>Brevo</strong>, <strong>Resend</strong>, <strong>SendGrid</strong>.
 </p>
 </div>
 </div>
)}

 {/* Toolbar */}
 {tab === 'labels' && (
 <div className="bg-white border border-border p-4 rounded-xl flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
 <div className="flex items-center gap-4 w-full max-w-md">
 <div className="relative flex-1">
 <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
 <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Αναζήτηση Ενορίτη..."className="pl-9 bg-slate-50"/>
 </div>
 </div>
 <div className="flex items-center gap-4 w-full md:w-auto">
 <div className="text-sm font-semibold text-gray-500 bg-slate-100 px-3 py-2 rounded-lg">
 Επιλεγμένοι: <span className="text-blue-600 font-bold">{selectedIds.length}</span>
 </div>
 <Button onClick={handleExportLabels} disabled={selectedIds.length === 0 || isExporting} className="bg-blue-600 hover:bg-blue-700 text-white gap-2 flex-1 md:flex-none">
 <Printer className="w-4 h-4"/>
 {isExporting ? 'Εκτύπωση...' : 'Παραγωγή Ετικετών A4'}
 </Button>
 </div>
 </div>
)}

 {tab === 'email' && (
 <div className="bg-white border border-border p-4 rounded-xl flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
 <div className="flex items-center gap-4 w-full max-w-md">
 <div className="relative flex-1">
 <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
 <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Αναζήτηση Ενορίτη..."className="pl-9 bg-slate-50"/>
 </div>
 </div>
 <div className="text-sm font-semibold text-gray-500 bg-slate-100 px-3 py-2 rounded-lg">
 Επιλεγμένοι: <span className="text-indigo-600 font-bold">{selectedIds.length}</span>
 </div>
 </div>
)}

 {/* Email Compose Panel */}
 {tab === 'email' && (
 <Card className="rounded-xl border-border shadow-sm p-5 space-y-4">
 <h3 className="font-semibold text-[var(--foreground)] flex items-center gap-2">
 <Mail className="w-4 h-4 text-indigo-500"/>
 Σύνταξη Email
 </h3>
 <div className="space-y-3">
 <div>
 <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">Θέμα *</label>
 <Input
 value={emailSubject}
 onChange={e => setEmailSubject(e.target.value)}
 placeholder="π.χ. Πρόσκληση στην Αγρυπνία της Παρασκευής"
 maxLength={200}
 />
 </div>
 <div>
 <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
 Κείμενο Email *
 <span className="ml-2 font-normal text-[var(--text-secondary)]">
 (χρησιμοποιήστε {'{{firstName}}'}, {'{{lastName}}'} για προσωποποίηση)
 </span>
 </label>
 <textarea
 value={emailBody}
 onChange={e => setEmailBody(e.target.value)}
 rows={7}
 placeholder={'Αγαπητέ/η {{firstName}},\n\nΣας προσκαλούμε...'}
 className="w-full px-3 py-2 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-lg resize-y text-[var(--foreground)] placeholder:text-[var(--text-muted)] focus:ring-2 focus:ring-[var(--brand)]/30 focus:border-[var(--brand)] outline-none font-mono"
 />
 </div>
 </div>
 <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
 <p className="text-xs text-[var(--text-muted)]">
 {selectedIds.length > 0
 ? `Θα σταλεί σε ${selectedIds.length} παραλήπτες`
 : 'Επιλέξτε παραλήπτες από τη λίστα'}
 </p>
 <Button
 onClick={handleSendEmail}
 disabled={!smtpConfigured || selectedIds.length === 0 || isSending}
 className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
 >
 {isSending ? (
 <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"/>
) : (
 <Send className="w-4 h-4"/>
)}
 {isSending ? 'Αποστολή...' : `Αποστολή σε ${selectedIds.length} ενορίτες`}
 </Button>
 </div>
 </Card>
)}

 {/* Contacts Table */}
 <Card className="rounded-xl border-border shadow-sm overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full text-sm text-left">
 <thead className="bg-slate-50 text-gray-600 border-b border-border">
 <tr>
 <th className="p-4 w-12">
 <Checkbox
 checked={selectedIds.length === filteredContacts.length && filteredContacts.length > 0}
 onCheckedChange={toggleSelectAll}
 />
 </th>
 <th className="p-4 font-semibold">Ονοματεπώνυμο</th>
 {tab === 'labels' && <th className="p-4 font-semibold"><MapPin className="w-4 h-4 inline-block mr-1"/>Διεύθυνση</th>}
 {tab === 'email' && <th className="p-4 font-semibold"><Mail className="w-4 h-4 inline-block mr-1"/>Email</th>}
 <th className="p-4 font-semibold">Τηλέφωνο</th>
 <th className="p-4 font-semibold text-center">Κατάσταση</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border">
 {filteredContacts.length === 0 ? (
 <tr><td colSpan={5} className="p-12 text-center text-gray-500">Δεν βρέθηκαν επαφές.</td></tr>
) : filteredContacts.map((contact: any) => {
 const hasEmail = !!contact.email
 const isDisabledForEmail = tab === 'email' && !hasEmail

 return (
 <tr key={contact.id} className={`hover:bg-blue-50/50 :bg-slate-800 transition-colors ${isDisabledForEmail ? 'opacity-50' : ''}`}>
 <td className="p-4">
 <Checkbox
 checked={selectedIds.includes(contact.id)}
 disabled={isDisabledForEmail}
 onCheckedChange={() => !isDisabledForEmail && toggleSelect(contact.id)}
 />
 </td>
 <td className="p-4 font-bold text-gray-900">
 {contact.lastName} {contact.firstName}
 </td>
 {tab === 'labels' && (
 <td className="p-4">
 <div className="font-medium">{contact.address || '—'}</div>
 <div className="text-xs text-gray-500">Τ.Κ. {contact.postalCode || '---'}</div>
 </td>
)}
 {tab === 'email' && (
 <td className="p-4 text-gray-600">
 {contact.email || <span className="text-gray-400 italic text-xs">Χωρίς email</span>}
 </td>
)}
 <td className="p-4 text-gray-500">{contact.phone || contact.mobile || '-'}</td>
 <td className="p-4 text-center">
 {tab === 'email' && !hasEmail ? (
 <span className="bg-slate-100 text-slate-500 text-xs px-2 py-1 rounded-full font-semibold flex items-center justify-center gap-1 w-fit mx-auto">
 <AlertCircle className="w-3 h-3"/> Χωρίς email
 </span>
) : (
 <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-semibold flex items-center justify-center gap-1 w-fit mx-auto">
 <CheckCircle2 className="w-3 h-3"/> Έτοιμο
 </span>
)}
 </td>
 </tr>
)
 })}
 </tbody>
 </table>
 </div>
 </Card>
 </div>
);
}
