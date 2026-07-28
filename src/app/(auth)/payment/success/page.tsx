'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function PaymentSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Auto redirect after 5 seconds
    const timer = setTimeout(() => {
      router.push('/login');
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-background">
      <Card className="w-full max-w-md p-8 border-primary/20 text-center">
        <div className="text-6xl mb-6">✅</div>
        <h1 className="text-3xl font-bold text-primary mb-2">Payment Successful!</h1>
        <p className="text-text/60 mb-6">
          Your registration fee has been received. Your account is now activated.
        </p>
        
        <div className="space-y-4">
          <p className="text-sm text-text/40">
            You will be redirected to login in a few seconds...
          </p>
          <Link href="/login">
            <Button fullWidth>Go to Login</Button>
          </Link>
        </div>

        <div className="mt-6 pt-6 border-t border-primary/10">
          <p className="text-xs text-text/40">
            If you have any issues, please contact support
          </p>
          <Link href="/contact" className="text-sm text-primary hover:text-primary/80 transition-colors">
            Contact Support
          </Link>
        </div>
      </Card>
    </div>
  );
}