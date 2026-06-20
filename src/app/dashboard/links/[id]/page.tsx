'use client';

import { memo, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { MerchantProfile, PaymentLink } from '@luxor/contracts';
import { getPaymentLinkPublicUrl, formatCheckoutAmount } from '@/lib/payment-link-utils';
import { auth, onAuthStateChanged } from '@/lib/firebase';
import { getMerchantProfile, getPaymentLink, updatePaymentLink } from '@/lib/merchant-data';
import { isFrontendOnly } from '@/lib/frontend-only';
import { dashStatusBadges } from '@/lib/dashboard-styles';
import { CopyField, DetailSection, DetailRow, PaymentLinkCheckoutInfo, DemoModeBanner, demoCopyLinkToastMessage } from '@/components/dashboard';
import { CheckoutPreviewFrame } from '@/features/checkout/components/CheckoutPreviewFrame';
import { PaymentLinkCheckoutView } from '@/features/checkout/components/PaymentLinkCheckoutView';
import { cn } from '@/lib/cn';
import {
  ChevronRight,
  Code2,
  Copy,
  CreditCard,
  ExternalLink,
  Link as LinkIcon,
  Monitor,
  MoreHorizontal,
  Pencil,
  QrCode,
  ShoppingBag,
  Smartphone,
  Wallet,
} from 'lucide-react';
import { getFirestoreErrorMessage } from '@/lib/firestore-errors';
import { toast } from 'sonner';

type TabId = 'summary';

const TABS: { id: TabId; label: string }[] = [{ id: 'summary', label: 'Resumen' }];

const ENABLED_METHODS = [
  { id: 'wallet', label: 'Wallet', icon: Wallet },
  { id: 'qr', label: 'QR (Solana Pay)', icon: QrCode },
] as const;

const COMING_SOON_METHODS = [
  { id: 'card', label: 'Tarjeta', icon: CreditCard },
  { id: 'apple-pay', label: 'Apple Pay', icon: CreditCard },
  { id: 'google-pay', label: 'Google Pay', icon: CreditCard },
] as const;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatLinkPrice(link: PaymentLink): string {
  const amount = formatCheckoutAmount(link.amount, link.currency);
  return `${link.currency} ${Number(amount).toLocaleString('es-ES', {
    minimumFractionDigits: link.currency === 'SOL' ? 4 : 2,
    maximumFractionDigits: link.currency === 'SOL' ? 4 : 2,
  })}`;
}

function formatHeaderTitle(link: PaymentLink): string {
  return `${link.name} por ${formatLinkPrice(link)}`;
}

function truncateId(id: string, head = 8, tail = 4): string {
  if (id.length <= head + tail + 1) return id;
  return `${id.slice(0, head)}…${id.slice(-tail)}`;
}

function yesNo(value: boolean | undefined, defaultValue = false): string {
  return value ?? defaultValue ? 'Sí' : 'No';
}

function DashedEmpty({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-[var(--dash-border)] bg-[var(--dash-panel)] px-4 py-8 text-center text-sm text-[var(--dash-muted)]">
      {children}
    </div>
  );
}

function SidebarCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="dash-card overflow-hidden">
      <div className="px-5 py-4 border-b border-[var(--dash-border)]">
        <h2 className="font-semibold text-[var(--dash-text)]">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function DetailKvRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 py-3 border-b border-[var(--dash-border)] last:border-0">
      <span className="text-sm text-[var(--dash-muted)] shrink-0 sm:max-w-[45%]">{label}</span>
      <span className="text-sm text-[var(--dash-text)] sm:text-right">{value}</span>
    </div>
  );
}

