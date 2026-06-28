"use client";

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { TOKEN_REGISTRY } from '@/lib/token-registry';
import { getLuxorEnv } from '@/lib/luxor-env';
import { toast } from 'sonner';
import { extractWalletAddressFromScan } from '@/lib/qr-scan-routing';
import { QrCameraScanner } from '@/components/qr/QrCameraScanner';
import { Camera, ArrowLeft, CheckCircle } from 'lucide-react';

interface ScanChargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultAmount?: string;
  defaultToken?: string;
  linkName?: string;
}

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
`;

const ModalContent = styled(motion.div)`
  background: rgba(10, 10, 10, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 32px 64px -16px rgba(0,0,0,0.8);
  border-radius: 40px;
  width: 100%;
  max-width: 500px;
  padding: 40px;
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
`;

const Title = styled.h2`
  font-family: 'Outfit', sans-serif;
  font-size: 32px;
  font-weight: 500;
  letter-spacing: -1px;
  color: #FFFFFF;
  margin: 0 0 8px 0;
`;

const Subtitle = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-size: 15px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 32px 0;
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
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.05em;
  color: rgba(255, 255, 255, 0.8);
`;

const Input = styled.input`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  color: #FFFFFF;
  font-family: 'Montserrat', sans-serif;
  font-size: 15px;
  transition: all 0.2s;

  &:focus-visible {
    outline: none;
    border-color: #60A5FA;
    box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.2);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }
`;

const Select = styled.select`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  color: #FFFFFF;
  font-family: 'Montserrat', sans-serif;
  font-size: 15px;
  transition: all 0.2s;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 16px center;
  background-size: 16px;

  &:focus-visible {
    outline: none;
    border-color: #60A5FA;
    box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.2);
  }

  & option {
    background: #0A0A0A;
    color: #FFFFFF;
  }
  
  & optgroup {
    background: #0A0A0A;
    color: #60A5FA;
    font-weight: 600;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 16px;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  font-family: 'Outfit', sans-serif;
  font-size: 16px;
  font-weight: 500;
  padding: 14px 24px;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:focus-visible {
    outline: 2px solid #60A5FA;
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  ${({ $variant = 'primary' }) =>
    $variant === 'primary' &&
    `
    background: #FFFFFF;
    color: #000000;
    &:hover:not(:disabled) {
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
    &:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.1);
    }
  `}
`;

const BackButton = styled.button`
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

const InfoCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 24px;
  text-align: left;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);

  &:last-child {
    border-bottom: none;
  }
`;

const InfoLabel = styled.span`
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
`;

