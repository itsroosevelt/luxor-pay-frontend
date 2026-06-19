import { useCallback, useEffect, useState } from 'react';

export interface AsyncDataState<T> {
  data: T | null;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  refetch: () => Promise<void>;
}

export function useAsyncData<T>(
  fetcher: () => Promise<T>,
  deps: readonly unknown[] = [],
  enabled = true
): AsyncDataState<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!enabled) return;

    setIsLoading(true);
    setIsError(false);
    setErrorMessage(null);

    try {
      const result = await fetcher();
      setData(result);
    } catch (error) {
      setIsError(true);
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [enabled, fetcher]);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    void (async () => {
      try {
        const result = await fetcher();
        if (cancelled) return;
        setData(result);
        setIsError(false);
        setErrorMessage(null);
      } catch (error) {
        if (cancelled) return;
        setIsError(true);
        setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- caller-controlled fetch deps
  }, [enabled, fetcher, ...deps]);

  return { data, isLoading, isError, errorMessage, refetch };
}
