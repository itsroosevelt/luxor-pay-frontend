"use client";

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { TOKEN_REGISTRY } from '@/lib/token-registry';
import { getLuxorEnv } from '@/lib/luxor-env';
import { useGetContacts } from '@/hooks/useGetContacts';
import { useCreatePaymentRequest } from '@/hooks/useCreatePaymentRequest';
import { NotificationType } from '@/lib/payment-requests-api';
import { Contact } from '@/lib/contacts-api';
import { toast } from 'sonner';
import { CheckCircle, Copy, Send, X } from 'lucide-react';

interface PaymentRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  requesterWallet: string | null;
}

// ─── Styled Components ────────────────────────────────────────────────────────

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(12px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
`;

const ModalContent = styled(motion.div)`
  background: rgba(10, 10, 10, 0.97);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 32px 64px -16px rgba(0, 0, 0, 0.9);
  border-radius: 40px;
  width: 100%;
  max-width: 560px;
  padding: 40px;
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(96, 165, 250, 0.2) transparent;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.2s;
  &:hover { background: rgba(255, 255, 255, 0.1); color: #fff; }
  &:focus-visible { outline: 2px solid #60A5FA; outline-offset: 2px; }
`;

const Eyebrow = styled.span`
  font-family: 'Outfit', sans-serif;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.4em;
  text-transform: uppercase;
  color: #60A5FA;
  display: block;
  margin-bottom: 8px;
`;

const Title = styled.h2`
  font-family: 'Outfit', sans-serif;
  font-size: 32px;
  font-weight: 500;
  letter-spacing: -1px;
  color: #FFFFFF;
  margin: 0 0 6px 0;
`;

const Subtitle = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 32px 0;
  line-height: 1.6;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-family: 'Outfit', sans-serif;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
`;

const Input = styled.input`
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 14px 16px;
  color: #FFFFFF;
  font-family: 'Montserrat', sans-serif;
  font-size: 15px;
  width: 100%;
  transition: all 0.2s;
  &:focus-visible {
    outline: none;
    border-color: #60A5FA;
    box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.15);
    background: rgba(96, 165, 250, 0.04);
  }
  &::placeholder { color: rgba(255, 255, 255, 0.25); }
  &[type="date"] { color-scheme: dark; }
`;

const Select = styled.select`
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 14px 16px;
  color: #FFFFFF;
  font-family: 'Montserrat', sans-serif;
  font-size: 15px;
  width: 100%;
  transition: all 0.2s;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 16px center;
  background-size: 16px;
  &:focus-visible {
    outline: none;
    border-color: #60A5FA;
    box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.15);
  }
  & option { background: #0A0A0A; color: #FFFFFF; }
  & optgroup { background: #0A0A0A; color: #60A5FA; font-weight: 600; }
`;

const ToggleLink = styled.button`
  background: none;
  border: none;
  color: #60A5FA;
  font-family: 'Outfit', sans-serif;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.05em;
  cursor: pointer;
  padding: 0;
  text-transform: uppercase;
  &:hover { text-decoration: underline; }
  &:focus-visible { outline: 2px solid #60A5FA; outline-offset: 2px; border-radius: 4px; }
`;

const Divider = styled.div`
  height: 1px;
  background: rgba(255, 255, 255, 0.06);
  margin: 4px 0;
`;

const SectionLabel = styled.p`
  font-family: 'Outfit', sans-serif;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.3);
  margin: 0;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 8px;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  font-family: 'Outfit', sans-serif;
  font-size: 16px;
  font-weight: 500;
  padding: 15px 24px;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:focus-visible { outline: 2px solid #60A5FA; outline-offset: 2px; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }

  ${({ $variant = 'primary' }) =>
    $variant === 'primary' &&
    `background: linear-gradient(135deg, #2563EB, #3B82F6); color: #FFFFFF;
     &:hover:not(:disabled) { background: linear-gradient(135deg, #1D4ED8, #2563EB); transform: translateY(-1px); box-shadow: 0 8px 24px rgba(37, 99, 235, 0.4); }`}

  ${({ $variant }) =>
    $variant === 'secondary' &&
    `background: transparent; color: #60A5FA;
     border: 1px solid rgba(255, 255, 255, 0.15);
     &:hover:not(:disabled) { background: rgba(255, 255, 255, 0.06); }`}
`;

// Success State
const SuccessWrapper = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 20px;
  padding: 20px 0;
`;

const SuccessIcon = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 9999px;
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.2), rgba(96, 165, 250, 0.1));
  border: 1px solid rgba(96, 165, 250, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #60A5FA;
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
`;

const ErrorBanner = styled.div`
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 14px;
  padding: 12px 16px;
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  color: #FCA5A5;
`;

// ─── Component ────────────────────────────────────────────────────────────────

export function PaymentRequestModal({
  isOpen,
  onClose,
  requesterWallet,
}: PaymentRequestModalProps) {
  const env = getLuxorEnv();
  const isDev = env === 'development';
  const tokenRegistry = isDev ? TOKEN_REGISTRY['devnet'] : TOKEN_REGISTRY['mainnet-beta'];

  const { data: contactsData, isLoading: isLoadingContacts } = useGetContacts();
  const { mutate, isLoading, isError, errorMessage } = useCreatePaymentRequest();

  const [isChoosingContact, setIsChoosingContact] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  const defaultMint = Object.keys(tokenRegistry)[0] ?? '';

  const [form, setForm] = useState({
    payerWallet: '',
    businessName: '',
    amount: '',
    assetMint: defaultMint,
    notificationType: 'NONE' as NotificationType,
    targetNotification: '',
    reference: '',
    numericalReference: '',
    expirationDate: '',
  });

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setSuccessId(null);
      setSelectedContact(null);
      setIsChoosingContact(false);
      setForm({
        payerWallet: '',
        businessName: '',
        amount: '',
        assetMint: defaultMint,
        notificationType: 'NONE',
        targetNotification: '',
        reference: '',
        numericalReference: '',
        expirationDate: '',
      });
    }
  }, [isOpen, defaultMint]);

  if (!isOpen) return null;

  const handleContactChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const contact = contactsData?.data.find(c => c.id === e.target.value) ?? null;
    setSelectedContact(contact);
    if (contact) {
      setForm(prev => ({
        ...prev,
        payerWallet: contact.walletAddress,
        businessName: prev.businessName || contact.nickname || '',
        targetNotification:
          prev.notificationType === 'EMAIL'
            ? contact.email || ''
            : prev.notificationType === 'PHONE'
            ? contact.telephone || ''
            : prev.targetNotification,
      }));
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    // Auto-fill notification from contact when type changes
    if (name === 'notificationType' && selectedContact) {
      setForm(prev => ({
        ...prev,
        notificationType: value as NotificationType,
        targetNotification:
          value === 'EMAIL'
            ? selectedContact.email || ''
            : value === 'PHONE'
            ? selectedContact.telephone || ''
            : '',
      }));
    }
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

    if (form.notificationType !== 'NONE' && form.targetNotification) {
      payload.targetNotification = form.targetNotification;
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
      <Overlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <ModalContent
          onClick={e => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 24 }}
          transition={{ type: 'spring', bounce: 0.35, duration: 0.6 }}
        >
          <CloseButton type="button" onClick={onClose} aria-label="Close">
            <X size={16} />
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
                <Title style={{ fontSize: '28px', marginBottom: '8px' }}>Request Sent!</Title>
                <Subtitle style={{ marginBottom: '0' }}>
                  Your payment request has been created and the payer will be notified.
                </Subtitle>
              </div>
              <SuccessId>{successId}</SuccessId>
              <Button $variant="primary" type="button" onClick={onClose} style={{ maxWidth: '240px' }}>
                Done
              </Button>
            </SuccessWrapper>
          ) : (
            <>
              <Eyebrow>New Feature</Eyebrow>
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
                <FormGroup>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Label htmlFor="pr-payerWallet">Payer Wallet *</Label>
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
                    <Input
                      id="pr-payerWallet"
                      name="payerWallet"
                      value={form.payerWallet}
                      onChange={handleChange}
                      placeholder="Payer's Solana wallet address"
                      required
                    />
                  )}
                </FormGroup>

                {/* ── BUSINESS NAME ── */}
                <FormGroup>
                  <Label htmlFor="pr-businessName">Business Name (Optional)</Label>
                  <Input
                    id="pr-businessName"
                    name="businessName"
                    value={form.businessName}
                    onChange={handleChange}
                    placeholder="e.g. Acme Corp"
                  />
                </FormGroup>

                <Divider />
                <SectionLabel>Payment Details</SectionLabel>

                {/* ── ASSET MINT ── */}
                <FormGroup>
                  <Label htmlFor="pr-assetMint">Asset *</Label>
                  <Select
                    id="pr-assetMint"
                    name="assetMint"
                    value={form.assetMint}
                    onChange={handleChange}
                    required
                  >
                    <optgroup label={isDev ? 'Devnet Tokens' : 'Mainnet Tokens'}>
                      {Object.entries(tokenRegistry).map(([mint, symbol]) => (
                        <option key={mint} value={mint}>{symbol} — {mint.slice(0, 8)}…</option>
                      ))}
                    </optgroup>
                  </Select>
                </FormGroup>

                {/* ── AMOUNT ── */}
                <FormGroup>
                  <Label htmlFor="pr-amount">Amount *</Label>
                  <Input
                    id="pr-amount"
                    name="amount"
                    type="number"
                    step="any"
                    min="0"
                    value={form.amount}
                    onChange={handleChange}
                    placeholder="0.00"
                    required
                  />
                </FormGroup>

                {/* ── REFERENCE ── */}
                <FormGroup>
                  <Label htmlFor="pr-reference">Reference / Concept (Optional)</Label>
                  <Input
                    id="pr-reference"
                    name="reference"
                    value={form.reference}
                    onChange={handleChange}
                    placeholder="e.g. Invoice #1042 — Web dev services"
                  />
                </FormGroup>

                <Divider />
                <SectionLabel>Notification</SectionLabel>

                {/* ── NOTIFICATION TYPE ── */}
                <FormGroup>
                  <Label htmlFor="pr-notificationType">Notify Payer Via</Label>
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
                </FormGroup>

                {/* ── TARGET NOTIFICATION ── */}
                {needsNotificationInput && (
                  <FormGroup>
                    <Label htmlFor="pr-targetNotification">
                      {form.notificationType === 'EMAIL' ? 'Email Address *' : 'Phone Number *'}
                    </Label>
                    <Input
                      id="pr-targetNotification"
                      name="targetNotification"
                      type={form.notificationType === 'EMAIL' ? 'email' : 'tel'}
                      value={form.targetNotification}
                      onChange={handleChange}
                      placeholder={
                        form.notificationType === 'EMAIL'
                          ? 'payer@example.com'
                          : '+1 555 000 0000'
                      }
                      required
                    />
                  </FormGroup>
                )}

                <Divider />
                <SectionLabel>Optional Details</SectionLabel>

                {/* ── NUMERICAL REFERENCE ── */}
                <FormGroup>
                  <Label htmlFor="pr-numericalReference">Numerical Reference (6 digits, optional)</Label>
                  <Input
                    id="pr-numericalReference"
                    name="numericalReference"
                    type="number"
                    min="100000"
                    max="999999"
                    value={form.numericalReference}
                    onChange={handleChange}
                    placeholder="e.g. 104200"
                  />
                </FormGroup>

                {/* ── EXPIRATION DATE ── */}
                <FormGroup>
                  <Label htmlFor="pr-expirationDate">Expiration Date (Optional)</Label>
                  <Input
                    id="pr-expirationDate"
                    name="expirationDate"
                    type="date"
                    value={form.expirationDate}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </FormGroup>

                <ButtonGroup>
                  <Button $variant="secondary" type="button" onClick={onClose} disabled={isLoading}>
                    Cancel
                  </Button>
                  <Button
                    $variant="primary"
                    type="submit"
                    disabled={isLoading}
                    aria-busy={isLoading}
                  >
                    <Send size={16} />
                    {isLoading ? 'Sending…' : 'Send Request'}
                  </Button>
                </ButtonGroup>
              </Form>
            </>
          )}
        </ModalContent>
      </Overlay>
    </AnimatePresence>
  );
}
