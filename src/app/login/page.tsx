'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, getMissingFirebaseEnvKeys, isFirebaseConfigured } from '@/lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, Toaster } from 'sonner';
import { SolanaParticles } from '@/components/login/SolanaParticles';

function resolveLoginError(error: unknown): string {
  const err = error as { code?: string; message?: string };
  const code = err?.code ?? '';

  const authMessages: Record<string, string> = {
    'auth/email-already-in-use': 'This email is already registered. Try signing in.',
    'auth/invalid-email': 'Invalid email address.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/invalid-credential': 'Invalid email or password.',
    'auth/popup-closed-by-user': 'Sign-in popup was closed.',
    'auth/unauthorized-domain':
      'Domain not authorized. Firebase Console → Authentication → Authorized domains → add your Vercel URL.',
    'auth/operation-not-allowed':
      'Sign-in method disabled. Firebase Console → Authentication → Sign-in method → enable Email/Password or Google.',
    'auth/api-key-not-valid.-please-pass-a-valid-api-key.':
      'Invalid Firebase API key. Check NEXT_PUBLIC_FIREBASE_API_KEY in Vercel.',
    'auth/invalid-api-key': 'Invalid Firebase API key. Check NEXT_PUBLIC_FIREBASE_API_KEY in Vercel.',
    'permission-denied':
      'Firestore denied access. Enable Firestore in Firebase Console and deploy security rules.',
  };

  if (authMessages[code]) return authMessages[code];
  if (code.startsWith('auth/')) return err.message ?? code;
  if (err.message?.includes('Firebase is not configured')) {
    return 'Firebase is not configured. Missing NEXT_PUBLIC_FIREBASE_* variables in Vercel.';
  }
  if (err.message) return err.message;
  return 'Something went wrong. Open browser DevTools → Console for details.';
}

