'use client';

import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'react-hot-toast';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 5000,
          style: {
            background: '#040113',
            color: '#ddd4fc',
            border: '1px solid #a27ef7',
          },
        }}
      />
    </SessionProvider>
  );
}