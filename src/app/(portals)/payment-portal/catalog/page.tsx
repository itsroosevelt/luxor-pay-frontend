'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import {
  listPaymentLinks,
  createPaymentLink,
  updatePaymentLink,
  deletePaymentLink,
} from '@/features/payments/api/payments-api';
import { IS_MOCK_MODE } from '@/lib/mock/mock-config';
import { MOCK_PAYMENT_LINKS } from '@/mocks/data';
import Link from 'next/link';
import {
  MoreHorizontal,
  X,
  Pencil,
  Trash2,
  Link as LinkIcon,
  Plus,
  Package,
  Loader2,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  PageContainer,
  MainContent,
  HeaderRow,
  HeaderTitleGroup,
  TitleText,
  SubtitleText,
  Button,
  Toolbar,
  TableWrapper,
  Table,
  Th,
  Td,
  PriceTd,
  CategoryTd,
  DateTd,
  CenteredTd,
  ActionTd,
  Tr,
  ProductFlexCell,
  ProductIconThumb,
  ProductNameText,
  ActionMenuButton,
  ActionDropdown,
  DropdownItem,
  TableFooterText,
  EmptyOrLoadingState,
  ModalOverlay,
  ModalBox,
  ModalHeader,
  ModalCloseButton,
  Form,
  FormGroup,
} from '@/features/payments/components/catalog.styles';

