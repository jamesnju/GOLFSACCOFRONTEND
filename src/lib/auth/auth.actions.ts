'use server';

import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth/auth.config';
import { authApi } from '@/lib/api/auth';
import { revalidatePath } from 'next/cache';

export async function getSession() {
  return await getServerSession(authConfig);
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}

export async function getAccessToken() {
  const session = await getSession();
  return session?.accessToken;
}

export async function isAuthenticated() {
  const session = await getSession();
  return !!session?.user;
}

export async function isAdmin() {
  const session = await getSession();
  return session?.user?.role === 'ADMIN';
}

export async function getUserRole() {
  const session = await getSession();
  return session?.user?.role;
}

export async function registerUser(data: any) {
  try {
    const result = await authApi.register(data);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message || error.message || 'Registration failed' };
  }
}

export async function loginUser(data: any) {
  try {
    const result = await authApi.login(data);
    return { success: true, data: result };
  } catch (error: any) {
    // Check if the error is about registration fee
    const errorMessage = error.response?.data?.message || error.message || 'Login failed';
    if (errorMessage.toLowerCase().includes('registration fee') || 
        errorMessage.toLowerCase().includes('activate')) {
      return { 
        success: false, 
        error: 'Account not activated. Please pay the registration fee.',
        requiresPayment: true 
      };
    }
    return { success: false, error: errorMessage };
  }
}