import { useState, useCallback } from 'react';
import { auth } from '@/lib/firebase';
import { apiUrl } from '@/lib/api-client';

interface KycInitResponse {
  success: boolean;
  client_secret: string;
  url: string;
}

interface UseKycInitReturn {
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  initKyc: (userId: string) => Promise<KycInitResponse | null>;
}

export function useKycInit(): UseKycInitReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const returnUrl = process.env.NEXT_PUBLIC_KYC_RETURN_URL ?? 'https://luxorpay.app/dashboard';

  const initKyc = useCallback(async (userId: string): Promise<KycInitResponse | null> => {
    setIsLoading(true);
    setIsError(false);
    setErrorMessage(null);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const token = await user.getIdToken();

      const res = await fetch(apiUrl('/stripe/kyc/init'), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, returnUrl }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(json.message ?? `KYC init failed (${res.status})`);
      }

      return json as KycInitResponse;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      setIsError(true);
      setErrorMessage(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [returnUrl]);

  return { isLoading, isError, errorMessage, initKyc };
}
