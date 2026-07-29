'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatCurrency, formatDate, cn, getStatusColor } from '@/lib/utils/helpers';
import { useLoans } from '@/lib/hooks/useLoans';
import { useWallet } from '@/lib/hooks/useWallet';
import { applyForLoan } from '@/lib/actions/loan.actions';
import toast from 'react-hot-toast';
import { Loader } from '@/components/ui/Loader/Loader';

export default function LoansPage() {
  const { eligibility, userLoans, isLoading, refreshLoans } = useLoans();
  const { balance, refreshBalance } = useWallet();
  const [isApplying, setIsApplying] = useState(false);
  const [showApplication, setShowApplication] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    purpose: '',
    durationMonths: 3,
  });

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(formData.amount);
    
    if (isNaN(amount) || amount < 1000) {
      toast.error('Minimum loan amount is KES 1,000');
      return;
    }

    if (!formData.purpose.trim()) {
      toast.error('Please specify the purpose of the loan');
      return;
    }

    setIsApplying(true);
    try {
      const result = await applyForLoan({
        amount,
        purpose: formData.purpose,
        durationMonths: formData.durationMonths,
      });

      if (!result.success) {
        toast.error(result.error || 'Loan application failed');
        return;
      }

      toast.success('Loan application submitted successfully!');
      setShowApplication(false);
      setFormData({ amount: '', purpose: '', durationMonths: 3 });
      refreshLoans();
      refreshBalance();
    } catch (error: any) {
      toast.error(error.message || 'Loan application failed');
    } finally {
      setIsApplying(false);
    }
  };

  const isEligible = eligibility?.isEligible && !eligibility?.hasActiveLoan;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader size="lg" text="Loading loans data..." />
      </div>
    );
  }

  const loans = userLoans?.data || [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text">Loans</h1>
          <p className="text-text/60 mt-1">Apply for loans and track your applications</p>
        </div>
        {isEligible && !showApplication && (
          <Button onClick={() => setShowApplication(true)}>
            Apply for Loan
          </Button>
        )}
      </div>

      {/* Eligibility Card */}
      <Card className="border-primary/20">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold">Loan Eligibility</h3>
            <div className="mt-2 space-y-1">
              <p className="text-sm">
                Status:{' '}
                <span className={cn(
                  'font-bold',
                  eligibility?.isEligible ? 'text-green-500' : 'text-accent'
                )}>
                  {eligibility?.isEligible ? '✅ Eligible' : '⏳ Not Eligible'}
                </span>
              </p>
              {eligibility && (
                <>
                  <p className="text-sm text-text/60">
                    Savings Balance: {formatCurrency(eligibility.savingsBalance)}
                  </p>
                  <p className="text-sm text-text/60">
                    Max Loan Amount: {formatCurrency(eligibility.maxLoanAmount)}
                  </p>
                  {eligibility.hasActiveLoan && (
                    <p className="text-sm text-accent">You have an active loan</p>
                  )}
                  {!eligibility.isEligible && !eligibility.hasActiveLoan && (
                    <p className="text-sm text-text/60">
                      Need {formatCurrency(eligibility.minSavingsRequirement)} in savings
                      {eligibility.joinDate && ` and 6 months membership (joined: ${formatDate(eligibility.joinDate)})`}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
          {isEligible && !showApplication && (
            <Button onClick={() => setShowApplication(true)}>Apply Now</Button>
          )}
        </div>
      </Card>

      {/* Loan Application Form */}
      {showApplication && (
        <Card className="border-primary/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Apply for a Loan</h3>
            <Button variant="ghost" size="sm" onClick={() => setShowApplication(false)}>
              ✕
            </Button>
          </div>
          <form onSubmit={handleApply} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text/80 mb-1.5">
                Amount (KES)
              </label>
              <Input
                type="number"
                placeholder="Enter loan amount"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
              <p className="text-xs text-text/40 mt-1">
                Max: {formatCurrency(eligibility?.maxLoanAmount || 0)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-text/80 mb-1.5">
                Purpose of Loan
              </label>
              <Input
                placeholder="Why do you need this loan?"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text/80 mb-1.5">
                Duration (Months)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[1, 3, 6].map((months) => (
                  <button
                    key={months}
                    type="button"
                    onClick={() => setFormData({ ...formData, durationMonths: months })}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                      formData.durationMonths === months
                        ? 'bg-primary text-background'
                        : 'bg-primary/10 text-text/60 hover:bg-primary/20'
                    )}
                  >
                    {months} {months === 1 ? 'Month' : 'Months'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="submit" isLoading={isApplying}>
                Submit Application
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowApplication(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Loan History */}
      <Card className="border-primary/20">
        <h3 className="text-lg font-bold mb-4">Loan History</h3>
        {loans.length === 0 ? (
          <p className="text-text/60 text-sm">No loan applications yet</p>
        ) : (
          <div className="space-y-4">
            {loans.map((loan: any) => (
              <div
                key={loan.id}
                className="p-4 rounded-lg border border-primary/10 hover:border-primary/30 transition-colors"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-mono text-primary bg-primary/10 px-2 py-1 rounded">
                        #{loan.id.slice(0, 8)}
                      </span>
                      <span
                        className={cn(
                          'px-2 py-1 rounded-full text-xs font-medium',
                          getStatusColor(loan.status)
                        )}
                      >
                        {loan.status}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm">
                        Amount: <span className="font-bold">{formatCurrency(loan.amount)}</span>
                      </p>
                      <p className="text-sm text-text/60">
                        Total Amount: {formatCurrency(loan.totalAmount)}
                      </p>
                      {loan.status === 'ACTIVE' && (
                        <p className="text-sm text-text/60">
                          Remaining Balance: {formatCurrency(loan.balance)}
                        </p>
                      )}
                      {loan.purpose && (
                        <p className="text-sm text-text/60">Purpose: {loan.purpose}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-text/60">
                      Applied: {formatDate(loan.applicationDate)}
                    </p>
                    {loan.approvalDate && (
                      <p className="text-sm text-text/60">
                        {loan.status === 'APPROVED' || loan.status === 'ACTIVE' ? 'Approved' : 'Processed'}: {formatDate(loan.approvalDate)}
                      </p>
                    )}
                    {loan.dueDate && (
                      <p className="text-sm text-text/60">
                        Due: {formatDate(loan.dueDate)}
                      </p>
                    )}
                    {loan.repaidAt && (
                      <p className="text-sm text-text/60 text-green-500">
                        Repaid: {formatDate(loan.repaidAt)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Repayments */}
                {loan.repayments && loan.repayments.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-primary/10">
                    <p className="text-sm font-medium text-text/60 mb-2">Repayments</p>
                    <div className="space-y-2">
                      {loan.repayments.map((repayment: any) => (
                        <div
                          key={repayment.id}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-text/60">
                            {formatDate(repayment.createdAt)}
                          </span>
                          <span className="text-green-500 font-bold">
                            +{formatCurrency(repayment.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}