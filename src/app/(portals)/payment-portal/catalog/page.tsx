'use client';

import React, { useState, useMemo, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import {
  listPaymentLinks,
  createPaymentLink,
  updatePaymentLink,
  deletePaymentLink,
} from '@/lib/payments-api';
import {
  BarChart2,
  Download,
  MoreHorizontal,
  X,
  CheckCircle2,
  Pencil,
  Trash2,
  Link as LinkIcon,
  Plus,
  SlidersHorizontal,
  Package,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

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
  padding: 64px 40px 40px 40px;
  max-width: 1600px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 24px;

  @media (max-width: 768px) {
    padding: 20px 16px 40px 16px;
    gap: 16px;
  }
`;

/* Header Row */
const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
`;

const TitleText = styled.h1`
  font-family: 'Outfit', sans-serif;
  font-size: 32px;
  font-weight: 500;
  color: #ffffff;
  margin: 0;
  letter-spacing: -1px;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 500;
  padding: 9px 20px;
  border-radius: 9999px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
  border: none;

  ${({ $variant }) =>
    $variant === 'primary'
      ? `
    background: #FFFFFF;
    color: #000000;
    box-shadow: 0 4px 20px rgba(255, 255, 255, 0.15);

    &:hover:not(:disabled) {
      background: #2563EB;
      color: #FFFFFF;
    }
  `
      : `
    background: transparent;
    color: #60A5FA;
    border: 1px solid rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(12px);

    &:hover:not(:disabled) {
      background: rgba(96, 165, 250, 0.1);
      border-color: #60A5FA;
      color: #FFFFFF;
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const KeyBadge = styled.span`
  background: rgba(255, 255, 255, 0.15);
  color: inherit;
  font-size: 11px;
  font-family: monospace;
  padding: 1px 5px;
  border-radius: 4px;
  font-weight: 600;
`;

/* Filters & Export Toolbar */
const Toolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding-top: 4px;
`;

const FilterPillsGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`;

const FilterPill = styled.button`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 9999px;
  padding: 6px 14px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #ffffff;
  }
`;

const ClearFilterButton = styled.button`
  background: transparent;
  border: none;
  font-size: 13px;
  color: #ffffff;
  font-weight: 500;
  cursor: pointer;
  padding: 6px;

  &:hover {
    text-decoration: underline;
  }
`;

const ExportLinksGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
`;

const ExportLink = styled.button`
  background: transparent;
  border: none;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: #ffffff;
  }
`;

/* Data Table (Borderless Canvas Layout) */
const TableWrapper = styled.div`
  background: transparent;
  border: none;
  box-shadow: none;
  border-radius: 0;
  width: 100%;
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
`;

const Th = styled.th<{ $width?: string }>`
  background: transparent;
  padding: 12px 16px;
  font-family: 'Outfit', sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: var(--lx-text-dim);
  border-bottom: 1px solid var(--lx-border);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  ${({ $width }) => $width && `width: ${$width};`}
`;

const Td = styled.td`
  padding: 16px;
  font-size: 14px;
  color: var(--lx-text);
  border-bottom: 1px solid var(--lx-border);
  vertical-align: middle;
`;

const PriceTd = styled(Td)`
  color: var(--lx-text);
  font-family: monospace;
  font-weight: 500;
`;

const CategoryTd = styled(Td)`
  color: var(--lx-text-muted);
`;

const DateTd = styled(Td)`
  color: var(--lx-text-dim);
`;

const CenteredTd = styled(Td)`
  text-align: center;
  padding: 0;
`;

const ActionTd = styled(Td)`
  position: relative;
`;

const FilterPillStrong = styled.strong`
  color: var(--lx-text);
  margin-left: 4px;
`;

const Tr = styled.tr`
  transition: background 0.15s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.02);
  }

  &:last-child ${Td} {
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }
`;

const ProductFlexCell = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const ProductIconThumb = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.7);
  flex-shrink: 0;
`;

const ProductNameText = styled.span`
  font-family: 'Outfit', sans-serif;
  font-weight: 500;
  color: #ffffff;
`;

const ActionMenuButton = styled.button`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
  padding: 6px 10px;
  border-radius: 9999px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #ffffff;
  }
`;

