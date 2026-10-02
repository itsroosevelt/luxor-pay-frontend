import { useState } from 'react';
import { createContact, CreateContactPayload, Contact } from '@/features/contacts/api/contacts-api';
import { auth } from '@/lib/firebase';

interface UseCreateContactReturn {
  mutate: (payload: CreateContactPayload) => Promise<Contact | null>;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
}

export function useCreateContact(): UseCreateContactReturn {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mutate = async (payload: CreateContactPayload) => {
    setIsLoading(true);
    setIsError(false);
    setErrorMessage(null);

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const response = await createContact(payload);
      
      setIsLoading(false);
      return response.data;
    } catch (error: any) {
      setIsError(true);
      setErrorMessage(error.message || 'Failed to create contact');
      setIsLoading(false);
      return null;
    }
  };

  return {
    mutate,
    isLoading,
    isError,
    errorMessage,
  };
}
