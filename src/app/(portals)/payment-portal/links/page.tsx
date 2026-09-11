'use client';

import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { createPaymentLink, listPaymentLinks, updatePaymentLink, deletePaymentLink } from '@/lib/payments-api';
import type { PaymentLink } from '@luxor/contracts';
import {
  Copy,
  Link as LinkIcon,
  Plus,
  ExternalLink,
  Loader2,
  X,
  Pencil,
  Trash2,
  Image as ImageLucide,
  Percent,
  FileText,
  Calendar,
  Truck,
  Phone,
  CheckCircle2,
  Eye,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTokenRegistry } from '@/context/TokenRegistryContext';
import { getLuxorEnv } from '@/lib/luxor-env';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { MOCK_PAYMENT_LINKS } from '@/mocks/data';

// --- Styled Components ---

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
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
  background: rgba(10, 10, 10, 0.96);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 32px 64px -16px rgba(0, 0, 0, 0.9);
  border-radius: 28px;
  width: 100%;
  max-width: 920px;
  padding: 28px 32px;
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: 960px) {
    max-width: 100%;
    padding: 20px;
    border-radius: 24px;
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
  z-index: 10;

  &:hover {
    background: rgba(255, 255, 255, 0.12);
    color: #FFFFFF;
  }
`;

const FormHeader = styled.h2`
  font-family: 'Outfit', sans-serif;
  font-size: 22px;
  font-weight: 500;
  color: var(--lx-text);
  margin-top: 0;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const DangerFormHeader = styled(FormHeader)`
  color: var(--lx-danger);
`;

const ModalFormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
`;

const BuilderGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 28px;
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const TabList = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 9999px;
  margin-bottom: 20px;
  overflow-x: auto;
  scrollbar-width: none;
`;

const TabButton = styled.button<{ $active: boolean }>`
  font-family: 'Outfit', sans-serif;
  font-size: 12px;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;

  ${({ $active }) =>
    $active
      ? `
    background: #FFFFFF;
    color: #000000;
    box-shadow: 0 4px 12px rgba(255, 255, 255, 0.15);
  `
      : `
    background: transparent;
    color: rgba(255, 255, 255, 0.6);
    &:hover {
      color: #FFFFFF;
      background: rgba(255, 255, 255, 0.06);
    }
  `}
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.85);
  cursor: pointer;
  user-select: none;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.15);
  }

  input[type='checkbox'] {
    width: 16px;
    height: 16px;
    accent-color: #2563EB;
    cursor: pointer;
  }
`;

const LivePreviewCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: sticky;
  top: 0;
  backdrop-filter: blur(20px);
`;

const LivePreviewBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'Outfit', sans-serif;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #60A5FA;
`;

const PreviewImageWrapper = styled.div`
  width: 100%;
  height: 160px;
  border-radius: 16px;
  background: rgba(0, 0, 0, 0.4);
  border: 1px dashed rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const PreviewTitle = styled.h4`
  font-family: 'Outfit', sans-serif;
  font-size: 18px;
  font-weight: 500;
  color: #FFFFFF;
  margin: 0;
`;

const PreviewPrice = styled.div`
  font-family: 'Outfit', sans-serif;
  font-size: 22px;
  font-weight: 600;
  color: #FFFFFF;
  display: flex;
  align-items: baseline;
  gap: 6px;

  span {
    font-size: 13px;
    font-weight: 400;
    color: rgba(255, 255, 255, 0.5);
  }
`;

const DeleteModalText = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  color: var(--lx-text-muted);
  margin-bottom: 24px;
  line-height: 1.5;
`;

const ContentHeaderAction = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const UrlDotSeparator = styled.span`
  color: var(--lx-border);
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
    border-color: #E2E8F0;
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.2);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }
`;

const Textarea = styled.textarea`
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  padding: 12px 16px;
  color: #FFFFFF;
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  font-weight: 400;
  transition: all 0.2s;
  width: 100%;
  min-height: 80px;
  resize: vertical;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #E2E8F0;
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.2);
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
    border-color: #E2E8F0;
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
    outline: 2px solid #E2E8F0;
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
      box-shadow: 0 0 20px rgba(37, 99, 235, 0.45);
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
  background: rgba(255, 255, 255, 0.1);
  color: #E2E8F0;
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
    color: #E2E8F0;
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
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.35);
    color: #E2E8F0;
  }

  &:focus-visible {
    outline: 2px solid #E2E8F0;
    outline-offset: 2px;
  }
`;

const IconDeleteAction = styled(IconAction)`
  &:hover {
    background: rgba(248, 113, 113, 0.15);
    border-color: rgba(248, 113, 113, 0.4);
    color: #F87171;
  }
`;

const DangerButton = styled(Button)`
  background: #F87171;
  color: #FFFFFF;
  &:hover:not(:disabled) {
    background: #EF4444;
    color: #FFFFFF;
    box-shadow: 0 8px 16px rgba(248, 113, 113, 0.35);
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

export default function PortalPaymentLinksPage() {
  const router = useRouter();
  const [links, setLinks] = useState<PaymentLink[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Create state
  const [destinationAccount, setDestinationAccount] = useState('7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU');
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Subscription');
  const [sku, setSku] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<string>('USDC');
  
  // New Stripe-like fields
  const [imageUrl, setImageUrl] = useState('');
  const [pricingType, setPricingType] = useState<'fixed' | 'custom'>('fixed');
  const [allowQuantity, setAllowQuantity] = useState(false);
  const [featuresText, setFeaturesText] = useState('');
  const [collectShipping, setCollectShipping] = useState(false);
  const [collectPhone, setCollectPhone] = useState(false);
  const [collectTaxId, setCollectTaxId] = useState(false);
  const [collectCustomNote, setCollectCustomNote] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState('');
  const [lxrDiscount, setLxrDiscount] = useState('0');
  const [maxUses, setMaxUses] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  
  const [activeTab, setActiveTab] = useState<'general' | 'pricing' | 'checkout' | 'limits'>('general');
  const [creating, setCreating] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Edit state
  const [editingLink, setEditingLink] = useState<PaymentLink | null>(null);
  const [editName, setEditName] = useState('');
  const [editBusinessName, setEditBusinessName] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editCurrency, setEditCurrency] = useState<string>('USDC');
  const [updating, setUpdating] = useState(false);

  // Delete state
  const [deletingLinkId, setDeletingLinkId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { tokens } = useTokenRegistry();

  const env = getLuxorEnv();
  const isDev = env === 'development';

  const parsedAmount = parseFloat(amount);
  const isFormValid =
    name.trim().length > 0 &&
    businessName.trim().length > 0 &&
    (pricingType === 'custom' || (!Number.isNaN(parsedAmount) && parsedAmount > 0)) &&
    Boolean(currency);

  const parsedEditAmount = parseFloat(editAmount);
  const isEditFormValid =
    editName.trim().length > 0 &&
    editBusinessName.trim().length > 0 &&
    editAmount.trim().length > 0 &&
    !Number.isNaN(parsedEditAmount) &&
    parsedEditAmount > 0 &&
    Boolean(editCurrency);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const token = await user.getIdToken();
        const data = await listPaymentLinks(token);
        if (data && Array.isArray(data) && data.length > 0) {
          setLinks(data);
        } else {
          setLinks(MOCK_PAYMENT_LINKS);
        }
      } catch {
        setLinks(MOCK_PAYMENT_LINKS);
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
    if (!name.trim() || !businessName.trim()) {
      toast.error('Product name and business name are required');
      return;
    }
    if (pricingType === 'fixed' && (Number.isNaN(parsed) || parsed <= 0)) {
      toast.error('Enter a valid fixed amount');
      return;
    }

    setCreating(true);
    try {
      const token = await user.getIdToken();
      const features = featuresText
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean);

      const link = await createPaymentLink(token, {
        name: name.trim(),
        businessName: businessName.trim(),
        description: description.trim() || undefined,
        category: category || 'Suscripción',
        sku: sku.trim() || undefined,
        amount: pricingType === 'fixed' ? parsed : 0,
        currency,
        merchantWallet: destinationAccount,
        imageUrl: imageUrl.trim() || undefined,
        pricingType,
        allowQuantity,
        features,
        collectShipping,
        collectPhone,
        collectTaxId,
        collectCustomNote,
        redirectUrl: redirectUrl.trim() || undefined,
        lxrDiscountPercent: parseFloat(lxrDiscount) || 0,
        maxUses: maxUses ? parseInt(maxUses) : undefined,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
      });

      setLinks((prev) => [link, ...prev]);
      
      // Reset form
      setName('');
      setBusinessName('');
      setDescription('');
      setImageUrl('');
      setSku('');
      setAmount('');
      setFeaturesText('');
      setCollectShipping(false);
      setCollectPhone(false);
      setCollectTaxId(false);
      setCollectCustomNote(false);
      setRedirectUrl('');
      setLxrDiscount('0');
      setMaxUses('');
      setExpiresAt('');
      setIsFormOpen(false);
      
      toast.success('Payment link created successfully');
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

  const openEditModal = (link: PaymentLink) => {
    setEditingLink(link);
    setEditName(link.name || '');
    setEditBusinessName(link.businessName || '');
    setEditAmount(String(link.amount || ''));
    setEditCurrency(link.currency || 'USDC');
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLink) return;
    const user = auth.currentUser;
    if (!user) return;

    const parsed = parseFloat(editAmount);
    if (!editName.trim() || !editBusinessName.trim() || Number.isNaN(parsed) || parsed <= 0) {
      toast.error('Enter valid details for all fields');
      return;
    }

    setUpdating(true);
    try {
      const token = await user.getIdToken();
      const updated = await updatePaymentLink(token, editingLink.id, {
        name: editName.trim(),
        businessName: editBusinessName.trim(),
        amount: parsed,
        currency: editCurrency,
      });
      setLinks((prev) =>
        prev.map((l) =>
          l.id === editingLink.id
            ? {
                ...l,
                ...updated,
                name: editName.trim(),
                businessName: editBusinessName.trim(),
                amount: parsed,
                currency: editCurrency,
              }
            : l,
        ),
      );
      setEditingLink(null);
      toast.success('Payment link updated');
    } catch {
      toast.error('Could not update link');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingLinkId) return;
    const user = auth.currentUser;
    if (!user) return;

    setDeleting(true);
    try {
      const token = await user.getIdToken();
      await deletePaymentLink(token, deletingLinkId);
      setLinks((prev) => prev.filter((l) => l.id !== deletingLinkId));
      setDeletingLinkId(null);
      toast.success('Payment link deleted');
    } catch {
      toast.error('Could not delete link');
    } finally {
      setDeleting(false);
    }
  };

  const payLinkUrl = (id: string) => `${window.location.origin}/pay/link/${id}`;

  const copyUrl = (id: string) => {
    navigator.clipboard.writeText(payLinkUrl(id));
    toast.success('Link copied');
  };

  return (
    <PageContainer>
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

      <AnimatePresence>
        {/* Create Link Modal */}
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
                  <Plus size={20} /> Create Payment Link
                </FormHeader>

                <TabList>
                  <TabButton
                    type="button"
                    $active={activeTab === 'general'}
                    onClick={() => setActiveTab('general')}
                  >
                    <ImageLucide size={14} /> Product & Visuals
                  </TabButton>
                  <TabButton
                    type="button"
                    $active={activeTab === 'pricing'}
                    onClick={() => setActiveTab('pricing')}
                  >
                    <Percent size={14} /> Pricing & Web3
                  </TabButton>
                  <TabButton
                    type="button"
                    $active={activeTab === 'checkout'}
                    onClick={() => setActiveTab('checkout')}
                  >
                    <FileText size={14} /> Customer Info
                  </TabButton>
                  <TabButton
                    type="button"
                    $active={activeTab === 'limits'}
                    onClick={() => setActiveTab('limits')}
                  >
                    <Calendar size={14} /> Limits & Inventory
                  </TabButton>
                </TabList>

                <BuilderGrid>
                  <div>
                    {activeTab === 'general' && (
                      <InputGrid>
                        <InputGroup>
                          <Label>Business / Store Name</Label>
                          <Input
                            value={businessName}
                            onChange={(e) => setBusinessName(e.target.value)}
                            placeholder="e.g. Coffee & Co"
                            required
                          />
                        </InputGroup>

                        <InputGroup>
                          <Label>Product or Service Title</Label>
                          <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. VIP Yearly Membership"
                            required
                          />
                        </InputGroup>

                        <InputGroup>
                          <Label>Product Image URL (Optional)</Label>
                          <Input
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="https://images.unsplash.com/photo-1512496015851-a90fb38ba796"
                          />
                        </InputGroup>

                        <InputGroup>
                          <Label>Description</Label>
                          <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Provide details about what the customer is purchasing..."
                          />
                        </InputGroup>

                        <InputGroup>
                          <Label>Key Bullet Points (1 per line)</Label>
                          <Textarea
                            value={featuresText}
                            onChange={(e) => setFeaturesText(e.target.value)}
                            placeholder={"✓ Instant Digital Access\n✓ 24/7 VIP Support\n✓ Annual Updates Included"}
                          />
                        </InputGroup>

                        <InputGroup>
                          <Label>Category</Label>
                          <Select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                          >
                            <option value="Subscription">Subscription</option>
                            <option value="Digital Service">Digital Service</option>
                            <option value="Software / SaaS">Software / SaaS</option>
                            <option value="Consulting">Consulting</option>
                            <option value="Physical Product">Physical Product</option>
                            <option value="Donation / Tip">Donation / Tip</option>
                          </Select>
                        </InputGroup>
                      </InputGrid>
                    )}

                    {activeTab === 'pricing' && (
                      <InputGrid>
                        <InputGroup>
                          <Label>Pricing Model</Label>
                          <Select
                            value={pricingType}
                            onChange={(e) => setPricingType(e.target.value as 'fixed' | 'custom')}
                          >
                            <option value="fixed">Fixed Price (Defined Amount)</option>
                            <option value="custom">Pay What You Want / Tip / Donation</option>
                          </Select>
                        </InputGroup>

                        {pricingType === 'fixed' && (
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
                        )}

                        <InputGroup>
                          <Label>Settlement Currency</Label>
                          <Select
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                          >
                            <optgroup label="Available Tokens">
                              {tokens.map((token) => (
                                <option key={token.symbol} value={token.symbol}>
                                  {token.symbol} ({token.name})
                                </option>
                              ))}
                            </optgroup>
                          </Select>
                        </InputGroup>

                        <InputGroup>
                          <Label>Treasury Vault Account</Label>
                          <Select
                            value={destinationAccount}
                            onChange={(e) => setDestinationAccount(e.target.value)}
                          >
                            <option value="7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU">
                              Main Treasury Vault (7xKXtg...sgAsU)
                            </option>
                            <option value="HSVNd78A1yP84k2PqN9s72">
                              Operations Vault (HSVNd7...PqN)
                            </option>
                          </Select>
                        </InputGroup>

                        <InputGroup>
                          <Label>⚡ $LXR Web3 Payment Discount (%)</Label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={lxrDiscount}
                            onChange={(e) => setLxrDiscount(e.target.value)}
                            placeholder="e.g. 5 for 5% discount when paying in $LXR"
                          />
                        </InputGroup>

                        <CheckboxLabel>
                          <input
                            type="checkbox"
                            checked={allowQuantity}
                            onChange={(e) => setAllowQuantity(e.target.checked)}
                          />
                          <span>Allow customer to adjust item quantity (1, 2, 5...)</span>
                        </CheckboxLabel>
                      </InputGrid>
                    )}

                    {activeTab === 'checkout' && (
                      <InputGrid>
                        <Label>Collect Customer Information</Label>
                        <CheckboxLabel>
                          <input
                            type="checkbox"
                            checked={collectShipping}
                            onChange={(e) => setCollectShipping(e.target.checked)}
                          />
                          <span><Truck size={14} style={{ display: 'inline', marginRight: 6 }} /> Collect Shipping & Billing Address</span>
                        </CheckboxLabel>

                        <CheckboxLabel>
                          <input
                            type="checkbox"
                            checked={collectPhone}
                            onChange={(e) => setCollectPhone(e.target.checked)}
                          />
                          <span><Phone size={14} style={{ display: 'inline', marginRight: 6 }} /> Collect Customer Phone Number</span>
                        </CheckboxLabel>

                        <CheckboxLabel>
                          <input
                            type="checkbox"
                            checked={collectTaxId}
                            onChange={(e) => setCollectTaxId(e.target.checked)}
                          />
                          <span><FileText size={14} style={{ display: 'inline', marginRight: 6 }} /> Collect Tax ID / RUT / RIF / DNI</span>
                        </CheckboxLabel>

                        <CheckboxLabel>
                          <input
                            type="checkbox"
                            checked={collectCustomNote}
                            onChange={(e) => setCollectCustomNote(e.target.checked)}
                          />
                          <span>Collect Special Instructions / Note from Customer</span>
                        </CheckboxLabel>

                        <InputGroup style={{ marginTop: 12 }}>
                          <Label>Post-Payment Redirect URL (Success Page)</Label>
                          <Input
                            value={redirectUrl}
                            onChange={(e) => setRedirectUrl(e.target.value)}
                            placeholder="https://yourstore.com/thank-you"
                          />
                        </InputGroup>
                      </InputGrid>
                    )}

                    {activeTab === 'limits' && (
                      <InputGrid>
                        <InputGroup>
                          <Label>Stock / Max Payment Redemptions (Optional)</Label>
                          <Input
                            type="number"
                            min="1"
                            value={maxUses}
                            onChange={(e) => setMaxUses(e.target.value)}
                            placeholder="e.g. 50 (link disables after 50 uses)"
                          />
                        </InputGroup>

                        <InputGroup>
                          <Label>Expiration Date (Optional)</Label>
                          <Input
                            type="datetime-local"
                            value={expiresAt}
                            onChange={(e) => setExpiresAt(e.target.value)}
                          />
                        </InputGroup>

                        <InputGroup>
                          <Label>SKU / Reference Code (Optional)</Label>
                          <Input
                            value={sku}
                            onChange={(e) => setSku(e.target.value)}
                            placeholder="e.g. LXR-VIP-2026"
                          />
                        </InputGroup>
                      </InputGrid>
                    )}
                  </div>

                  {/* Live Card Preview */}
                  <LivePreviewCard>
                    <LivePreviewBadge>
                      <Eye size={12} /> Live Link Preview
                    </LivePreviewBadge>

                    <PreviewImageWrapper>
                      {imageUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={imageUrl}
                          alt="Product Preview"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
                          <ImageLucide size={32} style={{ margin: '0 auto 6px', opacity: 0.5 }} />
                          <div>No Image Added</div>
                        </div>
                      )}
                    </PreviewImageWrapper>

                    <div>
                      <div style={{ fontSize: 11, color: '#60A5FA', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: 2 }}>
                        {businessName || 'Your Business Name'}
                      </div>
                      <PreviewTitle>{name || 'Product / Service Title'}</PreviewTitle>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4, lineHeight: 1.4 }}>
                        {description || 'Product description will appear here...'}
                      </div>
                    </div>

                    {featuresText.trim().length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>
                        {featuresText.split('\n').filter(Boolean).map((feat, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <CheckCircle2 size={13} color="#34D399" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <PreviewPrice>
                      {pricingType === 'custom' ? (
                        'Custom Amount'
                      ) : (
                        <>
                          {amount || '0.00'} <span>{currency}</span>
                        </>
                      )}
                    </PreviewPrice>

                    {parseFloat(lxrDiscount) > 0 && (
                      <div style={{ background: 'rgba(96, 165, 250, 0.12)', border: '1px solid rgba(96, 165, 250, 0.3)', borderRadius: 10, padding: '6px 10px', fontSize: 11, color: '#60A5FA', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Zap size={13} /> Save {lxrDiscount}% paying with $LXR Token
                      </div>
                    )}

                    <Button type="button" $variant="primary" style={{ width: '100%', marginTop: 8 }} disabled>
                      Pay Now with Solana
                    </Button>
                  </LivePreviewCard>
                </BuilderGrid>

                <ModalFormActions>
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
                        <Plus size={16} /> Create Payment Link
                      </>
                    )}
                  </Button>
                </ModalFormActions>
              </form>
            </ModalBox>
          </Overlay>
        )}

        {/* Edit Link Modal */}
        {editingLink && (
          <Overlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !updating && setEditingLink(null)}
          >
            <ModalBox
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', bounce: 0.4, duration: 0.6 }}
            >
              <ModalCloseButton type="button" onClick={() => !updating && setEditingLink(null)} aria-label="Close">
                <X size={16} />
              </ModalCloseButton>

              <form onSubmit={handleUpdate}>
                <FormHeader>
                  <Pencil size={20} /> Edit Link
                </FormHeader>
                <InputGrid>
                  <InputGroup>
                    <Label>Product or Service Name</Label>
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="e.g. Premium Subscription"
                      required
                    />
                  </InputGroup>
                  <InputGroup>
                    <Label>Business Name</Label>
                    <Input
                      value={editBusinessName}
                      onChange={(e) => setEditBusinessName(e.target.value)}
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
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      placeholder="0.00"
                      required
                    />
                  </InputGroup>
                  <InputGroup>
                    <Label>Currency</Label>
                    <Select
                      value={editCurrency}
                      onChange={(e) => setEditCurrency(e.target.value)}
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
                <ModalFormActions>
                  <Button type="button" $variant="secondary" onClick={() => setEditingLink(null)} disabled={updating}>
                    Cancel
                  </Button>
                  <Button type="submit" $variant="primary" disabled={updating || !isEditFormValid}>
                    {updating ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Saving...
                      </>
                    ) : (
                      <>
                        <Pencil size={16} /> Save Changes
                      </>
                    )}
                  </Button>
                </ModalFormActions>
              </form>
            </ModalBox>
          </Overlay>
        )}

        {/* Delete Confirmation Modal */}
        {deletingLinkId && (
          <Overlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !deleting && setDeletingLinkId(null)}
          >
            <ModalBox
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', bounce: 0.4, duration: 0.6 }}
            >
              <ModalCloseButton type="button" onClick={() => !deleting && setDeletingLinkId(null)} aria-label="Close">
                <X size={16} />
              </ModalCloseButton>

              <DangerFormHeader>
                <Trash2 size={20} /> Delete Payment Link
              </DangerFormHeader>
              <DeleteModalText>
                Are you sure you want to delete this payment link? This action cannot be undone and customers will no longer be able to use it.
              </DeleteModalText>
              <ModalFormActions>
                <Button type="button" $variant="secondary" onClick={() => setDeletingLinkId(null)} disabled={deleting}>
                  Cancel
                </Button>
                <DangerButton type="button" onClick={handleDelete} disabled={deleting}>
                  {deleting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} /> Delete Link
                    </>
                  )}
                </DangerButton>
              </ModalFormActions>
            </ModalBox>
          </Overlay>
        )}
      </AnimatePresence>

      <ContentLayout>
        <ContentHeaderAction>
          <Button $variant="primary" onClick={() => setIsFormOpen(true)}>
            <Plus size={15} /> Create Link
          </Button>
        </ContentHeaderAction>

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
                    <Link href={`/payment-portal/catalog/${link.id}`} style={{ textDecoration: 'none' }}>
                      <LinkName style={{ cursor: 'pointer' }}>{link.name}</LinkName>
                    </Link>
                    <LinkDetails>
                      <strong>{link.amount} {link.currency}</strong>
                      <UrlSection>
                        <UrlDotSeparator>•</UrlDotSeparator>
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
                    onClick={() => router.push(`/payment-portal/links/preview/${link.id}`)}
                    title="Preview link"
                    aria-label="Preview link"
                  >
                    <ExternalLink size={15} />
                  </IconAction>
                  <IconAction
                    type="button"
                    onClick={() => openEditModal(link)}
                    title="Edit link"
                    aria-label="Edit link"
                  >
                    <Pencil size={15} />
                  </IconAction>
                  <IconDeleteAction
                    type="button"
                    onClick={() => setDeletingLinkId(link.id)}
                    title="Delete link"
                    aria-label="Delete link"
                  >
                    <Trash2 size={15} />
                  </IconDeleteAction>
                </ActionsGroup>
              </LinkItem>
            ))}
          </LinksList>
        )}
      </ContentLayout>
    </PageContainer>
  );
}
