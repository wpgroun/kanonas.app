'use client'

import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Calculator } from 'lucide-react';

export default function BudgetClient({ templeId, year, initialBudgets }: { templeId: string, year: number, initialBudgets: any[] }) {
  
  // Aggregate calculations
  const totalEstimated = initialBudgets.reduce((sum, b) => sum + b.estimatedAmt, 0);
  const totalActual = initialBudgets.reduce((sum, b) => sum + b.actualAmt, 0);
  const totalVariance = totalEstimated - totalActual;
  
  return (
    <div className="container-fluid mt-6 space-y-6">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Προϋπολογισμός & Απολογισμός ({year})
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Παρακολούθηση εκτιμώμενων vs πραγματικών εσόδων/εξόδων.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm font-semibold">Συνολικός Προϋπολογισμός (Εκτίμηση)</p>
            <p className="text-3xl font-bold">€{totalEstimated.toLocaleString('el-GR', { minimumFractionDigits: 2 })}</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm font-semibold">Πραγματοποιηθέντα (Απολογισμός)</p>
            <p className="text-3xl font-bold text-primary">€{totalActual.toLocaleString('el-GR', { minimumFractionDigits: 2 })}</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm font-semibold">Απόκλιση / Υπόλοιπο Προς Εκτέλεση</p>
            <p className={`text-3xl font-bold ${totalVariance < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
              {totalVariance > 0 ? '+' : ''}€{totalVariance.toLocaleString('el-GR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/40 pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            Γραμμές Προϋπολογισμού
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted text-muted-foreground uppercase text-xs">
                <tr>
                  <th className="px-6 py-3 font-semibold">Κατηγορία / Κωδικός ΚΑΕ</th>
                  <th className="px-6 py-3 font-semibold text-right">Προϋπολογισθέν (Εκτίμηση)</th>
                  <th className="px-6 py-3 font-semibold text-right">Απολογισμός (Πραγματικό)</th>
                  <th className="px-6 py-3 font-semibold text-center">Ποσοστό Εκτέλεσης</th>
                  <th className="px-6 py-3 font-semibold text-right">Απόκλιση</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {initialBudgets.map(b => {
                  const pct = b.estimatedAmt > 0 ? Math.min((b.actualAmt / b.estimatedAmt) * 100, 100) : 0;
                  const variance = b.estimatedAmt - b.actualAmt;
                  return (
                    <tr key={b.id} className="hover:bg-muted/50">
                      <td className="px-6 py-4 font-medium">{b.category}</td>
                      <td className="px-6 py-4 text-right">€{b.estimatedAmt.toLocaleString('el-GR', { minimumFractionDigits: 2 })}</td>
                      <td className="px-6 py-4 text-right font-bold text-primary">€{b.actualAmt.toLocaleString('el-GR', { minimumFractionDigits: 2 })}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 justify-center">
                          <Progress value={pct} className="w-[60%]" />
                          <span className="text-xs text-muted-foreground">{pct.toFixed(1)}%</span>
                        </div>
                      </td>
                      <td className={`px-6 py-4 text-right font-bold ${variance < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                        {variance > 0 ? '+' : ''}€{variance.toLocaleString('el-GR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  )
                })}
                {initialBudgets.length === 0 && (
                   <tr>
                     <td colSpan={5} className="text-center py-10 text-muted-foreground">Δεν υπάρχουν εγγραφές προϋπολογισμού για φέτος.</td>
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

