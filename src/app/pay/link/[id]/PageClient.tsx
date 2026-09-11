'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { sendTransfer, getPaymentLink } from '@/lib/payments-api';
import { useTokenRegistry } from '@/context/TokenRegistryContext';
import { PaymentLink } from '@luxor/contracts';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { CheckCircle, Wallet, ShieldCheck, ArrowUpRight, ArrowDown } from 'lucide-react';
import { Decimal } from 'decimal.js';
import { useTokenPrice } from '@/hooks/useTokenPrice';

const PageWrapper = styled.div`
  min-height: 100vh;
  background: #000000;
  display: flex;
  flex-direction: column;
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
  font-weight: 700;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  gap: 8px;

  span {
    color: #60A5FA;
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
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
`;

const Footer = styled.footer`
  padding: 24px;
  text-align: center;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
`;

const CheckoutCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 36px 32px;
  width: 100%;
  max-width: 500px;
  text-align: center;
  box-shadow: 0 32px 64px -16px rgba(0,0,0,0.8);
`;

const BusinessName = styled.div`
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #60A5FA;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 8px;
`;

const ProductName = styled.div`
  font-family: 'Outfit', sans-serif;
  font-size: 28px;
  font-weight: 500;
  color: #FFFFFF;
  margin-bottom: 24px;
