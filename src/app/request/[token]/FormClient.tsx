'use client'

import { useState } from 'react'
import { savePublicTokenAnswers } from '@/actions/sacraments'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CheckCircle2, UserCircle, Users, Quote, UploadCloud } from 'lucide-react'

// Sub-component for Background Uploading
const FileUploader = ({ templeId, tokenId, label, docType }: any) => {
 const [uploading, setUploading] = useState(false);
 const [filename, setFilename] = useState('');

 const handleChange = async (e: any) => {
 const file = e.target.files?.[0];
 if (!file) return;
 setUploading(true);
 
 const formData = new FormData();
 formData.append('file', file);
 formData.append('templeId', templeId);
 formData.append('tokenId', tokenId);
 formData.append('docType', docType);
 formData.append('label', label);

 try {
 const res = await fetch('/api/vault/upload', { method: 'POST', body: formData });
 if (res.ok) {
 setFilename(file.name);
 } else {
 alert('Αποτυχία ανεβάσματος.');
 }
 } catch {
 alert('Σφάλμα δικτύου κατά το ανέβασμα.');
 }
 setUploading(false);
 };

 return (
 <div className="mt-3 p-3 bg-white/50 border border-dashed border-border rounded-lg text-sm">
 <div className="flex flex-col gap-1">
 <span className="font-medium text-muted-foreground flex items-center gap-1"><UploadCloud className="w-4 h-4"/> Ανέβασμα Δικαιολογητικού: {label}</span>
 {filename ? (
 <span className="text-green-600 font-medium">✔️ {filename} (Αποθηκεύτηκε στο Vault του Ναού)</span>
) : (
 <div className="flex items-center gap-2">
 <Input type="file"onChange={handleChange} disabled={uploading} className="w-full text-xs cursor-pointer"accept=".pdf,image/*"/>
 {uploading && <span className="animate-pulse text-xs text-brand">Αποθήκευση...</span>}
 </div>
)}
 </div>
 </div>
)
}

