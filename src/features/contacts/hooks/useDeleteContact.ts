import { useState } from 'react';
import { deleteContact } from '@/features/contacts/api/contacts-api';
import { auth } from '@/lib/firebase';

interface UseDeleteContactReturn {
  mutate: (id: string) => Promise<boolean>;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
}

export function useDeleteContact(): UseDeleteContactReturn {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mutate = async (id: string) => {
    setIsLoading(true);
    setIsError(false);
    setErrorMessage(null);

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      await deleteContact(id);
      
      setIsLoading(false);
      return true;
    } catch (error: any) {
      setIsError(true);
      setErrorMessage(error.message || 'Failed to delete contact');
      setIsLoading(false);
      return false;
    }
  };

  return {
    mutate,
    isLoading,
    isError,
    errorMessage,
  };
}
