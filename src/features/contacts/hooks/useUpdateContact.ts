import { useState } from 'react';
import { updateContact, CreateContactPayload, Contact } from '@/features/contacts/api/contacts-api';
import { auth } from '@/lib/firebase';

interface UseUpdateContactReturn {
  mutate: (id: string, payload: Partial<CreateContactPayload>) => Promise<Contact | null>;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
}

export function useUpdateContact(): UseUpdateContactReturn {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mutate = async (id: string, payload: Partial<CreateContactPayload>) => {
    setIsLoading(true);
    setIsError(false);
    setErrorMessage(null);

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const response = await updateContact(id, payload);
      
      setIsLoading(false);
      return response.data;
    } catch (error: any) {
      setIsError(true);
      setErrorMessage(error.message || 'Failed to update contact');
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
