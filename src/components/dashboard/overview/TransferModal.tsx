"use client";

import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { TOKEN_REGISTRY } from '@/lib/token-registry';
import { getLuxorEnv } from '@/lib/luxor-env';
import { useGetContacts } from '@/hooks/useGetContacts';
import { useSendTransfer } from '@/hooks/useSendTransfer';
import { toast } from 'sonner';
import { Transfer } from '@/lib/transfers-api';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (data: Transfer) => void;
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

const ToggleLink = styled.button`
  background: none;
  border: none;
  color: #60A5FA;
  font-family: 'Outfit', sans-serif;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
  
  &:hover {
    text-decoration: underline;
  }
`;

export function TransferModal({ isOpen, onClose, onSuccess }: TransferModalProps) {
  const { data: contactsData, isLoading: isLoadingContacts } = useGetContacts();
  const { mutate: sendMutate, isLoading: isSending, isError, errorMessage } = useSendTransfer();
  
  const [isChoosingContact, setIsChoosingContact] = useState(false);

  const [formData, setFormData] = useState({
    walletAddress: '',
    token: 'SOL',
    amount: '',
    reference: '',
  });

  const env = getLuxorEnv();
  const isDev = env === 'development';

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let toNickname = null;
    if (isChoosingContact && contactsData) {
      const contact = contactsData.data.find(c => c.walletAddress === formData.walletAddress);
      if (contact && contact.nickname) {
        toNickname = contact.nickname;
      }
    }

    const payload: any = {
      toWallet: formData.walletAddress,
      amount: formData.amount,
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
      toast.success('Transfer sent successfully!');
      
      setFormData({
        walletAddress: '',
        token: 'SOL',
        amount: '',
        reference: '',
      });
      setIsChoosingContact(false);
      onClose();
      
      if (onSuccess) {
        onSuccess(data);
      }
    } else {
      toast.error(error || 'Transfer failed');
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
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", bounce: 0.4, duration: 0.6 }}
        >
          <Title>Transfer Funds</Title>
          <Subtitle>Send crypto directly to another Solana address.</Subtitle>

          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Label>DESTINATION ADDRESS *</Label>
                <ToggleLink type="button" onClick={() => setIsChoosingContact(!isChoosingContact)}>
                  {isChoosingContact ? 'Enter manually' : 'Choose contact'}
                </ToggleLink>
              </div>
              
              {isChoosingContact ? (
                <Select
                  name="walletAddress"
                  value={formData.walletAddress}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>Select a contact...</option>
                  {isLoadingContacts ? (
                    <option disabled>Loading contacts...</option>
                  ) : (
                    contactsData?.data.map((contact) => (
                      <option key={contact.id} value={contact.walletAddress}>
                        {contact.nickname || contact.walletAddress}
                      </option>
                    ))
                  )}
                </Select>
              ) : (
                <Input 
                  name="walletAddress"
                  value={formData.walletAddress}
                  onChange={handleChange}
                  placeholder="Enter recipient's Solana address"
                  required
                />
              )}
            </FormGroup>

            <FormGroup>
              <Label>ASSET TO SEND *</Label>
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
              />
            </FormGroup>

            <FormGroup>
              <Label>REFERENCE (OPTIONAL)</Label>
              <Input 
                name="reference"
                value={formData.reference}
                onChange={handleChange}
                placeholder="Payment for services..."
              />
            </FormGroup>

            <ButtonGroup>
              <Button type="button" $variant="secondary" onClick={onClose} disabled={isSending}>
                Cancel
              </Button>
              <Button type="submit" $variant="primary" disabled={isSending} aria-busy={isSending}>
                {isSending ? 'Processing...' : 'Transfer'}
              </Button>
            </ButtonGroup>
          </Form>
        </ModalContent>
      </Overlay>
    </AnimatePresence>
  );
}
