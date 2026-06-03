'use client'

import { useState } from 'react'
import { linkPersonToSacrament } from '@/actions/sacraments'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, Link2 } from 'lucide-react'
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

const selectClass = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

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
        <form onSubmit={handleLink} className="flex flex-col gap-4">

          <div className="w-full space-y-2">
            <Label>Επιλογή Ενορίτη *</Label>
            <select
              value={selectedPId}
              onChange={(e) => setSelectedPId(e.target.value)}
              required
              className={selectClass}
            >
              <option value="" disabled>-- Αναζήτηση από Μητρώο --</option>
              {parishioners.map(p => (
                <option key={p.id} value={p.id}>{p.lastName} {p.firstName}</option>
              ))}
            </select>
          </div>

          <div className="w-full space-y-2">
            <Label>Ρόλος στο Μυστήριο *</Label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              className={selectClass}
            >
              <option value="" disabled>-- Επιλογή Ρόλου --</option>
              <option value="groom">Γαμπρός</option>
              <option value="bride">Νύφη</option>
              <option value="koumbaros">Κουμπάρος / Κουμπάρα</option>
              <option value="godfather">Ανάδοχος (Νονός/Νονά)</option>
              <option value="child">Τέκνο (Βαπτιζόμενος)</option>
              <option value="parent">Γονέας</option>
            </select>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
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

