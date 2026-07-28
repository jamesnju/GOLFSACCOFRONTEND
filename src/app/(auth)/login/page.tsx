'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn, useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import toast from 'react-hot-toast';
import { Loader } from '@/components/ui/Loader/Loader';
import { loginUser } from '@/lib/auth/auth.actions';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      console.log('Already authenticated, redirecting to dashboard');
      router.push('/dashboard');
    }
  }, [status, session, router]);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      // First, check if the user exists and their status using the API directly
      const loginResult = await loginUser({
        email: data.email,
        password: data.password,
      });

      // If the API returns a payment required error, redirect to payment
      if (!loginResult.success) {
        if (loginResult.requiresPayment || 
            loginResult.error?.toLowerCase().includes('registration fee') ||
            loginResult.error?.toLowerCase().includes('activate') ||
            loginResult.error?.toLowerCase().includes('not activated')) {
          console.log('Payment required, redirecting to payment page');
          router.push(`/payment?email=${encodeURIComponent(data.email)}`);
          toast.error('Please pay the registration fee to activate your account');
          setIsLoading(false);
          return;
        }
        
        // Other errors
        toast.error(loginResult.error || 'Login failed');
        setIsLoading(false);
        return;
      }

      // If login was successful, now sign in with NextAuth
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        console.error('NextAuth error:', result.error);
        
        // Check if the error indicates payment required
        if (result.error.toLowerCase().includes('registration fee') || 
            result.error.toLowerCase().includes('activate') ||
            result.error.toLowerCase().includes('not activated')) {
          router.push(`/payment?email=${encodeURIComponent(data.email)}`);
          toast.error('Please pay the registration fee to activate your account');
          return;
        }
        
        toast.error(result.error || 'Invalid email or password');
        return;
      }

      // Success - redirect to dashboard
      toast.success('Login successful!');
      
      // Force session update
      await update();
      
      // Redirect to dashboard
      router.push('/dashboard');
      router.refresh();
      
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Check if error message indicates payment required
      if (error?.message?.toLowerCase().includes('registration fee') || 
          error?.message?.toLowerCase().includes('activate') ||
          error?.message?.toLowerCase().includes('not activated')) {
        router.push(`/payment?email=${encodeURIComponent(data.email)}`);
        toast.error('Please pay the registration fee to activate your account');
        return;
      }
      
      toast.error(error?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader size="lg" text="Loading..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-background">
      <Card className="w-full max-w-md p-8 border-primary/20">
        <div className="text-center mb-8">
          <span className="text-5xl block mb-4">⛳</span>
          <h1 className="text-3xl font-bold text-primary">Welcome Back</h1>
          <p className="text-text/60 mt-2">Sign in to your Golf SACCO account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="Email Address"
            type="email"
            placeholder="john.doe@example.com"
            {...register('email')}
            error={errors.email?.message}
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            {...register('password')}
            error={errors.password?.message}
          />

          <Button
            type="submit"
            isLoading={isLoading}
            fullWidth
            size="lg"
          >
            Sign In
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-text/60 text-sm">
            Don't have an account?{' '}
            <Link href="/register" className="text-primary hover:text-primary/80 transition-colors">
              Register now
            </Link>
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-primary/10">
          <p className="text-text/40 text-xs text-center">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </Card>
    </div>
  );
}