"use client";

import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useCreateContact } from '@/hooks/useCreateContact';
import { useUpdateContact } from '@/hooks/useUpdateContact';
import { CreateContactPayload, Contact } from '@/lib/contacts-api';
import { TOKEN_REGISTRY } from '@/lib/token-registry';
import { getLuxorEnv } from '@/lib/luxor-env';

interface ContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: Contact | null;
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

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
`;

const Checkbox = styled.input`
  width: 20px;
  height: 20px;
  cursor: pointer;
`;

const CheckboxLabel = styled.span`
  font-family: 'Montserrat', sans-serif;
  font-size: 15px;
  color: #FFFFFF;
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

const ErrorText = styled.p`
  color: #F87171;
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  margin: 0;
`;

export function ContactFormModal({ isOpen, onClose, onSuccess, initialData }: ContactFormModalProps) {
  const { mutate: createMutate, isLoading: isCreating, isError: isCreateError, errorMessage: createError } = useCreateContact();
  const { mutate: updateMutate, isLoading: isUpdating, isError: isUpdateError, errorMessage: updateError } = useUpdateContact();
  
  const isLoading = isCreating || isUpdating;
  const isError = isCreateError || isUpdateError;
  const errorMessage = createError || updateError;

  const [localValidationError, setLocalValidationError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateContactPayload>({
    nickname: '',
    walletAddress: '',
    telephone: '',
    email: '',
    mint: '',
    notes: '',
    isFavorite: false,
  });

  React.useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          nickname: initialData.nickname || '',
          walletAddress: initialData.walletAddress || '',
          telephone: initialData.telephone || '',
          email: initialData.email || '',
          mint: initialData.mint || '',
          notes: initialData.notes || '',
          isFavorite: initialData.isFavorite || false,
        });
      } else {
        setFormData({
          nickname: '',
          walletAddress: '',
          telephone: '',
          email: '',
          mint: '',
          notes: '',
          isFavorite: false,
        });
      }
    }
  }, [isOpen, initialData]);

  const env = getLuxorEnv();
  const isDev = env === 'development';

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalValidationError(null);

    const email = formData.email?.trim();
    const telephone = formData.telephone?.trim();
    if (!email && !telephone) {
      setLocalValidationError('Es indispensable proporcionar al menos un correo electrónico o un número de teléfono.');
      return;
    }

    let result;
    
    if (initialData) {
      result = await updateMutate(initialData.id, formData);
    } else {
      result = await createMutate(formData);
    }

    if (result) {
      onSuccess();
    }
  };

  const title = initialData ? 'Update Ecosystem Contact' : 'Add Ecosystem Contact';
  const subtitle = initialData ? 'Modify your network partner details.' : 'Expand your network for seamless on-chain liquidity routing.';

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
          <Title>{title}</Title>
          <Subtitle>{subtitle}</Subtitle>

          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label>NICKNAME / ALIAS *</Label>
              <Input 
                name="nickname"
                value={formData.nickname}
                onChange={handleChange}
                placeholder="e.g. Partner X"
                required
                disabled={isLoading}
              />
            </FormGroup>

            <FormGroup>
              <Label>SOLANA WALLET ADDRESS *</Label>
              <Input 
                name="walletAddress"
                value={formData.walletAddress}
                onChange={handleChange}
                placeholder="Enter valid public key"
                required
                disabled={isLoading}
              />
            </FormGroup>

            <FormGroup>
              <Label>PREFERRED TOKEN MINT *</Label>
              <Select 
                name="mint"
                value={formData.mint}
                onChange={handleChange as any}
                required
                disabled={isLoading}
              >
                <option value="" disabled>Select a preferred token...</option>
                {isDev ? (
                  <optgroup label="Devnet">
                    {Object.entries(TOKEN_REGISTRY['devnet']).map(([mint, symbol]) => (
                      <option key={mint} value={mint}>
                        {symbol} ({mint.slice(0, 4)}...{mint.slice(-4)})
                      </option>
                    ))}
                  </optgroup>
                ) : (
                  <optgroup label="Mainnet Beta">
                    {Object.entries(TOKEN_REGISTRY['mainnet-beta']).map(([mint, symbol]) => (
                      <option key={mint} value={mint}>
                        {symbol} ({mint.slice(0, 4)}...{mint.slice(-4)})
                      </option>
                    ))}
                  </optgroup>
                )}
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>EMAIL (AT LEAST EMAIL OR PHONE REQUIRED)</Label>
              <Input 
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="contact@example.com"
                disabled={isLoading}
              />
            </FormGroup>

            <FormGroup>
              <Label>PHONE (AT LEAST EMAIL OR PHONE REQUIRED)</Label>
              <Input 
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                placeholder="+1234567890"
                disabled={isLoading}
              />
            </FormGroup>

            <FormGroup>
              <Label>NOTES (OPTIONAL)</Label>
              <Input 
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Payment terms, preferences..."
                disabled={isLoading}
              />
            </FormGroup>

            <CheckboxGroup as="label">
              <Checkbox 
                type="checkbox"
                name="isFavorite"
                checked={formData.isFavorite}
                onChange={handleChange}
                disabled={isLoading}
              />
              <CheckboxLabel>Mark as Favorite</CheckboxLabel>
            </CheckboxGroup>

            {localValidationError && <ErrorText>{localValidationError}</ErrorText>}
            {isError && <ErrorText>{errorMessage}</ErrorText>}

            <ButtonGroup>
              <Button type="button" $variant="secondary" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" $variant="primary" disabled={isLoading} aria-busy={isLoading}>
                {isLoading ? 'Processing...' : (initialData ? 'Save Changes' : 'Create Contact')}
              </Button>
            </ButtonGroup>
          </Form>
        </ModalContent>
      </Overlay>
    </AnimatePresence>
  );
}
