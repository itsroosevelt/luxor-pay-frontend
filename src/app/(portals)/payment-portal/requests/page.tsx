'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getMerchantProfile } from '@/lib/merchants-api';
import { useGetPaymentRequests } from '@/hooks/useGetPaymentRequests';
import { useGetContacts } from '@/hooks/useGetContacts';
import {
  PaymentRequest,
  cancelPaymentRequest,
  resendPaymentRequestNotification,
  updatePaymentRequest,
} from '@/lib/payment-requests-api';
import { sendTransfer } from '@/lib/transfers-api';
import { useGeolocation } from '@/context/GeolocationContext';
import { PaymentRequestModal } from '@/components/dashboard/overview/PaymentRequestModal';
import { useTokenRegistry } from '@/context/TokenRegistryContext';
import { getLuxorEnv } from '@/lib/luxor-env';
import {
  Search,
  SlidersHorizontal,
  Inbox,
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Bell,
  Ban,
  Wallet,
  Calendar,
  Hash,
  ArrowRight,
  X,
  ShieldCheck,
  Loader2,
  Building2,
  FileText,
  CalendarDays,
  Pencil,
  Mail,
  Smartphone,
  BellRing,
  ChevronDown,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';

// ─── Helpers & Styled Components ──────────────────────────────────────────────

const BadgeSpan = styled.span<{ $color: string; $bg: string; $border: string }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 600;
  font-family: 'Outfit', sans-serif;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${({ $color }) => $color};
  background: ${({ $bg }) => $bg};
  border: 1px solid ${({ $border }) => $border};
`;

const EmptyStateWrapper = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  padding: 48px 0;
  gap: 12px;
  text-align: left;
`;

const EmptyStateIconCircle = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid var(--lx-border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--lx-text-muted);
`;

const EmptyStateText = styled.p`
  font-family: 'Outfit', sans-serif;
  font-size: 16px;
  font-weight: 500;
  color: var(--lx-text-muted);
  margin: 0;
  text-align: left;
`;

const SkeletonCardBox = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border-radius: 20px;
  border: 1px solid var(--lx-border);
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SkeletonBar = styled.div<{ $width: number }>`
  height: 14px;
  width: ${({ $width }) => $width}%;
  border-radius: 6px;
  background: linear-gradient(90deg, rgba(16, 185, 129, 0.08) 25%, rgba(255, 255, 255, 0.15) 50%, rgba(16, 185, 129, 0.08) 75%);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
`;

function shortenWallet(addr: string) {
  if (!addr) return '—';
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function formatAmount(amount: string, mint: string, network: 'mainnet-beta' | 'devnet', getTokenSymbol: (mint: string | null | undefined) => string | null) {
  const symbol = getTokenSymbol(mint) || 'SPL';
  return `${amount} ${symbol}`;
}

function formatDate(dateStr?: string) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const STATUS_CONFIG = {
  PENDING: { label: 'Pending', color: '#FBBF24', bg: 'rgba(251, 191, 36, 0.12)', border: 'rgba(251, 191, 36, 0.3)', Icon: Clock },
  PAID:    { label: 'Paid',    color: '#34D399', bg: 'rgba(52, 211, 153, 0.12)', border: 'rgba(52, 211, 153, 0.3)', Icon: CheckCircle2 },
  EXPIRED: { label: 'Expired', color: '#9CA3AF', bg: 'rgba(156, 163, 175, 0.1)', border: 'rgba(156, 163, 175, 0.2)', Icon: XCircle },
  CANCELLED:{ label: 'Cancelled',color:'#F87171', bg: 'rgba(248, 113, 113, 0.12)', border: 'rgba(248, 113, 113, 0.3)', Icon: Ban },
} as const;

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: PaymentRequest['status'] }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING;
  const { Icon } = cfg;
  return (
    <BadgeSpan $color={cfg.color} $bg={cfg.bg} $border={cfg.border}>
      <Icon size={11} /> {cfg.label}
    </BadgeSpan>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <EmptyStateWrapper
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', bounce: 0.3, duration: 0.6 }}
    >
      <EmptyStateIconCircle>
        <Inbox size={24} />
      </EmptyStateIconCircle>
      <EmptyStateText>
        {label}
      </EmptyStateText>
    </EmptyStateWrapper>
  );
}

function SkeletonCard() {
  return (
    <SkeletonCardBox>
      {[80, 60, 40].map((w, i) => (
        <SkeletonBar key={i} $width={w} />
      ))}
    </SkeletonCardBox>
  );
}

// ─── Payment Modal ────────────────────────────────────────────────────────────

type PayStep = 'idle' | 'signing' | 'processing' | 'success' | 'error';

function PaymentModal({
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
      const token = await user.getIdToken();

      setStep('processing');
      await sendTransfer(token, {
        toWallet: request.requesterWallet,
        amount: String(request.amount), // API returns amount as number; DTO requires a string
        mint: request.assetMint,
        reference: request.reference,
        transactionTypeId: 'Request',
        paymentRequestId: request.id,
        ...(latitude !== null && longitude !== null ? { latitude, longitude } : {}),
      });

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

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={isBusy ? undefined : onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 999,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(6px)',
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
    </AnimatePresence>
  );
}

function ModalRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
        <span style={{ color: 'rgba(255,255,255,0.3)' }}>{icon}</span>
        <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {label}
        </span>
      </div>
      {children}
    </div>
  );
}

// ─── Update Modal (Extend / Cancel) ──────────────────────────────────────────

type UpdateStep = 'idle' | 'loading' | 'done' | 'error';

function UpdateModal({
  request,
  onClose,
  onSuccess,
}: {
  request: PaymentRequest;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [mode, setMode] = useState<'choose' | 'extend'>('choose');
  const [step, setStep] = useState<UpdateStep>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [expirationDate, setExpirationDate] = useState('');

  // Minimum date: tomorrow (dates must be in the future)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().slice(0, 16); // datetime-local format

  const handleCancel = async () => {
    setStep('loading');
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Not authenticated');
      const token = await user.getIdToken();
      await updatePaymentRequest(token, request.id, { action: 'CANCEL' });
      setStep('done');
      toast.success('Payment request cancelled');
      setTimeout(() => { onSuccess(); onClose(); }, 1600);
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to cancel');
      setStep('error');
    }
  };

  const handleExtend = async () => {
    if (!expirationDate) return;
    setStep('loading');
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Not authenticated');
      const token = await user.getIdToken();
      await updatePaymentRequest(token, request.id, {
        expirationDate: new Date(expirationDate).toISOString(),
      });
      setStep('done');
      toast.success('Expiration date updated');
      setTimeout(() => { onSuccess(); onClose(); }, 1600);
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to update date');
      setStep('error');
    }
  };

  const isBusy = step === 'loading';

  return (
    <AnimatePresence>
      <motion.div
        key="update-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={isBusy ? undefined : onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 999,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '16px',
        }}
      >
        <motion.div
          key="update-modal"
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.98 }}
          transition={{ type: 'spring', bounce: 0.35, duration: 0.5 }}
          onClick={e => e.stopPropagation()}
          style={{
            background: 'rgba(10,10,10,0.97)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '28px',
            boxShadow: '0 32px 80px -16px rgba(0,0,0,0.85), 0 0 0 1px rgba(255, 255, 255,0.06)',
            width: '100%',
            maxWidth: '420px',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '24px 28px 18px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: 'linear-gradient(135deg, rgba(16, 185, 129,0.07) 0%, transparent 60%)',
          }}>
            <div>
              <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '10px', fontWeight: 700, letterSpacing: '0.4em', textTransform: 'uppercase', color: '#E2E8F0', margin: '0 0 4px 0' }}>
                Manage Request
              </p>
              <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '18px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>
                {mode === 'choose' ? 'What would you like to do?' : 'Set New Expiration Date'}
              </p>
            </div>
            {!isBusy && (
              <button onClick={onClose} style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '9999px', width: '32px', height: '32px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'rgba(255,255,255,0.5)',
              }}>
                <X size={15} />
              </button>
            )}
          </div>

          {/* Body */}
          <div style={{ padding: '20px 28px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

            {/* Error */}
            {step === 'error' && (
              <div style={{
                padding: '12px 16px', borderRadius: '12px',
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                fontFamily: 'Montserrat, sans-serif', fontSize: '13px', color: '#FCA5A5',
                display: 'flex', alignItems: 'flex-start', gap: '8px',
              }}>
                <XCircle size={15} style={{ flexShrink: 0, marginTop: '1px' }} />
                {errorMsg}
              </div>
            )}

            {/* Choose mode */}
            {mode === 'choose' && (
              <>
                {/* Extend option */}
                <button
                  onClick={() => { setMode('extend'); setStep('idle'); setErrorMsg(''); }}
                  disabled={isBusy}
                  style={{
                    width: '100%', padding: '16px 20px',
                    borderRadius: '16px', border: '1px solid rgba(255, 255, 255,0.2)',
                    background: 'rgba(255, 255, 255,0.05)',
                    cursor: 'pointer', textAlign: 'left',
                    display: 'flex', alignItems: 'center', gap: '14px',
                    transition: 'border-color 0.2s, background 0.2s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255, 255, 255,0.4)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255, 255, 255,0.1)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255, 255, 255,0.2)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255, 255, 255,0.05)'; }}
                >
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255, 255, 255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#E2E8F0' }}>
                    <CalendarDays size={18} />
                  </div>
                  <div>
                    <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '14px', fontWeight: 600, color: '#FFFFFF', margin: '0 0 2px 0' }}>Update Expiration Date</p>
                    <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '12px', fontWeight: 300, color: 'rgba(255,255,255,0.5)', margin: 0 }}>Choose a new future date for this request</p>
                  </div>
                  <ArrowRight size={16} style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
                </button>

                {/* Cancel option */}
                <button
                  onClick={handleCancel}
                  disabled={isBusy}
                  style={{
                    width: '100%', padding: '16px 20px',
                    borderRadius: '16px', border: '1px solid rgba(239,68,68,0.2)',
                    background: 'rgba(239,68,68,0.05)',
                    cursor: isBusy ? 'not-allowed' : 'pointer', textAlign: 'left',
                    display: 'flex', alignItems: 'center', gap: '14px',
                    transition: 'border-color 0.2s, background 0.2s',
                    opacity: isBusy ? 0.6 : 1,
                  }}
                  onMouseEnter={e => { if (!isBusy) { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(239,68,68,0.4)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.1)'; }}}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(239,68,68,0.2)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.05)'; }}
                >
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#FCA5A5' }}>
                    {isBusy ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Ban size={18} />}
                  </div>
                  <div>
                    <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '14px', fontWeight: 600, color: '#FCA5A5', margin: '0 0 2px 0' }}>Cancel Request</p>
                    <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '12px', fontWeight: 300, color: 'rgba(255,255,255,0.5)', margin: 0 }}>Permanently cancel this payment request</p>
                  </div>
                </button>

                <button
                  onClick={onClose}
                  disabled={isBusy}
                  style={{
                    width: '100%', padding: '11px',
                    borderRadius: '9999px', border: '1px solid rgba(255,255,255,0.08)',
                    background: 'transparent', color: 'rgba(255,255,255,0.4)',
                    fontFamily: 'Outfit, sans-serif', fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Dismiss
                </button>
              </>
            )}

            {/* Extend mode */}
            {mode === 'extend' && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontFamily: 'Outfit, sans-serif', fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>
                    New Expiration Date &amp; Time
                  </label>
                  <input
                    type="datetime-local"
                    value={expirationDate}
                    min={minDate}
                    onChange={e => setExpirationDate(e.target.value)}
                    disabled={isBusy}
                    style={{
                      width: '100%', padding: '12px 14px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '12px',
                      color: '#FFFFFF',
                      fontFamily: 'Montserrat, sans-serif', fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      colorScheme: 'dark',
                    }}
                  />
                  <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '11px', fontWeight: 300, color: 'rgba(255,255,255,0.35)', margin: '2px 0 0 0' }}>
                    Must be a future date.
                  </p>
                </div>

                <button
                  onClick={handleExtend}
                  disabled={!expirationDate || isBusy}
                  style={{
                    width: '100%', padding: '14px',
                    borderRadius: '9999px', border: 'none',
                    background: (!expirationDate || isBusy) ? 'rgba(37, 99, 235,0.4)' : 'linear-gradient(135deg,#60A5FA,#2563EB)',
                    color: '#FFFFFF',
                    fontFamily: 'Outfit, sans-serif', fontSize: '15px', fontWeight: 600,
                    cursor: (!expirationDate || isBusy) ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    opacity: (!expirationDate || isBusy) ? 0.6 : 1,
                    transition: 'all 0.2s',
                  }}
                >
                  {isBusy
                    ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Updating…</>
                    : <><CalendarDays size={16} /> Confirm New Date</>
                  }
                </button>

                <button
                  onClick={() => { setMode('choose'); setStep('idle'); setErrorMsg(''); }}
                  disabled={isBusy}
                  style={{
                    width: '100%', padding: '11px',
                    borderRadius: '9999px', border: '1px solid rgba(255,255,255,0.08)',
                    background: 'transparent', color: 'rgba(255,255,255,0.4)',
                    fontFamily: 'Outfit, sans-serif', fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  ← Back
                </button>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Resend Notification Modal ──────────────────────────────────────────────

function ResendModal({
  request,
  onClose,
  onSuccess,
}: {
  request: PaymentRequest;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [step, setStep] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showPrefixDropdown, setShowPrefixDropdown] = useState(false);

  const existingTarget = request.targetNotification || '';
  const isExistingEmail = existingTarget.includes('@');

  const [type, setType] = useState<PaymentRequest['targetNotificationType']>(
    request.targetNotificationType !== 'NONE' ? request.targetNotificationType : 'EMAIL'
  );
  
  const [emailTarget, setEmailTarget] = useState(isExistingEmail ? existingTarget : '');
  
  // Simple hack to parse existing phone
  const defaultPrefix = (!isExistingEmail && existingTarget.match(/^(\+\d{1,3})/)?.[1]) || '+1';
  const defaultPhone = (!isExistingEmail ? existingTarget.replace(/^(\+\d{1,3})/, '').trim() : '');
  
  const [phonePrefix, setPhonePrefix] = useState(defaultPrefix);
  const [phoneNumber, setPhoneNumber] = useState(defaultPhone);
  const [extraPrefixes, setExtraPrefixes] = useState<string[]>(() => {
    const standardPrefixes = ['+1', '+44', '+52', '+34', '+54', '+57', '+55', '+56', '+51', '+593'];
    if (defaultPrefix && !standardPrefixes.includes(defaultPrefix)) {
      return [defaultPrefix];
    }
    return [];
  });

  const { data: contactsData } = useGetContacts();

  // Find contact matching the request's payerWallet
  const matchedContact = useMemo(() => {
    if (!request.payerWallet || !contactsData?.data) return null;
    return contactsData.data.find(
      c => c.walletAddress.toLowerCase() === request.payerWallet.toLowerCase()
    );
  }, [request.payerWallet, contactsData]);

  const handleResend = async () => {
    let finalTarget = '';
    if (type === 'EMAIL') {
      finalTarget = emailTarget.trim();
      if (!finalTarget) {
        setErrorMsg('Email address is required.');
        setStep('error');
        return;
      }
    } else if (type === 'PHONE') {
      const num = phoneNumber.trim();
      if (!num) {
        setErrorMsg('Phone number is required.');
        setStep('error');
        return;
      }
      finalTarget = phonePrefix + num;
    }

    setStep('loading');
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Not authenticated');
      const token = await user.getIdToken();
      await resendPaymentRequestNotification(token, request.id, {
        targetNotificationType: type,
        targetNotification: type === 'PUSH' ? undefined : finalTarget,
      });
      setStep('done');
      toast.success('Notification resent successfully');
      setTimeout(() => { onSuccess(); onClose(); }, 1600);
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to resend notification');
      setStep('error');
    }
  };

  const isBusy = step === 'loading';

  return (
    <AnimatePresence>
      <motion.div
        key="resend-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={isBusy ? undefined : onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 999,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '16px',
        }}
      >
        <motion.div
          key="resend-modal"
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.98 }}
          transition={{ type: 'spring', bounce: 0.35, duration: 0.5 }}
          onClick={e => e.stopPropagation()}
          style={{
            background: 'rgba(10,10,10,0.97)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '28px',
            boxShadow: '0 32px 80px -16px rgba(0,0,0,0.85), 0 0 0 1px rgba(255, 255, 255,0.06)',
            width: '100%',
            maxWidth: '420px',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '24px 28px 18px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: 'linear-gradient(135deg, rgba(16, 185, 129,0.07) 0%, transparent 60%)',
            borderTopLeftRadius: '27px',
            borderTopRightRadius: '27px',
          }}>
            <div>
              <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '10px', fontWeight: 700, letterSpacing: '0.4em', textTransform: 'uppercase', color: '#E2E8F0', margin: '0 0 4px 0' }}>
                Resend Request
              </p>
              <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '18px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>
                Configure Notification
              </p>
            </div>
            {!isBusy && (
              <button onClick={onClose} style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '9999px', width: '32px', height: '32px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'rgba(255,255,255,0.5)',
              }}>
                <X size={15} />
              </button>
            )}
          </div>

          {/* Body */}
          <div style={{ padding: '20px 28px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Error */}
            {step === 'error' && (
              <div style={{
                padding: '12px 16px', borderRadius: '12px',
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                fontFamily: 'Montserrat, sans-serif', fontSize: '13px', color: '#FCA5A5',
                display: 'flex', alignItems: 'flex-start', gap: '8px',
              }}>
                <XCircle size={15} style={{ flexShrink: 0, marginTop: '1px' }} />
                {errorMsg}
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px' }}>
              {(['EMAIL', 'PHONE', 'PUSH'] as const).map(t => {
                const isActive = type === t;
                const Icon = t === 'EMAIL' ? Mail : (t === 'PHONE' ? Smartphone : BellRing);
                return (
                  <button
                    key={t}
                    onClick={() => { setType(t); setErrorMsg(''); setShowSuggestions(false); setShowPrefixDropdown(false); }}
                    disabled={isBusy}
                    style={{
                      flex: 1, padding: '12px 0',
                      borderRadius: '12px', border: '1px solid',
                      borderColor: isActive ? '#E2E8F0' : 'rgba(255,255,255,0.1)',
                      background: isActive ? 'rgba(255, 255, 255,0.1)' : 'rgba(255,255,255,0.02)',
                      color: isActive ? '#E2E8F0' : 'rgba(255,255,255,0.5)',
                      fontFamily: 'Outfit, sans-serif', fontSize: '13px', fontWeight: 500,
                      cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                      transition: 'all 0.2s',
                    }}
                  >
                    <Icon size={16} />
                    {t === 'EMAIL' ? 'Email' : t === 'PHONE' ? 'Phone SMS' : 'Push Notif'}
                  </button>
                )
              })}
            </div>

            {type === 'EMAIL' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', position: 'relative' }}>
                <label style={{ fontFamily: 'Outfit, sans-serif', fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>
                  Email Address
                </label>
                <div style={{ position: 'relative', width: '100%' }}>
                  <input
                    type="email"
                    value={emailTarget}
                    onChange={e => setEmailTarget(e.target.value)}
                    placeholder="payer@example.com"
                    disabled={isBusy}
                    style={{
                      width: '100%', padding: matchedContact?.email ? '12px 40px 12px 14px' : '12px 14px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '12px',
                      color: '#FFFFFF',
                      fontFamily: 'Montserrat, sans-serif', fontSize: '14px',
                      outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                  {matchedContact?.email && (
                    <button
                      type="button"
                      onClick={() => setShowSuggestions(!showSuggestions)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        border: 'none',
                        color: 'rgba(255,255,255,0.4)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        padding: 0,
                      }}
                      title="Show contact suggestions"
                    >
                      <ChevronDown size={18} style={{ transform: showSuggestions ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                    </button>
                  )}
                </div>

                <AnimatePresence>
                  {showSuggestions && matchedContact?.email && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        zIndex: 10,
                        marginTop: '4px',
                        background: '#0F0F0F',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: '12px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                        overflow: 'hidden',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setEmailTarget(matchedContact.email);
                          setShowSuggestions(false);
                        }}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          background: 'transparent',
                          border: 'none',
                          color: '#FFFFFF',
                          fontFamily: 'Montserrat, sans-serif',
                          fontSize: '13px',
                          textAlign: 'left',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '2px',
                          transition: 'background 0.2s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255,0.1)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <span style={{ fontSize: '10px', color: '#E2E8F0', fontFamily: 'Outfit, sans-serif', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Saved Contact ({matchedContact.nickname})
                        </span>
                        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{matchedContact.email}</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {type === 'PHONE' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', position: 'relative' }}>
                <label style={{ fontFamily: 'Outfit, sans-serif', fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>
                  Phone Number
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ position: 'relative' }}>
                    <button
                      type="button"
                      onClick={() => setShowPrefixDropdown(!showPrefixDropdown)}
                      disabled={isBusy}
                      style={{
                        padding: '12px 14px',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: '12px',
                        color: '#FFFFFF',
                        fontFamily: 'Montserrat, sans-serif', fontSize: '14px',
                        cursor: isBusy ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        outline: 'none',
                      }}
                    >
                      <span>
                        {phonePrefix === '+1' && '🇺🇸 +1'}
                        {phonePrefix === '+593' && '🇪🇨 +593'}
                        {phonePrefix === '+44' && '🇬🇧 +44'}
                        {phonePrefix === '+52' && '🇲🇽 +52'}
                        {phonePrefix === '+34' && '🇪🇸 +34'}
                        {phonePrefix === '+54' && '🇦🇷 +54'}
                        {phonePrefix === '+57' && '🇨🇴 +57'}
                        {phonePrefix === '+55' && '🇧🇷 +55'}
                        {phonePrefix === '+56' && '🇨🇱 +56'}
                        {phonePrefix === '+51' && '🇵🇪 +51'}
                        {!['+1', '+593', '+44', '+52', '+34', '+54', '+57', '+55', '+56', '+51'].includes(phonePrefix) && `🌍 ${phonePrefix}`}
                      </span>
                      <ChevronDown size={14} style={{ transform: showPrefixDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', opacity: 0.6 }} />
                    </button>

                    <AnimatePresence>
                      {showPrefixDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            zIndex: 20,
                            marginTop: '6px',
                            background: '#0F0F0F',
                            border: '1px solid rgba(255,255,255,0.15)',
                            borderRadius: '12px',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                            maxHeight: '220px',
                            overflowY: 'auto',
                            width: '120px',
                          }}
                        >
                          {[
                            { value: '+1', label: '🇺🇸 +1' },
                            { value: '+593', label: '🇪🇨 +593' },
                            { value: '+44', label: '🇬🇧 +44' },
                            { value: '+52', label: '🇲🇽 +52' },
                            { value: '+34', label: '🇪🇸 +34' },
                            { value: '+54', label: '🇦🇷 +54' },
                            { value: '+57', label: '🇨🇴 +57' },
                            { value: '+55', label: '🇧🇷 +55' },
                            { value: '+56', label: '🇨🇱 +56' },
                            { value: '+51', label: '🇵🇪 +51' },
                            ...extraPrefixes.map(p => ({ value: p, label: `🌍 ${p}` })),
                          ].map(item => (
                            <button
                              key={item.value}
                              type="button"
                              onClick={() => {
                                setPhonePrefix(item.value);
                                setShowPrefixDropdown(false);
                              }}
                              style={{
                                width: '100%',
                                padding: '10px 12px',
                                background: 'transparent',
                                border: 'none',
                                color: '#FFFFFF',
                                fontFamily: 'Montserrat, sans-serif',
                                fontSize: '13px',
                                textAlign: 'left',
                                cursor: 'pointer',
                                transition: 'background 0.2s',
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255,0.1)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                              {item.label}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={e => setPhoneNumber(e.target.value)}
                      placeholder="1234567890"
                      disabled={isBusy}
                      style={{
                        width: '100%', padding: matchedContact?.telephone ? '12px 40px 12px 14px' : '12px 14px',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: '12px',
                        color: '#FFFFFF',
                        fontFamily: 'Montserrat, sans-serif', fontSize: '14px',
                        outline: 'none', boxSizing: 'border-box',
                      }}
                    />
                    {matchedContact?.telephone && (
                      <button
                        type="button"
                        onClick={() => setShowSuggestions(!showSuggestions)}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'transparent',
                          border: 'none',
                          color: 'rgba(255,255,255,0.4)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          padding: 0,
                        }}
                        title="Show contact suggestions"
                      >
                        <ChevronDown size={18} style={{ transform: showSuggestions ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                      </button>
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {showSuggestions && matchedContact?.telephone && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        zIndex: 10,
                        marginTop: '4px',
                        background: '#0F0F0F',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: '12px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                        overflow: 'hidden',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          const phone = matchedContact.telephone;
                          const prefixMatch = phone.match(/^(\+\d{1,3})/);
                          if (prefixMatch) {
                            const prefix = prefixMatch[1];
                            const standardPrefixes = ['+1', '+44', '+52', '+34', '+54', '+57', '+55', '+56', '+51', '+593'];
                            if (!standardPrefixes.includes(prefix) && !extraPrefixes.includes(prefix)) {
                              setExtraPrefixes(prev => [...prev, prefix]);
                            }
                            setPhonePrefix(prefix);
                            setPhoneNumber(phone.replace(/^(\+\d{1,3})/, '').trim());
                          } else {
                            setPhoneNumber(phone);
                          }
                          setShowSuggestions(false);
                        }}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          background: 'transparent',
                          border: 'none',
                          color: '#FFFFFF',
                          fontFamily: 'Montserrat, sans-serif',
                          fontSize: '13px',
                          textAlign: 'left',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '2px',
                          transition: 'background 0.2s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255,0.1)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <span style={{ fontSize: '10px', color: '#E2E8F0', fontFamily: 'Outfit, sans-serif', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Saved Contact ({matchedContact.nickname})
                        </span>
                        <span>{matchedContact.telephone}</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            <button
              onClick={handleResend}
              disabled={isBusy || (type === 'EMAIL' && !emailTarget.trim()) || (type === 'PHONE' && !phoneNumber.trim())}
              style={{
                width: '100%', padding: '14px',
                borderRadius: '9999px', border: 'none',
                background: (isBusy || (type === 'EMAIL' && !emailTarget.trim()) || (type === 'PHONE' && !phoneNumber.trim())) ? 'rgba(37, 99, 235,0.4)' : 'linear-gradient(135deg,#60A5FA,#2563EB)',
                color: '#FFFFFF',
                fontFamily: 'Outfit, sans-serif', fontSize: '15px', fontWeight: 600,
                cursor: (isBusy || (type === 'EMAIL' && !emailTarget.trim()) || (type === 'PHONE' && !phoneNumber.trim())) ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                opacity: (isBusy || (type === 'EMAIL' && !emailTarget.trim()) || (type === 'PHONE' && !phoneNumber.trim())) ? 0.6 : 1,
                transition: 'all 0.2s', marginTop: '4px',
              }}
            >
              {isBusy
                ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Sending…</>
                : <><Bell size={16} /> Send Notification</>
              }
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Request Card ─────────────────────────────────────────────────────────────

interface RequestCardProps {
  request: PaymentRequest;
  perspective: 'requester' | 'payer';
  network: 'mainnet-beta' | 'devnet';
  onRefetch: () => void;
  onPay?: (req: PaymentRequest) => void;
  onUpdate?: (req: PaymentRequest) => void;
  onResend?: (req: PaymentRequest) => void;
}

function RequestCard({ request, perspective, network, onRefetch, onPay, onUpdate, onResend }: RequestCardProps) {
  const [isActing, setIsActing] = useState(false);

  const isPending = request.status === 'PENDING';
  const isExpired = request.status === 'EXPIRED';
  const showActions = isPending || (isExpired && perspective === 'requester');
  const { getTokenSymbol } = useTokenRegistry();
  const formattedAmount = formatAmount(request.amount, request.assetMint, network, getTokenSymbol);
  const expDate = formatDate(request.expirationDate);
  const createdDate = formatDate(request.createdAt);
  const lastRemindedDate = formatDate(request.lastNotificationDate);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', bounce: 0.3, duration: 0.5 }}
      style={{
        background: 'transparent',
        borderRadius: '0px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '20px 0',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        transition: 'border-color 0.2s',
      }}
    >
      {/* Top Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{
            fontFamily: 'Outfit, sans-serif', fontSize: '22px', fontWeight: 600,
            color: '#FFFFFF',
            lineHeight: 1,
          }}>
            {formattedAmount}
          </span>
          {request.reference && (
            <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontWeight: 300 }}>
              {request.reference}
            </span>
          )}
        </div>
        <StatusBadge status={request.status} />
      </div>

      {/* Meta Row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 20px' }}>
        <MetaItem icon={<Wallet size={13} />} label={perspective === 'payer' ? 'From' : 'To'}>
          <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#E2E8F0' }}>
            {shortenWallet(perspective === 'payer' ? request.requesterWallet : request.payerWallet)}
          </span>
        </MetaItem>

        {request.businessName && (
          <MetaItem icon={<Hash size={13} />} label="Business">
            <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
              {request.businessName}
            </span>
          </MetaItem>
        )}

        {request.numericalReference && (
          <MetaItem icon={<Hash size={13} />} label="Ref #">
            <span style={{ fontFamily: 'monospace', fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
              {request.numericalReference}
            </span>
          </MetaItem>
        )}

        <MetaItem icon={<Calendar size={13} />} label="Created">
          <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
            {createdDate}
          </span>
        </MetaItem>

        {expDate && (
          <MetaItem icon={<Calendar size={13} />} label="Expires">
            <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
              {expDate}
            </span>
          </MetaItem>
        )}

        {lastRemindedDate && (
          <MetaItem icon={<Bell size={13} />} label="Last Reminded">
            <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
              {lastRemindedDate}
            </span>
          </MetaItem>
        )}
      </div>

      {/* Actions */}
      {showActions && (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '14px' }}>
          {perspective === 'requester' && (
            <>
              {isPending && (
                <ActionButton
                  onClick={() => onResend?.(request)}
                  disabled={isActing}
                  icon={<Bell size={13} />}
                  variant="ghost"
                >
                  Resend Notification
                </ActionButton>
              )}
              <ActionButton
                onClick={() => onUpdate?.(request)}
                disabled={isActing}
                icon={<Pencil size={13} />}
                variant="danger"
              >
                Update
              </ActionButton>
            </>
          )}
          {perspective === 'payer' && isPending && (
            <ActionButton
              onClick={() => onPay?.(request)}
              disabled={isActing}
              icon={<ArrowRight size={13} />}
              variant="primary"
            >
              Pay {formattedAmount}
            </ActionButton>
          )}
        </div>
      )}
    </motion.div>
  );
}

function MetaItem({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <span style={{ color: 'rgba(255,255,255,0.3)' }}>{icon}</span>
      <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}:
      </span>
      {children}
    </div>
  );
}

function ActionButton({
  children, onClick, disabled, icon, variant,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  icon: React.ReactNode;
  variant: 'primary' | 'ghost' | 'danger';
}) {
  const styles: Record<string, React.CSSProperties> = {
    primary: { background: '#FFFFFF', color: '#000000', border: 'none' },
    ghost:   { background: 'rgba(255, 255, 255,0.06)', color: '#FFFFFF', border: '1px solid rgba(255, 255, 255,0.15)' },
    danger:  { background: 'rgba(255, 255, 255,0.06)', color: '#FFFFFF', border: '1px solid rgba(255, 255, 255,0.15)' },
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        ...styles[variant],
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        padding: '7px 14px', borderRadius: '9999px',
        fontFamily: 'Outfit, sans-serif', fontSize: '13px', fontWeight: 500,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1, transition: 'all 0.2s',
      }}
    >
      {icon}{children}
    </button>
  );
}

// ─── Tab Panel ────────────────────────────────────────────────────────────────

function RequestsPanel({
  perspective,
  walletAddress,
  network,
  statusFilter,
  searchQuery,
}: {
  perspective: 'requester' | 'payer';
  walletAddress: string | null;
  network: 'mainnet-beta' | 'devnet';
  statusFilter: StatusFilter;
  searchQuery: string;
}) {
  const { data, isLoading, isError, errorMessage, refetch } = useGetPaymentRequests(perspective, walletAddress);
  const [payingRequest, setPayingRequest] = useState<PaymentRequest | null>(null);
  const [updatingRequest, setUpdatingRequest] = useState<PaymentRequest | null>(null);
  const [resendingRequest, setResendingRequest] = useState<PaymentRequest | null>(null);

  if (!walletAddress) {
    return (
      <div style={{ padding: '40px 0', textAlign: 'left', color: 'rgba(255,255,255,0.4)', fontFamily: 'Montserrat, sans-serif', fontSize: '14px' }}>
        Configure your wallet in{' '}
        <Link href="/dashboard/settings" style={{ color: '#E2E8F0', textDecoration: 'underline' }}>
          Settings
        </Link>{' '}
        to view payment requests.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (isError) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px',
        background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
        borderRadius: '16px', color: '#FCA5A5', fontFamily: 'Montserrat, sans-serif', fontSize: '14px',
      }}>
        <AlertCircle size={18} />
        <span>{errorMessage || 'Failed to load payment requests.'}</span>
        <button
          onClick={refetch}
          style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#E2E8F0', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <RefreshCw size={14} /> Retry
        </button>
      </div>
    );
  }

  const filteredData = data.filter(req => {
    if (statusFilter !== 'ALL' && req.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchReference = req.reference?.toLowerCase().includes(q);
      const matchBusiness = req.businessName?.toLowerCase().includes(q);
      const matchNumRef = req.numericalReference?.toString().includes(q);
      const matchPayer = req.payerWallet?.toLowerCase().includes(q);
      const matchRequester = req.requesterWallet?.toLowerCase().includes(q);
      const matchTargetNotif = req.targetNotification?.toLowerCase().includes(q);
      return Boolean(matchReference || matchBusiness || matchNumRef || matchPayer || matchRequester || matchTargetNotif);
    }
    return true;
  });

  if (filteredData.length === 0) {
    const emptyLabel = perspective === 'payer'
      ? 'No payment requests received'
      : 'No payment requests sent';
    return <EmptyState label={emptyLabel} />;
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredData.map(req => (
          <RequestCard
            key={req.id}
            request={req}
            perspective={perspective}
            network={network}
            onRefetch={refetch}
            onPay={r => setPayingRequest(r)}
            onUpdate={r => setUpdatingRequest(r)}
            onResend={r => setResendingRequest(r)}
          />
        ))}
      </div>

      {payingRequest && (
        <PaymentModal
          request={payingRequest}
          network={network}
          onClose={() => setPayingRequest(null)}
          onSuccess={() => { setPayingRequest(null); refetch(); }}
        />
      )}

      {updatingRequest && (
        <UpdateModal
          request={updatingRequest}
          onClose={() => setUpdatingRequest(null)}
          onSuccess={() => { setUpdatingRequest(null); refetch(); }}
        />
      )}

      {resendingRequest && (
        <ResendModal
          request={resendingRequest}
          onClose={() => setResendingRequest(null)}
          onSuccess={() => { setResendingRequest(null); refetch(); }}
        />
      )}
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type TabId = 'inbox' | 'sent';
type StatusFilter = 'ALL' | 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELLED';

export default function PortalPaymentRequestsPage() {
  const [merchantWallet, setMerchantWallet] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('inbox');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const network = getLuxorEnv() === 'development' ? 'devnet' : 'mainnet-beta';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async user => {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const profile = await getMerchantProfile(token);
        setMerchantWallet(profile?.merchantWallet || null);
      } catch (e) {
        console.error(e);
      }
    });
    return () => unsubscribe();
  }, []);

  const tabs: { id: TabId; label: string; Icon: typeof Inbox; description: string }[] = [
    { id: 'inbox',  label: 'Inbox',     Icon: Inbox, description: 'Requests others sent you' },
    { id: 'sent',   label: 'Sent',      Icon: Send,  description: 'Requests you sent to others' },
  ];

  const handleExportCsv = () => {
    toast.success('Exporting payment requests CSV...');
  };

  return (
    <>
      {/* Global shimmer + spin keyframes */}
      <style>{`
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>

      <header className="lx-page-header">
        <div>
          <h1 className="lx-page-title">
            Payment Requests
          </h1>
          <p className="lx-page-subtitle">
            Track payments you&apos;ve requested and payments others are asking from you.
          </p>
        </div>
      </header>

      <div className="p-6 md:p-10 w-full max-w-[1600px] mx-auto space-y-6">

        {/* Top Control Toolbar */}
        <div className="space-y-3 pb-4 border-b border-white/10">
          {/* Row 1: Tab Bar (Inbox / Sent) + Create Request Button */}
          <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
            {/* Tab Bar (Inbox / Sent) */}
            <div className="flex items-center gap-1 bg-white/[0.03] border border-white/10 p-1 rounded-full w-fit shrink-0">
              {tabs.map(({ id, label, Icon }) => {
                const isActive = activeTab === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveTab(id)}
                    className={`flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-white text-black shadow-md'
                        : 'text-gray-400 hover:text-white'
                    }`}
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  >
                    <Icon size={14} />
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Create Request Action Button (Positioned next to Inbox/Sent tabs on Row 1) */}
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-full bg-white text-black font-bold hover:bg-gray-200 text-xs transition-all shadow-md shrink-0 ml-auto"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              <Send size={14} /> Create Request
            </button>
          </div>

          {/* Row 2: Integrated Search Bar Pill */}
          <div className="relative flex items-center w-full">
            <Search size={14} className="absolute left-3.5 text-white/40 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={statusFilter === 'ALL' ? "Search invoice # or memo..." : `Filter: ${statusFilter} · Search...`}
              className="w-full bg-white/5 border border-white/12 focus:border-white/30 rounded-full py-2 pl-9 pr-24 text-xs text-white placeholder-white/40 outline-none transition-all box-border font-mono"
            />

            {/* Integrated Filter Button & Active Status Badge */}
            <div className="absolute right-2.5 flex items-center gap-1.5 font-mono">
              {statusFilter !== 'ALL' && (
                <button
                  type="button"
                  onClick={() => setStatusFilter('ALL')}
                  className="px-2 py-0.5 rounded-full bg-white/20 hover:bg-white/30 text-[10px] font-bold text-white flex items-center gap-1 transition-colors"
                  title="Clear filter"
                >
                  <span>{statusFilter}</span>
                  <X size={10} />
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  const filterOptions: ('ALL' | 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELLED')[] = [
                    'ALL',
                    'PENDING',
                    'PAID',
                    'EXPIRED',
                    'CANCELLED',
                  ];
                  const nextIdx = (filterOptions.indexOf(statusFilter) + 1) % filterOptions.length;
                  const nextFilter = filterOptions[nextIdx];
                  setStatusFilter(nextFilter);
                  toast.info(`Filter: ${nextFilter}`);
                }}
                className={`p-1.5 rounded-full transition-colors flex items-center justify-center ${
                  statusFilter !== 'ALL' ? 'text-white bg-white/20' : 'text-white/50 hover:text-white hover:bg-white/10'
                }`}
                title={`Filter status (Current: ${statusFilter})`}
              >
                <SlidersHorizontal size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* Panel Container */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {activeTab === 'inbox' && (
              <RequestsPanel
                perspective="payer"
                walletAddress={merchantWallet}
                network={network}
                statusFilter={statusFilter}
                searchQuery={searchQuery}
              />
            )}
            {activeTab === 'sent' && (
              <RequestsPanel
                perspective="requester"
                walletAddress={merchantWallet}
                network={network}
                statusFilter={statusFilter}
                searchQuery={searchQuery}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <PaymentRequestModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        requesterWallet={merchantWallet}
      />
    </>
  );
}