export default function FormClient({ token }: { token: any }) {
 const [loading, setLoading] = useState(false);
 const [success, setSuccess] = useState(false);
 const [errorStr, setErrorStr] = useState('');

 const existingMeta = token.ceremonyMeta?.dataJson ? JSON.parse(token.ceremonyMeta.dataJson) : {};
 const existingPersons = token.persons || [];
 const p = (role: string) => existingPersons.find((x: any) => x.role === role) || {};

 const [groomStatus, setGroomStatus] = useState(existingMeta.groomStatus || 'agamos');
 const [groomDivorceRef, setGroomDivorceRef] = useState(existingMeta.groomDivorceRef || '');
 const [groomSymfonoRef, setGroomSymfonoRef] = useState(existingMeta.groomSymfonoRef || '');
 
 const [brideStatus, setBrideStatus] = useState(existingMeta.brideStatus || 'agami');
 const [brideDivorceRef, setBrideDivorceRef] = useState(existingMeta.brideDivorceRef || '');
 const [brideSymfonoRef, setBrideSymfonoRef] = useState(existingMeta.brideSymfonoRef || '');
 const [koumparosIsOrthodox, setKoumparosIsOrthodox] = useState(existingMeta.koumparosIsOrthodox || '');

 const [parentsMarriage, setParentsMarriage] = useState(existingMeta.parentsMarriage || '');
 const [anadoxosIsOrthodox, setAnadoxosIsOrthodox] = useState(existingMeta.anadoxosIsOrthodox || '');

 // Persons State
 // GROOM
 const [groomFirst, setGroomFirst] = useState(p('groom').firstName || '');
 const [groomLast, setGroomLast] = useState(p('groom').lastName || '');
 const [groomFather, setGroomFather] = useState(p('groom').fathersName || '');

 // BRIDE
 const [brideFirst, setBrideFirst] = useState(p('bride').firstName || '');
 const [brideLast, setBrideLast] = useState(p('bride').lastName || '');
 const [brideFather, setBrideFather] = useState(p('bride').fathersName || '');

 // KOUMPAROS
 const [koumparosFirst, setKoumparosFirst] = useState(p('koumparos').firstName || '');
 const [koumparosLast, setKoumparosLast] = useState(p('koumparos').lastName || '');

 // CHILD & PARENT & GODPARENT
 const [childFirst, setChildFirst] = useState(p('child').firstName || existingMeta.childName || '');
 const [childLast, setChildLast] = useState(p('child').lastName || '');
 
 const [parentFirst, setParentFirst] = useState(p('father').firstName || p('mother').firstName || '');
 const [parentLast, setParentLast] = useState(p('father').lastName || p('mother').lastName || '');
 
 const [godparentFirst, setGodparentFirst] = useState(p('godparent').firstName || '');
 const [godparentLast, setGodparentLast] = useState(p('godparent').lastName || '');

 const isGamos = token.serviceType === 'GAMOS';

 const handleSubmit = async (e: any) => {
 e.preventDefault();
 setLoading(true);
 setErrorStr('');

 let payload: any = {};
 let personsArr: any[] = [];

 if (isGamos) {
 payload = { 
 groomStatus, 
 groomDivorceRef: groomStatus === 'diazevmenos' ? groomDivorceRef : undefined, 
 groomSymfonoRef: groomStatus === 'symfono' ? groomSymfonoRef : undefined,
 brideStatus, 
 brideDivorceRef: brideStatus === 'diazevmeni' ? brideDivorceRef : undefined, 
 brideSymfonoRef: brideStatus === 'symfono' ? brideSymfonoRef : undefined,
 koumparosIsOrthodox 
 };
 personsArr.push({ role: 'groom', firstName: groomFirst, lastName: groomLast, fathersName: groomFather });
 personsArr.push({ role: 'bride', firstName: brideFirst, lastName: brideLast, fathersName: brideFather });
 personsArr.push({ role: 'koumparos', firstName: koumparosFirst, lastName: koumparosLast });
 } else {
 payload = { parentsMarriage, anadoxosIsOrthodox, childName: childFirst };
 personsArr.push({ role: 'child', firstName: childFirst, lastName: childLast });
 personsArr.push({ role: 'father', firstName: parentFirst, lastName: parentLast }); // Generic role
 personsArr.push({ role: 'godparent', firstName: godparentFirst, lastName: godparentLast });
 }

 const res = await savePublicTokenAnswers(token.tokenStr, JSON.stringify(payload), personsArr);
 
 if (res.success) {
 setSuccess(true);
 window.scrollTo({ top: 0, behavior: 'smooth' });
 } else {
 setErrorStr(res.error || 'Σφάλμα υποβολής. Παρακαλούμε δοκιμάστε ξανά.');
 }
 setLoading(false);
 }

 if (success) {
 return (
 <Card className="shadow-md border-border/50 text-center py-12 px-4 animate-in fade-in zoom-in-95 bg-white">
 <div className="flex justify-center mb-6">
 <CheckCircle2 className="w-20 h-20 text-green-500"/>
 </div>
 <h2 className="text-2xl font-bold text-foreground mb-4">Επιτυχής Καταχώρηση!</h2>
 <p className="text-muted-foreground mb-8 max-w-md mx-auto">
 Τα στοιχεία σας υποβλήθηκαν και τα τυχόν αρχεία αποθηκεύτηκαν με ασφάλεια. Ο ιερέας θα ελέγξει την ορθότητά τους προκειμένου να προχωρήσει στην έκδοση των επίσημων εγγράφων.
 </p>
 </Card>
);
 }

 return (
 <Card className="shadow-md border-border/50 mb-12">
 <CardHeader className="border-b border-border/50 bg-muted/20 pb-6">
 <div className="flex items-center gap-3 mb-2">
 <div className="p-2 bg-primary/10 rounded-full text-primary">
 {isGamos ? <Users className="w-5 h-5"/> : <UserCircle className="w-5 h-5"/>}
 </div>
 <CardTitle className="text-xl">Δήλωση Στοιχείων Φυσικών Προσώπων</CardTitle>
 </div>
 <CardDescription className="text-sm">
 Παρακαλούμε συμπληρώστε τα ακριβή ονόματα όπως αναγράφονται στις ταυτότητες. Θα χρησιμοποιηθούν για το Μητρώο της Ενορίας και την Παραγωγή Εγγράφων.
 </CardDescription>
 </CardHeader>
 
 <CardContent className="pt-8">
 <form onSubmit={handleSubmit} className="space-y-8">
 {errorStr && <div className="bg-red-50 text-red-600 p-4 rounded-lg font-medium border border-red-200">{errorStr}</div>}

 {isGamos ? (
 <>
 {/* GROOM */}
 <div className="bg-muted/30 p-5 rounded-xl border border-border">
 <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><div className="w-2 h-2 bg-blue-500 rounded-full"></div> Νυμφίος (Γαμπρός)</h3>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
 <div className="space-y-2"><Label>Όνομα</Label><Input value={groomFirst} onChange={e=>setGroomFirst(e.target.value)} required /></div>
 <div className="space-y-2"><Label>Επώνυμο</Label><Input value={groomLast} onChange={e=>setGroomLast(e.target.value)} required /></div>
 <div className="space-y-2"><Label>Πατρώνυμο</Label><Input value={groomFather} onChange={e=>setGroomFather(e.target.value)} required /></div>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="space-y-2">
 <Label>Οικογενειακή Κατάσταση</Label>
 <Select value={groomStatus} onValueChange={setGroomStatus}>
 <SelectTrigger><SelectValue/></SelectTrigger>
 <SelectContent><SelectItem value="agamos">Άγαμος</SelectItem><SelectItem value="diazevmenos">Διαζευγμένος</SelectItem><SelectItem value="xiros">Χήρος</SelectItem><SelectItem value="symfono">Σύμφωνο Συμβίωσης</SelectItem></SelectContent>
 </Select>
 </div>
 {groomStatus === 'diazevmenos' && (
 <div className="space-y-2 animate-in fade-in">
 <Label>Αριθμός Διαζευκτηρίου / Μητρόπολη</Label>
 <Input value={groomDivorceRef} onChange={e => setGroomDivorceRef(e.target.value)} placeholder="π.χ. 123/2021 Ι.Μ. Πειραιώς"required />
 <FileUploader templeId={token.templeId} tokenId={token.id} docType="DIAZEYKTIRIO"label="Ψηφιακό Αντίγραφο Διαζευκτηρίου (Νυμφίου)"/>
 </div>
)}
 {groomStatus === 'symfono' && (
 <div className="space-y-2 animate-in fade-in">
 <Label>Στοιχεία Συμφώνου Συμβίωσης (Συμβολαιογράφος/Ημ/νια)</Label>
 <Input value={groomSymfonoRef} onChange={e => setGroomSymfonoRef(e.target.value)} placeholder="π.χ. 12/2023, Συμβολαιογράφος Αθηνών"required />
 <FileUploader templeId={token.templeId} tokenId={token.id} docType="ALLO"label="Αντίγραφο Συμφώνου Συμβίωσης"/>
 </div>
)}
 {groomStatus === 'xiros' && <FileUploader templeId={token.templeId} tokenId={token.id} docType="ALLO"label="Ληξιαρχική Πράξη Θανάτου"/>}
 </div>
 </div>

 {/* BRIDE */}
 <div className="bg-muted/30 p-5 rounded-xl border border-border">
 <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><div className="w-2 h-2 bg-pink-500 rounded-full"></div> Νύμφη</h3>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
 <div className="space-y-2"><Label>Όνομα</Label><Input value={brideFirst} onChange={e=>setBrideFirst(e.target.value)} required /></div>
 <div className="space-y-2"><Label>Επώνυμο (Πατρικό)</Label><Input value={brideLast} onChange={e=>setBrideLast(e.target.value)} required /></div>
 <div className="space-y-2"><Label>Πατρώνυμο</Label><Input value={brideFather} onChange={e=>setBrideFather(e.target.value)} required /></div>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="space-y-2">
 <Label>Οικογενειακή Κατάσταση</Label>
 <Select value={brideStatus} onValueChange={setBrideStatus}>
 <SelectTrigger><SelectValue/></SelectTrigger>
 <SelectContent><SelectItem value="agami">Άγαμη</SelectItem><SelectItem value="diazevmeni">Διαζευγμένη</SelectItem><SelectItem value="xira">Χήρα</SelectItem><SelectItem value="symfono">Σύμφωνο Συμβίωσης</SelectItem></SelectContent>
 </Select>
 </div>
 {brideStatus === 'diazevmeni' && (
 <div className="space-y-2 animate-in fade-in">
 <Label>Αριθμός Διαζευκτηρίου / Μητρόπολη</Label>
 <Input value={brideDivorceRef} onChange={e => setBrideDivorceRef(e.target.value)} placeholder="π.χ. 456/2022 Ι.Μ. Αθηνών"required />
 <FileUploader templeId={token.templeId} tokenId={token.id} docType="DIAZEYKTIRIO"label="Ψηφιακό Αντίγραφο Διαζευκτηρίου (Νύμφης)"/>
 </div>
)}
 {brideStatus === 'symfono' && (
 <div className="space-y-2 animate-in fade-in">
 <Label>Στοιχεία Συμφώνου Συμβίωσης (Συμβολαιογράφος/Ημ/νια)</Label>
 <Input value={brideSymfonoRef} onChange={e => setBrideSymfonoRef(e.target.value)} placeholder="π.χ. 45/2024, Ληξιαρχείο Πατρών"required />
 <FileUploader templeId={token.templeId} tokenId={token.id} docType="ALLO"label="Αντίγραφο Συμφώνου Συμβίωσης"/>
 </div>
)}
 {brideStatus === 'xira' && <FileUploader templeId={token.templeId} tokenId={token.id} docType="ALLO"label="Ληξιαρχική Πράξη Θανάτου"/>}
 </div>
 </div>

 {/* KOUMPAROS */}
 <div className="bg-muted/30 p-5 rounded-xl border border-border">
 <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><div className="w-2 h-2 bg-amber-500 rounded-full"></div> Κουμπάρος / Παράνυμφος</h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
 <div className="space-y-2"><Label>Όνομα</Label><Input value={koumparosFirst} onChange={e=>setKoumparosFirst(e.target.value)} required /></div>
 <div className="space-y-2"><Label>Επώνυμο</Label><Input value={koumparosLast} onChange={e=>setKoumparosLast(e.target.value)} required /></div>
 </div>
 <div className="space-y-2 max-w-md">
 <Label>Είναι Ορθόδοξος Χριστιανός;</Label>
 <Select value={koumparosIsOrthodox} onValueChange={setKoumparosIsOrthodox} required>
 <SelectTrigger><SelectValue placeholder="Επιλέξτε..."/></SelectTrigger>
 <SelectContent><SelectItem value="yes">Ναι, έχει βαπτιστεί Ορθόδοξος</SelectItem><SelectItem value="no">Όχι</SelectItem></SelectContent>
 </Select>
 {koumparosIsOrthodox === 'no' && <p className="text-sm text-red-600 mt-2 font-medium">Σύμφωνα με την Εκκλησία, ο παράνυμφος πρέπει να είναι Ορθόδοξος Χριστιανός.</p>}
 {koumparosIsOrthodox === 'yes' && <FileUploader templeId={token.templeId} tokenId={token.id} docType="PISTOPOIITIKO"label="Πιστοποιητικό Βάπτισης Κουμπάρου (Προαιρετικό)"/>}
 </div>
 </div>
 </>
) : (
 <>
 {/* VAPTISI */}
 <div className="bg-muted/30 p-5 rounded-xl border border-border">
 <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><div className="w-2 h-2 bg-blue-500 rounded-full"></div> Νεοφώτιστος/η</h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="space-y-2"><Label>Όνομα (Ονομαστική Πτώση - πχ. \"Μαρία\", \"Γεώργιος\")</Label><Input value={childFirst} onChange={e=>setChildFirst(e.target.value)} required /></div>
 <div className="space-y-2"><Label>Επώνυμο</Label><Input value={childLast} onChange={e=>setChildLast(e.target.value)} required /></div>
 </div>
 <div className="mt-4"><FileUploader templeId={token.templeId} tokenId={token.id} docType="PISTOPOIITIKO"label="Ληξιαρχική Πράξη Γέννησης Παιδιού"/></div>
 </div>

 <div className="bg-muted/30 p-5 rounded-xl border border-border">
 <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><div className="w-2 h-2 bg-purple-500 rounded-full"></div> Κηδεμόνας / Γονέας υποβάλλων</h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
 <div className="space-y-2"><Label>Όνομα</Label><Input value={parentFirst} onChange={e=>setParentFirst(e.target.value)} required /></div>
 <div className="space-y-2"><Label>Επώνυμο</Label><Input value={parentLast} onChange={e=>setParentLast(e.target.value)} required /></div>
 </div>
 <div className="space-y-2 max-w-md">
 <Label>Είδος Γάμου Γονέων</Label>
 <Select value={parentsMarriage} onValueChange={setParentsMarriage} required>
 <SelectTrigger><SelectValue placeholder="Επιλέξτε..."/></SelectTrigger>
 <SelectContent><SelectItem value="thriskeftikos">Θρησκευτικός Γάμος</SelectItem><SelectItem value="politikos">Πολιτικός Γάμος</SelectItem><SelectItem value="simfiosi">Σύμφωνο Συμβίωσης</SelectItem><SelectItem value="monogoneiki">Μονογονεϊκή Οικογένεια</SelectItem></SelectContent>
 </Select>
 </div>
 </div>

 <div className="bg-muted/30 p-5 rounded-xl border border-border">
 <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><div className="w-2 h-2 bg-amber-500 rounded-full"></div> Ανάδοχος (Νονός/Νονά)</h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
 <div className="space-y-2"><Label>Όνομα</Label><Input value={godparentFirst} onChange={e=>setGodparentFirst(e.target.value)} required /></div>
 <div className="space-y-2"><Label>Επώνυμο</Label><Input value={godparentLast} onChange={e=>setGodparentLast(e.target.value)} required /></div>
 </div>
 <div className="space-y-2 max-w-md">
 <Label>Είναι Ορθόδοξος Χριστιανός;</Label>
 <Select value={anadoxosIsOrthodox} onValueChange={setAnadoxosIsOrthodox} required>
 <SelectTrigger><SelectValue placeholder="Επιλέξτε..."/></SelectTrigger>
 <SelectContent><SelectItem value="yes">Ναι, έχει βαπτιστεί Ορθόδοξος</SelectItem><SelectItem value="no">Όχι </SelectItem></SelectContent>
 </Select>
 {anadoxosIsOrthodox === 'no' && <p className="text-sm text-red-600 mt-2 font-medium">ΑΠΑΓΟΡΕΥΕΤΑΙ: Ο Ανάδοχος υποχρεούται από τους Ιερούς Κανόνες να είναι Ορθόδοξος.</p>}
 {anadoxosIsOrthodox === 'yes' && <FileUploader templeId={token.templeId} tokenId={token.id} docType="PISTOPOIITIKO"label="Πιστοποιητικό Βάπτισης ή Οικογενειακής Κατάστασης (Προαιρετικό)"/>}
 </div>
 </div>
 </>
)}

 <div className="bg-primary/5 p-4 rounded-lg flex gap-3 text-sm border border-primary/20">
 <Quote className="w-5 h-5 text-primary shrink-0 opacity-50"/>
 <p className="text-foreground/80">Δηλώνω υπεύθυνα ότι όλα τα παραπάνω στοιχεία είναι αληθή. Αν αποδειχθεί ανακρίβεια, το Μυστήριο δύναται να ακυρωθεί/αναβληθεί από την Ιερά Μητρόπολη.</p>
 </div>

 <div className="flex justify-end pt-4 border-t border-border">
 <Button type="submit"size="lg"disabled={loading} className="w-full md:w-auto min-w-[200px]">
 {loading ? 'Καταχώρηση Δεδομένων...' : '🔒 Οριστική Υποβολή'}
 </Button>
 </div>
 </form>
 </CardContent>
 </Card>
)
}
