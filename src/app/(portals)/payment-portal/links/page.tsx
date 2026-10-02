'use client';

import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import {
  createPaymentLink,
  listPaymentLinks,
  updatePaymentLink,
  deletePaymentLink,
} from '@/features/payments/api/payments-api';
import type { PaymentLink } from '@luxor/contracts';
import {
  Copy,
  Link as LinkIcon,
  Plus,
  ExternalLink,
  Loader2,
  Pencil,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTokenRegistry } from '@/context/TokenRegistryContext';
import { getLuxorEnv } from '@/lib/luxor-env';
import { AnimatePresence } from 'framer-motion';
import { MOCK_PAYMENT_LINKS } from '@/mocks/data';
import { useLinkBuilderForm } from '@/features/payments/hooks/useLinkBuilderForm';
import { CreateLinkModal } from '@/features/payments/components/CreateLinkModal';
import { EditLinkModal } from '@/features/payments/components/EditLinkModal';
import { DeleteLinkModal } from '@/features/payments/components/DeleteLinkModal';
import {
  PageContainer,
  ContentLayout,
  ContentHeaderAction,
  UrlDotSeparator,
  Button,
  LinksList,
  LinkItem,
  LinkInfo,
  IconWrapper,
  TextContent,
  LinkName,
  LinkDetails,
  ActionsGroup,
  IconAction,
  IconDeleteAction,
  UrlSection,
  EmptyState,
  LoadingState,
} from '@/features/payments/components/payment-links.styles';

// --- Component ---

export default function PortalPaymentLinksPage() {
  const router = useRouter();
  const [links, setLinks] = useState<PaymentLink[]>([]);
  const [loading, setLoading] = useState(true);
  
  const linkForm = useLinkBuilderForm();
  const {
    destinationAccount,
    name,
    setName,
    businessName,
    setBusinessName,
    description,
    setDescription,
    category,
    sku,
    setSku,
    amount,
    setAmount,
    currency,
    imageUrl,
    setImageUrl,
    pricingType,
    allowQuantity,
    featuresText,
    setFeaturesText,
    collectShipping,
    setCollectShipping,
    collectPhone,
    setCollectPhone,
    collectTaxId,
    setCollectTaxId,
    collectCustomNote,
    setCollectCustomNote,
    redirectUrl,
    setRedirectUrl,
    lxrDiscount,
    setLxrDiscount,
    maxUses,
    setMaxUses,
    expiresAt,
    setExpiresAt,
  } = linkForm;
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
        const data = await listPaymentLinks();
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
      const features = featuresText
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean);

      const link = await createPaymentLink({
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
      const updated = await updatePaymentLink(editingLink.id, {
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
      await deletePaymentLink(deletingLinkId);
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
          <CreateLinkModal
            form={linkForm}
            creating={creating}
            isFormValid={isFormValid}
            tokens={tokens}
            onClose={() => setIsFormOpen(false)}
            onSubmit={handleCreate}
          />
        )}

        {/* Edit Link Modal */}
        {editingLink && (
          <EditLinkModal
            editName={editName}
            setEditName={setEditName}
            editBusinessName={editBusinessName}
            setEditBusinessName={setEditBusinessName}
            editAmount={editAmount}
            setEditAmount={setEditAmount}
            editCurrency={editCurrency}
            setEditCurrency={setEditCurrency}
            tokens={tokens}
            updating={updating}
            isEditFormValid={isEditFormValid}
            onClose={() => setEditingLink(null)}
            onSubmit={handleUpdate}
          />
        )}

        {/* Delete Confirmation Modal */}
        {deletingLinkId && (
          <DeleteLinkModal
            deleting={deleting}
            onClose={() => setDeletingLinkId(null)}
            onConfirm={handleDelete}
          />
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
