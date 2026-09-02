/**
 * Simulated Firebase Auth for Mock Mode.
 *
 * `@/lib/firebase` swaps its real `auth` export for this object when
 * `NEXT_PUBLIC_USE_MOCK_DATA=true`, so every `auth.currentUser` /
 * `onAuthStateChanged(auth, …)` / `signOut(auth)` call across the app keeps
 * working with a fake "Demo User" session and never touches the network.
 *
 * A soft sign-out is supported (persisted in `sessionStorage`) so the demo can
 * still show the landing / login flow; signing in again is a pure redirect.
 */

import { MOCK_SIGNED_OUT_KEY } from '@/lib/mock/mock-config';

/**
 * Canonical demo identity. Kept here (not in `src/mocks/data`) so that
 * `@/lib/firebase` can reference the mock auth without dragging the full
 * fixtures file into every bundle. `src/mocks/data` re-exports this as
 * `MOCK_USER`.
 */
export const DEMO_IDENTITY = {
  uid: 'mock-demo-user-0001',
  name: 'Demo User',
  email: 'demo@luxorpay.app',
  wallet: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
  status: 'authenticated' as const,
};

type AuthObserver = ((user: MockUser | null) => void) | { next?: (user: MockUser | null) => void };

export interface MockUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  emailVerified: boolean;
  isAnonymous: false;
  providerId: 'mock';
  getIdToken: (forceRefresh?: boolean) => Promise<string>;
  getIdTokenResult: () => Promise<{ token: string; claims: Record<string, unknown> }>;
  reload: () => Promise<void>;
}

export const MOCK_ID_TOKEN = 'mock-id-token.luxor-pay.demo';

export const mockUser: MockUser = {
  uid: DEMO_IDENTITY.uid,
  email: DEMO_IDENTITY.email,
  displayName: DEMO_IDENTITY.name,
  photoURL: null,
  emailVerified: true,
  isAnonymous: false,
  providerId: 'mock',
  getIdToken: async () => MOCK_ID_TOKEN,
  getIdTokenResult: async () => ({ token: MOCK_ID_TOKEN, claims: { mock: true } }),
  reload: async () => {},
};

export function isMockSignedOut(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.sessionStorage.getItem(MOCK_SIGNED_OUT_KEY) === 'true';
  } catch {
    return false;
  }
}

export function markMockSignedOut(): void {
  try {
    window.sessionStorage.setItem(MOCK_SIGNED_OUT_KEY, 'true');
  } catch {
    /* ignore */
  }
}

/** Call from the login flow to restore the simulated session. */
export function clearMockSignedOut(): void {
  try {
    window.sessionStorage.removeItem(MOCK_SIGNED_OUT_KEY);
  } catch {
    /* ignore */
  }
}

function emit(observer: AuthObserver, user: MockUser | null) {
  if (typeof observer === 'function') observer(user);
  else if (observer && typeof observer.next === 'function') observer.next(user);
}

/**
 * Minimal object compatible with how this codebase consumes the modular
 * Firebase Auth API (`currentUser`, `onAuthStateChanged`, `onIdTokenChanged`,
 * `signOut`, `setPersistence`). It is intentionally not a full `Auth`.
 */
export const mockAuth = {
  name: 'mock-auth',
  currentUser: (typeof window === 'undefined' ? mockUser : (isMockSignedOut() ? null : mockUser)) as MockUser | null,

  onAuthStateChanged(nextOrObserver: AuthObserver) {
    const user = isMockSignedOut() ? null : mockUser;
    this.currentUser = user;
    // Match Firebase's async delivery so React effects settle predictably.
    Promise.resolve().then(() => emit(nextOrObserver, user));
    return () => {};
  },

  onIdTokenChanged(nextOrObserver: AuthObserver) {
    return this.onAuthStateChanged(nextOrObserver);
  },

  async signOut() {
    markMockSignedOut();
    this.currentUser = null;
  },

  async setPersistence() {
    /* no-op */
  },

  async updateCurrentUser() {
    /* no-op */
  },
};

export type MockAuth = typeof mockAuth;
