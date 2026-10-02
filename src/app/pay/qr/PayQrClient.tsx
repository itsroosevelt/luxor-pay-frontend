'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { sendTransfer } from '@/features/payments/api/payments-api';
import { getContacts } from '@/features/contacts/api/contacts-api';
import { isGenericCheckoutLabel } from '@/features/payments/lib/luxor-pay-checkout-url';
import { getMerchantProfile, getMerchantProfileByWallet } from '@/features/merchant/api/merchants-api';
import { getWalletBalance } from '@/features/wallet/api/solana-api';
import { getTransferErrorMessage, parsePaymentAmount } from '@/features/transfers/lib/transfer-errors';
import { useTokenRegistry } from '@/context/TokenRegistryContext';
import { PaymentSuccessModal, PaymentSuccessData } from '@/features/payments/components/PaymentSuccessModal';
import { Decimal } from 'decimal.js';
import { useTokenPrice } from '@/features/wallet/hooks/useTokenPrice';
import { ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import {
  PageWrapper,
  HeaderNav,
  BrandLogo,
  HeaderButton,
  MainContent,
  CheckoutCard,
  HeaderTitle,
  HeaderSubtitle,
  CardSection,
  Label,
  InfoRow,
  InfoLabel,
  InfoValue,
  RecipientNameValue,
  AmountContainer,
  CurrencyBadge,
  ActionButton,
  ErrorBox,
  InputWrapper,
  NumberInput,
  DropdownSelect,
  NetworkBadge,
  Spinner,
} from '@/features/payments/components/pay-qr.styles';

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
  const usdAmountParam = searchParams.get('usdAmount');
  const message = searchParams.get('message') ?? '';

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
  const [paymentDate, setPaymentDate] = useState('');
  const [geoCoords, setGeoCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [geoStatus, setGeoStatus] = useState<'loading' | 'granted' | 'denied'>('loading');

  useEffect(() => {
    import('@capacitor/core').then(({ Capacitor }) => {
      if (Capacitor.isNativePlatform()) {
        import('@capacitor/geolocation').then(({ Geolocation }) => {
          Geolocation.getCurrentPosition({ enableHighAccuracy: true, maximumAge: 60000 })
            .then(pos => {
              setGeoCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
              setGeoStatus('granted');
            })
            .catch(err => {
              console.error('Capacitor Geolocation error:', err);
              setGeoStatus('denied');
            });
        });
        return;
      }
      
      if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
        setGeoStatus('denied');
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGeoCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
          setGeoStatus('granted');
        },
        (err) => {
          console.error('Geolocation error:', err);
          setGeoStatus('denied');
        },
        { enableHighAccuracy: true, maximumAge: 60000 }
      );
    });
  }, []);

  useEffect(() => {
    setPaymentDate(
      new Date().toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    );
  }, []);

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

  const { tokens, getMintForSymbol } = useTokenRegistry();
  const { data: usdRate, isLoading: isPriceLoading } = useTokenPrice(currency);

  const getUsdEquivalent = () => {
    if (usdAmountParam) {
      const parsed = parseFloat(usdAmountParam);
      if (!isNaN(parsed) && parsed > 0) {
        return parsed;
      }
    }
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
        const { data: contacts } = await getContacts();
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
          const profile = await getMerchantProfile();
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

      let mint: string | undefined = undefined;
      if (currency !== 'SOL') {
        const foundMint = getMintForSymbol(currency);
        if (foundMint) {
          mint = foundMint;
        } else {
          setError('Currency not available on this network');
          return;
        }
      }

      const profile = await getMerchantProfile();
      const payerWallet = profile?.merchantWallet?.trim();
      if (payerWallet) {
        const balance = await getWalletBalance(payerWallet);
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

      if (geoStatus !== 'granted' || !geoCoords) {
        throw new Error('Geolocation permission is required to complete this payment.');
      }

      const res = await sendTransfer({
        toWallet: recipientAddress,
        amount,
        mint,
        reference: transferRef,
        ...geoCoords,
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
      : 'Direct payment with Sterling';

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

              {geoStatus === 'denied' && (
                <ErrorBox>
                  <AlertCircle size={20} style={{ flexShrink: 0 }} />
                  <div>Location access is required to proceed with this payment. Please allow location access in your browser.</div>
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
                        ) : isPriceLoading ? (
                          '$...'
                        ) : (
                          `$${(parseFloat(amount || '0') * (usdRate ?? 0)).toFixed(2)}`
                        )}
                      </span>
                      <div style={{
                        fontFamily: 'Montserrat, sans-serif',
                        fontSize: '16px',
                        fontWeight: 300,
                        color: 'rgba(255, 255, 255, 0.6)',
                        marginTop: '6px'
                      }}>
                        {parseFloat(amount || '0').toFixed(currency === 'SOL' ? 9 : 2)} {currency}
                      </div>
                      <CurrencyBadge style={{ marginTop: '12px' }}>
                        {currency}
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
                        {tokens.map((t) => (
                          <option key={t.mint} value={t.symbol}>{t.symbol}</option>
                        ))}
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
                    Sterling Custodial
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

                {paymentDate && (
                  <InfoRow>
                    <InfoLabel>Date</InfoLabel>
                    <InfoValue>{paymentDate}</InfoValue>
                  </InfoRow>
                )}

                {message && (
                  <InfoRow>
                    <InfoLabel>Description</InfoLabel>
                    <InfoValue title={message}>
                      {message}
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
                disabled={isExpired || geoStatus !== 'granted' || (user ? loading || parsePaymentAmount(amount) === null : false)}
                onClick={handlePayment}
              >
                {!user ? (
                  'Sign In to Pay'
                ) : loading ? (
                  <>
                    <Spinner /> Processing...
                  </>
                ) : geoStatus === 'loading' ? (
                  'Requesting Location...'
                ) : geoStatus === 'denied' ? (
                  'Location Required'
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
