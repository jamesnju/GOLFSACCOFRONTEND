'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader } from '../ui/Loader/Loader';

export function SessionCheck({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    console.log('SessionCheck - Status:', status);
    console.log('SessionCheck - Session:', session);
    
    if (status === 'loading') return;
    
    if (!session?.user) {
      console.log('SessionCheck - No session, redirecting to login');
      router.push('/login');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader size="lg" text="Checking session..." />
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return <>{children}</>;
}