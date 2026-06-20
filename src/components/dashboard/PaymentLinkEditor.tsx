'use client';

import Link from 'next/link';
import { memo, useMemo, useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Monitor, Plus, Search, Smartphone, X, Info } from 'lucide-react';
import type { Currency, MerchantProfile, ProductCatalogItem } from '@luxor/contracts';
import { formatCurrencyAmount } from '@/lib/format-currency';
import { CheckoutPreviewFrame } from '@/features/checkout/components/CheckoutPreviewFrame';
import { PaymentLinkCheckoutView } from '@/features/checkout/components/PaymentLinkCheckoutView';
import type { PaymentLink } from '@luxor/contracts';
import { cn } from '@/lib/cn';
import { createProduct } from '@/lib/merchant-data';
import { auth } from '@/lib/firebase';
import { toast } from 'sonner';

export interface PaymentLinkEditorValues {
  name: string;
  amount: string;
  currency: Currency;
  active: boolean;
  taxCode: string;
  taxIncluded: boolean;
  quantity: string;
  allowQuantityAdjustment: boolean;
  collectTaxes: boolean;
  collectEmail: boolean;
  collectName: boolean;
  collectCompany: boolean;
  collectAddress: boolean;
  collectPhone: boolean;
  limitPayments: boolean;
  successMessage: string;
  redirectUrl: string;
}

export const defaultPaymentLinkEditorValues: PaymentLinkEditorValues = {
  name: '',
  amount: '',
  currency: 'USDC',
  active: true,
  taxCode: '',
  taxIncluded: false,
  quantity: '1',
  allowQuantityAdjustment: false,
  collectTaxes: false,
  collectEmail: true,
  collectName: false,
  collectCompany: false,
  collectAddress: false,
  collectPhone: false,
  limitPayments: false,
  successMessage: 'Gracias por tu pago.',
  redirectUrl: '',
};

type EditorTab = 'payment' | 'after';

function editorValuesToPreviewLink(
  values: PaymentLinkEditorValues,
  merchantWallet: string
): PaymentLink {
  const amount = parseFloat(values.amount);
  const quantity = parseInt(values.quantity, 10);
  return {
    id: 'preview',
    slug: 'preview',
    merchantId: 'preview',
    name: values.name.trim() || 'Nombre del producto',
    amount: Number.isNaN(amount) ? 0 : amount,
    currency: values.currency,
    merchantWallet: merchantWallet || '',
    active: values.active,
    createdAt: new Date().toISOString(),
    collectEmail: values.collectEmail,
    collectName: values.collectName,
    collectCompany: values.collectCompany,
    collectAddress: values.collectAddress,
    collectPhone: values.collectPhone,
    collectTaxes: values.collectTaxes,
    taxCode: values.taxCode || undefined,
    taxIncluded: values.taxIncluded,
    quantity: Number.isNaN(quantity) || quantity < 1 ? 1 : quantity,
    allowQuantityAdjustment: values.allowQuantityAdjustment,
    limitPayments: values.limitPayments,
    successMessage: values.successMessage,
    redirectUrl: values.redirectUrl,
  };
}

const CheckoutPreview = memo(function CheckoutPreview({
  merchantName,
  merchantProfile,
  values,
  previewMode,
  tab,
}: {
  merchantName: string;
  merchantProfile?: MerchantProfile | null;
  values: PaymentLinkEditorValues;
  previewMode: 'mobile' | 'desktop';
  tab: EditorTab;
}) {
  const merchantWallet = merchantProfile?.merchantWallet?.trim() ?? '';
  const link = useMemo(
    () => editorValuesToPreviewLink(values, merchantWallet),
    [values, merchantWallet]
  );

  if (tab === 'after') {
    return (
      <CheckoutPreviewFrame mode={previewMode}>
        <PaymentLinkCheckoutView
          link={{ ...link, successMessage: values.successMessage }}
          merchantName={merchantName}
          merchantProfile={merchantProfile}
          compact={previewMode === 'mobile'}
          preview
          showSuccess
        />
      </CheckoutPreviewFrame>
    );
  }

  return (
    <CheckoutPreviewFrame mode={previewMode}>
      <PaymentLinkCheckoutView
        link={link}
        merchantName={merchantName}
        merchantProfile={merchantProfile}
        compact={previewMode === 'mobile'}
        preview
      />
    </CheckoutPreviewFrame>
  );
});

