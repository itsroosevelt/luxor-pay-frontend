'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getPaymentLink } from '@/lib/payments-api';
import { MOCK_PAYMENT_LINKS } from '@/mocks/data';
import {
  ArrowLeft,
  Copy,
  ExternalLink,
  Pencil,
  QrCode,
  Tag,
  CheckCircle2,
  Zap,
  Plus,
  MoreHorizontal,
  Search,
  ChevronDown,
  ChevronUp,
  Package,
  Loader2,
  FileText,
  Activity,
  Check,
  Clock,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Styled Components ───────────────────────────────────────────────────────

const PageContainer = styled.div`
  min-height: 100vh;
  background: #0a0a0a;
  color: #ededed;
  font-family: 'Montserrat', sans-serif;
  display: flex;
  flex-direction: column;
`;

const MainContent = styled.div`
  padding: 0 40px 60px 40px;
  max-width: 1440px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 24px;

  @media (max-width: 768px) {
    padding: 0 16px 40px 16px;
    gap: 20px;
  }
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  margin-bottom: 12px;
  transition: all 0.2s ease;
  width: fit-content;

  &:hover {
    color: #ffffff;
    transform: translateX(-2px);
  }
`;

/* Stripe Top Banner */
const StripeHeaderCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 24px 28px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
  backdrop-filter: blur(20px);

  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const ProductHeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const ProductAvatar = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  flex-shrink: 0;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const HeaderTitleMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ProductTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const ProductTitle = styled.h1`
  font-family: 'Outfit', sans-serif;
  font-size: 26px;
  font-weight: 500;
  color: #ffffff;
  margin: 0;
  letter-spacing: -0.02em;
`;

const StatusBadge = styled.span`
  font-family: 'Outfit', sans-serif;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  padding: 3px 10px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: inline-flex;
  align-items: center;
  gap: 5px;
`;

const HeaderPriceText = styled.div`
  font-family: 'Outfit', sans-serif;
  font-size: 15px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.6);

  strong {
    font-weight: 600;
    color: #ffffff;
    font-size: 16px;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 500;
  padding: 9px 20px;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  outline: none;

  &:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.4);
    outline-offset: 2px;
  }

  ${({ $variant = 'primary' }) =>
    $variant === 'primary' &&
    `
    background: #FFFFFF;
    color: #000000;
    &:hover {
      background: #EDEDED;
      color: #000000;
    }
  `}

  ${({ $variant }) =>
    $variant === 'secondary' &&
    `
    background: rgba(255, 255, 255, 0.05);
    color: #FFFFFF;
    border: 1px solid rgba(255, 255, 255, 0.12);
    &:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.25);
    }
  `}
`;

const IconMenuButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #ffffff;
  }
`;

const DropdownMenu = styled(motion.div)`
  position: absolute;
  top: 44px;
  right: 0;
  background: rgba(10, 10, 10, 0.96);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(20px);
  z-index: 50;
  min-width: 180px;
  padding: 6px 0;
`;

const DropdownItem = styled.button`
  width: 100%;
  text-align: left;
  background: transparent;
  border: none;
  padding: 10px 16px;
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    color: #ffffff;
  }
`;

/* 2-Column Grid */
const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 28px;
  align-items: start;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

/* Section Header */
const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const SectionTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const SectionTitle = styled.h2`
  font-family: 'Outfit', sans-serif;
  font-size: 18px;
  font-weight: 500;
  color: #ffffff;
  margin: 0;
`;

const SectionBadge = styled.span`
  font-family: 'Outfit', sans-serif;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const MiniAddButton = styled.button`
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.12);
    color: #ffffff;
  }
`;

/* Table / Glass Cards */
const RatesTableWrapper = styled.div`
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 13px;
`;

const Th = styled.th`
  padding: 12px 18px;
  font-family: 'Outfit', sans-serif;
  font-size: 11px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
`;

const Td = styled.td`
  padding: 14px 18px;
  color: rgba(255, 255, 255, 0.85);
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
`;

const DefaultBadge = styled.span`
  font-family: 'Outfit', sans-serif;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.15);
  margin-left: 8px;
`;

const DashedBox = styled.div`
  border: 1px dashed rgba(255, 255, 255, 0.12);
  border-radius: 20px;
  padding: 32px 24px;
  text-align: center;
  color: rgba(255, 255, 255, 0.45);
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;

  p {
    margin: 0;
  }
`;

