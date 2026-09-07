'use client';

import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart2,
  Download,
  MoreHorizontal,
  X,
  CheckCircle2,
  Copy,
  Pencil,
  Trash2,
  Link as LinkIcon,
  Plus,
  SlidersHorizontal,
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Interfaces ──────────────────────────────────────────────────────────────
export interface CatalogProductItem {
  id: string;
  name: string;
  priceFormatted: string;
  priceValue: number;
  category: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'archived';
  imageGradient?: string;
  sku?: string;
}

// ─── Initial Data ────────────────────────────────────────────────────────────
const INITIAL_PRODUCTS: CatalogProductItem[] = [
  {
    id: 'prod_1',
    name: 'Plan All Inclusive',
    priceFormatted: 'USD 13,000.00',
    priceValue: 13000,
    category: 'Consulting Services',
    createdAt: '26 jul',
    updatedAt: '26 jul',
    status: 'active',
    sku: 'LXR-ALL-INC',
    imageGradient: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
  },
  {
    id: 'prod_2',
    name: 'Plan Elite',
    priceFormatted: 'USD 3,250.00',
    priceValue: 3250,
    category: 'Consulting Services',
    createdAt: '26 jul',
    updatedAt: '26 jul',
    status: 'active',
    sku: 'LXR-ELITE',
    imageGradient: 'linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)',
  },
  {
    id: 'prod_3',
    name: 'Plan Pro',
    priceFormatted: 'USD 550.00',
    priceValue: 550,
    category: 'Consulting Services',
    createdAt: '26 jul',
    updatedAt: '26 jul',
    status: 'active',
    sku: 'LXR-PRO',
    imageGradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
  },
  {
    id: 'prod_4',
    name: 'Plan Esencial',
    priceFormatted: 'USD 380.00',
    priceValue: 380,
    category: 'Consulting Services',
    createdAt: '26 jul',
    updatedAt: '26 jul',
    status: 'active',
    sku: 'LXR-ESENCIAL',
    imageGradient: 'linear-gradient(135deg, #60A5FA 0%, #2563EB 100%)',
  },
  {
    id: 'prod_5',
    name: 'Libro Digital',
    priceFormatted: 'USD 29.99',
    priceValue: 29.99,
    category: 'General - Electronically Supplied Services',
    createdAt: '5 jun',
    updatedAt: '5 jun',
    status: 'active',
    sku: 'LXR-BOOK-DIG',
    imageGradient: 'linear-gradient(135deg, #475569 0%, #1E293B 100%)',
  },
];

// ─── Styled Components (Dark Theme Matching Payment Links) ────────────────────

const PageContainer = styled.div`
  min-height: 100vh;
  background: #0a0a0a;
  color: #ededed;
  font-family: 'Montserrat', sans-serif;
  display: flex;
  flex-direction: column;
`;

const MainContent = styled.div`
  padding: 40px;
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

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
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

    &:hover {
      background: #2563EB;
      color: #FFFFFF;
    }
  `
      : `
    background: transparent;
    color: #60A5FA;
    border: 1px solid rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(12px);

    &:hover {
      background: rgba(96, 165, 250, 0.1);
      border-color: #60A5FA;
      color: #FFFFFF;
    }
  `}
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

/* Nav Subtabs */
const TabsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const TabItem = styled.button<{ $active?: boolean }>`
  background: transparent;
  border: none;
  padding: 10px 0;
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  font-weight: ${({ $active }) => ($active ? '600' : '400')};
  color: ${({ $active }) => ($active ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)')};
  border-bottom: 2px solid ${({ $active }) => ($active ? '#60A5FA' : 'transparent')};
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;

  &:hover {
    color: #ffffff;
  }
`;

/* Status Summary Cards (Glassmorphism Dark Theme) */
const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  max-width: 900px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const SummaryCard = styled.div<{ $selected?: boolean }>`
  background: rgba(255, 255, 255, 0.03);
  border: ${({ $selected }) => ($selected ? '2px solid #60A5FA' : '1px solid rgba(255, 255, 255, 0.12)')};
  backdrop-filter: blur(40px);
  border-radius: 20px;
  padding: 16px 20px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ $selected }) => ($selected ? '#60A5FA' : 'rgba(255, 255, 255, 0.3)')};
    background: rgba(255, 255, 255, 0.05);
  }
`;

