'use client'
import { useState } from 'react'
import { addAsset, deleteAsset, updateAssetStatus } from '@/actions/assets'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Landmark, Camera, MapPin, Trash2, Box, Home, Shield, BoxSelect } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AssetsClient({ initialAssets }: { initialAssets: any[] }) {
  const [activeTab, setActiveTab] = useState('ALL');
  
  // Basic display filter
  const displayedAssets = activeTab === 'ALL' 
    ? initialAssets 
    : initialAssets.filter(a => a.category === activeTab);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState('RELIC');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [estimatedValue, setEstimatedValue] = useState('');
  const [acquisitionDate, setAcquisitionDate] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!name || (!category)) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('name', name);
    formData.append('category', category);
    formData.append('description', description);
    formData.append('location', location);
    formData.append('estimatedValue', estimatedValue);
    formData.append('acquisitionDate', acquisitionDate);
    if (image) {
      formData.append('image', image);
    }

    const res = await addAsset(formData);
    if (res.success) {
      setName('');
      setDescription('');
      setLocation('');
      setEstimatedValue('');
      setAcquisitionDate('');
      setImage(null);
      // Reset file input by id
      const fileInput = document.getElementById('assetImage') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } else {
      alert("Συνέβη ένα σφάλμα κατά την αποθήκευση.");
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Διαγραφή περιουσιακού στοιχείου;')) return;
    await deleteAsset(id);
  };

  const handleStatus = async (id: string, current: string) => {
    const nextStatus = current === 'ACTIVE' ? 'MAINTENANCE' : (current === 'MAINTENANCE' ? 'INACTIVE' : 'ACTIVE');
    await updateAssetStatus(id, nextStatus);
  };

  return (
    <div className="container-fluid mt-6 space-y-6">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Περιουσιολόγιο & Κειμηλιαρχείο
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Καταγραφή Ακινήτων, Ιερών Κειμηλίων και Σκευών του Ναού.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
        
        {/* Form Container */}
        <div className="col-span-1">
          <Card className="shadow-sm border-border/50 sticky top-6">
            <CardHeader>
              <CardTitle>Νέα Εγγραφή</CardTitle>
              <CardDescription>Εισαγωγή στοιχείου στο μητρώο</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                
                <div className="space-y-2">
                  <Label>Κατηγορία *</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="REAL_ESTATE"><span className="flex items-center gap-2"><Home className="w-4 h-4"/> Ακίνητο / Οικόπεδο</span></SelectItem>
                      <SelectItem value="RELIC"><span className="flex items-center gap-2"><Shield className="w-4 h-4"/> Ιερό Κειμήλιο</span></SelectItem>
                      <SelectItem value="VESSEL"><span className="flex items-center gap-2"><BoxSelect className="w-4 h-4"/> Ιερό Σκεύος</span></SelectItem>
                      <SelectItem value="OTHER"><span className="flex items-center gap-2"><Box className="w-4 h-4"/> Άλλο</span></SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Ονομασία *</Label>
                  <Input required value={name} onChange={e => setName(e.target.value)} placeholder="π.χ. Αγροτεμάχιο στην Αγριλιά" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Ημ/νία Απόκτησης</Label>
                    <Input type="date" value={acquisitionDate} onChange={e => setAcquisitionDate(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Αξία (€)</Label>
                    <Input type="number" step="0.01" value={estimatedValue} onChange={e => setEstimatedValue(e.target.value)} placeholder="0.00" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Τοποθεσία / Φύλαξη</Label>
                  <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="π.χ. Ιερό Βήμα" />
                </div>

                <div className="space-y-2">
                  <Label>Λεπτομέρειες / Σημειώσεις</Label>
                  <Textarea value={description} onChange={e => setDescription(e.target.value)} className="resize-y" />
                </div>

                <div className="border-2 border-dashed border-border/60 p-4 rounded-lg text-center bg-muted/20">
                  <Label className="flex items-center justify-center gap-2 mb-2 text-foreground font-medium cursor-pointer" htmlFor="assetImage">
                    <Camera className="w-4 h-4" /> Φωτογραφία / Έγγραφο
                  </Label>
                  <Input type="file" id="assetImage" accept="image/*" onChange={e => setImage(e.target.files?.[0] || null)} className="text-xs" />
                </div>

                <Button type="submit" disabled={loading} className="w-full mt-2">
                  {loading ? 'Αποθήκευση...' : 'Υποβολή στο Μητρώο'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Display Container */}
        <div className="col-span-1 lg:col-span-2">
          
          {/* Filters */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            <Button variant={activeTab === 'ALL' ? 'primary' : 'outline'} onClick={() => setActiveTab('ALL')} className="whitespace-nowrap">
              Όλα
            </Button>
            <Button variant={activeTab === 'REAL_ESTATE' ? 'primary' : 'outline'} onClick={() => setActiveTab('REAL_ESTATE')} className="whitespace-nowrap">
              <Home className="w-4 h-4 mr-2"/> Ακίνητα
            </Button>
            <Button variant={activeTab === 'RELIC' ? 'primary' : 'outline'} onClick={() => setActiveTab('RELIC')} className="whitespace-nowrap">
              <Shield className="w-4 h-4 mr-2"/> Κειμήλια
            </Button>
            <Button variant={activeTab === 'VESSEL' ? 'primary' : 'outline'} onClick={() => setActiveTab('VESSEL')} className="whitespace-nowrap">
              <BoxSelect className="w-4 h-4 mr-2"/> Σκεύη
            </Button>
          </div>

          {displayedAssets.length === 0 ? (
            <Card className="shadow-sm border-dashed border-2">
               <CardContent className="py-20 text-center flex flex-col items-center justify-center text-muted-foreground">
                 <Box className="w-12 h-12 mb-4 opacity-50" />
                 <p>Δεν βρέθηκαν καταχωρήσεις.</p>
               </CardContent>
            </Card>
          ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayedAssets.map(asset => (
                   <Card key={asset.id} className="shadow-sm border-border/50 overflow-hidden flex flex-col">
                     
                     {/* Image Header */}
                     <div className="h-48 bg-muted relative border-b border-border">
                        {asset.imageUrl ? (
                           // eslint-disable-next-line @next/next/no-img-element
                           <img src={asset.imageUrl} alt={asset.name} className="w-full h-full object-cover" />
                        ) : (
                           <div className="flex items-center justify-center h-full text-muted-foreground">
                             <Camera className="w-12 h-12 opacity-20" />
                           </div>
                        )}
                        <div className="absolute top-2 right-2 bg-background/90 backdrop-blur text-foreground px-2 py-1 rounded text-xs font-semibold shadow-sm">
                          {asset.category === 'REAL_ESTATE' ? 'ΑΚΙΝΗΤΟ' : asset.category === 'RELIC' ? 'ΚΕΙΜΗΛΙΟ' : 'ΣΚΕΥΟΣ'}
                        </div>
                     </div>

                     {/* Content */}
                     <CardContent className="p-4 flex-1">
                        <h3 className="text-lg font-semibold text-foreground mb-2">{asset.name}</h3>
                        
                        {asset.location && (
                          <div className="text-sm text-muted-foreground flex items-center gap-1.5 mb-2">
                            <MapPin className="w-3.5 h-3.5" /> {asset.location}
                          </div>
                        )}
                        
                        {asset.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                            {asset.description}
                          </p>
                        )}

                        {(asset.acquisitionDate || asset.estimatedValue) && (
                          <div className="mt-4 p-3 bg-muted/40 rounded-lg text-sm grid grid-cols-2 gap-2">
                            {asset.acquisitionDate && (
                              <div><span className="opacity-70 text-xs block">Κτήση</span> <strong>{new Date(asset.acquisitionDate).toLocaleDateString('el-GR')}</strong></div>
                            )}
                            {asset.estimatedValue && (
                              <div><span className="opacity-70 text-xs block">Αξία</span> <strong>{asset.estimatedValue.toLocaleString('el-GR')} €</strong></div>
                            )}
                          </div>
                        )}
                     </CardContent>

                     {/* Footer / Actions */}
                     <div className="p-3 bg-muted/20 border-t border-border flex justify-between items-center">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleStatus(asset.id, asset.status)}
                          className={`font-semibold h-8 ${asset.status === 'ACTIVE' ? 'text-green-600 hover:text-green-700 hover:bg-green-100/50' : asset.status === 'MAINTENANCE' ? 'text-amber-600 hover:text-amber-700 hover:bg-amber-100/50' : 'text-red-500 hover:text-red-600 hover:bg-red-100/50'}`}
                        >
                          <span className={`w-2 h-2 rounded-full mr-2 ${asset.status === 'ACTIVE' ? 'bg-green-600' : asset.status === 'MAINTENANCE' ? 'bg-amber-600' : 'bg-red-500'}`}></span>
                          {asset.status === 'ACTIVE' ? 'ΕΝΕΡΓΟ' : asset.status === 'MAINTENANCE' ? 'ΣΥΝΤΗΡΗΣΗ' : 'ΑΝΕΝΕΡΓΟ'}
                        </Button>

                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(asset.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                     </div>

                   </Card>
                ))}
             </div>
          )}
        </div>

      </div>
    </div>
  )
}