export function PaymentLinkEditor({
  mode,
  layout = 'page',
  initialValues,
  products = [],
  initialProductId = null,
  merchantName = 'Luxor Pay',
  merchantProfile,
  saving = false,
  submitDisabled = false,
  onSave,
  onCancel,
}: {
  mode: 'create' | 'edit';
  layout?: 'page' | 'drawer';
  initialValues: PaymentLinkEditorValues;
  products?: ProductCatalogItem[];
  initialProductId?: string | null;
  merchantName?: string;
  merchantProfile?: MerchantProfile | null;
  saving?: boolean;
  submitDisabled?: boolean;
  onSave: (values: PaymentLinkEditorValues) => void | Promise<void>;
  onCancel: () => void;
}) {
  const [values, setValues] = useState<PaymentLinkEditorValues>(initialValues);
  const [tab, setTab] = useState<EditorTab>('payment');
  const [previewMode, setPreviewMode] = useState<'mobile' | 'desktop'>('desktop');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [productQuery, setProductQuery] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(initialProductId);
  const [managedPayments, setManagedPayments] = useState(false);
  const [localProducts, setLocalProducts] = useState<ProductCatalogItem[]>(products);

  // Product Creation Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductCurrency, setNewProductCurrency] = useState<Currency>('USDC');
  const [newProductDescription, setNewProductDescription] = useState('');
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);

  useEffect(() => {
    setLocalProducts((prev) => {
      // Merge: keep locally-added products + incoming from server, deduplicate by id
      const prevIds = new Set(prev.map((p) => p.id));
      const incoming = products.filter((p) => !prevIds.has(p.id));
      // If nothing new, just replace with server state (avoids stale data)
      if (incoming.length === 0) return products;
      return [...prev, ...incoming];
    });
  }, [products]);


  const catalogProducts = useMemo(
    () => localProducts.filter((product) => product.active),
    [localProducts]
  );

  const filteredProducts = useMemo(() => {
    const query = productQuery.trim().toLowerCase();
    if (!query) return catalogProducts;
    return catalogProducts.filter((product) => product.name.toLowerCase().includes(query));
  }, [catalogProducts, productQuery]);

  const handleOpenProductModal = (initialName: string = '') => {
    setNewProductName(initialName);
    setNewProductPrice('');
    setNewProductCurrency(values.currency);
    setNewProductDescription('');
    setIsProductModalOpen(true);
  };

  const handleCreateProductModal = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newProductName.trim();
    if (!name) {
      toast.error('El nombre del producto es obligatorio');
      return;
    }
    const priceNum = parseFloat(newProductPrice);
    if (Number.isNaN(priceNum) || priceNum < 0) {
      toast.error('El precio debe ser un número válido mayor o igual a 0');
      return;
    }

    const uid = auth.currentUser?.uid;
    if (!uid) {
      toast.error('Inicia sesión para crear un producto');
      return;
    }

    setIsCreatingProduct(true);
    try {
      const newProduct = await createProduct(uid, {
        name,
        price: priceNum,
        currency: newProductCurrency,
        description: newProductDescription.trim() || undefined,
        active: true,
      });
      setLocalProducts((prev) => [newProduct, ...prev]);
      setSelectedProductId(newProduct.id);
      setValues((prev) => ({
        ...prev,
        name: newProduct.name,
        amount: String(newProduct.price),
        currency: newProduct.currency,
      }));
      setIsProductModalOpen(false);
      setProductQuery('');
      toast.success(`Producto "${name}" creado exitosamente`);
    } catch (e) {
      console.error(e);
      toast.error('No se pudo crear el producto');
    } finally {
      setIsCreatingProduct(false);
    }
  };

  const selectProduct = (product: ProductCatalogItem) => {
    setSelectedProductId(product.id);
    setValues((prev) => ({
      ...prev,
      name: product.name,
      amount: String(product.price),
      currency: product.currency,
    }));
    setProductQuery('');
  };

  const set = <K extends keyof PaymentLinkEditorValues>(key: K, val: PaymentLinkEditorValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void onSave(values);
  };

  const title = mode === 'create' ? 'Crear un enlace de pago' : 'Editar enlace de pago';
  const submitLabel = mode === 'create' ? 'Crear enlace' : 'Guardar cambios';
  const isDrawer = layout === 'drawer';

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className={cn('flex flex-col h-full min-h-0', isDrawer && 'h-full')}
      >
      <div
        className={cn(
          'flex items-center justify-between gap-4 px-4 md:px-5 py-4 border-b border-[var(--dash-border)] shrink-0',
          isDrawer ? 'bg-[var(--dash-panel)]' : 'sticky top-0 z-10 dash-header'
        )}
      >
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onCancel}
            className="p-2 rounded-lg hover:bg-[var(--dash-surface-elevated)] text-[var(--dash-muted)] shrink-0"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
          <h1 className="text-lg font-semibold text-[var(--dash-text)] truncate">{title}</h1>
        </div>
        {isDrawer ? (
          <button
            type="button"
            className="text-xs text-[var(--dash-accent)] hover:underline lg:hidden shrink-0"
            onClick={onCancel}
          >
            Cerrar vista previa
          </button>
        ) : (
          <button
            type="submit"
            disabled={saving || submitDisabled}
            className="dash-btn-primary px-5 py-2 text-sm shrink-0 hidden sm:inline-flex disabled:opacity-50"
          >
            {saving ? 'Guardando…' : submitLabel}
          </button>
        )}
      </div>

      <div className="flex flex-1 min-h-0 flex-col lg:flex-row overflow-hidden">
        <div
          className={cn(
            'lg:w-[42%] xl:w-[40%] border-b lg:border-b-0 lg:border-r border-[var(--dash-border)] overflow-y-auto min-h-0',
            isDrawer && 'bg-[var(--dash-panel)]'
          )}
        >
          <div className={cn('p-4 sm:p-6 space-y-6', isDrawer ? 'max-w-xl' : 'w-full max-w-2xl')}>
            <div>
               <label
                 htmlFor="link-type"
                 className="block text-xs font-semibold uppercase tracking-wide text-[var(--dash-muted)] mb-2"
               >
                 Selecciona el tipo
               </label>
               <select
                 id="link-type"
                 value="one-time"
                 disabled
                 className="dash-input w-full px-4 py-2.5 text-sm opacity-80 cursor-not-allowed"
               >
                 <option value="one-time">Productos o suscripciones</option>
               </select>
            </div>

             <div className="flex gap-1 border-b border-[var(--dash-border)]">
               {(['payment', 'after'] as const).map((t) => (
                 <button
                   key={t}
                   type="button"
                   onClick={() => setTab(t)}
                   className={cn(
                     'px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
                     tab === t
                       ? 'border-white text-[var(--dash-text)]'
                       : 'border-transparent text-[var(--dash-muted)] hover:text-[var(--dash-text)]'
                   )}
                 >
                   {t === 'payment' ? 'Página de pagos' : 'Después del pago'}
                 </button>
               ))}
             </div>

             {tab === 'payment' && (
               <div className="space-y-6">
                 <section className="dash-card p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-semibold text-[var(--dash-text)]">Producto</h2>
                      <button
                        type="button"
                        onClick={() => handleOpenProductModal('')}
                        className="text-xs text-[var(--dash-accent)] hover:underline inline-flex items-center gap-1 font-medium"
                      >
                        <Plus size={14} />
                        Crear nuevo producto
                      </button>
                    </div>

                    {mode === 'create' && (
                      <div className="space-y-3">
                        <div className="relative">
                          <Search
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--dash-muted)] pointer-events-none"
                          />
                          <input
                            value={productQuery}
                            onChange={(e) => setProductQuery(e.target.value)}
                            placeholder="Busca o agrega un producto..."
                            className="dash-input w-full pl-9 pr-4 py-2.5 text-sm"
                          />
                        </div>

                        {productQuery.trim() && (
                          <button
                            type="button"
                            onClick={() => handleOpenProductModal(productQuery.trim())}
                            className="w-full flex items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--dash-accent)] bg-[var(--dash-accent-soft)]/20 px-4 py-2.5 text-sm text-[var(--dash-accent)] hover:bg-[var(--dash-accent-soft)]/35 transition-colors"
                          >
                            <Plus size={16} />
                            Crear &quot;{productQuery.trim()}&quot; en ventana flotante
                          </button>
                        )}

                       {catalogProducts.length === 0 ? (
                         <div className="rounded-lg border border-dashed border-[var(--dash-border)] px-4 py-4 text-center">
                           <p className="text-xs text-[var(--dash-muted)]">
                             Puedes ingresar los detalles del producto directamente a continuación, o crear uno en el catálogo escribiendo su nombre arriba.
                           </p>
                         </div>
                       ) : filteredProducts.length > 0 ? (
                         <div className="flex flex-wrap gap-2">
                           {filteredProducts.map((product) => {
                             const selected = selectedProductId === product.id;
                             return (
                               <button
                                 key={product.id}
                                 type="button"
                                 onClick={() => selectProduct(product)}
                                 className={cn(
                                   'text-left rounded-lg border px-3 py-2.5 text-sm transition-colors min-w-[140px] max-w-full',
                                   selected
                                     ? 'border-[var(--dash-accent)] bg-[var(--dash-accent-soft)] ring-1 ring-[var(--dash-accent)]'
                                     : 'border-[var(--dash-border)] bg-[var(--dash-surface-elevated)] hover:border-[var(--dash-accent)]/50'
                                 )}
                               >
                                 <span className="block font-medium text-[var(--dash-text)] truncate">
                                   {product.name}
                                 </span>
                                 <span className="block text-xs text-[var(--dash-muted)] tabular-nums mt-0.5">
                                   {formatCurrencyAmount(product.price, product.currency)}
                                 </span>
                               </button>
                             );
                           })}
                         </div>
                       ) : (
                         <p className="text-sm text-[var(--dash-muted)]">
                           Ningún producto coincide con tu búsqueda.
                         </p>
                       )}

                       <button
                         type="button"
                         className="text-sm text-[var(--dash-accent)] hover:underline inline-flex items-center gap-1 opacity-60 cursor-not-allowed"
                         disabled
                         onClick={() => undefined}
                       >
                         <Plus size={14} />
                         Agrega productos recomendados
                       </button>
                     </div>
                   )}

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-[var(--dash-muted)] mb-1.5">
                        Nombre del producto
                      </label>
                      <input
                        value={values.name}
                        onChange={(e) => {
                          setSelectedProductId(null);
                          set('name', e.target.value);
                        }}
                        placeholder="Ej. Plan Elite"
                        className="dash-input w-full px-4 py-2.5 text-sm"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-[var(--dash-muted)] mb-1.5">Precio</label>
                        <input
                          type="number"
                          step="0.0001"
                          min="0"
                          value={values.amount}
                          onChange={(e) => {
                            setSelectedProductId(null);
                            set('amount', e.target.value);
                          }}
                          placeholder="0.00"
                          className="dash-input w-full px-4 py-2.5 text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[var(--dash-muted)] mb-1.5">Moneda</label>
                        <select
                          value={values.currency}
                          onChange={(e) => {
                            setSelectedProductId(null);
                            set('currency', e.target.value as Currency);
                          }}
                          className="dash-input w-full px-4 py-2.5 text-sm"
                        >
                          <option value="USDC">USDC</option>
                          <option value="SOL">SOL</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-[var(--dash-muted)] mb-1.5">
                        Código fiscal
                      </label>
                      <input
                        value={values.taxCode}
                        onChange={(e) => set('taxCode', e.target.value)}
                        placeholder="General - Servicios digitales"
                        className="dash-input w-full px-4 py-2.5 text-sm"
                      />
                    </div>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={values.taxIncluded}
                        onChange={(e) => set('taxIncluded', e.target.checked)}
                        className="rounded"
                      />
                      Impuestos incluidos en el precio
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                      <div>
                        <label className="block text-xs text-[var(--dash-muted)] mb-1.5">Cantidad</label>
                        <input
                          type="number"
                          min="1"
                          value={values.quantity}
                          onChange={(e) => set('quantity', e.target.value)}
                          className="dash-input w-full px-4 py-2.5 text-sm"
                        />
                      </div>
                      <label className="flex items-center gap-2 text-sm pb-2.5">
                        <input
                          type="checkbox"
                          checked={values.allowQuantityAdjustment}
                          onChange={(e) => set('allowQuantityAdjustment', e.target.checked)}
                          className="rounded"
                        />
                        Permitir ajustar cantidad
                      </label>
                    </div>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={values.active}
                        onChange={(e) => set('active', e.target.checked)}
                        className="rounded"
                      />
                      Enlace activo
                    </label>
                  </div>
                </section>

                <section className="space-y-3">
                  <h2 className="text-sm font-semibold text-[var(--dash-text)]">Opciones</h2>
                  <label className="flex items-start gap-3 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={managedPayments}
                      onChange={(e) => setManagedPayments(e.target.checked)}
                      className="mt-0.5 rounded"
                    />
                    <span className="flex items-center gap-2">
                      <span className="font-medium text-[var(--dash-text)]">Habilitar pagos administrados</span>
                      <span className="bg-purple-600/15 text-purple-400 px-1.5 py-0.5 rounded text-[10px] font-semibold">Nuevo</span>
                      <Info size={14} className="text-[var(--dash-muted)] cursor-help" />
                    </span>
                  </label>
                  <label className="flex items-start gap-3 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={values.collectTaxes}
                      onChange={(e) => set('collectTaxes', e.target.checked)}
                      className="mt-0.5 rounded"
                    />
                    <span>
                      <span className="font-medium text-[var(--dash-text)]">Cobrar impuestos automáticamente</span>
                    </span>
                  </label>
                  <label className="flex items-start gap-3 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={values.collectName}
                      onChange={(e) => set('collectName', e.target.checked)}
                      className="mt-0.5 rounded"
                    />
                    <span>
                      <span className="font-medium text-[var(--dash-text)]">Recopilar nombres de clientes</span>
                    </span>
                  </label>
                  <label className="flex items-start gap-3 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={values.collectCompany}
                      onChange={(e) => set('collectCompany', e.target.checked)}
                      className="mt-0.5 rounded"
                    />
                    <span>
                      <span className="font-medium text-[var(--dash-text)]">Recopilar nombres de empresas</span>
                    </span>
                  </label>
                  <label className="flex items-start gap-3 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={values.collectAddress}
                      onChange={(e) => set('collectAddress', e.target.checked)}
                      className="mt-0.5 rounded"
                    />
                    <span className="flex items-center gap-2">
                      <span className="font-medium text-[var(--dash-text)]">Recopilar direcciones de clientes</span>
                      <Info size={14} className="text-[var(--dash-muted)] cursor-help" />
                    </span>
                  </label>
                  <label className="flex items-start gap-3 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={values.collectPhone}
                      onChange={(e) => set('collectPhone', e.target.checked)}
                      className="mt-0.5 rounded"
                    />
                    <span className="flex items-center gap-2">
                      <span className="font-medium text-[var(--dash-text)]">Solicitarles a los clientes un número de teléfono</span>
                      <Info size={14} className="text-[var(--dash-muted)] cursor-help" />
                    </span>
                  </label>
                  <label className="flex items-start gap-3 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={values.limitPayments}
                      onChange={(e) => set('limitPayments', e.target.checked)}
                      className="mt-0.5 rounded"
                    />
                    <span className="flex items-center gap-2">
                      <span className="font-medium text-[var(--dash-text)]">Limitar el número de pagos</span>
                      <Info size={14} className="text-[var(--dash-muted)] cursor-help" />
                    </span>
                  </label>
                </section>

                <section>
                  <button
                    type="button"
                    onClick={() => setAdvancedOpen((o) => !o)}
                    className="flex items-center gap-2 text-sm font-medium text-[var(--dash-text)] w-full"
                  >
                    Opciones avanzadas
                    {advancedOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {advancedOpen && (
                    <div className="mt-4 dash-card p-4 space-y-3 text-sm text-[var(--dash-muted)]">
                      <p>
                        Metadatos personalizados y webhooks — próximamente. Consulta{' '}
                        <Link href="/dashboard/developers" className="text-[var(--dash-accent)] hover:underline">
                          Desarrolladores
                        </Link>
                        .
                      </p>
                    </div>
                  )}
                </section>
              </div>
            )}

            {tab === 'after' && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="success-message" className="block text-sm font-medium mb-2">
                    Mensaje de confirmación
                  </label>
                  <textarea
                    id="success-message"
                    value={values.successMessage}
                    onChange={(e) => set('successMessage', e.target.value)}
                    rows={3}
                    placeholder="Gracias por tu pago."
                    className="dash-input w-full px-4 py-2.5 text-sm resize-none"
                  />
                  <p className="text-xs text-[var(--dash-muted)] mt-1">
                    Se muestra después de un pago exitoso
                  </p>
                </div>
                <div>
                  <label htmlFor="redirect-url" className="block text-sm font-medium mb-2">
                    URL de redirección
                  </label>
                  <input
                    id="redirect-url"
                    type="text"
                    inputMode="url"
                    autoComplete="url"
                    value={values.redirectUrl}
                    onChange={(e) => set('redirectUrl', e.target.value)}
                    placeholder="https://tusitio.com/gracias"
                    className="dash-input w-full px-4 py-2.5 text-sm"
                  />
                  <p className="text-xs text-[var(--dash-muted)] mt-1">
                    URL opcional para enviar al cliente tras completar el pago
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div
          className={cn(
            'flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 min-h-0',
            isDrawer ? 'bg-[var(--dash-panel-elevated)]' : 'bg-[#050505]'
          )}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-[var(--dash-muted)]">
                Vista previa
              </span>
              <p className="text-xs text-[var(--dash-muted)] mt-1 max-w-md">
                Así verán el checkout los clientes al abrir el enlace.
              </p>
            </div>
            <div className="flex gap-1 dash-card p-1">
              <button
                type="button"
                onClick={() => setPreviewMode('mobile')}
                className={cn(
                  'p-2 rounded-md transition-colors',
                  previewMode === 'mobile'
                    ? 'bg-[var(--dash-surface-elevated)] text-[var(--dash-text)]'
                    : 'text-[var(--dash-muted)] hover:text-[var(--dash-text)]'
                )}
                aria-label="Vista móvil"
              >
                <Smartphone size={16} />
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode('desktop')}
                className={cn(
                  'p-2 rounded-md transition-colors',
                  previewMode === 'desktop'
                    ? 'bg-[var(--dash-surface-elevated)] text-[var(--dash-text)]'
                    : 'text-[var(--dash-muted)] hover:text-[var(--dash-text)]'
                )}
                aria-label="Vista escritorio"
              >
                <Monitor size={16} />
              </button>
            </div>
          </div>
          <CheckoutPreview
            merchantName={merchantName}
            merchantProfile={merchantProfile}
            values={values}
            previewMode={previewMode}
            tab={tab}
          />
        </div>
      </div>

      {!isDrawer && (
        <div className="sm:hidden shrink-0 flex items-center justify-end gap-2 px-4 py-3 border-t border-[var(--dash-border)] bg-[var(--dash-bg)]">
          <button type="button" onClick={onCancel} className="dash-btn-secondary px-4 py-2.5 text-sm">
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving || submitDisabled}
            className="dash-btn-primary px-5 py-2.5 text-sm disabled:opacity-50"
          >
            {saving ? 'Guardando…' : submitLabel}
          </button>
        </div>
      )}

      {isDrawer && (
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-[var(--dash-border)] shrink-0 bg-[var(--dash-panel)]">
          <button type="button" onClick={onCancel} className="dash-btn-secondary px-5 py-2.5 text-sm">
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving || submitDisabled}
            className="dash-btn-primary px-5 py-2.5 text-sm disabled:opacity-50"
          >
            {saving ? 'Creando…' : submitLabel}
          </button>
        </div>
      )}
    </form>

    <AnimatePresence>
      {isProductModalOpen && (
        <ModalOverlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsProductModalOpen(false)}
        >
          <ModalBox
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            transition={{ type: 'spring', bounce: 0.35, duration: 0.5 }}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <ModalHeader>
              <ModalTitle>Crear nuevo producto</ModalTitle>
              <ModalCloseButton
                type="button"
                onClick={() => setIsProductModalOpen(false)}
                aria-label="Cerrar ventana"
              >
                <X size={20} />
              </ModalCloseButton>
            </ModalHeader>

            <form onSubmit={handleCreateProductModal}>
              <ModalFormField>
                <ModalFormLabel htmlFor="modal-product-name">
                  Nombre del producto
                </ModalFormLabel>
                <ModalFormInput
                  id="modal-product-name"
                  type="text"
                  value={newProductName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewProductName(e.target.value)}
                  placeholder="Ej. Plan de Suscripción Premium"
                  required
                  autoFocus
                />
              </ModalFormField>

              <div className="grid grid-cols-2 gap-4">
                <ModalFormField>
                  <ModalFormLabel htmlFor="modal-product-price">
                    Precio
                  </ModalFormLabel>
                  <ModalFormInput
                    id="modal-product-price"
                    type="number"
                    step="0.000001"
                    min="0"
                    value={newProductPrice}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewProductPrice(e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </ModalFormField>

                <ModalFormField>
                  <ModalFormLabel htmlFor="modal-product-currency">
                    Moneda
                  </ModalFormLabel>
                  <div className="relative">
                    <ModalFormSelect
                      id="modal-product-currency"
                      value={newProductCurrency}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setNewProductCurrency(e.target.value as Currency)
                      }
                    >
                      <option value="USDC">USDC</option>
                      <option value="SOL">SOL</option>
                    </ModalFormSelect>
                    <ChevronDown
                      size={16}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--dash-muted)] pointer-events-none"
                    />
                  </div>
                </ModalFormField>
              </div>

              <ModalFormField>
                <ModalFormLabel htmlFor="modal-product-description">
                  Descripción (opcional)
                </ModalFormLabel>
                <ModalFormTextarea
                  id="modal-product-description"
                  rows={3}
                  value={newProductDescription}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewProductDescription(e.target.value)}
                  placeholder="Describe los beneficios o características de tu producto..."
                />
              </ModalFormField>

              <ModalFooter>
                <ModalSecondaryButton
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  disabled={isCreatingProduct}
                >
                  Cancelar
                </ModalSecondaryButton>
                <ModalPrimaryButton
                  type="submit"
                  disabled={isCreatingProduct}
                >
                  {isCreatingProduct ? 'Creando…' : 'Crear producto'}
                </ModalPrimaryButton>
              </ModalFooter>
            </form>
          </ModalBox>
        </ModalOverlay>
      )}
    </AnimatePresence>
  </>
);
}

