"use client";

import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  buildLuxorPayCheckoutPath,
} from '@/lib/luxor-pay-checkout-url';
import { generatePaymentReference } from '@/lib/solana-pay-url';
import { routeScannedPaymentContent } from '@/lib/qr-scan-routing';
import { QrCameraScanner } from '@/components/qr/QrCameraScanner';
import { useGetContacts } from '@/hooks/useGetContacts';
import { Camera, QrCode, ArrowLeft, X, Copy, Check, ExternalLink } from 'lucide-react';

interface QrOperationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  merchantWallet: string | null;
  recipientLabel?: string | null;
  initialMode?: 'select' | 'receive' | 'scan';
}

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
  align-items: ${({ $wide }) => ($wide ? 'stretch' : 'center')};
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
  font-size: 32px;
  font-weight: 500;
  letter-spacing: -1px;
  color: #FFFFFF;
  margin: 0 0 8px 0;
  text-align: center;
`;

const Subtitle = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-size: 15px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 32px 0;
  text-align: center;
  line-height: 1.5;
`;

const OptionButton = styled.button`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 24px;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 20px;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  margin-bottom: 16px;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(96, 165, 250, 0.4);
    transform: translateY(-2px);
  }

  &:focus-visible {
    outline: 2px solid #60A5FA;
    outline-offset: 2px;
  }

  &:last-of-type {
    margin-bottom: 0;
  }
`;

const IconWrapper = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: rgba(96, 165, 250, 0.1);
  color: #60A5FA;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const OptionTextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const OptionTitle = styled.span`
  font-family: 'Outfit', sans-serif;
  font-size: 18px;
  font-weight: 500;
  color: #FFFFFF;
`;

const OptionDesc = styled.span`
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.5);
`;

const ReceiveLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  width: 100%;
  align-items: start;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 24px;
  }
`;

const ReceiveHeader = styled.div`
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  min-width: 0;

  @media (max-width: 768px) {
    order: 1;
  }
`;

const ReceiveConfigSection = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  grid-column: 1;
  grid-row: 2;

  @media (max-width: 768px) {
    order: 4;
    grid-column: auto;
    grid-row: auto;
  }
`;

const ReceiveVisualWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 0;
  width: 100%;
  grid-column: 2;
  grid-row: 2;

  @media (max-width: 768px) {
    display: contents;
    grid-column: auto;
    grid-row: auto;
  }
`;

const ReceiveQrSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;

  @media (max-width: 768px) {
    order: 2;
  }
`;

const ReceiveAddressSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;

  @media (max-width: 768px) {
    order: 3;
  }
`;

const ReceiveTitle = styled(Title)`
  text-align: left;
`;

const ReceiveSubtitle = styled(Subtitle)`
  text-align: left;
  margin-bottom: 24px;
`;

const QrContainer = styled.div`
  background: #FFFFFF;
  padding: 28px;
  border-radius: 24px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 16px 32px rgba(0,0,0,0.5);
  width: 100%;
  max-width: 320px;
`;

const AddressLabel = styled.span`
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.05em;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 8px;
  text-transform: uppercase;
`;

const RightAddressLabel = styled(AddressLabel)`
  align-self: flex-start;
  width: 100%;
`;

const AddressWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(96, 165, 250, 0.1);
  border: 1px dashed rgba(96, 165, 250, 0.3);
  border-radius: 12px;
  padding: 12px 16px;
  width: 100%;
  margin-bottom: 24px;
`;

const AddressText = styled.span`
  font-family: monospace;
  font-size: 15px;
  color: #60A5FA;
  word-break: break-all;
  flex: 1;
  text-align: left;
`;

const PaymentLinkActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  max-width: 320px;
  margin-bottom: 16px;
`;

const IconButton = styled.button<{ $copied?: boolean }>`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: ${({ $copied }) => ($copied ? '#10B981' : '#FFFFFF')};
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const BackNav = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s;
  margin-bottom: 24px;
  align-self: flex-start;
  padding: 0;

  &:hover {
    color: #FFFFFF;
  }
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  font-family: 'Outfit', sans-serif;
  font-size: 16px;
  font-weight: 500;
  padding: 14px 24px;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;

  &:last-of-type {
    margin-bottom: 0;
  }

  ${({ $variant = 'primary' }) =>
    $variant === 'primary' &&
    `
    background: #FFFFFF;
    color: #000000;
    &:hover {
      background: #2563EB;
      color: #FFFFFF;
    }
  `}

  ${({ $variant }) =>
    $variant === 'secondary' &&
    `
    background: transparent;
    color: #60A5FA;
    border: 1px solid rgba(255, 255, 255, 0.2);
    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }
  `}
`;

