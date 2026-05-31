import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

/** Strip accidental whitespace from Vercel copy-paste (tabs/newlines break Firebase iframe URLs). */
function env(name: string): string | undefined {
  const raw = process.env[name];
  if (raw == null) return undefined;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export const firebaseConfig = {
  apiKey: env('NEXT_PUBLIC_FIREBASE_API_KEY'),
  authDomain: env('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'),
  projectId: env('NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
  storageBucket: env('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: env('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
  appId: env('NEXT_PUBLIC_FIREBASE_APP_ID'),
  measurementId: env('NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID'),
};

// Initialize Firebase App
let app: any;
let db: any;
let auth: any;

if (firebaseConfig.apiKey) {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  db = getFirestore(app);
  auth = getAuth(app);
} else {
  // Mock for SSR build step when no ENV variables are present
  app = null;
  db = null;
  auth = {
    onAuthStateChanged: () => () => {},
    signOut: async () => {},
    currentUser: null
  };
}

export { app, db, auth };
