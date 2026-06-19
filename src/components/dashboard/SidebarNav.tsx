'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  Menu,
  Search,
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
  { href: '/dashboard/contacts', label: 'Contactos', icon: Users },
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
  bottomActions?: (isCollapsed: boolean) => React.ReactNode;
  isCollapsed?: boolean;
  onCollapseChange?: (collapsed: boolean) => void;
  className?: string;
}

export function SidebarNav({
  businessName,
  email,
  isPlatformAdmin = false,
  onSignOut,
  onNavigate,
  bottomActions,
  isCollapsed: externalIsCollapsed,
  onCollapseChange,
  className,
}: SidebarNavProps) {
  const pathname = usePathname();
  const [userExpanded, setUserExpanded] = useState<Record<string, boolean>>({});
  const [localIsCollapsed, setLocalIsCollapsed] = useState(false);

  const isCollapsed = externalIsCollapsed ?? localIsCollapsed;
  const setIsCollapsed = (val: boolean) => {
    setLocalIsCollapsed(val);
    onCollapseChange?.(val);
  };

  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.toLowerCase();
    if (!q) return;
    if (q.includes('bal') || q.includes('saldo')) router.push('/dashboard/balances');
    else if (q.includes('tx') || q.includes('trans')) router.push('/dashboard/transactions');
    else if (q.includes('client') || q.includes('cust')) router.push('/dashboard/customers');
    else if (q.includes('prod') || q.includes('cat')) router.push('/dashboard/products');
    else if (q.includes('pos') || q.includes('terminal')) router.push('/dashboard/pos');
    else if (q.includes('api') || q.includes('key') || q.includes('developer'))
      router.push('/dashboard/developers');
    else if (q.includes('wallet') || q.includes('setting') || q.includes('config'))
      router.push('/dashboard/settings');
    else router.push('/dashboard');
    if (onNavigate) onNavigate();
  };

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
        isCollapsed ? 'w-[72px]' : 'w-[var(--dash-sidebar-width)]',
        'shrink-0 bg-[var(--dash-surface)] flex flex-col overflow-hidden transition-all duration-300',
        className
      )}
    >
      <div className="shrink-0 p-4 border-b border-[var(--dash-border)] space-y-3">
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-[var(--dash-surface-elevated)] transition-colors",
            isCollapsed ? "justify-center" : "justify-between text-left"
          )}
        >
          {!isCollapsed && (
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate text-[var(--dash-text)]">
                {businessName || 'Luxor Pay'}
              </p>
              {email && (
                <p className="text-xs text-[var(--dash-muted)] truncate">{email}</p>
              )}
            </div>
          )}
          <Menu size={16} className="text-[var(--dash-muted)] shrink-0" />
        </button>
        {isPlatformAdmin && !isCollapsed && (
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

      {!isCollapsed && (
        <div className="shrink-0 px-4 pt-4 pb-2">
          <form onSubmit={handleSearch} className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--dash-muted)]"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="dash-input w-full pl-9 pr-3 py-1.5 text-xs bg-[var(--dash-bg)] border-[var(--dash-border)] focus:border-[var(--dash-accent)] transition-colors rounded-lg text-[var(--dash-text)] placeholder-[var(--dash-muted)]"
            />
          </form>
        </div>
      )}

      <nav className="sidebar-nav-scroll flex-1 min-h-0 p-3 space-y-4 overflow-y-auto overscroll-contain">
        <div>
          {!isCollapsed && (
            <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--dash-muted)]">
              Páginas principales
            </p>
          )}
          <div className="space-y-0.5">
            {mainNav.map(({ href, label, icon: Icon }) => (
              <NavLink
                key={href}
                href={href}
                label={label}
                icon={Icon}
                active={isNavActive(pathname, href, mainNavHrefs)}
                onNavigate={onNavigate}
                isCollapsed={isCollapsed}
              />
            ))}
          </div>
        </div>

        {!isCollapsed && (
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
        )}

        <div>
          {!isCollapsed && (
            <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--dash-muted)]">
              Productos
            </p>
          )}
          <div className="space-y-0.5">
            {productsGroups.map((group) => (
              <ProductsGroup
                key={group.id}
                group={group}
                pathname={pathname}
                expanded={!!expandedGroups[group.id]}
                onToggle={() => toggleGroup(group.id)}
                onNavigate={onNavigate}
                isCollapsed={isCollapsed}
              />
            ))}
          </div>
        </div>
      </nav>

      <div className="shrink-0 p-3 border-t border-[var(--dash-border)] space-y-3">
        {bottomActions && (
          <div className={cn(
            "flex gap-2",
            isCollapsed ? "flex-col items-center" : "flex-row flex-wrap items-center justify-start"
          )}>
            {bottomActions(isCollapsed)}
          </div>
        )}
        
        {onSignOut && (
          <button
            type="button"
            onClick={onSignOut}
            className={cn(
              "w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium text-[var(--dash-muted)] hover:bg-[var(--dash-surface-elevated)] hover:text-[var(--dash-text)] transition-colors",
              isCollapsed && "justify-center px-0"
            )}
            title={isCollapsed ? "Cerrar sesión" : undefined}
          >
            <LogOut size={16} className="shrink-0" />
            {!isCollapsed && <span>Cerrar sesión</span>}
          </button>
        )}
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
  isCollapsed,
}: {
  group: NavGroup;
  pathname: string;
  expanded: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
  isCollapsed?: boolean;
}) {
  const { icon: Icon, label, children } = group;
  const groupHrefs = children.map((child) => child.href);
  const groupActive = children.some((child) => isNavActive(pathname, child.href, groupHrefs));

  return (
    <div>
      <button
        type="button"
        onClick={isCollapsed ? undefined : onToggle}
        className={cn(
          'w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors',
          groupActive && !expanded
            ? 'bg-[var(--dash-accent-soft)] text-[var(--dash-accent)]'
            : 'text-[var(--dash-text)] hover:bg-[var(--dash-surface-elevated)]',
          isCollapsed && 'justify-center px-0'
        )}
        aria-expanded={expanded}
        title={isCollapsed ? label : undefined}
      >
        <Icon size={16} className="shrink-0" />
        {!isCollapsed && <span className="truncate flex-1 text-left">{label}</span>}
        {!isCollapsed && (expanded ? (
          <ChevronDown size={14} className="shrink-0 text-[var(--dash-muted)]" />
        ) : (
          <ChevronRight size={14} className="shrink-0 text-[var(--dash-muted)]" />
        ))}
      </button>
      {!isCollapsed && expanded && (
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
  isCollapsed,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  onNavigate?: () => void;
  isCollapsed?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors',
        active
          ? 'bg-[var(--dash-accent-soft)] text-[var(--dash-accent)]'
          : 'text-[var(--dash-text)] hover:bg-[var(--dash-surface-elevated)]',
        isCollapsed && 'justify-center px-0'
      )}
      title={isCollapsed ? label : undefined}
    >
      <Icon size={16} className="shrink-0" />
      {!isCollapsed && <span className="truncate">{label}</span>}
    </Link>
  );
}
