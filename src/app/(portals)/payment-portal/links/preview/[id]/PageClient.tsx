"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { getPaymentLink } from '@/features/payments/api/payments-api';
import { PaymentLink } from '@luxor/contracts';
import {
  ArrowLeft,
  Monitor,
  Smartphone,
  ShoppingBag,
  Store,
  Wallet,
  Calendar,
  DollarSign,
  Copy,
  Check,
  Lock,
  RefreshCw,
  Wifi,
  Battery,
  Signal,
  ChevronLeft,
  ChevronRight,
  Plus,
  ShieldCheck,
  ArrowUpRight,
  ArrowDown,
} from 'lucide-react';
import { toast } from 'sonner';
import { useTokenPrice } from '@/features/wallet/hooks/useTokenPrice';
import { Decimal } from 'decimal.js';
import {
  PageContainer,
  Header,
  BackButton,
  ControlsRow,
  MobileBackRow,
  PreviewColumn,
  MobilePreviewControls,
  ToggleContainer,
  ToggleButton,
  ContentGrid,
  DetailsInfoSection,
  MetaCardTitle,
  DetailRow,
  DetailLabel,
  DetailValue,
  CopyButton,
  PreviewArea,
  DesktopPreviewFit,
  DesktopPreviewInner,
  DesktopPreviewCanvas,
  BrowserFrame,
  BrowserHeader,
  BrowserTabBar,
  BrowserDots,
  BrowserTabsContainer,
  BrowserTab,
  BrowserTabPlus,
  BrowserAddressBarRow,
  BrowserNavButtons,
  BrowserAddressBar,
  MobileBrowserHeader,
  MobileAddressBar,
  MobileFrame,
  MobileStatusBar,
  MobileStatusIcons,
  MobileHomeIndicator,
  SimulatedPageWrapper,
  SimulatedHeaderNav,
  SimulatedBrandLogo,
  SimulatedHeaderButton,
  SimulatedMainContent,
  SimulatedCheckoutCard,
  SimulatedBusinessName,
  SimulatedProductName,
  SimulatedAmountText,
  SimulatedCurrencyText,
  SimulatedDetailsBox,
  SimulatedAccountSection,
  SimulatedAccountRow,
  SimulatedFlowArrowRow,
  SimulatedDetailRow,
  SimulatedPayButton,
  SimulatedFooter,
  LoadingSpinner,
  DESKTOP_PREVIEW_WIDTH,
} from '@/features/payments/components/link-preview.styles';