export function paymentLinkToEditorValues(link: PaymentLink): PaymentLinkEditorValues {
  return {
    name: link.name,
    amount: String(link.amount),
    currency: link.currency,
    active: link.active,
    taxCode: link.taxCode ?? '',
    taxIncluded: link.taxIncluded ?? false,
    quantity: String(link.quantity ?? 1),
    allowQuantityAdjustment: link.allowQuantityAdjustment ?? false,
    collectTaxes: link.collectTaxes ?? false,
    collectEmail: link.collectEmail ?? true,
    collectName: link.collectName ?? false,
    collectCompany: link.collectCompany ?? false,
    collectAddress: link.collectAddress ?? false,
    collectPhone: link.collectPhone ?? false,
    limitPayments: link.limitPayments ?? false,
    successMessage: link.successMessage ?? 'Gracias por tu pago.',
    redirectUrl: link.redirectUrl ?? '',
  };
}

export function editorValuesToPaymentLinkInput(values: PaymentLinkEditorValues) {
  const parsed = parseFloat(values.amount);
  const quantity = parseInt(values.quantity, 10);
  return {
    name: values.name.trim(),
    amount: parsed,
    currency: values.currency,
    active: values.active,
    collectEmail: values.collectEmail,
    collectName: values.collectName,
    collectCompany: values.collectCompany,
    collectAddress: values.collectAddress,
    collectPhone: values.collectPhone,
    collectTaxes: values.collectTaxes,
    taxCode: values.taxCode.trim() || undefined,
    taxIncluded: values.taxIncluded,
    quantity: Number.isNaN(quantity) || quantity < 1 ? 1 : quantity,
    allowQuantityAdjustment: values.allowQuantityAdjustment,
    limitPayments: values.limitPayments,
    successMessage: values.successMessage.trim() || undefined,
    redirectUrl: values.redirectUrl.trim() || undefined,
  };
}