// ─── Interfaces ──────────────────────────────────────────────────────────────
export interface CatalogProductItem {
  id: string;
  name: string;
  priceFormatted: string;
  priceValue: number;
  category: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'archived';
  sku?: string;
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ProductCatalogDarkPage() {
  const [products, setProducts] = useState<CatalogProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'active' | 'archived'>('active');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<CatalogProductItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'Consulting Services',
    currency: 'USDC',
    sku: '',
  });

  const mapLinksToProducts = (linksList: any[]): CatalogProductItem[] => {
    return linksList.map((link: any) => {
      const val = Number(link.amount || 0);
      const curr = link.currency || 'USDC';
      const formatted = `${curr} ${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

      let createdStr = 'Recently';
      if (link.createdAt) {
        const d = link.createdAt._seconds ? new Date(link.createdAt._seconds * 1000) : new Date(link.createdAt);
        if (!isNaN(d.getTime())) {
          createdStr = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
        }
      }

      return {
        id: link.id,
        name: link.name || 'Untitled Payment Link',
        priceFormatted: formatted,
        priceValue: val,
        category: link.businessName || 'Payment Link',
        currency: curr,
        createdAt: createdStr,
        updatedAt: createdStr,
        status: 'active',
        sku: link.id ? link.id.slice(0, 10).toUpperCase() : 'LXR-LINK',
      };
    });
  };

  // Fetch real payment links from backend API
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setProducts(mapLinksToProducts(IS_MOCK_MODE ? MOCK_PAYMENT_LINKS : []));
        setLoading(false);
        return;
      }
      try {
        const data = await listPaymentLinks();
        if (data && Array.isArray(data) && data.length > 0) {
          setProducts(mapLinksToProducts(data));
        } else {
          setProducts(mapLinksToProducts(IS_MOCK_MODE ? MOCK_PAYMENT_LINKS : []));
        }
      } catch (err) {
        // Demo fixtures only in Mock Mode; in production report the failure.
        setProducts(mapLinksToProducts(IS_MOCK_MODE ? MOCK_PAYMENT_LINKS : []));
        if (!IS_MOCK_MODE) toast.error('No se pudo cargar el catálogo. Reintenta en unos segundos.');
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Filtered list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedStatusFilter === 'all') return true;
      if (selectedStatusFilter === 'active') return p.status === 'active';
      return p.status === 'archived';
    });
  }, [products, selectedStatusFilter]);

  const handleOpenModal = (product?: CatalogProductItem) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        price: product.priceValue.toString(),
        category: product.category,
        currency: product.currency || 'USDC',
        sku: product.sku || '',
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        price: '',
        category: 'Consulting Services',
        currency: 'USDC',
        sku: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Please enter a product name');
      return;
    }

    const priceNum = parseFloat(formData.price) || 0;
    if (priceNum <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      toast.error('You must be logged in to manage products');
      return;
    }

    setSubmitting(true);
    try {
      if (editingProduct) {
        await updatePaymentLink(editingProduct.id, {
          name: formData.name.trim(),
          businessName: formData.category.trim(),
          amount: priceNum,
          currency: formData.currency,
        });

        const formattedPrice = `${formData.currency} ${priceNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        setProducts((prev) =>
          prev.map((p) =>
            p.id === editingProduct.id
              ? {
                  ...p,
                  name: formData.name.trim(),
                  priceFormatted: formattedPrice,
                  priceValue: priceNum,
                  category: formData.category.trim(),
                  currency: formData.currency,
                  sku: formData.sku || p.sku,
                }
              : p
          )
        );
        toast.success('Product updated successfully');
      } else {
        const createdLink = await createPaymentLink({
          name: formData.name.trim(),
          businessName: formData.category.trim() || 'Payment Link',
          amount: priceNum,
          currency: formData.currency,
        });

        const formattedPrice = `${formData.currency} ${priceNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        const newProd: CatalogProductItem = {
          id: createdLink.id,
          name: createdLink.name || formData.name.trim(),
          priceFormatted: formattedPrice,
          priceValue: priceNum,
          category: createdLink.businessName || formData.category.trim(),
          currency: formData.currency,
          createdAt: 'Just now',
          updatedAt: 'Just now',
          status: 'active',
          sku: formData.sku || (createdLink.id ? createdLink.id.slice(0, 10).toUpperCase() : 'LXR-LINK'),
        };
        setProducts((prev) => [newProd, ...prev]);
        toast.success('Product created successfully');
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving product:', err);
      toast.error(editingProduct ? 'Failed to update product' : 'Failed to create product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      await deletePaymentLink(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success('Product deleted successfully');
    } catch (err) {
      console.error('Error deleting product:', err);
      toast.error('Failed to delete product');
    } finally {
      setActiveMenuId(null);
    }
  };

  const handleCopyLink = (product: CatalogProductItem) => {
    const url = `${window.location.origin}/pay/link/${product.id}`;
    navigator.clipboard.writeText(url);
    toast.success(`Payment link copied for ${product.name}`);
    setActiveMenuId(null);
  };

  return (
    <PageContainer suppressHydrationWarning>
      <HeaderRow>
        <HeaderTitleGroup>
          <TitleText>Product Catalog</TitleText>
          <SubtitleText>
            Manage products, pricing tiers, and checkout inventory for point-of-sale and payment links.
          </SubtitleText>
        </HeaderTitleGroup>
      </HeaderRow>

      <MainContent suppressHydrationWarning>
        <Toolbar style={{ justifyContent: 'flex-end' }}>
          <Button $variant="primary" onClick={() => handleOpenModal()}>
            <Plus size={15} /> Create product
          </Button>
        </Toolbar>

        {/* Table View (Borderless Canvas Layout) */}
        <TableWrapper>
          <Table>
            <thead>
              <Tr>
                <Th $width="32%">Name</Th>
                <Th $width="20%">Pricing</Th>
                <Th $width="28%">Product category</Th>
                <Th $width="10%">Date created</Th>
                <Th $width="10%">Updated</Th>
                <Th $width="40px"></Th>
              </Tr>
            </thead>
            <tbody>
              {loading ? (
                <Tr>
                  <CenteredTd colSpan={6}>
                    <EmptyOrLoadingState>
                      <Loader2 size={18} className="animate-spin" /> Loading products from payment links...
                    </EmptyOrLoadingState>
                  </CenteredTd>
                </Tr>
              ) : filteredProducts.length === 0 ? (
                <Tr>
                  <CenteredTd colSpan={6}>
                    <EmptyOrLoadingState>
                      No products found. Click "Create product" to add one.
                    </EmptyOrLoadingState>
                  </CenteredTd>
                </Tr>
              ) : (
                filteredProducts.map((prod) => (
                  <Tr key={prod.id}>
                    <Td>
                      <Link href={`/payment-portal/catalog/${prod.id}`} style={{ textDecoration: 'none' }}>
                        <ProductFlexCell style={{ cursor: 'pointer' }}>
                          <ProductIconThumb>
                            <Package size={16} />
                          </ProductIconThumb>
                          <ProductNameText style={{ transition: 'color 0.2s' }}>{prod.name}</ProductNameText>
                        </ProductFlexCell>
                      </Link>
                    </Td>

                    <PriceTd>{prod.priceFormatted}</PriceTd>

                    <CategoryTd>{prod.category}</CategoryTd>

                    <DateTd>{prod.createdAt}</DateTd>

                    <DateTd>{prod.updatedAt}</DateTd>

                    <ActionTd>
                      <ActionMenuButton
                        onClick={() => setActiveMenuId(activeMenuId === prod.id ? null : prod.id)}
                      >
                        <MoreHorizontal size={16} />
                      </ActionMenuButton>

                      {activeMenuId === prod.id && (
                        <ActionDropdown>
                          <Link href={`/payment-portal/catalog/${prod.id}`} style={{ textDecoration: 'none' }}>
                            <DropdownItem>
                              <Eye size={14} /> View Details
                            </DropdownItem>
                          </Link>
                          <DropdownItem onClick={() => handleCopyLink(prod)}>
                            <LinkIcon size={14} /> Copy Link
                          </DropdownItem>
                          <DropdownItem onClick={() => handleOpenModal(prod)}>
                            <Pencil size={14} /> Edit
                          </DropdownItem>
                          <DropdownItem
                            className="danger"
                            onClick={() => handleDeleteProduct(prod.id)}
                          >
                            <Trash2 size={14} /> Delete
                          </DropdownItem>
                        </ActionDropdown>
                      )}
                    </ActionTd>
                  </Tr>
                ))
              )}
            </tbody>
          </Table>
        </TableWrapper>

        {/* Counter Footer */}
        <TableFooterText>{filteredProducts.length} items</TableFooterText>
      </MainContent>

      {/* Modal: Create / Edit Product */}
      <AnimatePresence>
        {isModalOpen && (
          <ModalOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !submitting && setIsModalOpen(false)}
          >
            <ModalBox
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              onClick={(e) => e.stopPropagation()}
            >
              <ModalHeader>
                <h2>{editingProduct ? 'Edit Product' : 'Create Product'}</h2>
                <ModalCloseButton type="button" onClick={() => !submitting && setIsModalOpen(false)}>
                  <X size={18} />
                </ModalCloseButton>
              </ModalHeader>

              <Form onSubmit={handleSaveProduct}>
                <FormGroup>
                  <label>Product Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Premium Plan"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </FormGroup>

                <FormGroup>
                  <label>Price *</label>
                  <input
                    type="number"
                    step="any"
                    min="0.000001"
                    required
                    placeholder="100.00"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </FormGroup>

                <FormGroup>
                  <label>Currency</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  >
                    <option value="USDC">USDC</option>
                    <option value="SOL">SOL</option>
                    <option value="LXR">LXR</option>
                    <option value="BONK">BONK</option>
                    <option value="USD">USD</option>
                  </select>
                </FormGroup>

                <FormGroup>
                  <label>Business / Category Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Consulting Services"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </FormGroup>

                <FormGroup>
                  <label>SKU Code (Optional)</label>
                  <input
                    type="text"
                    placeholder="LXR-PRO"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  />
                </FormGroup>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <Button
                    type="button"
                    $variant="secondary"
                    onClick={() => setIsModalOpen(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" $variant="primary" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 size={15} className="animate-spin" /> Saving...
                      </>
                    ) : editingProduct ? (
                      'Save Changes'
                    ) : (
                      'Create Product'
                    )}
                  </Button>
                </div>
              </Form>
            </ModalBox>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </PageContainer>
  );
}