const SubtitleDescription = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  margin: -8px 0 12px 0;

  a {
    color: rgba(255, 255, 255, 0.8);
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
`;

const SearchInputWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 360px;
`;

const SearchInput = styled.input`
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
  padding: 9px 16px 9px 38px;
  color: #ffffff;
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  width: 100%;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.3);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.35);
  }
`;

const SearchIconAbs = styled.div`
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.4);
  display: flex;
`;

/* Right Sidebar Cards */
const SidebarCard = styled.div`
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SidebarCardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  h3 {
    font-family: 'Outfit', sans-serif;
    font-size: 16px;
    font-weight: 500;
    color: #ffffff;
    margin: 0;
  }
`;

const EditIconBtn = styled.button`
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;

  &:hover {
    color: #ffffff;
  }
`;

const MetaList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const MetaItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

const MetaLabel = styled.span`
  font-family: 'Outfit', sans-serif;
  font-size: 11px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const MetaValue = styled.div`
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  gap: 6px;

  &.mono {
    font-family: monospace;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.7);
  }
`;

const LogRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.04);
  font-family: monospace;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.75);

  span.method {
    color: #ffffff;
    font-weight: 600;
  }

  span.status {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.08);
    padding: 2px 6px;
    border-radius: 4px;
  }

  span.time {
    color: rgba(255, 255, 255, 0.4);
    font-size: 11px;
  }
`;

const LoadingWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  color: rgba(255, 255, 255, 0.6);
  gap: 12px;
  font-family: 'Outfit', sans-serif;
