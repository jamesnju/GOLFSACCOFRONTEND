import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';

export interface ApplyLoanData {
  amount: number;
  purpose: string;
  durationMonths: number;
}

export interface ApproveLoanData {
  loanId: string;
  status: 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
}

export const loanApi = {
  checkEligibility: () =>
    apiClient.get(API_ENDPOINTS.LOANS.ELIGIBILITY, undefined, {
      cache: true,
      ttl: 5 * 60 * 1000,
    }),

  apply: (data: ApplyLoanData) =>
    apiClient.post(API_ENDPOINTS.LOANS.APPLY, data, {
      invalidateCache: true,
    }),

  getUserLoans: () =>
    apiClient.get(API_ENDPOINTS.LOANS.USER_LOANS, undefined, {
      cache: true,
      ttl: 2 * 60 * 1000,
    }),

  approve: (data: ApproveLoanData) =>
    apiClient.post(API_ENDPOINTS.LOANS.APPROVE, data, {
      invalidateCache: true,
    }),

  getPending: () =>
    apiClient.get(API_ENDPOINTS.LOANS.PENDING, undefined, {
      cache: true,
      ttl: 1 * 60 * 1000,
    }),
};