'use client'

import React, { useState, useTransition } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, ArrowDownRight, Printer, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { el } from 'date-fns/locale';
import { addExpense } from '../actions';
import { Button } from '@/components/ui/button';

export default function LedgerClient({ templeId, initialDonations, initialExpenses }: { templeId: string, initialDonations: any[], initialExpenses: any[] }) {
  const [filter, setFilter] = useState('ALL');
  const [isPending, startTransition] = useTransition();
  const [showAdd, setShowAdd] = useState(false);
  const [newExp, setNewExp] = useState({ purpose: '', amount: 0, date: new Date().toISOString().split('T')[0], category: 'Λειτουργικά', vendor: '', receiptNumber: '' });

  const handleAddExpense = () => {
    startTransition(async () => {
      await addExpense(newExp);
      setShowAdd(false);
    });
  };

  // Parse arrays into Unified Transactions
  const unifiedTransactions = [
    ...initialDonations.map(d => ({
      ...d,
      type: 'INCOME',
      title: d.purpose || 'Δωρεά',
      entity: d.donorName || 'Ανώνυμος',
    })),
    ...initialExpenses.map(e => ({
      ...e,
      type: 'EXPENSE',
      title: e.purpose || 'Έξοδο',
      entity: e.vendor || 'Μη ορισκευμένο',
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filtered = unifiedTransactions.filter(t => filter === 'ALL' || t.type === filter);
  
  const totalIncome = initialDonations.reduce((sum, item) => sum + item.amount, 0);
  const totalExpense = initialExpenses.reduce((sum, item) => sum + item.amount, 0);
  const balance = totalIncome - totalExpense;

  return (
    <div className="container-fluid mt-6 space-y-6">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Βιβλίο Εσόδων - Εξόδων (Καθολικό Ταμείου)
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Πλήρες λογιστικό βιβλίο σύμφωνα με την Εκκλησιαστική Νομοθεσία.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-700 rounded-md text-sm font-semibold text-white hover:bg-slate-800">
           <Printer className="w-4 h-4" /> Εκτύπωση Βιβλίου
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-emerald-500 shadow-sm">
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm font-semibold">Σύνολο Εσόδων</p>
            <p className="text-3xl font-bold text-emerald-600">€{totalIncome.toLocaleString('el-GR', { minimumFractionDigits: 2 })}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500 shadow-sm">
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm font-semibold">Σύνολο Εξόδων</p>
            <p className="text-3xl font-bold text-red-600">€{totalExpense.toLocaleString('el-GR', { minimumFractionDigits: 2 })}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-primary shadow-sm bg-primary/5">
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm font-semibold">Τρέχον Υπόλοιπο (Ταμείο)</p>
            <p className="text-3xl font-bold text-primary">€{balance.toLocaleString('el-GR', { minimumFractionDigits: 2 })}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/40 pb-4">
          <CardTitle className="text-lg">Αναλυτικά Παραστατικά</CardTitle>
          <select 
            value={filter} 
            onChange={e => setFilter(e.target.value)}
            className="text-sm p-2 border rounded-md"
          >
            <option value="ALL">Όλα τα Παραστατικά</option>
            <option value="INCOME">Μόνο Έσοδα (Γραμμάτια Είσπραξης)</option>
            <option value="EXPENSE">Μόνο Έξοδα (Εντάλματα Πληρωμής)</option>
          </select>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted text-muted-foreground uppercase text-xs">
                <tr>
                  <th className="px-6 py-3 font-semibold">Ημερομηνία</th>
                  <th className="px-6 py-3 font-semibold">Είδος</th>
                  <th className="px-6 py-3 font-semibold">Αριθμός [Γ.Ε. / Ε.Π.]</th>
                  <th className="px-6 py-3 font-semibold">Αιτιολογία / Σκοπός</th>
                  <th className="px-6 py-3 font-semibold">Συναλλασσόμενος</th>
                  <th className="px-6 py-3 font-semibold text-right">Ποσό</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(t => (
                  <tr key={t.id} className="hover:bg-muted/50">
                    <td className="px-6 py-4">{format(new Date(t.date), 'dd/MM/yyyy', { locale: el })}</td>
                    <td className="px-6 py-4">
                      {t.type === 'INCOME' ? (
                        <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200">
                           <ArrowDownRight className="w-3 h-3 mr-1" /> Έσοδο 
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-red-700 bg-red-50 border-red-200">
                           <ArrowUpRight className="w-3 h-3 mr-1" /> Έξοδο
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{t.receiptNumber || '-'}</td>
                    <td className="px-6 py-4 font-medium">{t.title}</td>
                    <td className="px-6 py-4 text-muted-foreground">{t.entity}</td>
                    <td className={`px-6 py-4 text-right font-bold ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {t.type === 'INCOME' ? '+' : '-'}€{t.amount.toLocaleString('el-GR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                   <tr>
                     <td colSpan={6} className="text-center py-10 text-muted-foreground">Δεν υπάρχουν καταγεγραμμένες κινήσεις.</td>
                   </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
