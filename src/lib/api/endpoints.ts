export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    REFRESH_TOKEN: '/auth/refresh-token',
    PROFILE: '/auth/profile',
  },
  // Wallet
  WALLET: {
    BALANCE: '/wallets/balance',
    DEPOSIT: '/wallets/deposit',
    WITHDRAW: '/wallets/withdraw',
  },
  // Transactions
  TRANSACTIONS: {
    HISTORY: '/transactions/history',
    DETAILS: (reference: string) => `/transactions/${reference}`,
    STATEMENT: '/transactions/statement',
  },
  // Loans
  LOANS: {
    APPLY: '/loans/apply',
    APPROVE: '/loans/approve',
    USER_LOANS: '/loans/user',
    PENDING: '/loans/pending',
    ELIGIBILITY: '/loans/eligibility',
  },
  // Payments
  PAYMENTS: {
    INITIATE: '/payments/initiate',
    CALLBACK: '/payments/mpesa-callback',
  },
  // Admin
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    USER_DETAILS: (userId: string) => `/admin/users/${userId}`,
    ACTIVATE_USER: (userId: string) => `/admin/users/${userId}/activate`,
    DEACTIVATE_USER: (userId: string) => `/admin/users/${userId}/deactivate`,
    TRANSACTION_ANALYTICS: '/admin/analytics/transactions',
  },
} as const;