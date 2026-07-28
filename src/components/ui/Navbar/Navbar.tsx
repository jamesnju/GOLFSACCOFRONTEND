'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '../Button';
import { cn } from '@/lib/utils/helpers';

interface NavbarProps {
  onMenuClick: () => void;
  className?: string;
}

export function Navbar({ onMenuClick, className }: NavbarProps) {
  const { data: session } = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b border-primary/20 px-4 py-3',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-primary/10 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-xl font-heading font-bold text-text">
            Welcome back, {session?.user?.firstName || 'User'}!
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-sm text-text/60">
            <span>📅</span>
            <span>{new Date().toLocaleDateString('en-KE', { 
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}