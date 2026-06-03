'use client';

import * as React from 'react';
import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: 'group toast bg-white text-zinc-900 border border-zinc-200 shadow-lg',
          description: 'text-zinc-500',
          actionButton: 'bg-zinc-900 text-white',
          cancelButton: 'bg-zinc-100 text-zinc-500',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
