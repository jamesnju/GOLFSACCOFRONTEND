'use server';

import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth/auth.config';
import { adminApi } from '@/lib/api/admin';
import { revalidateTag, revalidatePath } from 'next/cache';

export async function getDashboardStats() {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.accessToken || session.user.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized' };
    }

    const stats = await adminApi.getDashboard();
    return { success: true, data: stats };
  } catch (error: any) {
    return { success: false, error: error.response?.data || error.message };
  }
}

export async function getAllUsers(params?: { page?: number; limit?: number; search?: string }) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.accessToken || session.user.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized' };
    }

    const users = await adminApi.getUsers(params);
    return { success: true, data: users };
  } catch (error: any) {
    return { success: false, error: error.response?.data || error.message };
  }
}

export async function getUserDetails(userId: string) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.accessToken || session.user.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized' };
    }

    const user = await adminApi.getUserDetails(userId);
    return { success: true, data: user };
  } catch (error: any) {
    return { success: false, error: error.response?.data || error.message };
  }
}

export async function activateUser(userId: string) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.accessToken || session.user.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized' };
    }

    const result = await adminApi.activateUser(userId);
    revalidateTag('users', 'default');
    revalidatePath('/admin/users', 'layout');
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.response?.data || error.message };
  }
}

export async function deactivateUser(userId: string) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.accessToken || session.user.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized' };
    }

    const result = await adminApi.deactivateUser(userId);
    revalidateTag('users', 'default');
    revalidatePath('/admin/users', 'layout');
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.response?.data || error.message };
  }
}

export async function getTransactionAnalytics(filters?: { startDate?: string; endDate?: string }) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.accessToken || session.user.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized' };
    }

    const analytics = await adminApi.getTransactionAnalytics(filters);
    return { success: true, data: analytics };
  } catch (error: any) {
    return { success: false, error: error.response?.data || error.message };
  }
}