'use client'

import { useState } from 'react'
import { linkPersonToSacrament } from '@/actions/sacraments'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, Link2, Plus } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

interface ParishionerBasic {
 id: string;
 firstName: string;
 lastName: string;
}

interface AddPersonFormProps {
 tokenId: string;
 parishioners: ParishionerBasic[];
}

export default function AddPersonForm({ tokenId, parishioners }: AddPersonFormProps) {
 const [selectedPId, setSelectedPId] = useState('');
 const [role, setRole] = useState('');
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState('');

 async function handleLink(e: React.FormEvent) {
 e.preventDefault();
 if (!selectedPId || !role) {
 setError('Επιλέξτε ένα άτομο και το ρόλο του!');
 return;
 }

 setLoading(true);
 setError('');

 const res = await linkPersonToSacrament(tokenId, selectedPId, role);
 if (!res.success) {
 setError(res.error || 'Σφάλμα!');
 } else {
 setSelectedPId('');
 setRole('');
 }
 
 setLoading(false);
 }

 return (
 <Card className="mt-6 border-dashed bg-muted/20">
 <CardContent className="pt-6">
 <form onSubmit={handleLink} className="flex flex-col md:flex-row gap-4 items-end">
 
 <div className="flex-1 w-full space-y-2">
 <Label>Επιλογή Ενορίτη *</Label>
 <div className="relative">
 <select 
 value={selectedPId} 
 onChange={(e) => setSelectedPId(e.target.value)} 
 required
 className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
 >
 <option value=""disabled>-- Αναζήτηση από Μητρώο --</option>
 {parishioners.map(p => (
 <option key={p.id} value={p.id}>{p.lastName} {p.firstName}</option>
))}
 </select>
 </div>
 </div>

 <div className="flex-1 w-full space-y-2">
 <Label>Ρόλος στo Μυστήριο *</Label>
 <Select value={role} onValueChange={setRole} required>
 <SelectTrigger>
 <SelectValue placeholder="-- Επιλογή Ρόλου --"/>
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="groom">Γαμπρός</SelectItem>
 <SelectItem value="bride">Νύφη</SelectItem>
 <SelectItem value="koumbaros">Κουμπάρος / Κουμπάρα</SelectItem>
 <SelectItem value="godfather">Ανάδοχος (Νονός/Νονά)</SelectItem>
 <SelectItem value="child">Τέκνο (Βαπτιζόμενος)</SelectItem>
 <SelectItem value="parent">Γονέας</SelectItem>
 </SelectContent>
 </Select>
 </div>

 <Button type="submit"disabled={loading} className="w-full md:w-auto shrink-0 mt-4 md:mt-0">
 {loading ? 'Σύνδεση...' : <><Link2 className="w-4 h-4 mr-2"/> Σύνδεση</>}
 </Button>
 </form>
 {error && (
 <div className="mt-4 flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
 <AlertCircle className="w-4 h-4"/> {error}
 </div>
)}
 </CardContent>
 </Card>
)
}
