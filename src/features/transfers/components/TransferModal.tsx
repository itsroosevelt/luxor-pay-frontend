"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Landmark, Send, ArrowRight, UserCheck, Wallet, Check, Building2, User, Globe, AlertCircle } from 'lucide-react';
import { useTokenRegistry } from '@/context/TokenRegistryContext';
import { useGetContacts } from '@/features/contacts/hooks/useGetContacts';
import { useSendTransfer } from '@/features/transfers/hooks/useSendTransfer';
import { useTreasury } from '@/features/treasury/hooks/useTreasury';
import { formatVaultLabel } from '@/features/treasury/components/treasury-utils';
import { toast } from 'sonner';
import { Transfer, SendTransferPayload } from '@/features/transfers/api/transfers-api';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (data: Transfer) => void;
  initialRecipientAddress?: string;
  initialMint?: string;
}

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
`;

const ModalContent = styled(motion.div)`
  background: rgba(10, 10, 10, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 32px 64px -16px rgba(0,0,0,0.9);
  border-radius: 40px;
  width: 100%;
  max-width: 520px;
  padding: 36px 40px;
  position: relative;
  max-height: 90vh;
  overflow-y: auto;

  @media (max-width: 640px) {
    padding: 24px 20px;
    border-radius: 28px;
  }
`;

const Title = styled.h2`
  font-family: 'Outfit', sans-serif;
  font-size: 28px;
  font-weight: 500;
  letter-spacing: -1px;
  color: #FFFFFF;
  margin: 0 0 6px 0;
`;

const Subtitle = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 28px 0;
  line-height: 1.5;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-family: 'Outfit', sans-serif;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.05em;
  color: rgba(255, 255, 255, 0.85);
  text-transform: uppercase;
`;

const Input = styled.input`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  padding: 14px 16px;
  color: #FFFFFF;
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  transition: all 0.2s;

  &:focus-visible {
    outline: none;
    border-color: #60A5FA;
    box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.25);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }
`;

const Select = styled.select`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  padding: 14px 16px;
  color: #FFFFFF;
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  transition: all 0.2s;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 16px center;
  background-size: 16px;

  &:focus-visible {
    outline: none;
    border-color: #60A5FA;
    box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.25);
  }

  & option {
    background: #0A0A0A;
    color: #FFFFFF;
  }
  
  & optgroup {
    background: #0A0A0A;
    color: #E2E8F0;
    font-weight: 600;
  }
`;

const ModeSelector = styled.div`
  display: flex;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
  padding: 3px;
  gap: 3px;
`;

const ModeTab = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 7px 10px;
  border-radius: 9999px;
  border: none;
  background: ${({ $active }) => ($active ? '#FFFFFF' : 'transparent')};
  color: ${({ $active }) => ($active ? '#000000' : 'rgba(255, 255, 255, 0.7)')};
  font-family: 'Outfit', sans-serif;
  font-size: 11.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  white-space: nowrap;

  &:hover {
    color: ${({ $active }) => ($active ? '#000000' : '#FFFFFF')};
  }

  &:focus-visible {
    outline: 2px solid #60A5FA;
    outline-offset: 2px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 10px;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  font-family: 'Outfit', sans-serif;
  font-size: 13.5px;
  font-weight: 600;
  padding: 11px 24px;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  flex: 1;
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  white-space: nowrap;

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
      box-shadow: 0 4px 20px rgba(37, 99, 235, 0.3);
    }
  `}

  ${({ $variant }) =>
    $variant === 'secondary' &&
    `
    background: transparent;
    color: #E2E8F0;
    border: 1px solid rgba(255, 255, 255, 0.2);
    &:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.1);
    }
  `}
`;

const VaultInfoBadge = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 10px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 2px;
`;

const VaultBalanceText = styled.span`
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  display: inline-flex;
  align-items: center;
  gap: 6px;
`;

const VaultBadgeTag = styled.span`
  font-family: 'Outfit', sans-serif;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 2px 8px;
  border-radius: 9999px;
  background: rgba(96, 165, 250, 0.15);
  color: #60A5FA;
  border: 1px solid rgba(96, 165, 250, 0.3);
`;

const TransferPreviewCard = styled.div`
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

