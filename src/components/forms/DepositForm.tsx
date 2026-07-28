'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { depositFunds } from '@/lib/actions/wallet.actions';
import toast from 'react-hot-toast';

// Simplified schema - NO default() to avoid type issues
const depositSchema = z.object({
  amount: z.number().min(100, 'Minimum deposit is KES 100'),
  paymentMethod: z.enum(['MPESA', 'BANK', 'CASH']),
  description: z.string().optional(),
});

// Explicit type definition
type DepositFormData = {
  amount: number;
  paymentMethod: 'MPESA' | 'BANK' | 'CASH';
  description?: string;
};

export function DepositForm() {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DepositFormData>({
    resolver: zodResolver(depositSchema),
    defaultValues: {
      amount: 0,
      paymentMethod: 'MPESA',
      description: '',
    },
  });

  const selectedMethod = watch('paymentMethod');

  const onSubmit = async (data: DepositFormData) => {
    setIsLoading(true);
    try {
      const result = await depositFunds(data);
      if (!result.success) {
        toast.error(result.error || 'Deposit failed');
        return;
      }
      toast.success('Deposit successful!');
      reset({
        amount: 0,
        paymentMethod: 'MPESA',
        description: '',
      });
    } catch (error) {
      toast.error('Deposit failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Amount (KES)"
        type="number"
        placeholder="Enter amount"
        {...register('amount', { valueAsNumber: true })}
        error={errors.amount?.message}
      />

      <div className="space-y-2">
        <label className="block text-sm font-medium text-text/80">Payment Method</label>
        <div className="grid grid-cols-3 gap-2">
          {['MPESA', 'BANK', 'CASH'].map((method) => (
            <button
              key={method}
              type="button"
              onClick={() => setValue('paymentMethod', method as any)}
              className={`
                px-4 py-2 rounded-lg cursor-pointer transition-all text-sm font-medium
                ${selectedMethod === method 
                  ? 'bg-primary text-background' 
                  : 'bg-primary/10 text-text/60 hover:bg-primary/20'}
              `}
            >
              {method}
            </button>
          ))}
        </div>
        <input type="hidden" {...register('paymentMethod')} />
        {errors.paymentMethod && (
          <p className="text-sm text-accent">{errors.paymentMethod.message}</p>
        )}
      </div>

      <Input
        label="Description (Optional)"
        placeholder="e.g., Monthly savings"
        {...register('description')}
        error={errors.description?.message}
      />

      <Button type="submit" isLoading={isLoading} fullWidth>
        Deposit Funds
      </Button>
    </form>
  );
}