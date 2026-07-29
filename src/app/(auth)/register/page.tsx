'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import toast from 'react-hot-toast';
import {
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
  PhoneIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { registerUser } from '@/lib/auth/auth.actions';

const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  role: z.enum(['PLAYER', 'PRO', 'CADDY']),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: 'PLAYER' | 'PRO' | 'CADDY';
};

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      role: 'PLAYER',
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const result = await registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: data.role,
      });

      if (!result.success) {
        toast.error(result.error || 'Registration failed');
        return;
      }

      toast.success('Registration successful! Please login.');
      router.push('/login');
    } catch (error) {
      toast.error('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 bg-background">
      {/* Main Card */}
      <Card className="w-full max-w-6xl overflow-hidden border-primary/20 shadow-2xl shadow-primary/5">
        <div className="flex flex-col lg:flex-row min-h-[650px] lg:min-h-[700px]">
          
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
                Start Your{' '}
                <span className="text-primary">Golf Journey</span>
                {' '}Today
              </h2>
              <p className="text-base text-text/60 mb-8">
                Join a community of golf enthusiasts building financial freedom together.
              </p>

              {/* Benefits List */}
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-text">Easy Savings</h4>
                    <p className="text-sm text-text/40">Deposit and grow your savings with ease</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-text">Quick Loans</h4>
                    <p className="text-sm text-text/40">Access loans up to 3x your savings</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-text">Community Driven</h4>
                    <p className="text-sm text-text/40">Connect with golfers and grow together</p>
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
                  <p className="text-2xl font-bold text-secondary">KES 2.5M+</p>
                  <p className="text-xs text-text/40">Total Savings</p>
                </div>
                <div className="w-px h-10 bg-primary/20" />
                <div>
                  <p className="text-2xl font-bold text-accent">98%</p>
                  <p className="text-xs text-text/40">Satisfaction</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Registration Form */}
          <div className="lg:w-1/2 p-6 sm:p-8 lg:p-10 flex flex-col justify-center bg-background/30 overflow-y-auto">
            <div className="w-full max-w-sm mx-auto">
              {/* Welcome Header */}
              <div className="text-center mb-6">
                <h2 className="text-2xl sm:text-3xl font-heading font-bold text-text">
                  Create Account
                </h2>
                <p className="text-sm text-text/50 mt-1">
                  Join the Golf SACCO community today
                </p>
              </div>

              {/* Registration Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-text/80">
                      First Name
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text/30">
                        <UserIcon className="w-4 h-4" />
                      </div>
                      <Input
                        placeholder="John"
                        className="pl-9 bg-background/50 border-primary/20 focus:border-primary/50 rounded-xl text-sm"
                        {...register('firstName')}
                        error={errors.firstName?.message}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-text/80">
                      Last Name
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text/30">
                        <UserIcon className="w-4 h-4" />
                      </div>
                      <Input
                        placeholder="Doe"
                        className="pl-9 bg-background/50 border-primary/20 focus:border-primary/50 rounded-xl text-sm"
                        {...register('lastName')}
                        error={errors.lastName?.message}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-text/80">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text/30">
                      <EnvelopeIcon className="w-4 h-4" />
                    </div>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      className="pl-9 bg-background/50 border-primary/20 focus:border-primary/50 rounded-xl text-sm"
                      {...register('email')}
                      error={errors.email?.message}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-text/80">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text/30">
                      <PhoneIcon className="w-4 h-4" />
                    </div>
                    <Input
                      type="tel"
                      placeholder="0712345678"
                      className="pl-9 bg-background/50 border-primary/20 focus:border-primary/50 rounded-xl text-sm"
                      {...register('phone')}
                      error={errors.phone?.message}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-text/80">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text/30">
                      <LockClosedIcon className="w-4 h-4" />
                    </div>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a strong password"
                      className="pl-9 pr-10 bg-background/50 border-primary/20 focus:border-primary/50 rounded-xl text-sm"
                      {...register('password')}
                      error={errors.password?.message}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text/30 hover:text-text/60 transition-colors"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="w-4 h-4" />
                      ) : (
                        <EyeIcon className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-text/80">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text/30">
                      <LockClosedIcon className="w-4 h-4" />
                    </div>
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      className="pl-9 pr-10 bg-background/50 border-primary/20 focus:border-primary/50 rounded-xl text-sm"
                      {...register('confirmPassword')}
                      error={errors.confirmPassword?.message}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text/30 hover:text-text/60 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="w-4 h-4" />
                      ) : (
                        <EyeIcon className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-text/80">I am a</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['PLAYER', 'PRO', 'CADDY'].map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setValue('role', role as any)}
                        className={`
                          px-3 py-2 rounded-lg cursor-pointer transition-all text-sm font-medium
                          ${selectedRole === role 
                            ? 'bg-primary text-background' 
                            : 'bg-primary/10 text-text/60 hover:bg-primary/20'}
                        `}
                      >
                        {role.charAt(0) + role.slice(1).toLowerCase()}
                      </button>
                    ))}
                  </div>
                  <input type="hidden" {...register('role')} />
                  {errors.role && (
                    <p className="text-sm text-accent">{errors.role.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  isLoading={isLoading}
                  fullWidth
                  size="lg"
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-background font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-primary/40"
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                  {!isLoading && <ArrowRightIcon className="w-5 h-5 ml-2" />}
                </Button>
              </form>

              {/* Login Link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-text/40">
                  Already have an account?{' '}
                  <Link
                    href="/login"
                    className="text-primary hover:text-primary/80 transition-colors font-medium group inline-flex items-center gap-1"
                  >
                    Sign In
                    <ArrowRightIcon className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </p>
              </div>

              {/* Registration Fee Note */}
              <div className="mt-4 pt-4 border-t border-primary/10">
                <p className="text-xs text-text/40 text-center">
                  Registration fee: <span className="text-primary font-bold">KES 1,000</span>
                  <span className="block mt-1">By registering, you agree to our Terms of Service</span>
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

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
// import { Button } from '@/components/ui/Button';
// import { Input } from '@/components/ui/Input';
// import { Card } from '@/components/ui/Card';
// import toast from 'react-hot-toast';
// import { registerUser } from '@/lib/auth/auth.actions';

// const registerSchema = z.object({
//   firstName: z.string().min(1, 'First name is required'),
//   lastName: z.string().min(1, 'Last name is required'),
//   email: z.string().email('Invalid email address'),
//   phone: z.string().min(10, 'Phone number must be at least 10 digits'),
//   password: z.string().min(6, 'Password must be at least 6 characters'),
//   confirmPassword: z.string(),
//   role: z.enum(['PLAYER', 'PRO', 'CADDY']),
// }).refine((data) => data.password === data.confirmPassword, {
//   message: "Passwords don't match",
//   path: ["confirmPassword"],
// });

// type RegisterFormData = {
//   firstName: string;
//   lastName: string;
//   email: string;
//   phone: string;
//   password: string;
//   confirmPassword: string;
//   role: 'PLAYER' | 'PRO' | 'CADDY';
// };

// export default function RegisterPage() {
//   const router = useRouter();
//   const [isLoading, setIsLoading] = useState(false);

//   const {
//     register,
//     handleSubmit,
//     setValue,
//     watch,
//     formState: { errors },
//   } = useForm<RegisterFormData>({
//     resolver: zodResolver(registerSchema),
//     defaultValues: {
//       firstName: '',
//       lastName: '',
//       email: '',
//       phone: '',
//       password: '',
//       confirmPassword: '',
//       role: 'PLAYER',
//     },
//   });

//   const selectedRole = watch('role');

//   const onSubmit = async (data: RegisterFormData) => {
//     setIsLoading(true);
//     try {
//       const result = await registerUser({
//         firstName: data.firstName,
//         lastName: data.lastName,
//         email: data.email,
//         phone: data.phone,
//         password: data.password,
//         role: data.role,
//       });

//       if (!result.success) {
//         toast.error(result.error || 'Registration failed');
//         return;
//       }

//       toast.success('Registration successful! Please login.');
//       router.push('/login');
//     } catch (error) {
//       toast.error('Registration failed. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-background">
//       <Card className="w-full max-w-md p-8 border-primary/20">
//         <div className="text-center mb-8">
//           <span className="text-5xl block mb-4">⛳</span>
//           <h1 className="text-3xl font-bold text-primary">Join Golf SACCO</h1>
//           <p className="text-text/60 mt-2">Start your savings journey today</p>
//         </div>

//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//           <div className="grid grid-cols-2 gap-4">
//             <Input
//               label="First Name"
//               placeholder="John"
//               {...register('firstName')}
//               error={errors.firstName?.message}
//             />
//             <Input
//               label="Last Name"
//               placeholder="Doe"
//               {...register('lastName')}
//               error={errors.lastName?.message}
//             />
//           </div>

//           <Input
//             label="Email Address"
//             type="email"
//             placeholder="john.doe@example.com"
//             {...register('email')}
//             error={errors.email?.message}
//           />

//           <Input
//             label="Phone Number"
//             type="tel"
//             placeholder="0712345678"
//             {...register('phone')}
//             error={errors.phone?.message}
//           />

//           <Input
//             label="Password"
//             type="password"
//             placeholder="Create a strong password"
//             {...register('password')}
//             error={errors.password?.message}
//           />

//           <Input
//             label="Confirm Password"
//             type="password"
//             placeholder="Confirm your password"
//             {...register('confirmPassword')}
//             error={errors.confirmPassword?.message}
//           />

//           <div className="space-y-2">
//             <label className="block text-sm font-medium text-text/80">I am a</label>
//             <div className="grid grid-cols-3 gap-2">
//               {['PLAYER', 'PRO', 'CADDY'].map((role) => (
//                 <button
//                   key={role}
//                   type="button"
//                   onClick={() => setValue('role', role as any)}
//                   className={`
//                     px-4 py-2 rounded-lg cursor-pointer transition-all text-sm font-medium
//                     ${selectedRole === role 
//                       ? 'bg-primary text-background' 
//                       : 'bg-primary/10 text-text/60 hover:bg-primary/20'}
//                   `}
//                 >
//                   {role.charAt(0) + role.slice(1).toLowerCase()}
//                 </button>
//               ))}
//             </div>
//             <input type="hidden" {...register('role')} />
//             {errors.role && (
//               <p className="text-sm text-accent">{errors.role.message}</p>
//             )}
//           </div>

//           <Button
//             type="submit"
//             isLoading={isLoading}
//             fullWidth
//             size="lg"
//           >
//             Create Account
//           </Button>
//         </form>

//         <div className="mt-6 text-center">
//           <p className="text-text/60 text-sm">
//             Already have an account?{' '}
//             <Link href="/login" className="text-primary hover:text-primary/80 transition-colors">
//               Sign in
//             </Link>
//           </p>
//         </div>

//         <div className="mt-8 pt-6 border-t border-primary/10">
//           <p className="text-text/40 text-xs text-center">
//             Registration fee: <span className="text-primary font-bold">KES 1,000</span>
//           </p>
//           <p className="text-text/40 text-xs text-center mt-1">
//             By registering, you agree to our Terms of Service and Privacy Policy
//           </p>
//         </div>
//       </Card>
//     </div>
//   );
// }