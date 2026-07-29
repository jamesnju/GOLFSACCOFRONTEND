import useSWR from './useSWR';
import { transactionApi, TransactionHistoryResponse } from '../api/transactions';

export function useTransactions() {
  const {
    data: transactions,
    error,
    isLoading,
    isValidating,
    mutate,
    revalidate,
  } = useSWR<TransactionHistoryResponse>(
    'transactions',
    () => transactionApi.getHistory({ limit: 100 }),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 30 * 1000, // 30 seconds
      refreshInterval: 60 * 1000, // Refresh every minute
      onError: (err) => {
        console.error('Failed to fetch transactions:', err);
      },
    }
  );

  const refreshTransactions = () => revalidate();

  return {
    transactions,
    isLoading,
    isValidating,
    error,
    refreshTransactions,
    mutate,
  };
}

export default useTransactions;