const SummaryLabel = styled.div`
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
  margin-bottom: 4px;
`;

const SummaryCount = styled.div`
  font-family: 'Outfit', sans-serif;
  font-size: 24px;
  font-weight: 600;
  color: #ffffff;
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
  color: #60a5fa;
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

/* Data Table (Glassmorphism Dark) */
const TableWrapper = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(40px);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 32px 64px -16px rgba(0, 0, 0, 0.6);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
`;

const Th = styled.th`
  background: rgba(255, 255, 255, 0.04);
  padding: 14px 20px;
  font-family: 'Outfit', sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  letter-spacing: 0.05em;
  text-transform: uppercase;
`;

const Td = styled.td`
  padding: 16px 20px;
  font-size: 14px;
  color: #ededed;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  vertical-align: middle;
`;

const Tr = styled.tr`
  transition: background 0.15s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  &:last-child ${Td} {
    border-bottom: none;
  }
`;

const ProductFlexCell = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const ProductIconThumb = styled.div<{ $gradient?: string }>`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: ${({ $gradient }) => $gradient || 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.2);
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
`;

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ProductCatalogDarkPage() {
  const [products, setProducts] = useState<CatalogProductItem[]>(INITIAL_PRODUCTS);
  const [activeTab, setActiveTab] = useState('All products');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'active' | 'archived'>('active');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<CatalogProductItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'Consulting Services',
    sku: '',
  });

  // Calculate status counts
  const counts = useMemo(() => {
    const total = 45;
    const active = products.filter((p) => p.status === 'active').length;
    const archived = 40;
    return { total, active, archived };
  }, [products]);

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
        sku: product.sku || '',
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        price: '',
        category: 'Consulting Services',
        sku: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Please enter a product name');
      return;
    }

    const priceNum = parseFloat(formData.price) || 0;
    const formattedPrice = `USD ${priceNum.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

    if (editingProduct) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id
            ? {
                ...p,
                name: formData.name,
                priceFormatted: formattedPrice,
                priceValue: priceNum,
                category: formData.category,
                sku: formData.sku,
              }
            : p
        )
      );
      toast.success('Product updated');
    } else {
      const newProd: CatalogProductItem = {
        id: `prod_${Date.now()}`,
        name: formData.name,
        priceFormatted: formattedPrice,
        priceValue: priceNum,
        category: formData.category,
        createdAt: 'Jul 26',
        updatedAt: 'Jul 26',
        status: 'active',
        sku: formData.sku || `SKU-${Date.now()}`,
        imageGradient: 'linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)',
      };
      setProducts((prev) => [newProd, ...prev]);
      toast.success('Product created successfully');
    }

    setIsModalOpen(false);
  };

  const handleDeleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    toast.success('Product deleted');
    setActiveMenuId(null);
  };

  const handleCopyLink = (product: CatalogProductItem) => {
    navigator.clipboard.writeText(`https://pay.luxor.financial/p/${product.id}`);
    toast.success(`Link copied for ${product.name}`);
    setActiveMenuId(null);
  };

  return (
    <PageContainer>
      <MainContent>
        {/* Title and Main Actions */}
        <HeaderRow>
          <TitleText>Product Catalog</TitleText>
          <HeaderActions>
            <Button $variant="secondary" onClick={() => toast.info('Live catalog analytics')}>
              <BarChart2 size={15} /> Analyze
            </Button>
            <Button $variant="primary" onClick={() => handleOpenModal()}>
              <Plus size={15} /> Create product <KeyBadge>n</KeyBadge>
            </Button>
          </HeaderActions>
        </HeaderRow>

        {/* Sub-Navigation Tabs */}
        <TabsRow>
          {[
            'All products',
            'Features',
            'Coupons',
            'Shipping rates',
            'Tax rates',
            'Pricing tables',
          ].map((tab) => (
            <TabItem
              key={tab}
              $active={activeTab === tab}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </TabItem>
          ))}
        </TabsRow>

        {/* Status Summary Boxes (Dark Glassmorphism) */}
        <SummaryGrid>
          <SummaryCard
            $selected={selectedStatusFilter === 'all'}
            onClick={() => setSelectedStatusFilter('all')}
          >
            <SummaryLabel>All</SummaryLabel>
            <SummaryCount>{counts.total}</SummaryCount>
          </SummaryCard>

          <SummaryCard
            $selected={selectedStatusFilter === 'active'}
            onClick={() => setSelectedStatusFilter('active')}
          >
            <SummaryLabel>Active</SummaryLabel>
            <SummaryCount>{counts.active}</SummaryCount>
          </SummaryCard>

          <SummaryCard
            $selected={selectedStatusFilter === 'archived'}
            onClick={() => setSelectedStatusFilter('archived')}
          >
            <SummaryLabel>Archived</SummaryLabel>
            <SummaryCount>{counts.archived}</SummaryCount>
          </SummaryCard>
        </SummaryGrid>

        {/* Filter Pills & Export Toolbar */}
        <Toolbar>
          <FilterPillsGroup>
            <FilterPill>
              <SlidersHorizontal size={13} /> Created
            </FilterPill>
            <FilterPill>
              <CheckCircle2 size={13} /> Status <strong style={{ color: '#60A5FA', marginLeft: '4px' }}>Active</strong>
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
          </ExportLinksGroup>
        </Toolbar>

        {/* Table View (Dark Glassmorphism) */}
        <TableWrapper>
          <Table>
            <thead>
              <Tr>
                <Th style={{ width: '32%' }}>Name</Th>
                <Th style={{ width: '20%' }}>Pricing</Th>
                <Th style={{ width: '28%' }}>Product category</Th>
                <Th style={{ width: '10%' }}>Date created</Th>
                <Th style={{ width: '10%' }}>Updated</Th>
                <Th style={{ width: '40px' }}></Th>
              </Tr>
            </thead>
            <tbody>
              {filteredProducts.map((prod) => (
                <Tr key={prod.id}>
                  <Td>
                    <ProductFlexCell>
                      <ProductIconThumb $gradient={prod.imageGradient} />
                      <ProductNameText>{prod.name}</ProductNameText>
                    </ProductFlexCell>
                  </Td>

                  <Td style={{ color: '#60A5FA', fontFamily: 'monospace', fontWeight: 500 }}>{prod.priceFormatted}</Td>

                  <Td style={{ color: 'rgba(255,255,255,0.7)' }}>{prod.category}</Td>

                  <Td style={{ color: 'rgba(255,255,255,0.5)' }}>{prod.createdAt}</Td>

                  <Td style={{ color: 'rgba(255,255,255,0.5)' }}>{prod.updatedAt}</Td>

                  <Td style={{ position: 'relative' }}>
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
                  </Td>
                </Tr>
              ))}
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
            onClick={() => setIsModalOpen(false)}
          >
            <ModalBox
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              onClick={(e) => e.stopPropagation()}
            >
              <ModalHeader>
                <h2>{editingProduct ? 'Edit Product' : 'Create Product'}</h2>
                <ModalCloseButton type="button" onClick={() => setIsModalOpen(false)}>
                  <X size={18} />
                </ModalCloseButton>
              </ModalHeader>

              <Form onSubmit={handleSaveProduct}>
                <FormGroup>
                  <label>Product Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Elite Plan"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </FormGroup>

                <FormGroup>
                  <label>Pricing / Rate (USD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="3250.00"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </FormGroup>

                <FormGroup>
                  <label>Product Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="Consulting Services">Consulting Services</option>
                    <option value="General - Electronically Supplied Services">
                      General - Electronically Supplied Services
                    </option>
                    <option value="Subscriptions & SaaS">Subscriptions & SaaS</option>
                    <option value="Hardware & Devices">Hardware & Devices</option>
                  </select>
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
                  >
                    Cancel
                  </Button>
                  <Button type="submit" $variant="primary">
                    {editingProduct ? 'Save Changes' : 'Create Product'}
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
