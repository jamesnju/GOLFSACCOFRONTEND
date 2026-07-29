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
import {
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const loginResult = await loginUser({
        email: data.email,
        password: data.password,
      });

      if (!loginResult.success) {
        if (loginResult.requiresPayment || 
            loginResult.error?.toLowerCase().includes('registration fee') ||
            loginResult.error?.toLowerCase().includes('activate') ||
            loginResult.error?.toLowerCase().includes('not activated')) {
          router.push(`/payment?email=${encodeURIComponent(data.email)}`);
          toast.error('Please pay the registration fee to activate your account');
          setIsLoading(false);
          return;
        }
        
        toast.error(loginResult.error || 'Login failed');
        setIsLoading(false);
        return;
      }

      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        console.error('NextAuth error:', result.error);
        
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

      toast.success('Login successful!');
      await update();
      router.push('/dashboard');
      router.refresh();
      
    } catch (error: any) {
      console.error('Login error:', error);
      
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

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader size="lg" text="Loading..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 bg-background">
      {/* Main Card */}
      <Card className="w-full max-w-5xl overflow-hidden border-primary/20 shadow-2xl shadow-primary/5">
        <div className="flex flex-col lg:flex-row min-h-[600px] lg:min-h-[650px]">
          
          {/* Left Side - Brand/Community Section */}
          <div className="relative lg:w-1/2 p-8 sm:p-10 lg:p-12 flex flex-col justify-center bg-gradient-to-br from-primary/10 via-primary/5 to-accent/5">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-primary/20 blur-2xl" />
            <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-accent/20 blur-2xl" />
            
            <div className="relative z-10">
              {/* Logo */}
              <div className="flex items-center gap-3 mb-8">
                <span className="text-4xl">⛳</span>
                <div>
                  <h1 className="text-xl font-heading font-bold text-primary">Golf SACCO</h1>
                  <p className="text-xs text-text/50">Savings & Credit</p>
                </div>
              </div>

              {/* Main Message */}
              <h2 className="text-3xl sm:text-4xl font-heading font-bold leading-tight mb-4">
                Your{' '}
                <span className="text-primary">Golf Community</span>
                {' '}Awaits
              </h2>
              <p className="text-base text-text/60 mb-8">
                Connect with players, caddies, and pros in one seamless platform.
              </p>

              {/* Features List */}
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-text">Find Your Perfect Match</h4>
                    <p className="text-sm text-text/40">Connect with experienced caddies and pros</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-text">Professional Growth</h4>
                    <p className="text-sm text-text/40">Advance your golf career with expert guidance</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-text">Secure & Trusted</h4>
                    <p className="text-sm text-text/40">Verified profiles and secure transactions</p>
                  </div>
                </div>
              </div>

              {/* Community Stats */}
              <div className="flex items-center gap-6 pt-6 border-t border-primary/10">
                <div>
                  <p className="text-2xl font-bold text-primary">1,000+</p>
                  <p className="text-xs text-text/40">Active Members</p>
                </div>
                <div className="w-px h-10 bg-primary/20" />
                <div>
                  <p className="text-2xl font-bold text-secondary">98%</p>
                  <p className="text-xs text-text/40">Satisfaction</p>
                </div>
                <div className="w-px h-10 bg-primary/20" />
                <div>
                  <p className="text-2xl font-bold text-accent">5★</p>
                  <p className="text-xs text-text/40">Rating</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="lg:w-1/2 p-8 sm:p-10 lg:p-12 flex flex-col justify-center bg-background/30">
            <div className="w-full max-w-sm mx-auto">
              {/* Welcome Header */}
              <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-heading font-bold text-text">
                  Welcome Back
                </h2>
                <p className="text-sm text-text/50 mt-1">
                  Sign in to continue your golf journey
                </p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-text/80">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text/30">
                      <EnvelopeIcon className="w-5 h-5" />
                    </div>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      className="pl-10 bg-background/50 border-primary/20 focus:border-primary/50 rounded-xl"
                      {...register('email')}
                      error={errors.email?.message}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-text/80">
                      Password
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-xs text-primary hover:text-primary/80 transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text/30">
                      <LockClosedIcon className="w-5 h-5" />
                    </div>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      className="pl-10 pr-12 bg-background/50 border-primary/20 focus:border-primary/50 rounded-xl"
                      {...register('password')}
                      error={errors.password?.message}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text/30 hover:text-text/60 transition-colors"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="w-5 h-5" />
                      ) : (
                        <EyeIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="remember"
                    className="w-4 h-4 rounded border-primary/20 bg-background/30 text-primary focus:ring-primary/50 focus:ring-2"
                  />
                  <label htmlFor="remember" className="text-sm text-text/60">
                    Remember me
                  </label>
                </div>

                <Button
                  type="submit"
                  isLoading={isLoading}
                  fullWidth
                  size="lg"
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-background font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-primary/40"
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                  {!isLoading && <ArrowRightIcon className="w-5 h-5 ml-2" />}
                </Button>
              </form>

              {/* Register Link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-text/40">
                  Don't have an account?{' '}
                  <Link
                    href="/register"
                    className="text-primary hover:text-primary/80 transition-colors font-medium group inline-flex items-center gap-1"
                  >
                    Create Account
                    <ArrowRightIcon className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import { signIn, useSession } from 'next-auth/react';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
// import { Button } from '@/components/ui/Button';
// import { Input } from '@/components/ui/Input';
// import { Card } from '@/components/ui/Card';
// import toast from 'react-hot-toast';
// import { Loader } from '@/components/ui/Loader/Loader';
// import { loginUser } from '@/lib/auth/auth.actions';

// const loginSchema = z.object({
//   email: z.string().email('Invalid email address'),
//   password: z.string().min(1, 'Password is required'),
// });

// type LoginFormData = z.infer<typeof loginSchema>;

// export default function LoginPage() {
//   const router = useRouter();
//   const { data: session, status, update } = useSession();
//   const [isLoading, setIsLoading] = useState(false);

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm<LoginFormData>({
//     resolver: zodResolver(loginSchema),
//   });

//   // If already authenticated, redirect to dashboard
//   useEffect(() => {
//     if (status === 'authenticated' && session?.user) {
//       console.log('Already authenticated, redirecting to dashboard');
//       router.push('/dashboard');
//     }
//   }, [status, session, router]);

//   const onSubmit = async (data: LoginFormData) => {
//     setIsLoading(true);
//     try {
//       // First, check if the user exists and their status using the API directly
//       const loginResult = await loginUser({
//         email: data.email,
//         password: data.password,
//       });

//       // If the API returns a payment required error, redirect to payment
//       if (!loginResult.success) {
//         if (loginResult.requiresPayment || 
//             loginResult.error?.toLowerCase().includes('registration fee') ||
//             loginResult.error?.toLowerCase().includes('activate') ||
//             loginResult.error?.toLowerCase().includes('not activated')) {
//           console.log('Payment required, redirecting to payment page');
//           router.push(`/payment?email=${encodeURIComponent(data.email)}`);
//           toast.error('Please pay the registration fee to activate your account');
//           setIsLoading(false);
//           return;
//         }
        
//         // Other errors
//         toast.error(loginResult.error || 'Login failed');
//         setIsLoading(false);
//         return;
//       }

//       // If login was successful, now sign in with NextAuth
//       const result = await signIn('credentials', {
//         email: data.email,
//         password: data.password,
//         redirect: false,
//       });

//       if (result?.error) {
//         console.error('NextAuth error:', result.error);
        
//         // Check if the error indicates payment required
//         if (result.error.toLowerCase().includes('registration fee') || 
//             result.error.toLowerCase().includes('activate') ||
//             result.error.toLowerCase().includes('not activated')) {
//           router.push(`/payment?email=${encodeURIComponent(data.email)}`);
//           toast.error('Please pay the registration fee to activate your account');
//           return;
//         }
        
//         toast.error(result.error || 'Invalid email or password');
//         return;
//       }

//       // Success - redirect to dashboard
//       toast.success('Login successful!');
      
//       // Force session update
//       await update();
      
//       // Redirect to dashboard
//       router.push('/dashboard');
//       router.refresh();
      
//     } catch (error: any) {
//       console.error('Login error:', error);
      
//       // Check if error message indicates payment required
//       if (error?.message?.toLowerCase().includes('registration fee') || 
//           error?.message?.toLowerCase().includes('activate') ||
//           error?.message?.toLowerCase().includes('not activated')) {
//         router.push(`/payment?email=${encodeURIComponent(data.email)}`);
//         toast.error('Please pay the registration fee to activate your account');
//         return;
//       }
      
//       toast.error(error?.message || 'Login failed. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Show loading state
//   if (status === 'loading') {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-background">
//         <Loader size="lg" text="Loading..." />
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-background">
//       <Card className="w-full max-w-md p-8 border-primary/20">
//         <div className="text-center mb-8">
//           <span className="text-5xl block mb-4">⛳</span>
//           <h1 className="text-3xl font-bold text-primary">Welcome Back</h1>
//           <p className="text-text/60 mt-2">Sign in to your Golf SACCO account</p>
//         </div>

//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//           <Input
//             label="Email Address"
//             type="email"
//             placeholder="john.doe@example.com"
//             {...register('email')}
//             error={errors.email?.message}
//           />

//           <Input
//             label="Password"
//             type="password"
//             placeholder="Enter your password"
//             {...register('password')}
//             error={errors.password?.message}
//           />

//           <Button
//             type="submit"
//             isLoading={isLoading}
//             fullWidth
//             size="lg"
//           >
//             Sign In
//           </Button>
//         </form>

//         <div className="mt-6 text-center">
//           <p className="text-text/60 text-sm">
//             Don't have an account?{' '}
//             <Link href="/register" className="text-primary hover:text-primary/80 transition-colors">
//               Register now
//             </Link>
//           </p>
//         </div>

//         <div className="mt-8 pt-6 border-t border-primary/10">
//           <p className="text-text/40 text-xs text-center">
//             By signing in, you agree to our Terms of Service and Privacy Policy
//           </p>
//         </div>
//       </Card>
//     </div>
//   );
// }