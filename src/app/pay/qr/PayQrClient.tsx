'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { sendTransfer } from '@/lib/payments-api';
import { getContacts } from '@/lib/contacts-api';
import { isGenericCheckoutLabel } from '@/lib/luxor-pay-checkout-url';
import { getMerchantProfile, getMerchantProfileByWallet } from '@/lib/merchants-api';
import { getWalletBalance } from '@/lib/solana-api';
import { getTransferErrorMessage, parsePaymentAmount } from '@/lib/transfer-errors';
import { TOKEN_REGISTRY } from '@/lib/token-registry';
import {
  PaymentSuccessModal,
  PaymentSuccessData,
} from '@/components/payments/PaymentSuccessModal';
import { Decimal } from 'decimal.js';
import { useTokenPrice } from '@/hooks/useTokenPrice';
import { 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle 
} from 'lucide-react';

const PageWrapper = styled.div`
  min-height: 100vh;
  background: #0A0A0A;
  display: flex;
  flex-direction: column;
  color: #EDEDED;
`;

const HeaderNav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 40px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);

  @media (max-width: 768px) {
    padding: 16px 24px;
  }
`;

const BrandLogo = styled.div`
  font-family: 'Outfit', sans-serif;
  font-size: 24px;
  font-weight: 500;
  letter-spacing: -1px;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  gap: 8px;

  span {
    background: linear-gradient(to right, #60A5FA, #2563EB);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-weight: 700;
  }
`;

const HeaderButton = styled.button`
  background: transparent;
  color: #FFFFFF;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 9999px;
  padding: 10px 20px;
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  &:focus-visible {
    outline: 2px solid #60A5FA;
    outline-offset: 2px;
  }
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
`;

const CheckoutCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(40px);
  border-radius: 40px;
  padding: 40px;
  width: 100%;
  max-width: 480px;
  box-sizing: border-box;
  overflow: hidden;
  box-shadow: 0 32px 64px -16px rgba(0, 0, 0, 0.6);

  @media (max-width: 480px) {
    padding: 24px;
    border-radius: 32px;
  }
`;

const HeaderTitle = styled.h1`
  font-family: 'Outfit', sans-serif;
  font-size: 28px;
  font-weight: 500;
  letter-spacing: -1px;
  color: #FFFFFF;
  margin: 0 0 8px 0;
  text-align: center;
`;

const HeaderSubtitle = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 32px 0;
  text-align: center;
  line-height: 1.5;
`;

const CardSection = styled.div`
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  padding: 24px;
  margin-bottom: 24px;
  min-width: 0;
  box-sizing: border-box;
`;

const Label = styled.span`
  display: block;
  font-family: 'Outfit', sans-serif;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #60A5FA;
  text-transform: uppercase;
  margin-bottom: 12px;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-width: 0;
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const InfoLabel = styled.span`
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.6);
`;

const InfoValue = styled.span`
  font-family: monospace;
  font-size: 14px;
  font-weight: 500;
  color: #FFFFFF;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 200px;
`;

const RecipientNameValue = styled.span`
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #FFFFFF;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
  flex: 1;
`;

const AmountContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  margin-bottom: 32px;
`;

const CurrencyBadge = styled.span`
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #60A5FA;
  background: rgba(96, 165, 250, 0.1);
  padding: 4px 12px;
  border-radius: 9999px;
  margin-top: 8px;
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  width: 100%;
  padding: 16px;
  border-radius: 9999px;
  font-family: 'Outfit', sans-serif;
  font-size: 16px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

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
    }
  `}

  ${({ $variant }) =>
    $variant === 'secondary' &&
    `
    background: transparent;
    color: #60A5FA;
    border: 1px solid rgba(255, 255, 255, 0.2);
    &:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.05);
    }
  `}
`;

const ErrorBox = styled.div`
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 16px;
  padding: 16px;
  color: #F87171;
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  font-weight: 300;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 24px;
`;

const InputWrapper = styled.div`
  display: flex;
  gap: 12px;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
`;

const NumberInput = styled.input`
  flex: 1;
  min-width: 0;
  box-sizing: border-box;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 14px 16px;
  color: #FFFFFF;
  font-family: 'Outfit', sans-serif;
  font-size: 20px;
  font-weight: 500;
  text-align: center;
  transition: all 0.2s;

  @media (min-width: 480px) {
    font-size: 24px;
    padding: 14px 20px;
  }

  &:focus {
    outline: none;
    border-color: #60A5FA;
    box-shadow: 0 0 0 1px rgba(96, 165, 250, 0.2);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.2);
  }
`;

