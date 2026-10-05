import { useState, useEffect, useCallback } from 'react';
import { getContacts, ContactsResponse } from '@/features/contacts/api/contacts-api';
import { auth } from '@/lib/firebase';
import { IS_MOCK_MODE } from '@/lib/mock/mock-config';
import { MOCK_CONTACTS } from '@/mocks/data';

interface UseGetContactsReturn {
  data: ContactsResponse | null;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  refetch: () => Promise<void>;
}

// Demo fixtures only in Mock Mode: in production a failed load must show an error,
// never invented or empty-looking financial data.
const fallback = (): ContactsResponse => ({ data: IS_MOCK_MODE ? MOCK_CONTACTS : [] });

export function useGetContacts(): UseGetContactsReturn {
  const [data, setData] = useState<ContactsResponse | null>(fallback);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchContacts = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setErrorMessage(null);

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const responseData = await getContacts();
      
      if (responseData && Array.isArray(responseData.data) && responseData.data.length > 0) {
        setData(responseData);
      } else {
        setData(fallback());
      }
    } catch (error: any) {
      setData(fallback());
      // A session that is still restoring is not a load failure.
      const failed = !IS_MOCK_MODE && error?.message !== 'User not authenticated';
      setIsError(failed);
      setErrorMessage(failed ? error?.message || 'No se pudieron cargar los contactos' : null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  return {
    data,
    isLoading,
    isError,
    errorMessage,
    refetch: fetchContacts,
  };
}
