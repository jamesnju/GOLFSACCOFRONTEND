'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate, cn } from '@/lib/utils/helpers';
import { getTransactionHistory } from '@/lib/actions/transaction.actions';
import useSWR from '@/lib/hooks/useSWR';
import { Loader } from '@/components/ui/Loader/Loader';

export default function PlayerTransactionsPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    startDate: '',
    endDate: '',
  });

  // Create a string key for SWR
  const swrKey = `transactions-${page}-${filters.type}-${filters.status}-${filters.startDate}-${filters.endDate}`;

  const { data, isLoading, revalidate, error } = useSWR(
    swrKey,
    () => getTransactionHistory({ page, limit: 10, ...filters }),
    { 
      revalidateOnFocus: false,
      onError: (error) => {
        console.error('Failed to fetch transactions:', error);
      }
    }
  );

  const transactions = data?.success ? data.data?.transactions || [] : [];
  const pagination = data?.success ? data.data?.pagination : null;

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      status: '',
      startDate: '',
      endDate: '',
    });
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRefresh = () => {
    revalidate();
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text">Transactions</h1>
          <p className="text-text/60 mt-1">View your transaction history</p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm" disabled={isLoading}>
          {isLoading ? 'Loading...' : '🔄 Refresh'}
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-primary/20">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[120px]">
            <label className="block text-sm font-medium text-text/80 mb-1.5">Type</label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full px-4 py-2.5 bg-background/50 border border-primary/20 rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">All</option>
              <option value="DEPOSIT">Deposit</option>
              <option value="WITHDRAWAL">Withdrawal</option>
              <option value="LOAN_DISBURSEMENT">Loan Disbursement</option>
              <option value="LOAN_REPAYMENT">Loan Repayment</option>
            </select>
          </div>
          <div className="flex-1 min-w-[120px]">
            <label className="block text-sm font-medium text-text/80 mb-1.5">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-4 py-2.5 bg-background/50 border border-primary/20 rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">All</option>
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
          <div className="flex-1 min-w-[130px]">
            <label className="block text-sm font-medium text-text/80 mb-1.5">Start Date</label>
            <Input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
          </div>
          <div className="flex-1 min-w-[130px]">
            <label className="block text-sm font-medium text-text/80 mb-1.5">End Date</label>
            <Input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </div>
          <div className="flex gap-2">
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
              <p className="font-medium">Failed to load transactions</p>
              <p className="text-sm text-text/60">{error.message || 'Please try again'}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh} className="ml-auto">
              Retry
            </Button>
          </div>
        </Card>
      )}

      {/* Transactions List */}
      <Card className="border-primary/20 overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader size="lg" />
            <p className="text-text/60 text-sm mt-4">Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-4xl mb-4">📭</div>
            <p className="text-text/60">No transactions found</p>
            <p className="text-text/40 text-sm mt-1">
              Try adjusting your filters or make a deposit to get started
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-primary/10">
                    <th className="text-left p-4 text-sm font-medium text-text/60">Date</th>
                    <th className="text-left p-4 text-sm font-medium text-text/60">Type</th>
                    <th className="text-left p-4 text-sm font-medium text-text/60">Description</th>
                    <th className="text-left p-4 text-sm font-medium text-text/60">Reference</th>
                    <th className="text-right p-4 text-sm font-medium text-text/60">Amount</th>
                    <th className="text-center p-4 text-sm font-medium text-text/60">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx: any) => (
                    <tr
                      key={tx.id}
                      className="border-b border-primary/5 hover:bg-primary/5 transition-colors"
                    >
                      <td className="p-4 text-sm text-text/60">
                        {formatDate(tx.createdAt)}
                      </td>
                      <td className="p-4">
                        <span className="text-sm font-medium">
                          {tx.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-text/60">
                        {tx.description || '-'}
                      </td>
                      <td className="p-4 text-sm text-text/60">
                        <span className="font-mono text-xs">
                          {tx.reference}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <span
                          className={cn(
                            'font-bold',
                            tx.type === 'DEPOSIT' || tx.type === 'LOAN_DISBURSEMENT'
                              ? 'text-green-500'
                              : 'text-accent'
                          )}
                        >
                          {tx.type === 'DEPOSIT' || tx.type === 'LOAN_DISBURSEMENT' ? '+' : '-'}
                          {formatCurrency(tx.amount)}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={cn(
                            'px-2 py-1 rounded-full text-xs font-medium',
                            tx.status === 'COMPLETED'
                              ? 'bg-green-500/20 text-green-500'
                              : tx.status === 'PENDING'
                              ? 'bg-yellow-500/20 text-yellow-500'
                              : 'bg-accent/20 text-accent'
                          )}
                        >
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-primary/10">
                <p className="text-sm text-text/60">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} -{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} transactions
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page <= 1}
                    onClick={() => handlePageChange(page - 1)}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-text/60">
                    Page {page} of {pagination.pages}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page >= pagination.pages}
                    onClick={() => handlePageChange(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}