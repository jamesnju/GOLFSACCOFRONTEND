'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatCurrency, formatDate, cn } from '@/lib/utils/helpers';
import { getTransactionAnalytics } from '@/lib/actions/admin.actions';
import useSWR from '@/lib/hooks/useSWR';
import { Loader } from '@/components/ui/Loader/Loader';

export default function AdminAnalyticsPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filters, setFilters] = useState<{ startDate?: string; endDate?: string }>({});

  // Create a string key for SWR
  const swrKey = `admin-analytics-${filters.startDate || 'none'}-${filters.endDate || 'none'}`;

  const { data, isLoading, revalidate, error } = useSWR(
    swrKey,
    () => getTransactionAnalytics(filters),
    {
      revalidateOnFocus: false,
      onError: (error) => {
        console.error('Failed to fetch analytics:', error);
      },
    }
  );

  const analytics = data?.success ? data.data : null;

  const applyFilters = () => {
    setFilters({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
  };

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setFilters({});
  };

  const handleRefresh = () => {
    revalidate();
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text">Analytics</h1>
          <p className="text-text/60 mt-1">Financial insights and reports</p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm" disabled={isLoading}>
          {isLoading ? 'Loading...' : '🔄 Refresh'}
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-primary/20">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-text/80 mb-1.5">
              Start Date
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-text/80 mb-1.5">
              End Date
            </label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={applyFilters}>Apply Filters</Button>
            <Button variant="outline" onClick={clearFilters}>
              Clear
            </Button>
          </div>
        </div>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="border-accent/50 bg-accent/5">
          <div className="flex items-center gap-3 text-accent">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-medium">Failed to load analytics</p>
              <p className="text-sm text-text/60">{error.message || 'Please try again'}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh} className="ml-auto">
              Retry
            </Button>
          </div>
        </Card>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader size="lg" />
          <p className="text-text/60 text-sm mt-4">Loading analytics data...</p>
        </div>
      ) : analytics ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Transactions"
              value={analytics.totalTransactions}
              icon="📊"
              color="primary"
            />
            <StatCard
              title="Total Inflow"
              value={formatCurrency(analytics.totalInflow)}
              icon="📈"
              color="secondary"
            />
            <StatCard
              title="Total Outflow"
              value={formatCurrency(analytics.totalOutflow)}
              icon="📉"
              color="accent"
            />
            <StatCard
              title="Net Flow"
              value={formatCurrency(analytics.netFlow)}
              icon="💰"
              color={analytics.netFlow >= 0 ? 'secondary' : 'accent'}
            />
          </div>

          {/* Transactions by Type */}
          <Card className="border-primary/20">
            <h3 className="text-lg font-bold mb-4">Transactions by Type</h3>
            {Object.keys(analytics.byType).length === 0 ? (
              <p className="text-text/60 text-sm">No transaction data available</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(analytics.byType).map(([type, amount]) => {
                  const percentage = analytics.totalInflow > 0 
                    ? (amount as number / analytics.totalInflow) * 100 
                    : 0;
                  return (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-sm text-text/60">{type.replace('_', ' ')}</span>
                      <div className="flex items-center gap-4 flex-1 ml-4">
                        <div className="flex-1 h-2 bg-primary/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(percentage, 100)}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-bold min-w-[100px] text-right">
                          {formatCurrency(amount as number)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Recent Transactions */}
          <Card className="border-primary/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">All Transactions</h3>
              <span className="text-sm text-text/40">
                {analytics.transactions.length} transactions
              </span>
            </div>
            {analytics.transactions.length === 0 ? (
              <p className="text-text/60 text-sm">No transactions found</p>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {analytics.transactions.map((tx: any) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium">{tx.type.replace('_', ' ')}</p>
                      <p className="text-xs text-text/40">{formatDate(tx.createdAt)}</p>
                    </div>
                    <p
                      className={cn(
                        'text-sm font-bold',
                        tx.type === 'DEPOSIT' || tx.type === 'LOAN_DISBURSEMENT'
                          ? 'text-green-500'
                          : 'text-accent'
                      )}
                    >
                      {tx.type === 'DEPOSIT' || tx.type === 'LOAN_DISBURSEMENT' ? '+' : '-'}
                      {formatCurrency(tx.amount)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      ) : (
        <Card className="border-primary/20 p-8 text-center">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-text/60">No data available</p>
          <p className="text-text/40 text-sm mt-1">
            Try adjusting your filters or check back later
          </p>
        </Card>
      )}
    </div>
  );
}

// Stat Card Component
function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string | number;
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
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </Card>
  );
}