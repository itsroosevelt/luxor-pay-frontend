import { useState, useCallback } from 'react';
import { bearerAuth } from '@/lib/auth-client';
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


      const res = await fetch(apiUrl('/stripe/kyc/init'), {
        method: 'POST',
        headers: {
          ...(await bearerAuth()),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, returnUrl }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        // Fallback for dev / mock mode when Stripe API keys are not configured in backend
        if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
          return {
            success: true,
            client_secret: 'mock_stripe_client_secret',
            url: 'mock',
          };
        }
        throw new Error(json.message ?? `KYC init failed (${res.status})`);
      }

      const raw = (json.data ?? json) as Record<string, any>;
      return {
        success: true,
        client_secret: raw.client_secret ?? raw.clientSecret ?? raw.sessionId ?? 'mock_secret',
        url: raw.url ?? 'mock',
      };
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
