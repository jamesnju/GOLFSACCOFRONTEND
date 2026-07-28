import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';

export interface Transaction {
  id: string;
  userId: string;
  walletId: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'LOAN_DISBURSEMENT' | 'LOAN_REPAYMENT' | 'REGISTRATION_FEE';
  amount: number;
  reference: string;
  description?: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  mpesaCode?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  wallet?: {
    id: string;
    balance: number;
  };
}

export interface TransactionHistoryResponse {
  transactions: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface TransactionSummary {
  totalCredits: number;
  totalDebits: number;
  balance: number;
}

export interface StatementResponse {
  transactions: Transaction[];
  summary: TransactionSummary;
}

export interface TransactionQueryParams {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export const transactionApi = {
  // Get transaction history with filters
  getHistory: (params?: TransactionQueryParams) =>
    apiClient.get<TransactionHistoryResponse>(
      API_ENDPOINTS.TRANSACTIONS.HISTORY,
      params,
      {
        cache: true,
        ttl: 1 * 60 * 1000, // 1 minute
      }
    ),

  // Get transaction by reference
  getTransactionByReference: (reference: string) =>
    apiClient.get<Transaction>(
      API_ENDPOINTS.TRANSACTIONS.DETAILS(reference),
      undefined,
      {
        cache: true,
        ttl: 5 * 60 * 1000, // 5 minutes
      }
    ),

  // Get transaction statement (with summary)
  getStatement: (params?: { startDate?: string; endDate?: string }) =>
    apiClient.get<StatementResponse>(
      API_ENDPOINTS.TRANSACTIONS.STATEMENT,
      params,
      {
        cache: true,
        ttl: 5 * 60 * 1000, // 5 minutes
      }
    ),
};