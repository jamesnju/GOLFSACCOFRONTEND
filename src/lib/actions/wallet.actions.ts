'use server';

import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth/auth.config';
import { walletApi } from '@/lib/api/wallet';
import { revalidateTag } from 'next/cache';

export async function getWalletBalance() {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.accessToken) {
      return { success: false, error: 'Unauthorized' };
    }

    const balance = await walletApi.getBalance();
    return { success: true, data: balance };
  } catch (error: any) {
    return { success: false, error: error.response?.data || error.message };
  }
}

export async function depositFunds(data: any) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.accessToken) {
      return { success: false, error: 'Unauthorized' };
    }

    const result = await walletApi.deposit(data);
    revalidateTag('wallet', 'default');
    revalidateTag('transactions', 'default');
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.response?.data || error.message };
  }
}

export async function withdrawFunds(data: any) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.accessToken) {
      return { success: false, error: 'Unauthorized' };
    }

    const result = await walletApi.withdraw(data);
    revalidateTag('wallet', 'default');
    revalidateTag('transactions', 'default');
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.response?.data || error.message };
  }
}