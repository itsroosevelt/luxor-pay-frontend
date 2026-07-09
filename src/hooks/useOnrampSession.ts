import { useState, useCallback } from 'react';
import { auth } from '@/lib/firebase';
import { apiUrl } from '@/lib/api-client';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface OnrampSessionResponse {
  client_secret: string;
  session_id: string;
  redirect_url: string;
}

interface UseOnrampSessionReturn {
  data: OnrampSessionResponse | null;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  createSession: (customerId: string, walletAddress: string) => Promise<OnrampSessionResponse | null>;
}


// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useOnrampSession(): UseOnrampSessionReturn {
  const [data, setData] = useState<OnrampSessionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const createSession = useCallback(
    async (customerId: string, walletAddress: string): Promise<OnrampSessionResponse | null> => {
      setIsLoading(true);
      setIsError(false);
      setErrorMessage(null);
      setData(null);

      try {
        const user = auth.currentUser;
        if (!user) throw new Error('User not authenticated');

        const token = await user.getIdToken();

        const res = await fetch(apiUrl('/onramp/create-session'), {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ customerId, walletAddress }),
        });

        const json = await res.json().catch(() => ({}));

        if (!res.ok) {
          // Map known error cases from the API
          const msg =
            json.message ??
            (res.status === 401
              ? 'Missing or invalid Authorization header'
              : res.status === 400
              ? 'Invalid request. Please check your wallet address.'
              : `Onramp session failed (${res.status})`);
          throw new Error(msg);
        }

        const session = json as OnrampSessionResponse;
        setData(session);
        return session;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error occurred';
        setIsError(true);
        setErrorMessage(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return { data, isLoading, isError, errorMessage, createSession };
}
