import { bearerAuth } from '@/lib/auth-client';
import { apiUrl } from '@/lib/api-client';

export interface Contact {
  id: string;
  merchantId: string;
  nickname: string;
  walletAddress: string;
  telephone: string;
  email: string;
  mint: string;
  symbol: string;
  notes: string;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ContactsResponse {
  data: Contact[];
  total?: number;
}

export interface CreateContactPayload {
  nickname: string;
  walletAddress: string;
  telephone?: string;
  email?: string;
  mint: string;
  notes?: string;
  isFavorite?: boolean;
}

export async function getContacts(): Promise<ContactsResponse> {
  const response = await fetch(apiUrl('/contacts'), {
    method: 'GET',
    headers: {
      ...(await bearerAuth()),
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch contacts');
  }

  return response.json();
}

export async function createContact(payload: CreateContactPayload): Promise<{ data: Contact }> {
  const response = await fetch(apiUrl('/contacts'), {
    method: 'POST',
    headers: {
      ...(await bearerAuth()),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to create contact');
  }

  return response.json();
}

export async function updateContact(id: string, payload: Partial<CreateContactPayload>): Promise<{ data: Contact }> {
  const response = await fetch(apiUrl(`/contacts/${id}`), {
    method: 'PATCH',
    headers: {
      ...(await bearerAuth()),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update contact');
  }

  // API returns the direct contact based on the example: response status 200 ok { "id": "...", ... }
  // but let's just return the parsed JSON as `data` for consistency, or return the response JSON as is.
  // Wait, the prompt example says:
  // response status 200 ok { "id": "550...", "merchantId": "abc...", ... }
  // So the response is directly the Contact object, not wrapped in { data: ... }
  const json = await response.json();
  return { data: json };
}

export async function deleteContact(id: string): Promise<{ success: boolean }> {
  const response = await fetch(apiUrl(`/contacts/${id}`), {
    method: 'DELETE',
    headers: {
      ...(await bearerAuth()),
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to delete contact');
  }

  return response.json();
}
