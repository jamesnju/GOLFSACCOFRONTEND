import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';

export interface InitiatePaymentData {
  phoneNumber: string;
  amount: number;
  purpose: 'REGISTRATION' | 'DEPOSIT' | 'LOAN_REPAYMENT';
}

export interface PaymentResponse {
  payment: {
    id: string;
    amount: number;
    purpose: string;
    status: string;
    checkoutRequestId: string;
  };
  checkoutRequestId: string;
  responseCode: string;
  responseDescription: string;
}

export const paymentApi = {
  initiate: (data: InitiatePaymentData) =>
    apiClient.post<PaymentResponse>(API_ENDPOINTS.PAYMENTS.INITIATE, data, {
      invalidateCache: true,
    }),

  // This would need a backend endpoint
  checkStatus: (checkoutRequestId: string) =>
    apiClient.get(`/payments/status/${checkoutRequestId}`, undefined, {
      cache: false,
    }),
};