import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';

export interface AdminDashboardStats {
  users: {
    total: number;
    active: number;
    byRole: Array<{
      role: string;
      _count: number;
    }>;
  };
  finances: {
    totalSavings: number;
    totalLoans: number;
    activeLoans: number;
  };
  transactions: {
    total: number;
    recent: Array<{
      id: string;
      type: string;
      amount: number;
      user: {
        firstName: string;
        lastName: string;
      };
      createdAt: string;
    }>;
  };
  pendingLoans: Array<{
    id: string;
    amount: number;
    user: {
      firstName: string;
      lastName: string;
    };
    applicationDate: string;
  }>;
}

export interface User {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  joinDate: string;
  wallet?: {
    balance: number;
    lockedBalance: number;
  };
  _count?: {
    transactions: number;
    loans: number;
  };
}

export interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface TransactionAnalytics {
  totalTransactions: number;
  totalInflow: number;
  totalOutflow: number;
  netFlow: number;
  byType: Record<string, number>;
  transactions: Array<{
    id: string;
    type: string;
    amount: number;
    createdAt: string;
  }>;
}

export const adminApi = {
  // Get dashboard statistics
  getDashboard: () =>
    apiClient.get<AdminDashboardStats>(API_ENDPOINTS.ADMIN.DASHBOARD, undefined, {
      cache: true,
      ttl: 2 * 60 * 1000, // 2 minutes
    }),

  // Get all users with pagination
  getUsers: (params?: { page?: number; limit?: number; search?: string }) =>
    apiClient.get<UsersResponse>(API_ENDPOINTS.ADMIN.USERS, params, {
      cache: true,
      ttl: 1 * 60 * 1000, // 1 minute
    }),

  // Get user details by ID
  getUserDetails: (userId: string) =>
    apiClient.get<User>(API_ENDPOINTS.ADMIN.USER_DETAILS(userId), undefined, {
      cache: true,
      ttl: 5 * 60 * 1000, // 5 minutes
    }),

  // Activate a user
  activateUser: (userId: string) =>
    apiClient.post(
      API_ENDPOINTS.ADMIN.ACTIVATE_USER(userId),
      {},
      {
        invalidateCache: true,
        cacheKey: API_ENDPOINTS.ADMIN.USERS,
      }
    ),

  // Deactivate a user
  deactivateUser: (userId: string) =>
    apiClient.post(
      API_ENDPOINTS.ADMIN.DEACTIVATE_USER(userId),
      {},
      {
        invalidateCache: true,
        cacheKey: API_ENDPOINTS.ADMIN.USERS,
      }
    ),

  // Get transaction analytics
  getTransactionAnalytics: (params?: { startDate?: string; endDate?: string }) =>
    apiClient.get<TransactionAnalytics>(
      API_ENDPOINTS.ADMIN.TRANSACTION_ANALYTICS,
      params,
      {
        cache: true,
        ttl: 5 * 60 * 1000, // 5 minutes
      }
    ),
};