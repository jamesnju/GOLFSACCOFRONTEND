import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';

export interface DepositData {
  amount: number;
  paymentMethod: 'MPESA' | 'BANK' | 'CASH';
  description?: string;
}

export interface WithdrawData {
  amount: number;
  mpesaNumber?: string;
  bankAccount?: string;
  description?: string;
}

export interface WalletBalance {
  balance: number;
  lockedBalance: number;
  availableBalance: number;
  isEligibleForLoan: boolean;
  activeLoan: {
    id: string;
    amount: number;
    balance: number;
    dueDate: string;
  } | null;
}

export const walletApi = {
  getBalance: () =>
    apiClient.get<WalletBalance>(API_ENDPOINTS.WALLET.BALANCE, undefined, {
      cache: true,
      ttl: 30 * 1000, // 30 seconds for balance
    }),

  deposit: (data: DepositData) =>
    apiClient.post(API_ENDPOINTS.WALLET.DEPOSIT, data, {
      invalidateCache: true,
      cacheKey: API_ENDPOINTS.WALLET.BALANCE,
    }),

  withdraw: (data: WithdrawData) =>
    apiClient.post(API_ENDPOINTS.WALLET.WITHDRAW, data, {
      invalidateCache: true,
      cacheKey: API_ENDPOINTS.WALLET.BALANCE,
    }),
};