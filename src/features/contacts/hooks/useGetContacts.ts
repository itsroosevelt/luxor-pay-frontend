import { useState, useEffect, useCallback } from 'react';
import { getContacts, ContactsResponse } from '@/features/contacts/api/contacts-api';
import { auth } from '@/lib/firebase';
import { MOCK_CONTACTS } from '@/mocks/data';

interface UseGetContactsReturn {
  data: ContactsResponse | null;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  refetch: () => Promise<void>;
}

export function useGetContacts(): UseGetContactsReturn {
  const [data, setData] = useState<ContactsResponse | null>({ data: MOCK_CONTACTS });
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
        setData({ data: MOCK_CONTACTS });
      }
    } catch (error: any) {
      setData({ data: MOCK_CONTACTS });
      setIsError(false);
      setErrorMessage(null);
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
