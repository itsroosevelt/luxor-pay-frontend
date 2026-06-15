'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useState } from 'react';
import {
  LayoutDashboard,
  Wallet,
  Receipt,
  Package,
  Users,
  ChevronDown,
  ChevronRight,
  LogOut,
  CreditCard,
  FileText,
  BarChart3,
  Shield,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { getSolanaNetworkLabel } from '@/lib/solana-env';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface NavChild {
  href: string;
  label: string;
}

interface NavGroup {
  id: string;
  label: string;
  icon: LucideIcon;
  children: NavChild[];
}

interface ShortcutItem {
  href: string;
  label: string;
}

const mainNav: NavItem[] = [
  { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard },
  { href: '/dashboard/balances', label: 'Saldos', icon: Wallet },
  { href: '/dashboard/transactions', label: 'Transacciones', icon: Receipt },
  { href: '/dashboard/customers', label: 'Clientes', icon: Users },
  { href: '/dashboard/products', label: 'Catálogo de productos', icon: Package },
];

const shortcuts: ShortcutItem[] = [
  { href: '/dashboard/pos', label: 'Terminal' },
  { href: '/dashboard/links', label: 'Enlaces de pago' },
  { href: '/dashboard/reporting', label: 'Informes' },
];

const productsGroups: NavGroup[] = [
  {
    id: 'payments',
    label: 'Pagos',
    icon: CreditCard,
    children: [
      { href: '/dashboard/tax', label: 'Impuestos' },
      { href: '/dashboard/products', label: 'Catálogo de productos' },
      { href: '/dashboard/links', label: 'Enlaces de pago' },
      { href: '/dashboard/payments/sell', label: 'Venta' },
      { href: '/dashboard/pos', label: 'Terminal' },
      { href: '/dashboard/payments/plans', label: 'Planes de pago' },
      { href: '/dashboard/payments/checkout', label: 'Ajustes de pago' },
    ],
  },
  {
    id: 'billing',
    label: 'Facturación',
    icon: FileText,
    children: [
      { href: '/dashboard/billing/invoices', label: 'Facturas on-chain' },
      { href: '/dashboard/customers', label: 'Clientes' },
      { href: '/dashboard/billing/subscriptions', label: 'Suscripciones' },
      { href: '/dashboard/billing/quotes', label: 'Presupuestos' },
      { href: '/dashboard/billing/pending', label: 'Recuperación de ingresos' },
    ],
  },
  {
    id: 'reporting',
    label: 'Informes',
    icon: BarChart3,
    children: [
      { href: '/dashboard/reporting', label: 'Informes' },
      { href: '/dashboard/reporting/custom-metrics', label: 'Métricas personalizadas' },
      { href: '/dashboard/reporting/sigma', label: 'Sigma' },
      { href: '/dashboard/reporting/revenue-recognition', label: 'Reconocimiento de ingresos' },
      { href: '/dashboard/reporting/data-management', label: 'Gestión de datos' },
    ],
  },
];

function matchesNavHref(pathname: string, href: string): boolean {
  if (href === '/dashboard') return pathname === '/dashboard';
  return pathname === href || pathname.startsWith(`${href}/`);
}

function getMostSpecificNavHref(pathname: string, hrefs: string[]): string | null {
  const matches = hrefs.filter((href) => matchesNavHref(pathname, href));
  if (matches.length === 0) return null;
  return matches.reduce((best, href) => (href.length > best.length ? href : best));
}

function isNavActive(pathname: string, href: string, siblingHrefs: string[]): boolean {
  return getMostSpecificNavHref(pathname, siblingHrefs) === href;
}

const mainNavHrefs = mainNav.map(({ href }) => href);
const shortcutHrefs = shortcuts.map(({ href }) => href);

function getExpandedForPath(pathname: string): Record<string, boolean> {
  const expanded: Record<string, boolean> = {};
  for (const group of productsGroups) {
    const groupHrefs = group.children.map((child) => child.href);
    const hasActive = group.children.some((child) => isNavActive(pathname, child.href, groupHrefs));
    if (hasActive) expanded[group.id] = true;
  }
  return expanded;
}

interface SidebarNavProps {
  businessName?: string;
  email?: string;
  isPlatformAdmin?: boolean;
  onSignOut?: () => void;
  onNavigate?: () => void;
  className?: string;
}

export function SidebarNav({
  businessName,
  email,
  isPlatformAdmin = false,
  onSignOut,
  onNavigate,
  className,
}: SidebarNavProps) {
  const pathname = usePathname();
  const [userExpanded, setUserExpanded] = useState<Record<string, boolean>>({});

  const expandedGroups = useMemo(() => {
    const fromPath = getExpandedForPath(pathname);
    return { ...fromPath, ...userExpanded };
  }, [userExpanded, pathname]);

  const toggleGroup = (id: string) => {
    setUserExpanded((prev) => ({ ...prev, [id]: !expandedGroups[id] }));
  };

  const networkLabel = getSolanaNetworkLabel();

  return (
    <aside
      className={cn(
        'w-[var(--dash-sidebar-width)] shrink-0 border-r border-[var(--dash-border)] bg-[var(--dash-surface)] flex flex-col h-full overflow-hidden',
        className
      )}
    >
      <div className="shrink-0 p-4 border-b border-[var(--dash-border)] space-y-3">
        <button
          type="button"
          className="w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-md hover:bg-[var(--dash-surface-elevated)] transition-colors text-left"
        >
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--dash-muted)] mb-0.5">
              Unidad de negocio
            </p>
            <p className="text-sm font-semibold truncate text-[var(--dash-text)]">
              {businessName || 'Luxor Pay'}
            </p>
            {email && (
              <p className="text-xs text-[var(--dash-muted)] truncate">{email}</p>
            )}
          </div>
          <ChevronDown size={14} className="text-[var(--dash-muted)] shrink-0" />
        </button>
        {isPlatformAdmin && (
          <Link
            href="/admin"
            onClick={onNavigate}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-[var(--dash-accent-soft)] border border-[rgba(153,69,255,0.25)] text-[var(--dash-accent)] text-sm font-semibold hover:bg-[rgba(153,69,255,0.15)] transition-colors"
          >
            <Shield size={16} className="shrink-0" />
            <span className="truncate">Administración de plataforma</span>
          </Link>
        )}
      </div>

      <nav className="sidebar-nav-scroll flex-1 min-h-0 p-3 space-y-6 overflow-y-auto overscroll-contain">
        <div>
          <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--dash-muted)]">
            Páginas principales
          </p>
          <div className="space-y-0.5">
            {mainNav.map(({ href, label, icon: Icon }) => (
              <NavLink
                key={href}
                href={href}
                label={label}
                icon={Icon}
                active={isNavActive(pathname, href, mainNavHrefs)}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--dash-muted)]">
            Accesos directos
          </p>
          <div className="space-y-0.5">
            {shortcuts.map((item) => (
              <ShortcutLink
                key={item.label}
                href={item.href}
                label={item.label}
                active={isNavActive(pathname, item.href, shortcutHrefs)}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--dash-muted)]">
            Productos
          </p>
          <div className="space-y-0.5">
            {productsGroups.map((group) => (
              <ProductsGroup
                key={group.id}
                group={group}
                pathname={pathname}
                expanded={!!expandedGroups[group.id]}
                onToggle={() => toggleGroup(group.id)}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </div>
      </nav>

      <div className="shrink-0 p-3 border-t border-[var(--dash-border)] space-y-2">
        {onSignOut && (
          <button
            type="button"
            onClick={onSignOut}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium text-[var(--dash-muted)] hover:bg-[var(--dash-surface-elevated)] hover:text-[var(--dash-text)] transition-colors"
          >
            <LogOut size={16} className="shrink-0" />
            <span>Cerrar sesión</span>
          </button>
        )}
        <div className="flex items-center gap-2 px-3 py-1 text-xs text-[var(--dash-muted)]">
          <span className="w-2 h-2 rounded-full bg-primary shrink-0" aria-hidden />
          Solana · {networkLabel}
        </div>
      </div>
    </aside>
  );
}

function ProductsGroup({
  group,
  pathname,
  expanded,
  onToggle,
  onNavigate,
}: {
  group: NavGroup;
  pathname: string;
  expanded: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
}) {
  const { icon: Icon, label, children } = group;
  const groupHrefs = children.map((child) => child.href);
  const groupActive = children.some((child) => isNavActive(pathname, child.href, groupHrefs));

  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          'w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors',
          groupActive && !expanded
            ? 'bg-[var(--dash-accent-soft)] text-[var(--dash-accent)]'
            : 'text-[var(--dash-text)] hover:bg-[var(--dash-surface-elevated)]'
        )}
        aria-expanded={expanded}
      >
        <Icon size={16} className="shrink-0" />
        <span className="truncate flex-1 text-left">{label}</span>
        {expanded ? (
          <ChevronDown size={14} className="shrink-0 text-[var(--dash-muted)]" />
        ) : (
          <ChevronRight size={14} className="shrink-0 text-[var(--dash-muted)]" />
        )}
      </button>
      {expanded && (
        <div className="mt-0.5 mb-1 space-y-0.5 border-l border-[var(--dash-border)] ml-5 pl-2">
          {children.map((child) => (
            <NavChildLink
              key={`${child.href}-${child.label}`}
              href={child.href}
              label={child.label}
              active={isNavActive(pathname, child.href, groupHrefs)}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ShortcutLink({
  href,
  label,
  active,
  onNavigate,
}: {
  href: string;
  label: string;
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        'block px-3 py-1.5 text-xs transition-colors truncate',
        active
          ? 'text-[var(--dash-accent)] font-medium'
          : 'text-[var(--dash-muted)] hover:text-[var(--dash-accent)]'
      )}
    >
      {label}
    </Link>
  );
}

function NavChildLink({
  href,
  label,
  active,
  onNavigate,
}: {
  href: string;
  label: string;
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        'block px-3 py-1.5 rounded-md text-xs transition-colors truncate',
        active
          ? 'bg-[var(--dash-accent-soft)] text-[var(--dash-accent)] font-medium'
          : 'text-[var(--dash-muted)] hover:text-[var(--dash-text)] hover:bg-[var(--dash-surface-elevated)]'
      )}
    >
      {label}
    </Link>
  );
}

function NavLink({
  href,
  label,
  icon: Icon,
  active,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors',
        active
          ? 'bg-[var(--dash-accent-soft)] text-[var(--dash-accent)]'
          : 'text-[var(--dash-text)] hover:bg-[var(--dash-surface-elevated)]'
      )}
    >
      <Icon size={16} className="shrink-0" />
      <span className="truncate">{label}</span>
    </Link>
  );
}
