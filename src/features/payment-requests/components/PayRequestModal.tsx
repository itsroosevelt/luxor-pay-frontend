'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { auth } from '@/lib/firebase';
import { PaymentRequest } from '@/features/payment-requests/api/payment-requests-api';
import { sendTransfer } from '@/features/transfers/api/transfers-api';
import { useGeolocation } from '@/context/GeolocationContext';
import { useTokenRegistry } from '@/context/TokenRegistryContext';
import {
  CheckCircle2,
  XCircle,
  RefreshCw,
  Wallet,
  Calendar,
  Hash,
  ArrowRight,
  X,
  ShieldCheck,
  Loader2,
  Building2,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { ModalRow } from './RequestsUi';
import { shortenWallet, formatAmount, formatDate } from './request-format';

export type PayStep = 'idle' | 'signing' | 'processing' | 'success' | 'error';

export function PaymentModal({
  request,
  network,
  onClose,
  onSuccess,
}: {
  request: PaymentRequest;
  network: 'mainnet-beta' | 'devnet';
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [step, setStep] = useState<PayStep>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const { latitude, longitude } = useGeolocation();
  const wallet = useWallet();

  const { getTokenSymbol } = useTokenRegistry();
  const formattedAmount = formatAmount(request.amount, request.assetMint, network, getTokenSymbol);
  const symbol = getTokenSymbol(request.assetMint) || 'SPL';
  const expDate = formatDate(request.expirationDate);
  const createdDate = formatDate(request.createdAt);

  const handlePay = async () => {
    setStep('signing');
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Not authenticated');

      setStep('processing');
      await sendTransfer({
        toWallet: request.requesterWallet,
        amount: String(request.amount), // API returns amount as number; DTO requires a string
        mint: request.assetMint,
        reference: request.reference,
        transactionTypeId: 'Request',
        paymentRequestId: request.id,
        ...(latitude !== null && longitude !== null ? { latitude, longitude } : {}),
      }, wallet);

      setStep('success');
      toast.success(`Payment of ${formattedAmount} sent successfully!`);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2200);
    } catch (e: any) {
      setErrorMsg(e.message || 'Transaction failed');
      setStep('error');
    }
  };

  const stepConfig: Record<PayStep, { label: string; color: string; icon: React.ReactNode }> = {
    idle:       { label: 'Ready to pay',    color: '#E2E8F0', icon: <ShieldCheck size={14} /> },
    signing:    { label: 'Awaiting signature', color: '#F59E0B', icon: <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> },
    processing: { label: 'Processing on-chain', color: '#A78BFA', icon: <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> },
    success:    { label: 'Transaction confirmed', color: '#22C55E', icon: <CheckCircle2 size={14} /> },
    error:      { label: 'Transaction reverted', color: '#EF4444', icon: <XCircle size={14} /> },
  };

  const cfg = stepConfig[step];
  const isBusy = step === 'signing' || step === 'processing';
  const isDone = step === 'success' || step === 'error';

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  if (!mounted || typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={isBusy ? undefined : onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 99999,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '16px',
        }}
      >
        {/* Modal */}
        <motion.div
          key="modal"
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.98 }}
          transition={{ type: 'spring', bounce: 0.35, duration: 0.55 }}
          onClick={e => e.stopPropagation()}
          style={{
            background: 'rgba(10,10,10,0.95)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '28px',
            boxShadow: '0 32px 80px -16px rgba(0,0,0,0.8), 0 0 0 1px rgba(255, 255, 255,0.08)',
            width: '100%',
            maxWidth: '460px',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '24px 28px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
            background: 'linear-gradient(135deg, rgba(16, 185, 129,0.08) 0%, rgba(0,0,0,0) 60%)',
          }}>
            <div>
              <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '10px', fontWeight: 700, letterSpacing: '0.4em', textTransform: 'uppercase', color: '#E2E8F0', margin: '0 0 6px 0' }}>
                Payment Request
              </p>
              <span style={{
                fontFamily: 'Outfit, sans-serif', fontSize: '32px', fontWeight: 600, lineHeight: 1,
                background: 'linear-gradient(to right, #E2E8F0, #10B981)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                {formattedAmount}
              </span>
            </div>
            {!isBusy && (
              <button
                onClick={onClose}
                style={{
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '9999px', width: '32px', height: '32px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: 'rgba(255,255,255,0.5)',
                }}
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Body */}
          <div style={{ padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

            {/* Details grid */}
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '16px',
              padding: '16px',
              display: 'flex', flexDirection: 'column', gap: '10px',
            }}>
              <ModalRow icon={<Wallet size={13} />} label="From (Requester)">
                <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#E2E8F0', wordBreak: 'break-all' }}>
                  {shortenWallet(request.requesterWallet)}
                </span>
              </ModalRow>

              <ModalRow icon={<Wallet size={13} />} label="To (Your Wallet)">
                <span style={{ fontFamily: 'monospace', fontSize: '12px', color: 'rgba(255,255,255,0.7)', wordBreak: 'break-all' }}>
                  {shortenWallet(request.payerWallet)}
                </span>
              </ModalRow>

              {request.businessName && (
                <ModalRow icon={<Building2 size={13} />} label="Business">
                  <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '13px', color: 'rgba(255,255,255,0.8)', fontWeight: 400 }}>
                    {request.businessName}
                  </span>
                </ModalRow>
              )}

              {request.reference && (
                <ModalRow icon={<FileText size={13} />} label="Reference">
                  <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
                    {request.reference}
                  </span>
                </ModalRow>
              )}

              {request.numericalReference && (
                <ModalRow icon={<Hash size={13} />} label="Ref #">
                  <span style={{ fontFamily: 'monospace', fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
                    {request.numericalReference}
                  </span>
                </ModalRow>
              )}

              <ModalRow icon={<Calendar size={13} />} label="Created">
                <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                  {createdDate}
                </span>
              </ModalRow>

              {expDate && (
                <ModalRow icon={<Calendar size={13} />} label="Expires">
                  <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                    {expDate}
                  </span>
                </ModalRow>
              )}

              <ModalRow icon={<Hash size={13} />} label="Asset Mint">
                <span style={{ fontFamily: 'monospace', fontSize: '11px', color: 'rgba(255,255,255,0.4)', wordBreak: 'break-all' }}>
                  {request.assetMint.slice(0, 8)}…{request.assetMint.slice(-6)}
                </span>
              </ModalRow>
            </div>

            {/* Tx lifecycle badge */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 14px', borderRadius: '9999px',
              background: `${cfg.color}18`,
              border: `1px solid ${cfg.color}30`,
              alignSelf: 'flex-start',
            }}>
              <span style={{ color: cfg.color }}>{cfg.icon}</span>
              <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '12px', fontWeight: 500, color: cfg.color }}>
                {cfg.label}
              </span>
            </div>

            {/* Error message */}
            {step === 'error' && (
              <div style={{
                padding: '12px 16px', borderRadius: '12px',
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                fontFamily: 'Montserrat, sans-serif', fontSize: '13px', color: '#FCA5A5',
              }}>
                {errorMsg}
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{
            padding: '0 28px 24px',
            display: 'flex', flexDirection: 'column', gap: '10px',
          }}>
            {step !== 'success' && (
              <button
                onClick={handlePay}
                disabled={isBusy || isDone}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '9999px',
                  border: 'none',
                  background: (isBusy || isDone) ? 'rgba(37, 99, 235,0.4)' : 'linear-gradient(135deg,#60A5FA,#2563EB)',
                  color: '#FFFFFF',
                  fontFamily: 'Outfit, sans-serif', fontSize: '15px', fontWeight: 600,
                  cursor: (isBusy || isDone) ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  transition: 'all 0.2s',
                  opacity: (isBusy || isDone) ? 0.7 : 1,
                }}
              >
                {isBusy ? (
                  <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> {step === 'signing' ? 'Awaiting Signature…' : 'Processing…'}</>
                ) : step === 'error' ? (
                  <><RefreshCw size={16} /> Retry Payment</>
                ) : (
                  <><ArrowRight size={16} /> Pay {formattedAmount}</>
                )}
              </button>
            )}
            {step === 'success' && (
              <div style={{
                width: '100%', padding: '14px',
                borderRadius: '9999px',
                background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
                color: '#22C55E', fontFamily: 'Outfit, sans-serif', fontSize: '15px', fontWeight: 600,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}>
                <CheckCircle2 size={16} /> Payment Sent!
              </div>
            )}
            {!isBusy && step !== 'success' && (
              <button
                onClick={onClose}
                style={{
                  width: '100%', padding: '11px',
                  borderRadius: '9999px',
                  background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit, sans-serif', fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
