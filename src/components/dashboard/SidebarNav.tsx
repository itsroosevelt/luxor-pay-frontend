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
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/dashboard/balances', label: 'Balances', icon: Wallet },
  { href: '/dashboard/transactions', label: 'Transactions', icon: Receipt },
  { href: '/dashboard/customers', label: 'Customers', icon: Users },
  { href: '/dashboard/products', label: 'Product catalog', icon: Package },
];

const shortcuts: ShortcutItem[] = [
  { href: '/dashboard/pos', label: 'Terminal' },
  { href: '/dashboard/qr', label: 'QR codes' },
  { href: '/dashboard/links', label: 'Payment links' },
  { href: '/dashboard/reporting', label: 'Reports' },
];

const productsGroups: NavGroup[] = [
  {
    id: 'payments',
    label: 'Payments',
    icon: CreditCard,
    children: [
      { href: '/dashboard/tax', label: 'Tax' },
      { href: '/dashboard/products', label: 'Product catalog' },
      { href: '/dashboard/links', label: 'Payment links' },
      { href: '/dashboard/qr', label: 'QR codes' },
      { href: '/dashboard/payments/sell', label: 'Sell' },
      { href: '/dashboard/pos', label: 'Terminal' },
      { href: '/dashboard/payments/plans', label: 'Payment plans' },
      { href: '/dashboard/payments/checkout', label: 'Payment settings' },
    ],
  },
  {
    id: 'billing',
    label: 'Billing',
    icon: FileText,
    children: [
      { href: '/dashboard/billing/invoices', label: 'On-chain invoices' },
      { href: '/dashboard/customers', label: 'Customers' },
      { href: '/dashboard/billing/subscriptions', label: 'Subscriptions' },
      { href: '/dashboard/billing/quotes', label: 'Quotes' },
      { href: '/dashboard/billing/pending', label: 'Revenue recovery' },
    ],
  },
  {
    id: 'reporting',
    label: 'Reporting',
    icon: BarChart3,
    children: [
      { href: '/dashboard/reporting', label: 'Reports' },
      { href: '/dashboard/reporting/custom-metrics', label: 'Custom metrics' },
      { href: '/dashboard/reporting/sigma', label: 'Sigma' },
      { href: '/dashboard/reporting/revenue-recognition', label: 'Revenue recognition' },
      { href: '/dashboard/reporting/data-management', label: 'Data management' },
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
  onSignOut?: () => void;
  onNavigate?: () => void;
  className?: string;
}

export function SidebarNav({ businessName, email, onSignOut, onNavigate, className }: SidebarNavProps) {
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
      <div className="shrink-0 p-4 border-b border-[var(--dash-border)]">
        <button
          type="button"
          className="w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-md hover:bg-[var(--dash-surface-elevated)] transition-colors text-left"
        >
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--dash-muted)] mb-0.5">
              Business unit
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
      </div>

      <nav className="sidebar-nav-scroll flex-1 min-h-0 p-3 space-y-6 overflow-y-auto overscroll-contain">
        <div>
          <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--dash-muted)]">
            Main pages
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
            Shortcuts
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
            Products
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
            <span>Sign out</span>
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
