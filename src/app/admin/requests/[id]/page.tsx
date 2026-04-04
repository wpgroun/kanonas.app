import { getRequestDetails } from '@/actions/sacraments'
import { getParishioners } from '@/actions/parishioners'
import Link from 'next/link'
import AddPersonForm from './AddPersonForm'
import AdminMetaForm from './AdminMetaForm'
import GenerateAllDocsButton from './GenerateAllDocsButton'
import ApproveRejectButtons from './ApproveRejectButtons'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Clock, CalendarIcon, Users, UserX, Printer } from 'lucide-react'

export default async function RequestDetailsPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const token = await getRequestDetails(id);
  
  if (!token) {
    return <div className="p-8 text-center text-muted-foreground mt-12 bg-card rounded-xl border border-border">Το αίτημα δεν υπάρχει.</div>;
  }

  // Fetch all parishioners from CRM to populate the dropdown
  const allParishioners = await getParishioners();

  const isGamos = token.serviceType === 'GAMOS';

  return (
    <div className="container-fluid mt-6 space-y-6 max-w-5xl animate-in fade-in duration-500">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link href="/admin/requests" className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-1 mb-2 transition-colors">
            <ArrowLeft className="w-4 h-4"/> Πίσω στα Αιτήματα
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Διαχείριση Μυστηρίου
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Εισάγετε τα στοιχεία και τα πρόσωπα για την έκδοση των απαραίτητων εγγράφων.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ΑΡΙΣΤΕΡΗ ΣΤΗΛΗ */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* ΚΑΡΤΕΛΑ 1: ΓΕΝΙΚΑ ΣΤΟΙΧΕΙΑ ΜΥΣΤΗΡΙΟΥ */}
          <Card className="shadow-sm border-border/50">
            <CardHeader className="flex flex-row items-start md:items-center justify-between pb-4 border-b border-border/50">
              <div className="flex items-center gap-3">
                 <div className="text-3xl bg-secondary p-3 rounded-xl">{isGamos ? '💍' : '🕊️'}</div>
                 <div>
                   <CardTitle className="text-xl">{isGamos ? 'Γάμος' : 'Βάπτιση'}</CardTitle>
                   <CardDescription>Γενικά Στοιχεία</CardDescription>
                 </div>
              </div>
              <div className="flex items-center gap-3 mt-4 md:mt-0">
                <GenerateAllDocsButton tokenId={token.id} serviceType={token.serviceType} hasProtocol={!!token.protocolNumber} />
                <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200">
                  <Clock className="w-3 h-3 mr-1" /> Σε Εκκρεμότητα
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                 <div>
                   <div className="text-muted-foreground mb-1 flex items-center gap-1"><CalendarIcon className="w-4 h-4"/> Ημερομηνία & Ώρα:</div>
                   <div className="font-semibold text-base">{token.ceremonyDate ? new Date(token.ceremonyDate).toLocaleString('el-GR') : 'Άγνωστη'}</div>
                 </div>
                 <div>
                   <div className="text-muted-foreground mb-1 flex items-center gap-1"><Users className="w-4 h-4"/> Οικογένεια / Επικοινωνία:</div>
                   <div className="font-semibold text-base">{token.customerName}</div>
                   <div className="text-muted-foreground text-xs">{token.customerEmail}</div>
                 </div>
               </div>

               <ApproveRejectButtons 
                 tokenId={token.id} 
                 status={token.status} 
                 date={token.ceremonyDate} 
                 title={isGamos ? `Γάμος (${token.customerName})` : `Βάπτιση (${token.customerName})`} 
                 isAccepted={token.status === 'accepted'} 
               />
            </CardContent>
          </Card>

          {/* ΚΑΡΤΕΛΑ: ΑΠΑΝΤΗΣΕΙΣ ΕΡΩΤΗΜΑΤΟΛΟΓΙΟΥ (SMART FORM) */}
          {token.ceremonyMeta?.dataJson && (
            <Card className="shadow-sm border-border/50 border-l-4 border-l-purple-500">
              <CardHeader className="pb-3 border-b border-border/50 bg-muted/10">
                <CardTitle className="text-lg flex items-center gap-2 text-purple-600 dark:text-purple-400">
                  📋 Απαντήσεις Ερωτηματολογίου (Οικογένειας)
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex flex-col gap-3 text-sm">
                  {(() => {
                    const meta = JSON.parse(token.ceremonyMeta.dataJson);
                    return (
                      <>
                        {meta.groomStatus && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-1 md:gap-4 border-b border-border/50 pb-2">
                            <span className="text-muted-foreground">Κατάσταση Γαμπρού:</span>
                            <span className="font-semibold col-span-2">{meta.groomStatus === 'agamos' ? 'Άγαμος' : meta.groomStatus === 'diazevmenos' ? 'Διαζευγμένος' : meta.groomStatus === 'symfono' ? 'Σύμφωνο Συμβίωσης' : 'Χήρος'}</span>
                            {meta.groomDivorceRef && <><span className="text-muted-foreground">Διαζευκτήριο Γαμπ.:</span><span className="font-medium col-span-2">{meta.groomDivorceRef}</span></>}
                            {meta.groomSymfonoRef && <><span className="text-muted-foreground">Σύμφωνο Γαμπρού:</span><span className="font-medium col-span-2">{meta.groomSymfonoRef}</span></>}
                          </div>
                        )}
                        {meta.brideStatus && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-1 md:gap-4 border-b border-border/50 pb-2">
                            <span className="text-muted-foreground">Κατάσταση Νύφης:</span>
                            <span className="font-semibold col-span-2">{meta.brideStatus === 'agami' ? 'Άγαμη' : meta.brideStatus === 'diazevmeni' ? 'Διαζευγμένη' : meta.brideStatus === 'symfono' ? 'Σύμφωνο Συμβίωσης' : 'Χήρα'}</span>
                            {meta.brideDivorceRef && <><span className="text-muted-foreground">Διαζευκτήριο Νύφ.:</span><span className="font-medium col-span-2">{meta.brideDivorceRef}</span></>}
                            {meta.brideSymfonoRef && <><span className="text-muted-foreground">Σύμφωνο Νύφης:</span><span className="font-medium col-span-2">{meta.brideSymfonoRef}</span></>}
                          </div>
                        )}
                        {meta.childName && (
                           <div className="grid grid-cols-1 md:grid-cols-3 gap-1 md:gap-4 border-b border-border/50 pb-2">
                            <span className="text-muted-foreground">Όνομα Νεοφώτιστου:</span>
                            <span className="font-bold text-base col-span-2 text-primary">{meta.childName}</span>
                          </div>
                        )}
                        {meta.parentsMarriage && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-1 md:gap-4 border-b border-border/50 pb-2">
                            <span className="text-muted-foreground">Γάμος Γονέων:</span>
                            <span className="font-semibold col-span-2">
                              {meta.parentsMarriage === 'thriskeftikos' ? 'Θρησκευτικός' : meta.parentsMarriage === 'politikos' ? 'Πολιτικός' : 'Άγαμη/Μονογονεϊκή'}
                            </span>
                          </div>
                        )}
                        {meta.koumparosIsOrthodox && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-1 md:gap-4 pb-2">
                            <span className="text-muted-foreground">Ορθόδοξος Κουμπάρος:</span>
                            <span className={`font-semibold col-span-2 ${meta.koumparosIsOrthodox === 'yes' ? 'text-green-600' : 'text-red-600'}`}>
                              {meta.koumparosIsOrthodox === 'yes' ? 'Ναι' : 'ΟΧΙ (Προσοχή!)'}
                            </span>
                          </div>
                        )}
                        {meta.anadoxosIsOrthodox && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-1 md:gap-4 pb-2">
                            <span className="text-muted-foreground">Ορθόδοξος Ανάδοχος:</span>
                            <span className={`font-semibold col-span-2 ${meta.anadoxosIsOrthodox === 'yes' ? 'text-green-600' : 'text-red-600'}`}>
                              {meta.anadoxosIsOrthodox === 'yes' ? 'Ναι' : 'ΟΧΙ (Προσοχή!)'}
                            </span>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>
          )}

          {/* ΚΑΡΤΕΛΑ 1.5: ΕΣΩΤΕΡΙΚΑ ΣΤΟΙΧΕΙΑ ΝΑΟΥ ΚΑΙ ΕΚΤΥΠΩΣΗ */}
          <AdminMetaForm token={token} />

        </div>

        {/* ΔΕΞΙΑ ΣΤΗΛΗ */}
        <div className="lg:col-span-4">
          <Card className="shadow-sm border-border/50 sticky top-6">
            <CardHeader className="pb-4 border-b border-border/50">
              <CardTitle className="text-lg">Εμπλεκόμενα Πρόσωπα</CardTitle>
              <CardDescription className="text-xs">Συνδέστε ενορίτες (Γαμπρός, Ανάδοχος) για συμπλήρωση εγγράφων.</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 p-4 lg:p-6">
              
              {/* Λίστα με ήδη συνδεδεμένους */}
              {token.persons.length === 0 ? (
                <div className="bg-muted/50 rounded-lg p-6 text-center border border-dashed border-border/80">
                  <UserX className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Μητρώο κενό.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {token.persons.map((cp: any) => (
                    <div key={cp.id} className="flex justify-between items-center p-3 border border-border rounded-lg bg-card hover:bg-muted/30 transition-colors">
                      <div className="flex flex-col gap-1">
                        <Badge variant="secondary" className="w-fit text-[10px] uppercase font-bold text-primary bg-primary/10">
                          {cp.role === 'groom' ? 'ΓΑΜΠΡΟΣ' : 
                           cp.role === 'bride' ? 'ΝΥΦΗ' : 
                           cp.role === 'koumbaros' ? 'ΚΟΥΜΠΑΡΟΣ' : 
                           cp.role === 'godfather' ? 'ΑΝΑΔΟΧΟΣ' : 
                           cp.role === 'child' ? 'ΤΕΚΝΟ' : 
                           cp.role === 'parent' ? 'ΓΟΝΕΑΣ' : cp.role}
                        </Badge>
                        <div className="font-semibold text-sm">{cp.lastName} {cp.firstName}</div>
                        <div className="text-[11px] text-muted-foreground">ID: {cp.parishionerId?.slice(-6)}</div>
                      </div>
                      <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive hover:text-white" title="Διαγραφή">
                        <UserX className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Φόρμα Σύνδεσης νέου προσώπου */}
              <AddPersonForm tokenId={token.id} parishioners={allParishioners} />

            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}
