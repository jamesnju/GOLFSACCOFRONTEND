'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate, cn } from '@/lib/utils/helpers';
import { getPendingLoans, approveLoan } from '@/lib/actions/loan.actions';
import toast from 'react-hot-toast';
import { Loader } from '@/components/ui/Loader/Loader';
import useSWR from '@/lib/hooks/useSWR';

export default function AdminLoansPage() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  const { data, isLoading, revalidate, error } = useSWR(
    `admin-loans-${filter}`,
    () => getPendingLoans(),
    {
      revalidateOnFocus: false,
      onError: (error:any) => {
        console.error('Failed to fetch loans:', error);
        toast.error('Failed to load loan applications');
      },
    }
  );

  const handleApprove = async (loanId: string) => {
    try {
      const result = await approveLoan({
        loanId,
        status: 'APPROVED',
      });
      if (!result.success) {
        toast.error(result.error || 'Failed to approve loan');
        return;
      }
      toast.success('Loan approved successfully');
      revalidate();
    } catch (error) {
      toast.error('Failed to approve loan');
    }
  };

  const handleReject = async (loanId: string) => {
    try {
      const result = await approveLoan({
        loanId,
        status: 'REJECTED',
        rejectionReason: 'Rejected by admin',
      });
      if (!result.success) {
        toast.error(result.error || 'Failed to reject loan');
        return;
      }
      toast.success('Loan rejected');
      revalidate();
    } catch (error) {
      toast.error('Failed to reject loan');
    }
  };

  const loans = data?.success ? data.data || [] : [];

  const handleRefresh = () => {
    revalidate();
    toast.success('Refreshing loan applications...');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text">Loan Management</h1>
          <p className="text-text/60 mt-1">Review and process loan applications</p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm" disabled={isLoading}>
          {isLoading ? 'Loading...' : '🔄 Refresh'}
        </Button>
      </div>

      {/* Stats Summary */}
      {!isLoading && !error && loans.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-primary/20">
            <p className="text-sm text-text/60">Total Applications</p>
            <p className="text-2xl font-bold text-primary">{loans.length}</p>
          </Card>
          <Card className="border-primary/20">
            <p className="text-sm text-text/60">Total Amount</p>
            <p className="text-2xl font-bold text-secondary">
              {formatCurrency(loans.reduce((sum: number, loan: any) => sum + loan.amount, 0))}
            </p>
          </Card>
          <Card className="border-primary/20">
            <p className="text-sm text-text/60">Average Loan</p>
            <p className="text-2xl font-bold text-accent">
              {formatCurrency(loans.reduce((sum: number, loan: any) => sum + loan.amount, 0) / loans.length)}
            </p>
          </Card>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-accent/50 bg-accent/5">
          <div className="flex items-center gap-3 text-accent">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-medium">Failed to load loan applications</p>
              <p className="text-sm text-text/60">{error.message || 'Please try again'}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh} className="ml-auto">
              Retry
            </Button>
          </div>
        </Card>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader size="lg" />
          <p className="text-text/60 text-sm mt-4">Loading loan applications...</p>
        </div>
      ) : loans.length === 0 ? (
        <Card className="border-primary/20 p-8 text-center">
          <div className="text-4xl mb-4">✅</div>
          <p className="text-text/60 text-lg">No pending loan applications</p>
          <p className="text-text/40 text-sm mt-1">All loan applications have been processed</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {loans.map((loan: any) => (
            <Card key={loan.id} className="border-primary/20 hover:border-primary/40 transition-colors">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span className="text-sm font-mono text-primary bg-primary/10 px-2 py-1 rounded">
                      #{loan.id.slice(0, 8)}
                    </span>
                    <span
                      className={cn(
                        'px-2 py-1 rounded-full text-xs font-medium',
                        loan.status === 'PENDING'
                          ? 'bg-yellow-500/20 text-yellow-500'
                          : loan.status === 'APPROVED'
                          ? 'bg-green-500/20 text-green-500'
                          : 'bg-accent/20 text-accent'
                      )}
                    >
                      {loan.status}
                    </span>
                    <span className="text-xs text-text/40">
                      Applied: {formatDate(loan.applicationDate)}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-text">
                    {loan.user.firstName} {loan.user.lastName}
                  </h3>
                  <p className="text-sm text-text/60">{loan.user.email}</p>
                  <p className="text-sm text-text/60">{loan.user.phone}</p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
                    <div className="bg-primary/5 rounded-lg p-2">
                      <p className="text-xs text-text/40">Amount</p>
                      <p className="text-sm font-bold text-primary">{formatCurrency(loan.amount)}</p>
                    </div>
                    <div className="bg-primary/5 rounded-lg p-2">
                      <p className="text-xs text-text/40">Interest</p>
                      <p className="text-sm font-bold text-secondary">{(loan.interestRate * 100)}%</p>
                    </div>
                    <div className="bg-primary/5 rounded-lg p-2">
                      <p className="text-xs text-text/40">Total</p>
                      <p className="text-sm font-bold text-accent">{formatCurrency(loan.totalAmount)}</p>
                    </div>
                  </div>

                  {loan.purpose && (
                    <p className="text-sm text-text/60 mt-2">
                      <span className="text-xs text-text/40">Purpose:</span> {loan.purpose}
                    </p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                  <Button
                    variant="primary"
                    onClick={() => handleApprove(loan.id)}
                    className="w-full sm:w-auto"
                  >
                    ✅ Approve
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleReject(loan.id)}
                    className="w-full sm:w-auto"
                  >
                    ❌ Reject
                  </Button>
                </div>
              </div>

              {/* User Financial Info */}
              {loan.user.wallet && (
                <div className="mt-4 pt-4 border-t border-primary/10">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-text/40">Savings Balance</p>
                      <p className="font-medium">{formatCurrency(loan.user.wallet.balance)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text/40">Max Loan</p>
                      <p className="font-medium">{formatCurrency(loan.user.wallet.balance * 3)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text/40">Member Since</p>
                      <p className="font-medium">{formatDate(loan.user.joinDate)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text/40">Eligible</p>
                      <p className="font-medium text-green-500">
                        {loan.user.wallet.balance >= 2000 ? '✅ Yes' : '❌ No'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}