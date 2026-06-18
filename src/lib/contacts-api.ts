import { apiUrl } from './api-client';

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

export async function getContacts(token: string): Promise<ContactsResponse> {
  const response = await fetch(apiUrl('/contacts'), {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch contacts');
  }

  return response.json();
}

export async function createContact(token: string, payload: CreateContactPayload): Promise<{ data: Contact }> {
  const response = await fetch(apiUrl('/contacts'), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
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

export async function updateContact(token: string, id: string, payload: Partial<CreateContactPayload>): Promise<{ data: Contact }> {
  const response = await fetch(apiUrl(`/contacts/${id}`), {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
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

export async function deleteContact(token: string, id: string): Promise<{ success: boolean }> {
  const response = await fetch(apiUrl(`/contacts/${id}`), {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to delete contact');
  }

  return response.json();
}