const InfoValue = styled.span`
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #FFFFFF;
  max-width: 60%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export function ScanChargeModal({
  isOpen,
  onClose,
  defaultAmount,
  defaultToken,
  linkName
}: ScanChargeModalProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // 1: Setup, 2: Camera, 3: Confirm, 4: Success
  const [formData, setFormData] = useState({
    amount: '',
    token: 'SOL',
  });
  const [clientWallet, setClientWallet] = useState('');
  const [processing, setProcessing] = useState(false);
  const [scannerKey, setScannerKey] = useState(0);

  const env = getLuxorEnv();
  const isDev = env === 'development';

  // Auto-fill and skip Step 1 if default values are provided
  useEffect(() => {
    if (isOpen) {
      if (defaultAmount && defaultToken) {
        // Resolve defaultToken if it's a symbol to its mint address
        let resolvedToken = defaultToken;
        if (defaultToken !== 'SOL') {
          const network = isDev ? 'devnet' : 'mainnet-beta';
          const registry = TOKEN_REGISTRY[network] || {};
          const foundMint = Object.keys(registry).find(mint => registry[mint] === defaultToken);
          if (foundMint) {
            resolvedToken = foundMint;
          }
        }

        setFormData({
          amount: defaultAmount,
          token: resolvedToken,
        });
        setStep(2);
      } else {
        setFormData({
          amount: '',
          token: 'SOL',
        });
        setStep(1);
      }
      setClientWallet('');
    }
  }, [isOpen, defaultAmount, defaultToken, isDev]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStartScanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || Number(formData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    setStep(2);
    setScannerKey((key) => key + 1);
  };

  const handleScanDetect = (scannedText: string) => {
    const wallet = extractWalletAddressFromScan(scannedText);
    if (!wallet) {
      toast.error('Invalid wallet QR code');
      return;
    }

    setClientWallet(wallet);
    setStep(3);
    toast.success('QR Code successfully read');
  };

  const handleConfirmCharge = async () => {
    setProcessing(true);
    try {
      toast.error('Merchant charge-from-wallet requires a POS backend API (not implemented yet).');
    } finally {
      setProcessing(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setFormData({ amount: '', token: 'SOL' });
    setClientWallet('');
    setScannerKey(0);
    onClose();
  };

  const getSelectedTokenSymbol = () => {
    if (formData.token === 'SOL') return 'SOL';
    const network = isDev ? 'devnet' : 'mainnet-beta';
    return TOKEN_REGISTRY[network][formData.token] || 'Token';
  };

  return (
    <AnimatePresence>
      <Overlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      >
        <ModalContent
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", bounce: 0.4, duration: 0.6 }}
        >
          {/* STEP 1: SETUP CHARGE */}
          {step === 1 && (
            <>
              <Title>Scan & Charge</Title>
              <Subtitle>Enter the amount to charge and scan the client's QR code.</Subtitle>
              
              <Form onSubmit={handleStartScanner}>
                <FormGroup>
                  <Label>CHARGE AMOUNT *</Label>
                  <Input
                    type="number"
                    step="any"
                    min="0"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="0.00"
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label>TOKEN *</Label>
                  <Select
                    name="token"
                    value={formData.token}
                    onChange={handleChange}
                    required
                  >
                    <option value="SOL">Solana (SOL)</option>
                    {isDev ? (
                      <optgroup label="Devnet Tokens">
                        {Object.entries(TOKEN_REGISTRY['devnet']).map(([mint, symbol]) => (
                          <option key={mint} value={mint}>
                            {symbol}
                          </option>
                        ))}
                      </optgroup>
                    ) : (
                      <optgroup label="Mainnet Beta Tokens">
                        {Object.entries(TOKEN_REGISTRY['mainnet-beta']).map(([mint, symbol]) => (
                          <option key={mint} value={mint}>
                            {symbol}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </Select>
                </FormGroup>

                <ButtonGroup>
                  <Button type="button" $variant="secondary" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button type="submit" $variant="primary">
                    <Camera size={18} /> Start Scanner
                  </Button>
                </ButtonGroup>
              </Form>
            </>
          )}

          {/* STEP 2: CAMERA SCANNER */}
          {step === 2 && (
            <>
              <BackButton onClick={() => {
                if (defaultAmount && defaultToken) {
                  handleClose();
                } else {
                  setStep(1);
                }
              }}>
                <ArrowLeft size={16} /> Back
              </BackButton>
              <Title>Scanning QR</Title>
              {linkName ? (
                <Subtitle>
                  Charge for <strong style={{ color: '#60A5FA' }}>{linkName}</strong>. Align the client's wallet QR code inside the frame.
                </Subtitle>
              ) : (
                <Subtitle>Align the client's wallet QR code inside the frame.</Subtitle>
              )}

              <QrCameraScanner
                key={scannerKey}
                enabled={step === 2}
                onDetect={handleScanDetect}
                cameraErrorMessage="Could not access camera. Make sure to grant the necessary permissions."
              />

              <ButtonGroup>
                <Button type="button" $variant="secondary" onClick={() => {
                  if (defaultAmount && defaultToken) {
                    handleClose();
                  } else {
                    setStep(1);
                  }
                }}>
                  Cancel
                </Button>
              </ButtonGroup>
            </>
          )}

          {/* STEP 3: CONFIRM CHARGE */}
          {step === 3 && (
            <>
              <Title>Confirm Charge</Title>
              {linkName ? (
                <Subtitle>
                  Verify the charge details for <strong style={{ color: '#60A5FA' }}>{linkName}</strong> before confirming.
                </Subtitle>
              ) : (
                <Subtitle>Verify the charge details before confirming.</Subtitle>
              )}

              <InfoCard>
                {linkName && (
                  <InfoRow>
                    <InfoLabel>Link</InfoLabel>
                    <InfoValue>{linkName}</InfoValue>
                  </InfoRow>
                )}
                <InfoRow>
                  <InfoLabel>Amount</InfoLabel>
                  <InfoValue style={{ color: '#60A5FA', fontWeight: 600 }}>
                    {formData.amount} {getSelectedTokenSymbol()}
                  </InfoValue>
                </InfoRow>
                <InfoRow>
                  <InfoLabel>Client (Wallet)</InfoLabel>
                  <InfoValue style={{ fontFamily: 'monospace' }}>
                    {clientWallet}
                  </InfoValue>
                </InfoRow>
              </InfoCard>

              <ButtonGroup>
                <Button type="button" $variant="secondary" onClick={() => {
                  setClientWallet('');
                  setScannerKey((key) => key + 1);
                  setStep(2);
                }} disabled={processing}>
                  Rescan
                </Button>
                <Button type="button" $variant="primary" onClick={handleConfirmCharge} disabled={processing}>
                  {processing ? 'Processing...' : 'Confirm & Charge'}
                </Button>
              </ButtonGroup>
            </>
          )}

          {/* STEP 4: SUCCESS */}
          {step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px' }}>
              <CheckCircle size={64} color="#60A5FA" />
              <Title style={{ margin: 0 }}>Charge Completed!</Title>
              <Subtitle style={{ margin: 0 }}>
                The transfer of {formData.amount} {getSelectedTokenSymbol()} was confirmed on-chain.
              </Subtitle>
              
              <InfoCard style={{ width: '100%', margin: '12px 0 24px 0' }}>
                <InfoRow>
                  <InfoLabel>Source Address</InfoLabel>
                  <InfoValue style={{ fontFamily: 'monospace' }}>{clientWallet}</InfoValue>
                </InfoRow>
              </InfoCard>

              <Button type="button" $variant="primary" onClick={handleClose} style={{ width: '100%' }}>
                Finish
              </Button>
            </div>
          )}
        </ModalContent>
      </Overlay>
    </AnimatePresence>
  );
}
