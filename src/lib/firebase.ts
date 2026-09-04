import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { IS_MOCK_MODE } from '@/lib/mock/mock-config';
import { mockAuth } from '@/lib/mock/mock-auth';

/** Strip accidental whitespace from Vercel copy-paste (tabs/newlines break Firebase iframe URLs). */
function trimEnv(raw: string | undefined): string | undefined {
  if (raw == null) return undefined;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

// Must use static process.env.NEXT_PUBLIC_* — dynamic process.env[name] is NOT inlined at build time.
export const firebaseConfig = {
  apiKey: trimEnv(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
  authDomain: trimEnv(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
  projectId: trimEnv(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
  storageBucket: trimEnv(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: trimEnv(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
  appId: trimEnv(process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
  measurementId: trimEnv(process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID),
};

const REQUIRED_ENV_KEYS = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
] as const;

/** Which NEXT_PUBLIC_FIREBASE_* vars were absent at build time (names only, safe to show in UI). */
export function getMissingFirebaseEnvKeys(): string[] {
  const values: Record<(typeof REQUIRED_ENV_KEYS)[number], string | undefined> = {
    NEXT_PUBLIC_FIREBASE_API_KEY: firebaseConfig.apiKey,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: firebaseConfig.authDomain,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: firebaseConfig.projectId,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: firebaseConfig.storageBucket,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: firebaseConfig.messagingSenderId,
    NEXT_PUBLIC_FIREBASE_APP_ID: firebaseConfig.appId,
  };
  return REQUIRED_ENV_KEYS.filter((key) => !values[key]);
}

const hasRealFirebaseEnv = getMissingFirebaseEnvKeys().length === 0;
export const isFirebaseConfigured = hasRealFirebaseEnv || IS_MOCK_MODE;

// Initialize Firebase App
let app: any;
let db: any;
let auth: any;

if (IS_MOCK_MODE) {
  // In Mock Mode: use mockAuth for simulated demo auth without backend/Firebase requirement
  app = null;
  db = null;
  auth = mockAuth;
} else if (hasRealFirebaseEnv) {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  db = getFirestore(app);
  auth = getAuth(app);
} else {
  app = null;
  db = null;
  auth = mockAuth;
}

export { app, db, auth };
