"use client";

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useTokenRegistry } from '@/context/TokenRegistryContext';
import { getLuxorEnv } from '@/lib/luxor-env';
import { useGetContacts } from '@/hooks/useGetContacts';
import { useCreatePaymentRequest } from '@/hooks/useCreatePaymentRequest';
import { NotificationType } from '@/lib/payment-requests-api';
import { Contact } from '@/lib/contacts-api';
import { toast } from 'sonner';
import { CheckCircle, Send, X, ChevronDown, ChevronUp } from 'lucide-react';

interface PaymentRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  requesterWallet: string | null;
}

// ─── Styled Components ────────────────────────────────────────────────────────

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(12px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;

  @media (max-width: 768px) {
    padding: 12px;
  }
`;

const ModalContent = styled(motion.div)<{ $wide?: boolean }>`
  background: rgba(10, 10, 10, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 32px 64px -16px rgba(0,0,0,0.8);
  border-radius: 40px;
  width: 100%;
  max-width: ${({ $wide }) => ($wide ? '880px' : '480px')};
  padding: 40px;
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  text-align: left;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: 768px) {
    padding: 24px;
    border-radius: 24px;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 24px;
  right: 24px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #FFFFFF;
  }
`;

const Title = styled.h2`
  font-family: 'Outfit', sans-serif;
  font-size: 22px;
  font-weight: 500;
  letter-spacing: -0.5px;
  color: #FFFFFF;
  margin: 0 0 6px 0;
  text-align: left;
`;

const Subtitle = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 20px 0;
  text-align: left;
  line-height: 1.5;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 16px;
`;

const FieldGroup = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FieldLabel = styled.span`
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.05em;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 2px;
  display: block;
`;

const FieldHelpText = styled.span`
  font-family: 'Montserrat', sans-serif;
  font-size: 11px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.45);
  line-height: 1.4;
  margin-top: 4px;
  display: block;
`;

const TextInput = styled.input`
  width: 100%;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 14px 18px;
  color: #FFFFFF;
  font-family: 'Outfit', sans-serif;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #E2E8F0;
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.2);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }
`;

const Select = styled.select`
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 14px 18px;
  color: #FFFFFF;
  font-family: 'Outfit', sans-serif;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 16px center;
  background-size: 16px;

  &:focus {
    outline: none;
    border-color: #E2E8F0;
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.2);
  }

  option {
    background: #0A0A0A;
    color: #FFFFFF;
  }
  
  optgroup {
    background: #0A0A0A;
    color: #E2E8F0;
    font-weight: 600;
  }
`;

const ToggleLink = styled.button`
  background: none;
  border: none;
  color: #E2E8F0;
  font-family: 'Outfit', sans-serif;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
  &:hover { text-decoration: underline; }
`;

const Divider = styled.div`
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
  margin: 16px 0;
  width: 100%;
`;

const ActionButtonGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  margin-top: 16px;
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 500;
  padding: 9px 20px;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  flex: 1;
  min-width: 0;
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  white-space: nowrap;

  ${({ $variant = 'primary' }) =>
    $variant === 'primary' &&
    `
    background: #FFFFFF;
    color: #000000;
    &:hover:not(:disabled) {
      background: #10B981;
      color: #FFFFFF;
    }
  `}

  ${({ $variant }) =>
    $variant === 'secondary' &&
    `
    background: transparent;
    color: #E2E8F0;
    border: 1px solid rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(12px);
    &:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.1);
      color: #FFFFFF;
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid #E2E8F0;
    outline-offset: 2px;
  }
`;

const AdvancedToggle = styled.button`
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 0;
  transition: color 0.2s;

  &:hover {
    color: #FFFFFF;
  }
`;

const SuccessWrapper = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  gap: 20px;
  padding: 20px 0;
  width: 100%;
`;

const SuccessIcon = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 9999px;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #22C55E;
`;

const SuccessId = styled.div`
  font-family: monospace;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.03);
  border: 1px dashed rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 10px 16px;
  word-break: break-all;
  width: 100%;
`;

const ErrorBanner = styled.div`
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 14px;
  padding: 12px 16px;
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  color: #FCA5A5;
  width: 100%;
`;

// ─── Component ────────────────────────────────────────────────────────────────

export function PaymentRequestModal({
  isOpen,
  onClose,
  requesterWallet,
}: PaymentRequestModalProps) {
  const { tokens } = useTokenRegistry();

  const { data: contactsData, isLoading: isLoadingContacts } = useGetContacts();
  const { mutate, isLoading, isError, errorMessage } = useCreatePaymentRequest();

  const [isChoosingContact, setIsChoosingContact] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const defaultMint = tokens.length > 0 ? tokens[0].mint : '';

  const [form, setForm] = useState({
    payerWallet: '',
    businessName: '',
    amount: '',
    assetMint: defaultMint,
    notificationType: 'NONE' as NotificationType,
    targetNotification: '',
    phonePrefix: '+1',
    phoneNumber: '',
    reference: '',
    numericalReference: '',
    expirationDate: '',
  });

  const handleModalClose = () => {
    setSuccessId(null);
    setSelectedContact(null);
    setIsChoosingContact(false);
    setShowAdvanced(false);
    setForm({
      payerWallet: '',
      businessName: '',
      amount: '',
      assetMint: defaultMint,
      notificationType: 'NONE',
      targetNotification: '',
      phonePrefix: '+1',
      phoneNumber: '',
      reference: '',
      numericalReference: '',
      expirationDate: '',
    });
    onClose();
  };

  const handleContactChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const contact = contactsData?.data.find(c => c.id === e.target.value) ?? null;
    setSelectedContact(contact);
    if (contact) {
      setForm(prev => {
        let notificationType = prev.notificationType;
        let targetNotification = prev.targetNotification;
        let phonePrefix = prev.phonePrefix;
        let phoneNumber = prev.phoneNumber;

        if (contact.email) {
          notificationType = 'EMAIL';
          targetNotification = contact.email;
        } else if (contact.telephone) {
          notificationType = 'PHONE';
          const match = contact.telephone.match(/^(\+\d{1,4})\s*(.*)$/);
          if (match) {
            phonePrefix = match[1];
            phoneNumber = match[2];
          } else {
            phoneNumber = contact.telephone;
          }
        } else {
          notificationType = 'NONE';
          targetNotification = '';
        }

        return {
          ...prev,
          payerWallet: contact.walletAddress,
          businessName: prev.businessName || contact.nickname || '',
          notificationType,
          targetNotification,
          phonePrefix,
          phoneNumber,
          assetMint: contact.mint && tokens.some(t => t.mint === contact.mint) ? contact.mint : prev.assetMint,
        };
      });
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setForm(prev => {
      const next = { ...prev, [name]: value };

      // Auto-fill notification from contact when type changes
      if (name === 'notificationType' && selectedContact) {
        next.notificationType = value as NotificationType;
        if (value === 'EMAIL') {
          next.targetNotification = selectedContact.email || '';
        } else if (value === 'PHONE') {
          if (selectedContact.telephone) {
            const match = selectedContact.telephone.match(/^(\+\d{1,4})\s*(.*)$/);
            if (match) {
              next.phonePrefix = match[1];
              next.phoneNumber = match[2];
            } else {
              next.phoneNumber = selectedContact.telephone;
            }
          }
        }
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requesterWallet) {
      toast.error('No requester wallet configured.');
      return;
    }

    const numRef = form.numericalReference
      ? parseInt(form.numericalReference, 10)
      : undefined;

    const payload: Parameters<typeof mutate>[0] = {
      requesterWallet,
      targetNotificationType: form.notificationType,
      amount: form.amount,
      assetMint: form.assetMint,
      payerWallet: form.payerWallet,
    };

    let finalTarget = form.targetNotification;
    if (form.notificationType === 'PHONE') {
      finalTarget = `${form.phonePrefix}${form.phoneNumber}`.trim();
    }

    if (form.notificationType !== 'NONE' && finalTarget) {
      payload.targetNotification = finalTarget;
    }
    if (form.reference) payload.reference = form.reference;
    if (form.businessName) payload.businessName = form.businessName;
    if (numRef !== undefined && !isNaN(numRef)) payload.numericalReference = numRef;
    if (form.expirationDate) payload.expirationDate = new Date(form.expirationDate).toISOString();

    const result = await mutate(payload);
    if (result.success && result.data) {
      setSuccessId(result.data.id);
      toast.success('Payment request sent!');
    } else {
      toast.error(result.error || 'Failed to send payment request.');
    }
  };

  const needsNotificationInput =
    form.notificationType === 'EMAIL' || form.notificationType === 'PHONE';

  return (
    <AnimatePresence>
      {isOpen && (
        <Overlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <ModalContent
            onClick={e => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', bounce: 0.4, duration: 0.6 }}
          >
            <CloseButton type="button" onClick={onClose} aria-label="Close">
              <X size={18} />
            </CloseButton>

            {successId ? (
              <SuccessWrapper
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', bounce: 0.4, duration: 0.7 }}
              >
                <SuccessIcon>
                  <CheckCircle size={36} />
                </SuccessIcon>
                <div>
                  <Title>Request Sent!</Title>
                  <Subtitle>
                    Your payment request has been created and the payer will be notified.
                  </Subtitle>
                </div>
                <SuccessId>{successId}</SuccessId>
                <ActionButton $variant="primary" type="button" onClick={onClose} style={{ marginTop: '24px' }}>
                  Done
                </ActionButton>
              </SuccessWrapper>
            ) : (
              <>
                <Title>Ask for a Payment</Title>
                <Subtitle>
                  Request a payment from another Solana wallet. The payer will receive a
                  notification with the payment details.
                </Subtitle>

                {isError && errorMessage && (
                  <ErrorBanner style={{ marginBottom: '20px' }}>{errorMessage}</ErrorBanner>
                )}

                <Form onSubmit={handleSubmit}>
                  {/* ── PAYER WALLET ── */}
                  <FieldGroup>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <FieldLabel style={{ marginBottom: 0 }}>Payer Wallet *</FieldLabel>
                      <ToggleLink
                        type="button"
                        onClick={() => {
                          setIsChoosingContact(v => !v);
                          setSelectedContact(null);
                          setForm(prev => ({ ...prev, payerWallet: '', businessName: '' }));
                        }}
                      >
                        {isChoosingContact ? 'Enter manually' : 'Use contact'}
                      </ToggleLink>
                    </div>
                    {isChoosingContact ? (
                      <Select
                        id="pr-contact-select"
                        value={selectedContact?.id ?? ''}
                        onChange={handleContactChange}
                        required
                      >
                        <option value="" disabled>Select a contact…</option>
                        {isLoadingContacts ? (
                          <option disabled>Loading contacts…</option>
                        ) : (
                          contactsData?.data.map(c => (
                            <option key={c.id} value={c.id}>
                              {c.nickname || c.walletAddress}
                            </option>
                          ))
                        )}
                      </Select>
                    ) : (
                      <TextInput
                        id="pr-payerWallet"
                        name="payerWallet"
                        value={form.payerWallet}
                        onChange={handleChange}
                        placeholder="Payer's Solana wallet address"
                        required
                      />
                    )}
                  </FieldGroup>

                  {/* ── ASSET & AMOUNT ── */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <FieldGroup>
                      <FieldLabel>Asset *</FieldLabel>
                      <Select
                        id="pr-assetMint"
                        name="assetMint"
                        value={form.assetMint}
                        onChange={handleChange}
                        required
                      >
                        <optgroup label="Available Tokens">
                          {tokens.map((token) => (
                            <option key={token.mint} value={token.mint}>{token.symbol}</option>
                          ))}
                        </optgroup>
                      </Select>
                    </FieldGroup>
                    
                    <FieldGroup>
                      <FieldLabel>Amount *</FieldLabel>
                      <TextInput
                        id="pr-amount"
                        name="amount"
                        type="text"
                        inputMode="decimal"
                        value={form.amount}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (/^[0-9]*\.?[0-9]*$/.test(val)) {
                            handleChange(e);
                          }
                        }}
                        placeholder="0.00"
                        required
                      />
                    </FieldGroup>
                  </div>

                  {/* ── NOTIFICATION TYPE ── */}
                  <FieldGroup>
                    <FieldLabel>Notify Payer Via</FieldLabel>
                    <Select
                      id="pr-notificationType"
                      name="notificationType"
                      value={form.notificationType}
                      onChange={handleChange}
                    >
                      <option value="NONE">None (no notification)</option>
                      <option value="EMAIL">Email</option>
                      <option value="PHONE">Phone / SMS</option>
                      <option value="PUSH">Push Notification</option>
                    </Select>
                  </FieldGroup>

                  {/* ── TARGET NOTIFICATION ── */}
                  {needsNotificationInput && (
                    <FieldGroup>
                      <FieldLabel>
                        {form.notificationType === 'EMAIL' ? 'Email Address *' : 'Phone Number *'}
                      </FieldLabel>
                      {form.notificationType === 'EMAIL' ? (
                        <TextInput
                          id="pr-targetNotification"
                          name="targetNotification"
                          type="email"
                          value={form.targetNotification}
                          onChange={handleChange}
                          placeholder="payer@example.com"
                          required
                        />
                      ) : (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <Select
                            name="phonePrefix"
                            value={form.phonePrefix}
                            onChange={handleChange}
                            style={{ width: '140px', flexShrink: 0 }}
                          >
                            <option value="+1">+1 (US/CA)</option>
                            <option value="+44">+44 (UK)</option>
                            <option value="+52">+52 (MX)</option>
                            <option value="+34">+34 (ES)</option>
                            <option value="+57">+57 (CO)</option>
                            <option value="+54">+54 (AR)</option>
                            <option value="+55">+55 (BR)</option>
                            <option value="+56">+56 (CL)</option>
                            <option value="+51">+51 (PE)</option>
                            <option value="+49">+49 (DE)</option>
                            <option value="+33">+33 (FR)</option>
                            <option value="+81">+81 (JP)</option>
                            <option value="+61">+61 (AU)</option>
                          </Select>
                          <TextInput
                            id="pr-phoneNumber"
                            name="phoneNumber"
                            type="tel"
                            maxLength={10}
                            value={form.phoneNumber}
                            onChange={handleChange}
                            placeholder="555 000 0000"
                            required
                          />
                        </div>
                      )}
                    </FieldGroup>
                  )}

                  <Divider />

                  <AdvancedToggle type="button" onClick={() => setShowAdvanced(!showAdvanced)}>
                    {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    Advanced Options
                  </AdvancedToggle>

                  {showAdvanced && (
                    <>
                      {/* ── BUSINESS NAME ── */}
                      <FieldGroup>
                        <FieldLabel>Business Name (Optional)</FieldLabel>
                        <TextInput
                          id="pr-businessName"
                          name="businessName"
                          value={form.businessName}
                          onChange={handleChange}
                          placeholder="e.g. Acme Corp"
                        />
                      </FieldGroup>

                      {/* ── REFERENCE ── */}
                      <FieldGroup>
                        <FieldLabel>Reference / Concept (Optional)</FieldLabel>
                        <TextInput
                          id="pr-reference"
                          name="reference"
                          value={form.reference}
                          onChange={handleChange}
                          placeholder="e.g. Invoice #1042"
                        />
                      </FieldGroup>

                      {/* ── NUMERICAL REFERENCE ── */}
                      <FieldGroup>
                        <FieldLabel>Numerical Reference (6 digits, optional)</FieldLabel>
                        <TextInput
                          id="pr-numericalReference"
                          name="numericalReference"
                          type="number"
                          min="100000"
                          max="999999"
                          value={form.numericalReference}
                          onChange={handleChange}
                          placeholder="e.g. 104200"
                        />
                      </FieldGroup>

                      {/* ── EXPIRATION DATE ── */}
                      <FieldGroup>
                        <FieldLabel>Expiration Date (Optional)</FieldLabel>
                        <TextInput
                          id="pr-expirationDate"
                          name="expirationDate"
                          type="datetime-local"
                          value={form.expirationDate}
                          onChange={handleChange}
                          min={new Date().toISOString().slice(0, 16)}
                          style={{ colorScheme: 'dark' }}
                        />
                        <FieldHelpText>
                          If set, a reminder is sent 1 day before and on the day of expiration. If empty, a reminder is sent 7 days after creation.
                        </FieldHelpText>
                      </FieldGroup>
                    </>
                  )}

                  <ActionButtonGroup>
                    <ActionButton
                      $variant="primary"
                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading ? <span className="loader" style={{width: 16, height: 16}} /> : <Send size={14} />}
                      {isLoading ? 'Sending…' : 'Send Request'}
                    </ActionButton>
                    <ActionButton $variant="secondary" type="button" onClick={onClose} disabled={isLoading}>
                      Cancel
                    </ActionButton>
                  </ActionButtonGroup>
                </Form>
              </>
            )}
          </ModalContent>
        </Overlay>
      )}
    </AnimatePresence>
  );
}