const DropdownSelect = styled.select`
  flex-shrink: 0;
  width: 110px;
  max-width: 38%;
  box-sizing: border-box;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 14px 12px;
  color: #FFFFFF;
  font-family: 'Outfit', sans-serif;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #60A5FA;
  }

  option {
    background: #0A0A0A;
    color: #FFFFFF;
  }
`;

const NetworkBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'Outfit', sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: #60A5FA;
  background: rgba(96, 165, 250, 0.08);
  border: 1px solid rgba(96, 165, 250, 0.15);
  padding: 6px 12px;
  border-radius: 9999px;
  width: fit-content;
  margin: 0 auto 24px auto;
`;

const Spinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #FFFFFF;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

function walletsMatch(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}


export default function PayQrClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const recipientAddress = searchParams.get('recipient') ?? '';
  const fixedAmount = searchParams.get('amount');
  const fixedCurrency = searchParams.get('currency') ?? 'SOL';
  const label = searchParams.get('label') ?? '';
  const invoiceRef = searchParams.get('invoiceRef') ?? '';
  const expiryParam = searchParams.get('expiry') ?? '';

  const hasFixedAmount = Boolean(fixedAmount);

  const [editableAmount, setEditableAmount] = useState('');
  const [editableCurrency, setEditableCurrency] = useState(fixedCurrency);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<PaymentSuccessData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [contactNickname, setContactNickname] = useState<string | null>(null);
  const [recipientBusinessName, setRecipientBusinessName] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const isExpired = useMemo(() => {
    if (!expiryParam) return false;
    const expiryTimestamp = parseInt(expiryParam, 10);
    return !isNaN(expiryTimestamp) && currentTime > expiryTimestamp;
  }, [expiryParam, currentTime]);

  const amount = hasFixedAmount ? (fixedAmount ?? '') : editableAmount;
  const currency = hasFixedAmount ? fixedCurrency : editableCurrency;

  const { data: usdRate } = useTokenPrice(currency);

  const getUsdEquivalent = () => {
    if (!amount || usdRate === null) return null;
    try {
      return new Decimal(amount).mul(usdRate).toNumber();
    } catch {
      return null;
    }
  };

  const usdAmount = getUsdEquivalent();

  const checkoutQuery = searchParams.toString();
  const checkoutPath = checkoutQuery ? `/pay/qr?${checkoutQuery}` : '/pay/qr';
  const loginRedirectUrl = `/login?mode=login&redirect=${encodeURIComponent(checkoutPath)}`;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !recipientAddress) {
      setContactNickname(null);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const token = await user.getIdToken();
        const { data: contacts } = await getContacts(token);
        const match = contacts.find((c) => walletsMatch(c.walletAddress, recipientAddress));
        if (!cancelled) {
          setContactNickname(match?.nickname?.trim() || null);
        }
      } catch {
        if (!cancelled) {
          setContactNickname(null);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, recipientAddress]);

  useEffect(() => {
    if (!recipientAddress || !isGenericCheckoutLabel(label)) {
      setRecipientBusinessName(null);
      return;
    }

    let cancelled = false;

    (async () => {
      if (user) {
        try {
          const token = await user.getIdToken();
          const profile = await getMerchantProfile(token);
          const ownWallet = profile?.merchantWallet?.trim();
          const ownName = profile?.businessName?.trim();
          if (
            ownWallet &&
            ownName &&
            walletsMatch(ownWallet, recipientAddress) &&
            !cancelled
          ) {
            setRecipientBusinessName(ownName);
            return;
          }
        } catch {
          // Fall through to public lookup
        }
      }

      try {
        const profile = await getMerchantProfileByWallet(recipientAddress);
        if (!cancelled) {
          setRecipientBusinessName(profile?.businessName?.trim() || null);
        }
      } catch {
        if (!cancelled) {
          setRecipientBusinessName(null);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, recipientAddress, label]);

  const handlePayment = async () => {
    if (!user) {
      router.push(loginRedirectUrl);
      return;
    }

    if (!recipientAddress) {
      setError('Recipient wallet address is missing');
      return;
    }
    const paymentAmount = parsePaymentAmount(amount);
    if (paymentAmount === null) {
      setError('Enter a valid amount greater than zero');
      return;
    }

    setLoading(true);
    setError(null);

    try {

      const token = await user.getIdToken();
      const network = (process.env.NEXT_PUBLIC_SOLANA_NETWORK as 'mainnet-beta' | 'devnet') || 'devnet';
      const registry = TOKEN_REGISTRY[network] || {};

      let mint: string | undefined = undefined;
      if (currency !== 'SOL') {
        const entry = Object.entries(registry).find(([, sym]) => sym === currency);
        if (entry) {
          mint = entry[0];
        } else {
          setError('Currency not available on this network');
          return;
        }
      }

      const profile = await getMerchantProfile(token);
      const payerWallet = profile?.merchantWallet?.trim();
      if (payerWallet) {
        const balance = await getWalletBalance(token, payerWallet);
        if (currency === 'SOL') {
          const available = parseFloat(balance.solBalance);
          if (paymentAmount > available) {
            setError('Insufficient balance');
            return;
          }
        } else {
          const tokenBalance = balance.tokens.find(
            (t) => t.symbol === currency || (mint && t.mint === mint),
          );
          const available = parseFloat(tokenBalance?.uiAmount ?? '0');
          if (paymentAmount > available) {
            setError('Insufficient balance');
            return;
          }
        }
      }

      const transferRef = invoiceRef.trim()
        ? `Invoice ${invoiceRef.trim()}: ${label}`
        : `Direct QR payment: ${label}`;

      const res = await sendTransfer(token, {
        toWallet: recipientAddress,
        amount,
        mint,
        reference: transferRef,
      });

      const transfer = res.data;
      setSuccessData({
        amount: transfer?.amount ?? amount,
        symbol: transfer?.symbol ?? currency,
        toWallet: transfer?.toWallet ?? recipientAddress,
        toNickname:
          transfer?.toNickname ??
          contactNickname ??
          recipientBusinessName ??
          (!isGenericCheckoutLabel(label) ? label.trim() : null),
        signature: transfer?.signature ?? null,
        reference: transfer?.reference ?? (invoiceRef || null),
      });

    } catch (err: unknown) {
      console.error('Payment execution failed:', err);
      setError(getTransferErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const truncateWallet = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  const recipientDisplay = !isGenericCheckoutLabel(label)
    ? label.trim()
    : contactNickname || recipientBusinessName || (recipientAddress ? truncateWallet(recipientAddress) : '—');

  const headerSubtitle = !isGenericCheckoutLabel(label)
    ? label.trim()
    : recipientBusinessName
      ? `Payment to ${recipientBusinessName}`
      : 'Direct payment with Luxor Pay';

  const solanaNetworkLabel = process.env.NEXT_PUBLIC_SOLANA_NETWORK ?? 'devnet';

  return (
    <PageWrapper>
      <HeaderNav>
        <BrandLogo>
          Luxor <span>Pay</span>
        </BrandLogo>
        {!user ? (
          <HeaderButton onClick={() => router.push(loginRedirectUrl)}>
            Sign In / Create Account
          </HeaderButton>
        ) : (
          <HeaderButton onClick={() => router.push('/dashboard')}>
            Dashboard
          </HeaderButton>
        )}
      </HeaderNav>

      <MainContent>
        <AnimatePresence mode="wait">
          <CheckoutCard
            key="checkout"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
              <HeaderTitle>Confirm Payment</HeaderTitle>
              <HeaderSubtitle>{headerSubtitle}</HeaderSubtitle>

              <NetworkBadge>
                <ShieldCheck size={14} />
                Solana {solanaNetworkLabel}
              </NetworkBadge>

              {isExpired && (
                <ErrorBox>
                  <AlertCircle size={20} style={{ flexShrink: 0 }} />
                  <div>This payment request has expired.</div>
                </ErrorBox>
              )}

              {error && (
                <ErrorBox>
                  <AlertCircle size={20} style={{ flexShrink: 0 }} />
                  <div>{error}</div>
                </ErrorBox>
              )}

              <AmountContainer>
                {hasFixedAmount ? (
                  <>
                    <Label>Amount to Pay</Label>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '8px 0' }}>
                      <span style={{ 
                        fontFamily: 'Outfit, sans-serif', 
                        fontSize: '48px', 
                        fontWeight: 500, 
                        background: 'linear-gradient(to right, #60A5FA, #2563EB)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        letterSpacing: '-1.5px',
                        display: 'block',
                        textAlign: 'center'
                      }}>
                        {usdAmount !== null ? (
                          `$${usdAmount.toFixed(2)}`
                        ) : (
                          parseFloat(amount || '0').toFixed(currency === 'SOL' ? 4 : 2)
                        )}
                      </span>
                      {usdAmount !== null && (
                        <div style={{
                          fontFamily: 'Montserrat, sans-serif',
                          fontSize: '16px',
                          fontWeight: 300,
                          color: 'rgba(255, 255, 255, 0.6)',
                          marginTop: '6px'
                        }}>
                          {parseFloat(amount || '0').toFixed(currency === 'SOL' ? 4 : 2)} {currency}
                        </div>
                      )}
                      <CurrencyBadge style={{ marginTop: '12px' }}>
                        {usdAmount !== null ? 'USD Equivalent' : currency}
                      </CurrencyBadge>
                    </div>
                  </>
                ) : (
                  <>
                    <Label>Amount to Pay</Label>
                    <InputWrapper>
                      <NumberInput
                        type="text"
                        inputMode="decimal"
                        placeholder="0.00"
                        value={editableAmount}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (/^[0-9]*\.?[0-9]*$/.test(val)) {
                            setEditableAmount(val);
                          }
                        }}
                      />
                      <DropdownSelect
                        value={editableCurrency}
                        onChange={(e) => setEditableCurrency(e.target.value)}
                      >
                        <option value="SOL">SOL</option>
                        <option value="USDC">USDC</option>
                        <option value="LXR">LXR</option>
                      </DropdownSelect>
                    </InputWrapper>
                    {usdAmount !== null && parseFloat(amount || '0') > 0 && (
                      <div style={{
                        fontFamily: 'Montserrat, sans-serif',
                        fontSize: '14px',
                        fontWeight: 300,
                        color: 'rgba(255, 255, 255, 0.6)',
                        textAlign: 'center',
                        marginTop: '12px'
                      }}>
                        ≈ ${usdAmount.toFixed(2)} USD
                      </div>
                    )}
                  </>
                )}
              </AmountContainer>

              <CardSection>
                <Label>Payment Details</Label>
                
                <InfoRow>
                  <InfoLabel>Payee</InfoLabel>
                  <RecipientNameValue title={recipientDisplay}>
                    {recipientDisplay}
                  </RecipientNameValue>
                </InfoRow>

                {recipientAddress && (
                  <InfoRow>
                    <InfoLabel>Wallet</InfoLabel>
                    <InfoValue title={recipientAddress}>
                      {truncateWallet(recipientAddress)}
                    </InfoValue>
                  </InfoRow>
                )}

                <InfoRow>
                  <InfoLabel>Method</InfoLabel>
                  <InfoValue>
                    Luxor Pay Custodial
                  </InfoValue>
                </InfoRow>

                {invoiceRef && (
                  <InfoRow>
                    <InfoLabel>Invoice / Ref</InfoLabel>
                    <InfoValue title={invoiceRef}>
                      {invoiceRef}
                    </InfoValue>
                  </InfoRow>
                )}

                {user && (
                  <InfoRow>
                    <InfoLabel>Luxor Account</InfoLabel>
                    <InfoValue>{user.email}</InfoValue>
                  </InfoRow>
                )}
              </CardSection>

              <ActionButton
                type="button"
                $variant="primary"
                disabled={isExpired || (user ? loading || parsePaymentAmount(amount) === null : false)}
                onClick={handlePayment}
              >
                {!user ? (
                  'Sign In to Pay'
                ) : loading ? (
                  <>
                    <Spinner /> Processing...
                  </>
                ) : (
                  <>
                    Confirm Payment <ArrowRight size={18} />
                  </>
                )}
              </ActionButton>
          </CheckoutCard>
        </AnimatePresence>
      </MainContent>

      <PaymentSuccessModal
        isOpen={successData !== null}
        onClose={() => router.push('/dashboard')}
        data={successData}
      />
    </PageWrapper>
  );
}
