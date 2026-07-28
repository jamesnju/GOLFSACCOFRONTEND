'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { withdrawFunds } from '@/lib/actions/wallet.actions';
import toast from 'react-hot-toast';

const withdrawSchema = z.object({
  amount: z.number().min(100, 'Minimum withdrawal is KES 100'),
  mpesaNumber: z.string().optional(),
  bankAccount: z.string().optional(),
  description: z.string().optional(),
}).refine((data) => data.mpesaNumber || data.bankAccount, {
  message: 'Please provide either M-Pesa number or bank account',
  path: ['mpesaNumber'],
});

type WithdrawFormData = {
  amount: number;
  mpesaNumber?: string;
  bankAccount?: string;
  description?: string;
};

export function WithdrawForm() {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WithdrawFormData>({
    resolver: zodResolver(withdrawSchema),
    defaultValues: {
      amount: 0,
      mpesaNumber: '',
      bankAccount: '',
      description: '',
    },
  });

  const onSubmit = async (data: WithdrawFormData) => {
    setIsLoading(true);
    try {
      const result = await withdrawFunds(data);
      if (!result.success) {
        toast.error(result.error || 'Withdrawal failed');
        return;
      }
      toast.success('Withdrawal request submitted!');
      reset({
        amount: 0,
        mpesaNumber: '',
        bankAccount: '',
        description: '',
      });
    } catch (error) {
      toast.error('Withdrawal failed. Please try again.');
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

      <Input
        label="M-Pesa Number"
        type="tel"
        placeholder="0712345678"
        {...register('mpesaNumber')}
        error={errors.mpesaNumber?.message}
      />

      <Input
        label="Bank Account (Optional)"
        placeholder="Bank and account number"
        {...register('bankAccount')}
        error={errors.bankAccount?.message}
      />

      <Input
        label="Description (Optional)"
        placeholder="e.g., Emergency withdrawal"
        {...register('description')}
        error={errors.description?.message}
      />

      <Button type="submit" isLoading={isLoading} fullWidth variant="outline">
        Request Withdrawal
      </Button>
    </form>
  );
}