'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Check, Nfc, QrCode, Zap } from 'lucide-react';

const STEP_MS = 2600;
const STEPS = ['scan', 'tap', 'confirm', 'paid'] as const;
type Step = (typeof STEPS)[number];

interface PaymentPhoneAnimationProps {
  brandName?: string;
  className?: string;
}

function PhoneScreen({ step }: { step: Step }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={step}
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -12, scale: 0.97 }}
        transition={{ duration: 0.35 }}
        className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
      >
        {step === 'scan' && (
          <>
            <div className="relative flex h-40 w-40 items-center justify-center rounded-2xl border border-white/15 bg-white/5">
              <QrCode size={96} className="text-white/90" strokeWidth={1.2} />
              <motion.span
                className="absolute inset-x-3 h-0.5 rounded bg-cyan-300 shadow-[0_0_12px_#67e8f9]"
                animate={{ top: ['12%', '86%', '12%'] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
            <p className="mt-6 text-sm font-medium text-white">Review payment</p>
            <p className="mt-1 text-xs text-zinc-400">Invoice detected</p>
          </>
        )}

        {step === 'tap' && (
          <>
            <div className="relative flex h-40 w-40 items-center justify-center">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="absolute rounded-full border border-cyan-300/60"
                  initial={{ width: 50, height: 50, opacity: 0.8 }}
                  animate={{ width: 160, height: 160, opacity: 0 }}
                  transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.5, ease: 'easeOut' }}
                />
              ))}
              <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 shadow-[0_0_30px_rgba(34,211,238,0.5)]">
                <Nfc size={30} className="text-white" />
              </div>
            </div>
            <p className="mt-6 text-sm font-medium text-white">Approve</p>
            <p className="mt-1 text-xs text-zinc-400">Signer 2 of 3 required</p>
          </>
        )}

        {step === 'confirm' && (
          <>
            <motion.div
              className="h-16 w-16 rounded-full border-2 border-white/15 border-t-fuchsia-400"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
            />
            <p className="mt-6 text-sm font-medium text-white">Confirming payment</p>
            <p className="mt-1 text-xs text-zinc-400 font-mono">Solana · $USDX</p>
          </>
        )}

        {step === 'paid' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 14 }}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-400/20 ring-2 ring-emerald-400/60 shadow-[0_0_30px_rgba(52,211,153,0.45)]"
            >
              <Check size={34} className="text-emerald-300" strokeWidth={3} />
            </motion.div>
            <p className="mt-5 text-base font-semibold text-white">Payment complete</p>
            <div className="mt-4 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-left text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Vendor invoice #2041</span>
                <span className="font-mono">$1,200.00 USDX</span>
              </div>
              <div className="mt-1 flex justify-between text-cyan-300">
                <span>Approvals</span>
                <span className="font-mono">3 of 3 signed</span>
              </div>
              <div className="mt-2 flex justify-between border-t border-white/10 pt-2 text-white font-semibold">
                <span>Total</span>
                <span className="font-mono text-emerald-400">1,200.00 USDX</span>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Isolated phone animation replicating the mobile payment simulation
 * (Scan QR -> Approve NFC -> Confirm Solana -> Paid Receipt).
 */
export function PaymentPhoneAnimation({
  brandName = 'Sterling',
  className = '',
}: PaymentPhoneAnimationProps) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(reduce ? STEPS.length - 1 : 0);

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % STEPS.length), STEP_MS);
    return () => clearInterval(id);
  }, [reduce]);

  const step = STEPS[index];

  return (
    <div className={`relative shrink-0 flex items-center justify-center ${className}`}>
      <motion.div
        animate={reduce ? undefined : { y: [-6, 6, -6] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="relative h-[540px] w-[270px] rounded-[44px] border border-white/20 bg-gradient-to-b from-zinc-800 to-zinc-950 p-2.5 shadow-[0_30px_80px_rgba(0,0,0,0.9),0_0_80px_rgba(99,102,241,0.25)]"
      >
        <div className="relative h-full w-full overflow-hidden rounded-[36px] bg-gradient-to-b from-[#0b1026] to-black">
          {/* Dynamic Island / Notch */}
          <div className="absolute left-1/2 top-2.5 z-20 h-5 w-20 -translate-x-1/2 rounded-full bg-black" />

          {/* Brand header */}
          <div className="absolute inset-x-0 top-10 z-10 flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_#60a5fa]" />
            {brandName}
          </div>

          {/* Animated screen content */}
          <PhoneScreen step={step} />

          {/* Home indicator bar */}
          <div className="absolute bottom-3 left-1/2 h-1 w-24 -translate-x-1/2 rounded-full bg-white/30" />
        </div>
      </motion.div>

      {/* Floating Settlement Chip */}
      <motion.div
        key={`chip-${step}`}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: step === 'paid' ? 1 : 0, x: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute -right-4 sm:-right-8 top-20 flex items-center gap-2 rounded-full border border-cyan-300/30 bg-black/90 px-4 py-2 text-xs font-medium text-cyan-200 backdrop-blur-md shadow-[0_0_24px_rgba(34,211,238,0.3)] z-30"
      >
        <Zap size={13} className="text-cyan-300" /> Settled on Solana
      </motion.div>
    </div>
  );
}

export default PaymentPhoneAnimation;
