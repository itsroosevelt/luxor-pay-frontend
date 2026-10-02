import { useState } from 'react';
import { sendTransfer, SendTransferPayload, Transfer } from '@/features/transfers/api/transfers-api';
import { auth } from '@/lib/firebase';
import { useGeolocation } from '@/context/GeolocationContext';

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
  const { latitude, longitude } = useGeolocation();

  const mutate = async (payload: SendTransferPayload) => {
    setIsLoading(true);
    setIsError(false);
    setErrorMessage(null);

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Attach geolocation coordinates when available
      const enrichedPayload: SendTransferPayload = {
        ...payload,
        ...(latitude !== null && longitude !== null
          ? { latitude, longitude }
          : {}),
      };

      const response = await sendTransfer(enrichedPayload);
      
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
