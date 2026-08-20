'use server';

import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth/auth.config';
import { paymentApi } from '@/lib/api/payment';
import { revalidateTag, revalidatePath } from 'next/cache';

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
    
    revalidateTag('wallet', 'default');
    revalidateTag('transactions', 'default');
    revalidatePath('/wallet', 'layout');
    
    return { 
      success: true, 
      data: result,
      checkoutRequestId: result.checkoutRequestId,
      responseCode: result.responseCode,
      responseDescription: result.responseDescription
    };
  } catch (error: any) {
    console.error('Payment initiation error:', error);
    return { 
      success: false, 
      error: error.response?.data?.message || error.message || 'Payment initiation failed' 
    };
  }
}

export async function checkPaymentStatus(checkoutRequestId: string) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.accessToken) {
      return { success: false, error: 'Unauthorized' };
    }

    const result = await paymentApi.checkStatus(checkoutRequestId);
    
    if (result.status === 'COMPLETED') {
      revalidateTag('wallet', 'default');
      revalidateTag('transactions', 'default');
      revalidatePath('/wallet', 'layout');
    }
    
    return { success: true, data: result };
  } catch (error: any) {
    console.error('Status check error:', error);
    return { success: false, error: error.response?.data?.message || error.message };
  }
}