'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { sendTransfer, getPaymentLink, createPaymentFromLink, verifyPayment } from '@/lib/payments-api';
import { TOKEN_REGISTRY } from '@/lib/token-registry';
import { PaymentLink, PaymentOrder } from '@luxor/contracts';
import { buildPaymentQrUrl, isBackendSupportedCurrency } from '@/lib/solana-pay-url';
import { isOpenAmountLink } from '@/lib/payment-link-utils';
import { extractWalletAddressFromScan } from '@/lib/qr-scan-routing';
import { QrCameraScanner } from '@/components/qr/QrCameraScanner';
import { useHybridPaymentVerification } from '@/features/checkout/hooks/useHybridPaymentVerification';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { CheckCircle, ArrowLeft, Camera, Copy, AlertCircle, Check } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import { PaymentButton } from '@/features/checkout/components/PaymentButton';
import { getMerchantProfile } from '@/lib/merchants-api';
import { useGetBalance } from '@/hooks/useGetBalance';
import Decimal from 'decimal.js';
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

const OpenAmountInput = styled.input`
  font-family: 'Outfit', sans-serif;
  font-size: 32px;
  font-weight: 500;
  letter-spacing: -1px;
  text-align: center;
  width: 100%;
  max-width: 240px;
  margin: 0 auto 8px auto;
  display: block;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  padding: 12px 16px;
  color: #60A5FA;
  outline: none;

  &:focus {
    border-color: rgba(96, 165, 250, 0.6);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
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

  &:hover {
    color: #FFFFFF;
  }
`;

const BrandAvatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2563EB, #60A5FA);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Outfit', sans-serif;
  font-size: 24px;
  font-weight: 700;
  color: #FFFFFF;
  margin: 0 auto 20px auto;
  box-shadow: 0 8px 24px rgba(37, 99, 235, 0.4);
`;

const Eyebrow = styled.div`
  font-family: 'Outfit', sans-serif;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.4em;
  text-transform: uppercase;
  color: #60A5FA;
  margin-bottom: 8px;
`;

const QrSubtitle = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.5);
  margin: 20px 0;
`;

const QrWrapper = styled.div`
  background: #FFFFFF;
  padding: 24px;
  border-radius: 32px;
  display: inline-block;
  margin: 0 auto;
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.4);
`;

const AddressCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 24px 0;
  text-align: left;
`;

const AddressInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

const AddressLabel = styled.span`
  font-family: 'Outfit', sans-serif;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #60A5FA;
  text-transform: uppercase;
`;

const AddressText = styled.span`
  font-family: monospace;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const CopyButton = styled.button`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #FFFFFF;
  font-family: 'Outfit', sans-serif;
  font-size: 12px;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.2);
  }
`;

const ZelleForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  text-align: left;
  margin: 24px 0;
`;

const ZelleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 14px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);

  &:last-child {
    border-bottom: none;
  }
`;

const ZelleCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
`;

const ZelleLabel = styled.span`
  font-family: 'Outfit', sans-serif;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
`;

const ZelleValue = styled.div`
  font-family: 'Outfit', sans-serif;
  font-size: 15px;
  font-weight: 500;
  color: #FFFFFF;
`;

const ZelleSelect = styled.select`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 12px 16px;
  color: #FFFFFF;
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  width: 100%;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 16px center;
  background-size: 16px;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: #60A5FA;
  }

  & option {
    background: #0A0A0A;
    color: #FFFFFF;
  }
`;

const BalanceInfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);

  &:last-child {
    border-bottom: none;
  }
`;

const BalanceLabel = styled.span`
  font-family: 'Outfit', sans-serif;
  font-size: 11px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.1em;
`;

const BalanceValue = styled.span<{ $status?: 'success' | 'error' | 'normal' }>`
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: ${({ $status }) => 
    $status === 'success' ? '#10B981' : 
    $status === 'error' ? '#EF4444' : 
    '#FFFFFF'
  };
`;

const WalletDisplay = styled.span`
  font-family: monospace;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
`;

