import { useState, useEffect, useCallback, useRef } from 'react';
import { checkPaymentStatus } from '@/lib/actions/payment.actions';
import toast from 'react-hot-toast';

interface PaymentStatus {
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'TIMEOUT' | 'ERROR';
  message?: string;
  payment?: {
    id: string;
    amount: number;
    purpose: string;
    status: string;
    mpesaCode: string | null;
    completedAt: string | null;
  };
}

export function usePaymentStatus(checkoutRequestId: string | null, onComplete?: () => void) {
  const [status, setStatus] = useState<PaymentStatus>({ status: 'PENDING' });
  const [isPolling, setIsPolling] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 20;
  
  // Use refs to track mounted state and prevent infinite loops
  const isMounted = useRef(true);
  const isPollingRef = useRef(false);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const startDelayRef = useRef<NodeJS.Timeout | null>(null);

  const checkStatus = useCallback(async () => {
    if (!checkoutRequestId || !isMounted.current) return false;

    try {
      const result = await checkPaymentStatus(checkoutRequestId);
      
      if (result.success && result.data && isMounted.current) {
        const paymentData = result.data;
        
        if (paymentData.status === 'COMPLETED') {
          setStatus({
            status: 'COMPLETED',
            message: 'Payment completed successfully!',
            payment: paymentData.payment,
          });
          toast.success('Payment completed successfully!');
          if (onComplete) onComplete();
          return true;
        } else if (paymentData.status === 'FAILED') {
          setStatus({
            status: 'FAILED',
            message: paymentData.message || 'Payment failed. Please try again.',
            payment: paymentData.payment,
          });
          toast.error(paymentData.message || 'Payment failed');
          return true;
        } else if (paymentData.status === 'NOT_FOUND') {
          setStatus({
            status: 'ERROR',
            message: 'Payment record not found',
          });
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error checking payment status:', error);
      return false;
    }
  }, [checkoutRequestId, onComplete]);

  const reset = useCallback(() => {
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }
    if (startDelayRef.current) {
      clearTimeout(startDelayRef.current);
      startDelayRef.current = null;
    }
    isPollingRef.current = false;
    setStatus({ status: 'PENDING' });
    setIsPolling(false);
    setAttempts(0);
  }, []);

  useEffect(() => {
    isMounted.current = true;
    
    // Reset everything when checkoutRequestId is null or empty
    if (!checkoutRequestId) {
      reset();
      return;
    }

    // Start polling
    setIsPolling(true);
    isPollingRef.current = true;
    setAttempts(0);
    setStatus({ status: 'PENDING' });

    const poll = async () => {
      if (!isMounted.current || !isPollingRef.current) return;
      
      const isComplete = await checkStatus();
      setAttempts(prev => {
        const newAttempts = prev + 1;
        
        if (isComplete || newAttempts >= maxAttempts) {
          setIsPolling(false);
          isPollingRef.current = false;
          if (newAttempts >= maxAttempts && !isComplete && isMounted.current) {
            setStatus({
              status: 'TIMEOUT',
              message: 'Payment is taking longer than expected. Please check your M-Pesa messages.',
            });
          }
          return newAttempts;
        }

        // Continue polling after 3 seconds
        if (isMounted.current && isPollingRef.current) {
          timeoutIdRef.current = setTimeout(poll, 3000);
        }
        return newAttempts;
      });
    };

    // Start polling after a 2 second delay
    startDelayRef.current = setTimeout(() => {
      if (isMounted.current && isPollingRef.current) {
        poll();
      }
    }, 2000);

    // Cleanup function
    return () => {
      isMounted.current = false;
      isPollingRef.current = false;
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
      if (startDelayRef.current) {
        clearTimeout(startDelayRef.current);
        startDelayRef.current = null;
      }
    };
  }, [checkoutRequestId, checkStatus, reset, maxAttempts]);

  return { status, isPolling, reset };
}