'use client'
import { useState } from 'react'
import { addProtocolEntry } from '@/actions/protocol'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Stamp, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';

export default function ProtocolClient({ initialProtocols }: { initialProtocols: any[] }) {
  const [direction, setDirection] = useState('IN');
  const [subject, setSubject] = useState('');
  const [sender, setSender] = useState('');
  const [receiver, setReceiver] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProtocols = initialProtocols.filter(p => {
    const q = searchTerm.toLowerCase();
    const isMatch = (p.subject || '').toLowerCase().includes(q) ||
                    (p.sender || '').toLowerCase().includes(q) ||
                    (p.receiver || '').toLowerCase().includes(q) ||
                    p.number.toString().includes(q) ||
                    p.year.toString().includes(q);
    return isMatch;
  });

  const handleAdd = async (e: any) => {
    e.preventDefault();
    if (!subject) return;
    setLoading(true);
    await addProtocolEntry({ direction, subject, sender, receiver });
    setSubject('');
    setSender('');
    setReceiver('');
    setLoading(false);
  };

  return (
    <div className="container-fluid mt-6 space-y-6">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Κεντρικό Πρωτόκολλο
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Καταχώρηση προστιθέμενων και εξερχόμενων εγγράφων.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Form Container */}
        <div className="col-span-1">
          <Card className="shadow-sm border-border/50 sticky top-6">
            <CardHeader>
              <CardTitle>Νέα Πράξη Πρωτοκόλλου</CardTitle>
              <CardDescription>Καταχωρήστε τη διακίνηση του εγγράφου</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAdd} className="space-y-5">
                
                <div className="space-y-2">
                  <Label>Κατεύθυνση (Είδος)</Label>
                  <select 
                    value={direction} 
                    onChange={e => setDirection(e.target.value)} 
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="IN">📥 Εισερχόμενο</option>
                    <option value="OUT">📤 Εξερχόμενο</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Σύντομο Θέμα / Περιγραφή *</Label>
                  <Input required value={subject} onChange={e => setSubject(e.target.value)} placeholder="π.χ. Αίτηση ενορίτη, Άδεια γάμου" />
                </div>

                <div className="space-y-2">
                  <Label>Αποστολέας</Label>
                  <Input value={sender} onChange={e => setSender(e.target.value)} placeholder="Από ποιον ήρθε;" />
                </div>

                <div className="space-y-2">
                  <Label>Παραλήπτης</Label>
                  <Input value={receiver} onChange={e => setReceiver(e.target.value)} placeholder="Προς τα πού στάλθηκε;" />
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  <Stamp className="w-4 h-4 mr-2" />
                  {loading ? 'Καταχώρηση...' : 'Καταχώρηση'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* DataGrid Container */}
        <div className="col-span-1 lg:col-span-2 flex flex-col gap-4">
          <div className="flex w-full max-w-sm items-center space-x-2">
            <Input 
              type="text" 
              placeholder="Αναζήτηση Πρωτοκόλλου (Αρ., Θέμα, Ονόματα)..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-white"
            />
          </div>

          <Card className="shadow-sm border-border/50">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-secondary/50 border-b border-border">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Αρ. Πρωτοκόλλου</th>
                    <th className="px-6 py-4 font-semibold">Είδος</th>
                    <th className="px-6 py-4 font-semibold">Θέμα</th>
                    <th className="px-6 py-4 font-semibold">Συναλλασσόμενος</th>
                    <th className="px-6 py-4 font-semibold">Ημερομηνία</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredProtocols.map(p => (
                    <tr key={p.id} className="bg-card hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-foreground">
                        {p.number} / {p.year}
                      </td>
                      <td className="px-6 py-4">
                        {p.direction === 'IN' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            <ArrowDownToLine className="w-3 h-3" /> Εισερχόμενο
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                            <ArrowUpFromLine className="w-3 h-3" /> Εξερχόμενο
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-medium text-foreground">{p.subject}</td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {p.direction === 'IN' ? `Από: ${p.sender || '-'}` : `Προς: ${p.receiver || '-'}`}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                        {new Date(p.date).toLocaleDateString('el-GR')}
                      </td>
                    </tr>
                  ))}
                  {filteredProtocols.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                        <Stamp className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                        Δεν βρέθηκαν αποτελέσματα.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

      </div>
    </div>
  )
}

