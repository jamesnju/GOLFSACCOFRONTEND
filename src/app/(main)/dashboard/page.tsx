'use client';

import { Loader } from '@/components/ui/Loader/Loader';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardRedirectPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    console.log('Dashboard redirect - status:', status);
    console.log('Dashboard redirect - session:', session);

    if (status === 'loading') return;

    if (!session?.user) {
      console.log('No session, redirecting to login');
      router.replace('/login');
      return;
    }

    // Get role from session
    const userRole = session.user.role;
    console.log('Dashboard redirect - User role from session:', userRole);

    // Redirect based on role
    let redirectPath = '/player/dashboard';

    if (userRole === 'ADMIN') {
      redirectPath = '/admin/dashboard';
    } else if (userRole === 'PLAYER') {
      redirectPath = '/player/dashboard';
    } else if (userRole === 'PRO') {
      redirectPath = '/pro/dashboard';
    } else if (userRole === 'CADDY') {
      redirectPath = '/caddy/dashboard';
    }

    console.log(`Dashboard redirect: Redirecting to ${redirectPath}`);
    router.replace(redirectPath);
  }, [session, status, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader size="lg" text="Redirecting to your dashboard..." />
    </div>
  );
}