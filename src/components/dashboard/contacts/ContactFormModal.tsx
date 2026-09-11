"use client";

import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useCreateContact } from '@/hooks/useCreateContact';
import { useUpdateContact } from '@/hooks/useUpdateContact';
import { CreateContactPayload, Contact } from '@/lib/contacts-api';
import { useTokenRegistry } from '@/context/TokenRegistryContext';
import { getLuxorEnv } from '@/lib/luxor-env';
import { X } from 'lucide-react';

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
  padding: 16px;

  @media (max-width: 767px) {
    padding: 12px;
  }
`;

const ModalContent = styled(motion.div)`
  background: rgba(10, 10, 10, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 32px 64px -16px rgba(0,0,0,0.8);
  border-radius: 28px;
  width: 100%;
  max-width: 440px;
  padding: 28px 24px 24px;
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: 767px) {
    padding: 24px 18px 18px;
    border-radius: 24px;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 2;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #FFFFFF;
  }

  &:focus-visible {
    outline: 2px solid #E2E8F0;
    outline-offset: 2px;
  }
`;

const Title = styled.h2`
  font-family: 'Outfit', sans-serif;
  font-size: 22px;
  font-weight: 500;
  letter-spacing: -0.5px;
  color: #FFFFFF;
  margin: 0 0 6px 0;
  padding-right: 36px;

  @media (max-width: 767px) {
    font-size: 20px;
  }
`;

const Subtitle = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.65);
  margin: 0 0 20px 0;
  line-height: 1.45;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
  min-width: 0;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  min-width: 0;
`;

const Label = styled.label`
  font-family: 'Outfit', sans-serif;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.05em;
  color: rgba(255, 255, 255, 0.55);
  text-transform: uppercase;
`;

const Input = styled.input`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 11px 14px;
  color: #FFFFFF;
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  transition: all 0.2s;
  width: 100%;
  box-sizing: border-box;
  min-width: 0;

  &:focus-visible {
    outline: none;
    border-color: #E2E8F0;
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.2);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
    font-size: 13px;
  }
`;

const Select = styled.select`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 11px 36px 11px 14px;
  color: #FFFFFF;
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  transition: all 0.2s;
  appearance: none;
  width: 100%;
  box-sizing: border-box;
  min-width: 0;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 14px;

  &:focus-visible {
    outline: none;
    border-color: #E2E8F0;
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.2);
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

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
`;

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  cursor: pointer;
  flex-shrink: 0;
`;

const CheckboxLabel = styled.span`
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 8px;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 500;
  padding: 9px 16px;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  flex: 1;

  &:focus-visible {
    outline: 2px solid #E2E8F0;
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
      box-shadow: 0 0 20px rgba(37, 99, 235, 0.45);
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

const ErrorText = styled.p`
  color: #F87171;
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  margin: 0;
`;

const COUNTRY_CODES = [
  { code: '+1', country: 'US/CA' },
  { code: '+34', country: 'ES' },
  { code: '+51', country: 'PE' },
  { code: '+52', country: 'MX' },
  { code: '+53', country: 'CU' },
  { code: '+54', country: 'AR' },
  { code: '+55', country: 'BR' },
  { code: '+56', country: 'CL' },
  { code: '+57', country: 'CO' },
  { code: '+58', country: 'VE' },
  { code: '+502', country: 'GT' },
  { code: '+503', country: 'SV' },
  { code: '+504', country: 'HN' },
  { code: '+505', country: 'NI' },
  { code: '+506', country: 'CR' },
  { code: '+507', country: 'PA' },
  { code: '+591', country: 'BO' },
  { code: '+593', country: 'EC' },
  { code: '+595', country: 'PY' },
  { code: '+598', country: 'UY' },
];

const PhoneInputGroup = styled.div`
  display: grid;
  grid-template-columns: minmax(96px, 108px) minmax(0, 1fr);
  gap: 8px;
  width: 100%;
  min-width: 0;
`;

const CountryCodeSelect = styled(Select)`
  padding: 11px 28px 11px 10px;
  font-size: 12px;
  background-position: right 8px center;
`;

export function ContactFormModal({ isOpen, onClose, onSuccess, initialData }: ContactFormModalProps) {
  const { mutate: createMutate, isLoading: isCreating, isError: isCreateError, errorMessage: createError } = useCreateContact();
  const { mutate: updateMutate, isLoading: isUpdating, isError: isUpdateError, errorMessage: updateError } = useUpdateContact();
  const { tokens } = useTokenRegistry();
  
  const isLoading = isCreating || isUpdating;
  const isError = isCreateError || isUpdateError;
  const errorMessage = createError || updateError;

  const [countryCode, setCountryCode] = useState('+1');
  const [phoneNum, setPhoneNum] = useState('');

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
        const telephone = initialData.telephone || '';
        let matchedCode = '+1';
        let matchedNum = telephone;

        if (telephone.startsWith('+')) {
          const sortedCodes = [...COUNTRY_CODES].sort((a, b) => b.code.length - a.code.length);
          for (const item of sortedCodes) {
            if (telephone.startsWith(item.code)) {
              matchedCode = item.code;
              matchedNum = telephone.slice(item.code.length);
              break;
            }
          }
        }
        setCountryCode(matchedCode);
        setPhoneNum(matchedNum);

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
        setCountryCode('+1');
        setPhoneNum('');
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

  React.useEffect(() => {
    if (phoneNum) {
      setFormData(prev => ({ ...prev, telephone: `${countryCode}${phoneNum}` }));
    } else {
      setFormData(prev => ({ ...prev, telephone: '' }));
    }
  }, [countryCode, phoneNum]);

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
          <CloseButton type="button" onClick={onClose} disabled={isLoading} aria-label="Close">
            <X size={16} />
          </CloseButton>
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
                  <optgroup label="Available Tokens">
                    {tokens.map((token) => (
                      <option key={token.mint} value={token.mint}>
                        {token.symbol} ({token.mint.slice(0, 4)}...{token.mint.slice(-4)})
                      </option>
                    ))}
                  </optgroup>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>EMAIL (OPTIONAL)</Label>
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
              <Label>PHONE (OPTIONAL)</Label>
              <PhoneInputGroup>
                <CountryCodeSelect
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  disabled={isLoading}
                  aria-label="Country code"
                >
                  {COUNTRY_CODES.map((item) => (
                    <option key={item.code} value={item.code}>
                      {item.code}
                    </option>
                  ))}
                </CountryCodeSelect>
                <Input
                  type="tel"
                  value={phoneNum}
                  onChange={(e) => setPhoneNum(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456789"
                  disabled={isLoading}
                />
              </PhoneInputGroup>
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
