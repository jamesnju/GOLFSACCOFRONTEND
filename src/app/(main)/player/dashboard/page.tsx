import { Suspense } from 'react';
import { getWalletBalance } from '@/lib/actions/wallet.actions';
import { getUserLoans } from '@/lib/actions/loan.actions';
import { getTransactionHistory } from '@/lib/actions/transaction.actions';
import { Card } from '@/components/ui/Card';
import { formatCurrency, formatDate, cn } from '@/lib/utils/helpers';
import { getCurrentUser } from '@/lib/auth/auth.actions';
import { QuickActionButton } from './QuickActionButton';
import { Loader } from '@/components/ui/Loader/Loader';



interface Loan {
  id: string;
  amount: number;
  status: string;
  balance: number;
  totalAmount: number;
  purpose?: string;
  applicationDate: string;
  dueDate: string;
  [key: string]: any;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description?: string;
  status: string;
  createdAt: string;
  [key: string]: any;
}

interface WalletBalance {
  balance: number;
  lockedBalance: number;
  availableBalance: number;
  isEligibleForLoan: boolean;
  activeLoan?: {
    id: string;
    amount: number;
    balance: number;
    dueDate: string;
  } | null;
}

export default async function PlayerDashboardPage() {
  try {
    // All data fetching is done via Server Actions
    const [balanceResult, loansResult, user, transactionsResult] = await Promise.all([
      getWalletBalance(),
      getUserLoans(),
      getCurrentUser(),
      getTransactionHistory({ limit: 5 }),
    ]);

    // Safely extract balance data
    const balance = balanceResult.success ? (balanceResult.data as WalletBalance) : null;
    
    // Safely extract loans data
    let loans: Loan[] = [];
    if (loansResult.success && loansResult.data) {
      const data = loansResult.data as any;
      if (Array.isArray(data)) {
        loans = data;
      } else if (data.loans && Array.isArray(data.loans)) {
        loans = data.loans;
      } else if (data.id) {
        loans = [data];
      }
    }
    
    // Safely extract transactions data
    let transactions: Transaction[] = [];
    if (transactionsResult.success && transactionsResult.data) {
      const data = transactionsResult.data as any;
      if (Array.isArray(data)) {
        transactions = data;
      } else if (data.transactions && Array.isArray(data.transactions)) {
        transactions = data.transactions;
      }
    }

    // Get active loans count
    const activeLoansCount = loans.filter((l: Loan) => l.status === 'ACTIVE').length;

    return (
      <div className="space-y-8">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-text">
            Welcome back, {user?.firstName || 'Player'}! 👋
          </h1>
          <p className="text-text/60 mt-1">
            Here's your financial overview
          </p>
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
              <p className="text-sm text-text/60">Active Loans</p>
              <p className="text-3xl font-bold text-secondary">
                {activeLoansCount}
              </p>
              {balance?.activeLoan && (
                <p className="text-xs text-text/40">
                  Balance: {formatCurrency(balance.activeLoan.balance)}
                </p>
              )}
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-accent/20 to-accent/5 border-accent/30">
            <div className="space-y-2">
              <p className="text-sm text-text/60">Loan Eligibility</p>
              <p className="text-3xl font-bold text-accent">
                {balance?.isEligibleForLoan ? '✅ Yes' : '⏳ Pending'}
              </p>
              {!balance?.isEligibleForLoan && (
                <p className="text-xs text-text/40">
                  Need 6 months membership
                </p>
              )}
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
            <Suspense fallback={<Loader size="sm" text="Loading transactions..." />}>
              <RecentTransactions transactions={transactions} />
            </Suspense>
          </Card>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Dashboard error:', error);
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-6xl">⚠️</div>
        <h2 className="text-2xl font-bold text-accent">Something went wrong</h2>
        <p className="text-text/60">Failed to load dashboard data. Please try refreshing the page.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-primary text-background rounded-lg hover:bg-primary/80 transition-colors"
        >
          Refresh Page
        </button>
      </div>
    );
  }
}

// Server Component for Recent Transactions
function RecentTransactions({ transactions }: { transactions: Transaction[] }) {
  if (!transactions || transactions.length === 0) {
    return <p className="text-text/60 text-sm">No recent transactions</p>;
  }

  return (
    <div className="space-y-3">
      {transactions.slice(0, 5).map((tx: Transaction) => (
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