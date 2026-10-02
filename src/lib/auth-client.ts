import { auth } from '@/lib/firebase';

/**
 * Single place where the frontend reads the Firebase ID token. API modules call
 * `bearerAuth()` instead of receiving a token from every component/hook.
 */

/** Current user's ID token, or null when nobody is signed in. */
export async function getIdToken(): Promise<string | null> {
  const user = auth?.currentUser;
  if (!user) return null;
  return user.getIdToken();
}

/**
 * `Authorization` header for backend calls. Without a session it sends the
 * `mock-token` placeholder (Mock Mode / demo flows), matching the previous
 * per-hook `tokenOrMock` behaviour; callers that require a session still
 * check `auth.currentUser` before calling the API.
 */
export async function bearerAuth(): Promise<{ Authorization: string }> {
  const token = (await getIdToken()) ?? 'mock-token';
  return { Authorization: `Bearer ${token}` };
}

export async function authHeaders(): Promise<HeadersInit> {
  const token = await getIdToken();
  if (!token) throw new Error('Not authenticated');
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}
