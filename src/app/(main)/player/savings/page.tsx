import { Suspense } from 'react';
import { getWalletBalance } from '@/lib/actions/wallet.actions';
import { getTransactionHistory } from '@/lib/actions/transaction.actions';
import { Card } from '@/components/ui/Card';
import { formatCurrency, formatDate } from '@/lib/utils/helpers';

export default async function SavingsPage() {
  const [balanceResult, transactionsResult] = await Promise.all([
    getWalletBalance(),
    getTransactionHistory({ type: 'DEPOSIT', limit: 20 }),
  ]);

  const balance = balanceResult.success ? balanceResult.data : null;
  const transactions = transactionsResult.success ? transactionsResult.data?.transactions || [] : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text">Savings</h1>
        <p className="text-text/60 mt-1">Manage your savings account</p>
      </div>

      {/* Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1 md:col-span-2 bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30">
          <div className="space-y-2">
            <p className="text-sm text-text/60">Total Balance</p>
            <p className="text-4xl font-bold text-primary">
              {formatCurrency(balance?.balance || 0)}
            </p>
            <div className="flex gap-4 text-sm text-text/60">
              <span>Available: {formatCurrency(balance?.availableBalance || 0)}</span>
              <span>Locked: {formatCurrency(balance?.lockedBalance || 0)}</span>
            </div>
          </div>
        </Card>

        <Card className="border-primary/20">
          <div className="space-y-4">
            <h3 className="text-sm font-bold">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <DepositButton />
              <WithdrawButton />
            </div>
          </div>
        </Card>
      </div>

      {/* Deposit Form Section */}
      <Card className="border-primary/20">
        <h3 className="text-lg font-bold mb-4">Deposit Funds</h3>
        <DepositForm />
      </Card>

      {/* Withdraw Form Section */}
      <Card className="border-primary/20">
        <h3 className="text-lg font-bold mb-4">Withdraw Funds</h3>
        <WithdrawForm />
      </Card>

      {/* Transaction History */}
      <Card className="border-primary/20">
        <h3 className="text-lg font-bold mb-4">Deposit History</h3>
        <Suspense fallback={<Loader size="sm" />}>
          <div className="space-y-3">
            {transactions.length === 0 ? (
              <p className="text-text/60 text-sm">No deposits yet</p>
            ) : (
              transactions.map((tx: any) => (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-primary/5">
                  <div>
                    <p className="text-sm font-medium">{tx.description || 'Deposit'}</p>
                    <p className="text-xs text-text/40">{formatDate(tx.createdAt)}</p>
                  </div>
                  <p className="text-sm font-bold text-green-500">
                    +{formatCurrency(tx.amount)}
                  </p>
                </div>
              ))
            )}
          </div>
        </Suspense>
      </Card>
    </div>
  );
}

// Client Components
'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { DepositForm } from '@/components/forms/DepositForm';
import { WithdrawForm } from '@/components/forms/WithdrawForm';
import { Loader } from '@/components/ui/Loader/Loader';

function DepositButton() {
  const [showForm, setShowForm] = useState(false);
  return (
    <Button onClick={() => setShowForm(true)} size="sm" className="w-full">
      💰 Deposit
    </Button>
  );
}

function WithdrawButton() {
  const [showForm, setShowForm] = useState(false);
  return (
    <Button onClick={() => setShowForm(true)} size="sm" variant="outline" className="w-full">
      🏦 Withdraw
    </Button>
  );
}