// Styled components for the floating product modal matching Luxor brand rules
const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(16px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
`;

const ModalBox = styled(motion.div)`
  background: rgba(15, 15, 18, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(40px);
  border-radius: 40px;
  box-shadow: 0 32px 64px -16px rgba(0, 0, 0, 0.8);
  width: 100%;
  max-width: 460px;
  padding: 36px;
  position: relative;
  font-family: 'Montserrat', sans-serif;
  color: #EDEDED;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const ModalTitle = styled.h3`
  font-family: 'Outfit', sans-serif;
  font-size: 24px;
  font-weight: 500;
  color: #FFFFFF;
  margin: 0;
  letter-spacing: -0.5px;
`;

const ModalCloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.5);
  padding: 4px;
  border-radius: 8px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #FFFFFF;
    background: rgba(255, 255, 255, 0.05);
  }

  &:focus-visible {
    outline: 2px solid #60A5FA;
    outline-offset: 2px;
  }
`;

const ModalFormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
`;

const ModalFormLabel = styled.label`
  font-family: 'Outfit', sans-serif;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.05em;
  color: rgba(255, 255, 255, 0.6);
`;

const ModalFormInput = styled.input`
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
  padding: 12px 20px;
  color: #FFFFFF;
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  transition: all 0.2s;

  &:focus-visible {
    outline: 2px solid #60A5FA;
    outline-offset: 2px;
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }
`;

const ModalFormTextarea = styled.textarea`
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 12px 20px;
  color: #FFFFFF;
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  transition: all 0.2s;
  resize: none;

  &:focus-visible {
    outline: 2px solid #60A5FA;
    outline-offset: 2px;
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }
`;

const ModalFormSelect = styled.select`
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
  padding: 12px 20px;
  color: #FFFFFF;
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  transition: all 0.2s;
  appearance: none;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid #60A5FA;
    outline-offset: 2px;
  }
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 28px;
`;

const ModalPrimaryButton = styled.button`
  font-family: 'Outfit', sans-serif;
  font-weight: 500;
  font-size: 14px;
  background: #FFFFFF;
  color: #000000;
  border: none;
  border-radius: 9999px;
  padding: 12px 28px;
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

  &:focus-visible {
    outline: 2px solid #60A5FA;
    outline-offset: 2px;
  }
`;

const ModalSecondaryButton = styled.button`
  font-family: 'Outfit', sans-serif;
  font-weight: 500;
  font-size: 14px;
  background: transparent;
  color: #60A5FA;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 9999px;
  padding: 12px 28px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid #60A5FA;
    outline-offset: 2px;
  }
`;
