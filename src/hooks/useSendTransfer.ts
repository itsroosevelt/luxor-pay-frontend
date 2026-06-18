import { useState } from 'react';
import { sendTransfer, SendTransferPayload, Transfer } from '@/lib/transfers-api';
import { auth } from '@/lib/firebase';

interface UseSendTransferReturn {
  mutate: (payload: SendTransferPayload) => Promise<{ success: boolean; data?: Transfer; error?: string }>;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
}

export function useSendTransfer(): UseSendTransferReturn {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mutate = async (payload: SendTransferPayload) => {
    setIsLoading(true);
    setIsError(false);
    setErrorMessage(null);

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const token = await user.getIdToken();
      const response = await sendTransfer(token, payload);
      
      setIsLoading(false);
      return { success: true, data: response.data };
    } catch (error: any) {
      const msg = error.message || 'Failed to process transfer';
      setIsError(true);
      setErrorMessage(msg);
      setIsLoading(false);
      return { success: false, error: msg };
    }
  };

  return {
    mutate,
    isLoading,
    isError,
    errorMessage,
  };
}