`;

const AmountText = styled.div`
  font-family: 'Outfit', sans-serif;
  font-size: 52px;
  font-weight: 500;
  letter-spacing: -2px;
  background: linear-gradient(to right, #60A5FA, #2563EB);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 6px;
`;

const CurrencyText = styled.div`
  font-family: 'Montserrat', sans-serif;
  font-size: 16px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 20px;
`;

const PaymentDetailsBox = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 20px;
  margin: 16px 0 24px 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  text-align: left;
`;

const AccountSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
`;

const AccountRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  .account-label {
    font-family: 'Outfit', sans-serif;
    font-size: 11px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.4);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .account-info {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 2px;
  }

  .account-name {
    font-family: 'Outfit', sans-serif;
    font-size: 13px;
    font-weight: 500;
    color: #FFFFFF;
  }

  .account-wallet {
    font-family: monospace;
    font-size: 11px;
    color: rgba(255, 255, 255, 0.6);
  }
`;

const FlowArrowRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: -4px 0;
  color: rgba(96, 165, 250, 0.6);
`;

const DetailsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const DetailRow = styled.div<{ $bold?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;

  .label {
    font-family: 'Montserrat', sans-serif;
    color: ${({ $bold }) => ($bold ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)')};
    font-weight: ${({ $bold }) => ($bold ? '500' : '400')};
  }

  .value {
    font-family: 'Outfit', sans-serif;
    color: #FFFFFF;
    font-weight: ${({ $bold }) => ($bold ? '600' : '500')};
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .monospace {
    font-family: monospace;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.9);
  }
`;

const PayButton = styled.button`
  background: #FFFFFF;
  color: #000000;
  font-family: 'Outfit', sans-serif;
  font-size: 16px;
  font-weight: 500;
  padding: 16px 32px;
  border-radius: 9999px;
  width: 100%;
  border: none;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #2563EB;
    color: #FFFFFF;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export default function PayLinkPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [link, setLink] = useState<PaymentLink | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [geoCoords, setGeoCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [geoStatus, setGeoStatus] = useState<'loading' | 'granted' | 'denied'>('loading');

  const { getMintForSymbol } = useTokenRegistry();
  const { data: usdRate, isLoading: isPriceLoading } = useTokenPrice(link?.currency);

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

  const getUsdEquivalent = () => {
    if (!link || !link.amount || usdRate === null) return null;
    try {
      return new Decimal(link.amount).mul(usdRate).toNumber();
    } catch {
      return null;
    }
  };

  const usdAmount = getUsdEquivalent();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getPaymentLink(id)
      .then((data) => {
        setLink(data);
        setLoading(false);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : 'Failed to load payment link');
        setLoading(false);
      });
  }, [id]);

  const handlePay = async () => {
    if (!user) {
      router.push(`/login?mode=login&redirect=/pay/link/${id}`);
      return;
    }
    if (!id || !link) return;
    setCreating(true);
    setError(null);
    try {
      const token = await user.getIdToken();
      let mint: string | undefined = undefined;
      if (link.currency !== 'SOL') {
        const foundMint = getMintForSymbol(link.currency);
        if (foundMint) {
          mint = foundMint;
        } else {
          throw new Error(`Currency ${link.currency} is not supported`);
        }
      }

      if (geoStatus !== 'granted' || !geoCoords) {
        throw new Error('Geolocation permission is required to complete this payment.');
      }

      await sendTransfer(token, {
        toWallet: link.merchantWallet,
        amount: link.amount.toString(),
        mint,
        reference: `Payment for ${link.name}`,
        ...geoCoords,
      });

      setSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not execute payment');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <MainContent>
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </MainContent>
      </PageWrapper>
    );
  }

  if (error || !link) {
    return (
      <PageWrapper>
        <MainContent>
          <div className="glass-panel p-8 max-w-md text-center text-red-400">
            {error || 'Link not found'}
          </div>
        </MainContent>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <HeaderNav>
        <BrandLogo>Luxor <span>Pay</span></BrandLogo>
        {!user ? (
          <HeaderButton onClick={() => router.push(`/login?redirect=/pay/link/${id}`)}>
            Login / Create Account
          </HeaderButton>
        ) : (
          <HeaderButton onClick={() => router.push('/dashboard')}>
            Dashboard
          </HeaderButton>
        )}
      </HeaderNav>

      <MainContent>
        <AnimatePresence mode="wait">
          {!success ? (
            <CheckoutCard
              key="checkout"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
            >
              <BusinessName>{link.businessName || 'Merchant Checkout'}</BusinessName>
              <ProductName>{link.name}</ProductName>

              <AmountText>
                {usdAmount !== null ? (
                  `$${usdAmount.toFixed(2)}`
                ) : isPriceLoading ? (
                  '$...'
                ) : (
                  `$${(parseFloat(String(link.amount || '0')) * (usdRate ?? 0)).toFixed(2)}`
                )}
              </AmountText>
              <CurrencyText>
                {parseFloat(String(link.amount || '0')).toFixed(link.currency === 'SOL' ? 9 : 2)} {link.currency}
              </CurrencyText>

              {/* Payment Details & Accounts Breakdown */}
              <PaymentDetailsBox>
                <AccountSection>
                  {/* Payer Account (Cuenta de Envío) */}
                  <AccountRow>
                    <div className="account-label">
                      <ArrowUpRight size={13} style={{ color: '#60A5FA' }} /> Payer Account
                    </div>
                    <div className="account-info">
                      <span className="account-name">
                        {user ? (user.displayName || user.email?.split('@')[0] || 'Connected Payer Wallet') : 'Sin Conectar'}
                      </span>
                      <span className="account-wallet">
                        {user ? 'HSVNd7...PqN' : 'Inicia sesión para transferir'}
                      </span>
                    </div>
                  </AccountRow>

                  <FlowArrowRow>
                    <ArrowDown size={14} />
                  </FlowArrowRow>

                  {/* Merchant Account (Cuenta de Destino) */}
                  <AccountRow>
                    <div className="account-label">
                      <Wallet size={13} style={{ color: '#34D399' }} /> Destination Account
                    </div>
                    <div className="account-info">
                      <span className="account-name">{link.businessName || 'Demo Coffee Co.'}</span>
                      <span className="account-wallet">
                        {link.merchantWallet ? `${link.merchantWallet.slice(0, 6)}...${link.merchantWallet.slice(-6)}` : '7xKXt...osgAsU'}
                      </span>
                    </div>
                  </AccountRow>
                </AccountSection>

                <DetailsSection>
                  <DetailRow>
                    <span className="label">Item / Concept</span>
                    <span className="value">{link.name}</span>
                  </DetailRow>
                  <DetailRow>
                    <span className="label">Network</span>
                    <span className="value">
                      <ShieldCheck size={13} style={{ color: '#34D399' }} /> Solana Mainnet
                    </span>
                  </DetailRow>
                  <DetailRow>
                    <span className="label">Subtotal</span>
                    <span className="value">{parseFloat(String(link.amount || '0')).toFixed(link.currency === 'SOL' ? 4 : 2)} {link.currency}</span>
                  </DetailRow>
                  <DetailRow>
                    <span className="label">Est. Network Fee</span>
                    <span className="value" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>~0.000005 SOL</span>
                  </DetailRow>
                  <DetailRow $bold style={{ paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <span className="label">Total to Transfer</span>
                    <span className="value" style={{ color: '#60A5FA', fontSize: '15px' }}>
                      {parseFloat(String(link.amount || '0')).toFixed(link.currency === 'SOL' ? 4 : 2)} {link.currency}
                    </span>
                  </DetailRow>
                </DetailsSection>
              </PaymentDetailsBox>

              {error && (
                <div className="mb-4 text-red-400 text-sm">
                  {error}
                </div>
              )}

              {geoStatus === 'denied' && (
                <div className="mb-4 text-red-400 text-sm">
                  Location access is required to proceed with this payment. Please allow location access in your browser.
                </div>
              )}

              <PayButton onClick={handlePay} disabled={creating || geoStatus !== 'granted'}>
                {!user ? 'Login to Pay' : creating ? 'Processing Payment...' : geoStatus === 'loading' ? 'Requesting Location...' : geoStatus === 'denied' ? 'Location Required' : `Confirm & Pay ${parseFloat(String(link.amount || '0')).toFixed(link.currency === 'SOL' ? 4 : 2)} ${link.currency}`}
              </PayButton>
            </CheckoutCard>
          ) : (
            <CheckoutCard
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}
            >
              <CheckCircle size={64} color="#60A5FA" />
              <ProductName style={{ marginBottom: '8px' }}>Payment Successful!</ProductName>
              <CurrencyText>Your transfer has been confirmed on-chain.</CurrencyText>
              <PayButton onClick={() => router.push('/dashboard')}>
                Return to Dashboard
              </PayButton>
            </CheckoutCard>
          )}
        </AnimatePresence>
      </MainContent>

      <Footer>
        <p>Luxor Pay © {currentTime.getFullYear()}. All rights reserved.</p>
        <p style={{ marginTop: '8px' }}>
          {currentTime.toLocaleDateString()} {currentTime.toLocaleTimeString()}
        </p>
      </Footer>
    </PageWrapper>
  );
}