`;

// ─── Component ───────────────────────────────────────────────────────────────

export default function EnglishProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showMoreDetails, setShowMoreDetails] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      try {
        const user = auth.currentUser;
        if (user) {
          const data = await getPaymentLink(id);
          if (data) {
            setProduct(data);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Backend fetch failed, using fallback item', err);
      }

      const found = MOCK_PAYMENT_LINKS.find((l) => l.id === id) || {
        id: id || 'prod_UxZeYh41dBsX3B',
        name: 'All-Inclusive Plan',
        businessName: 'Advisory Services',
        description: 'Personalized advisory and continuous Web3 onboarding support.',
        category: 'Advisory Services',
        amount: 13000.0,
        currency: 'USD',
        createdAt: '26 Jul 2026',
        updatedAt: '26 Jul 2026',
        sku: 'txcd_20060048',
        imageUrl: '',
        features: ['Personalized Advisory', 'VIP Portal Access', '24/7 Dedicated Support'],
        lxrDiscountPercent: 5,
      };

      setProduct(found);
      setLoading(false);
    };

    fetchDetail();
  }, [id]);

  const payUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/pay/link/${id}`;

  const copyPayLink = () => {
    navigator.clipboard.writeText(payUrl);
    toast.success('Payment link copied');
    setMenuOpen(false);
  };

  const copyId = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('ID copied to clipboard');
  };

  if (loading) {
    return (
      <PageContainer>
        <LoadingWrapper>
          <Loader2 size={24} className="animate-spin" /> Loading product details...
        </LoadingWrapper>
      </PageContainer>
    );
  }

  const formattedAmount = `${product?.currency || 'USD'} ${Number(product?.amount || 13000).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  return (
    <PageContainer>
      {/* Standard Luxor Page Header */}
      <header className="lx-page-header">
        <div>
          <h1 className="lx-page-title">
            Product Details
          </h1>
          <p className="lx-page-subtitle">
            View and manage pricing rates, marketing features, cross-sells, and metadata.
          </p>
        </div>
      </header>

      <MainContent>
        {/* Eyebrow & Header Banner */}
        <div>
          <BackLink href="/payment-portal/catalog">
            <ArrowLeft size={14} /> Catalog
          </BackLink>

          <StripeHeaderCard
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <ProductHeaderLeft>
              <ProductAvatar>
                {product?.imageUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={product.imageUrl} alt={product.name} />
                ) : (
                  <Package size={28} />
                )}
              </ProductAvatar>

              <HeaderTitleMeta>
                <ProductTitleRow>
                  <ProductTitle>{product?.name || 'All-Inclusive Plan'}</ProductTitle>
                  <StatusBadge>
                    <CheckCircle2 size={11} /> Active
                  </StatusBadge>
                </ProductTitleRow>
                <HeaderPriceText>
                  <strong>{formattedAmount}</strong>
                </HeaderPriceText>
              </HeaderTitleMeta>
            </ProductHeaderLeft>

            <HeaderActions>
              <Button type="button" $variant="secondary" onClick={() => router.push('/payment-portal/catalog')}>
                <Pencil size={14} /> Edit product
              </Button>

              <IconMenuButton
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="More options"
              >
                <MoreHorizontal size={18} />
              </IconMenuButton>

              <AnimatePresence>
                {menuOpen && (
                  <DropdownMenu
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                  >
                    <DropdownItem onClick={copyPayLink}>
                      <Copy size={14} /> Copy Payment Link
                    </DropdownItem>
                    <a href={`/pay/link/${id}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                      <DropdownItem>
                        <ExternalLink size={14} /> Public Checkout Preview
                      </DropdownItem>
                    </a>
                    <DropdownItem onClick={() => router.push('/payment-portal/pos')}>
                      <QrCode size={14} /> Open in POS
                    </DropdownItem>
                  </DropdownMenu>
                )}
              </AnimatePresence>
            </HeaderActions>
          </StripeHeaderCard>
        </div>

        {/* 2-Column Main Content */}
        <DetailGrid>
          {/* Left Main Column */}
          <LeftColumn>
            {/* Section 1: Pricing Rates */}
            <div>
              <SectionHeader>
                <SectionTitleRow>
                  <SectionTitle>Pricing Rates</SectionTitle>
                </SectionTitleRow>
                <MiniAddButton type="button" title="Add rate">
                  <Plus size={16} />
                </MiniAddButton>
              </SectionHeader>

              <RatesTableWrapper>
                <Table>
                  <thead>
                    <tr>
                      <Th>Price</Th>
                      <Th>Description</Th>
                      <Th>Subscriptions</Th>
                      <Th>Created Date</Th>
                      <Th style={{ textAlign: 'right' }}>Actions</Th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <Td style={{ fontWeight: 600, color: '#ffffff' }}>
                        {formattedAmount}
                        <DefaultBadge>Default</DefaultBadge>
                      </Td>
                      <Td style={{ color: 'rgba(255, 255, 255, 0.45)' }}>—</Td>
                      <Td style={{ color: 'rgba(255, 255, 255, 0.45)' }}>—</Td>
                      <Td style={{ color: 'rgba(255, 255, 255, 0.6)' }}>{product?.createdAt || '26 Jul'}</Td>
                      <Td style={{ textAlign: 'right' }}>
                        <IconMenuButton style={{ width: 28, height: 28, marginLeft: 'auto' }}>
                          <MoreHorizontal size={14} />
                        </IconMenuButton>
                      </Td>
                    </tr>
                  </tbody>
                </Table>
              </RatesTableWrapper>
            </div>

            {/* Section 2: Trial Versions */}
            <div>
              <SectionHeader>
                <SectionTitleRow>
                  <SectionTitle>Trial Versions</SectionTitle>
                  <SectionBadge>Preview</SectionBadge>
                </SectionTitleRow>
                <MiniAddButton type="button" title="Add trial">
                  <Plus size={16} />
                </MiniAddButton>
              </SectionHeader>

              <DashedBox>
                <p>No trial versions created</p>
              </DashedBox>
            </div>

            {/* Section 3: Cross-Sells */}
            <div>
              <SectionHeader>
                <SectionTitleRow>
                  <SectionTitle>Cross-Sells</SectionTitle>
                </SectionTitleRow>
              </SectionHeader>

              <SubtitleDescription>
                Suggest a related product for customers to add to their order directly in Checkout.
              </SubtitleDescription>

              <SearchInputWrapper>
                <SearchIconAbs>
                  <Search size={14} />
                </SearchIconAbs>
                <SearchInput placeholder="Search for a product..." />
              </SearchInputWrapper>
            </div>

            {/* Section 4: Marketing Features */}
            <div>
              <SectionHeader>
                <SectionTitleRow>
                  <SectionTitle>Marketing Features</SectionTitle>
                </SectionTitleRow>
              </SectionHeader>

              <DashedBox>
                <Sparkles size={24} style={{ opacity: 0.5, marginBottom: 4 }} />
                <p>Features define customer entitlements and access for this product.</p>
                {product?.features && Array.isArray(product.features) && product.features.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12, textAlign: 'left' }}>
                    {product.features.map((feat: string, i: number) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>
                        <Check size={14} color="#FFFFFF" /> {feat}
                      </div>
                    ))}
                  </div>
                )}
              </DashedBox>
            </div>

            {/* Section 5: Activity Logs */}
            <div>
              <SectionHeader>
                <SectionTitleRow>
                  <SectionTitle>Activity Logs</SectionTitle>
                </SectionTitleRow>
              </SectionHeader>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <LogRow>
                  <div>
                    <span className="method">POST</span> /v1/products/{product?.id || 'prod_UxZeYh41dBsX3B'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span className="status">200 OK</span>
                    <span className="time">26/7/26 20:43:10</span>
                  </div>
                </LogRow>
              </div>
            </div>
          </LeftColumn>

          {/* Right Sidebar Column */}
          <RightColumn>
            {/* Card 1: Details */}
            <SidebarCard>
              <SidebarCardHeader>
                <h3>Details</h3>
                <EditIconBtn type="button" title="Edit details">
                  <Pencil size={14} />
                </EditIconBtn>
              </SidebarCardHeader>

              <MetaList>
                <MetaItem>
                  <MetaLabel>Product ID</MetaLabel>
                  <MetaValue className="mono">
                    {product?.id || 'prod_UxZeYh41dBsX3B'}
                    <Copy
                      size={13}
                      style={{ cursor: 'pointer', color: 'rgba(255,255,255,0.5)' }}
                      onClick={() => copyId(product?.id || 'prod_UxZeYh41dBsX3B')}
                    />
                  </MetaValue>
                </MetaItem>

                <MetaItem>
                  <MetaLabel>Product Category</MetaLabel>
                  <MetaValue>
                    {product?.category || 'Advisory Services'}
                  </MetaValue>
                  {product?.sku && (
                    <MetaValue className="mono" style={{ fontSize: 11 }}>
                      {product.sku}
                    </MetaValue>
                  )}
                </MetaItem>

                <MetaItem>
                  <MetaLabel>Description</MetaLabel>
                  <MetaValue style={{ fontSize: 13, lineHeight: 1.4 }}>
                    {product?.description || 'Personalized advisory and continuous Web3 onboarding support.'}
                  </MetaValue>
                </MetaItem>

                {product?.lxrDiscountPercent > 0 && (
                  <MetaItem>
                    <MetaLabel>Web3 $LXR Discount</MetaLabel>
                    <MetaValue style={{ color: '#ffffff', fontWeight: 500 }}>
                      <Zap size={14} /> {product.lxrDiscountPercent}% OFF with $LXR
                    </MetaValue>
                  </MetaItem>
                )}

                {showMoreDetails && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 6 }}
                  >
                    <MetaItem>
                      <MetaLabel>Features List</MetaLabel>
                      <MetaValue>—</MetaValue>
                    </MetaItem>
                    <MetaItem>
                      <MetaLabel>Attributes</MetaLabel>
                      <MetaValue>—</MetaValue>
                    </MetaItem>
                  </motion.div>
                )}
              </MetaList>

              <Button
                type="button"
                $variant="secondary"
                style={{ width: '100%', fontSize: 12, padding: '6px 12px' }}
                onClick={() => setShowMoreDetails(!showMoreDetails)}
              >
                {showMoreDetails ? (
                  <>
                    Show less <ChevronUp size={14} />
                  </>
                ) : (
                  <>
                    Show more <ChevronDown size={14} />
                  </>
                )}
              </Button>
            </SidebarCard>

            {/* Card 2: Metadata */}
            <SidebarCard>
              <SidebarCardHeader>
                <h3>Metadata</h3>
                <EditIconBtn type="button" title="Edit metadata">
                  <Pencil size={14} />
                </EditIconBtn>
              </SidebarCardHeader>

              <DashedBox style={{ padding: '20px 16px', borderRadius: 14 }}>
                <p style={{ fontSize: 12 }}>No metadata set</p>
              </DashedBox>
            </SidebarCard>
          </RightColumn>
        </DetailGrid>
      </MainContent>
    </PageContainer>
  );
}
