'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Upload, FileText, CalendarDays } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TemplateClient({ initialTemplates }: { initialTemplates: any[] }) {
 const [file, setFile] = useState<File | null>(null);
 const [docType, setDocType] = useState('GAMOS');
 const [nameEl, setNameEl] = useState('');
 const [loading, setLoading] = useState(false);
 const router = useRouter();

 const handleUpload = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!file || !nameEl) return toast.error('Παρακαλώ συμπληρώστε όλα τα πεδία.');

 setLoading(true);
 const formData = new FormData();
 formData.append('file', file);
 formData.append('docType', docType);
 formData.append('nameEl', nameEl);
 formData.append('context', docType);

 try {
 const res = await fetch('/api/documents/upload', {
 method: 'POST',
 body: formData,
 });

 if (!res.ok) throw new Error('Αποτυχία κατά το ανέβασμα του αρχείου.');

 toast.success('Το πρότυπο ανέβηκε επιτυχώς!');
 setFile(null);
 setNameEl('');
 router.refresh();
 } catch (err: any) {
 toast.error(err.message);
 } finally {
 setLoading(false);
 }
 };

 return (
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 
 {/* Upload Form */}
 <Card className="col-span-1 shadow-sm border-border/50">
 <CardHeader>
 <CardTitle>Νέο Πρότυπο</CardTitle>
 <CardDescription>Ανέβασμα εγγράφου .docx (Word)</CardDescription>
 </CardHeader>
 <CardContent>
 <form onSubmit={handleUpload} className="space-y-5">
 <div className="space-y-2">
 <Label>Είδος Μυστηρίου / Εγγράφου</Label>
 <Select onValueChange={setDocType} defaultValue={docType}>
 <SelectTrigger>
 <SelectValue placeholder="Επιλέξτε Είδος"/>
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="GAMOS">Γάμος</SelectItem>
 <SelectItem value="VAPTISI">Βάπτιση</SelectItem>
 <SelectItem value="MNHMOSYNO">Μνημόσυνο</SelectItem>
 <SelectItem value="ALLO">Άλλο</SelectItem>
 </SelectContent>
 </Select>
 </div>

 <div className="space-y-2">
 <Label>Ονομασία (π.χ. Βεβαίωση Γάμου Μητρόπολης)</Label>
 <Input value={nameEl} onChange={e => setNameEl(e.target.value)} required />
 </div>

 <div className="space-y-2">
 <Label>Αρχείο Word (.docx)</Label>
 <Input type="file"accept=".docx"onChange={e => setFile(e.target.files?.[0] || null)} required />
 </div>

 <Button type="submit"disabled={loading || !file} className="w-full">
 <Upload className="w-4 h-4 mr-2"/>
 {loading ? 'Ανέβασμα...' : 'Αποθήκευση Προτύπου'}
 </Button>
 </form>
 </CardContent>
 </Card>

 {/* Templates List */}
 <Card className="col-span-1 lg:col-span-2 shadow-sm border-border/50">
 <CardHeader>
 <CardTitle>Διαθέσιμα Πρότυπα Συστήματος</CardTitle>
 </CardHeader>
 <CardContent>
 {initialTemplates.length === 0 ? (
 <div className="text-center py-10 text-muted-foreground border-2 border-dashed border-border rounded-lg">
 <FileText className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3"/>
 <p>Δεν υπάρχουν ανεβασμένα πρότυπα ακόμα.</p>
 </div>
) : (
 <div className="space-y-4">
 {initialTemplates.map(tpl => (
 <div key={tpl.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-border/50 rounded-lg hover:border-primary/30 transition-colors">
 <div className="flex items-center gap-4">
 <div className="bg-primary/10 p-3 rounded-full">
 <FileText className="w-6 h-6 text-primary"/>
 </div>
 <div>
 <h4 className="font-medium text-foreground">{tpl.nameEl}</h4>
 <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
 <span className="bg-secondary px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">{tpl.docType}</span>
 <span>•</span>
 <span>{tpl.fileUrl}</span>
 </p>
 </div>
 </div>
 <div className="mt-4 sm:mt-0 flex flex-col items-end text-xs text-muted-foreground">
 <span className="flex items-center gap-1 mb-1"><CalendarDays className="w-3 h-3"/> {new Date(tpl.createdAt).toLocaleDateString()}</span>
 </div>
 </div>
))}
 </div>
)}
 </CardContent>
 </Card>

 </div>
);
}

