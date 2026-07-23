'use client';

import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { createPaymentLink, listPaymentLinks } from '@/lib/payments-api';
import type { PaymentLink } from '@luxor/contracts';
import { Copy, Link as LinkIcon, Plus, ExternalLink, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useTokenRegistry } from '@/context/TokenRegistryContext';
import { getLuxorEnv } from '@/lib/luxor-env';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

// --- Styled Components ---

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const Header = styled.header`
  padding: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(255, 255, 255, 0.01);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;

  @media (min-width: 768px) {
    padding: 32px 40px;
  }
`;

const Title = styled.h1`
  font-family: 'Outfit', sans-serif;
  font-size: 24px;
  font-weight: 500;
  color: #FFFFFF;
  margin: 0 0 4px 0;
  letter-spacing: -0.025em;
  text-align: left;

  @media (min-width: 768px) {
    font-size: 30px;
  }
`;

const Subtitle = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  text-align: left;
`;

const ContentLayout = styled.div`
  padding: 40px;
  max-width: 1280px;
  margin: 0 auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 32px;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 24px;
    gap: 24px;
  }
`;

const Overlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(12px);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;

  @media (max-width: 768px) {
    padding: 12px;
  }
`;

const ModalBox = styled(motion.div)`
  background: rgba(10, 10, 10, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 32px 64px -16px rgba(0, 0, 0, 0.8);
  border-radius: 28px;
  width: 100%;
  max-width: 400px;
  padding: 24px 28px;
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: 768px) {
    padding: 20px;
    border-radius: 24px;
    max-width: 100%;
  }
`;

const ModalCloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
  width: 34px;
  height: 34px;
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

const FormHeader = styled.h2`
  font-family: 'Outfit', sans-serif;
  font-size: 18px;
  font-weight: 500;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 20px 0;
  padding-right: 36px;

  svg {
    color: #60A5FA;
  }
`;

const InputGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 20px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-family: 'Outfit', sans-serif;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.05em;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
`;

const Input = styled.input`
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  padding: 12px 16px;
  color: #FFFFFF;
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  width: 100%;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #60A5FA;
    box-shadow: 0 0 0 1px rgba(96, 165, 250, 0.2);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }
`;

const Select = styled.select`
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  padding: 12px 16px;
  color: #FFFFFF;
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  width: 100%;
  box-sizing: border-box;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 16px center;
  background-size: 16px;

  &:focus {
    outline: none;
    border-color: #60A5FA;
  }

  option, optgroup {
    background: #0A0A0A;
    color: #FFFFFF;
  }
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 500;
  padding: 9px 20px;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid #60A5FA;
    outline-offset: 2px;
  }

  ${({ $variant = 'primary' }) =>
    $variant === 'primary' &&
    `
    background: #FFFFFF;
    color: #000000;
    &:hover:not(:disabled) {
      background: #2563EB;
      color: #FFFFFF;
      box-shadow: 0 8px 16px rgba(37, 99, 235, 0.3);
    }
  `}

  ${({ $variant }) =>
    $variant === 'secondary' &&
    `
    background: rgba(255, 255, 255, 0.05);
    color: #FFFFFF;
    border: 1px solid rgba(255, 255, 255, 0.1);
    &:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.2);
    }
  `}
`;

const LinksList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const LinkItem = styled(motion.div)`
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 20px;
  padding: 14px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.04);
    border-color: rgba(255, 255, 255, 0.1);
  }
`;

const LinkInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  min-width: 0;
  width: 100%;
`;

const IconWrapper = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(96, 165, 250, 0.1);
  color: #60A5FA;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const TextContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

const LinkName = styled.h3`
  font-family: 'Outfit', sans-serif;
  font-size: 15px;
  font-weight: 500;
  color: #FFFFFF;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const LinkDetails = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.45);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;

  strong {
    font-weight: 600;
    color: #60A5FA;
    font-size: 12px;
  }
`;

const ActionsGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
`;

const IconAction = styled.button`
  width: 34px;
  height: 34px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover {
    background: rgba(96, 165, 250, 0.15);
    border-color: rgba(96, 165, 250, 0.35);
    color: #60A5FA;
  }

  &:focus-visible {
    outline: 2px solid #60A5FA;
    outline-offset: 2px;
  }
