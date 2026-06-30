'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { sendTransfer, getPaymentLink } from '@/lib/payments-api';
import { TOKEN_REGISTRY } from '@/lib/token-registry';
import { PaymentLink } from '@luxor/contracts';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { CheckCircle } from 'lucide-react';
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
  padding: 40px;
  width: 100%;
  max-width: 480px;
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
  margin-bottom: 32px;
`;

const AmountText = styled.div`
  font-family: 'Outfit', sans-serif;
  font-size: 56px;
  font-weight: 500;
  letter-spacing: -2px;
  background: linear-gradient(to right, #60A5FA, #2563EB);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 8px;
`;

const CurrencyText = styled.div`
  font-family: 'Montserrat', sans-serif;
  font-size: 18px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 40px;
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

  const { data: usdRate, isLoading: isPriceLoading } = useTokenPrice(link?.currency);

  useEffect(() => {
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
      console.log('NEXT_PUBLIC_SOLANA_NETWORK', process.env.NEXT_PUBLIC_SOLANA_NETWORK);
      const network = (process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet').toLowerCase() as 'mainnet-beta' | 'devnet';
      const registry = TOKEN_REGISTRY[network];

      let mint: string | undefined = undefined;
      if (link.currency !== 'SOL') {
        const entry = Object.entries(registry || {}).find(([m, symbol]) => symbol === link.currency);
        if (entry) {
          mint = entry[0];
        } else {
          throw new Error(`Currency ${link.currency} is not supported on ${network}`);
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
                {!user ? 'Login to Pay' : creating ? 'Processing Payment...' : geoStatus === 'loading' ? 'Requesting Location...' : geoStatus === 'denied' ? 'Location Required' : 'Pay Now'}
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
