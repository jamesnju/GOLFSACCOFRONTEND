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
    mpesaCode: string | null;
    metadata: {
      reference: string;
      phoneNumber: string;
      responseCode: string;
      merchantRequestId: string;
      responseDescription: string;
    };
    createdAt: string;
  };
  checkoutRequestId: string;
  responseCode: string;
  responseDescription: string;
}

export interface PaymentStatusResponse {
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'NOT_FOUND' | 'ERROR';
  payment?: {
    id: string;
    amount: number;
    purpose: string;
    status: string;
    mpesaCode: string | null;
    completedAt: string | null;
  };
  message: string;
}

export const paymentApi = {
  initiate: (data: InitiatePaymentData) =>
    apiClient.post<PaymentResponse>(API_ENDPOINTS.PAYMENTS.INITIATE, data, {
      invalidateCache: true,
    }),

  checkStatus: (checkoutRequestId: string) =>
    apiClient.get<PaymentStatusResponse>(
      `/payments/status/${checkoutRequestId}`,
      undefined,
      { cache: false }
    ),
};