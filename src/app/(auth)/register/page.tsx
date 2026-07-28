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
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-background">
      <Card className="w-full max-w-md p-8 border-primary/20">
        <div className="text-center mb-8">
          <span className="text-5xl block mb-4">⛳</span>
          <h1 className="text-3xl font-bold text-primary">Join Golf SACCO</h1>
          <p className="text-text/60 mt-2">Start your savings journey today</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              placeholder="John"
              {...register('firstName')}
              error={errors.firstName?.message}
            />
            <Input
              label="Last Name"
              placeholder="Doe"
              {...register('lastName')}
              error={errors.lastName?.message}
            />
          </div>

          <Input
            label="Email Address"
            type="email"
            placeholder="john.doe@example.com"
            {...register('email')}
            error={errors.email?.message}
          />

          <Input
            label="Phone Number"
            type="tel"
            placeholder="0712345678"
            {...register('phone')}
            error={errors.phone?.message}
          />

          <Input
            label="Password"
            type="password"
            placeholder="Create a strong password"
            {...register('password')}
            error={errors.password?.message}
          />

          <Input
            label="Confirm Password"
            type="password"
            placeholder="Confirm your password"
            {...register('confirmPassword')}
            error={errors.confirmPassword?.message}
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-text/80">I am a</label>
            <div className="grid grid-cols-3 gap-2">
              {['PLAYER', 'PRO', 'CADDY'].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setValue('role', role as any)}
                  className={`
                    px-4 py-2 rounded-lg cursor-pointer transition-all text-sm font-medium
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
          >
            Create Account
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-text/60 text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:text-primary/80 transition-colors">
              Sign in
            </Link>
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-primary/10">
          <p className="text-text/40 text-xs text-center">
            Registration fee: <span className="text-primary font-bold">KES 1,000</span>
          </p>
          <p className="text-text/40 text-xs text-center mt-1">
            By registering, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </Card>
    </div>
  );
}