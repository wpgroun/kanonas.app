'use client'

import { useState } from 'react'
import { savePublicTokenAnswers } from '../../actions'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CheckCircle2, UserCircle, Users, Quote } from 'lucide-react'

export default function FormClient({ token }: { token: any }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorStr, setErrorStr] = useState('');

  // Default initial values from parsed meta if any
  const existingMeta = token.ceremonyMeta?.dataJson ? JSON.parse(token.ceremonyMeta.dataJson) : {};

  // Gamos specific fields
  const [groomStatus, setGroomStatus] = useState(existingMeta.groomStatus || 'agamos');
  const [groomDivorceRef, setGroomDivorceRef] = useState(existingMeta.groomDivorceRef || '');
  const [brideStatus, setBrideStatus] = useState(existingMeta.brideStatus || 'agami');
  const [brideDivorceRef, setBrideDivorceRef] = useState(existingMeta.brideDivorceRef || '');
  const [koumparosIsOrthodox, setKoumparosIsOrthodox] = useState(existingMeta.koumparosIsOrthodox || '');

  // Vaptisi specific fields
  const [parentsMarriage, setParentsMarriage] = useState(existingMeta.parentsMarriage || '');
  const [anadoxosIsOrthodox, setAnadoxosIsOrthodox] = useState(existingMeta.anadoxosIsOrthodox || '');
  const [childName, setChildName] = useState(existingMeta.childName || '');

  const isGamos = token.serviceType === 'GAMOS';

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setErrorStr('');

    const payload = isGamos ? {
      groomStatus,
      groomDivorceRef: groomStatus === 'diazevmenos' ? groomDivorceRef : undefined,
      brideStatus,
      brideDivorceRef: brideStatus === 'diazevmeni' ? brideDivorceRef : undefined,
      koumparosIsOrthodox
    } : {
      parentsMarriage,
      anadoxosIsOrthodox,
      childName
    };

    const res = await savePublicTokenAnswers(token.tokenStr, JSON.stringify(payload));
    
    if (res.success) {
      setSuccess(true);
    } else {
      setErrorStr(res.error || 'Σφάλμα υποβολής. Παρακαλούμε δοκιμάστε ξανά.');
    }
    setLoading(false);
  }

  if (success) {
    return (
      <Card className="shadow-md border-border/50 text-center py-12 px-4 animate-in fade-in zoom-in-95">
        <div className="flex justify-center mb-6">
          <CheckCircle2 className="w-20 h-20 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Επιτυχής Υποβολή!</h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Τα στοιχεία σας καταχωρήθηκαν με επιτυχία στα μητρώα του Ιερού Ναού. Ο ιερέας θα επικοινωνήσει μαζί σας αν χρειαστούν περαιτέρω διευκρινίσεις.
        </p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Επιστροφή στη Φόρμα
        </Button>
      </Card>
    );
  }

  return (
    <Card className="shadow-md border-border/50 mb-12">
      <CardHeader className="border-b border-border/50 bg-muted/20 pb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-full text-primary">
             {isGamos ? <Users className="w-5 h-5"/> : <UserCircle className="w-5 h-5" />}
          </div>
          <CardTitle className="text-xl">Δήλωση Στοιχείων {isGamos ? 'Γάμου' : 'Βάπτισης'}</CardTitle>
        </div>
        <CardDescription className="text-sm">
          Παρακαλούμε ελέγξτε προσεκτικά τα στοιχεία πριν την οριστική υποβολή, καθώς αποτελούν επίσημα νομικά έγγραφα.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {errorStr && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg font-medium border border-red-200">
              {errorStr}
            </div>
          )}

          {isGamos ? (
            <>
              {/* GAMOS FIELDS */}
              <div className="space-y-6">
                <div className="bg-muted/30 p-5 rounded-xl border border-border">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><div className="w-2 h-2 bg-blue-500 rounded-full"></div> Στοιχεία Νυμφίου (Γαμπρού)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Οικογενειακή Κατάσταση</Label>
                      <Select value={groomStatus} onValueChange={setGroomStatus}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="agamos">Άγαμος</SelectItem>
                          <SelectItem value="diazevmenos">Διαζευγμένος</SelectItem>
                          <SelectItem value="xiros">Χήρος</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {groomStatus === 'diazevmenos' && (
                      <div className="space-y-2 animate-in fade-in">
                        <Label>Αριθμός Διαζευκτηρίου & Μητρόπολη</Label>
                        <Input value={groomDivorceRef} onChange={e => setGroomDivorceRef(e.target.value)} placeholder="π.χ. 123/2021 Ι.Μ. Πειραιώς" required />
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-muted/30 p-5 rounded-xl border border-border">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><div className="w-2 h-2 bg-pink-500 rounded-full"></div> Στοιχεία Νύμφης</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Οικογενειακή Κατάσταση</Label>
                      <Select value={brideStatus} onValueChange={setBrideStatus}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="agami">Άγαμη</SelectItem>
                          <SelectItem value="diazevmeni">Διαζευγμένη</SelectItem>
                          <SelectItem value="xira">Χήρα</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {brideStatus === 'diazevmeni' && (
                      <div className="space-y-2 animate-in fade-in">
                        <Label>Αριθμός Διαζευκτηρίου & Μητρόπολη</Label>
                        <Input value={brideDivorceRef} onChange={e => setBrideDivorceRef(e.target.value)} placeholder="π.χ. 456/2022 Ι.Μ. Αθηνών" required />
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-muted/30 p-5 rounded-xl border border-border">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><div className="w-2 h-2 bg-amber-500 rounded-full"></div> Στοιχεία Κουμπάρου / Παράνυμφου</h3>
                  <div className="space-y-2 max-w-md">
                    <Label>Είναι ο Κουμπάρος Ορθόδοξος Χριστιανός;</Label>
                    <Select value={koumparosIsOrthodox} onValueChange={setKoumparosIsOrthodox} required>
                      <SelectTrigger><SelectValue placeholder="Επιλέξτε..."/></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Ναι, έχει βαπτιστεί Ορθόδοξος</SelectItem>
                        <SelectItem value="no">Όχι (Απαιτείται ειδική άδεια)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">Σύμφωνα με τους κανόνες της Εκκλησίας, ο παράνυμφος πρέπει να είναι Ορθόδοξος Χριστιανός.</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* VAPTISI FIELDS */}
              <div className="space-y-6">
                <div className="bg-muted/30 p-5 rounded-xl border border-border">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><div className="w-2 h-2 bg-blue-500 rounded-full"></div> Στοιχεία Νεοφώτιστου</h3>
                  <div className="space-y-2 max-w-md">
                    <Label>Όνομα που θα δοθεί (Ονομαστική Πτώση)</Label>
                    <Input value={childName} onChange={e => setChildName(e.target.value)} placeholder="π.χ. Γεώργιος, Μαρία" required />
                    <p className="text-xs text-muted-foreground mt-1">Προσοχή στην ορθογραφία, το όνομα θα γραφτεί στα επίσημα χαρτιά.</p>
                  </div>
                </div>

                <div className="bg-muted/30 p-5 rounded-xl border border-border">
                   <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><div className="w-2 h-2 bg-purple-500 rounded-full"></div> Στοιχεία Γονέων</h3>
                   <div className="space-y-2 max-w-md">
                    <Label>Είδος Γάμου Γονέων</Label>
                    <Select value={parentsMarriage} onValueChange={setParentsMarriage} required>
                      <SelectTrigger><SelectValue placeholder="Επιλέξτε..."/></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="thriskeftikos">Θρησκευτικός Γάμος</SelectItem>
                        <SelectItem value="politikos">Πολιτικός Γάμος</SelectItem>
                        <SelectItem value="simfiosi">Σύμφωνο Συμβίωσης</SelectItem>
                        <SelectItem value="monogoneiki">Μονογονεϊκή Οικογένεια</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="bg-muted/30 p-5 rounded-xl border border-border">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><div className="w-2 h-2 bg-amber-500 rounded-full"></div> Στοιχεία Αναδόχου (Νονού)</h3>
                  <div className="space-y-2 max-w-md">
                    <Label>Είναι ο Ανάδοχος Ορθόδοξος Χριστιανός;</Label>
                    <Select value={anadoxosIsOrthodox} onValueChange={setAnadoxosIsOrthodox} required>
                      <SelectTrigger><SelectValue placeholder="Επιλέξτε..."/></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Ναι, έχει βαπτιστεί Ορθόδοξος</SelectItem>
                        <SelectItem value="no">Όχι (Αδύνατον κατά τους Κανόνες)</SelectItem>
                      </SelectContent>
                    </Select>
                    {anadoxosIsOrthodox === 'no' && (
                      <p className="text-sm text-red-600 mt-2 font-medium">ΑΠΑΓΟΡΕΥΕΤΑΙ: Ο Ανάδοχος είναι εγγυητής της πίστεως και υποχρεούται από τους Ιερούς Κανόνες να είναι Ορθόδοξος.</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="bg-primary/5 p-4 rounded-lg flex gap-3 text-sm border border-primary/20">
            <Quote className="w-5 h-5 text-primary shrink-0 opacity-50" />
            <p className="text-foreground/80">Δηλώνω υπεύθυνα ότι όλα τα παραπάνω στοιχεία είναι αληθή. Γνωρίζω ότι η ψευδής δήλωση μπορεί να επιφέρει ακύρωση της διαδικασίας της Ιεράς Μητροπόλεως.</p>
          </div>

          <div className="flex justify-end pt-4 border-t border-border">
            <Button type="submit" size="lg" disabled={loading} className="w-full md:w-auto min-w-[200px]">
              {loading ? 'Αποθήκευση...' : 'Υποβολή Στοιχείων'}
            </Button>
          </div>

        </form>
      </CardContent>
    </Card>
  )
}
