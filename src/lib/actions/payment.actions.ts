'use server';

import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth/auth.config';
import { revalidateTag, revalidatePath } from 'next/cache';
import { paymentApi } from '../api/payment';

export async function initiatePayment(data: {
  phoneNumber: string;
  amount: number;
  purpose: 'REGISTRATION' | 'DEPOSIT' | 'LOAN_REPAYMENT';
}) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.accessToken) {
      return { success: false, error: 'Unauthorized' };
    }

    const result = await paymentApi.initiate(data);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message || error.message };
  }
}

export async function checkPaymentStatus(checkoutRequestId: string) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.accessToken) {
      return { success: false, error: 'Unauthorized' };
    }

    // This would need a status check endpoint
    // For now, we'll just return success
    return { success: true, data: { status: 'COMPLETED' } };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message || error.message };
  }
}