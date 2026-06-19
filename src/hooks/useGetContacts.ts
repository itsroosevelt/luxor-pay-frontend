import { useState, useEffect, useCallback } from 'react';
import { getContacts, ContactsResponse } from '@/lib/contacts-api';
import { auth } from '@/lib/firebase';

interface UseGetContactsReturn {
  data: ContactsResponse | null;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  refetch: () => Promise<void>;
}

export function useGetContacts(): UseGetContactsReturn {
  const [data, setData] = useState<ContactsResponse | null>(null);
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
      
      const token = await user.getIdToken();
      const responseData = await getContacts(token);
      
      setData(responseData);
    } catch (error: any) {
      setIsError(true);
      setErrorMessage(error.message || 'Failed to fetch contacts');
      setData(null);
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
