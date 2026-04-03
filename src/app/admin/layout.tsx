'use client';

import { Layout1 } from '@/components/layouts/layout-1';
import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  
  // Later we will integrate logoutAction inside the Metronic Topbar
  return (
    <Layout1>
      {children}
    </Layout1>
  );
}