function LoginContent() {
  const searchParams = useSearchParams();
  const isRegisterParam = searchParams.get('register') === 'true';
  const isLoginParam = searchParams.get('mode') === 'login';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(isRegisterParam || isLoginParam);
  const [isRegistering, setIsRegistering] = useState(isRegisterParam);
  const router = useRouter();
  const missingFirebaseEnv = getMissingFirebaseEnvKeys();

  useEffect(() => {
    if (!isFirebaseConfigured) {
      toast.error(
        `Missing in Vercel (Production env + Redeploy): ${missingFirebaseEnv.join(', ')}`,
        { duration: 12000 }
      );
    }
  }, [missingFirebaseEnv]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const redirect = searchParams.get('redirect');
        router.push(redirect || '/dashboard');
      }
    });
    return () => unsubscribe();
  }, [router, searchParams]);

  const completeAuth = async (user: any) => {
    // Merchant profile creation/fetching is handled by DashboardShell upon redirect
    const redirect = searchParams.get('redirect');
    router.push(redirect || '/dashboard');
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFirebaseConfigured) {
      toast.error('Firebase not configured. Add env vars in Vercel → Production → Redeploy.');
      return;
    }
    setLoading(true);
    try {
      if (isRegistering) {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        toast.success('Merchant account created');
        await completeAuth(cred.user);
      } else {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        toast.success('Welcome back');
        await completeAuth(cred.user);
      }
    } catch (error: unknown) {
      console.error('Login error:', error);
      toast.error(resolveLoginError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!isFirebaseConfigured) {
      toast.error('Firebase not configured. Add env vars in Vercel → Production → Redeploy.');
      return;
    }
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      toast.success('Signed in with Google');
      await completeAuth(cred.user);
    } catch (error: unknown) {
      console.error('Login error:', error);
      toast.error(resolveLoginError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleOutlookLogin = async () => {
    if (!isFirebaseConfigured) {
      toast.error('Firebase not configured. Add env vars in Vercel → Production → Redeploy.');
      return;
    }
    setLoading(true);
    try {
      const provider = new OAuthProvider('microsoft.com');
      const cred = await signInWithPopup(auth, provider);
      toast.success('Signed in with Outlook');
      await completeAuth(cred.user);
    } catch (error: unknown) {
      console.error('Login error:', error);
      toast.error(resolveLoginError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    if (!isFirebaseConfigured) {
      toast.error('Firebase not configured. Add env vars in Vercel → Production → Redeploy.');
      return;
    }
    setLoading(true);
    try {
      const provider = new OAuthProvider('apple.com');
      const cred = await signInWithPopup(auth, provider);
      toast.success('Signed in with Apple');
      await completeAuth(cred.user);
    } catch (error: unknown) {
      console.error('Login error:', error);
      toast.error(resolveLoginError(error));
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full bg-transparent border border-white/10 rounded-full h-12 focus:outline-none focus:border-white text-white placeholder:text-white/25 transition-all text-base tracking-widest px-6 text-center';

  const outlineBtnClass =
    'w-full max-w-sm h-11 rounded-full bg-transparent border border-white/10 text-white/90 hover:bg-transparent hover:border-white font-light text-[20px] tracking-widest transition-all shadow-lg';

  return (
    <div className="min-h-screen bg-black text-white relative flex flex-col items-center justify-center overflow-hidden selection:bg-white/10 font-body font-light">
      <Toaster theme="dark" position="top-center" />
      <SolanaParticles />

      <div className="relative z-[20] w-full flex flex-col items-center justify-center px-6 min-h-screen">
        {!isFirebaseConfigured && (
          <div className="mb-6 max-w-lg w-full rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-xs text-amber-100/90">
            <p className="font-semibold mb-1">Firebase not loaded — variables missing at build time</p>
            <p className="mb-2 opacity-90">
              Vercel → Settings → Environment Variables → mark <strong>Production</strong> → Redeploy.
            </p>
            <ul className="list-disc pl-4 space-y-0.5 font-mono text-[10px]">
              {missingFirebaseEnv.map((key) => (
                <li key={key}>{key}</li>
              ))}
            </ul>
          </div>
        )}
        <AnimatePresence mode="wait">
          {!showForm ? (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full space-y-4 flex flex-col items-center"
            >
              <div className="flex flex-col items-center mb-12 text-center">
                <div className="flex flex-wrap justify-center gap-x-[0.2em] font-semibold tracking-tight text-[40px] md:text-[55px] text-white leading-tight">
                  {'Welcome to'.split(' ').map((word, wordIndex) => (
                    <motion.span
                      key={`welcome-title-${wordIndex}`}
                      initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      transition={{
                        delay: 0.2 + wordIndex * 0.08,
                        duration: 0.6,
                      }}
                      className="inline-block"
                    >
                      {word}
                    </motion.span>
                  ))}
                  <motion.span
                    key="welcome-title-lxr"
                    initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{
                      delay: 0.2 + 2 * 0.08,
                      duration: 0.6,
                    }}
                    className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-[#60A5FA] to-[#2563EB] font-semibold"
                  >
                    Luxor Pay
                  </motion.span>
                </div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  className="text-white/50 text-base mt-4 font-light tracking-wide max-w-md"
                >
                  The next-generation Solana payment gateway
                </motion.p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowForm(true);
                  setIsRegistering(true);
                }}
                className={outlineBtnClass}
              >
                Create merchant account
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowForm(true);
                  setIsRegistering(false);
                }}
                className={outlineBtnClass}
              >
                I already have an account
              </button>

              <button
                type="button"
                onClick={() => router.push('/')}
                className="text-base text-white/40 hover:text-white pt-6 transition-colors tracking-[0.3em] font-light uppercase"
              >
                Return to home
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-xl px-4 space-y-6"
            >
              <div className="text-center px-2 flex flex-col gap-3 min-h-[5rem] justify-center mb-4">
                {(isRegistering
                  ? ['Start accepting Solana payments', 'Create your merchant account']
                  : ['Welcome back', 'Sign in to your dashboard']
                ).map((line, lineIndex) => (
                  <div
                    key={line}
                    className={`flex flex-nowrap justify-center gap-x-[0.2em] font-light tracking-wide whitespace-nowrap ${lineIndex === 0
                        ? 'text-[32px] md:text-[55px] text-white/90 leading-tight'
                        : 'text-base text-white/50 font-light'
                      }`}
                  >
                    {line.split(' ').map((word, wordIndex) => (
                      <motion.span
                        key={`${lineIndex}-${wordIndex}`}
                        initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        transition={{
                          delay: 0.2 + lineIndex * 0.4 + wordIndex * 0.08,
                          duration: 0.6,
                        }}
                        className="inline-block"
                      >
                        {word}
                      </motion.span>
                    ))}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full max-w-sm mx-auto h-11 rounded-full bg-transparent border border-white/10 text-white hover:bg-transparent hover:border-white transition-all flex items-center justify-center gap-3 font-light text-base"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="18" height="18" aria-hidden>
                  <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                  <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                  <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                  <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                </svg>
                Continue with Google
              </button>

              <button
                type="button"
                onClick={handleAppleLogin}
                disabled={loading}
                className="w-full max-w-sm mx-auto h-11 rounded-full bg-transparent border border-white/10 text-white hover:bg-transparent hover:border-white transition-all flex items-center justify-center gap-3 font-light text-base"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden>
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" className="hidden" />
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-.96.04-2.13.64-2.82 1.45-.6.7-1.13 1.84-.99 2.94.1.08.2.12.3.12.87 0 1.9-.53 2.52-1.45z" />
                </svg>
                Continue with Apple
              </button>

              <button
                type="button"
                onClick={handleOutlookLogin}
                disabled={loading}
                className="w-full max-w-sm mx-auto h-11 rounded-full bg-transparent border border-white/10 text-white hover:bg-transparent hover:border-white transition-all flex items-center justify-center gap-3 font-light text-base"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 23 23" width="18" height="18" aria-hidden>
                  <path fill="#f35325" d="M0 0h11v11H0z" />
                  <path fill="#80bb0a" d="M12 0h11v11H12z" />
                  <path fill="#00a4ef" d="M0 12h11v11H0z" />
                  <path fill="#ffb900" d="M12 12h11v11H12z" />
                </svg>
                Continue with Outlook
              </button>

              <div className="relative flex items-center py-2 max-w-sm mx-auto w-full">
                <div className="flex-grow border-t border-white/10" />
                <span className="flex-shrink-0 mx-4 text-white/30 text-[10px] tracking-widest uppercase">
                  Or
                </span>
                <div className="flex-grow border-t border-white/10" />
              </div>

              <form onSubmit={handleEmailLogin} className="space-y-4 max-w-sm mx-auto w-full">
                <input
                  type="email"
                  placeholder="Email"
                  className={inputClass}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
                <input
                  type="password"
                  placeholder="Password"
                  className={inputClass}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete={isRegistering ? 'new-password' : 'current-password'}
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full max-w-sm mx-auto h-11 rounded-full bg-transparent border border-white/10 text-white font-light text-base tracking-wider transition-all hover:bg-transparent hover:border-white hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 mt-2 hover:shadow-[0_0_24px_rgba(255,255,255,0.05)]"
                >
                  {loading ? 'Processing…' : isRegistering ? 'Create account' : 'Sign in'}
                </button>
              </form>

              <p className="text-center text-base text-white/40">
                {isRegistering ? 'Already registered?' : 'New merchant?'}{' '}
                <button
                  type="button"
                  onClick={() => setIsRegistering(!isRegistering)}
                  className="text-[#60A5FA] hover:text-[#2563EB] hover:underline font-light"
                >
                  {isRegistering ? 'Sign in' : 'Create account'}
                </button>
              </p>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="w-full text-center text-base text-white/40 hover:text-white/80 transition-colors tracking-[0.3em] font-light uppercase"
              >
                Go back
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.35 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-[9px] tracking-[0.5em] uppercase text-white/40 whitespace-nowrap z-[20]"
      >
        Luxor Pay · Solana
      </motion.p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <LoginContent />
    </Suspense>
  );
}
