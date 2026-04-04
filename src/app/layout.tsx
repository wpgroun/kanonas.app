import { ReactNode, Suspense } from 'react';
import { Metadata } from 'next';
import { Toaster } from 'sonner';

import './globals.css';

export const metadata: Metadata = {
  title: {
    template: '%s — Κανόνας',
    default: 'Κανόνας — Ψηφιακή Διαχείριση Ιερών Ναών',
  },
  description:
    'Η σύγχρονη cloud πλατφόρμα για τη διαχείριση Ιερών Ναών. Μητρώο, πιστοποιητικά, οικονομικά, πρωτόκολλο — όλα σε ένα.',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="el" className="h-full">
      <body className="h-full antialiased">
        <Suspense>{children}</Suspense>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: 'var(--font-sans)',
              fontSize: '0.875rem',
            },
          }}
        />
      </body>
    </html>
  );
}