`;

const UrlSection = styled.span`
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 640px) {
    display: none;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 64px 24px;
  border: 1px dashed rgba(255, 255, 255, 0.1);
  border-radius: 32px;
  background: rgba(255, 255, 255, 0.01);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;

  p {
    font-family: 'Montserrat', sans-serif;
    font-size: 15px;
    font-weight: 300;
    color: rgba(255, 255, 255, 0.5);
    margin: 0;
  }
`;

const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 48px;
  color: rgba(255, 255, 255, 0.6);
  font-family: 'Montserrat', sans-serif;
  font-size: 15px;
  
  svg {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    100% { transform: rotate(360deg); }
  }
`;

// --- Component ---

export default function PaymentLinksPage() {
  const router = useRouter();
  const [links, setLinks] = useState<PaymentLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<string>('USDC');
  const [creating, setCreating] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { tokens } = useTokenRegistry();

  const env = getLuxorEnv();
  const isDev = env === 'development';

  const parsedAmount = parseFloat(amount);
  const isFormValid =
    name.trim().length > 0 &&
    businessName.trim().length > 0 &&
    amount.trim().length > 0 &&
    !Number.isNaN(parsedAmount) &&
    parsedAmount > 0 &&
    Boolean(currency);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const data = await listPaymentLinks(token);
        setLinks(data);
      } catch {
        toast.error('Could not load links');
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    const parsed = parseFloat(amount);
    if (!name.trim() || !businessName.trim() || Number.isNaN(parsed) || parsed <= 0) {
      toast.error('Enter valid details for all fields');
      return;
    }

    setCreating(true);
    try {
      const token = await user.getIdToken();
      const link = await createPaymentLink(token, {
        name: name.trim(),
        businessName: businessName.trim(),
        amount: parsed,
        currency,
      });
      setLinks((prev) => [link, ...prev]);
      setName('');
      setBusinessName('');
      setAmount('');
      setIsFormOpen(false);
      toast.success('Payment link created');
    } catch (err) {
      if (err instanceof Error && err.message === 'MERCHANT_WALLET_REQUIRED') {
        toast.error('Add your Solana wallet in Settings first');
      } else {
        toast.error('Could not create link. Check Firestore rules.');
      }
    } finally {
      setCreating(false);
    }
  };

  const payLinkUrl = (id: string) => `${window.location.origin}/pay/link/${id}`;

  const copyUrl = (id: string) => {
    navigator.clipboard.writeText(payLinkUrl(id));
    toast.success('Link copied');
  };

  return (
    <PageContainer>
      <header className="px-6 py-6 md:px-10 md:py-8 border-b border-white/5 bg-white/[0.01]">
        <div>
          <h1 className="text-2xl md:text-3xl font-medium text-white tracking-tight mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Payment Links
          </h1>
          <p className="text-gray-400 text-sm font-light" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Checkout URLs for your website, email, or social.
          </p>
        </div>
      </header>

      <AnimatePresence>
        {isFormOpen && (
          <Overlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !creating && setIsFormOpen(false)}
          >
            <ModalBox
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', bounce: 0.4, duration: 0.6 }}
            >
              <ModalCloseButton type="button" onClick={() => !creating && setIsFormOpen(false)} aria-label="Close">
                <X size={16} />
              </ModalCloseButton>

              <form onSubmit={handleCreate}>
                <FormHeader>
                  <Plus size={20} /> New Link
                </FormHeader>
                <InputGrid>
                  <InputGroup>
                    <Label>Product or Service Name</Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Premium Subscription"
                      required
                    />
                  </InputGroup>
                  <InputGroup>
                    <Label>Business Name</Label>
                    <Input
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. Acme Corp"
                      required
                    />
                  </InputGroup>
                  <InputGroup>
                    <Label>Amount</Label>
                    <Input
                      type="number"
                      step="any"
                      min="0.000001"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      required
                    />
                  </InputGroup>
                  <InputGroup>
                    <Label>Currency</Label>
                    <Select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                    >
                      <optgroup label="Available Tokens">
                        {tokens.map((token) => (
                          <option key={token.symbol} value={token.symbol}>
                            {token.symbol}
                          </option>
                        ))}
                      </optgroup>
                    </Select>
                  </InputGroup>
                </InputGrid>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <Button type="button" $variant="secondary" onClick={() => setIsFormOpen(false)} disabled={creating}>
                    Cancel
                  </Button>
                  <Button type="submit" $variant="primary" disabled={creating || !isFormValid}>
                    {creating ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Creating...
                      </>
                    ) : (
                      <>
                        <Plus size={16} /> Create Link
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </ModalBox>
          </Overlay>
        )}
      </AnimatePresence>

      <ContentLayout>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button $variant="primary" onClick={() => setIsFormOpen(true)}>
            <Plus size={15} /> Create Link
          </Button>
        </div>

        {loading ? (
          <LoadingState>
            <Loader2 size={24} /> Loading links...
          </LoadingState>
        ) : links.length === 0 ? (
          <EmptyState>
            <LinkIcon size={32} color="rgba(255, 255, 255, 0.2)" />
            <p>No links yet. Create your first payment link above.</p>
          </EmptyState>
        ) : (
          <LinksList>
            {links.map((link, index) => (
              <LinkItem
                key={link.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <LinkInfo>
                  <IconWrapper>
                    <LinkIcon size={24} />
                  </IconWrapper>
                  <TextContent>
                    <LinkName>{link.name}</LinkName>
                    <LinkDetails>
                      <strong>{link.amount} {link.currency}</strong>
                      <UrlSection>
                        <span style={{ color: 'rgba(255, 255, 255, 0.2)' }}>•</span>
                        <span>/pay/link/{link.id}</span>
                      </UrlSection>
                    </LinkDetails>
                  </TextContent>
                </LinkInfo>
                <ActionsGroup>
                  <IconAction
                    type="button"
                    onClick={() => copyUrl(link.id)}
                    title="Copy link URL"
                    aria-label="Copy link URL"
                  >
                    <Copy size={15} />
                  </IconAction>
                  <IconAction
                    type="button"
                    onClick={() => router.push(`/dashboard/links/preview/${link.id}`)}
                    title="Preview link"
                    aria-label="Preview link"
                  >
                    <ExternalLink size={15} />
                  </IconAction>
                </ActionsGroup>
              </LinkItem>
            ))}
          </LinksList>
        )}
      </ContentLayout>
    </PageContainer>
  );
}
