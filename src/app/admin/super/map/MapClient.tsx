'use client'
import dynamic from 'next/dynamic';
import { Card } from '@/components/ui/card';

const MapWithNoSSR = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center h-[600px] w-full bg-[var(--surface)] animate-pulse rounded-2xl border border-[var(--border)]">
       <div className="animate-spin w-8 h-8 border-4 border-[var(--brand)] border-t-transparent rounded-full mb-4" />
       <p className="text-[var(--text-muted)] font-bold uppercase tracking-widest text-xs">Φόρτωση Χάρτη...</p>
    </div>
  )
});

export default function MapClient({ temples }: { temples: any[] }) {
   return (
      <Card className="shadow-lg border border-[var(--border)] rounded-2xl overflow-hidden p-2 bg-[var(--surface)]">
        <MapWithNoSSR temples={temples} />
      </Card>
   );
}