const CheckoutPreview = memo(function CheckoutPreview({
  link,
  merchantName,
  merchantProfile,
  previewMode,
}: {
  link: PaymentLink;
  merchantName: string;
  merchantProfile?: MerchantProfile | null;
  previewMode: 'mobile' | 'desktop';
}) {
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

export default function PaymentLinkDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [link, setLink] = useState<PaymentLink | null>(null);
  const [merchantProfile, setMerchantProfile] = useState<MerchantProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabId>('summary');
  const [previewMode, setPreviewMode] = useState<'mobile' | 'desktop'>('mobile');
  const [togglingStatus, setTogglingStatus] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const canToggleStatus = true;

  const merchantName = merchantProfile?.businessName?.trim() || 'Luxor Pay';

  const payUrl = useMemo(() => {
    if (!link) return '';
    return getPaymentLinkPublicUrl(link);
  }, [link]);

  useEffect(() => {
    if (!id) return;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const [l, profile] = await Promise.all([
          getPaymentLink(user.uid, id),
          getMerchantProfile(user.uid),
        ]);
        setLink(l);
        if (profile) setMerchantProfile(profile);
      } catch (err) {
        toast.error(getFirestoreErrorMessage(err, 'No se pudo cargar el enlace de pago'));
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [id]);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [menuOpen]);


  const stubToast = (message: string) => () => toast.info(message);

  const copyPayUrl = () => {
    void navigator.clipboard.writeText(payUrl);
    toast.success(demoCopyLinkToastMessage());
  };

  const handleToggleActive = async () => {
    const user = auth.currentUser;
    if (!user || !link || !canToggleStatus) return;

    setTogglingStatus(true);
    try {
      const updated = await updatePaymentLink(user.uid, link.id, { active: !link.active });
      setLink(updated);
      toast.success(updated.active ? 'Enlace activado' : 'Enlace desactivado');
    } catch (err) {
      toast.error(getFirestoreErrorMessage(err, 'No se pudo actualizar el estado del enlace'));
    } finally {
      setTogglingStatus(false);
    }
  };

  if (loading) {
    return (
      <p className="text-sm text-[var(--dash-muted)] py-16 text-center">
        Cargando enlace de pago…
      </p>
    );
  }

  if (!link) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-[var(--dash-muted)]">Enlace de pago no encontrado</p>
        <Link href="/dashboard/links" className="dash-btn-secondary px-4 py-2 text-sm inline-block">
          Volver a enlaces
        </Link>
      </div>
    );
  }

  const statusBadge = link.active ? dashStatusBadges.success : dashStatusBadges.neutral;
  const statusLabel = link.active ? 'Activo' : 'Inactivo';
  const quantity = link.quantity ?? 1;

  return (
    <div className="min-h-full">
      <header className="relative z-30 dash-header border-b border-[var(--dash-border)]">
        <div className="px-4 sm:px-6 md:px-8 pt-5 sm:pt-6 pb-4">
          <nav className="flex items-center gap-1.5 text-sm text-[var(--dash-muted)] mb-4">
            <Link
              href="/dashboard/links"
              className="hover:text-[var(--dash-accent)] transition-colors"
            >
              Enlaces de pago
            </Link>
            <ChevronRight size={14} className="opacity-60" />
            <span className="text-[var(--dash-text)] truncate max-w-[240px]">{link.name}</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="min-w-0 space-y-3 flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-semibold text-[var(--dash-text)] tracking-tight break-words">
                  {formatHeaderTitle(link)}
                </h1>
                <span className={statusBadge}>{statusLabel}</span>
              </div>

              <div className="flex items-center gap-2 max-w-2xl">
                <div className="flex-1 min-w-0 flex items-center gap-2 dash-card px-3 py-2 bg-[var(--dash-surface-elevated)]">
                  <LinkIcon size={14} className="text-[var(--dash-muted)] shrink-0" />
                  <code className="text-xs text-[var(--dash-text)] truncate flex-1 font-mono">
                    {payUrl}
                  </code>
                  <button
                    type="button"
                    onClick={copyPayUrl}
                    className="shrink-0 p-1.5 rounded-md hover:bg-[var(--dash-surface)] text-[var(--dash-muted)] hover:text-[var(--dash-text)]"
                    aria-label="Copiar enlace"
                  >
                    <Copy size={14} />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto lg:shrink-0">
              <button
                type="button"
                onClick={stubToast('Parámetros de URL — próximamente')}
                className="dash-btn-secondary px-4 py-2.5 text-sm inline-flex items-center gap-2 min-h-[44px]"
              >
                <Code2 size={16} />
                Parámetros de URL
              </button>
              <button
                type="button"
                onClick={stubToast('Botón de compra — próximamente')}
                className="dash-btn-secondary px-4 py-2.5 text-sm inline-flex items-center gap-2 min-h-[44px]"
              >
                <ShoppingBag size={16} />
                Botón de compra
              </button>
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  className="dash-btn-secondary p-2.5 min-h-[44px] min-w-[44px]"
                  aria-label="Más acciones"
                  onClick={() => setMenuOpen((open) => !open)}
                >
                  <MoreHorizontal size={18} />
                </button>
                {menuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-full mt-1 z-20 min-w-[200px] dash-card py-1 shadow-lg"
                  >
                    <Link
                      href={`/dashboard/links/${link.id}/edit`}
                      role="menuitem"
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-[var(--dash-surface-elevated)] inline-flex items-center gap-2"
                      onClick={() => setMenuOpen(false)}
                    >
                      <Pencil size={14} />
                      Editar enlace
                    </Link>
                    <a
                      href={payUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      role="menuitem"
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-[var(--dash-surface-elevated)] inline-flex items-center gap-2"
                      onClick={() => setMenuOpen(false)}
                    >
                      <ExternalLink size={14} />
                      Abrir checkout
                    </a>
                    {canToggleStatus && (
                      <button
                        type="button"
                        role="menuitem"
                        disabled={togglingStatus}
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-[var(--dash-surface-elevated)] disabled:opacity-50"
                        onClick={() => {
                          setMenuOpen(false);
                          void handleToggleActive();
                        }}
                      >
                        {togglingStatus
                          ? 'Guardando…'
                          : link.active
                            ? 'Desactivar enlace'
                            : 'Activar enlace'}
                      </button>
                    )}
                    <button
                      type="button"
                      role="menuitem"
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-[var(--dash-surface-elevated)]"
                      onClick={() => {
                        setMenuOpen(false);
                        stubToast('Duplicar enlace — próximamente')();
                      }}
                    >
                      Duplicar enlace
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-1 mt-6 border-b border-[var(--dash-border)]">
            {TABS.map(({ id: tabId, label }) => (
              <button
                key={tabId}
                type="button"
                onClick={() => setTab(tabId)}
                className={cn(
                  'px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
                  tab === tabId
                    ? 'border-[var(--dash-accent)] text-[var(--dash-accent)]'
                    : 'border-transparent text-[var(--dash-muted)] hover:text-[var(--dash-text)]'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="p-4 sm:p-6 md:px-8 md:pb-8 max-w-[1400px] mx-auto">
        <div className="grid lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)] gap-6">
          <div className="space-y-6 min-w-0">
            {tab === 'summary' && (
              <>
                <DetailSection title="Productos">
                  <div className="overflow-x-auto -mx-5 px-5">
                    <table className="w-full text-sm min-w-[480px]">
                      <thead>
                        <tr className="text-xs uppercase text-[var(--dash-muted)] border-b border-[var(--dash-border)]">
                          <th className="text-left py-2 font-semibold">Producto</th>
                          <th className="text-left py-2 font-semibold">Precio</th>
                          <th className="text-left py-2 font-semibold">Cantidad</th>
                          <th className="text-left py-2 font-semibold">Impuestos incluidos</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-[var(--dash-border)] last:border-0">
                          <td className="py-3 font-medium">{link.name}</td>
                          <td className="py-3 tabular-nums">{formatLinkPrice(link)}</td>
                          <td className="py-3 tabular-nums">{quantity}</td>
                          <td className="py-3">{yesNo(link.taxIncluded)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </DetailSection>

                <DetailSection
                  title="Métodos de pago"
                  action={
                    <Link
                      href="/dashboard/settings/managed-payments"
                      className="text-sm text-[var(--dash-accent)] hover:underline"
                    >
                      Administrar
                    </Link>
                  }
                >
                  <PaymentLinkCheckoutInfo variant="detail" className="mb-4" />
                  <ul className="divide-y divide-[var(--dash-border)]">
                    {ENABLED_METHODS.map(({ id: methodId, label, icon: Icon }) => (
                      <li
                        key={methodId}
                        className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-md bg-[var(--dash-accent-soft)] flex items-center justify-center text-[var(--dash-accent)]">
                            <Icon size={16} />
                          </div>
                          <span className="text-sm font-medium">{label}</span>
                        </div>
                        <span className={dashStatusBadges.success}>Habilitado</span>
                      </li>
                    ))}
                    {COMING_SOON_METHODS.map(({ id: methodId, label, icon: Icon }) => (
                      <li
                        key={methodId}
                        className="flex items-center justify-between gap-3 py-3 opacity-60"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-md bg-[var(--dash-panel-elevated)] border border-[var(--dash-border)] flex items-center justify-center text-[var(--dash-muted)]">
                            <Icon size={16} />
                          </div>
                          <span className="text-sm">{label}</span>
                        </div>
                        <span className={dashStatusBadges.neutral}>Próximamente</span>
                      </li>
                    ))}
                  </ul>
                </DetailSection>

                <DetailSection title="Detalles">
                  <div>
                    <DetailKvRow
                      label="Estado"
                      value={<span className={statusBadge}>{statusLabel}</span>}
                    />
                    <DetailKvRow label="Fecha de creación" value={formatDateTime(link.createdAt)} />
                    <DetailKvRow label="Uso limitado" value={yesNo(link.limitPayments)} />
                    <DetailKvRow label="Admitir códigos de promoción" value="No" />
                    <DetailKvRow label="Recopilar direcciones" value={yesNo(link.collectAddress)} />
                    <DetailKvRow label="Recopilar teléfonos" value={yesNo(link.collectPhone)} />
                    <DetailKvRow label="Recopilar nombres" value={yesNo(link.collectName)} />
                    <DetailKvRow label="Recopilar empresas" value={yesNo(link.collectCompany)} />
                    <DetailKvRow
                      label="Recopilar correo electrónico"
                      value={yesNo(link.collectEmail, true)}
                    />
                    <DetailKvRow
                      label="ID fiscal / impuestos"
                      value={
                        link.collectTaxes
                          ? link.taxCode?.trim() || 'Configurado'
                          : 'No recopilado'
                      }
                    />
                    <DetailKvRow label="Guardar datos de pago" value="No" />
                    <DetailKvRow label="Cobrar impuestos" value={yesNo(link.collectTaxes)} />
                    <DetailKvRow label="Impuestos incluidos en el precio" value={yesNo(link.taxIncluded)} />
                    <DetailKvRow
                      label="Permitir ajustar cantidad"
                      value={yesNo(link.allowQuantityAdjustment)}
                    />
                    <DetailKvRow
                      label="Página de confirmación"
                      value={link.successMessage?.trim() || 'Gracias por tu pago.'}
                    />
                    <DetailKvRow label="Botón de llamada a la acción" value="Pagar" />
                    <DetailKvRow
                      label="Redirección después del pago"
                      value={
                        link.redirectUrl?.trim() ? (
                          <a
                            href={link.redirectUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[var(--dash-accent)] hover:underline break-all"
                          >
                            {link.redirectUrl}
                          </a>
                        ) : (
                          'Ninguna'
                        )
                      }
                    />
                  </div>
                </DetailSection>

                <DetailSection title="Metadatos">
                  <DashedEmpty>Sin metadatos</DashedEmpty>
                </DetailSection>

                <DetailSection
                  title="Historial de eventos"
                  description="Actividad registrada de este enlace de cobro"
                >
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm">
                      <span className="text-[var(--dash-muted)] tabular-nums">
                        {formatDateTime(link.createdAt)}
                      </span>
                      <span className="text-[var(--dash-text)]">
                        Enlace de cobro creado —{' '}
                        <code className="text-xs font-mono bg-[var(--dash-panel-elevated)] px-1.5 py-0.5 rounded">
                          {truncateId(link.id)}
                        </code>
                      </span>
                    </div>
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm">
                      <span className="text-[var(--dash-muted)] tabular-nums">
                        {formatDateTime(link.createdAt)}
                      </span>
                      <span className="text-[var(--dash-text)]">
                        Estado actual: <span className={link.active ? 'text-emerald-400' : 'text-zinc-400'}>{link.active ? 'Activo' : 'Inactivo'}</span>
                      </span>
                    </div>
                  </div>
                </DetailSection>
              </>
            )}
          </div>

          <aside className="relative z-0 space-y-4 lg:sticky lg:top-6 lg:self-start order-last">
            <SidebarCard title="Vista previa">
              <div className="flex items-center justify-end gap-1 mb-3 -mt-1">
                <button
                  type="button"
                  onClick={() => setPreviewMode('mobile')}
                  className={cn(
                    'p-1.5 rounded',
                    previewMode === 'mobile'
                      ? 'bg-[var(--dash-surface-elevated)] text-[var(--dash-text)]'
                      : 'text-[var(--dash-muted)]'
                  )}
                  aria-label="Vista móvil"
                >
                  <Smartphone size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('desktop')}
                  className={cn(
                    'p-1.5 rounded',
                    previewMode === 'desktop'
                      ? 'bg-[var(--dash-surface-elevated)] text-[var(--dash-text)]'
                      : 'text-[var(--dash-muted)]'
                  )}
                  aria-label="Vista escritorio"
                >
                  <Monitor size={16} />
                </button>
              </div>
              <CheckoutPreview
                link={link}
                merchantName={merchantName}
                merchantProfile={merchantProfile}
                previewMode={previewMode}
              />
              <a
                href={payUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 dash-btn-secondary w-full py-2 text-sm text-center inline-flex items-center justify-center gap-2"
              >
                <ExternalLink size={14} />
                Abrir checkout
              </a>
            </SidebarCard>

            <div className="dash-card p-5 space-y-3">
              <h2 className="font-semibold text-[var(--dash-text)] text-sm">Identificadores</h2>
              <CopyField label="ID del enlace" value={link.id} />
              {link.slug && <CopyField label="Slug público" value={link.slug} />}
              <DetailRow label="Moneda">{link.currency}</DetailRow>
              <DetailRow label="Creado">{formatDate(link.createdAt)}</DetailRow>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
