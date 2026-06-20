import { apiUrl } from './api-client';
import { getCurrentMerchantId } from '@/lib/frontend-only';

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

const LOCAL_CONTACTS_KEY = 'luxor_local_contacts';

function getLocalContacts(merchantId: string): Contact[] {
  if (typeof window === 'undefined') return [];
  const str = localStorage.getItem(`${LOCAL_CONTACTS_KEY}_${merchantId}`);
  return str ? JSON.parse(str) : [];
}

function saveLocalContacts(merchantId: string, contacts: Contact[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`${LOCAL_CONTACTS_KEY}_${merchantId}`, JSON.stringify(contacts));
}

export async function getContacts(token: string): Promise<ContactsResponse> {
  const merchantId = getCurrentMerchantId() || 'default_merchant';
  try {
    const response = await fetch(apiUrl('/contacts'), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      return await response.json();
    } else {
      throw new Error(`API returned status ${response.status}`);
    }
  } catch (e) {
    console.warn('Backend contacts API not available, using local storage fallback:', e);
    return { data: getLocalContacts(merchantId) };
  }
}

export async function createContact(token: string, payload: CreateContactPayload): Promise<{ data: Contact }> {
  const merchantId = getCurrentMerchantId() || 'default_merchant';
  try {
    const response = await fetch(apiUrl('/contacts'), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      return await response.json();
    } else {
      throw new Error(`API returned status ${response.status}`);
    }
  } catch (e) {
    console.warn('Backend contacts API not available, using local storage fallback:', e);
    const contacts = getLocalContacts(merchantId);
    const newContact: Contact = {
      id: `con_${Math.random().toString(36).substring(2, 11)}`,
      merchantId,
      nickname: payload.nickname,
      walletAddress: payload.walletAddress,
      telephone: payload.telephone || '',
      email: payload.email || '',
      mint: payload.mint,
      symbol: payload.mint.includes('USDC') ? 'USDC' : 'SOL',
      notes: payload.notes || '',
      isFavorite: payload.isFavorite || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveLocalContacts(merchantId, [newContact, ...contacts]);
    return { data: newContact };
  }
}

export async function updateContact(token: string, id: string, payload: Partial<CreateContactPayload>): Promise<{ data: Contact }> {
  const merchantId = getCurrentMerchantId() || 'default_merchant';
  try {
    const response = await fetch(apiUrl(`/contacts/${id}`), {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const json = await response.json();
      return { data: json };
    } else {
      throw new Error(`API returned status ${response.status}`);
    }
  } catch (e) {
    console.warn('Backend contacts API not available, using local storage fallback:', e);
    const contacts = getLocalContacts(merchantId);
    const idx = contacts.findIndex(c => c.id === id);
    if (idx === -1) throw new Error('Contact not found');
    const updatedContact = {
      ...contacts[idx],
      ...payload,
      updatedAt: new Date().toISOString(),
    };
    contacts[idx] = updatedContact;
    saveLocalContacts(merchantId, contacts);
    return { data: updatedContact };
  }
}

export async function deleteContact(token: string, id: string): Promise<{ success: boolean }> {
  const merchantId = getCurrentMerchantId() || 'default_merchant';
  try {
    const response = await fetch(apiUrl(`/contacts/${id}`), {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.ok) {
      return await response.json();
    } else {
      throw new Error(`API returned status ${response.status}`);
    }
  } catch (e) {
    console.warn('Backend contacts API not available, using local storage fallback:', e);
    const contacts = getLocalContacts(merchantId);
    const filtered = contacts.filter(c => c.id !== id);
    saveLocalContacts(merchantId, filtered);
    return { success: true };
  }
}
