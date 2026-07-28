import { Suspense } from 'react';
import { getWalletBalance } from '@/lib/actions/wallet.actions';
import { Card } from '@/components/ui/Card';
import { formatCurrency, formatDate } from '@/lib/utils/helpers';

export default async function CaddyDashboardPage() {
  const [balanceResult, user] = await Promise.all([
    getWalletBalance(),
    getCurrentUser(),
  ]);

  const balance = balanceResult.success ? balanceResult.data : null;

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-text">
          Welcome back, {user?.firstName}! ⛳
        </h1>
        <p className="text-text/60 mt-1">Manage your caddy finances and earnings</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30">
          <div className="space-y-2">
            <p className="text-sm text-text/60">Total Savings</p>
            <p className="text-3xl font-bold text-primary">
              {formatCurrency(balance?.balance || 0)}
            </p>
            <p className="text-xs text-text/40">
              Available: {formatCurrency(balance?.availableBalance || 0)}
            </p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-secondary/20 to-secondary/5 border-secondary/30">
          <div className="space-y-2">
            <p className="text-sm text-text/60">Total Jobs</p>
            <p className="text-3xl font-bold text-secondary">0</p>
            <p className="text-xs text-text/40">This month</p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-accent/20 to-accent/5 border-accent/30">
          <div className="space-y-2">
            <p className="text-sm text-text/60">Loan Eligibility</p>
            <p className="text-3xl font-bold text-accent">
              {balance?.isEligibleForLoan ? '✅ Yes' : '⏳ Pending'}
            </p>
            <p className="text-xs text-text/40">
              {balance?.isEligibleForLoan ? 'You can apply for loans' : '6 months membership required'}
            </p>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-primary/20">
          <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <QuickActionButton href="/savings/deposit" icon="💰" label="Deposit" />
            <QuickActionButton href="/savings/withdraw" icon="🏦" label="Withdraw" />
            {balance?.isEligibleForLoan && (
              <QuickActionButton href="/loans/apply" icon="📝" label="Apply Loan" />
            )}
            <QuickActionButton href="/transactions" icon="📊" label="History" />
          </div>
        </Card>

        <Card className="border-primary/20">
          <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
          <Suspense fallback={<Loader size="sm" />}>
            <RecentTransactions />
          </Suspense>
        </Card>
      </div>
    </div>
  );
}

// Client Component for Quick Action Buttons
'use client';
function QuickActionButton({ href, icon, label }: { href: string; icon: string; label: string }) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push(href)}
      className="flex flex-col items-center gap-2 p-4 rounded-lg bg-primary/10 hover:bg-primary/20 transition-all duration-200"
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-sm text-text">{label}</span>
    </button>
  );
}

// Server Component for Recent Transactions
async function RecentTransactions() {
  const { getTransactionHistory } = await import('@/lib/actions/transaction.actions');
  const result = await getTransactionHistory({ limit: 5 });
  
  if (!result.success || !result.data?.transactions?.length) {
    return <p className="text-text/60 text-sm">No recent transactions</p>;
  }

  return (
    <div className="space-y-3">
      {result.data.transactions.map((tx: any) => (
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
  );
}

// Imports
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils/helpers';
import { Loader } from '@/components/ui/Loader/Loader';import { getCurrentUser } from '@/lib/auth/auth.actions';

