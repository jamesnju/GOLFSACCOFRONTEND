// src/app/(main)/admin/dashboard/page.tsx
import { Suspense } from 'react';
import { getDashboardStats } from '@/lib/actions/admin.actions';
import { Card } from '@/components/ui/Card';
import { formatCurrency, formatDate, cn } from '@/lib/utils/helpers';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth/auth.actions';
import { Loader } from '@/components/ui/Loader/Loader';

// Stat Card Component
function StatCard({
  title,
  value,
  subtitle,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  color: 'primary' | 'secondary' | 'accent';
}) {
  const colorClasses = {
    primary: 'from-primary/20 to-primary/5 border-primary/30',
    secondary: 'from-secondary/20 to-secondary/5 border-secondary/30',
    accent: 'from-accent/20 to-accent/5 border-accent/30',
  };

  return (
    <Card className={`bg-gradient-to-br ${colorClasses[color]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-text/60">{title}</p>
          <p className="text-2xl font-bold text-text">{value}</p>
          {subtitle && (
            <p className="text-xs text-text/40 mt-1">{subtitle}</p>
          )}
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </Card>
  );
}

export default async function AdminDashboardPage() {
  const [statsResult, user] = await Promise.all([
    getDashboardStats(),
    getCurrentUser(),
  ]);

  // Access the data property from the response
  const stats = statsResult.success ? statsResult.data : null;

  // Log the structure for debugging
  console.log('Dashboard stats:', stats);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-text">
          Admin Dashboard, {user?.firstName}! 👋
        </h1>
        <p className="text-text/60 mt-1">
          Overview of your SACCO's performance
        </p>
      </div>

      {/* Stats Grid - Safe access with optional chaining */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats?.users?.total || 0}
          subtitle={`${stats?.users?.active || 0} Active`}
          icon="👥"
          color="primary"
        />
        <StatCard
          title="Total Savings"
          value={formatCurrency(stats?.finances?.totalSavings || 0)}
          icon="💰"
          color="secondary"
        />
        <StatCard
          title="Total Loans"
          value={stats?.finances?.totalLoans || 0}
          subtitle={`${stats?.finances?.activeLoans || 0} Active`}
          icon="📝"
          color="accent"
        />
        <StatCard
          title="Transactions"
          value={stats?.transactions?.total || 0}
          icon="📊"
          color="primary"
        />
      </div>

      {/* Users by Role */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-primary/20">
          <h3 className="text-lg font-bold mb-4">Users by Role</h3>
          <div className="space-y-3">
            {stats?.users?.byRole?.map((role: any) => (
              <div key={role.role} className="flex items-center justify-between">
                <span className="text-sm text-text/60 capitalize">{role.role}</span>
                <div className="flex items-center gap-4">
                  <div className="w-32 h-2 bg-primary/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{
                        width: `${(role._count / (stats?.users?.total || 1)) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-bold">{role._count}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Pending Loans */}
        <Card className="border-primary/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Pending Loans</h3>
            <Link
              href="/admin/loans"
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {stats?.pendingLoans?.length === 0 ? (
              <p className="text-text/60 text-sm">No pending loans</p>
            ) : (
              stats?.pendingLoans?.slice(0, 5).map((loan: any) => (
                <div
                  key={loan.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-primary/5"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {loan.user?.firstName} {loan.user?.lastName}
                    </p>
                    <p className="text-xs text-text/40">
                      {formatDate(loan.applicationDate)}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-primary">
                    {formatCurrency(loan.amount)}
                  </p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="border-primary/20">
        <h3 className="text-lg font-bold mb-4">Recent Transactions</h3>
        <Suspense fallback={<Loader size="sm" />}>
          <div className="space-y-3">
            {stats?.transactions?.recent?.length === 0 ? (
              <p className="text-text/60 text-sm">No recent transactions</p>
            ) : (
              stats?.transactions?.recent?.slice(0, 5).map((tx: any) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-primary/5"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {tx.user?.firstName} {tx.user?.lastName}
                    </p>
                    <p className="text-xs text-text/40">
                      {formatDate(tx.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={cn(
                        'text-sm font-bold',
                        tx.type === 'DEPOSIT' || tx.type === 'LOAN_DISBURSEMENT'
                          ? 'text-green-500'
                          : 'text-accent'
                      )}
                    >
                      {tx.type === 'DEPOSIT' || tx.type === 'LOAN_DISBURSEMENT' 
                        ? '+' 
                        : '-'}
                      {formatCurrency(tx.amount)}
                    </p>
                    <p className="text-xs text-text/40">{tx.type}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Suspense>
      </Card>
    </div>
  );
}