const StatusMessage = styled.div<{ $type: 'success' | 'error' | 'warning' }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 12px;
  width: 100%;
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.4;
  margin-top: 8px;
  margin-bottom: 16px;
  text-align: left;
  
  ${({ $type }) => $type === 'success' && `
    background: rgba(16, 185, 129, 0.1);
    border: 1px solid rgba(16, 185, 129, 0.2);
    color: #10B981;
  `}
  
  ${({ $type }) => $type === 'error' && `
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.2);
    color: #EF4444;
  `}

  ${({ $type }) => $type === 'warning' && `
    background: rgba(249, 115, 22, 0.1);
    border: 1px solid rgba(249, 115, 22, 0.2);
    color: #F97316;
  `}
`;

export default function PayLinkPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [link, setLink] = useState<PaymentLink | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [payerProfile, setPayerProfile] = useState<any>(null);
  const [payerProfileLoading, setPayerProfileLoading] = useState(false);

  const [payerAmount, setPayerAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'account' | 'qr' | 'wallet' | 'camera'>('qr');
  const [scannedClientWallet, setScannedClientWallet] = useState<string | null>(null);
  const [cameraScanKey, setCameraScanKey] = useState(0);
  const [paymentOrder, setPaymentOrder] = useState<PaymentOrder | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);

  useHybridPaymentVerification(paymentOrder, {
    enabled: showQr && !success,
    onConfirmed: () => {
      setSuccess(true);
      toast.success('Payment confirmed on Solana');
    },
    onOrderUpdate: setPaymentOrder,
  });

  useEffect(() => {
    if (!user) {
      setPayerProfile(null);
      return;
    }
    const fetchProfile = async () => {
      setPayerProfileLoading(true);
      try {
        const token = await user.getIdToken();
        const profile = await getMerchantProfile(token);
        setPayerProfile(profile);
      } catch (e) {
        console.error('Failed to fetch payer profile:', e);
      } finally {
        setPayerProfileLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const { data: balanceData, isLoading: isBalanceLoading, isError: balanceError } = useGetBalance(
    payerProfile?.merchantWallet
  );

  const getPayerBalance = (): Decimal => {
    if (!balanceData) return new Decimal(0);
    if (link?.currency === 'SOL') {
      return new Decimal(balanceData.solBalance || '0');
    }
    const token = balanceData.tokens?.find(
      (t) => t.symbol?.toUpperCase() === link?.currency?.toUpperCase()
    );
    return new Decimal(token?.uiAmount || '0');
  };

  const isOpenAmount = link ? isOpenAmountLink(link) : false;
  const parsedPayerAmount = parseFloat(payerAmount);
  const effectiveAmount =
    link && isOpenAmount
      ? parsedPayerAmount
      : link?.amount ?? 0;
  const hasValidPayerAmount =
    !isOpenAmount || (Number.isFinite(parsedPayerAmount) && parsedPayerAmount > 0);

  const payerBalance = getPayerBalance();
  const requiredAmount = new Decimal(hasValidPayerAmount ? effectiveAmount : 0);
  const hasSufficientBalance = payerProfile?.merchantWallet ? payerBalance.gte(requiredAmount) : false;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser: any) => {
      setUser(currentUser);
      if (currentUser) {
        setPaymentMethod('account');
      } else {
        setPaymentMethod('qr');
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!id) return;
    getPaymentLink(id)
      .then(setLink)
      .catch((e) => setError(e instanceof Error ? e.message : 'Link not found'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!showQr || paymentMethod !== 'qr' || !link || !hasValidPayerAmount) {
      return;
    }

    let cancelled = false;

    async function prepareQrPayment() {
      setQrLoading(true);
      setQrError(null);
      setPaymentOrder(null);

      try {
        if (isBackendSupportedCurrency(link!.currency)) {
          const order = await createPaymentFromLink(link!.id, { amount: effectiveAmount });
          if (!cancelled) {
            setPaymentOrder(order);
          }
          return;
        }

        const clientUrl = buildPaymentQrUrl({
          recipient: link!.merchantWallet,
          amount: effectiveAmount,
          currency: link!.currency,
          label: link!.name,
          message: link!.businessName,
        });

        if (!cancelled) {
          setPaymentOrder({
            reference: '',
            merchantId: link!.merchantId,
            amount: effectiveAmount,
            currency: link!.currency,
            recipient: link!.merchantWallet,
            status: 'pending',
            label: link!.name,
            linkId: link!.id,
            solanaPayUrl: clientUrl,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      } catch (e) {
        const fallbackUrl = buildPaymentQrUrl({
          recipient: link!.merchantWallet,
          amount: effectiveAmount,
          currency: link!.currency,
          label: link!.name,
          message: link!.businessName,
        });

        if (!cancelled) {
          setPaymentOrder({
            reference: '',
            merchantId: link!.merchantId,
            amount: effectiveAmount,
            currency: link!.currency,
            recipient: link!.merchantWallet,
            status: 'pending',
            label: link!.name,
            linkId: link!.id,
            solanaPayUrl: fallbackUrl,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          setQrError(
            e instanceof Error
              ? `${e.message}. Showing QR without automatic verification.`
              : 'Backend unavailable. Showing QR without automatic verification.'
          );
        }
      } finally {
        if (!cancelled) {
          setQrLoading(false);
        }
      }
    }

    prepareQrPayment();

    return () => {
      cancelled = true;
    };
  }, [showQr, paymentMethod, link, effectiveAmount, hasValidPayerAmount]);

  const handlePay = async () => {
    if (isOpenAmount && !hasValidPayerAmount) {
      toast.error('Enter a valid amount to pay');
      return;
    }
    if (!user) {
      router.push(`/login?mode=login&redirect=/pay/link/${id}`);
      return;
    }
    setShowQr(true);
  };

  async function handleConfirmTransfer() {
    if (!link || !hasValidPayerAmount) return;
    setCreating(true);
    setError(null);
    try {
      if (paymentMethod === 'account') {
        if (!user) {
          throw new Error('You must sign in to pay with your account.');
        }
        const token = await user.getIdToken();
        const network = (process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'mainnet-beta') as 'devnet' | 'mainnet-beta';
        const registry = TOKEN_REGISTRY[network] || {};
        const mintAddress = Object.keys(registry).find(key => registry[key] === link.currency);
        const mint = link.currency === 'SOL' ? undefined : mintAddress;

        await sendTransfer(token, {
          toWallet: link.merchantWallet,
          amount: effectiveAmount.toString(),
          mint: mint || undefined,
        });
      } else if (paymentMethod === 'qr') {
        if (paymentOrder?.reference) {
          const result = await verifyPayment(paymentOrder.reference);
          setPaymentOrder(result.data);
          if (!result.confirmed) {
            throw new Error(result.data.status === 'confirmed'
              ? 'Payment already confirmed'
              : 'Payment not found on chain yet. Complete the transfer in your wallet and try again.');
          }
        } else {
          throw new Error('Automatic verification is unavailable for this token. Confirm only after the transfer appears in your wallet.');
        }
      } else if (paymentMethod === 'wallet') {
        const payUrl =
          paymentOrder?.solanaPayUrl ??
          buildPaymentQrUrl({
            recipient: link.merchantWallet,
            amount: effectiveAmount,
            currency: link.currency,
            reference: paymentOrder?.reference,
            label: link.name,
            message: link.businessName,
          });

        window.open(payUrl, '_blank', 'noopener,noreferrer');

        if (paymentOrder?.reference) {
          const result = await verifyPayment(paymentOrder.reference);
          setPaymentOrder(result.data);
          if (!result.confirmed) {
            toast.info('Complete the transfer in your wallet. Confirmation will happen automatically.');
            return;
          }
        } else {
          toast.info('Complete the transfer in your wallet, then confirm manually if needed.');
          return;
        }
      } else if (paymentMethod === 'camera') {
        throw new Error(
          'Merchant charge-from-scanned-wallet requires a POS backend API (not implemented yet). Use QR or Wallet to pay.'
        );
      }
      setSuccess(true);
      toast.success('Payment completed successfully');
    } catch (e) {
      console.error(e);
      const msg = e instanceof Error ? e.message : 'Could not execute payment';
      setError(msg);
      toast.error(msg);
    } finally {
      setCreating(false);
    }
  }

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

  const dateObj = link ? new Date(link.createdAt) : null;
  const formattedDate = dateObj
    ? dateObj.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

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
          {success ? (
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
          ) : showQr ? (
            <CheckoutCard
              key="qrcode"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
              style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', maxWidth: '500px' }}
            >
              <BackButton onClick={() => setShowQr(false)}>
                <ArrowLeft size={16} /> Back
              </BackButton>

              <h2 className="text-xl font-bold mb-6 text-center" style={{ fontFamily: 'Outfit, sans-serif' }}>Pay</h2>

              {user && (
                payerProfileLoading || isBalanceLoading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '16px 0', width: '100%', marginBottom: '16px' }}>
                    <div className="w-8 h-8 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
                    <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>
                      Fetching your wallet balance...
                    </span>
                  </div>
                ) : balanceError ? (
                  <StatusMessage $type="error" style={{ marginBottom: '16px' }}>
                    <AlertCircle size={16} />
                    <span>Failed to fetch wallet balance. Please check your network or try again.</span>
                  </StatusMessage>
                ) : !payerProfile?.merchantWallet ? (
                  <div className="w-full" style={{ marginBottom: '16px' }}>
                    <StatusMessage $type="warning">
                      <AlertCircle size={16} />
                      <span>No Solana wallet configured. Please set up your wallet address in settings.</span>
                    </StatusMessage>
                    <button
                      type="button"
                      onClick={() => router.push('/dashboard/settings')}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '9999px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#FFFFFF',
                        fontFamily: 'Outfit, sans-serif',
                        fontWeight: 500,
                        fontSize: '14px',
                        cursor: 'pointer',
                      }}
                    >
                      Go to Settings
                    </button>
                  </div>
                ) : (
                  <div className="w-full" style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '20px', padding: '16px 20px', marginBottom: '24px' }}>
                    <BalanceInfoRow>
                      <BalanceLabel>Your Wallet</BalanceLabel>
                      <WalletDisplay>
                        {payerProfile.merchantWallet.slice(0, 6)}...{payerProfile.merchantWallet.slice(-6)}
                      </WalletDisplay>
                    </BalanceInfoRow>
                    
                    <BalanceInfoRow>
                      <BalanceLabel>Available Balance</BalanceLabel>
                      <BalanceValue $status={hasSufficientBalance ? 'success' : 'error'}>
                        {payerBalance.toString()} {link.currency}
                      </BalanceValue>
                    </BalanceInfoRow>

                    <BalanceInfoRow>
                      <BalanceLabel>Required</BalanceLabel>
                      <BalanceValue $status="normal">
                        {hasValidPayerAmount ? `${effectiveAmount} ${link.currency}` : 'Enter amount'}
                      </BalanceValue>
                    </BalanceInfoRow>

                    {hasSufficientBalance ? (
                      <StatusMessage $type="success" style={{ margin: '16px 0 0 0' }}>
                        <Check size={16} />
                        <span>Sufficient balance to perform the transfer.</span>
                      </StatusMessage>
                    ) : (
                      <StatusMessage $type="error" style={{ margin: '16px 0 0 0' }}>
                        <AlertCircle size={16} />
                        <span>Insufficient funds for this payment.</span>
                      </StatusMessage>
                    )}
                  </div>
                )
              )}

              <ZelleForm style={{ marginBottom: '24px' }}>
                <ZelleRow>
                  <ZelleCol>
                    <ZelleLabel>From (Payment Method)</ZelleLabel>
                    <ZelleSelect
                      value={paymentMethod}
                      onChange={(e) => {
                        setPaymentMethod(e.target.value as any);
                        setScannedClientWallet(null);
                      }}
                    >
                      {user && <option value="account">Luxor Pay Account Balance (From settings)</option>}
                      <option value="qr">Solana Pay QR (Show QR Code)</option>
                      <option value="wallet">Connect Solana Wallet (Wallet Adapter)</option>
                      <option value="camera">Scan Client QR (Camera)</option>
                    </ZelleSelect>
                  </ZelleCol>
                </ZelleRow>
              </ZelleForm>

              {/* Dynamic Payment Method Render */}
              {paymentMethod === 'account' && (
                <div className="flex flex-col items-center gap-4 w-full">
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: '12px', marginBottom: '16px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255, 255, 255, 0.5)', fontFamily: 'Outfit, sans-serif' }}>Pay with Account</span>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#60A5FA', fontFamily: 'Outfit, sans-serif' }}>{user?.email}</span>
                  </div>

                  <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)', textAlign: 'center', margin: '4px 0 8px 0', lineHeight: '1.6' }}>
                    The payment will be sent from the Solana address configured in your settings.
                  </p>

                  <AddressCard className="w-full" style={{ margin: '0 0 24px 0' }}>
                    <AddressInfo>
                      <AddressLabel>Destination Address</AddressLabel>
                      <AddressText>{link.merchantWallet}</AddressText>
                    </AddressInfo>
                  </AddressCard>

                  <PayButton 
                    onClick={handleConfirmTransfer} 
                    disabled={creating || payerProfileLoading || isBalanceLoading || !hasSufficientBalance || !payerProfile?.merchantWallet || !hasValidPayerAmount}
                  >
                    {creating 
                      ? 'Processing Payment...' 
                      : !payerProfile?.merchantWallet 
                        ? 'Setup Wallet to Pay' 
                        : !hasValidPayerAmount
                          ? 'Enter Amount to Pay'
                        : !hasSufficientBalance 
                          ? 'Insufficient Funds' 
                          : `Confirm & Pay ${effectiveAmount} ${link.currency}`
                    }
                  </PayButton>
                </div>
              )}

              {paymentMethod === 'qr' && (
                <div className="flex flex-col items-center gap-4 w-full">
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: '12px', marginBottom: '16px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255, 255, 255, 0.5)', fontFamily: 'Outfit, sans-serif' }}>Blockchain</span>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#60A5FA', fontFamily: 'Outfit, sans-serif' }}>Solana</span>
                  </div>

                  <QrSubtitle style={{ margin: '8px 0', textAlign: 'center' }}>
                    Scan with your Solana wallet (Phantom, Solflare, etc.)
                  </QrSubtitle>

                  {qrError && (
                    <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '12px', color: '#FBBF24', textAlign: 'center', margin: '0 0 8px 0' }}>
                      {qrError}
                    </p>
                  )}

                  <QrWrapper>
                    {qrLoading ? (
                      <div className="w-10 h-10 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
                    ) : paymentOrder?.solanaPayUrl ? (
                      <QRCodeSVG
                        value={paymentOrder.solanaPayUrl}
                        size={180}
                        level="H"
                        includeMargin={false}
                      />
                    ) : (
                      <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '13px', color: 'rgba(255,255,255,0.6)', padding: '24px' }}>
                        Unable to generate payment QR.
                      </p>
                    )}
                  </QrWrapper>

                  {paymentOrder?.solanaPayUrl && (
                    <a
                      href={paymentOrder.solanaPayUrl}
                      style={{
                        fontFamily: 'Outfit, sans-serif',
                        fontSize: '12px',
                        fontWeight: 600,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: '#60A5FA',
                        textDecoration: 'none',
                      }}
                    >
                      Open in wallet
                    </a>
                  )}

                  <AddressCard className="w-full">
                    <AddressInfo>
                      <AddressLabel>Destination Address</AddressLabel>
                      <AddressText>{link.merchantWallet}</AddressText>
                    </AddressInfo>
                    <CopyButton type="button" onClick={() => {
                      navigator.clipboard.writeText(link.merchantWallet);
                      toast.success('Address copied to clipboard');
                    }}>
                      Copy
                    </CopyButton>
                  </AddressCard>

                  <PayButton onClick={handleConfirmTransfer} disabled={creating || qrLoading || !paymentOrder?.solanaPayUrl}>
                    {creating
                      ? 'Processing...'
                      : paymentOrder?.reference
                        ? 'I have made the transfer'
                        : 'Confirm manual transfer'}
                  </PayButton>
                </div>
              )}

              {paymentMethod === 'wallet' && (
                <div className="w-full mt-4">
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: '12px', marginBottom: '16px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255, 255, 255, 0.5)', fontFamily: 'Outfit, sans-serif' }}>Blockchain</span>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#60A5FA', fontFamily: 'Outfit, sans-serif' }}>Solana</span>
                  </div>
                  <PaymentButton onPay={handleConfirmTransfer} disabled={creating} />
                </div>
              )}

              {paymentMethod === 'camera' && (
                <div className="w-full">
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: '12px', marginBottom: '16px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255, 255, 255, 0.5)', fontFamily: 'Outfit, sans-serif' }}>Blockchain</span>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#60A5FA', fontFamily: 'Outfit, sans-serif' }}>Solana</span>
                  </div>
                  {!scannedClientWallet ? (
                    <>
                      <QrSubtitle style={{ margin: '8px 0', textAlign: 'center' }}>
                        Place the client's wallet QR code in front of the camera.
                      </QrSubtitle>
                      <QrCameraScanner
                        key={cameraScanKey}
                        enabled={showQr && paymentMethod === 'camera'}
                        onDetect={(scannedText) => {
                          const wallet = extractWalletAddressFromScan(scannedText);
                          if (!wallet) {
                            toast.error('Invalid wallet QR code');
                            return;
                          }
                          setScannedClientWallet(wallet);
                          toast.success('Client address scanned');
                        }}
                        borderRadius={20}
                        margin="16px 0"
                      />
                    </>
                  ) : (
                    <div style={{ marginTop: '16px' }}>
                      <AddressCard style={{ margin: '0 0 16px 0' }}>
                        <AddressInfo>
                          <AddressLabel>Client Scanned Address</AddressLabel>
                          <AddressText>{scannedClientWallet}</AddressText>
                        </AddressInfo>
                      </AddressCard>
                      <PayButton onClick={handleConfirmTransfer} disabled={creating}>
                        {creating ? 'Processing...' : 'Confirm and Pay'}
                      </PayButton>
                      <button
                        type="button"
                        onClick={() => {
                          setScannedClientWallet(null);
                          setCameraScanKey((key) => key + 1);
                        }}
                        className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-full text-sm font-medium border border-white/10 text-gray-300 mt-2"
                        style={{ fontFamily: 'Outfit, sans-serif' }}
                      >
                        Scan Again
                      </button>
                    </div>
                  )}
                </div>
              )}
            </CheckoutCard>
          ) : (
            <CheckoutCard
              key="checkout"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
            >
              <Eyebrow>Payment Request</Eyebrow>
              <ProductName>{link.name}</ProductName>

              {isOpenAmount ? (
                <>
                  <OpenAmountInput
                    type="number"
                    step="any"
                    min="0"
                    value={payerAmount}
                    onChange={(e) => setPayerAmount(e.target.value)}
                    placeholder="0.00"
                    autoFocus
                  />
                  <CurrencyText>{link.currency}</CurrencyText>
                </>
              ) : (
                <>
                  <AmountText>{link.amount}</AmountText>
                  <CurrencyText>{link.currency}</CurrencyText>
                </>
              )}

              <ZelleForm style={{ marginTop: '24px', marginBottom: '24px' }}>
                {link.businessName && (
                  <ZelleRow>
                    <ZelleCol>
                      <ZelleLabel>Sender</ZelleLabel>
                      <ZelleValue style={{ fontSize: '14px', color: '#60A5FA' }}>{link.businessName}</ZelleValue>
                    </ZelleCol>
                  </ZelleRow>
                )}

                <ZelleRow>
                  <ZelleCol>
                    <ZelleLabel>Purpose</ZelleLabel>
                    <ZelleValue style={{ fontStyle: 'italic', color: 'rgba(255, 255, 255, 0.8)' }}>
                      {link.name}
                    </ZelleValue>
                  </ZelleCol>
                </ZelleRow>

                <ZelleRow>
                  <ZelleCol>
                    <ZelleLabel>Date Sent</ZelleLabel>
                    <ZelleValue>{formattedDate}</ZelleValue>
                  </ZelleCol>
                </ZelleRow>
              </ZelleForm>

              {error && (
                <div className="mb-4 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <PayButton onClick={handlePay} disabled={creating || (isOpenAmount && !hasValidPayerAmount)}>
                {!user
                  ? isOpenAmount && !hasValidPayerAmount
                    ? 'Enter amount to continue'
                    : 'Login to Pay'
                  : creating
                    ? 'Processing Payment...'
                    : isOpenAmount && !hasValidPayerAmount
                      ? 'Enter amount to pay'
                      : 'Pay Now'}
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
