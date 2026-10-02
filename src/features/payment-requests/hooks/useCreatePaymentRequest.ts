import { useState } from 'react';
import {
  createPaymentRequest,
  CreatePaymentRequestPayload,
  PaymentRequest,
} from '@/features/payment-requests/api/payment-requests-api';
import { auth } from '@/lib/firebase';

interface UseCreatePaymentRequestReturn {
  mutate: (payload: CreatePaymentRequestPayload) => Promise<{
    success: boolean;
    data?: PaymentRequest;
    error?: string;
  }>;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
}

export function useCreatePaymentRequest(): UseCreatePaymentRequestReturn {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mutate = async (payload: CreatePaymentRequestPayload) => {
    setIsLoading(true);
    setIsError(false);
    setErrorMessage(null);

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }
      const response = await createPaymentRequest(payload);
      setIsLoading(false);
      return { success: true, data: response.data };
    } catch (error: any) {
      const msg = error.message || 'Failed to create payment request';
      setIsError(true);
      setErrorMessage(msg);
      setIsLoading(false);
      return { success: false, error: msg };
    }
  };

  return { mutate, isLoading, isError, errorMessage };
}