export function TransferModal({
  isOpen,
  onClose,
  onSuccess,
  initialRecipientAddress,
  initialMint,
}: TransferModalProps) {
  const { data: contactsData, isLoading: isLoadingContacts } = useGetContacts();
  const { mutate: sendMutate, isLoading: isSending } = useSendTransfer();
  const { vaults, isLoading: isLoadingVaults } = useTreasury();
  const { tokens } = useTokenRegistry();

  const [destinationMode, setDestinationMode] = useState<'vault' | 'contact' | 'address'>('address');
  const [selectedVaultId, setSelectedVaultId] = useState<string>('');
  const [selectedDestVaultId, setSelectedDestVaultId] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  const [formData, setFormData] = useState({
    walletAddress: initialRecipientAddress || '',
    token: initialMint || 'SOL',
    amount: '',
    reference: '',
  });

  useEffect(() => {
    if (isOpen && initialRecipientAddress) {
      setFormData((prev) => ({
        ...prev,
        walletAddress: initialRecipientAddress,
        token: initialMint || prev.token || 'SOL',
      }));
      setDestinationMode('address');
    }
  }, [isOpen, initialRecipientAddress, initialMint]);

  // Source Vault resolution
  const selectedVault = useMemo(() => {
    if (!vaults || vaults.length === 0) return null;
    if (selectedVaultId) {
      return vaults.find((v) => v.id === selectedVaultId) || vaults[0];
    }
    return vaults.find((v) => v.isDefault) || vaults[0];
  }, [vaults, selectedVaultId]);

  // Available Destination Vaults (exclude selected source vault)
  const availableDestVaults = useMemo(() => {
    if (!vaults) return [];
    return vaults.filter((v) => v.id !== selectedVault?.id);
  }, [vaults, selectedVault]);

  // Balance calculation & validation
  const availableBalance = useMemo(() => {
    if (!selectedVault) return 0;
    if (formData.token === 'SOL') return Number(selectedVault.solBalance ?? 0);
    const tok = selectedVault.tokens?.find((t) => t.mint === formData.token || t.symbol === formData.token);
    return Number(tok?.uiAmount ?? 0);
  }, [selectedVault, formData.token]);

  const numAmount = parseFloat(formData.amount);
  const isInsufficientFunds = !isNaN(numAmount) && numAmount > 0 && numAmount > availableBalance;

  // Handle destination mode changes
  const handleModeChange = (mode: 'vault' | 'contact' | 'address') => {
    setDestinationMode(mode);
    if (mode === 'vault' && availableDestVaults.length > 0) {
      const dest = availableDestVaults[0];
      setSelectedDestVaultId(dest.id);
      setFormData((prev) => ({ ...prev, walletAddress: dest.address }));
    } else if (mode === 'contact') {
      const firstContact = contactsData?.data?.[0];
      if (firstContact) {
        setFormData((prev) => ({ ...prev, walletAddress: firstContact.walletAddress }));
      } else {
        setFormData((prev) => ({ ...prev, walletAddress: '' }));
      }
    } else {
      setFormData((prev) => ({ ...prev, walletAddress: initialRecipientAddress || '' }));
    }
  };

  const handleDestVaultSelect = (destId: string) => {
    setSelectedDestVaultId(destId);
    const destVault = vaults?.find((v) => v.id === destId);
    if (destVault) {
      setFormData((prev) => ({ ...prev, walletAddress: destVault.address }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isInsufficientFunds) {
      toast.error(`Insufficient funds: available balance is ${availableBalance} ${formData.token}`);
      return;
    }
    let toNickname: string | null = null;
    if (destinationMode === 'contact' && contactsData) {
      const contact = contactsData.data.find((c) => c.walletAddress === formData.walletAddress);
      if (contact && contact.nickname) {
        toNickname = contact.nickname;
      }
    } else if (destinationMode === 'vault') {
      const destVault = vaults?.find((v) => v.id === selectedDestVaultId || v.address === formData.walletAddress);
      if (destVault) {
        toNickname = destVault.label || `Vault #${destVault.index}`;
      }
    }

    const payload: SendTransferPayload = {
      toWallet: formData.walletAddress,
      amount: formData.amount,
      fromVaultPda: selectedVault?.address,
      fromVaultId: selectedVault?.id,
    };

    if (formData.token !== 'SOL') {
      payload.mint = formData.token;
    }

    if (toNickname) {
      payload.toNickname = toNickname;
    }

    if (formData.reference) {
      payload.reference = formData.reference;
    }

    const { success, data, error } = await sendMutate(payload);
    if (success && data) {
      toast.success('Transfer proposal submitted successfully!');
      
      setFormData({
        walletAddress: '',
        token: 'SOL',
        amount: '',
        reference: '',
      });
      setDestinationMode('address');
      onClose();
      
      if (onSuccess) {
        onSuccess(data);
      }
    } else {
      toast.error(error || 'Transfer failed');
    }
  };

  // Resolved label for preview
  const destVaultObj = vaults?.find((v) => v.address === formData.walletAddress);
  const destContactObj = contactsData?.data.find((c) => c.walletAddress === formData.walletAddress);
  const destinationLabel =
    (destVaultObj ? formatVaultLabel(destVaultObj.label, destVaultObj.index === 0 || destVaultObj.isDefault) : null) ||
    destContactObj?.nickname ||
    (formData.walletAddress ? `${formData.walletAddress.slice(0, 6)}...${formData.walletAddress.slice(-4)}` : 'Recipient');

  if (!isOpen) return null;
  if (!mounted || typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      <Overlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <ModalContent
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", bounce: 0.35, duration: 0.6 }}
        >
          <Title>Transfer Funds</Title>
          <Subtitle>Send crypto directly between your treasury accounts or to an external address.</Subtitle>

          <Form onSubmit={handleSubmit}>
            {/* SOURCE ACCOUNT / VAULT */}
            <FormGroup>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Label>SOURCE ACCOUNT / VAULT *</Label>
                {selectedVault && (
                  <VaultBadgeTag>
                    {selectedVault.isDefault ? 'Default Vault' : `Vault #${selectedVault.index}`}
                  </VaultBadgeTag>
                )}
              </div>
              <Select
                name="sourceVault"
                value={selectedVault?.id || ''}
                onChange={(e) => setSelectedVaultId(e.target.value)}
              >
                {isLoadingVaults ? (
                  <option disabled>Loading treasury accounts...</option>
                ) : vaults && vaults.length > 0 ? (
                  vaults.map((vault, idx) => (
                    <option key={vault.id} value={vault.id}>
                      {formatVaultLabel(vault.label, idx === 0 || vault.index === 0 || vault.isDefault)} {vault.isDefault ? '(Main Treasury)' : ''} — ${vault.usdValue.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                    </option>
                  ))
                ) : (
                  <option value="main">Roosevelt</option>
                )}
              </Select>

              {selectedVault && (
                <VaultInfoBadge>
                  <VaultBalanceText>
                    <Landmark size={14} className="text-blue-400" />
                    Available balance: <strong style={{ color: '#FFFFFF', marginLeft: '4px' }}>{selectedVault.solBalance || '0.00'} SOL</strong> (~${selectedVault.usdValue.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD)
                  </VaultBalanceText>
                </VaultInfoBadge>
              )}
            </FormGroup>

            {/* DESTINATION SELECTOR */}
            <FormGroup>
              <Label>DESTINATION RECIPIENT *</Label>
              
              {/* Segmented Mode Selector */}
              <ModeSelector>
                <ModeTab
                  type="button"
                  $active={destinationMode === 'vault'}
                  onClick={() => handleModeChange('vault')}
                >
                  <Building2 size={13} /> My Vaults
                </ModeTab>
                <ModeTab
                  type="button"
                  $active={destinationMode === 'contact'}
                  onClick={() => handleModeChange('contact')}
                >
                  <User size={13} /> Contacts
                </ModeTab>
                <ModeTab
                  type="button"
                  $active={destinationMode === 'address'}
                  onClick={() => handleModeChange('address')}
                >
                  <Globe size={13} /> External Address
                </ModeTab>
              </ModeSelector>

              {/* Mode 1: Transfer to another of my own vaults */}
              {destinationMode === 'vault' && (
                <Select
                  name="destVaultId"
                  value={selectedDestVaultId}
                  onChange={(e) => handleDestVaultSelect(e.target.value)}
                  required
                >
                  {availableDestVaults.length > 0 ? (
                    availableDestVaults.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.label || `Vault #${v.index}`} ({v.address.slice(0, 4)}...{v.address.slice(-4)}) — ${v.usdValue.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                      </option>
                    ))
                  ) : (
                    <option disabled value="">No other treasury vaults available</option>
                  )}
                </Select>
              )}

              {/* Mode 2: Select from contacts */}
              {destinationMode === 'contact' && (
                <Select
                  name="walletAddress"
                  value={formData.walletAddress}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>Select a saved contact...</option>
                  {isLoadingContacts ? (
                    <option disabled>Loading contacts...</option>
                  ) : (
                    contactsData?.data.map((contact) => (
                      <option key={contact.id} value={contact.walletAddress}>
                        {contact.nickname || contact.walletAddress} ({contact.walletAddress.slice(0, 4)}...{contact.walletAddress.slice(-4)})
                      </option>
                    ))
                  )}
                </Select>
              )}

              {/* Mode 3: Manual address */}
              {destinationMode === 'address' && (
                <Input 
                  name="walletAddress"
                  value={formData.walletAddress}
                  onChange={handleChange}
                  placeholder="Enter recipient's Solana wallet address"
                  required
                />
              )}
            </FormGroup>

            {/* ASSET & AMOUNT ROW */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormGroup>
                <Label>ASSET TO SEND *</Label>
                <Select 
                  name="token"
                  value={formData.token}
                  onChange={handleChange}
                  required
                >
                  <option value="SOL">Solana (SOL)</option>
                  <optgroup label="Available Tokens">
                    {tokens.map((token) => (
                      <option key={token.mint} value={token.mint}>
                        {token.symbol}
                      </option>
                    ))}
                  </optgroup>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>AMOUNT *</Label>
                <Input 
                  type="number"
                  step="any"
                  min="0"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  required
                  style={isInsufficientFunds ? { borderColor: '#F87171', background: 'rgba(248, 113, 113, 0.08)' } : undefined}
                />
                {isInsufficientFunds && (
                  <p className="text-xs font-medium text-red-400 flex items-center gap-1.5 mt-1 font-['Outfit']">
                    <AlertCircle size={14} className="text-red-400 shrink-0" />
                    Fondos insuficientes (Disponible: {availableBalance} {formData.token})
                  </p>
                )}
              </FormGroup>
            </div>

            {/* REFERENCE (OPTIONAL) */}
            <FormGroup>
              <Label>REFERENCE (OPTIONAL)</Label>
              <Input 
                name="reference"
                value={formData.reference}
                onChange={handleChange}
                placeholder="Internal transfer, invoice #, services..."
              />
            </FormGroup>

            {/* LIVE PREVIEW BADGE */}
            {formData.amount && Number(formData.amount) > 0 && formData.walletAddress && (
              <TransferPreviewCard>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white shrink-0">
                    <Send size={14} />
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="text-xs font-semibold text-white font-['Outfit'] truncate">
                      Sending {formData.amount} {formData.token}
                    </p>
                    <p className="text-[11px] text-gray-400 font-mono truncate">
                      {selectedVault?.label || 'Source Vault'} → {destinationLabel}
                    </p>
                  </div>
                </div>
                <ArrowRight size={16} className="text-blue-400 shrink-0" />
              </TransferPreviewCard>
            )}

            <ButtonGroup>
              <Button type="button" $variant="secondary" onClick={onClose} disabled={isSending}>
                Cancel
              </Button>
              <Button type="submit" $variant="primary" disabled={isSending} aria-busy={isSending}>
                {isSending ? (
                  'Processing Transfer...'
                ) : (
                  <>
                    <Send size={15} />
                    {formData.amount && Number(formData.amount) > 0
                      ? `Send ${formData.amount} ${formData.token}`
                      : 'Send Funds'}
                  </>
                )}
              </Button>
            </ButtonGroup>
          </Form>
        </ModalContent>
      </Overlay>
    </AnimatePresence>,
    document.body
  );
}