const ActionDropdown = styled.div`
  position: absolute;
  right: 20px;
  margin-top: 4px;
  background: rgba(10, 10, 10, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 14px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(20px);
  z-index: 50;
  min-width: 160px;
  padding: 6px 0;
`;

const DropdownItem = styled.button`
  width: 100%;
  text-align: left;
  background: transparent;
  border: none;
  padding: 10px 16px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #ffffff;
  }

  &.danger {
    color: #f87171;
    &:hover {
      background: rgba(239, 68, 68, 0.15);
    }
  }
`;

const TableFooterText = styled.div`
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  padding: 4px 0;
`;

const EmptyOrLoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 64px 24px;
  color: rgba(255, 255, 255, 0.5);
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);

  svg.animate-spin {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    100% {
      transform: rotate(360deg);
    }
  }
`;

/* Dark Modal */
const ModalOverlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(12px);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const ModalBox = styled(motion.div)`
  background: #0a0a0a;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 28px;
  box-shadow: 0 32px 64px -16px rgba(0, 0, 0, 0.9);
  width: 100%;
  max-width: 480px;
  padding: 28px;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  h2 {
    font-family: 'Outfit', sans-serif;
    font-size: 20px;
    font-weight: 500;
    color: #ffffff;
    margin: 0;
  }
`;

const ModalCloseButton = styled.button`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
  border-radius: 9999px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #ffffff;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    font-family: 'Outfit', sans-serif;
    font-size: 12px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.6);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  input,
  select {
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 14px;
    padding: 12px 16px;
    font-size: 14px;
    color: #ffffff;
    outline: none;

    &:focus {
      border-color: #60a5fa;
      box-shadow: 0 0 0 1px rgba(96, 165, 250, 0.3);
    }
  }

  option {
    background: #0a0a0a;
    color: #ffffff;
  }
`;

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

  // Fetch real payment links from backend API
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const token = await user.getIdToken();
        const data = await listPaymentLinks(token);
        if (data && Array.isArray(data)) {
          const mapped: CatalogProductItem[] = data.map((link: any) => {
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
          setProducts(mapped);
        }
      } catch (err) {
        console.error('Error fetching payment links for product catalog:', err);
        toast.error('Could not load products from payment links');
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
      const token = await user.getIdToken();
      if (editingProduct) {
        await updatePaymentLink(token, editingProduct.id, {
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
        const createdLink = await createPaymentLink(token, {
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
      const token = await user.getIdToken();
      await deletePaymentLink(token, id);
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
    <PageContainer>
      <MainContent>
        {/* Title */}
        <HeaderRow>
          <TitleText>Product Catalog</TitleText>
        </HeaderRow>

        {/* Filter Pills & Toolbar with Action Buttons */}
        <Toolbar>
          <FilterPillsGroup>
            <FilterPill>
              <SlidersHorizontal size={13} /> Created
            </FilterPill>
            <FilterPill>
              <CheckCircle2 size={13} /> Status <FilterPillStrong>Active</FilterPillStrong>
            </FilterPill>
            <FilterPill>
              <SlidersHorizontal size={13} /> Product category
            </FilterPill>

            {selectedStatusFilter !== 'active' && (
              <ClearFilterButton onClick={() => setSelectedStatusFilter('active')}>
                Clear filters
              </ClearFilterButton>
            )}
          </FilterPillsGroup>

          <ExportLinksGroup>
            <ExportLink onClick={() => toast.success('Prices exported')}>
              <Download size={13} /> Export prices
            </ExportLink>
            <ExportLink onClick={() => toast.success('Products exported')}>
              <Download size={13} /> Export products
            </ExportLink>
            <ExportLink onClick={() => toast.info('Edit columns')}>
              ⚙️ Edit columns
            </ExportLink>

            <Button $variant="secondary" onClick={() => toast.info('Live catalog analytics')}>
              <BarChart2 size={15} /> Analyze
            </Button>
            <Button $variant="primary" onClick={() => handleOpenModal()}>
              <Plus size={15} /> Create product <KeyBadge>n</KeyBadge>
            </Button>
          </ExportLinksGroup>
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
                      <ProductFlexCell>
                        <ProductIconThumb>
                          <Package size={16} />
                        </ProductIconThumb>
                        <ProductNameText>{prod.name}</ProductNameText>
                      </ProductFlexCell>
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
