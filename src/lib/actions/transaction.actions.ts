'use server';

import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth/auth.config';
import { transactionApi } from '@/lib/api/transactions';

export async function getTransactionHistory(params?: any) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.accessToken) {
      return { success: false, error: 'Unauthorized' };
    }

    const history = await transactionApi.getHistory(params);
    return { success: true, data: history };
  } catch (error: any) {
    return { success: false, error: error.response?.data || error.message };
  }
}

export async function getTransactionByReference(reference: string) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.accessToken) {
      return { success: false, error: 'Unauthorized' };
    }

    const transaction = await transactionApi.getTransactionByReference(reference);
    return { success: true, data: transaction };
  } catch (error: any) {
    return { success: false, error: error.response?.data || error.message };
  }
}

export async function getTransactionStatement(params?: { startDate?: string; endDate?: string }) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.accessToken) {
      return { success: false, error: 'Unauthorized' };
    }

    const statement = await transactionApi.getStatement(params);
    return { success: true, data: statement };
  } catch (error: any) {
    return { success: false, error: error.response?.data || error.message };
  }
}