const ConfigFields = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
`;

const InputRow = styled.div`
  display: flex;
  gap: 12px;
  width: 100%;
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
    border-color: #60A5FA;
    box-shadow: 0 0 0 1px rgba(96, 165, 250, 0.2);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }
`;

const AmountInput = styled(TextInput)`
  flex: 1;
  width: auto;
`;

const TokenSelect = styled.select`
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
  width: 110px;

  &:focus {
    outline: none;
    border-color: #60A5FA;
  }

  option {
    background: #0A0A0A;
    color: #FFFFFF;
  }
`;

const FieldLabel = styled.span`
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.05em;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 8px;
  display: block;
`;

const FieldGroup = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ContactSelect = styled.select`
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
    border-color: #60A5FA;
    box-shadow: 0 0 0 1px rgba(96, 165, 250, 0.2);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  option {
    background: #0A0A0A;
    color: #FFFFFF;
  }
`;

export function QrOperationsModal({
  isOpen,
  onClose,
  merchantWallet,
  recipientLabel,
  initialMode = 'select',
}: QrOperationsModalProps) {
  const router = useRouter();
  const { data: contactsData, isLoading: isLoadingContacts, refetch: refetchContacts } =
    useGetContacts();
  const [mode, setMode] = useState<'select' | 'receive' | 'scan'>('select');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('SOL');
  const [chargeNote, setChargeNote] = useState('');
  const [selectedContactId, setSelectedContactId] = useState('');
  const [origin, setOrigin] = useState(() =>
    typeof window !== 'undefined' ? window.location.origin : '',
  );
  const [linkCopied, setLinkCopied] = useState(false);
  const [addressCopied, setAddressCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setAmount('');
      setCurrency('SOL');
      setChargeNote('');
      setSelectedContactId('');
      setLinkCopied(false);
      setAddressCopied(false);
      void refetchContacts();
    }
  }, [isOpen, initialMode, refetchContacts]);

  const allContacts = useMemo(
    () => contactsData?.data ?? [],
    [contactsData],
  );

  const selectedContact = useMemo(() => {
    if (!selectedContactId) return null;
    return allContacts.find((c) => c.id === selectedContactId) ?? null;
  }, [selectedContactId, allContacts]);

  const recipientWallet = useMemo(() => {
    if (selectedContact) {
      const address = selectedContact.walletAddress?.trim();
      return address || null;
    }
    return merchantWallet?.trim() || null;
  }, [selectedContact, merchantWallet]);

  const checkoutLabel = useMemo(() => {
    const note = chargeNote.trim();
    if (note) return note;
    if (selectedContact) {
      const nickname = selectedContact.nickname?.trim();
      if (nickname) return nickname;
      const email = selectedContact.email?.trim();
      if (email) return email;
      return undefined;
    }
    return recipientLabel?.trim() || undefined;
  }, [chargeNote, selectedContact, recipientLabel]);

  const exitScanMode = () => {
    if (initialMode === 'scan') {
      onClose();
    } else {
      setMode('select');
    }
  };

  const exitReceiveMode = () => {
    if (initialMode === 'receive') {
      onClose();
    } else {
      setMode('select');
    }
  };

  const chargeRef = useMemo(() => {
    if (amount && parseFloat(amount) > 0) {
      return generatePaymentReference();
    }
    return undefined;
  }, [amount, selectedContact?.id]);

  const receiveCheckoutParams = useMemo(() => {
    if (!recipientWallet) return null;

    const baseParams = {
      recipient: recipientWallet,
      label: checkoutLabel,
    };

    if (amount && parseFloat(amount) > 0) {
      return {
        ...baseParams,
        amount,
        currency,
        chargeRef,
      };
    }

    return baseParams;
  }, [recipientWallet, checkoutLabel, amount, currency, chargeRef]);

  const receiveCheckoutPath = useMemo(() => {
    if (!receiveCheckoutParams) return null;
    return buildLuxorPayCheckoutPath(receiveCheckoutParams);
  }, [receiveCheckoutParams]);

  const receivePaymentLinkUrl = useMemo(() => {
    if (!receiveCheckoutPath || !origin) return null;
    return `${origin}${receiveCheckoutPath}`;
  }, [receiveCheckoutPath, origin]);

  const selectedContactName = useMemo(() => {
    if (!selectedContact) return null;
    return (
      selectedContact.nickname?.trim() ||
      selectedContact.email?.trim() ||
      selectedContact.walletAddress?.trim() ||
      'contact'
    );
  }, [selectedContact]);

  const isContactPaymentLinkReady = Boolean(
    selectedContact && receivePaymentLinkUrl,
  );

  if (!isOpen) return null;

  function handleScannedResult(result: string): void {
    const route = routeScannedPaymentContent(result);

    switch (route.type) {
      case 'qr_direct':
        router.push(route.url);
        toast.success('QR checkout detected');
        onClose();
        return;
      case 'link':
        router.push(`/pay/link/${route.linkId}`);
        toast.success('Payment link detected');
        onClose();
        return;
      case 'reference':
        router.push(`/pay/${route.reference}`);
        toast.success('Payment reference detected');
        onClose();
        return;
      case 'wallet':
        router.push(`/pay/qr?recipient=${route.address}`);
        toast.success('Merchant wallet detected. Opening checkout.');
        onClose();
        return;
      default:
        toast.error('Invalid payment QR code');
    }
  }

  const handleCopyPaymentLink = async () => {
    if (!receivePaymentLinkUrl) return;

    try {
      await navigator.clipboard.writeText(receivePaymentLinkUrl);
      setLinkCopied(true);
      toast.success('Payment link copied');
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      toast.error('Could not copy the link');
    }
  };

  const handleCopyAddress = async () => {
    if (!recipientWallet) return;

    try {
      await navigator.clipboard.writeText(recipientWallet);
      setAddressCopied(true);
      toast.success('Address copied');
      setTimeout(() => setAddressCopied(false), 2000);
    } catch {
      toast.error('Could not copy the address');
    }
  };

  const handleOpenPaymentPage = () => {
    if (!receiveCheckoutPath) return;
    window.open(receiveCheckoutPath, '_blank', 'noopener,noreferrer');
  };

  const handleSendPaymentLink = async () => {
    if (!receivePaymentLinkUrl || !selectedContact) return;

    const contactName = selectedContactName ?? 'contact';

    try {
      await navigator.clipboard.writeText(receivePaymentLinkUrl);
      setLinkCopied(true);
      toast.success(`Payment link copied for ${contactName}`);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      toast.error('Could not copy the link');
    }
  };

  return (
    <AnimatePresence>
      <Overlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <ModalContent
          $wide={mode === 'receive'}
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", bounce: 0.4, duration: 0.6 }}
        >
          <CloseButton onClick={onClose}>
            <X size={18} />
          </CloseButton>

          {/* MODE 1: SELECTOR */}
          {mode === 'select' && (
            <>
              <Title>QR Operations</Title>
              <Subtitle>Choose whether you want to create a QR charge to receive money or read a QR payment code to send.</Subtitle>

              <OptionButton onClick={() => setMode('receive')}>
                <IconWrapper>
                  <QrCode size={28} />
                </IconWrapper>
                <OptionTextWrapper>
                  <OptionTitle>Create a QR charge</OptionTitle>
                  <OptionDesc>Show your QR to receive direct payments or links</OptionDesc>
                </OptionTextWrapper>
              </OptionButton>

              <OptionButton onClick={() => setMode('scan')}>
                <IconWrapper>
                  <Camera size={28} />
                </IconWrapper>
                <OptionTextWrapper>
                  <OptionTitle>Read a QR code</OptionTitle>
                  <OptionDesc>Scan charge codes to pay instantly</OptionDesc>
                </OptionTextWrapper>
              </OptionButton>
            </>
          )}

          {/* MODE 2: RECEIVE / COBRO */}
          {mode === 'receive' && (
            <ReceiveLayout>
              <ReceiveHeader>
                {initialMode !== 'receive' && (
                  <BackNav onClick={() => setMode('select')}>
                    <ArrowLeft size={16} /> Back
                  </BackNav>
                )}

                <ReceiveTitle>Create QR Charge</ReceiveTitle>
                <ReceiveSubtitle>
                  {selectedContact
                    ? `Payment link ready to share with ${selectedContactName}. Funds will go to the contact's wallet.`
                    : 'Show this QR to receive deposits to your wallet. Leave the amount empty for an open charge.'}
                </ReceiveSubtitle>
              </ReceiveHeader>

              <ReceiveVisualWrapper>
                {recipientWallet && receivePaymentLinkUrl ? (
                  <>
                    <ReceiveQrSection>
                      <PaymentLinkActions>
                        <IconButton
                          type="button"
                          $copied={linkCopied}
                          onClick={handleCopyPaymentLink}
                          title={linkCopied ? 'Copied' : 'Copy link'}
                          aria-label="Copy payment link"
                        >
                          {linkCopied ? <Check size={14} /> : <Copy size={14} />}
                        </IconButton>
                        <IconButton
                          type="button"
                          onClick={handleOpenPaymentPage}
                          disabled={!receiveCheckoutPath}
                          title="Open payment page"
                          aria-label="Open payment page"
                        >
                          <ExternalLink size={14} />
                        </IconButton>
                      </PaymentLinkActions>

                      <QrContainer>
                        <QRCodeSVG
                          key={receivePaymentLinkUrl}
                          value={receivePaymentLinkUrl}
                          size={260}
                          level="H"
                          includeMargin={false}
                        />
                      </QrContainer>
                    </ReceiveQrSection>

                    <ReceiveAddressSection>
                      <RightAddressLabel>
                        {selectedContact ? 'Contact wallet address' : 'Your deposit address'}
                      </RightAddressLabel>
                      <AddressWrapper>
                        <AddressText>{recipientWallet}</AddressText>
                        <IconButton
                          type="button"
                          $copied={addressCopied}
                          onClick={handleCopyAddress}
                          title={addressCopied ? 'Copied' : 'Copy address'}
                          aria-label="Copy deposit address"
                        >
                          {addressCopied ? <Check size={14} /> : <Copy size={14} />}
                        </IconButton>
                      </AddressWrapper>
                    </ReceiveAddressSection>
                  </>
                ) : null}
              </ReceiveVisualWrapper>

              <ReceiveConfigSection>
                <ConfigFields>
                  <FieldGroup>
                    <FieldLabel>Contact (optional)</FieldLabel>
                    <ContactSelect
                      value={selectedContactId}
                      onChange={(e) => setSelectedContactId(e.target.value)}
                      disabled={isLoadingContacts}
                      aria-label="Select contact"
                    >
                      <option value="">None</option>
                      {allContacts.map((contact) => (
                        <option key={contact.id} value={contact.id}>
                          {contact.nickname?.trim() ||
                            contact.email?.trim() ||
                            contact.walletAddress?.trim() ||
                            'Contact'}
                        </option>
                      ))}
                    </ContactSelect>
                  </FieldGroup>

                  <FieldGroup>
                    <FieldLabel>Amount (optional)</FieldLabel>
                    <InputRow>
                      <AmountInput
                        type="text"
                        inputMode="decimal"
                        placeholder="Open amount if left empty"
                        value={amount}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (/^[0-9]*\.?[0-9]*$/.test(val)) {
                            setAmount(val);
                          }
                        }}
                      />
                      <TokenSelect
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        aria-label="Currency"
                      >
                        <option value="SOL">SOL</option>
                        <option value="USDC">USDC</option>
                        <option value="LXR">LXR</option>
                      </TokenSelect>
                    </InputRow>
                  </FieldGroup>

                  <FieldGroup>
                    <FieldLabel>Description (optional)</FieldLabel>
                    <TextInput
                      type="text"
                      placeholder="Charge description"
                      value={chargeNote}
                      onChange={(e) => setChargeNote(e.target.value)}
                      maxLength={120}
                      aria-label="Charge description"
                    />
                  </FieldGroup>
                </ConfigFields>

                {!(recipientWallet && receivePaymentLinkUrl) && (
                  <div style={{ marginBottom: '24px', color: '#F87171' }}>
                    {selectedContact
                      ? 'The selected contact has no wallet address.'
                      : 'No configured address found. Add it in Settings.'}
                  </div>
                )}

                {selectedContact ? (
                  <ActionButton
                    type="button"
                    $variant="primary"
                    onClick={handleSendPaymentLink}
                    disabled={!isContactPaymentLinkReady}
                  >
                    {linkCopied ? 'Link copied!' : 'Send payment link'}
                  </ActionButton>
                ) : (
                  <ActionButton type="button" $variant="secondary" onClick={exitReceiveMode}>
                    Cancel
                  </ActionButton>
                )}
              </ReceiveConfigSection>
            </ReceiveLayout>
          )}

          {/* MODE 3: SCAN / LEER PAGOS */}
          {mode === 'scan' && (
            <>
              {initialMode !== 'scan' && (
                <BackNav onClick={() => setMode('select')}>
                  <ArrowLeft size={16} /> Back
                </BackNav>
              )}

              <Title>Pay with QR</Title>
              <Subtitle>Align the Luxor Pay or Solana Pay QR code within the frame to pay.</Subtitle>

              <QrCameraScanner
                enabled={isOpen && mode === 'scan'}
                onDetect={handleScannedResult}
              />

              <ActionButton type="button" $variant="secondary" onClick={exitScanMode}>
                Cancel
              </ActionButton>
            </>
          )}

        </ModalContent>
      </Overlay>
    </AnimatePresence>
  );
}