export default function PreviewPaymentLinkPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  
  const [link, setLink] = useState<PaymentLink | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'desktop' | 'mobile'>('desktop');
  const [copiedWallet, setCopiedWallet] = useState(false);
  const desktopFrameRef = useRef<HTMLDivElement>(null);
  const [desktopPreviewScale, setDesktopPreviewScale] = useState(1);
  const [desktopPreviewHeight, setDesktopPreviewHeight] = useState<number | undefined>();

  const updateDesktopPreviewScale = useCallback(() => {
    const frame = desktopFrameRef.current;
    if (!frame || window.innerWidth >= 768) {
      setDesktopPreviewScale(1);
      setDesktopPreviewHeight(undefined);
      return;
    }

    const availableWidth = window.innerWidth - 32;
    const scale = Math.min(1, availableWidth / DESKTOP_PREVIEW_WIDTH);
    setDesktopPreviewScale(scale);
    setDesktopPreviewHeight(frame.offsetHeight * scale);
  }, []);

  const { data: usdRate, isLoading: isPriceLoading } = useTokenPrice(link?.currency);

  const getUsdEquivalent = () => {
    if (!link || !link.amount || usdRate === null) return null;
    try {
      return new Decimal(link.amount).mul(usdRate).toNumber();
    } catch {
      return null;
    }
  };

  const usdAmount = getUsdEquivalent();

  useLayoutEffect(() => {
    if (mode !== 'desktop') return;

    let resizeObserver: ResizeObserver | null = null;
    let frameId = 0;

    const setup = () => {
      const frame = desktopFrameRef.current;
      if (!frame) {
        frameId = requestAnimationFrame(setup);
        return;
      }

      updateDesktopPreviewScale();
      resizeObserver = new ResizeObserver(updateDesktopPreviewScale);
      resizeObserver.observe(frame);
    };

    setup();
    window.addEventListener('resize', updateDesktopPreviewScale);

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver?.disconnect();
      window.removeEventListener('resize', updateDesktopPreviewScale);
    };
  }, [mode, link, updateDesktopPreviewScale]);

  useEffect(() => {
    async function fetchLink() {
      try {
        const data = await getPaymentLink(id);
        setLink(data);
      } catch (error) {
        toast.error('Failed to load payment link details');
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    
    if (id) {
      fetchLink();
    }
  }, [id]);

  const handleCopyWallet = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedWallet(true);
    toast.success('Wallet address copied');
    setTimeout(() => setCopiedWallet(false), 2000);
  };

  if (loading) {
    return (
      <PageContainer style={{ justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <LoadingSpinner />
      </PageContainer>
    );
  }

  if (!link) {
    return (
      <PageContainer>
        <Header>
          <BackButton onClick={() => router.back()}>
            <ArrowLeft size={16} /> Back to Links
          </BackButton>
        </Header>
        <div style={{ textAlign: 'center', marginTop: '100px', color: 'rgba(255,255,255,0.5)' }}>
          Payment link not found.
        </div>
      </PageContainer>
    );
  }

  return (
    <>
      <header className="lx-page-header">
        <div>
          <h1 className="lx-page-title">
            Payment Links
          </h1>
          <p className="lx-page-subtitle">
            Checkout URLs for your website, email, or social media.
          </p>
        </div>
      </header>

      <PageContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
    >
      <ControlsRow>
        <BackButton onClick={() => router.back()}>
          <ArrowLeft size={16} /> Back
        </BackButton>
        <ToggleContainer>
          <ToggleButton
            $active={mode === 'desktop'}
            onClick={() => setMode('desktop')}
          >
            <Monitor size={16} /> Desktop
          </ToggleButton>
          <ToggleButton
            $active={mode === 'mobile'}
            onClick={() => setMode('mobile')}
          >
            <Smartphone size={16} /> Mobile
          </ToggleButton>
        </ToggleContainer>
      </ControlsRow>

      <MobileBackRow>
        <BackButton onClick={() => router.back()}>
          <ArrowLeft size={16} /> Back
        </BackButton>
      </MobileBackRow>

      <ContentGrid>
        <DetailsInfoSection>
          <MetaCardTitle>
            Link Details
          </MetaCardTitle>

          <DetailRow>
            <DetailLabel>
              <ShoppingBag size={15} />
              <span>Product / Service</span>
            </DetailLabel>
            <DetailValue className="notranslate" translate="no">
              {link.name}
            </DetailValue>
          </DetailRow>

          <DetailRow>
            <DetailLabel>
              <Store size={15} />
              <span>Business</span>
            </DetailLabel>
            <DetailValue className="notranslate" translate="no">
              {link.businessName || 'N/A'}
            </DetailValue>
          </DetailRow>

          <DetailRow>
            <DetailLabel>
              <ArrowUpRight size={15} style={{ color: '#60A5FA' }} />
              <span>Payer Account</span>
            </DetailLabel>
            <DetailValue className="notranslate" translate="no">
              <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                Connected Wallet (HSVNd7...PqN)
              </span>
            </DetailValue>
          </DetailRow>

          <DetailRow>
            <DetailLabel>
              <Wallet size={15} style={{ color: '#34D399' }} />
              <span>Destination Account</span>
            </DetailLabel>
            <DetailValue className="notranslate" translate="no">
              <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                {link.merchantWallet ? `${link.merchantWallet.slice(0, 6)}...${link.merchantWallet.slice(-6)}` : 'N/A'}
              </span>
              {link.merchantWallet && (
                <CopyButton type="button" onClick={() => handleCopyWallet(link.merchantWallet)} title="Copy wallet address">
                  {copiedWallet ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                </CopyButton>
              )}
            </DetailValue>
          </DetailRow>

          <DetailRow>
            <DetailLabel>
              <ShieldCheck size={15} style={{ color: '#34D399' }} />
              <span>Network</span>
            </DetailLabel>
            <DetailValue>
              Solana Mainnet
            </DetailValue>
          </DetailRow>

          <DetailRow>
            <DetailLabel>
              <DollarSign size={15} />
              <span>Subtotal</span>
            </DetailLabel>
            <DetailValue className="notranslate" translate="no">
              {link.amount} {link.currency}
            </DetailValue>
          </DetailRow>

          <DetailRow>
            <DetailLabel>
              <DollarSign size={15} />
              <span>Est. Network Fee</span>
            </DetailLabel>
            <DetailValue style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '13px' }}>
              ~0.000005 SOL
            </DetailValue>
          </DetailRow>

          <DetailRow>
            <DetailLabel>
              <DollarSign size={15} />
              <span>Total Amount</span>
            </DetailLabel>
            <DetailValue className="notranslate" translate="no" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, color: '#60A5FA' }}>
              {link.amount} {link.currency}
            </DetailValue>
          </DetailRow>

          <DetailRow>
            <DetailLabel>
              <Calendar size={15} />
              <span>Created At</span>
            </DetailLabel>
            <DetailValue style={{ fontSize: '13px' }}>
              {new Date(link.createdAt).toLocaleString('en-US', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </DetailValue>
          </DetailRow>
        </DetailsInfoSection>

        <PreviewColumn>
          <MobilePreviewControls>
            <ToggleContainer>
              <ToggleButton
                $active={mode === 'desktop'}
                onClick={() => setMode('desktop')}
              >
                <Monitor size={16} /> Desktop
              </ToggleButton>
              <ToggleButton
                $active={mode === 'mobile'}
                onClick={() => setMode('mobile')}
              >
                <Smartphone size={16} /> Mobile
              </ToggleButton>
            </ToggleContainer>
          </MobilePreviewControls>

        <PreviewArea>
          <AnimatePresence mode="wait">
            {mode === 'desktop' ? (
              <DesktopPreviewFit>
              <DesktopPreviewInner $scale={desktopPreviewScale} $scaledHeight={desktopPreviewHeight}>
              <DesktopPreviewCanvas $scale={desktopPreviewScale}>
              <BrowserFrame
                ref={desktopFrameRef}
                key="desktop"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
              >
                <BrowserHeader>
                  <BrowserTabBar>
                    <BrowserDots>
                      <span />
                      <span />
                      <span />
                    </BrowserDots>
                    <BrowserTabsContainer>
                      <BrowserTab>
                        <ShoppingBag size={10} color="#E2E8F0" />
                        <span>Sterling - Checkout</span>
                      </BrowserTab>
                      <BrowserTabPlus>
                        <Plus size={12} />
                      </BrowserTabPlus>
                    </BrowserTabsContainer>
                  </BrowserTabBar>
                  <BrowserAddressBarRow>
                    <BrowserNavButtons>
                      <ChevronLeft size={14} />
                      <ChevronRight size={14} />
                      <RefreshCw size={12} />
                    </BrowserNavButtons>
                    <BrowserAddressBar>
                      <Lock size={10} />
                      <span>itssterling.com/pay/link/{id.slice(0, 8)}...</span>
                    </BrowserAddressBar>
                    <div style={{ width: 14 }} />
                  </BrowserAddressBarRow>
                </BrowserHeader>
                <SimulatedPageWrapper $mode="desktop">
                  <SimulatedHeaderNav $mode="desktop">
                    <SimulatedBrandLogo $mode="desktop">
                      Luxor <span>Pay</span>
                    </SimulatedBrandLogo>
                    <SimulatedHeaderButton $mode="desktop">
                      Login / Create Account
                    </SimulatedHeaderButton>
                  </SimulatedHeaderNav>
                  <SimulatedMainContent $mode="desktop">
                    <SimulatedCheckoutCard $mode="desktop">
                      <SimulatedBusinessName $mode="desktop">
                        {link.businessName || 'Merchant Checkout'}
                      </SimulatedBusinessName>
                      <SimulatedProductName $mode="desktop">
                        {link.name}
                      </SimulatedProductName>
                      <SimulatedAmountText $mode="desktop">
                        {usdAmount !== null ? (
                          `$${usdAmount.toFixed(2)}`
                        ) : isPriceLoading ? (
                          '$...'
                        ) : (
                          `$${(parseFloat(String(link.amount || '0')) * (usdRate ?? 0)).toFixed(2)}`
                        )}
                      </SimulatedAmountText>
                      <SimulatedCurrencyText $mode="desktop">
                        {parseFloat(String(link.amount || '0')).toFixed(link.currency === 'SOL' ? 9 : 2)} {link.currency}
                      </SimulatedCurrencyText>

                      <SimulatedDetailsBox $mode="desktop">
                        <SimulatedAccountSection>
                          <SimulatedAccountRow $mode="desktop">
                            <div className="account-label">
                              <ArrowUpRight size={11} style={{ color: '#60A5FA' }} /> Payer Account
                            </div>
                            <div className="account-info">
                              <span className="account-name">Connected Wallet</span>
                              <span className="account-wallet">HSVNd7...PqN</span>
                            </div>
                          </SimulatedAccountRow>

                          <SimulatedFlowArrowRow>
                            <ArrowDown size={12} />
                          </SimulatedFlowArrowRow>

                          <SimulatedAccountRow $mode="desktop">
                            <div className="account-label">
                              <Wallet size={11} style={{ color: '#34D399' }} /> Destination Account
                            </div>
                            <div className="account-info">
                              <span className="account-name">{link.businessName || 'Demo Merchant'}</span>
                              <span className="account-wallet">
                                {link.merchantWallet ? `${link.merchantWallet.slice(0, 6)}...${link.merchantWallet.slice(-6)}` : '7xKXt...osgAsU'}
                              </span>
                            </div>
                          </SimulatedAccountRow>
                        </SimulatedAccountSection>

                        <SimulatedDetailRow $mode="desktop">
                          <span className="label">Item / Concept</span>
                          <span className="value">{link.name}</span>
                        </SimulatedDetailRow>
                        <SimulatedDetailRow $mode="desktop">
                          <span className="label">Network</span>
                          <span className="value">
                            <ShieldCheck size={11} style={{ color: '#34D399' }} /> Solana Mainnet
                          </span>
                        </SimulatedDetailRow>
                        <SimulatedDetailRow $mode="desktop">
                          <span className="label">Subtotal</span>
                          <span className="value">{parseFloat(String(link.amount || '0')).toFixed(link.currency === 'SOL' ? 4 : 2)} {link.currency}</span>
                        </SimulatedDetailRow>
                        <SimulatedDetailRow $mode="desktop">
                          <span className="label">Est. Network Fee</span>
                          <span className="value" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>~0.000005 SOL</span>
                        </SimulatedDetailRow>
                        <SimulatedDetailRow $mode="desktop" style={{ paddingTop: '6px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                          <span className="label" style={{ color: '#FFFFFF' }}>Total to Transfer</span>
                          <span className="value" style={{ color: '#60A5FA', fontWeight: 600 }}>
                            {parseFloat(String(link.amount || '0')).toFixed(link.currency === 'SOL' ? 4 : 2)} {link.currency}
                          </span>
                        </SimulatedDetailRow>
                      </SimulatedDetailsBox>

                      <SimulatedPayButton $mode="desktop">
                        Confirm & Pay {parseFloat(String(link.amount || '0')).toFixed(link.currency === 'SOL' ? 4 : 2)} {link.currency}
                      </SimulatedPayButton>
                    </SimulatedCheckoutCard>
                  </SimulatedMainContent>
                  <SimulatedFooter $mode="desktop">
                    <p>Sterling © {new Date().getFullYear()}. All rights reserved.</p>
                  </SimulatedFooter>
                </SimulatedPageWrapper>
              </BrowserFrame>
              </DesktopPreviewCanvas>
              </DesktopPreviewInner>
              </DesktopPreviewFit>
            ) : (
              <MobileFrame
                key="mobile"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <MobileStatusBar>
                  <span>09:41</span>
                  <MobileStatusIcons>
                    <Signal size={10} />
                    <Wifi size={10} />
                    <Battery size={12} />
                  </MobileStatusIcons>
                </MobileStatusBar>
                <MobileBrowserHeader>
                  <MobileAddressBar>
                    <Lock size={8} />
                    <span>pay.sterling.com</span>
                  </MobileAddressBar>
                </MobileBrowserHeader>
                <SimulatedPageWrapper $mode="mobile">
                  <SimulatedHeaderNav $mode="mobile">
                    <SimulatedBrandLogo $mode="mobile">
                      Sterling <span>Pay</span>
                    </SimulatedBrandLogo>
                    <SimulatedHeaderButton $mode="mobile">
                      Login
                    </SimulatedHeaderButton>
                  </SimulatedHeaderNav>
                  <SimulatedMainContent $mode="mobile">
                    <SimulatedCheckoutCard $mode="mobile">
                      <SimulatedBusinessName $mode="mobile">
                        {link.businessName || 'Merchant Checkout'}
                      </SimulatedBusinessName>
                      <SimulatedProductName $mode="mobile">
                        {link.name}
                      </SimulatedProductName>
                      <SimulatedAmountText $mode="mobile">
                        {usdAmount !== null ? (
                          `$${usdAmount.toFixed(2)}`
                        ) : isPriceLoading ? (
                          '$...'
                        ) : (
                          `$${(parseFloat(String(link.amount || '0')) * (usdRate ?? 0)).toFixed(2)}`
                        )}
                      </SimulatedAmountText>
                      <SimulatedCurrencyText $mode="mobile">
                        {parseFloat(String(link.amount || '0')).toFixed(link.currency === 'SOL' ? 9 : 2)} {link.currency}
                      </SimulatedCurrencyText>

                      <SimulatedDetailsBox $mode="mobile">
                        <SimulatedAccountSection>
                          <SimulatedAccountRow $mode="mobile">
                            <div className="account-label">
                              <ArrowUpRight size={10} style={{ color: '#60A5FA' }} /> Payer
                            </div>
                            <div className="account-info">
                              <span className="account-name">Payer Wallet</span>
                              <span className="account-wallet">HSVNd7...PqN</span>
                            </div>
                          </SimulatedAccountRow>

                          <SimulatedFlowArrowRow>
                            <ArrowDown size={10} />
                          </SimulatedFlowArrowRow>

                          <SimulatedAccountRow $mode="mobile">
                            <div className="account-label">
                              <Wallet size={10} style={{ color: '#34D399' }} /> Destination
                            </div>
                            <div className="account-info">
                              <span className="account-name">{link.businessName || 'Merchant'}</span>
                              <span className="account-wallet">
                                {link.merchantWallet ? `${link.merchantWallet.slice(0, 5)}...${link.merchantWallet.slice(-5)}` : '7xKXt...osgAsU'}
                              </span>
                            </div>
                          </SimulatedAccountRow>
                        </SimulatedAccountSection>

                        <SimulatedDetailRow $mode="mobile">
                          <span className="label">Network</span>
                          <span className="value">
                            <ShieldCheck size={10} style={{ color: '#34D399' }} /> Solana
                          </span>
                        </SimulatedDetailRow>
                        <SimulatedDetailRow $mode="mobile">
                          <span className="label">Total</span>
                          <span className="value" style={{ color: '#60A5FA', fontWeight: 600 }}>
                            {parseFloat(String(link.amount || '0')).toFixed(link.currency === 'SOL' ? 4 : 2)} {link.currency}
                          </span>
                        </SimulatedDetailRow>
                      </SimulatedDetailsBox>

                      <SimulatedPayButton $mode="mobile">
                        Confirm & Pay {parseFloat(String(link.amount || '0')).toFixed(link.currency === 'SOL' ? 4 : 2)} {link.currency}
                      </SimulatedPayButton>
                    </SimulatedCheckoutCard>
                  </SimulatedMainContent>
                  <SimulatedFooter $mode="mobile">
                    <p>Sterling © {new Date().getFullYear()}.</p>
                  </SimulatedFooter>
                </SimulatedPageWrapper>
                <MobileHomeIndicator />
              </MobileFrame>
            )}
          </AnimatePresence>
        </PreviewArea>
        </PreviewColumn>
      </ContentGrid>
    </PageContainer>
    </>
  );
}
