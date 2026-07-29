'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatCurrency, formatDate, cn } from '@/lib/utils/helpers';
import { useWallet } from '@/lib/hooks/useWallet';
import { useLoans } from '@/lib/hooks/useLoans';
import { depositFunds, withdrawFunds } from '@/lib/actions/wallet.actions';
import toast from 'react-hot-toast';
import { Loader } from '@/components/ui/Loader/Loader';
import useTransactions from '@/lib/hooks/useTransactions';

export default function WalletPage() {
  const router = useRouter();
  const { balance, isLoading: walletLoading, refreshBalance } = useWallet();
  const { eligibility, userLoans, isLoading: loansLoading } = useLoans();
  const { transactions, isLoading: txLoading } = useTransactions();
  
  const [isDepositing, setIsDepositing] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'deposit' | 'withdraw'>('overview');

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount < 100) {
      toast.error('Minimum deposit is KES 100');
      return;
    }

    setIsDepositing(true);
    try {
      const result = await depositFunds({
        amount,
        paymentMethod: 'MPESA',
        description: 'Wallet deposit',
      });

      if (!result.success) {
        toast.error(result.error || 'Deposit failed');
        return;
      }

      toast.success(`Deposit of ${formatCurrency(amount)} successful!`);
      setDepositAmount('');
      refreshBalance();
    } catch (error: any) {
      toast.error(error.message || 'Deposit failed');
    } finally {
      setIsDepositing(false);
    }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount < 100) {
      toast.error('Minimum withdrawal is KES 100');
      return;
    }

    if (amount > (balance?.availableBalance || 0)) {
      toast.error('Insufficient available balance');
      return;
    }

    setIsWithdrawing(true);
    try {
      const result = await withdrawFunds({
        amount,
        mpesaNumber: '0712345678',
        description: 'Wallet withdrawal',
      });

      if (!result.success) {
        toast.error(result.error || 'Withdrawal failed');
        return;
      }

      toast.success(`Withdrawal of ${formatCurrency(amount)} submitted!`);
      setWithdrawAmount('');
      refreshBalance();
    } catch (error: any) {
      toast.error(error.message || 'Withdrawal failed');
    } finally {
      setIsWithdrawing(false);
    }
  };

  const isLoading = walletLoading || loansLoading || txLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader size="lg" text="Loading wallet data..." />
      </div>
    );
  }

  const loans = userLoans?.data || [];
  const activeLoans = loans.filter((l: any) => l.status === 'ACTIVE');
  const recentTransactions = transactions?.transactions?.slice(0, 5) || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text">Wallet</h1>
        <p className="text-text/60 mt-1">Manage your savings, loans, and transactions</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-primary/10">
        <button
          onClick={() => setActiveTab('overview')}
          className={cn(
            'px-6 py-3 text-sm font-medium transition-colors',
            activeTab === 'overview'
              ? 'text-primary border-b-2 border-primary'
              : 'text-text/60 hover:text-text'
          )}
        >
          📊 Overview
        </button>
        <button
          onClick={() => setActiveTab('deposit')}
          className={cn(
            'px-6 py-3 text-sm font-medium transition-colors',
            activeTab === 'deposit'
              ? 'text-primary border-b-2 border-primary'
              : 'text-text/60 hover:text-text'
          )}
        >
          💰 Deposit
        </button>
        <button
          onClick={() => setActiveTab('withdraw')}
          className={cn(
            'px-6 py-3 text-sm font-medium transition-colors',
            activeTab === 'withdraw'
              ? 'text-primary border-b-2 border-primary'
              : 'text-text/60 hover:text-text'
          )}
        >
          🏦 Withdraw
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Balance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30">
              <div className="space-y-2">
                <p className="text-sm text-text/60">Total Balance</p>
                <p className="text-3xl font-bold text-primary">
                  {formatCurrency(balance?.balance || 0)}
                </p>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-secondary/20 to-secondary/5 border-secondary/30">
              <div className="space-y-2">
                <p className="text-sm text-text/60">Available</p>
                <p className="text-3xl font-bold text-secondary">
                  {formatCurrency(balance?.availableBalance || 0)}
                </p>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-accent/20 to-accent/5 border-accent/30">
              <div className="space-y-2">
                <p className="text-sm text-text/60">Locked</p>
                <p className="text-3xl font-bold text-accent">
                  {formatCurrency(balance?.lockedBalance || 0)}
                </p>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30">
              <div className="space-y-2">
                <p className="text-sm text-text/60">Active Loans</p>
                <p className="text-3xl font-bold text-primary">
                  {activeLoans.length}
                </p>
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-primary/20">
              <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setActiveTab('deposit')}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg bg-primary/10 hover:bg-primary/20 transition-all"
                >
                  <span className="text-2xl">💰</span>
                  <span className="text-sm text-text">Deposit</span>
                </button>
                <button
                  onClick={() => setActiveTab('withdraw')}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg bg-primary/10 hover:bg-primary/20 transition-all"
                >
                  <span className="text-2xl">🏦</span>
                  <span className="text-sm text-text">Withdraw</span>
                </button>
                {balance?.isEligibleForLoan && (
                  <button
                    onClick={() => router.push('/loans')}
                    className="flex flex-col items-center gap-2 p-4 rounded-lg bg-primary/10 hover:bg-primary/20 transition-all"
                  >
                    <span className="text-2xl">📝</span>
                    <span className="text-sm text-text">Apply Loan</span>
                  </button>
                )}
                <button
                  onClick={() => router.push('/transactions')}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg bg-primary/10 hover:bg-primary/20 transition-all"
                >
                  <span className="text-2xl">📊</span>
                  <span className="text-sm text-text">History</span>
                </button>
              </div>
            </Card>

            <Card className="border-primary/20">
              <h3 className="text-lg font-bold mb-4">Loan Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text/60">Eligibility</span>
                  <span className={cn(
                    'text-sm font-bold',
                    eligibility?.isEligible ? 'text-green-500' : 'text-accent'
                  )}>
                    {eligibility?.isEligible ? '✅ Eligible' : '⏳ Not Eligible'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text/60">Max Loan</span>
                  <span className="text-sm font-bold text-primary">
                    {formatCurrency(eligibility?.maxLoanAmount || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text/60">Savings Required</span>
                  <span className="text-sm font-bold text-secondary">
                    {formatCurrency(eligibility?.minSavingsRequirement || 2000)}
                  </span>
                </div>
                {balance?.activeLoan && (
                  <div className="mt-3 p-3 bg-accent/10 rounded-lg">
                    <p className="text-sm text-text/60">Active Loan Balance</p>
                    <p className="text-lg font-bold text-accent">
                      {formatCurrency(balance.activeLoan.balance)}
                    </p>
                    <p className="text-xs text-text/40">
                      Due: {formatDate(balance.activeLoan.dueDate)}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Recent Transactions */}
          <Card className="border-primary/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Recent Transactions</h3>
              <Button variant="ghost" size="sm" onClick={() => router.push('/transactions')}>
                View All →
              </Button>
            </div>
            {recentTransactions.length === 0 ? (
              <p className="text-text/60 text-sm">No recent transactions</p>
            ) : (
              <div className="space-y-3">
                {recentTransactions.map((tx: any) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-primary/5">
                    <div>
                      <p className="text-sm font-medium">{tx.description || tx.type}</p>
                      <p className="text-xs text-text/40">{formatDate(tx.createdAt)}</p>
                    </div>
                    <p className={cn(
                      'text-sm font-bold',
                      tx.type === 'DEPOSIT' || tx.type === 'LOAN_DISBURSEMENT'
                        ? 'text-green-500'
                        : 'text-accent'
                    )}>
                      {tx.type === 'DEPOSIT' || tx.type === 'LOAN_DISBURSEMENT' ? '+' : '-'}
                      {formatCurrency(tx.amount)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}

      {/* Deposit Tab */}
      {activeTab === 'deposit' && (
        <Card className="border-primary/20">
          <h3 className="text-lg font-bold mb-4">Deposit Funds</h3>
          <div className="space-y-4">
            <p className="text-sm text-text/60">
              Deposit money into your wallet. Minimum deposit is KES 100.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                type="number"
                placeholder="Enter amount"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={handleDeposit}
                isLoading={isDepositing}
                disabled={!depositAmount || parseFloat(depositAmount) < 100}
              >
                Deposit Funds
              </Button>
            </div>
            <div className="flex gap-2 flex-wrap">
              {[1000, 2000, 5000, 10000, 20000].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setDepositAmount(amount.toString())}
                  className="px-3 py-1 text-sm bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
                >
                  {formatCurrency(amount)}
                </button>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Withdraw Tab */}
      {activeTab === 'withdraw' && (
        <Card className="border-primary/20">
          <h3 className="text-lg font-bold mb-4">Withdraw Funds</h3>
          <div className="space-y-4">
            <p className="text-sm text-text/60">
              Withdraw money from your wallet. Minimum withdrawal is KES 100.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                type="number"
                placeholder="Enter amount"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={handleWithdraw}
                isLoading={isWithdrawing}
                variant="outline"
                disabled={!withdrawAmount || parseFloat(withdrawAmount) < 100}
              >
                Request Withdrawal
              </Button>
            </div>
            <div className="flex gap-2 flex-wrap">
              {[1000, 2000, 5000, 10000].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setWithdrawAmount(amount.toString())}
                  className="px-3 py-1 text-sm bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
                >
                  {formatCurrency(amount)}
                </button>
              ))}
            </div>
            <p className="text-xs text-text/40">
              Available balance: {formatCurrency(balance?.availableBalance || 0)}
            </p>
            {balance?.lockedBalance && balance.lockedBalance > 0 && (
              <p className="text-xs text-text/40">
                Locked balance: {formatCurrency(balance.lockedBalance)} (active loan collateral)
              </p>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}