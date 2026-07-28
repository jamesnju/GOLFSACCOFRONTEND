'use server';

import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth/auth.config';
import { loanApi } from '@/lib/api/loans';
import { revalidateTag, revalidatePath } from 'next/cache';

export async function checkLoanEligibility() {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.accessToken) {
      return { success: false, error: 'Unauthorized' };
    }

    const eligibility = await loanApi.checkEligibility();
    return { success: true, data: eligibility };
  } catch (error: any) {
    return { success: false, error: error.response?.data || error.message };
  }
}

export async function applyForLoan(data: any) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.accessToken) {
      return { success: false, error: 'Unauthorized' };
    }

    const result = await loanApi.apply(data);
    revalidateTag('loans', 'default');
    revalidateTag('wallet', 'default');
    revalidatePath('/loans', 'layout');
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.response?.data || error.message };
  }
}

export async function getUserLoans() {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.accessToken) {
      return { success: false, error: 'Unauthorized' };
    }

    const result = await loanApi.getUserLoans();
    
    // The result might be the array directly or an object with a data property
    let loansData: any[] = [];
    
    if (result) {
      if (Array.isArray(result)) {
        loansData = result;
      } else if (result.data && Array.isArray(result.data)) {
        loansData = result.data;
      } else if (result.loans && Array.isArray(result.loans)) {
        loansData = result.loans;
      } else if (typeof result === 'object' && result.id) {
        // Single loan object
        loansData = [result];
      }
    }
    
    return { success: true, data: loansData };
  } catch (error: any) {
    return { success: false, error: error.response?.data || error.message };
  }
}

export async function approveLoan(data: any) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.accessToken || session.user.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized' };
    }

    const result = await loanApi.approve(data);
    revalidateTag('loans', 'default');
    revalidateTag('wallet', 'default');
    revalidatePath('/admin/loans', 'layout');
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.response?.data || error.message };
  }
}

export async function getPendingLoans() {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.accessToken || session.user.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized' };
    }

    const result = await loanApi.getPending();
    
    let loansData: any[] = [];
    if (result) {
      if (Array.isArray(result)) {
        loansData = result;
      } else if (result.data && Array.isArray(result.data)) {
        loansData = result.data;
      } else if (result.loans && Array.isArray(result.loans)) {
        loansData = result.loans;
      }
    }
    
    return { success: true, data: loansData };
  } catch (error: any) {
    return { success: false, error: error.response?.data || error.message };
  }
}