'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { applyForLoan } from '@/lib/actions/loan.actions';
import toast from 'react-hot-toast';

const loanSchema = z.object({
  amount: z.number().min(1000, 'Minimum loan is KES 1,000'),
  purpose: z.string().min(1, 'Please specify the purpose'),
  durationMonths: z.number().min(1).max(6),
});

type LoanFormData = {
  amount: number;
  purpose: string;
  durationMonths: number;
};

export function LoanApplicationForm() {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LoanFormData>({
    resolver: zodResolver(loanSchema),
    defaultValues: {
      amount: 0,
      purpose: '',
      durationMonths: 3,
    },
  });

  const amount = watch('amount');
  const selectedDuration = watch('durationMonths');

  const onSubmit = async (data: LoanFormData) => {
    setIsLoading(true);
    try {
      const result = await applyForLoan(data);
      if (!result.success) {
        toast.error(result.error || 'Loan application failed');
        return;
      }
      toast.success('Loan application submitted!');
      reset({
        amount: 0,
        purpose: '',
        durationMonths: 3,
      });
    } catch (error) {
      toast.error('Loan application failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <Input
          label="Amount (KES)"
          type="number"
          placeholder="Enter loan amount"
          {...register('amount', { valueAsNumber: true })}
          error={errors.amount?.message}
        />
        {amount && amount > 0 && (
          <p className="text-xs text-text/60">
            Max loan: {formatCurrency(amount * 3)}
          </p>
        )}
      </div>

      <Input
        label="Purpose of Loan"
        placeholder="Why do you need this loan?"
        {...register('purpose')}
        error={errors.purpose?.message}
      />

      <div className="space-y-2">
        <label className="block text-sm font-medium text-text/80">Duration (Months)</label>
        <div className="grid grid-cols-3 gap-2">
          {[1, 3, 6].map((months) => (
            <button
              key={months}
              type="button"
              onClick={() => setValue('durationMonths', months)}
              className={`
                px-4 py-2 rounded-lg cursor-pointer transition-all text-sm font-medium
                ${selectedDuration === months 
                  ? 'bg-primary text-background' 
                  : 'bg-primary/10 text-text/60 hover:bg-primary/20'}
              `}
            >
              {months} {months === 1 ? 'Month' : 'Months'}
            </button>
          ))}
        </div>
        <input type="hidden" {...register('durationMonths', { valueAsNumber: true })} />
        {errors.durationMonths && (
          <p className="text-sm text-accent">{errors.durationMonths.message}</p>
        )}
      </div>

      <Button type="submit" isLoading={isLoading} fullWidth>
        Apply for Loan
      </Button>
    </form>
  );
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}