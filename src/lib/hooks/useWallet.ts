import useSWR from 'swr';
import { walletApi, WalletBalance } from '../api/wallet';
import { useEffect } from 'react';

export function useWallet() {
  const {
    data: balance,
    error,
    isLoading,
    mutate,
  } = useSWR<WalletBalance>('wallet-balance', walletApi.getBalance, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 30 * 1000, // 30 seconds
    refreshInterval: 60 * 1000, // Refresh every minute
  });

  const refreshBalance = () => mutate();

  return {
    balance,
    isLoading,
    error,
    refreshBalance,
  };
}