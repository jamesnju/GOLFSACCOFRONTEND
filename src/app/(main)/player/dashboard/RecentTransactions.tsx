import { formatCurrency, formatDate, cn } from '@/lib/utils/helpers';

export async function RecentTransactions() {
  const { getTransactionHistory } = await import('@/lib/actions/transaction.actions');
  const result = await getTransactionHistory({ limit: 5 });
  
  if (!result.success || !result.data?.transactions?.length) {
    return <p className="text-text/60 text-sm">No recent transactions</p>;
  }

  const transactions = result.data.transactions;

  return (
    <div className="space-y-3">
      {transactions.map((tx: any) => (
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