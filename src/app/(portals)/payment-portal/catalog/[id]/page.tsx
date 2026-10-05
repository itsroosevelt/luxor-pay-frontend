'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { auth } from '@/lib/firebase';
import { getPaymentLink } from '@/features/payments/api/payments-api';
import { IS_MOCK_MODE } from '@/lib/mock/mock-config';
import { MOCK_PAYMENT_LINKS } from '@/mocks/data';
import {
  ArrowLeft,
  Copy,
  ExternalLink,
  Pencil,
  QrCode,
  CheckCircle2,
  Zap,
  Plus,
  MoreHorizontal,
  Search,
  ChevronDown,
  ChevronUp,
  Package,
  Loader2,
  Activity,
  Check,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  PageContainer,
  MainContent,
  BackLink,
  StripeHeaderCard,
  ProductHeaderLeft,
  ProductAvatar,
  HeaderTitleMeta,
  ProductTitleRow,
  ProductTitle,
  StatusBadge,
  HeaderPriceText,
  HeaderActions,
  Button,
  IconMenuButton,
  DropdownMenu,
  DropdownItem,
  DetailGrid,
  LeftColumn,
  RightColumn,
  SectionHeader,
  SectionTitleRow,
  SectionTitle,
  SectionBadge,
  MiniAddButton,
  RatesTableWrapper,
  Table,
  Th,
  Td,
  DefaultBadge,
  DashedBox,
  SubtitleDescription,
  SearchInputWrapper,
  SearchInput,
  SearchIconAbs,
  SidebarCard,
  SidebarCardHeader,
  EditIconBtn,
  MetaList,
  MetaItem,
  MetaLabel,
  MetaValue,
  LogRow,
  LoadingWrapper,
} from '@/features/payments/components/catalog-detail.styles';

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

      // Outside Mock Mode never show an invented product (with a payable link) — show "not found".
      if (!IS_MOCK_MODE) {
        setProduct(null);
        setLoading(false);
        return;
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

  if (!product) {
    return (
      <PageContainer>
        <LoadingWrapper>
          Producto no encontrado o no se pudo cargar.{' '}
          <BackLink href="/payment-portal/catalog">
            <ArrowLeft size={14} /> Catalog
          </BackLink>
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
