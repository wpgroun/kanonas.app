'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Building, FileText, ArrowRight, ArrowLeft } from 'lucide-react';

export default function OnboardingWizard() {
  const [step, setStep] = useState(1);
  const router = useRouter();
  
  // Form State
  const [formData, setFormData] = useState({
    templeName: '',
    metropolisName: '',
    phone: '',
    protocolStart: '1',
  });

  const [saving, setSaving] = useState(false);

  const handleNext = () => setStep(s => s + 1);
  const handlePrev = () => setStep(s => s - 1);

  const handleComplete = async () => {
    setSaving(true);
    try {
      // Typically this would go to an API route to setup the tenant and admin config
      // For demonstration in Phase 14, we simulate the API call that stores initial config
      await new Promise(res => setTimeout(res, 1500)); 
      toast.success('Το Deltos ρυθμίστηκε επιτυχώς!');
      router.push('/admin');
    } catch (err) {
      toast.error('Πρόβλημα κατά την αποθήκευση.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Καλωσορίσατε στο Church<span className="text-primary">OS</span></h1>
        <p className="text-muted-foreground mt-2">Ας ρυθμίσουμε τον Ναό σας σε 3 απλά βήματα.</p>
      </div>

      <div className="w-full max-w-2xl">
        {/* Stepper Headers */}
        <div className="flex justify-between items-center mb-8 relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-border/50 -z-10 rounded-full"></div>
          <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary -z-10 transition-all duration-300 rounded-full`} style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}></div>
          
          {[
            { num: 1, label: 'Στοιχεία Ναού', icon: Building },
            { num: 2, label: 'Πρωτόκολλο', icon: FileText },
            { num: 3, label: 'Ολοκλήρωση', icon: CheckCircle2 }
          ].map(s => (
            <div key={s.num} className="flex flex-col items-center gap-2 bg-background px-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${step >= s.num ? 'bg-primary border-primary text-primary-foreground' : 'bg-background border-border text-muted-foreground'}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <span className={`text-xs font-semibold uppercase tracking-wider ${step >= s.num ? 'text-primary' : 'text-muted-foreground'}`}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Wizard Content */}
        <Card className="shadow-lg border-border/50">
          <CardHeader>
            <CardTitle>{step === 1 ? 'Βασικά Στοιχεία' : step === 2 ? 'Ρυθμίσεις Εγγράφων' : 'Είστε Έτοιμοι!'}</CardTitle>
            <CardDescription>
              {step === 1 ? 'Εισάγετε την επίσημη ονομασία και τα στοιχεία επικοινωνίας.' : step === 2 ? 'Ρυθμίστε την αρίθμηση για τα πιστοποιητικά και το πρωτόκολλο.' : 'Το σύστημα είναι έτοιμο προς χρήση.'}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500 delay-150 fill-mode-both">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Ιερά Μητρόπολη</Label>
                    <Input placeholder="π.χ. Ιερά Μητρόπολις Αθηνών" value={formData.metropolisName} onChange={e => setFormData({...formData, metropolisName: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Ιερός Ναός</Label>
                    <Input placeholder="π.χ. Ι.Ν. Αγίου Γεωργίου" value={formData.templeName} onChange={e => setFormData({...formData, templeName: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Τηλέφωνο Γραμματείας</Label>
                  <Input placeholder="210..." value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500 fill-mode-both">
                <div className="space-y-2">
                  <Label>Τρέχων Αριθμός Πρωτοκόλλου</Label>
                  <Input type="number" placeholder="π.χ. 1" value={formData.protocolStart} onChange={e => setFormData({...formData, protocolStart: e.target.value})} />
                  <p className="text-xs text-muted-foreground mt-1">Από αυτόν τον αριθμό θα ξεκινήσει η αρίθμηση των επόμενων εγγράφων.</p>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="py-8 text-center space-y-4 animate-in zoom-in-95 duration-500 fill-mode-both">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 mb-4">
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-xl font-medium text-foreground">Όλα έτοιμα!</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  Το ψηφιακό σας γραφείο είναι έτοιμο. Μπορείτε πλέον να οργανώσετε τα Μυστήρια και να εκδίδετε πιστοποιητικά αυτόματα.
                </p>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between border-t border-border/50 pt-6">
            <Button variant="outline" onClick={handlePrev} disabled={step === 1 || step === 3}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Πίσω
            </Button>
            
            {step < 3 ? (
              <Button onClick={handleNext} disabled={(step === 1 && (!formData.templeName || !formData.metropolisName))}>
                Επόμενο <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleComplete} disabled={saving} className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[150px]">
                {saving ? 'Αποθήκευση...' : 'Μετάβαση στο Dashboard'}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
      
    </div>
  );
}

