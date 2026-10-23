'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { auth } from '@/lib/firebase';
import { PaymentRequest, updatePaymentRequest } from '@/features/payment-requests/api/payment-requests-api';
import { XCircle, Ban, ArrowRight, X, Loader2, CalendarDays } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export type UpdateStep = 'idle' | 'loading' | 'done' | 'error';

export function UpdateModal({
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
      await updatePaymentRequest(request.id, { action: 'CANCEL' });
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
      await updatePaymentRequest(request.id, {
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
      <motion.div
        key="update-backdrop"
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
    </AnimatePresence>,
    document.body
  );
}
