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
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Κανόνας',
  },
  formatDetection: { telephone: false },
  themeColor: '#7C3AED',
};

import LanguageSwitcher from '@/components/LanguageSwitcher';
import { cookies } from 'next/headers';

import { getDictionary } from '@/i18n/getDictionary';
import { TranslationProvider } from '@/i18n/TranslationProvider';

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const locale = (cookieStore.get('Kanonas_locale')?.value as 'el' | 'en') || 'el';
  const dict = await getDictionary();

  return (
    <html lang={locale} className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        {/* PWA */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Κανόνας" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="h-full antialiased relative">
        <Suspense>
          <TranslationProvider dict={dict}>
            {children}
          </TranslationProvider>
        </Suspense>
        
        {/* Global Language Switcher */}
        <div className="fixed bottom-6 right-6 z-[9999] bg-white dark:bg-black rounded-lg shadow-lg border border-[var(--border)]">
           <LanguageSwitcher currentLocale={locale} />
        </div>

        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: 'var(--font-sans)',
              fontSize: '0.875rem',
            },
          }}
        />
        {/* Register service worker */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(console.error);
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
