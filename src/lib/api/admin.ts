// src/lib/api/admin.ts
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

// API Response wrapper
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
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
  // Get dashboard statistics - extract the data property from the response
  getDashboard: () =>
    apiClient.get<ApiResponse<AdminDashboardStats>>(API_ENDPOINTS.ADMIN.DASHBOARD, undefined, {
      cache: true,
      ttl: 2 * 60 * 1000, // 2 minutes
    }).then(response => response.data), // <-- Extract the data property

  // Get all users with pagination
  getUsers: (params?: { page?: number; limit?: number; search?: string }) =>
    apiClient.get<ApiResponse<UsersResponse>>(API_ENDPOINTS.ADMIN.USERS, params, {
      cache: true,
      ttl: 1 * 60 * 1000, // 1 minute
    }).then(response => response.data),

  // Get user details by ID
  getUserDetails: (userId: string) =>
    apiClient.get<ApiResponse<User>>(API_ENDPOINTS.ADMIN.USER_DETAILS(userId), undefined, {
      cache: true,
      ttl: 5 * 60 * 1000, // 5 minutes
    }).then(response => response.data),

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
    apiClient.get<ApiResponse<TransactionAnalytics>>(
      API_ENDPOINTS.ADMIN.TRANSACTION_ANALYTICS,
      params,
      {
        cache: true,
        ttl: 5 * 60 * 1000, // 5 minutes
      }
    ).then(response => response.data),
};