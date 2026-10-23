'use client';

import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { auth } from '@/lib/firebase';
import { useGetContacts } from '@/features/contacts/hooks/useGetContacts';
import {
  PaymentRequest,
  resendPaymentRequestNotification,
} from '@/features/payment-requests/api/payment-requests-api';
import {
  XCircle,
  Bell,
  X,
  Loader2,
  Mail,
  Smartphone,
  BellRing,
  ChevronDown,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export function ResendModal({
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
      await resendPaymentRequestNotification(request.id, {
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
        key="resend-backdrop"
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
    </AnimatePresence>,
    document.body
  );
}
