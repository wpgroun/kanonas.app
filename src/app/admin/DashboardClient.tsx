'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, FileText, Banknote, Cross, AlertCircle, ArrowUpRight } from 'lucide-react';

export default function DashboardClient({ stats }: { stats: any }) {
  // Use Tailwind standard chart colors
  const COLORS = ['#2563eb', '#16a34a', '#d97706', '#ca8a04', '#0891b2', '#4f46e5'];

  return (
    <div className="container-fluid mt-6 space-y-6">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Επισκόπηση Ενορίας (BI)
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Στατιστικά και KPIs του Ναού σε πραγματικό χρόνο.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm border-border/50">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">Νέα Αιτήματα</p>
                <h3 className={`text-3xl font-bold ${stats.pendingRequests > 0 ? 'text-red-600' : 'text-foreground'}`}>
                  {stats.pendingRequests}
                </h3>
              </div>
              <div className={`p-3 rounded-full ${stats.pendingRequests > 0 ? 'bg-red-100 text-red-600' : 'bg-muted text-muted-foreground'}`}>
                {stats.pendingRequests > 0 ? <AlertCircle className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
              </div>
            </div>
            <div className={`mt-4 text-xs font-medium flex items-center ${stats.pendingRequests > 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
              {stats.pendingRequests > 0 ? 'Απαιτούν προσοχή!' : 'Κανένα εκκρεμές αίτημα'}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/50">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">Εγγεγραμμένοι Ενορίτες</p>
                <h3 className="text-3xl font-bold text-foreground">
                  {stats.totalParishioners}
                </h3>
              </div>
              <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 text-xs font-medium text-green-600">
              Συνδεδεμένοι στο Μητρώο
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-border/50">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">Οικονομικά (Μήνας)</p>
                <h3 className="text-3xl font-bold text-foreground">
                  €{stats.totalMonthlyDonations}
                </h3>
              </div>
              <div className="p-3 bg-green-100 text-green-600 rounded-full">
                <Banknote className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 text-xs font-medium text-green-600 flex items-center">
              <ArrowUpRight className="w-4 h-4 mr-1" /> Δωρεές & Έσοδα
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-border/50">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">Μυστήρια Έτους</p>
                <h3 className="text-3xl font-bold text-foreground">
                  {stats.sacramentsData?.reduce((acc: number, curr: any) => acc + curr.value, 0) || 0}
                </h3>
              </div>
              <div className="p-3 bg-purple-100 text-purple-600 rounded-full">
                <Cross className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 text-xs font-medium text-muted-foreground flex items-center">
              Προγραμματισμένα & Ολοκληρωμένα
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
        
        {/* Revenue Trend */}
        <Card className="shadow-sm border-border/50">
          <CardHeader className="pb-2 border-b border-border/50">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              Τάση Εσόδων (6 Μήνες)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.revenueTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground)/0.2)" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    dx={-10}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Έσοδα" 
                    stroke="#2563eb" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: "#2563eb", strokeWidth: 2, stroke: "#fff" }} 
                    activeDot={{ r: 6 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Sacraments Distribution */}
        <Card className="shadow-sm border-border/50">
          <CardHeader className="pb-2 border-b border-border/50">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              Κατανομή Μυστηρίων
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="w-full h-[250px] flex items-center justify-center">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.sacramentsData}
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {stats.sacramentsData?.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-4 mt-6">
               {stats.sacramentsData?.map((entry: any, index: number) => (
                  <div key={entry.name} className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                     <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                     {entry.name} ({entry.value})
                  </div>
               ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
