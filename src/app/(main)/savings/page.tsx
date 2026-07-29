'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatCurrency, formatDate, cn } from '@/lib/utils/helpers';
import { useTransactions } from '@/lib/hooks/useTransactions';
import { useWallet } from '@/lib/hooks/useWallet';
import { Loader } from '@/components/ui/Loader/Loader';

export default function TransactionsPage() {
  const { transactions, isLoading, refreshTransactions } = useTransactions();
  const { balance } = useWallet();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader size="lg" text="Loading transactions..." />
      </div>
    );
  }

  const allTransactions = transactions?.transactions || [];
  const pagination = transactions?.pagination;

  // Filter transactions
  let filteredTransactions = allTransactions;
  
  if (searchTerm) {
    filteredTransactions = filteredTransactions.filter(
      (tx: any) =>
        tx.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.reference?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  
  if (filterType) {
    filteredTransactions = filteredTransactions.filter(
      (tx: any) => tx.type === filterType
    );
  }
  
  if (filterStatus) {
    filteredTransactions = filteredTransactions.filter(
      (tx: any) => tx.status === filterStatus
    );
  }

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / limit);
  const paginatedTransactions = filteredTransactions.slice(
    (page - 1) * limit,
    page * limit
  );

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      DEPOSIT: '💰',
      WITHDRAWAL: '🏦',
      LOAN_DISBURSEMENT: '📝',
      LOAN_REPAYMENT: '✅',
      REGISTRATION_FEE: '📋',
    };
    return icons[type] || '📊';
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text">Transactions</h1>
          <p className="text-text/60 mt-1">View your complete transaction history</p>
        </div>
        <Button variant="outline" onClick={refreshTransactions}>
          🔄 Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-primary/20">
          <p className="text-sm text-text/60">Total Balance</p>
          <p className="text-2xl font-bold text-primary">
            {formatCurrency(balance?.balance || 0)}
          </p>
        </Card>
        <Card className="border-primary/20">
          <p className="text-sm text-text/60">Total Transactions</p>
          <p className="text-2xl font-bold text-secondary">
            {filteredTransactions.length}
          </p>
        </Card>
        <Card className="border-primary/20">
          <p className="text-sm text-text/60">Active Loans</p>
          <p className="text-2xl font-bold text-accent">
            {allTransactions.filter((tx: any) => tx.type === 'LOAN_DISBURSEMENT').length}
          </p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-primary/20">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Search by description or reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2.5 bg-background/50 border border-primary/20 rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">All Types</option>
            <option value="DEPOSIT">Deposit</option>
            <option value="WITHDRAWAL">Withdrawal</option>
            <option value="LOAN_DISBURSEMENT">Loan Disbursement</option>
            <option value="LOAN_REPAYMENT">Loan Repayment</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 bg-background/50 border border-primary/20 rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">All Status</option>
            <option value="COMPLETED">Completed</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </select>
          <Button variant="outline" onClick={() => {
            setSearchTerm('');
            setFilterType('');
            setFilterStatus('');
          }}>
            Clear Filters
          </Button>
        </div>
      </Card>

      {/* Transactions List */}
      <Card className="border-primary/20 overflow-hidden">
        {paginatedTransactions.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-4xl mb-4">📭</div>
            <p className="text-text/60">No transactions found</p>
            <p className="text-text/40 text-sm mt-1">
              {searchTerm || filterType || filterStatus 
                ? 'Try adjusting your filters'
                : 'Start saving or apply for a loan to see transactions here'}
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
                  {paginatedTransactions.map((tx: any) => (
                    <tr
                      key={tx.id}
                      className="border-b border-primary/5 hover:bg-primary/5 transition-colors"
                    >
                      <td className="p-4 text-sm text-text/60">
                        {formatDate(tx.createdAt)}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span>{getTypeIcon(tx.type)}</span>
                          <span className="text-sm font-medium">
                            {tx.type.replace('_', ' ')}
                          </span>
                        </div>
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
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-primary/10">
                <p className="text-sm text-text/60">
                  Showing {((page - 1) * limit) + 1} -{' '}
                  {Math.min(page * limit, filteredTransactions.length)} of{' '}
                  {filteredTransactions.length} transactions
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-text/60">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
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