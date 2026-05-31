'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { ensureMerchantProfile } from '@/lib/firestore-data';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, Toaster } from 'sonner';
import { SolanaParticles } from '@/components/login/SolanaParticles';

function friendlyAuthError(code: string): string {
  const map: Record<string, string> = {
    'auth/email-already-in-use': 'This email is already registered. Try signing in.',
    'auth/invalid-email': 'Invalid email address.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/invalid-credential': 'Invalid email or password.',
    'auth/popup-closed-by-user': 'Sign-in popup was closed.',
    'auth/unauthorized-domain': 'This domain is not authorized in Firebase. Add it in Firebase Console → Authentication → Authorized domains.',
  };
  return map[code] ?? 'Authentication failed. Please try again.';
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push('/dashboard');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const completeAuth = async (userEmail: string, uid: string) => {
    await ensureMerchantProfile(uid, userEmail);
    router.push('/dashboard');
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegistering) {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        toast.success('Merchant account created');
        await completeAuth(cred.user.email ?? email, cred.user.uid);
      } else {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        toast.success('Welcome back');
        await completeAuth(cred.user.email ?? email, cred.user.uid);
      }
    } catch (error: unknown) {
      const code = (error as { code?: string })?.code ?? '';
      toast.error(friendlyAuthError(code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      toast.success('Signed in with Google');
      await completeAuth(cred.user.email ?? '', cred.user.uid);
    } catch (error: unknown) {
      const code = (error as { code?: string })?.code ?? '';
      toast.error(friendlyAuthError(code));
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full bg-white/5 border border-white/10 rounded-full h-12 focus:outline-none focus:border-[#14f195]/50 text-white placeholder:text-white/25 transition-all text-xs tracking-widest px-6 text-center';

  const outlineBtnClass =
    'w-full max-w-sm h-14 rounded-full bg-white/5 border border-white/10 text-white/90 hover:bg-white/10 font-light text-xs md:text-sm tracking-widest transition-all shadow-lg';

  return (
    <div className="min-h-screen bg-black text-white relative flex flex-col items-center justify-center overflow-hidden selection:bg-white/10">
      <Toaster theme="dark" position="top-center" />
      <SolanaParticles />

      <div className="relative z-[20] w-full flex flex-col items-center justify-center px-6 pb-24 min-h-screen">
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
                <div className="flex flex-wrap justify-center gap-x-[0.25em] text-3xl md:text-5xl font-light tracking-tight text-white leading-[1.15]">
                  {'Welcome to'.split(' ').map((word, i) => (
                    <motion.span
                      key={`w-${i}`}
                      initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      transition={{ delay: 0.2 + i * 0.12, duration: 0.7 }}
                      className="inline-block"
                    >
                      {word}
                    </motion.span>
                  ))}
                </div>
                <div className="flex flex-wrap justify-center gap-x-[0.25em] text-lg md:text-3xl font-semibold tracking-tight mt-2">
                  {'Luxor Pay'.split(' ').map((word, i) => (
                    <motion.span
                      key={`l-${i}`}
                      initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      transition={{ delay: 0.5 + i * 0.12, duration: 0.7 }}
                      className="inline-block text-gradient"
                    >
                      {word}
                    </motion.span>
                  ))}
                </div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="text-white/50 text-sm md:text-base mt-4 font-light tracking-wide"
                >
                  Solana payment gateway for merchants
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
                CREATE MERCHANT ACCOUNT
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowForm(true);
                  setIsRegistering(false);
                }}
                className={`${outlineBtnClass} bg-white/10 backdrop-blur-xl border-white/20 hover:bg-white/20`}
              >
                I ALREADY HAVE AN ACCOUNT
              </button>

              <button
                type="button"
                onClick={() => router.push('/')}
                className="text-[10px] text-white/40 hover:text-white pt-6 transition-colors tracking-[0.3em] font-semibold uppercase"
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
              className="w-full max-w-md px-4 space-y-6"
            >
              <div className="text-center px-2 flex flex-col gap-3 min-h-[5rem] justify-center mb-4">
                {(isRegistering
                  ? ['Start accepting Solana payments', 'Create your merchant account']
                  : ['Welcome back', 'Sign in to your dashboard']
                ).map((line, lineIndex) => (
                  <div
                    key={line}
                    className={`flex flex-wrap justify-center gap-x-[0.2em] font-light tracking-wide ${
                      lineIndex === 0
                        ? 'text-xl md:text-2xl text-white/90'
                        : 'text-base md:text-lg text-white/50'
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
                  className="w-full h-12 rounded-full solana-gradient text-black font-semibold text-sm tracking-wider transition-all hover:opacity-90 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 mt-2 shadow-[0_0_24px_rgba(20,241,149,0.35)]"
                >
                  {loading ? 'Processing…' : isRegistering ? 'Create account' : 'Sign in'}
                </button>
              </form>

              <div className="relative flex items-center py-2 max-w-sm mx-auto w-full">
                <div className="flex-grow border-t border-white/10" />
                <span className="flex-shrink-0 mx-4 text-white/30 text-[10px] tracking-widest uppercase">
                  Or
                </span>
                <div className="flex-grow border-t border-white/10" />
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full max-w-sm mx-auto h-12 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all flex items-center justify-center gap-3 font-medium text-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="18" height="18" aria-hidden>
                  <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                  <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                  <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                  <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                </svg>
                Continue with Google
              </button>

              <p className="text-center text-sm text-white/40">
                {isRegistering ? 'Already registered?' : 'New merchant?'}{' '}
                <button
                  type="button"
                  onClick={() => setIsRegistering(!isRegistering)}
                  className="text-[#14f195] hover:underline font-medium"
                >
                  {isRegistering ? 'Sign in' : 'Create account'}
                </button>
              </p>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="w-full text-center text-[10px] text-white/40 hover:text-white/80 transition-colors tracking-[0.3em] font-semibold uppercase"
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
