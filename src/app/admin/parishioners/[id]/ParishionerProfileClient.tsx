'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import TagsEditor from './TagsEditor'
import EditParishionerForm from './EditParishionerForm'
import VaultPanel from '@/components/vault/VaultPanel'
import { createBeneficiary } from '@/actions/philanthropy'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, User, Banknote, Euro, FileText, Activity, Utensils, Info, Share2, Trash2 } from 'lucide-react'
import { History } from 'lucide-react'
import { deleteRelationship } from '@/actions/relationships'

export default function ParishionerProfileClient({ p, beneficiary, relationships, auditLogs }: { p: any, beneficiary: any, relationships: any, auditLogs: any[] }) {
 const router = useRouter();
 const [activeTab, setActiveTab] = useState('overview');
 const [isRegistering, setIsRegistering] = useState(false);

 // Υπολογισμός Συνόλου Δωρεών
 const totalDonations = p.donations?.reduce((s: number, d: any) => s + d.amount, 0) || 0;


 return (
 <div className="container-fluid mt-6 space-y-6 max-w-6xl animate-in fade-in duration-500">
 
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-6">
 <div>
 <Link href="/admin/parishioners"className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-1 mb-3 transition-colors">
 <ArrowLeft className="w-4 h-4"/> Πίσω στο Μητρώο
 </Link>
 <div className="flex flex-col sm:flex-row sm:items-center gap-4">
 <div className="bg-primary text-primary-foreground w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-2xl shadow-sm shrink-0">
 {p.firstName[0]}{p.lastName[0]}
 </div>
 <div>
 <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
 {p.firstName} {p.lastName}
 </h1>
 <div className="flex flex-wrap gap-2 mt-2">
 <Badge variant="outline"className="bg-[var(--success-light)] text-emerald-800 border-[var(--success)]/20">
 Ενεργός Ενορίτης
 </Badge>
 {beneficiary && (
 <Badge variant="outline"className="bg-blue-100 text-blue-800 border-blue-200">
 Μέλος Φιλοπτώχου
 </Badge>
)}
 </div>
 </div>
 </div>
 </div>
 
 <div className="flex justify-end">
 <EditParishionerForm parishioner={p} />
 </div>
 </div>

 <Tabs defaultValue="overview"className="w-full"onValueChange={setActiveTab}>
 <TabsList className="flex flex-wrap h-auto overflow-x-auto justify-start border-b border-border bg-transparent p-0 rounded-none w-full gap-4 mb-6">
 <TabsTrigger value="overview"className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2 font-medium">
 Γενικά Στοιχεία
 </TabsTrigger>
 <TabsTrigger value="finances"className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2 font-medium flex gap-2">
 Οικονομικά <Badge variant="secondary"className="ml-1 text-xs">{totalDonations.toFixed(2)} €</Badge>
 </TabsTrigger>
 <TabsTrigger value="sacraments"className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2 font-medium">
 Μυστήρια
 </TabsTrigger>
 <TabsTrigger value="sissitio"className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2 font-medium">
 Φιλόπτωχο
 </TabsTrigger>
 <TabsTrigger value="history"className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2 font-medium">
 Ιστορικό Αλλαγών
 </TabsTrigger>
 <TabsTrigger value="vault"className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2 font-medium">
 Αρχειοθήκη
 </TabsTrigger>
 </TabsList>

 <TabsContent value="overview"className="space-y-6">
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 <Card className="shadow-sm border-border/50">
 <CardHeader className="border-b border-border/50 pb-4">
 <CardTitle className="text-lg">Στοιχεία Επικοινωνίας & Ταυτότητας</CardTitle>
 </CardHeader>
 <CardContent className="pt-6">
 <div className="grid grid-cols-3 gap-y-4 gap-x-2 text-sm">
 <div className="text-muted-foreground font-medium">Τηλέφωνο:</div>
 <div className="col-span-2 font-semibold text-foreground">{p.phone || '-'}</div>
 
 <div className="text-muted-foreground font-medium">Email:</div>
 <div className="col-span-2 font-semibold text-foreground">{p.email || '-'}</div>
 
 <div className="text-muted-foreground font-medium">Διεύθυνση:</div>
 <div className="col-span-2 font-semibold text-foreground">{p.address || '-'}</div>
 
 <div className="text-muted-foreground font-medium">Πόλη:</div>
 <div className="col-span-2 font-semibold text-foreground">{p.city || '-'}</div>
 
 <div className="text-muted-foreground font-medium">Α.Φ.Μ.:</div>
 <div className="col-span-2 font-mono bg-muted/50 w-fit px-2 py-0.5 rounded text-foreground">{p.afm || '-'}</div>
 </div>
 </CardContent>
 </Card>
 
 <Card className="shadow-sm border-border/50">
 <CardHeader className="border-b border-border/50 pb-4">
 <CardTitle className="text-lg">Ιδιότητες / Tags Ναού</CardTitle>
 <CardDescription>Σημειώστε αν ο ενορίτης είναι Επίτροπος, Ψάλτης κλπ.</CardDescription>
 </CardHeader>
 <CardContent className="pt-6">
 <TagsEditor parishionerId={p.id} initialRolesJson={p.roles} />
 </CardContent>
 </Card>
 
 <Card className="shadow-sm border-border/50">
 <CardHeader className="border-b border-border/50 pb-4">
 <CardTitle className="text-lg flex items-center gap-2"><Share2 className="w-5 h-5"/> Πνευματικές Συγγένειες</CardTitle>
 <CardDescription>Λίστα αναδόχων, κουμπάρων και μελών οικογένειας. (Για προσθήκη νέων, μεταβείτε στις σχετικές σελίδες Μυστηρίων)</CardDescription>
 </CardHeader>
 <CardContent className="pt-6 space-y-4">
 {(!relationships?.sources.length && !relationships?.targets.length) ? (
 <p className="text-sm text-muted-foreground">Δεν έχουν καταχωρηθεί πνευματικές/οικογενειακές σχέσεις.</p>
) : (
 <>
 {relationships.sources.map((rel: any) => (
 <div key={rel.id} className="flex justify-between items-center text-sm p-3 bg-muted/30 rounded-lg border border-border/40">
 <div>
 <span className="font-bold text-foreground">{rel.source.lastName} {rel.source.firstName}</span> 
 <span className="text-muted-foreground"> είναι {rel.relationshipType} του/της ενορίτη</span>
 </div>
 <button onClick={async () => {
 if(confirm('Διαγραφή σχέσης;')) { await deleteRelationship(rel.id); window.location.reload(); }
 }} className="text-red-500 hover:bg-red-50 p-1.5 rounded"><Trash2 className="w-4 h-4"/></button>
 </div>
))}
 {relationships.targets.map((rel: any) => (
 <div key={rel.id} className="flex justify-between items-center text-sm p-3 bg-muted/30 rounded-lg border border-border/40">
 <div>
 <span className="text-muted-foreground">Ο/Η ενορίτης είναι {rel.relationshipType} του/της </span>
 <span className="font-bold text-foreground">{rel.target.lastName} {rel.target.firstName}</span> 
 </div>
 <button onClick={async () => {
 if(confirm('Διαγραφή σχέσης;')) { await deleteRelationship(rel.id); window.location.reload(); }
 }} className="text-red-500 hover:bg-red-50 p-1.5 rounded"><Trash2 className="w-4 h-4"/></button>
 </div>
))}
 </>
)}
 </CardContent>
 </Card>
 </div>
 </TabsContent>

 <TabsContent value="finances">
 <Card className="shadow-sm border-border/50">
 <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/50">
 <div>
 <CardTitle className="text-lg flex items-center gap-2"><Euro className="w-5 h-5"/> Ιστορικό Επώνυμων Δωρεών</CardTitle>
 </div>
 <div className="text-primary font-bold text-lg">Σύνολο: {totalDonations.toFixed(2)} €</div>
 </CardHeader>
 <div className="overflow-x-auto">
 <table className="w-full text-sm text-left">
 <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
 <tr>
 <th className="px-6 py-3 font-semibold">Ημερομηνία</th>
 <th className="px-6 py-3 font-semibold">Αιτιολογία</th>
 <th className="px-6 py-3 font-semibold">Διπλότυπο</th>
 <th className="px-6 py-3 font-semibold text-right">Ποσό</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border/50">
 {(!p.donations || p.donations.length === 0) ? (
 <tr><td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">Κανένα οικονομικό ιστορικό καταγεγραμμένο.</td></tr>
) : (
 p.donations.map((d: any) => (
 <tr key={d.id} className="bg-card hover:bg-muted/30 transition-colors">
 <td className="px-6 py-4 font-medium">{new Date(d.date).toLocaleDateString('el-GR')}</td>
 <td className="px-6 py-4">
 <span className="inline-flex px-2 py-1 rounded bg-secondary text-secondary-foreground text-xs font-medium">
 {d.purpose}
 </span>
 </td>
 <td className="px-6 py-4 font-mono text-muted-foreground">{d.receiptNumber || '-'}</td>
 <td className="px-6 py-4 text-right font-bold">{d.amount.toFixed(2)} €</td>
 </tr>
))
)}
 </tbody>
 </table>
 </div>
 </Card>
 </TabsContent>

 <TabsContent value="sacraments">
 <Card className="shadow-sm border-border/50">
 <CardHeader className="pb-4 border-b border-border/50">
 <CardTitle className="text-lg flex items-center gap-2"><Activity className="w-5 h-5"/> Εμπλοκή σε Μυστήρια</CardTitle>
 </CardHeader>
 <CardContent className="pt-6">
 {p.ceremonyPersons.length === 0 ? (
 <div className="text-center py-8 text-muted-foreground">Δεν υπάρχει καταγεγραμμένη συμμετοχή σε μυστήρια.</div>
) : (
 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
 {p.ceremonyPersons.map((cp: any) => (
 <div key={cp.id} className="border-l-4 border-l-primary bg-muted/20 border border-border p-5 rounded-r-xl">
 <div className="flex justify-between items-center mb-3">
 <span className="font-bold text-foreground">
 {cp.role === 'groom' ? 'Γαμπρός' : cp.role === 'bride' ? 'Νύφη' : cp.role === 'koumbaros' ? 'Κουμπάρος' : cp.role === 'godfather' ? 'Ανάδοχος' : cp.role}
 </span>
 <Badge variant="outline"className="bg-background">
 {cp.token?.serviceType === 'GAMOS' ? 'Γάμος' : 'Βάπτιση'}
 </Badge>
 </div>
 <div className="text-sm text-muted-foreground mb-4">
 Ημ/νία: <span className="font-medium text-foreground">{cp.token?.ceremonyDate ? new Date(cp.token.ceremonyDate).toLocaleDateString('el-GR') : 'Άγνωστη'}</span>
 </div>
 <Link href={`/admin/requests/${cp.token?.id}`} className="text-primary text-sm font-semibold hover:underline block">
 Άνοιγμα Καρτέλας Մυστηρίου &rarr;
 </Link>
 </div>
))}
 </div>
)}
 </CardContent>
 </Card>
 </TabsContent>

 <TabsContent value="sissitio">
 {!beneficiary ? (
 <Card className="shadow-sm border-dashed border-2 py-12">
 <CardContent className="flex flex-col items-center justify-center text-center">
 <Utensils className="w-16 h-16 text-muted-foreground/30 mb-6"/>
 <h3 className="text-2xl font-bold mb-2">Δεν είναι εγγεγραμμένο μέλος Φιλοπτώχου</h3>
 <p className="text-muted-foreground max-w-md mx-auto mb-6">
 Ο ενορίτης αυτός δεν έχει ανοιχτή καρτέλα Συσσιτίου/Φιλοπτώχου.
 </p>
 <Button 
 onClick={async () => {
 setIsRegistering(true);
 const res = await createBeneficiary({ firstName: p.firstName, lastName: p.lastName, phone: p.phone, address: p.address, portions: 1, parishionerId: p.id }) as any;
 setIsRegistering(false);
 if (res && res.success) router.refresh();
 else alert("Σφάλμα εγγραφής:"+ (res?.error || 'Άγνωστο'));
 }}
 disabled={isRegistering}
 size="lg"
 >
 {isRegistering ? 'Εγγραφή...' : '+ Εγγραφή στο Συσσίτιο'}
 </Button>
 </CardContent>
 </Card>
) : (
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 <Card className="shadow-sm border-border/50">
 <CardHeader className="border-b border-border/50 pb-4">
 <CardTitle className="text-lg">Καρτέλα Ωφελούμενου</CardTitle>
 </CardHeader>
 <CardContent className="pt-6">
 <div className="grid grid-cols-3 gap-y-4 text-sm">
 <div className="text-muted-foreground font-medium">Κατάσταση:</div>
 <div className="col-span-2">
 <Badge className={beneficiary.status === 'active' ? 'bg-[var(--success-light)] text-emerald-800' : 'bg-red-100 text-red-800'} variant="outline">
 {beneficiary.status === 'active' ? 'Ενεργός' : 'Ανενεργός'}
 </Badge>
 </div>
 <div className="text-muted-foreground font-medium">Μερίδες Συσσιτίου:</div>
 <div className="col-span-2 font-bold text-lg">{beneficiary.portions}</div>
 <div className="text-muted-foreground font-medium">Ιατρικές Σημειώσεις:</div>
 <div className="col-span-2 text-foreground">{beneficiary.medicalNotes || '-'}</div>
 </div>
 </CardContent>
 </Card>
 <Card className="shadow-sm border-border/50">
 <CardHeader className="border-b border-border/50 pb-4">
 <CardTitle className="text-lg">Πρόσφατα Βοηθήματα</CardTitle>
 </CardHeader>
 <CardContent className="pt-6">
 {(!beneficiary.assistances || beneficiary.assistances.length === 0) ? (
 <p className="text-muted-foreground text-center py-4">Δεν έχουν δοθεί καταγεγραμμένα βοηθήματα.</p>
) : (
 <div className="space-y-4">
 {beneficiary.assistances.map((ast: any) => (
 <div key={ast.id} className="flex justify-between items-center pb-3 border-b border-border/50 last:border-0 last:pb-0">
 <div className="font-medium text-foreground">{ast.type} - {ast.description}</div>
 <div className="text-xs text-muted-foreground">{new Date(ast.dateGiven).toLocaleDateString('el-GR')}</div>
 </div>
))}
 </div>
)}
 </CardContent>
 </Card>
 </div>
)}
 </TabsContent>

 <TabsContent value="history">
 <Card className="shadow-sm border-border/50">
 <CardHeader className="pb-4 border-b border-border/50">
 <CardTitle className="text-lg flex items-center gap-2"><History className="w-5 h-5"/> Ιστορικό Μεταβολών Ενορίτη</CardTitle>
 <CardDescription>Καταγραφή αλλαγών στα στοιχεία της καρτέλας, βάσει της Αρχής Ιχνηλασιμότητας και του GDPR.</CardDescription>
 </CardHeader>
 <CardContent className="pt-6">
 {!auditLogs || auditLogs.length === 0 ? (
 <div className="text-center py-8 text-muted-foreground">Καμία καταγεγραμμένη μεταβολή στο ιστορικό.</div>
) : (
 <div className="space-y-6">
 {auditLogs.map((log: any) => (
 <div key={log.id} className="relative pl-6 sm:pl-8 border-l-2 border-primary/20 last:border-l-transparent pb-6 last:pb-0">
 <span className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-background bg-primary"/>
 <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between mb-1">
 <div className="font-bold text-foreground">
 <div>{log.action}</div>
 <div className="text-xs text-muted-foreground font-normal">από {log.userEmail || log.userId}</div>
 </div>
 <span className="text-xs font-mono text-muted-foreground mt-1 sm:mt-0">
 {new Date(log.createdAt).toLocaleString('el-GR')}
 </span>
 </div>
 <div className="mt-2 text-sm text-foreground bg-muted/30 p-3 rounded-lg border border-border/40 font-mono">
 {log.detail.split('|').map((change: string, idx: number) => (
 <div key={idx} className="mb-1 last:mb-0">{change.trim()}</div>
))}
 </div>
 </div>
))}
 </div>
)}
 </CardContent>
 </Card>
 </TabsContent>

 <TabsContent value="vault">
 <VaultPanel 
 templeId={p.templeId} 
 parishionerId={p.id} 
 initialDocuments={p.vaultDocs || []} 
 />
 </TabsContent>

 </Tabs>

 </div>
)
}
